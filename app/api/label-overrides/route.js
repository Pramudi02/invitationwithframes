import { NextResponse } from 'next/server';
import getMongoClientPromise from '../../../lib/mongodb';

// Only these keys can be stored as overrides (all user-visible text labels)
const ALLOWED_KEYS = [
  'heroEyebrow', 'heroHeading', 'heroFamiliesLine', 'heroFamiliesIcal',
  'coupleRevealTagline', 'coverRevealTagline',
  'envelopeTitle', 'photoLabel', 'eventDetailsSubtitle',
  'storySection', 'storyHeading6', 'storyCaption7', 'storyFooter',
  'layout8EternalLabel', 'layout8JoinUs', 'layout8GalleryLabel',
  'layout11HeroSmall', 'layout11HeroBig',
  'timelineEyebrow', 'timelineHeading',
  'countdownLabel', 'countdownHeading',
  'rsvpMessageHeader', 'rsvpMessageHeaderAlt',
  'navNames',
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({}, { status: 400 });

    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');
    const doc = await db.collection('label_overrides').findOne({ slug });
    if (!doc) return NextResponse.json({});
    const { _id, slug: _s, ...overrides } = doc;
    return NextResponse.json(overrides);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) return NextResponse.json({ success: false, error: 'slug required' }, { status: 400 });

    const body = await request.json();
    // Whitelist: only allow string values for known keys
    const overrides = { slug };
    for (const key of ALLOWED_KEYS) {
      if (typeof body[key] === 'string') overrides[key] = body[key];
    }

    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');
    await db.collection('label_overrides').updateOne(
      { slug },
      { $set: overrides },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
