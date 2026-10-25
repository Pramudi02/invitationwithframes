'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Gallery({ config }) {
  const gallery = config?.gallery || [];
  
  if (!gallery || gallery.length === 0) {
    return null;
  }

  const headerRef = useRef(null);
  const layout = config?.heroLayout ?? 1;

  const currentLayout = config?.heroLayout || 1;
  const layoutSettings = config?.layoutSettings?.[`layout_${currentLayout}`] || {};

  // Allow empty strings to hide text. Only fallback to defaults if strictly undefined.
  const titleText = layoutSettings.galleryTitle !== undefined ? layoutSettings.galleryTitle : "Captured Moments";
  const subtitleText = layoutSettings.gallerySubtitle !== undefined ? layoutSettings.gallerySubtitle : "A glimpse into our beautiful journey";

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('opacity-100', '!translate-y-0'); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);



  if (layout === 1 || layout === 3) {
    return null;
  }

  return (
    <section 
      id="gallery" 
      className="py-20 md:py-28 transition-colors duration-500 relative overflow-hidden"
      style={{ backgroundColor: 'var(--colorBg)' }}
    >
      {/* ── SECTION BACKGROUND IMAGE ── */}
      {config.sectionBackgrounds?.gallery && (
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-1000 z-0"
          style={{
            backgroundImage: `url(${config.sectionBackgrounds.gallery})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)',
            transform: 'scale(1.02)',
            opacity: 0.85
          }}
        />
      )}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-white/5" />
      <div className="max-w-5xl mx-auto px-6">
        

        {/* Header Layouts */}
        {(layout === 5 || layout === 6 || layout === 7 || layout === 8 || layout === 9 || layout === 11) && (
          <div ref={headerRef} className="text-center mb-16 opacity-0 translate-y-8 transition-all duration-700">
            {layout === 5 && (
              <div className="text-center">
                {titleText && <h2 className="font-sans text-5xl md:text-7xl font-bold uppercase tracking-tighter text-[var(--colorTextDark)] opacity-80 leading-none mb-2">{titleText}</h2>}
                {subtitleText && <p className="font-serif text-3xl italic text-[var(--colorTextDark)]/40">{subtitleText}</p>}
              </div>
            )}
            {layout === 6 && (
              <div className="relative inline-block">
                <span className="text-4xl absolute -top-10 -right-10 opacity-30">🌸</span>
                {titleText && <h2 className="font-script text-6xl md:text-8xl text-[var(--colorPrimary)] mb-2">{titleText}</h2>}
                {subtitleText && <p className="font-sans text-[10px] tracking-[0.5em] uppercase opacity-40">{subtitleText}</p>}
              </div>
            )}
            {layout === 7 && (
              <div>
                {titleText && <h2 className="font-script text-5xl text-slate-800 mb-2 underline decoration-[var(--colorPrimary)]/20 decoration-8 underline-offset-[-2px]">{titleText}</h2>}
                {subtitleText && <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-slate-400 mt-4">{subtitleText}</p>}
              </div>
            )}
            {(layout === 8 || layout === 11) && (
              <div className="text-center">
                {subtitleText && <p className="font-sinhala text-xl text-[var(--colorPrimary)] mb-2">{subtitleText}</p>}
                {titleText && <h2 className="font-sinhala text-4xl md:text-5xl text-[var(--colorTextDark)] mb-4">{titleText}</h2>}
                <div className="w-16 h-1.5 bg-[var(--colorPrimary)] mx-auto rounded-full" />
              </div>
            )}
            {layout === 9 && (
              <div className="text-center">
                {titleText && <h2 className="font-sans text-5xl md:text-7xl font-black uppercase tracking-tighter text-[var(--colorTextDark)] mb-4">{titleText}</h2>}
                {subtitleText && <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-[var(--colorTextDark)]/40 font-bold">{subtitleText}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid Layouts */}
      {(layout === 8 || layout === 11) ? (
        // Layout 8: Traditional Solid Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 max-w-7xl mx-auto justify-items-center">
          {gallery.map((photo, idx) => (
            <div
              key={idx}
              className="group relative cursor-default focus:outline-none overflow-hidden aspect-square border-4 border-[var(--colorPrimary)]/30 rounded-2xl shadow-lg transition-transform duration-500 hover:rotate-1 hover:scale-[1.02] w-full max-w-md"
            >
              <Image src={photo.src} alt={photo.alt} width={800} height={800} loading="lazy" className="w-full h-full object-cover object-center transition-all duration-700" />
            </div>
          ))}
        </div>
      ) : layout === 7 ? (
        // Layout 7: Polaroid Scattered Grid
        <div className="flex flex-wrap justify-center gap-10 px-8 py-10">
          {gallery.map((photo, idx) => (
            <div
              key={idx}
              className={`group relative cursor-default focus:outline-none bg-white p-3 pb-12 shadow-xl border border-slate-100 w-full max-w-[280px] transition-all duration-500 hover:rotate-0 hover:z-20
                ${idx % 3 === 0 ? '-rotate-3 mt-4' : idx % 2 === 0 ? 'rotate-2 mb-4' : 'rotate-1'}`}
            >
              <div className="aspect-[3/4] bg-slate-50 overflow-hidden relative">
                <Image src={photo.src} alt={photo.alt} width={600} height={800} loading="lazy" className="w-full h-full object-cover object-center transition-all duration-500" />
                <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors" />
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-sm border border-white/20 shadow-sm" />
            </div>
          ))}
        </div>
      ) : layout === 6 ? (
        // Layout 6: Portrait Rectangle Gallery
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 px-6 max-w-6xl mx-auto justify-items-center">
          {gallery.map((photo, idx) => (
            <div
              key={idx}
              className="group relative cursor-default focus:outline-none rounded-3xl overflow-hidden aspect-[3/4] shadow-2xl transition-all duration-700 hover:scale-105 border-4 border-white/30"
            >
              <Image src={photo.src} alt={photo.alt} width={800} height={1000} loading="lazy" className="w-full h-full object-cover object-center transition-all duration-700" />
            </div>
          ))}
        </div>
      ) : layout === 5 ? (
        // Layout 5: Minimalist Modern Grid
        <div className="grid grid-cols-2 justify-items-center lg:flex lg:flex-row lg:flex-wrap lg:justify-center gap-4 px-4 max-w-full no-scrollbar pb-8">
          {gallery.map((photo, idx) => (
            <div
              key={idx}
              className="group relative cursor-default focus:outline-none aspect-square lg:aspect-[3/4] lg:min-w-[300px] overflow-hidden rounded-2xl"
            >
              <Image src={photo.src} alt={photo.alt} width={1000} height={1000} loading="lazy" className="w-full h-full object-cover object-center transition-all duration-1000 group-hover:scale-105" />
            </div>
          ))}
        </div>
      ) : layout === 4 ? (
        // Layout 4: Nature Arch Grid
        <div className="grid grid-cols-2 justify-items-center lg:flex lg:flex-row lg:overflow-x-auto gap-10 px-6 max-w-full no-scrollbar pb-10 lg:justify-center min-w-full">
          {gallery.map((photo, idx) => (
            <div
              key={idx}
              className="group relative cursor-default focus:outline-none w-full max-w-[280px] lg:min-w-[300px] bg-white p-3 shadow-md hover:shadow-xl transition-all duration-500 shrink-0"
              style={{
                borderRadius: '120px 120px 0 0',
                border: '1px solid var(--colorPrimary)/20',
              }}
            >
              <div className="w-full h-full relative overflow-hidden" style={{ borderRadius: '110px 110px 0 0', aspectRatio: '3/4' }}>
                <Image src={photo.src} alt={photo.alt} width={600} height={800} loading="lazy" className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-[var(--colorPrimary)]/10 transition-all duration-500 flex items-center justify-center">
                  <span className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-all duration-500 drop-shadow-md scale-50 group-hover:scale-100">🌿</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : layout === 2 ? (
        // Layout 2: Scattered Floating Ornate Grid
        <div className="grid grid-cols-2 gap-4 md:gap-8 px-4 max-w-5xl mx-auto justify-items-center">
          {gallery.map((photo, idx) => (
            <div
              key={idx}
              className={`group relative cursor-default focus:outline-none overflow-hidden rounded-full shadow-lg border-2 border-[var(--colorBg)] outline outline-1 outline-[var(--colorPrimary)] outline-offset-4
                ${idx % 2 === 0 ? 'aspect-square' : 'aspect-[3/4] mt-12'}`}
            >
              <div className="relative w-full h-full bg-[var(--colorBg)]">
                <Image src={photo?.src || '/images/placeholder.png'} alt={photo?.alt || ''} width={800} height={800} loading="lazy" className="w-full h-full object-cover object-center transition-all duration-700 hover:scale-110" />
              </div>
            </div>
          ))}
        </div>
      ) : layout === 9 ? (
        // Layout 9: Modern Dark Glass Grid
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-6 max-w-7xl mx-auto justify-items-center">
          {gallery.map((photo, idx) => (
            <div
              key={idx}
              className="group relative cursor-default focus:outline-none aspect-[3/4] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-700 hover:scale-[1.03] hover:border-[var(--colorPrimary)]/30"
            >
              <Image src={photo.src} alt={photo.alt} width={800} height={1000} loading="lazy" className="w-full h-full object-cover object-center transition-all duration-1000 group-hover:scale-110" />
            </div>
          ))}
        </div>
      ) : (
        // Default Layout 1: Classic Masonry Style Grid
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 px-6 max-w-6xl mx-auto">
          {gallery.map((photo, idx) => (
            <div
              key={idx}
              className="group relative cursor-default focus:outline-none w-full break-inside-avoid shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-sm"
            >
              <Image src={photo.src} alt={photo.alt} width={1000} height={1000} loading="lazy" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
