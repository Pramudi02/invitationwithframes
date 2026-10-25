import { NextResponse } from 'next/server';
import getMongoClientPromise from '@/lib/mongodb';

/**
 * GET /api/general-data?slug=XYZ
 * Returns general-event-specific fields for a slug.
 * Returns safe empty defaults if no record exists (settings collection never touched).
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
    const doc = await db.collection('general').findOne({ slug });
    if (!doc) {
      return NextResponse.json({ eventTitle: '', hostName: '', customBodyText: '', eventType2: '' });
    }
    const { _id, ...data } = doc;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/general-data?slug=XYZ
 * Upserts general event data for a slug into the 'general' collection.
 * The settings collection is never touched.
 */
export async function PUT(request) {

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }
    const body = await request.json();
    // Whitelist only the expected fields — prevents arbitrary data writes
    const { eventTitle = '', hostName = '', customBodyText = '', eventType2 = '' } = body;

    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');
    await db.collection('general').updateOne(
      { slug },
      { $set: { slug, eventTitle, hostName, customBodyText, eventType2, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
