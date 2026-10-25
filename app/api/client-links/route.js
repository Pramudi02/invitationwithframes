import { NextResponse } from 'next/server';
import getMongoClientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET: Fetch all generated links for a specific slug
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const db = client.db();
    const links = await db.collection('generated_links').find({ slug }).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ success: true, data: links });
  } catch (error) {
    console.error('[api/client-links] GET Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch generated links' }, { status: 500 });
  }
}

// POST: Save a new generated link
export async function POST(request) {
  try {
    const data = await request.json();
    const { slug, guestName, whatsappNumber, pax, inviteType, generatedUrl } = data;

    if (!slug || !guestName || !generatedUrl) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const db = client.db();
    const result = await db.collection('generated_links').insertOne({
      slug,
      guestName,
      whatsappNumber: whatsappNumber || '',
      pax,
      inviteType,
      generatedUrl,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, data: { _id: result.insertedId, ...data } });
  } catch (error) {
    console.error('[api/client-links] POST Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save generated link' }, { status: 500 });
  }
}

// DELETE: Remove a generated link
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const db = client.db();
    const result = await db.collection('generated_links').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    console.error('[api/client-links] DELETE Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete link' }, { status: 500 });
  }
}
