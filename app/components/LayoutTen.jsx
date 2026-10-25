'use client';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Calendar, MapPin, Music, Clock, Check, ChevronDown,
  ArrowRight, Mail, Navigation, Info, Users
} from 'lucide-react';
import { PRESET_THEMES } from '../../lib/themes';
import RSVPSection from './RSVPSection';
import GuestInvitationCard from './GuestInvitationCard';
import SectionReplacement, { getSectionReplacement } from './SectionReplacement';

// ── Elaborate SVG Mandalas ──
const TopMandala = ({ className = "" }) => (
  <svg 
    viewBox="0 0 1000 300" 
    preserveAspectRatio="xMidYMin slice" 
    className={`fill-current ${className}`}
  >
    <path d="M500 300 C400 300, 300 200, 250 100 C200 0, 100 0, 0 0 L1000 0 C900 0, 800 0, 750 100 C700 200, 600 300, 500 300 Z" opacity="0.05" />
    <path d="M500 250 C420 250, 340 170, 300 80 C260 0, 150 0, 0 0 L1000 0 C850 0, 740 0, 700 80 C660 170, 580 250, 500 250 Z" opacity="0.1" />
    <path d="M500 200 C450 200, 400 140, 360 80 C320 20, 200 0, 0 0 L1000 0 C800 0, 680 20, 640 80 C600 140, 550 200, 500 200 Z" opacity="0.15" />
    <circle cx="500" cy="0" r="160" fill="transparent" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    <circle cx="500" cy="0" r="210" fill="transparent" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" opacity="0.5" />
    <circle cx="500" cy="0" r="260" fill="transparent" stroke="currentColor" strokeWidth="3" opacity="0.2" />
    <path d="M340 0 A 160 160 0 0 0 660 0" fill="transparent" stroke="currentColor" strokeWidth="2" opacity="0.2" />
    {[...Array(17)].map((_, i) => {
      const angle1 = (Math.PI / 16) * i;
      const angle2 = (Math.PI / 16) * (i + 0.5);
      const c = Math.cos, s = Math.sin;
      return (
        <polygon
          key={i}
          points={`500,0 ${500 + c(angle1) * 140},${s(angle1) * 140} ${500 + c(angle2) * 160},${s(angle2) * 160}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
        />
      )
    })}
    {[...Array(25)].map((_, i) => {
      const angle = (Math.PI / 24) * i;
      const pointX = 500 + Math.cos(angle) * 230;
      const pointY = Math.sin(angle) * 230;
      return <circle key={`dot-${i}`} cx={pointX} cy={pointY} r="3" fill="currentColor" opacity="0.7" />
    })}
  </svg>
);

const BottomMandala = ({ className = "" }) => (
  <div className={`rotate-180 transform ${className}`}>
    <TopMandala className="w-full h-full" />
  </div>
);



// ── Shared Blurred Background Layer ──
const SectionBackground = ({ image, opacity = 0.4 }) => {
  if (!image) return null;
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 bg-cover bg-center blur-[6px] scale-[1.05]" 
        style={{ 
          backgroundImage: `url(${image})`,
          opacity: opacity
        }} 
      />
      {/* Subtle white/base gradient to help text pop */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/20" />
    </div>
  );
};

export default function LayoutTen({ config, labels = {}, birthdayData = null, generalData = null }) {
  // Use admin panel theme setting
  const themeId = config.themeId || config.theme || 'gold';
  const theme = PRESET_THEMES.find(t => t.id === themeId)?.colors || config.theme || PRESET_THEMES[0].colors;

  const currentLayout = config?.heroLayout || 10;
  const dynamicSettings = config?.layoutSettings?.[`layout_${currentLayout}`] || {};
  const galleryTitle = dynamicSettings.galleryTitle || 'Photo Gallery';
  const gallerySubtitle = dynamicSettings.gallerySubtitle || 'Captured Moments';

  // Full-section image overrides — an empty value keeps the original section.
  const replaced = {
    story: getSectionReplacement(config, 'story'),
    timeline: getSectionReplacement(config, 'timeline'),
    events: getSectionReplacement(config, 'events'),
    guestCard: getSectionReplacement(config, 'guestCard'),
    footer: getSectionReplacement(config, 'footer'),
  };

  let hDay = '', hMonth = '', hDate = '', hYear = '', hTime = '';
  if (config?.wedding?.dateTimeISO) {
    const d = new Date(config.wedding.dateTimeISO);
    if (!isNaN(d.getTime())) {
      hDay = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      hMonth = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      hDate = d.getDate().toString();
      hYear = d.getFullYear().toString();
      hTime = 'AT ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toUpperCase();
    }
  }



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative min-h-screen font-serif"
      style={{ backgroundColor: theme.colorBg, color: theme.colorTextDark }}
    >


      {/* //  no need clode button */}

      {/* ── HERO SECTION ── */}
      <section 
        className="relative min-h-screen w-full flex flex-col items-center justify-center py-12 md:py-24 px-4 overflow-hidden z-20" 
        style={{ backgroundColor: theme.colorBg }}
      >
        <SectionBackground image={config.sectionBackgrounds?.hero} opacity={0.3} />
        
        {/* The White Card Container */}
        <div className="relative w-full max-w-[850px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.08)] rounded-[40px] overflow-hidden flex flex-col items-center justify-start pb-20 z-10 border border-[rgba(0,0,0,0.02)]">
            
            {/* Hero Background - 3:4 Aspect Ratio relative container */}
            {config?.heroImage && (
                <div className="relative w-full aspect-[3/4] z-0 overflow-hidden">
                   {/* Sharp Layer (Top) */}
                   <div className="absolute inset-0 z-0" style={{ maskImage: 'linear-gradient(to bottom, black 0%, transparent 65%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 65%)' }}>
                      <Image src={config.heroImage || '/images/placeholder.png'} fill priority sizes="(max-width: 850px) 100vw, 850px" className="object-cover object-top" alt="Hero Background Sharp" />
                   </div>
                   {/* Blurred Layer (Bottom) */}
                   <div className="absolute inset-0 z-[1]" style={{ maskImage: 'linear-gradient(to top, black 0%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 90%)' }}>
                      <Image src={config.heroImage || '/images/placeholder.png'} fill sizes="(max-width: 850px) 100vw, 850px" className="object-cover object-top blur-[10px] scale-105" alt="Hero Background Blurred" />
                   </div>
                   {/* Fade to White at bottom */}
                   <div className="absolute inset-0 z-[2] bg-gradient-to-b from-transparent via-white/10 to-white" />
                </div>
            )}

             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] pointer-events-none z-30 opacity-40" style={{ color: theme.colorPrimary }}>
                <TopMandala className="w-full" />
             </div>

            <div className="relative z-20 flex-1 flex flex-col items-center justify-start px-4 w-full">






          {/* Content Over Background - Overlapping the blurred bottom */}
          <div className="mt-[-25%] md:mt-[-15%] text-center max-w-2xl mx-auto w-full z-20 px-4">
            
            <h1 className="flex flex-col items-center justify-center text-[3.5rem] md:text-[5.5rem] leading-[0.9] font-serif uppercase tracking-[0.2em] mb-12 drop-shadow-md" style={{ color: theme.colorTextDark }}>
              {birthdayData?.celebrantName || generalData?.eventTitle || generalData?.hostName
                ? <span>{birthdayData?.celebrantName || generalData?.eventTitle || generalData?.hostName}</span>
                : <>
                    <span>{config?.couple?.groom?.firstName || 'Groom'}</span>
                    <span className="text-2xl md:text-3xl font-sans font-light opacity-50 my-1">&</span>
                    <span>{config?.couple?.bride?.firstName || 'Bride'}</span>
                  </>
              }
            </h1>

            {/* Date Banner Now Below Names */}
            <div className="flex items-center justify-center gap-6 md:gap-10 mb-12 z-30 opacity-90 scale-90 md:scale-100" style={{ color: theme.colorTextDark }}>
                <span className="font-sans text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold opacity-60">{hDay}</span>
                <div className="bg-white/80 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-xl flex flex-col items-center justify-center p-4 md:p-5 min-w-[70px] md:min-w-[90px] border border-black/5">
                    <span className="font-sans text-[8px] md:text-[9px] uppercase font-bold tracking-[0.2em] mb-1" style={{ color: theme.colorPrimary }}>{hMonth}</span>
                    <span className="text-3xl md:text-4xl font-serif leading-none">{hDate}</span>
                    <span className="font-sans text-[8px] md:text-[9px] uppercase tracking-[0.2em] mt-1 font-bold opacity-60">{hYear}</span>
                </div>
                <span className="font-sans text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold opacity-60">{hTime}</span>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8 w-[80%] mx-auto" style={{ color: theme.colorTextLight }}>
              <div className="flex-1 h-[1px] bg-current opacity-30" />
              <span className="font-sans text-[8px] md:text-[10px] tracking-[0.4em] uppercase font-bold opacity-80">The Celebration Of</span>
              <div className="flex-1 h-[1px] bg-current opacity-30" />
            </div>

            <p className="font-serif italic text-xl md:text-2xl opacity-90 mx-auto max-w-[450px] leading-relaxed" style={{ color: theme.colorTextLight }}>
              {labels.heroFamiliesLine || 'Together with their families invite you to their wedding'}
            </p>
          </div>
        </div>
        {/* Global Bottom Mandala moved to absolute card bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] pointer-events-none z-30 opacity-40" style={{ color: theme.colorPrimary }}>
            <BottomMandala className="w-full" />
        </div>
      </div>
    </section>

      <LayoutTenCountdown config={config} theme={theme} labels={labels} dynamicSettings={dynamicSettings} />

      {replaced.story ? (
        <SectionReplacement id="story" src={replaced.story} />
      ) : (config?.story?.invitationText?.trim() || (config?.story?.paragraphs && config.story.paragraphs.some(p => p?.trim()))) && (
      <section
        className="py-16 px-6 text-center relative overflow-visible" 
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 md:w-96 z-40 opacity-40 pointer-events-none" style={{ color: theme.colorPrimary }}>
           <TopMandala className="w-full" />
        </div>
        <SectionBackground image={config.sectionBackgrounds?.story || config.story?.bgImage} opacity={0.4} />
        <div className="max-w-3xl mx-auto relative p-12 md:p-16 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)]" style={{ backgroundColor: theme.colorSurface }}>
          <span className="font-sans text-[10px] uppercase tracking-[0.5em] font-bold block mb-12" style={{ color: theme.colorPrimary }}>{labels.storySection || 'Our Story'}</span>

          <div className="absolute top-8 left-4 md:left-8 text-[120px] leading-none font-serif opacity-10" style={{ color: theme.colorTextDark }}>&ldquo;</div>
          <p className="text-2xl md:text-3xl italic leading-relaxed px-6 relative z-10 drop-shadow-sm" style={{ color: theme.colorTextDark }}>
            {config?.story?.invitationText}
          </p>
          <div className="absolute bottom-[20%] right-4 md:right-8 text-[120px] leading-none font-serif opacity-10" style={{ color: theme.colorTextDark }}>&rdquo;</div>

          <div className="w-16 h-[2px] mx-auto my-12 opacity-50 rounded-full" style={{ backgroundColor: theme.colorPrimary }} />

          {config?.story?.paragraphs && config.story.paragraphs.length > 0 && (
            <div className="space-y-6 text-center max-w-2xl mx-auto px-4 mt-8">
              {config.story.paragraphs.map((p, i) => (
                <p key={i} className="font-sans text-sm tracking-wide leading-relaxed opacity-80" style={{ color: theme.colorTextLight }}>{p}</p>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {config?.gallery && config.gallery.length > 0 && (
        <section 
          className="py-16 px-6 relative overflow-visible" 
          style={{ backgroundColor: 'transparent' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 md:w-96 z-40 opacity-40 pointer-events-none" style={{ color: theme.colorPrimary }}>
             <TopMandala className="w-full" />
          </div>
          <SectionBackground image={config.sectionBackgrounds?.gallery || config.galleryConfig?.bgImage} opacity={0.4} />
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-sans text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: theme.colorPrimary }}>{gallerySubtitle}</span>
              <h2 className="text-4xl md:text-5xl italic mt-6 drop-shadow-sm" style={{ color: theme.colorPrimary }}>{galleryTitle}</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {config.gallery.map((img, idx) => (
                <div key={idx} className="w-[calc(50%-0.5rem)] md:w-[calc(25%-1.2rem)] max-w-[280px] aspect-[4/5] relative overflow-hidden group rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.2)] border cursor-default" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                  <Image
                    src={typeof img === 'string' ? img : (img.src || img.url)}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                    alt={`Gallery capture ${idx + 1}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t to-transparent opacity-90 translate-y-8 group-hover:translate-y-0 transition-transform duration-500" style={{ '--tw-gradient-from': theme.colorBg }} />
                  <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex justify-center">
                    <Heart size={20} fill="currentColor" style={{ color: theme.colorPrimary }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EVENTS SECTION (Replaces Dummy Timeline) ── */}
      {replaced.events ? (
        <SectionReplacement id="events" src={replaced.events} />
      ) : (
      <section
        className="py-16 px-6 relative overflow-visible"
        style={{ backgroundColor: 'transparent' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 md:w-96 z-40 opacity-40 pointer-events-none" style={{ color: theme.colorPrimary }}>
           <TopMandala className="w-full" />
        </div>
        <SectionBackground image={config.sectionBackgrounds?.events || config.timelineConfig?.bgImage} opacity={0.4} />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          {config?.events?.ceremony?.image ? (
              <div className="w-full h-64 md:h-80 relative overflow-hidden mb-16 md:mb-24 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] isolate">
                <div className="absolute inset-0"><Image src={config.events?.ceremony?.image || '/images/placeholder.png'} fill sizes="(max-width: 1152px) 100vw, 1152px" alt="Banner" className="object-cover" /></div>
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-2">
                  <p className="font-sans text-[0.7rem] md:text-[10px] tracking-[0.4em] uppercase font-bold drop-shadow-md mb-2" style={{ color: theme.colorTextDark }}>Mark Your Calendar</p>
                  <h2 className="font-serif text-5xl md:text-7xl font-normal drop-shadow-lg tracking-wide" style={{ color: theme.colorBg }}>Event Details</h2>
                </div>
              </div>
          ) : (
             <div className="mb-20">
               <span className="font-sans text-[10px] uppercase tracking-[0.5em] font-bold block mb-4" style={{ color: theme.colorPrimary }}>The Celebration</span>
               <h2 className="text-4xl md:text-5xl italic drop-shadow-sm" style={{ color: theme.colorPrimary }}>Event Details</h2>
             </div>
          )}

          <div className={`flex flex-wrap justify-center gap-8 ${[...Object.values(config?.events || {}), ...(config?.extraEvents || [])].length === 0 ? 'hidden' : ''}`}>
            {[...Object.values(config?.events || {}), ...(config?.extraEvents || [])].map((event, idx) => {
              const handleAddToCalendar = () => {
                const title = encodeURIComponent(`${config?.couple?.bride?.firstName || 'Wedding'}'s ${event?.title || 'Event'}`);
                const details = encodeURIComponent(`We would love to see you at our ${event?.title || 'Event'}! \n\nVenue: ${event?.venueName || ''}\nAddress: ${event?.address || ''}`);
                const location = encodeURIComponent(event?.address || event?.venueName || '');
                const dateStr = config?.wedding?.dateTimeISO || '';
                const start = dateStr.replace(/[-:]/g, '').split('.')[0] || '';
                const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${start}`;
                window.open(googleUrl, '_blank');
              };

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  viewport={{ once: true }}
                  className="w-full max-w-sm md:max-w-md bg-white p-2 shadow-[0_45px_100px_rgba(0,0,0,0.12)] rounded-[3rem] transition-transform hover:scale-[1.01]"
                >
                  <div className="w-full h-full border-2 flex flex-col items-center justify-between p-10 relative overflow-hidden rounded-[2.8rem] backdrop-blur-sm" style={{ borderColor: `${theme.colorPrimary}20` }}>
                      {/* Decorative corner mandala */}
                      <div className="absolute top-[-20%] left-[-20%] w-32 h-32 opacity-10 pointer-events-none" style={{ color: theme.colorPrimary }}>
                        <div className="rotate-45 scale-150"><TopMandala /></div>
                      </div>
                      {/* Decorative corner pieces optional */}
                      <span className="text-4xl mb-6 block opacity-80 drop-shadow-sm" style={{ color: theme.colorPrimary }}>✧</span>
                      <h3 className="font-serif text-3xl md:text-4xl mb-4 drop-shadow-sm text-center" style={{ color: theme.colorTextDark }}>{event.title}</h3>
                      
                      <div className="w-12 h-[1px] mx-auto mb-6 opacity-30" style={{ backgroundColor: theme.colorPrimary }} />
                      
                      <p className="font-sans text-[10px] md:text-xs tracking-[0.3em] font-bold mb-6 italic" style={{ color: theme.colorPrimary }}>
                        {event.time || (config?.wedding?.displayDate ? config.wedding.displayDate : '')}
                      </p>

                      <div className="space-y-2 mb-10 text-center flex-1">
                        <p className="font-serif text-xl leading-snug font-bold" style={{ color: theme.colorTextDark }}>{event.venueName}</p>
                        <p className="font-sans text-[10px] uppercase tracking-[0.2em] opacity-60 leading-relaxed max-w-[200px] mx-auto" style={{ color: theme.colorTextDark }}>{event.address}</p>
                        {event.dressCode && event.dressCode !== 'none' && (
                          <div className="mt-6 flex items-center justify-center">
                            <span className="font-serif text-[11px] italic" style={{ color: theme.colorTextDark }}>Dress Code: {event.dressCode}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-row w-full gap-2 mt-auto">
                        <a
                          href={event.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-sans text-[8px] md:text-[9px] font-bold tracking-[0.2rem] uppercase transition-all rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:translate-y-[-2px]"
                          style={{ backgroundColor: theme.colorTextDark, color: theme.colorBg }}
                        >
                          Google Maps
                        </a>
                        <button
                          onClick={handleAddToCalendar}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 font-sans text-[8px] md:text-[9px] font-bold tracking-[0.2rem] uppercase border-2 transition-all rounded-full hover:bg-slate-50 hover:translate-y-[-2px]"
                          style={{ borderColor: theme.colorTextDark, color: theme.colorTextDark, backgroundColor: 'transparent' }}
                        >
                          Add Event
                        </button>
                      </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ── TIMELINE SECTION (only when admin has added items) ── */}
      {replaced.timeline ? (
        <SectionReplacement id="timeline" src={replaced.timeline} />
      ) : Array.isArray(config.timeline) && config.timeline.length > 0 && (
        <section
          className="py-20 md:py-32 relative overflow-hidden"
          style={{ backgroundColor: theme.colorBg || '#FAF7F2' }}
        >
          {/* Corner blur decor */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ backgroundColor: `${theme.colorPrimary}0d` }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" style={{ backgroundColor: `${theme.colorPrimary}0d` }} />

          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 md:mb-24">
              <span
                className="text-[0.7rem] uppercase tracking-[0.4em] mb-3 block font-bold"
                style={{ color: theme.colorPrimary }}
              >
                Schedule
              </span>
              <h2
                className="font-serif text-4xl md:text-5xl mb-4"
                style={{ color: theme.colorTextDark }}
              >
                Timeline of the event
              </h2>
              <div className="h-1 w-[60px] mx-auto rounded-full" style={{ backgroundColor: `${theme.colorPrimary}4d` }} />
            </div>

            <div className="relative">
              {/* Gradient vertical line */}
              <div
                className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
                style={{ background: `linear-gradient(to bottom, transparent, ${theme.colorPrimary}4d, transparent)` }}
              />

              <div className="space-y-12 md:space-y-24">
                {config.timeline.map((item, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.8, delay: idx * 0.15 }}
                      className={`relative flex items-center justify-start md:justify-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                    >
                      {/* Content Card */}
                      <div className={`w-full md:w-[45%] pl-12 md:pl-0 ${isEven ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}`}>
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-50 transition-transform hover:scale-[1.02]">
                          <span
                            className="font-sans text-[0.65rem] font-black uppercase tracking-[0.2em] mb-2 block"
                            style={{ color: theme.colorPrimary }}
                          >
                            {item.time}
                          </span>
                          <h3
                            className="font-serif text-2xl mb-2"
                            style={{ color: theme.colorTextDark }}
                          >
                            {item.title}
                          </h3>
                          {(item.description || item.desc) && (
                            <p
                              className="font-serif italic text-sm leading-relaxed"
                              style={{ color: `${theme.colorTextDark}99` }}
                            >
                              {item.description || item.desc}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Icon Node */}
                      <div className="absolute left-4 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-20">
                        <div
                          className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-xl border-4"
                          style={{
                            backgroundColor: theme.colorSurface || '#ffffff',
                            borderColor: theme.colorBg || '#FAF7F2',
                            color: theme.colorPrimary,
                          }}
                        >
                          {item.icon || '✨'}
                        </div>
                      </div>

                      {/* Desktop spacer */}
                      <div className="hidden md:block w-[45%]" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── GUEST INVITATION CARD ── */}
      {replaced.guestCard ? (
        <SectionReplacement sectionKey="guestCard" src={replaced.guestCard} />
      ) : (
      <div className="my-12">
        <GuestInvitationCard config={config} eventType={config?.eventType} />
      </div>
      )}

      {/* ── UNIVERSAL RSVP SECTION ── */}
      <RSVPSection config={config} labels={labels} />

      {/* ── FOOTER ── */}
      {replaced.footer ? (
        <SectionReplacement sectionKey="footer" src={replaced.footer} />
      ) : (
      <section
        className="pt-16 pb-16 text-center relative overflow-visible"
        style={{
          backgroundColor: theme.colorTextDark
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 md:w-96 z-40 opacity-40 pointer-events-none" style={{ color: theme.colorPrimary }}>
           <TopMandala className="w-full" />
        </div>
        <SectionBackground image={config.sectionBackgrounds?.footer} opacity={0.25} />
        <div className="absolute bottom-0 left-0 w-full pointer-events-none -translate-y-[20%] md:-translate-y-[45%] opacity-10 z-0" style={{ color: theme.colorBg }}>
          <TopMandala className="w-full max-w-[1200px] mx-auto" />
        </div>
        <div className="relative z-10 px-6">
          <h2 className="font-script text-5xl mb-4 drop-shadow-md" style={{ color: theme.colorPrimary }}>
            {birthdayData?.celebrantName || generalData?.eventTitle || generalData?.hostName
              || config?.couple?.displayNames
              || ((config?.couple?.bride?.firstName && config?.couple?.groom?.firstName)
                  ? `${config?.couple?.bride?.firstName} & ${config?.couple?.groom?.firstName}`
                  : '')}
          </h2>
          <p className="font-serif text-sm tracking-[0.3em] uppercase mb-10" style={{ color: theme.colorBg, opacity: 0.8 }}>
            {config?.wedding?.displayDate || config?.wedding?.date || ''}
          </p>

          <div className="w-12 h-[1px] mx-auto mb-10" style={{ backgroundColor: theme.colorPrimary, opacity: 0.3 }} />

          <p className="font-sans text-[9px] md:text-[10px] tracking-[0.4em] uppercase font-bold" style={{ color: theme.colorBg, opacity: 0.4 }}>
            Handcrafted with Love — KodeXlk +94 75 013 3608
          </p>
        </div>
      </section>
      )}
    </motion.div>
  );
}

function LayoutTenCountdown({ config, theme, labels, dynamicSettings }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!config?.wedding?.dateTimeISO) return;
    const targetDate = new Date(config.wedding.dateTimeISO).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [config?.wedding?.dateTimeISO]);

  if (!timeLeft) return null;

  return (
    <section 
      className="py-20 px-6 relative overflow-visible" 
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl italic mb-16 drop-shadow-sm" style={{ color: theme.colorPrimary }}>{labels.countdownHeading || labels.countdownLabel || 'The Celebration Begins In'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours.toString().padStart(2, '0') },
            { label: 'Minutes', value: timeLeft.minutes.toString().padStart(2, '0') },
            { label: 'Seconds', value: timeLeft.seconds.toString().padStart(2, '0') }
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 md:p-10 relative overflow-hidden group shadow-[0_20px_40px_rgba(0,0,0,0.15)] rounded-3xl"
              style={{ backgroundColor: theme.colorSurface }}
            >
              <div className="absolute inset-0 opacity-10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" style={{ backgroundColor: theme.colorPrimary }} />
              <span className="relative z-10 block text-4xl md:text-6xl mb-3 font-medium drop-shadow-sm" style={{ color: theme.colorTextDark }}>
                {item.value}
              </span>
              <span className="relative z-10 font-sans text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: theme.colorPrimary }}>{item.label}</span>
            </motion.div>
          ))}
        </div>

        {dynamicSettings.countdownExtraText && (
          <p className="mt-12 text-center italic text-sm tracking-widest opacity-80 drop-shadow-sm" style={{ color: theme.colorPrimary }}>
            {dynamicSettings.countdownExtraText}
          </p>
        )}
      </div>
    </section>
  );
}
