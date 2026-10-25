'use client';
import { useEffect, useRef } from 'react';
import { MapPin, Calendar } from 'lucide-react';

function useReveal(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('opacity-100', '!translate-y-0'), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
}

const PlaneIcon = () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z" /></svg>);
const CalendarIcon = () => (<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);

// ── Helper: merge base events + extraEvents into a flat array ──
function getAllEvents(config) {
  return [
    ...Object.values(config?.events || {}),
    ...(config?.extraEvents || [])
  ];
}

function ActionButtons({ event, config }) {
  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`${config?.couple?.displayNames || 'Wedding'}'s ${event?.title || 'Event'}`);
    const details = encodeURIComponent(`We would love to see you at our ${event?.title || 'Event'}! \n\nVenue: ${event?.venueName || ''}\nAddress: ${event?.address || ''}`);
    const location = encodeURIComponent(event?.address || event?.venueName || '');
    
    // Extract dates from config
    const dateStr = config?.wedding?.dateTimeISO || ''; // e.g. 2026-12-19T10:00:00
    const start = dateStr.replace(/[-:]/g, '').split('.')[0] || '';
    const end = start; // Same day usually
    
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
    window.open(googleUrl, '_blank');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
      <a 
        href={event.mapsUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--colorTextDark)] text-[var(--colorBg)] font-sans text-[10px] font-bold tracking-widest uppercase hover:bg-[var(--colorPrimary)] transition-all duration-300 rounded-lg shadow-md"
      >
        <PlaneIcon /> Google Maps
      </a>
      <button 
        onClick={handleAddToCalendar}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-[var(--colorTextDark)] text-[var(--colorTextDark)] font-sans text-[10px] font-bold tracking-widest uppercase hover:text-[var(--colorPrimary)] hover:border-[var(--colorPrimary)] transition-all duration-300 rounded-lg"
      >
        <CalendarIcon /> Add to Calendar
      </button>
    </div>
  );
}

// ── LAYOUT 1 — Rectangular Ornate Cards ──
function EventCard1({ event, delay, config }) {
  const ref = useReveal(delay);
  return (
    <article
      ref={ref}
      className="opacity-0 translate-y-8 transition-all duration-700 bg-[var(--colorBg)] border border-[var(--colorPrimary)] rounded-none px-8 py-10 flex flex-col items-center text-center gap-3 w-full max-w-sm relative group"
    >
      <div className="absolute inset-1.5 border border-[var(--colorPrimary)] opacity-40 pointer-events-none" />
      <span className="text-4xl mb-1 mt-2 text-[var(--colorPrimary)]">❀</span>
      <h3 className="font-serif text-2xl md:text-3xl font-medium text-[var(--colorTextDark)] tracking-wide">{event.title}</h3>
      <div className="w-16 h-px bg-[var(--colorPrimary)] my-2 opacity-60" />
      <span className="font-serif italic text-lg text-[var(--colorPrimary)] mb-2">{event.time}</span>

      <div className="flex flex-col gap-1 w-full max-w-xs text-center mb-6">
        <span className="font-sans font-bold uppercase tracking-widest text-xs text-[var(--colorTextDark)]">{event.venueName}</span>
        <span className="font-sans text-sm text-[var(--colorTextDark)]/75 mt-1 leading-relaxed">{event.address}</span>
        {event.dressCode && event.dressCode !== 'none' && (
          <span className="font-serif italic text-sm text-[var(--colorTextDark)] opacity-80 mt-3">Dress Code: {event.dressCode}</span>
        )}
      </div>

      <ActionButtons event={event} config={config} />
    </article>
  );
}

function Layout1({ config }) {
  const headerRef = useReveal(0);
  const allEvents = getAllEvents(config);
  return (
    <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
      {(config?.layout1EventBanner || config?.gallery?.[2]) && (
        <div className="w-full h-64 md:h-80 relative overflow-hidden mb-16 rounded-[2rem] shadow-xl isolate">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config?.layout1EventBanner || config?.gallery?.[2]?.src} alt="Banner" className="absolute inset-0 w-full h-full object-cover attachment-fixed object-[center_30%]" style={{ transform: 'scale(1.05)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--colorBg)] to-transparent opacity-80" />
          <div ref={headerRef} className="absolute inset-0 flex flex-col items-center justify-center opacity-0 translate-y-8 transition-all duration-700">
            <p className="font-sans text-[0.7rem] md:text-xs tracking-[0.3em] uppercase text-[var(--colorBg)] drop-shadow-md mb-2">Mark Your Calendar</p>
            <h2 className="font-serif text-5xl md:text-6xl font-normal text-white drop-shadow-lg tracking-wide">Event Details</h2>
          </div>
        </div>
      )}

      {!config?.layout1EventBanner && !config?.gallery?.[2] && (
        <div ref={headerRef} className="text-center mb-16 opacity-0 translate-y-8 transition-all duration-700">
          <p className="font-sans text-[0.7rem] tracking-[0.3em] uppercase text-[var(--colorPrimary)] mb-3">Mark Your Calendar</p>
          <h2 className="font-serif text-4xl md:text-5xl font-normal text-[var(--colorTextDark)] mb-4 tracking-wide">Event Details</h2>
          <div className="w-24 h-px bg-[var(--colorPrimary)] opacity-50 mx-auto" />
        </div>
      )}

      <div className={`flex flex-wrap justify-center gap-8 md:gap-12 ${allEvents.length === 0 ? 'hidden' : ''}`}>
        {allEvents.map((event, idx) => (
          <EventCard1 key={idx} event={event} delay={idx * 150} config={config} />
        ))}
      </div>
    </div>
  );
}

// ── LAYOUT 2 — Floating Elegant Cards ──
function EventCard2({ event, delay, config }) {
  const ref = useReveal(delay);
  return (
    <div ref={ref} className="opacity-0 translate-y-8 transition-all duration-700 w-full md:w-[48%] bg-white/70 backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-white/60 relative group hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-10 rounded-[32px] text-center flex flex-col items-center justify-center">
      <h3 className="font-script text-4xl text-[var(--colorPrimary)] mb-2 drop-shadow-sm">{event.title}</h3>
      <p className="font-serif text-[var(--colorTextDark)] opacity-80 text-lg mb-6 tracking-wide">{event.time}</p>

      <div className="space-y-4 mb-8 flex flex-col items-center text-center">
        <p className="font-sans font-light text-sm uppercase tracking-widest text-[var(--colorTextDark)] opacity-90"><span className="font-bold border-b border-[var(--colorPrimary)]/50 block mb-1">Venue</span> {event.venueName}</p>
        <p className="font-sans font-light text-sm uppercase tracking-widest text-[var(--colorTextDark)] opacity-90 mt-2"><span className="font-bold border-b border-[var(--colorPrimary)]/50 block mb-1">Location</span> {event.address}</p>
        {event.dressCode && event.dressCode !== 'none' && (
          <p className="font-sans font-light text-sm uppercase tracking-widest text-[var(--colorTextDark)] opacity-90"><span className="font-bold border-b border-[var(--colorPrimary)]/50 mr-2">Attire</span> {event.dressCode}</p>
        )}
      </div>

      <ActionButtons event={event} config={config} />
    </div>
  );
}

function Layout2({ config }) {
  const headerRef = useReveal(0);
  const allEvents = getAllEvents(config);
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--colorPrimary)] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div ref={headerRef} className="opacity-0 translate-y-8 transition-all duration-700 mb-20 text-center relative z-10 w-full">
        <h2 className="font-script text-6xl md:text-8xl text-[var(--colorPrimary)] mb-6 leading-none drop-shadow-sm tracking-wide">
          When & Where
        </h2>
      </div>
      <div className={`flex flex-wrap justify-center gap-12 relative z-10 w-full ${allEvents.length === 0 ? 'hidden' : ''}`}>
        {allEvents.map((event, idx) => (
          <EventCard2 key={idx} event={event} delay={idx * 150} config={config} />
        ))}
      </div>
    </div>
  );
}

// ── LAYOUT 3 — Royal Arch / Solid block ──
function EventCard3({ event, delay, config }) {
  const ref = useReveal(delay);
  return (
    <div ref={ref} className="opacity-0 translate-y-8 transition-all duration-700 relative bg-[var(--colorPrimary)]/5 border border-[var(--colorPrimary)]/50 p-8 md:p-10 w-full max-w-md mx-auto text-center shadow-lg group hover:bg-[var(--colorPrimary)]/10 transition-colors">
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[var(--colorPrimary)] m-2 pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[var(--colorPrimary)] m-2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[var(--colorPrimary)] m-2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[var(--colorPrimary)] m-2 pointer-events-none" />

      <h3 className="font-serif text-3xl md:text-4xl text-[var(--colorTextDark)] mb-2 tracking-wide">{event.title}</h3>
      <p className="font-script text-3xl text-[var(--colorPrimary)] mb-6 drop-shadow-sm">{event.time}</p>

      <div className="w-16 h-[1px] bg-[var(--colorPrimary)] mx-auto mb-6 opacity-60" />

      <p className="font-sans text-xs tracking-widest uppercase font-bold text-[var(--colorTextDark)] mb-1">{event.venueName}</p>
      <p className="font-sans text-sm tracking-wide text-[var(--colorTextDark)]/80 mb-6 max-w-[200px] mx-auto leading-relaxed">{event.address}</p>

      {event.dressCode && event.dressCode !== 'none' && (
        <p className="font-serif italic text-sm text-[var(--colorTextDark)] opacity-90 mb-8">Dress Code: {event.dressCode}</p>
      )}

      <ActionButtons event={event} config={config} />
    </div>
  );
}

function Layout3({ config }) {
  const headerRef = useReveal(0);
  const allEvents = getAllEvents(config);
  return (
    <div className="max-w-6xl mx-auto px-6 py-28 md:py-36 rounded-[3rem] border border-[var(--colorPrimary)]/20 mt-12 mb-12 shadow-sm bg-[var(--colorBg)]/50 backdrop-blur-[2px]">
      <div ref={headerRef} className="text-center mb-16 opacity-0 translate-y-8 transition-all duration-700">
        <span className="text-3xl text-[var(--colorPrimary)] mb-4 block">❀</span>
        <h2 className="font-serif text-4xl md:text-5xl text-[var(--colorTextDark)] mb-4 tracking-wide">When & Where</h2>
        <div className="w-24 h-0.5 bg-[var(--colorPrimary)] mx-auto opacity-60" />
      </div>

      <div className={`grid md:grid-cols-2 gap-10 md:gap-14 justify-center ${allEvents.length === 0 ? 'hidden' : ''}`}>
        {allEvents.map((event, idx) => (
          <div key={idx} className={allEvents.length === 1 ? 'md:col-span-2' : ''}>
            <EventCard3 event={event} delay={idx * 150} config={config} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LAYOUT 5 — Modern Minimalist Events ──
function EventCard5({ event, delay, config }) {
  const ref = useReveal(delay);
  return (
    <div ref={ref} className="opacity-0 translate-y-8 transition-all duration-700 flex flex-col items-center text-center border-t border-[var(--colorTextDark)]/10 py-12 w-full group">
      <div className="w-full flex flex-col items-center mb-6">
        <p className="font-serif text-3xl text-[var(--colorTextDark)] mb-3">{event.time}</p>
        <h3 className="font-sans text-[clamp(24px,4vw,36px)] font-bold uppercase tracking-tighter text-[var(--colorTextDark)] mb-2 group-hover:text-[var(--colorPrimary)] transition-colors">{event.title}</h3>
        <p className="font-serif italic text-lg text-[var(--colorTextDark)]/60">{event.venueName}</p>
      </div>
      <ActionButtons event={event} config={config} />
    </div>
  );
}

function Layout5({ config }) {
  const allEvents = getAllEvents(config);
  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <div className="mb-20 text-center">
        <h2 className="font-sans text-[clamp(40px,8vw,80px)] font-extrabold uppercase tracking-tighter text-[var(--colorTextDark)]/10 leading-none mb-[-20px]">Details</h2>
        <p className="font-serif text-3xl italic text-[var(--colorTextDark)] relative z-10">When & Where</p>
      </div>
      <div className="flex flex-col">
        {allEvents.map((event, idx) => (
          <EventCard5 key={idx} event={event} delay={idx * 100} config={config} />
        ))}
      </div>
    </div>
  );
}

// ── LAYOUT 6 — Watercolor Floral Events ──
function EventCard6({ event, delay, config }) {
  const ref = useReveal(delay);
  return (
    <div ref={ref} className="opacity-0 translate-y-8 transition-all duration-700 bg-white/40 p-8 rounded-[60px_20px_60px_20px] border border-[var(--colorPrimary)]/10 text-center shadow-lg relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-[var(--colorPrimary)]/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <span className="text-3xl mb-4 block">💮</span>
      <h3 className="font-script text-4xl text-[var(--colorPrimary)] mb-2">{event.title}</h3>
      <p className="font-sans text-[10px] tracking-widest uppercase font-bold text-[var(--colorTextDark)]/60 mb-6">{event.time}</p>
      <div className="space-y-2 mb-8">
        <p className="font-serif text-lg text-[var(--colorTextDark)]">{event.venueName}</p>
        <p className="font-sans text-[10px] uppercase text-[var(--colorTextDark)]/40 tracking-widest">{event.address}</p>
      </div>
      <ActionButtons event={event} config={config} />
    </div>
  );
}

function Layout6({ config, labels = {} }) {
  const allEvents = getAllEvents(config);
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
      <div className="mb-16">
        <span className="text-2xl mb-4 block opacity-40">❦</span>
        <h2 className="font-serif text-5xl text-[var(--colorTextDark)] mb-2 drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]">The Celebration</h2>
        <p className="font-script text-3xl text-[var(--colorPrimary)] opacity-90 drop-shadow-sm">{labels.eventDetailsSubtitle || 'Lovely moments together'}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-8 px-4">
        {allEvents.map((event, idx) => (
          <div key={idx} className="w-full max-w-sm">
            <EventCard6 event={event} delay={idx * 150} config={config} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LAYOUT 7 — Polaroid Scrapbook Events ──
function EventCard7({ event, delay, config }) {
  const ref = useReveal(delay);
  return (
    <div ref={ref} className="opacity-0 translate-y-8 transition-all duration-700 bg-white p-4 pb-12 shadow-xl border border-slate-100 rotate-1 group hover:rotate-0 transition-all duration-500 max-w-xs mx-auto">
      <div className="aspect-square bg-slate-50 mb-4 overflow-hidden relative">
        {event.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.image} alt={event.title || 'Event venue'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <span className="text-5xl">📍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/5" />
      </div>
      <div className="text-center px-2">
        <h3 className="font-script text-3xl text-slate-800 mb-1">{event.title}</h3>
        <p className="font-sans text-[10px] text-slate-400 uppercase tracking-widest mb-4">{event.time}</p>
        <p className="font-serif text-sm text-slate-600 mb-6 leading-tight">{event.venueName}</p>
        <ActionButtons event={event} config={config} />
      </div>
    </div>
  );
}

function Layout7({ config }) {
  const allEvents = getAllEvents(config);
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 text-center">
      <div className="mb-20">
        <h2 className="font-script text-5xl text-slate-800 mb-2 underline decoration-[var(--colorPrimary)]/30 underline-offset-8">When & Where</h2>
      </div>
      <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-12 w-full">
        {allEvents.map((event, idx) => (
          <EventCard7 key={idx} event={event} delay={idx * 100} config={config} />
        ))}
      </div>
    </div>
  );
}

// ── LAYOUT 8 — Sinhala Traditional Events ──
function EventCard8({ event, delay }) {
  const ref = useReveal(delay);
  return (
    <div ref={ref} className="opacity-0 translate-y-8 transition-all duration-700 bg-[var(--colorPrimary)]/5 border-2 border-double border-[var(--colorPrimary)]/40 p-8 md:p-12 text-center relative group">
      <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[var(--colorPrimary)]" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[var(--colorPrimary)]" />
      
      <h3 className="font-sinhala text-3xl text-[var(--colorPrimary)] mb-1">
        {event.title}
      </h3>
      <p className="font-sans text-[10px] tracking-widest opacity-40 uppercase mb-6">{event.title}</p>
      
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex items-center gap-4 w-full">
          <div className="h-px flex-1 bg-[var(--colorPrimary)]/20" />
          <span className="text-xl">❉</span>
          <div className="h-px flex-1 bg-[var(--colorPrimary)]/20" />
        </div>
        <div>
          <p className="font-serif text-xl font-bold text-[var(--colorTextDark)] mb-1">{event.time}</p>
          <p className="font-sinhala text-xs text-[var(--colorTextDark)]/60">වේලාව (Time)</p>
        </div>
      </div>

      <div className="space-y-3 mb-10">
        <p className="font-sinhala text-lg text-[var(--colorTextDark)] font-bold">{event.venueName}</p>
        <p className="font-sans text-[10px] uppercase tracking-widest opacity-60 leading-relaxed max-w-[200px] mx-auto">{event.address}</p>
      </div>

      <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer" className="px-10 py-3 bg-[var(--colorPrimary)] text-white font-sans text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-[var(--colorTextDark)] transition-colors">
        සිිතියම (Map)
      </a>
    </div>
  );
}

function Layout8({ config }) {
  const allEvents = getAllEvents(config);
  return (
    <div className="max-w-6xl mx-auto px-6 py-28">
      <div className="text-center mb-20">
        <h2 className="font-sinhala text-4xl md:text-5xl text-[var(--colorTextDark)] mb-4 leading-relaxed">
          පින්බර උත්සව අවස්ථාවන්හි තොරතුරු
        </h2>
        <div className="w-16 h-1 bg-[var(--colorPrimary)] mx-auto rounded-full" />
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        {allEvents.map((event, idx) => (
          <EventCard8 key={idx} event={event} delay={idx * 150} />
        ))}
      </div>
    </div>
  );
}

export default function EventDetails({ config, labels = {} }) {
  const layout = config?.heroLayout ?? 1;

  return ( 
    <section 
      id="events" 
      className="overflow-hidden transition-colors duration-500 relative"
      style={{ backgroundColor: 'var(--colorBg)' }}
    >
      {/* ── SECTION BACKGROUND IMAGE ── */}
      {config.sectionBackgrounds?.events && (
        <div 
          className="absolute inset-x-0 inset-y-0 pointer-events-none transition-transform duration-1000 z-0"
          style={{ 
            backgroundImage: `url(${config.sectionBackgrounds.events})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)',
            transform: 'scale(1.02)',
            opacity: 0.85
          }} 
        />
      )}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-white/5" />
      {layout === 9 ? <Layout9 config={config} /> : 
       (layout === 8 || layout === 11) ? <Layout8 config={config} /> : 
       layout === 7 ? <Layout7 config={config} /> : 
       layout === 6 ? <Layout6 config={config} labels={labels} /> : 
       layout === 5 ? <Layout5 config={config} /> : 
       layout === 4 ? <Layout4 config={config} /> : 
       layout === 3 ? <Layout3 config={config} /> : 
       layout === 2 ? <Layout2 config={config} /> : <Layout1 config={config} />}
    </section>
  );
}

// ── LAYOUT 9 — Modern Dark Events ──
function EventCard9({ event, delay, date, config }) {
  const ref = useReveal(delay);

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(`${config?.couple?.displayNames || 'Wedding'}'s ${event?.title || 'Event'}`);
    const details = encodeURIComponent(`We would love to see you at our ${event?.title || 'Event'}!\n\nVenue: ${event?.venueName || ''}\nAddress: ${event?.address || ''}`);
    const location = encodeURIComponent(event?.address || event?.venueName || '');
    const dateStr = config?.wedding?.dateTimeISO || '';
    const start = dateStr.replace(/[-:]/g, '').split('.')[0] || '';
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${start}`;
    window.open(googleUrl, '_blank');
  };

  return (
    <article
      ref={ref}
      className="opacity-0 translate-y-8 transition-all duration-1000 relative w-full max-w-sm group"
    >
      {/* Card */}
      <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.10)] border border-[var(--colorPrimary)]/10 flex flex-col">
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--colorPrimary)] via-[var(--colorSecondary)] to-[var(--colorPrimary)]" />

        <div className="flex flex-col items-center text-center px-8 pt-10 pb-8 gap-0">
          {/* Icon badge */}
          <div className="w-16 h-16 rounded-2xl bg-[var(--colorPrimary)]/10 flex items-center justify-center text-3xl mb-6 shadow-inner">
            {event.icon || '📍'}
          </div>

          {/* Title */}
          <h3 className="font-sans text-3xl md:text-4xl font-black uppercase tracking-tight text-[var(--colorTextDark)] leading-tight mb-3">
            {event.title}
          </h3>
    {/* Date */}
          {date && (
            <p className="font-serif text-xl md:text-2xl italic text-[var(--colorTextDark)] font-semibold mb-5">
              {date}
            </p>
          )}
          {!date && <div className="mb-5" />}
          {/* Time */}
          <p className="font-sans text-sm tracking-[0.4em] uppercase text-[var(--colorPrimary)] font-bold mb-1">
            {event.time}
          </p>

          

          <div className="w-10 h-px bg-[var(--colorPrimary)]/30 mb-6" />

          {/* Venue */}
          <span className="font-sans font-bold uppercase tracking-[0.18em] text-[11px] text-[var(--colorPrimary)] mb-1">
            {event.venueName}
          </span>
          <span className="font-serif text-sm text-[var(--colorTextDark)]/55 leading-relaxed max-w-[220px]">
            {event.address}
          </span>

          {event.dressCode && event.dressCode !== 'none' && (
            <div className="mt-5 px-4 py-2 bg-[var(--colorPrimary)]/8 rounded-full flex items-center gap-2 border border-[var(--colorPrimary)]/15">
              <span className="text-xs">👗</span>
              <span className="font-sans text-[9px] uppercase tracking-widest text-[var(--colorPrimary)] font-bold">
                {event.dressCode}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-8 pb-8 flex flex-col gap-3">
          {event.mapsUrl && (
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 bg-[var(--colorTextDark)] text-[var(--colorBg)] font-sans text-[10px] font-bold tracking-[0.3em] uppercase rounded-2xl hover:bg-[var(--colorPrimary)] transition-all duration-300 shadow-sm"
            >
              <MapPin size={14} /> Get Directions
            </a>
          )}
          <button
            onClick={handleAddToCalendar}
            className="flex items-center justify-center gap-3 w-full py-4 bg-[var(--colorBg)] text-[var(--colorTextDark)] font-sans text-[10px] font-bold tracking-[0.3em] uppercase rounded-2xl border border-[var(--colorPrimary)]/20 hover:bg-[var(--colorPrimary)] hover:text-white hover:border-[var(--colorPrimary)] transition-all duration-300 shadow-sm"
          >
            <Calendar size={14} /> Add to Calendar
          </button>
        </div>
      </div>
    </article>
  );
}

function Layout9({ config }) {
  const headerRef = useReveal(0);
  const allEvents = getAllEvents(config);
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
      <div ref={headerRef} className="text-center mb-20 opacity-0 translate-y-8 transition-all duration-1000">
        <p className="font-sans text-[10px] tracking-[0.6em] uppercase text-[var(--colorPrimary)] font-bold mb-4">Time &amp; Locations</p>
        <h2 className="font-serif text-5xl md:text-7xl italic text-[var(--colorTextDark)] mb-4 leading-none">When & Where</h2>
        <div className="w-20 h-px bg-[var(--colorPrimary)]/40 mx-auto" />
      </div>

      <div className={`flex flex-wrap justify-center gap-8 ${allEvents.length === 0 ? 'hidden' : ''}`}>
        {allEvents.map((event, idx) => (
          <EventCard9 key={idx} event={event} delay={idx * 150} date={config?.wedding?.displayDate} config={config} />
        ))}
      </div>
    </div>
  );
}

// ── LAYOUT 4 — Nature Arch Event Cards ──
function EventCard4({ event, delay, config }) {
  const ref = useReveal(delay);
  const hasImage = !!event.image;

  return (
    <article
      ref={ref}
      className={`opacity-0 translate-y-8 transition-all duration-1000 bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col items-center w-full max-w-[600px] mx-auto group transition-all duration-500 hover:shadow-2xl rounded-3xl`}
    >


      {/* ── RIGHT: DETAILS ── */}
      <div className={`flex flex-col items-center text-center p-8 md:p-12 w-full relative z-10`}>
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none -z-10" />

        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex items-center gap-3">
             <span className="text-3xl text-[var(--colorPrimary)] opacity-70">🌿</span>
          </div>

          <div className="w-full h-48 md:h-56 bg-slate-100 rounded-2xl overflow-hidden relative group/map mb-2 border border-slate-200 shadow-inner">
             {hasImage ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={event.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/map:scale-110" alt="Venue" />
             ) : (
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/gray-floral.png')] opacity-20" />
             )}
             <div className="absolute inset-0 bg-black/10" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover/map:scale-110">
                   <MapPin size={24} className="text-[var(--colorPrimary)]" />
                </div>
             </div>
             <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
                Venue Location
             </div>
          </div>

          <h3 className="font-serif text-4xl md:text-5xl font-medium text-[var(--colorTextDark)] tracking-tight italic mb-2">
            {event.title}
          </h3>

          <div className="w-20 h-px bg-[var(--colorPrimary)] opacity-30 my-2" />

          <div className="flex flex-col items-center gap-2 mt-2 text-center">
            <span className="font-serif text-xl text-[var(--colorTextDark)] font-medium leading-relaxed">
              {event.venueName}
            </span>
            <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] text-[var(--colorTextDark)]/60 leading-relaxed max-w-sm">
              {event.address}
            </span>
            <span className="font-serif text-2xl md:text-3xl text-[var(--colorPrimary)] italic mt-4 tracking-wide font-medium">
              {event.time}
            </span>
          </div>

          {event.dressCode && event.dressCode !== 'none' && (
            <div className="mt-4 px-4 py-2 bg-[var(--colorPrimary)]/10 rounded-lg flex items-center gap-2">
               <span className="text-xs">👗</span>
               <span className="font-sans text-[9px] uppercase tracking-widest text-[var(--colorPrimary)] font-bold">
                 Dress Code: {event.dressCode}
               </span>
            </div>
          )}

          <ActionButtons event={event} config={config} />
        </div>
      </div>
    </article>
  );
}

function Layout4({ config }) {
  const headerRef = useReveal(0);
  const allEvents = getAllEvents(config);
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 relative">
      <div ref={headerRef} className="text-center mb-20 opacity-0 translate-y-8 transition-all duration-1000">
        <p className="font-sans text-[0.65rem] tracking-[0.4em] uppercase text-[var(--colorPrimary)] mb-4 font-bold">The Celebration</p>
        <h2 className="font-serif text-5xl md:text-6xl text-[var(--colorTextDark)] mb-4 italic">When & Where</h2>
        <div className="w-24 h-px bg-[var(--colorPrimary)] opacity-30 mx-auto" />
      </div>

      <div className={`flex flex-wrap justify-center gap-10 md:gap-14 ${allEvents.length === 0 ? 'hidden' : ''}`}>
        {allEvents.map((event, idx) => (
          <EventCard4 key={idx} event={event} delay={idx * 200} config={config} />
        ))}
      </div>
      
    </div>
  );
}
