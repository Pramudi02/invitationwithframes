'use client';

export default function Footer({ config, birthdayData = null, generalData = null }) {
  const { couple = {}, wedding = {}, heroLayout = 1 } = config || {};
  const isLayout9 = false;
  const displayName = birthdayData?.celebrantName
    || generalData?.eventTitle
    || generalData?.hostName
    || couple?.displayNames
    || '';

  return (
    <footer 
      className="bg-[var(--colorTextDark)] relative text-center py-20 px-6 overflow-hidden transition-all"
    >
      {/* ── SECTION BACKGROUND IMAGE ── */}
      {config.sectionBackgrounds?.footer && (
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ 
            backgroundImage: `url(${config.sectionBackgrounds.footer})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            opacity: 0.3
          }} 
        />
      )}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-black/40" />

      <div className="relative z-10">
        <p className="font-script text-5xl mb-2 drop-shadow-md text-[var(--colorSecondary)]">
          {displayName}
        </p>
        <p className="font-serif text-sm tracking-[0.3em] uppercase mb-8 text-[var(--colorSecondary)]/60">
          {wedding?.displayDate || ''}
        </p>
        
        <div className="w-12 h-px mx-auto mb-8 bg-[var(--colorSecondary)]/20" />
        
        <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-white/30">
          Handcrafted with Love — KodeXlk +94 75 013 3608
        </p>
      </div>
    </footer>
  );
}
