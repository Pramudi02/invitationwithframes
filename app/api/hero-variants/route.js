import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { ObjectId } from 'mongodb';
import getMongoClientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const COLLECTION = 'hero_variants';

/**
 * Every generated invitation is one document here:
 *   { slug, variantId, label, imageUrl, publicId, createdAt }
 *
 * The public link is `/<slug>?v=<variantId>`. `app/[slug]/page.jsx` resolves
 * the variant server-side and swaps in the cover before rendering Layout 9.
 */

/** Reuses the per-invitation cookie already issued by /api/client-login. */
async function isAuthorised(slug) {
  if (!slug) return false;
  const store = await cookies();
  const cookie = store.get(`clientAuth_${slug}`);
  return !!cookie && cookie.value === 'true';
}

function db(client) {
  // `settings` and `event_meta` both live in wedding_app — stay consistent.
  return client.db('wedding_app');
}

// Every `?v=` page load looks up { slug, variantId }, so keep it indexed.
// Guarded by a module-level promise: the work happens once per server process.
let indexPromise = null;
function ensureIndexes(collection) {
  if (!indexPromise) {
    indexPromise = collection
      .createIndexes([
        { key: { slug: 1, variantId: 1 }, name: 'slug_variantId' },
        { key: { variantId: 1 }, name: 'variantId' },
        { key: { slug: 1, createdAt: -1 }, name: 'slug_createdAt' },
      ])
      .catch((err) => {
        console.warn('[api/hero-variants] Index creation skipped:', err.message);
        indexPromise = null;   // let a later request retry
      });
  }
  return indexPromise;
}

/** Cloudinary-only, so a caller can't persist an arbitrary third-party URL. */
function isCloudinaryUrl(url) {
  return typeof url === 'string' && /^https:\/\/res\.cloudinary\.com\//.test(url);
}

/** Short, URL-friendly id with a collision re-roll. */
async function makeVariantId(collection) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = randomBytes(4).toString('hex');
    const clash = await collection.findOne({ variantId: candidate }, { projection: { _id: 1 } });
    if (!clash) return candidate;
  }
  return randomBytes(8).toString('hex');
}

// GET /api/hero-variants?slug=…  → every invitation generated for this slug
export async function GET(request) {
  try {
    const slug = new URL(request.url).searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
    }
    if (!(await isAuthorised(slug))) {
      return NextResponse.json({ success: false, error: 'Not authorised' }, { status: 401 });
    }

    const client = await getMongoClientPromise();
    const variants = await db(client)
      .collection(COLLECTION)
      .find({ slug })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: variants });
  } catch (error) {
    console.error('[api/hero-variants] GET Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load invitations' }, { status: 500 });
  }
}

// POST /api/hero-variants  → create one invitation from an uploaded cover
export async function POST(request) {
  try {
    const { slug, label, imageUrl, publicId } = await request.json();

    if (!slug || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Slug and cover image are required' },
        { status: 400 }
      );
    }
    if (!(await isAuthorised(slug))) {
      return NextResponse.json({ success: false, error: 'Not authorised' }, { status: 401 });
    }
    if (!isCloudinaryUrl(imageUrl)) {
      return NextResponse.json(
        { success: false, error: 'Cover image must be an uploaded Cloudinary asset' },
        { status: 400 }
      );
    }

    const client = await getMongoClientPromise();
    const collection = db(client).collection(COLLECTION);
    await ensureIndexes(collection);

    // Confirm the slug actually exists before attaching invitations to it.
    const settings = await db(client)
      .collection('settings')
      .findOne({ slug }, { projection: { _id: 1 } });
    if (!settings) {
      return NextResponse.json({ success: false, error: 'Unknown invitation' }, { status: 404 });
    }

    const existingCount = await collection.countDocuments({ slug });
    const doc = {
      slug,
      variantId: await makeVariantId(collection),
      label: (typeof label === 'string' && label.trim()) || `Cover ${existingCount + 1}`,
      imageUrl,
      publicId: typeof publicId === 'string' ? publicId : '',
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json({ success: true, data: { _id: result.insertedId, ...doc } });
  } catch (error) {
    console.error('[api/hero-variants] POST Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create invitation' }, { status: 500 });
  }
}

// DELETE /api/hero-variants?slug=…&id=…  → drop the invitation and its cover
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (!slug || !id) {
      return NextResponse.json({ success: false, error: 'Slug and id are required' }, { status: 400 });
    }
    if (!(await isAuthorised(slug))) {
      return NextResponse.json({ success: false, error: 'Not authorised' }, { status: 401 });
    }
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const collection = db(client).collection(COLLECTION);

    // Scope the lookup by slug so one client can't delete another's invitation.
    const doc = await collection.findOne({ _id: new ObjectId(id), slug });
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 });
    }

    await collection.deleteOne({ _id: doc._id });

    // Best-effort asset cleanup — the link is already gone either way.
    try {
      const { deleteFromCloudinary } = await import('@/lib/cloudinary-server');
      await deleteFromCloudinary(doc.imageUrl);
    } catch (err) {
      console.warn('[api/hero-variants] Cloudinary cleanup failed:', err.message);
    }

    return NextResponse.json({ success: true, message: 'Invitation deleted' });
  } catch (error) {
    console.error('[api/hero-variants] DELETE Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete invitation' }, { status: 500 });
  }
}
