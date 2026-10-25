export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import ClientHome from '../ClientHome';

/**
 * Applies a generated cover variant (`?v=<variantId>`) on top of the config.
 * Mutates nothing in the database — this is a per-request presentation swap.
 * Layout 9 is forced because cover variants only exist for that layout.
 */
async function applyHeroVariant(db, config, variantId) {
  if (!variantId || typeof variantId !== 'string') return;

  const variant = await db
    .collection('hero_variants')
    .findOne({ slug: config.slug, variantId });

  if (!variant?.imageUrl) return;

  config.heroLayout = 9;
  config.heroVideo = '';                     // the cover is the hero, nothing behind it
  config.heroImage = variant.imageUrl;
  config.sectionBackgrounds = { ...(config.sectionBackgrounds || {}), hero: variant.imageUrl };
  config.sharePreviewImageUrl = variant.imageUrl;  // share previews match the cover
}

/** Load config for a specific slug from MongoDB */
async function loadConfig(slug, variantId) {
  try {
    const getMongoClientPromise = (await import('@/lib/mongodb')).default;
    const client = await getMongoClientPromise();
    const db = client.db('wedding_app');
    
    // Support both the new 'slug' field and the legacy 'global_config' for now
    const query = (slug === 'global' || slug === 'wedding') 
      ? { $or: [{ slug }, { _id: 'global_config' }] } 
      : { slug };
      
    const doc = await db.collection('settings').findOne(query);
    if (doc) {
      const { _id, ...config } = doc;
      // Merge eventType from event_meta — settings is never modified.
      // Falls back to 'wedding' so all existing invitations are unaffected.
      const eventMeta = await db.collection('event_meta').findOne({ slug: config.slug });
      config.eventType = eventMeta?.eventType || 'wedding';

      // Merge birthday-specific data
      if (config.eventType === 'birthday') {
        const bdDoc = await db.collection('birthdays').findOne({ slug: config.slug });
        if (bdDoc) {
          const { _id: _bid, slug: _bs, ...bdData } = bdDoc;
          config.birthdayData = bdData;
        }
      }

      // Merge general event data
      if (config.eventType === 'general') {
        const genDoc = await db.collection('general').findOne({ slug: config.slug });
        if (genDoc) {
          const { _id: _gid, slug: _gs, ...genData } = genDoc;
          config.generalData = genData;
        }
      }

      // Merge per-invitation label overrides
      const loDoc = await db.collection('label_overrides').findOne({ slug: config.slug });
      if (loDoc) {
        const { _id: _lid, slug: _ls, ...loData } = loDoc;
        config.labelOverrides = loData;
      }

      // Swap in the generated Layout 9 cover, when the link carries one.
      await applyHeroVariant(db, config, variantId);

      return config;
    }
  } catch (e) {
    console.error(`[page/${slug}] Failed to load config:`, e.message);
  }
  return null;
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const { v } = await searchParams;
  const config = await loadConfig(slug, v);
  if (!config) return { title: 'Wedding Invitation' };

  const previewImage = config.sharePreviewImageUrl || config.meta?.ogImage || config.heroImage || '';

  return {
    title: config.meta?.title || config.couple?.displayNames || 'Wedding Invitation',
    description: config.meta?.description || 'You are invited to our wedding!',
    openGraph: {
      title: config.meta?.title || config.couple?.displayNames || 'Wedding Invitation',
      description: config.meta?.description || 'You are invited to our wedding!',
      images: [
        {
          url: previewImage,
          width: 1200,
          height: 630,
          alt: `${config.couple?.displayNames || 'Wedding'} Invitation`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.meta?.title || config.couple?.displayNames || 'Wedding Invitation',
      description: config.meta?.description || 'You are invited to our wedding!',
      images: [previewImage],
    },
  };
}

export default async function WeddingPage({ params, searchParams }) {
  const { slug } = await params;
  const { v } = await searchParams;
  const config = await loadConfig(slug, v);

  if (!config) {
    // If no config found, return Next.js 404
    notFound();
  }

  // Inactive invitation — show a placeholder instead of the real content
  if (config.isActive === false) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1a0a0a] text-center px-6">
        <div className="mb-6 opacity-20">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#C9956A" strokeWidth="1.5">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#C9956A] mb-3 leading-snug">
          Sample Not Available
        </h1>
        <p className="text-sm text-white/50 max-w-xs leading-relaxed">
          This invitation is not currently live. Please contact{' '}
          <span className="text-[#C9956A] font-semibold">Kodex Admin</span> for more information.
        </p>
      </div>
    );
  }

  return <ClientHome config={config} />;
}
