'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('opacity-100', '!translate-y-0'); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Layout1({ config, ref1, ref2, ref3 }) {
  const { story } = config;
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 md:py-28 relative">
      <div className="absolute inset-x-8 top-12 bottom-12 border border-[var(--colorPrimary)] opacity-30 pointer-events-none" />
      
      <div ref={ref1} className="text-center mb-12 opacity-0 translate-y-8 transition-all duration-700 relative z-10 pt-16">
        <p className="font-sans text-[0.7rem] tracking-[0.3em] uppercase text-[var(--colorPrimary)] mb-3">
          The Beginning
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-normal text-[var(--colorTextDark)] mb-3">
          Our Story
        </h2>
        <span className="text-[var(--colorPrimary)]/60 text-2xl">❧</span>
      </div>

      <div ref={ref2} className="opacity-0 translate-y-8 transition-all duration-700 delay-100 relative z-10">
        <div className="relative text-center py-8 px-6 md:px-16 mb-10">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--colorPrimary)] to-transparent mb-6 opacity-60" />
          <p className="font-serif text-xl md:text-2xl leading-relaxed text-[var(--colorTextDark)] max-w-2xl mx-auto">
            {story?.invitationText || ''}
          </p>
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--colorPrimary)] to-transparent mt-6 opacity-60" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center relative z-10 pb-16 px-6 max-w-5xl mx-auto">
        <div ref={ref3} className="opacity-0 translate-y-8 transition-all duration-700 delay-200 flex flex-col gap-6 text-center md:text-left">
          {(story?.paragraphs || []).map((p, i) => (
            <p key={i} className="font-serif text-base md:text-lg leading-[1.8] text-[var(--colorTextDark)]/80">
              {p}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 relative">
          {config.gallery?.slice(0, 2).map((img, i) => (
            <div key={i} className={`relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[3/4] border-4 border-white/40 backdrop-blur-md ${i === 1 ? 'mt-16 -ml-4' : 'mb-16'}`}>
              <Image src={img.src} alt={img.alt || 'Story Image'} fill sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" className="object-cover hover:scale-105 transition-transform duration-700 hover:saturate-100 opacity-90" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Layout2({ config, ref1, ref2, ref3 }) {
  const { story } = config;
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center bg-[var(--colorPrimary)]/5 p-10 md:p-16 rounded-[40px] border border-[var(--colorPrimary)]/20 relative">
        <div className="absolute top-0 left-10 w-20 h-1 bg-[var(--colorPrimary)] opacity-50" />
        <div className="absolute bottom-0 right-10 w-20 h-1 bg-[var(--colorPrimary)] opacity-50" />

        <div ref={ref1} className="lg:col-span-5 opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="font-script text-5xl md:text-6xl text-[var(--colorPrimary)] mb-6 leading-none drop-shadow-sm">
            Journey of Love
          </h2>
          <p className="font-serif text-2xl md:text-3xl leading-snug text-[var(--colorTextDark)] mb-10 tracking-wide">
            {story?.invitationText || ''}
          </p>
        </div>

        <div ref={ref2} className="lg:col-span-7 flex flex-col gap-6 opacity-0 translate-y-8 transition-all duration-700 delay-100">
          {(story?.paragraphs || []).map((p, i) => (
            <p key={i} className="font-serif text-lg leading-[1.8] text-[var(--colorTextDark)] opacity-80 bg-white/40 p-6 rounded-2xl border border-white/50 backdrop-blur-sm">
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function Layout3({ config, ref1, ref2, ref3, ref4 }) {
  const { story } = config;
  return (
    <div className="relative max-w-5xl mx-auto px-6 py-28 md:py-36">
      {/* Decorative Border */}
      <div className="absolute inset-4 md:inset-8 border border-[var(--colorPrimary)] pointer-events-none opacity-40 mix-blend-multiply" />
      <div className="absolute inset-[18px] md:inset-[34px] border border-[var(--colorPrimary)] pointer-events-none opacity-20 outline outline-1 outline-offset-2 outline-[var(--colorPrimary)]" />
      
      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto text-center px-4">
        <div ref={ref1} className="opacity-0 translate-y-8 transition-all duration-700 mb-12">
           <span className="text-3xl text-[var(--colorPrimary)] mb-4 block">❀</span>
           <h2 className="font-serif text-4xl md:text-5xl text-[var(--colorTextDark)] mb-4 tracking-wide">
             The Journey
           </h2>
           <div className="w-24 h-0.5 bg-[var(--colorPrimary)] mx-auto opacity-60" />
        </div>

        <div ref={ref2} className="opacity-0 translate-y-8 transition-all duration-700 delay-100 bg-[var(--colorPrimary)]/5 p-8 md:p-12 border border-[var(--colorPrimary)]/30 shadow-lg mb-16 relative">
          {/* Corner ornaments */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[var(--colorPrimary)]" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[var(--colorPrimary)]" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[var(--colorPrimary)]" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[var(--colorPrimary)]" />
          
          <p className="font-serif text-xl md:text-2xl leading-loose text-center text-[var(--colorTextDark)] mb-4">
            {story?.invitationText || ''}
          </p>
        </div>

        <div ref={ref3} className="opacity-0 translate-y-8 transition-all duration-700 delay-200 space-y-8 mb-20">
          {(story?.paragraphs || []).map((p, i) => (
            <p key={i} className="font-sans text-sm md:text-base leading-relaxed tracking-wide text-center text-[var(--colorTextDark)] opacity-80">
              {p}
            </p>
          ))}
        </div>
        
        <div ref={ref4} className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl mx-auto opacity-0 translate-y-8 transition-all duration-700 delay-300 mt-8 mb-16">
           {config.gallery?.slice(0, 4).map((img, i) => (
              <div key={i} className="w-full aspect-square rounded-lg overflow-hidden shadow-lg border-2 border-[var(--colorBg)] transition-transform duration-500 hover:scale-105 relative">
                 <Image src={img.src} alt={`Journey ${i}`} fill sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" className="object-cover" />
              </div>
           ))}
        </div>
        
        <span className="text-3xl text-[var(--colorPrimary)] mt-24 scale-[-1]">❀</span>
      </div>
    </div>
  );
}

function Layout4({ config, ref1, ref2, ref3 }) {
  const { story } = config;
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 md:py-32 relative text-center">
      {/* Decorative nature elements */}
      <div className="absolute top-10 left-10 text-4xl opacity-10 pointer-events-none rotate-12">🌿</div>
      <div className="absolute bottom-10 right-10 text-4xl opacity-10 pointer-events-none -rotate-12">🍃</div>
      
      <div ref={ref1} className="opacity-0 translate-y-8 transition-all duration-1000 mb-16">
        <p className="font-sans text-[0.65rem] tracking-[0.4em] uppercase text-[var(--colorPrimary)] mb-4 font-bold">
          Our Journey
        </p>
        <h2 className="font-serif text-5xl md:text-6xl text-[var(--colorTextDark)] mb-6 tracking-tight">
          The Story of Us
        </h2>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12 bg-[var(--colorPrimary)] opacity-30" />
          <span className="text-[var(--colorPrimary)] text-xl">🪷</span>
          <div className="h-px w-12 bg-[var(--colorPrimary)] opacity-30" />
        </div>
      </div>

      <div ref={ref2} className="opacity-0 translate-y-8 transition-all duration-1000 delay-300 mb-20 max-w-2xl mx-auto">
        <p className="font-serif text-2xl md:text-3xl leading-relaxed text-[var(--colorTextDark)] italic">
          &ldquo;{story?.invitationText || ''}&rdquo;
        </p>
      </div>

      <div ref={ref3} className="opacity-0 translate-y-8 transition-all duration-1000 delay-500 space-y-10">
        {story.paragraphs.map((p, i) => (
          <p key={i} className="font-serif text-lg md:text-xl leading-[2] text-[var(--colorTextDark)]/70 max-w-3xl mx-auto px-4">
            {p}
          </p>
        ))}
        
        <div className="pt-12">
          <span className="font-script text-4xl text-[var(--colorPrimary)]">Happily Ever After</span>
        </div>
      </div>
    </div>
  );
}

// ── LAYOUT 5 — Modern Minimalist Story ──
function Layout5({ config, ref1, ref2, ref3 }) {
  const { story } = config;
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <div ref={ref1} className="opacity-0 translate-y-8 transition-all duration-1000 mb-12">
        <h2 className="font-sans text-[clamp(48px,10vw,80px)] font-black uppercase tracking-tighter text-[var(--colorTextDark)] leading-[0.8] mb-6">
          The<br />Story
        </h2>
        <div className="w-16 h-2 bg-[var(--colorPrimary)] mx-auto" />
      </div>
      <div ref={ref2} className="opacity-0 translate-y-8 transition-all duration-1000 delay-200 max-w-2xl mx-auto">
         <p className="font-serif text-2xl text-[var(--colorTextDark)] mb-8 font-medium italic">
           {story?.invitationText || ''}
         </p>
         <div className="space-y-6">
           {(story?.paragraphs || []).map((p, i) => (
              <p key={i} className="font-sans text-base tracking-wide text-[var(--colorTextDark)] opacity-60 leading-relaxed">
                 {p}
              </p>
           ))}
         </div>
      </div>
    </div>
  );
}

// ── LAYOUT 6 — Watercolor Floral Story ──
function Layout6({ config, ref1, ref2, ref3, labels = {} }) {
  const { story } = config;
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <div ref={ref1} className="opacity-0 translate-y-8 transition-all duration-1000 mb-16">
        <span className="text-4xl mb-4 block">🌸</span>
        <h2 className="font-script text-6xl text-[var(--colorPrimary)] mb-2">{labels.storyHeading6 || 'Our Love Story'}</h2>
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--colorPrimary)]/20" />
          <div className="w-2 h-2 rounded-full bg-[var(--colorPrimary)]/40" />
          <div className="w-2 h-2 rounded-full bg-[var(--colorPrimary)]/60" />
        </div>
      </div>
      <div className="bg-white/40 backdrop-blur-md p-10 md:p-16 rounded-[100px_20px_100px_20px] border border-[var(--colorPrimary)]/10 shadow-xl relative overflow-hidden">
        <div ref={ref2} className="opacity-0 translate-y-8 transition-all duration-1000 delay-300">
          <p className="font-serif text-2xl md:text-3xl text-[var(--colorTextDark)] mb-10 italic">
            {story?.invitationText || ''}
          </p>
          <div className="space-y-8 text-center max-w-2xl mx-auto">
            {(story?.paragraphs || []).map((p, i) => (
               <p key={i} className="font-sans text-sm md:text-base text-[var(--colorTextDark)]/70 leading-relaxed tracking-wide">
                  {p}
               </p>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">🌿</div>
        <div className="absolute bottom-0 left-0 p-8 opacity-10">🍃</div>
      </div>
    </div>
  );
}

// ── LAYOUT 7 — Polaroid Scrapbook Story ──
function Layout7({ config, ref1, ref2, ref3, labels = {} }) {
  const { story } = config;
  return (
    <div className="max-w-5xl mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="md:w-1/2 relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-[var(--colorPrimary)]/10 rounded-full blur-3xl" />
          <div ref={ref1} className="opacity-0 translate-y-8 transition-all duration-700 bg-white p-4 pb-16 shadow-2xl border border-slate-100 -rotate-3 relative z-10 w-full max-w-sm ml-auto">
            <div className="aspect-square bg-slate-100 overflow-hidden mb-4 relative">
               <Image src={config.gallery?.[2]?.src || config.heroImage || '/images/placeholder.png'} fill sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" className="object-cover sepia-[0.2]" alt="" />
            </div>
            <p className="font-script text-3xl text-slate-700 text-center">{labels.storyCaption7 || 'Moments Together'}</p>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/60 backdrop-blur-sm border border-white/20 shadow-sm" />
          </div>
        </div>
        <div className="md:w-1/2">
          <div ref={ref2} className="opacity-0 translate-y-8 transition-all duration-700 delay-300">
            <h2 className="font-script text-5xl text-slate-800 mb-6 font-bold underline decoration-[var(--colorPrimary)]/20 decoration-8 underline-offset-[-2px]">Our Journey</h2>
            <p className="font-serif text-xl text-slate-700 mb-8 italic leading-relaxed">
              {story?.invitationText || ''}
            </p>
            <div className="space-y-6">
              {(story?.paragraphs || []).map((p, i) => (
                 <p key={i} className="font-sans text-sm text-slate-500 leading-[1.8] tracking-wide">
                    {p}
                 </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LAYOUT 8 — Sinhala Traditional Story ──
function Layout8({ config, ref1, ref2, ref3 }) {
  const { story } = config;
  return (
    <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 relative">
      <div className="absolute top-10 right-10 w-32 h-32 opacity-5 pointer-events-none">
         <svg viewBox="0 0 100 100" fill="var(--colorPrimary)"><path d="M50,10 C50,10 80,40 80,60 C80,80 65,90 50,90 C35,90 20,80 20,60 C20,40 50,10 50,10 Z" /></svg>
      </div>

      <div ref={ref1} className="text-center mb-16 opacity-0 translate-y-8 transition-all duration-1000">
        <p className="font-sinhala text-xl text-[var(--colorPrimary)] mb-2">ආදර චාරිකාව</p>
        <h2 className="font-sinhala text-4xl md:text-6xl text-[var(--colorTextDark)] mb-6">අපේ කතාව</h2>
        <div className="flex justify-center gap-4 items-center">
          <div className="h-px w-16 bg-[var(--colorPrimary)]" />
          <span className="text-2xl text-[var(--colorPrimary)]">❦</span>
          <div className="h-px w-16 bg-[var(--colorPrimary)]" />
        </div>
      </div>

      <div className="bg-[var(--colorPrimary)]/5 p-10 md:p-16 border-2 border-double border-[var(--colorPrimary)]/30 rounded-[40px] relative shadow-inner">
        <div ref={ref2} className="opacity-0 translate-y-8 transition-all duration-1000 delay-300 text-center">
          <p className="font-sinhala text-2xl md:text-3xl text-[var(--colorTextDark)] mb-12 leading-relaxed">
            {story?.invitationText || ''}
          </p>
          <div className="space-y-10 text-center max-w-3xl mx-auto">
            {(story?.paragraphs || []).map((p, i) => (
               <p key={i} className="font-sinhala text-lg md:text-xl text-[var(--colorTextDark)]/70 leading-loose">
                  {p}
               </p>
            ))}
          </div>
        </div>
        <div className="mt-16 text-center">
           <span className="font-script text-4xl text-[var(--colorPrimary)] opacity-50">Thank You for Being a Part of Us</span>
        </div>
      </div>
    </div>
  );
}

export default function StorySection({ config, labels = {} }) {
  const ref1 = useReveal();
  const ref2 = useReveal();
  const ref3 = useReveal();
  const ref4 = useReveal();
  const layout = config?.heroLayout ?? 1;

  // Hide the entire section when no story content has been entered
  const hasStory =
    config?.story?.invitationText?.trim() ||
    (Array.isArray(config?.story?.paragraphs) && config.story.paragraphs.some(p => p?.trim()));
  if (!hasStory) return null;

  // The background color is handled globally by var(--colorBg)
  return (
    <section 
      id="story" 
      className="overflow-hidden transition-colors duration-500 relative"
      style={{ backgroundColor: 'var(--colorBg)' }}
    >
      {/* ── SECTION BACKGROUND IMAGE ── */}
      {config.sectionBackgrounds?.story && (
        <div 
          className="absolute inset-0 pointer-events-none transition-transform duration-1000 z-0"
          style={{ 
            backgroundImage: `url(${config.sectionBackgrounds.story})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)',
            transform: 'scale(1.02)',
            opacity: 0.85
          }} 
        />
      )}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-white/5" />
      {layout === 9 ? (
        <Layout9 config={config} ref1={ref1} ref2={ref2} ref3={ref3} />
      ) : (layout === 8 || layout === 11) ? (
        <Layout8 config={config} ref1={ref1} ref2={ref2} ref3={ref3} />
      ) : layout === 7 ? (
        <Layout7 config={config} ref1={ref1} ref2={ref2} ref3={ref3} labels={labels} />
      ) : layout === 6 ? (
        <Layout6 config={config} ref1={ref1} ref2={ref2} ref3={ref3} labels={labels} />
      ) : layout === 5 ? (
        <Layout5 config={config} ref1={ref1} ref2={ref2} ref3={ref3} />
      ) : layout === 4 ? (
        <Layout4 config={config} ref1={ref1} ref2={ref2} ref3={ref3} />
      ) : layout === 3 ? (
        <Layout3 config={config} ref1={ref1} ref2={ref2} ref3={ref3} ref4={ref4} />
      ) : layout === 2 ? (
        <Layout2 config={config} ref1={ref1} ref2={ref2} ref3={ref3} />
      ) : (
        <Layout1 config={config} ref1={ref1} ref2={ref2} ref3={ref3} />
      )}
    </section>
  );
}

// ── LAYOUT 9 — Modern Dark Story ──
function Layout9({ config, ref1, ref2, ref3 }) {
  const { story } = config;
  return (
    <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 relative">
      <div ref={ref1} className="opacity-0 translate-y-8 transition-all duration-1000 mb-16 text-center">
        <h2 className="font-sans text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 leading-none text-[var(--colorTextDark)]">
          The Story
        </h2>
        <div className="h-1 w-24 bg-[var(--colorPrimary)] mx-auto rounded-full" />
      </div>

      <div className="relative z-10 bg-[var(--colorSurface)]/60 backdrop-blur-2xl p-10 md:p-20 rounded-[40px] border border-[var(--colorPrimary)]/15 shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--colorPrimary)]/10 rounded-full blur-[100px] -z-10" />
        
        <div ref={ref2} className="opacity-0 translate-y-8 transition-all duration-1000 delay-300 mb-12">
          <p className="font-serif text-3xl md:text-4xl text-[var(--colorTextDark)] font-medium leading-tight mb-8">
            {story?.invitationText || ''}
          </p>
        </div>

        <div ref={ref3} className="opacity-0 translate-y-8 transition-all duration-1000 delay-500 grid md:grid-cols-2 gap-8">
          {(story?.paragraphs || []).map((p, i) => (
            <p key={i} className="font-sans text-base md:text-lg text-[var(--colorTextDark)]/70 leading-relaxed font-light">
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
