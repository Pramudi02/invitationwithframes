import { NextResponse } from 'next/server';
import getMongoClientPromise from '@/lib/mongodb';
import { getDefaultConfig } from '@/models/Config';
import { deleteFromCloudinary } from '@/lib/cloudinary';

/**
 * Utility to extract all Cloudinary image URLs from a config object.
 */
/**
 * Utility to recursively extract all Cloudinary image URLs from a config object.
 * This ensures meticulous cleanup regardless of how nested the image fields are.
 */
function getAllImagesFromConfig(config) {
  const images = new Set();
  
  const extract = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'string' && val.startsWith('http')) {
        // Collect Cloudinary URLs (e.g. res.cloudinary.com)
        if (val.includes('cloudinary.com')) {
          images.add(val);
        }
      } else if (typeof val === 'object') {
        extract(val);
      }
    }
  };

  extract(config);
  return Array.from(images);
}

/**
 * Compares two config objects and deletes images that were present in old but missing/changed in new.
 */
async function cleanupReplacedImages(oldConfig, newPayload) {
  const oldImages = getAllImagesFromConfig(oldConfig);
  const newImages = getAllImagesFromConfig(newPayload);

  // If an image was in old but is NOT in new, it has been replaced or removed.
  const replaced = oldImages.filter(url => !newImages.includes(url));
  
  for (const url of replaced) {
    await deleteFromCloudinary(url);
  }
}

/**
 * GET /api/config?slug=XYZ
 * If slug is provided: Returns the full config for that slug.
 * If no slug: Returns a list of all existing invitations (slug, displayNames).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');

    if (slug) {
      // Find specific invitation by its slug
      // We also check for 'global_config' to support migration
      const query = (slug === 'global_config') ? { _id: 'global_config' } : { slug };
      const doc = await db.collection('settings').findOne(query);
      if (!doc) {
        return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 });
      }
      const { _id, ...config } = doc;
      // Merge eventType from event_meta (separate collection, settings is never modified).
      // Defaults to 'wedding' so all existing invitations work without any data migration.
      const eventMeta = await db.collection('event_meta').findOne({ slug: config.slug });
      config.eventType = eventMeta?.eventType || 'wedding';

      // Merge birthday-specific data (only when eventType is 'birthday')
      if (config.eventType === 'birthday') {
        const bdDoc = await db.collection('birthdays').findOne({ slug: config.slug });
        if (bdDoc) {
          const { _id: _bid, slug: _bs, ...bdData } = bdDoc;
          config.birthdayData = bdData;
        }
      }

      // Merge general event data (only when eventType is 'general')
      if (config.eventType === 'general') {
        const genDoc = await db.collection('general').findOne({ slug: config.slug });
        if (genDoc) {
          const { _id: _gid, slug: _gs, ...genData } = genDoc;
          config.generalData = genData;
        }
      }

      // Merge per-invitation label overrides (additive — never modifies settings)
      const loDoc = await db.collection('label_overrides').findOne({ slug: config.slug });
      if (loDoc) {
        const { _id: _lid, slug: _ls, ...loData } = loDoc;
        config.labelOverrides = loData;
      }

      return NextResponse.json(config);
    } else {
      // List all invitations (basic info for the dashboard)
      const list = await db.collection('settings').find({}, { projection: { slug: 1, 'couple.displayNames': 1, 'wedding.displayDate': 1, 'wedding.dateTimeISO': 1, isActive: 1, isFavourite: 1, clientPasscode: 1 } }).toArray();
      // Enrich each item with eventType + type-specific display name
      const slugs = list.map(i => i.slug).filter(Boolean);
      const [eventMetas, birthdays, generals] = await Promise.all([
        db.collection('event_meta').find({ slug: { $in: slugs } }).toArray(),
        db.collection('birthdays').find({ slug: { $in: slugs } }, { projection: { slug: 1, celebrantName: 1 } }).toArray(),
        db.collection('general').find({ slug: { $in: slugs } }, { projection: { slug: 1, eventTitle: 1, hostName: 1 } }).toArray(),
      ]);
      const metaMap = Object.fromEntries(eventMetas.map(m => [m.slug, m.eventType]));
      const bdMap   = Object.fromEntries(birthdays.map(b => [b.slug, b]));
      const genMap  = Object.fromEntries(generals.map(g => [g.slug, g]));
      const enriched = list.map(item => {
        const eventType = metaMap[item.slug] || 'wedding';
        let displayName;
        if (eventType === 'birthday') {
          const name = bdMap[item.slug]?.celebrantName;
          displayName = name ? `${name}'s Birthday` : 'Birthday Invitation';
        } else if (eventType === 'general') {
          displayName = genMap[item.slug]?.eventTitle || genMap[item.slug]?.hostName || 'General Event';
        } else {
          // wedding / engagement
          displayName = item.couple?.displayNames || item.displayNames || 'Wedding Invitation';
        }
        return { ...item, eventType, displayNames: displayName };
      });
      return NextResponse.json(enriched);
    }
  } catch (error) {
    console.error('[api/config] GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/config
 * Creates a new invitation entry with a unique slug, optionally duplicating an existing one.
 */
export async function POST(request) {

  try {
    const { slug, duplicateFrom } = await request.json();

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ success: false, error: 'Invalid or missing slug format. Only lowercase letters, numbers, and hyphens are allowed.' }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');

    // Check for existence
    const existing = await db.collection('settings').findOne({ slug });
    if (existing) {
      return NextResponse.json({ success: false, error: `Invitation with slug '${slug}' already exists.` }, { status: 409 });
    }

    let newConfig;
    if (duplicateFrom) {
      const sourceQuery = (duplicateFrom === 'global_config') ? { _id: 'global_config' } : { slug: duplicateFrom };
      const sourceDoc = await db.collection('settings').findOne(sourceQuery);
      if (!sourceDoc) {
        return NextResponse.json({ success: false, error: `Source invitation '${duplicateFrom}' not found.` }, { status: 404 });
      }

      const { _id, ...restSource } = sourceDoc;
      newConfig = {
        ...JSON.parse(JSON.stringify(restSource)),
        slug,
        isFavourite: false,
        clientPasscode: null, // Reset client passcode for the new duplicate so it can be generated cleanly
        createdAt: new Date().toISOString()
      };

      // Also clone event_meta, birthdays, general, label_overrides if they exist
      const [sourceMeta, sourceBd, sourceGen, sourceLo] = await Promise.all([
        db.collection('event_meta').findOne({ slug: duplicateFrom }),
        db.collection('birthdays').findOne({ slug: duplicateFrom }),
        db.collection('general').findOne({ slug: duplicateFrom }),
        db.collection('label_overrides').findOne({ slug: duplicateFrom }),
      ]);

      if (sourceMeta) {
        const { _id: _mid, ...metaRest } = sourceMeta;
        await db.collection('event_meta').insertOne({ ...metaRest, slug });
      }
      if (sourceBd) {
        const { _id: _bid, ...bdRest } = sourceBd;
        await db.collection('birthdays').insertOne({ ...bdRest, slug });
      }
      if (sourceGen) {
        const { _id: _gid, ...genRest } = sourceGen;
        await db.collection('general').insertOne({ ...genRest, slug });
      }
      if (sourceLo) {
        const { _id: _lid, ...loRest } = sourceLo;
        await db.collection('label_overrides').insertOne({ ...loRest, slug });
      }
    } else {
      // Initialize with default structure
      newConfig = getDefaultConfig(slug);
    }

    await db.collection('settings').insertOne(newConfig);

    return NextResponse.json({ 
      success: true, 
      message: duplicateFrom ? `Successfully duplicated invitation to '${slug}'` : `Created invitation for '${slug}'`, 
      config: newConfig 
    });
  } catch (error) {
    console.error('[api/config] POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/config?slug=XYZ
 * Partially updates a single field — used for toggling isFavourite without touching the rest of the config.
 */
export async function PATCH(request) {

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ success: false, error: 'slug required' }, { status: 400 });

    const body = await request.json();
    // Only allow safe partial fields
    const allowed = ['isFavourite', 'isActive'];
    const patch = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');
    const query = slug === 'global_config' ? { _id: 'global_config' } : { slug };
    const result = await db.collection('settings').updateOne(query, { $set: patch });
    if (result.matchedCount === 0) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/config?slug=XYZ
 * Updates the existing config for a particular slug.
 */
export async function PUT(request) {

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const reqBody = await request.json();

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug parameter is required for updates.' }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');

    // ── Legacy Support Query ─────────────────────────────────────
    const query = (slug === 'global_config') ? { _id: 'global_config' } : { slug };

    // Fetch the old configuration to check for replaced images
    const oldDoc = await db.collection('settings').findOne(query);
    if (!oldDoc) {
      return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 });
    }

    // compare and purge replaced Cloudinary assets
    await cleanupReplacedImages(oldDoc, reqBody);

    // Example logic to ensure they are saved:
    const updateData = {
      ...reqBody,
      layoutSettings: reqBody.layoutSettings || oldDoc.layoutSettings,
      rsvp: {
        ...reqBody.rsvp,
        fields: reqBody.rsvp?.fields || oldDoc.rsvp?.fields
      }
    };

    // Perform update
    const result = await db.collection('settings').updateOne(
      query,
      { $set: updateData }
    );

    return NextResponse.json({ success: true, message: 'Config updated successfully!' });
  } catch (error) {
    console.error('[api/config] PUT Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/config?slug=XYZ
 * Deletes an invitation and all associated Cloudinary images.
 */
export async function DELETE(request) {

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug parameter is required for deletion.' }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');

    // ── Legacy Support Query ─────────────────────────────────────
    const query = (slug === 'global_config') ? { _id: 'global_config' } : { slug };

    // 1. Fetch document to find all images
    const doc = await db.collection('settings').findOne(query);
    if (!doc) {
      return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 });
    }

    // 2. Extract and delete all Cloudinary images
    const images = getAllImagesFromConfig(doc);
    console.log(`[api/config] Purging ${images.length} images for slug: ${slug}`);
    
    // Run deletions in parallel
    await Promise.all(images.map(url => deleteFromCloudinary(url)));

    // 3. Delete from MongoDB
    const result = await db.collection('settings').deleteOne(query);

    // 4. Cascade delete any generated links for this invitation
    await db.collection('generated_links').deleteMany({ slug });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Failed to delete record from DB' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Successfully deleted invitation and cleaned up cloud storage for '${slug}'.` });
  } catch (error) {
    console.error('[api/config] DELETE Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
