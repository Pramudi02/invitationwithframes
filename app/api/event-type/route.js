import { NextResponse } from 'next/server';
import getMongoClientPromise from '@/lib/mongodb';

const VALID_EVENT_TYPES = ['wedding', 'engagement', 'birthday', 'general'];

/**
 * GET /api/event-type?slug=XYZ
 * Returns the event type for a given slug.
 * Defaults to 'wedding' if no record exists (preserves existing invitations).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');
    const doc = await db.collection('event_meta').findOne({ slug });

    return NextResponse.json({ eventType: doc?.eventType || 'wedding' });
  } catch (error) {
    console.error('[api/event-type] GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/event-type?slug=XYZ
 * Upserts the event type for a given slug into the event_meta collection.
 * The settings collection is never touched.
 */
export async function PUT(request) {

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }

    const { eventType } = await request.json();
    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { success: false, error: `Invalid eventType. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');
    await db.collection('event_meta').updateOne(
      { slug },
      { $set: { slug, eventType } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, slug, eventType });
  } catch (error) {
    console.error('[api/event-type] PUT Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
