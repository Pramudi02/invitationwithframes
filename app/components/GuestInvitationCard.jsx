'use client';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

// ── Inner component that has access to searchParams ────────────────────────
function GuestInvitationCardInner({ eventType, config }) {
  const searchParams = useSearchParams();

  const urlGuest = useMemo(() => {
    const raw = searchParams.get('guest');
    if (!raw) return null;
    try { return decodeURIComponent(raw).trim(); } catch { return raw.trim(); }
  }, [searchParams]);

  const urlType = searchParams.get('type');

  if (!urlGuest) return null; // Do not render if guest is not present

  let targetText = 'you';
  if (urlType === 'couple') {
    targetText = 'both of you';
  } else if (urlType === 'family') {
    targetText = 'you and your family';
  }

  let eventName = 'wedding';
  let eventPrefix = 'our';
  if (eventType === 'engagement') {
    eventName = 'engagement';
  } else if (eventType === 'birthday') {
    eventName = 'birthday';
    eventPrefix = 'this special';
  } else if (eventType === 'general') {
    eventName = 'event';
  }

  return (
    <section className="w-full px-6 py-10 md:py-20 flex justify-center items-center relative z-20 overflow-hidden">
      {config?.sectionBackgrounds?.guestCard && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${config.sectionBackgrounds.guestCard})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            opacity: 0.25
          }}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, margin: "-50px" }}
        className="w-full max-w-2xl bg-white/80 backdrop-blur-md rounded-3xl p-10 md:p-14 text-center shadow-[0_15px_40px_rgba(0,0,0,0.06)] border border-white/50 relative overflow-hidden"
      >
        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-10 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl" style={{ backgroundColor: 'var(--colorPrimary, #C9956A)' }} />
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 pointer-events-none transform translate-x-1/2 translate-y-1/2 rounded-full blur-2xl" style={{ backgroundColor: 'var(--colorPrimary, #C9956A)' }} />
        
        <div className="w-12 h-px mx-auto mb-8 opacity-40" style={{ backgroundColor: 'var(--colorPrimary, #C9956A)' }} />
        
        <h2 className="font-serif text-3xl md:text-4xl mb-4 italic tracking-wide font-medium" style={{ color: 'var(--colorPrimary, #C9956A)' }}>
          Dear {urlGuest},
        </h2>
        
        <p className="font-sans text-sm md:text-base leading-relaxed tracking-wide opacity-80" style={{ color: 'var(--colorTextDark, #2C2018)' }}>
          We joyfully invite <strong className="font-semibold">{targetText}</strong> to celebrate {eventPrefix} {eventName}!
        </p>

        <div className="w-12 h-px mx-auto mt-8 opacity-40" style={{ backgroundColor: 'var(--colorPrimary, #C9956A)' }} />
      </motion.div>
    </section>
  );
}

// ── Public default export — self-wraps in Suspense ───────────────────────────
export default function GuestInvitationCard({ eventType, config }) {
  return (
    <Suspense fallback={null}>
      <GuestInvitationCardInner eventType={eventType} config={config} />
    </Suspense>
  );
}
