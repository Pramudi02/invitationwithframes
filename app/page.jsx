export const dynamic = 'force-dynamic';

import ClientHome from './ClientHome';
import { getDefaultConfig } from '@/models/Config';

async function loadDefaultConfig() {
  try {
    const getMongoClientPromise = (await import('@/lib/mongodb')).default;
    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');

    // Prioritize favourite, then active invitations with complete data (e.g. rashini-sanjula)
    let doc = await db.collection('settings').findOne({ isFavourite: true, isActive: { $ne: false } });
    if (!doc) {
      doc = await db.collection('settings').findOne({ slug: 'rashini-sanjula' });
    }
    if (!doc) {
      doc = await db.collection('settings').findOne({ isActive: { $ne: false } });
    }
    if (!doc) {
      doc = await db.collection('settings').findOne({});
    }

    if (doc) {
      const { _id, ...config } = doc;
      const eventMeta = await db.collection('event_meta').findOne({ slug: config.slug });
      config.eventType = eventMeta?.eventType || 'wedding';
      return config;
    }
  } catch (err) {
    console.warn('[app/page] MongoDB load fallback:', err.message);
  }

  // Graceful fallback to default configuration
  const fallback = getDefaultConfig('wedding');
  fallback.couple = {
    bride: { firstName: 'Sanjula', lastName: '', fullName: 'Sanjula' },
    groom: { firstName: 'Rashini', lastName: '', fullName: 'Rashini' },
    displayNames: 'Rashini & Sanjula',
    tagline: 'Two lives, two hearts, joined together in love forever.'
  };
  fallback.wedding = {
    dateTimeISO: '2026-11-14T18:00:00',
    displayDate: 'November 14, 2026',
    year: '2026',
    heroTime: '6:00 PM'
  };
  return fallback;
}

export async function generateMetadata() {
  const config = await loadDefaultConfig();
  const title = config?.meta?.title || config?.couple?.displayNames || 'Wedding Invitation';
  const description = config?.meta?.description || 'You are cordially invited to celebrate our wedding.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: config?.heroImage ? [{ url: config.heroImage }] : [],
    },
  };
}

export default async function HomePage() {
  const config = await loadDefaultConfig();
  return <ClientHome config={config} />;
}
