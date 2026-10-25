import { NextResponse } from 'next/server';
import getMongoClientPromise from '@/lib/mongodb';

/**
 * GET /api/birthday-data?slug=XYZ
 * Returns birthday-specific fields for a slug.
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
    const doc = await db.collection('birthdays').findOne({ slug });
    if (!doc) {
      return NextResponse.json({ celebrantName: '', age: null, birthdayTheme: '', wishMessage: '' });
    }
    const { _id, ...data } = doc;
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/birthday-data?slug=XYZ
 * Upserts birthday-specific data for a slug into the 'birthdays' collection.
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
    const { celebrantName = '', age = null, birthdayTheme = '', wishMessage = '' } = body;

    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');
    await db.collection('birthdays').updateOne(
      { slug },
      { $set: { slug, celebrantName, age, birthdayTheme, wishMessage, updatedAt: new Date() } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
