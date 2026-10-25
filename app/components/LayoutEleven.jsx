'use client';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Calendar, MapPin, Music, Coffee, Clock, Check, ChevronDown,
  ArrowRight, Mail, Phone, ExternalLink, Plane, Navigation, Info, Users
} from 'lucide-react';
import { PRESET_THEMES } from '../../lib/themes';
import { getDietaryTitle, getDietaryItems, getInitialDietary, buildDietaryString } from '../../lib/dietary';

import RSVPSection from './RSVPSection';
import GuestInvitationCard from './GuestInvitationCard';
import SectionReplacement, { getSectionReplacement } from './SectionReplacement';

// ── Main Page Layout Component ──
// Layout 11 is identical to Layout 8 except the hero section shows
// two admin-editable lines focused on the event location.
export default function LayoutEleven({ config, labels = {}, birthdayData = null, generalData = null }) {
  const themeId = config.themeId || config.theme || 'gold';
  const theme = PRESET_THEMES.find(t => t.id === themeId)?.colors || config.theme || PRESET_THEMES[0].colors;
  const displayName = birthdayData?.celebrantName
    ? birthdayData.celebrantName
    : (generalData?.eventTitle || generalData?.hostName)
      ? (generalData.eventTitle || generalData.hostName)
      : null;

  const dietaryItems = getDietaryItems(config);
  const dietaryTitle = getDietaryTitle(config);

  const defaultRsvpFields = [
    { id: "guestName", type: "text", label: "Guest Name", placeholder: "Enter your full name", required: true },
    { id: "attending", type: "button-group", label: "Attending?", options: "Joyfully Accept,Regretfully Decline", required: true },
    { id: "guestCount", type: "guest-count", label: "Guest Count", placeholder: "1", required: true },
    { id: "menu", type: "checkbox-group", label: "Menu Choice", options: "Chicken,Fish,Vegetarian", required: false },
    { id: "message", type: "textarea", label: "Message to the Couple", placeholder: "Write your wishes here...", required: false }
  ];

  const currentLayout = config?.heroLayout || 11;
  const layoutSettings = config?.layoutSettings?.[`layout_${currentLayout}`] || {};
  const layoutSpecificFields = layoutSettings?.rsvpFields;
  const globalFields = config?.rsvp?.fields;

  const galleryTitle = layoutSettings.galleryTitle || labels.layout8GalleryLabel || 'Love In Frames';
  const gallerySubtitle = layoutSettings.gallerySubtitle || 'Captured Moments';

  // Full-section image overrides — an empty value keeps the original section.
  const replaced = {
    story: getSectionReplacement(config, 'story'),
    timeline: getSectionReplacement(config, 'timeline'),
    events: getSectionReplacement(config, 'events'),
    guestCard: getSectionReplacement(config, 'guestCard'),
    footer: getSectionReplacement(config, 'footer'),
  };

  const fieldsToRender = (layoutSpecificFields && layoutSpecificFields.length > 0) 
    ? layoutSpecificFields 
    : (globalFields && globalFields.length > 0) 
      ? globalFields 
      : defaultRsvpFields;

  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [rsvpStatus, setRsvpStatus] = useState('idle');


  // RSVP Submission
  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setRsvpStatus('loading');

    let isValid = true;
    const newErrors = {};
    fieldsToRender.forEach(field => {
      if (field.required && !formData[field.id]?.toString().trim()) {
        newErrors[field.id] = 'This field is required.';
        isValid = false;
      }
    });
    setErrors(newErrors);
    if (!isValid) {
      setRsvpStatus('idle');
      return;
    }

    const fieldsText = fieldsToRender.map(field => {
      return `*${field.label}:* ${formData[field.id] || 'Not provided'}`;
    }).join('\n');

    const waMessage = `${labels.rsvpMessageHeader || '💍 *Wedding Invitation Reply* 💍'}\n\n${fieldsText}`;

    const cleanNumber = config?.rsvp?.whatsappNumber?.replace(/[+\s-]/g, '') || '';
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(waMessage)}`, '_blank');
    setRsvpStatus('success');
  };

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: theme.colorBg || '#fdfaf5',
        color: theme.colorTextDark || '#1e293b'
      }}
    >
      {/* ── HERO SECTION: Location Focus ── */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Ken Burns Background */}
        <div className="absolute inset-0 z-0">
          {config?.heroVideo ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              preload="metadata"
              onError={(e) => {
                console.warn('Hero video failed to load:', e);
                e.target.style.display = 'none';
              }}
            >
              <source src={config.heroVideo} type="video/mp4" />
              <source src={config.heroVideo.replace('.mp4', '.webm')} type="video/webm" />
            </video>
          ) : (
            <motion.div
              animate={{
                scale: [1.1, 1.25, 1.1],
                x: [0, -20, 0],
                y: [0, -10, 0]
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="relative w-full h-full"
            >
              <Image
                src={config?.heroImage || '/images/placeholder.png'}
                fill
                priority
                sizes="100vw"
                className="object-cover"
                alt="Hero"
              />
            </motion.div>
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.1), ${theme.colorBg || '#fdfaf5'})`
            }}
          />
        </div>

        {/* ── Hero Content: two admin-editable lines ── */}
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.2 }}
          >
            {/* Couple names */}
            <h1 className="font-serif text-[clamp(48px,10vw,120px)] leading-tight text-white drop-shadow-2xl italic px-2 mb-2" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 6px 32px rgba(0,0,0,0.7)' }}>
              {displayName
                ? displayName
                : (
                  <>
                    <span className="block md:inline">{config?.couple?.bride?.firstName || ''}</span>
                    <span className="font-sans text-2xl md:text-5xl not-italic block md:inline mx-2">&</span>
                    <span className="block md:inline">{config?.couple?.groom?.firstName || ''}</span>
                  </>
                )
              }
            </h1>

            <div className="w-16 h-px bg-white/40 mx-auto my-8" />

            {/* Small text — Hero Small Text label */}
            <p className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.5em] text-white/70 mb-4 drop-shadow-md" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)' }}>
              {labels.layout11HeroSmall}
            </p>

            {/* Big text — Hero Big Text label */}
            <p className="font-serif text-[clamp(22px,4vw,52px)] leading-snug text-white/95 drop-shadow-xl italic px-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 4px 24px rgba(0,0,0,0.7)' }}>
              {labels.layout11HeroBig}
            </p>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 animate-bounce cursor-pointer">
          <ChevronDown size={32} strokeWidth={1} />
        </div>
      </section>

      {/* ── COUNTDOWN SECTION ── */}
      <LayoutElevenCountdown config={config} theme={theme} labels={labels} layoutSettings={layoutSettings} />

      {/* ── STORY SECTION ── */}
      {replaced.story ? (
        <SectionReplacement id="story" src={replaced.story} />
      ) : config?.story?.invitationText?.trim() && (
        <section
          className="px-6 py-24 md:py-40 relative overflow-hidden"
          style={{ backgroundColor: `${theme.colorSurface || '#ffffff'}80` }}
        >
          {config.sectionBackgrounds?.story && (
            <div
              className="absolute inset-0 pointer-events-none z-0"
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
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <span
                className="font-sans text-[10px] font-black uppercase tracking-[0.4em]"
                style={{ color: theme.colorPrimary || '#C9956A' }}
              >
                {labels.storySection || 'Our Story'}
              </span>
              <h2
                className="font-serif text-4xl md:text-6xl tracking-tight leading-none italic"
                style={{ color: theme.colorTextDark || '#1e293b' }}
              >
                {labels.layout8EternalLabel || 'Eternal Love'}
              </h2>
            </div>
            <div className="relative px-8 md:px-16">
              <div
                className="absolute -top-6 -left-0 text-7xl font-serif opacity-10"
                style={{ color: theme.colorPrimary || '#C9956A' }}
              >
                "
              </div>
              <p
                className="font-serif text-xl md:text-2xl leading-relaxed italic"
                style={{ color: theme.colorTextLight || '#4A5568' }}
              >
                {config?.story?.invitationText}
              </p>
              <div
                className="absolute -bottom-12 -right-0 text-7xl font-serif opacity-10"
                style={{ color: theme.colorPrimary || '#C9956A' }}
              >
                "
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TIMELINE ── */}
      {replaced.timeline ? (
        <SectionReplacement id="timeline" src={replaced.timeline} />
      ) : Array.isArray(config.timeline) && config.timeline.length > 0 && (
        <section
          className="py-20 md:py-32 relative overflow-hidden"
          style={{ backgroundColor: theme.colorBg || '#FAF7F2' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ backgroundColor: `${theme.colorPrimary}0d` }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" style={{ backgroundColor: `${theme.colorPrimary}0d` }} />

          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 md:mb-24">
              <span
                className="text-[0.7rem] uppercase tracking-[0.4em] mb-3 block font-bold"
                style={{ color: theme.colorPrimary }}
              >
                {labels.timelineEyebrow || 'Programme du jour'}
              </span>
              <h2
                className="font-serif text-4xl md:text-5xl mb-4"
                style={{ color: theme.colorTextDark }}
              >
                {labels.timelineHeading || 'Wedding Timeline'}
              </h2>
              <div className="h-1 w-[60px] mx-auto rounded-full" style={{ backgroundColor: `${theme.colorPrimary}4d` }} />
            </div>

            <div className="relative">
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
                      <div className="hidden md:block w-[45%]" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── GALLERY ── */}
      {config?.gallery && config.gallery.length > 0 && (
        <section
          className="px-6 py-24 md:py-32 relative overflow-hidden"
          style={{ backgroundColor: theme.colorBg || '#fdfaf5' }}
        >
          {config.sectionBackgrounds?.gallery && (
            <div
              className="absolute inset-0 pointer-events-none z-0"
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
          <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center">
            <div className="text-center mb-16 space-y-4">
              <span
                className="font-sans text-[10px] font-bold uppercase tracking-[0.4em]"
                style={{ color: theme.colorTextLight || '#4A5568' }}
              >
                {gallerySubtitle}
              </span>
              <h2
                className="font-serif text-4xl md:text-5xl italic"
                style={{ color: theme.colorTextDark || '#1e293b' }}
              >
                {galleryTitle}
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 w-full px-2">
              {config.gallery.map((photo, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.8, delay: (idx % 5) * 0.1 }}
                  className="group relative overflow-hidden rounded-xl md:rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-700 border-2 md:border-4 border-white cursor-default w-[calc(50%-4px)] md:w-[calc(20%-13px)]"
                  style={{ aspectRatio: '1/1' }}
                >
                  <Image
                    src={photo.src}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    alt={photo.alt || 'Gallery photo'}
                    className="object-cover object-center transition-transform duration-1000 group-hover:scale-[1.05]"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MAP & LOCATION ── */}
      {replaced.events ? (
        <SectionReplacement id="events" src={replaced.events} />
      ) : (
      <section
        className="px-6 py-24 md:py-32 relative overflow-hidden"
        style={{ backgroundColor: theme.colorSurface || '#ffffff' }}
      >
        {config.sectionBackgrounds?.events && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
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
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
          <div className="space-y-3 mb-14">
            <span
              className="font-sans text-[10px] font-black uppercase tracking-[0.4em]"
              style={{ color: theme.colorPrimary || '#C9956A' }}
            >
              Join Us At
            </span>
            <h2
              className="font-serif text-4xl md:text-5xl leading-tight italic"
              style={{ color: theme.colorTextDark || '#1e293b' }}
            >
              When & Where
            </h2>
          </div>
          <div className="flex flex-wrap justify-center gap-8 w-full">
            {[...Object.values(config?.events || {}), ...(config?.extraEvents || [])].map((event, idx) => {
              const handleAddToCalendar = () => {
                const title = encodeURIComponent(`${config?.couple?.displayNames || 'Wedding'}'s ${event?.title || 'Event'}`);
                const details = encodeURIComponent(`We would love to see you!\n\nVenue: ${event?.venueName || ''}\nAddress: ${event?.address || ''}`);
                const location = encodeURIComponent(event?.address || event?.venueName || '');
                const dateStr = config?.wedding?.dateTimeISO || '';
                const start = dateStr.replace(/[-:]/g, '').split('.')[0] || '';
                window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${start}`, '_blank');
              };
              return (
                <div key={idx} className="flex flex-col items-center gap-6 p-8 rounded-2xl w-full max-w-sm" style={{ backgroundColor: theme.colorBg || '#fdfaf5' }}>
                  <div
                    className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: theme.colorSurface || '#ffffff', color: theme.colorPrimary || '#C9956A' }}
                  >
                    <MapPin size={24} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-serif text-xl font-bold" style={{ color: theme.colorTextDark || '#1e293b' }}>{event.title}</h4>
                    {event.time && <p className="font-sans text-xs tracking-widest uppercase" style={{ color: theme.colorPrimary || '#C9956A' }}>{event.time}</p>}
                    <p className="font-serif text-base font-semibold mt-1" style={{ color: theme.colorTextDark || '#1e293b' }}>{event.venueName}</p>
                    <p className="font-sans text-xs uppercase tracking-widest mt-0.5" style={{ color: theme.colorTextLight || '#4A5568' }}>{event.address}</p>
                    {event.dressCode && event.dressCode !== 'none' && (
                      <p className="font-serif italic text-xs mt-1" style={{ color: theme.colorTextLight || '#4A5568' }}>Dress Code: {event.dressCode}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    {event.mapsUrl && (
                      <button
                        onClick={() => window.open(event.mapsUrl, '_blank')}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-white font-sans text-[10px] font-bold uppercase tracking-widest transition-all duration-500 shadow-md rounded-xl"
                        style={{ backgroundColor: theme.colorTextDark || '#1e293b' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colorPrimary || '#C9956A'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.colorTextDark || '#1e293b'}
                      >
                        <Navigation size={13} /> Maps
                      </button>
                    )}
                    <button
                      onClick={handleAddToCalendar}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border font-sans text-[10px] font-bold uppercase tracking-widest transition-all duration-500 rounded-xl"
                      style={{ borderColor: theme.colorSecondary || '#f9f6f1', color: theme.colorTextLight || '#4A5568' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = theme.colorPrimary || '#C9956A'; e.currentTarget.style.color = theme.colorPrimary || '#C9956A'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = theme.colorSecondary || '#f9f6f1'; e.currentTarget.style.color = theme.colorTextLight || '#4A5568'; }}
                    >
                      <Calendar size={13} /> Calendar
                    </button>
                  </div>
                </div>
              );
            })}
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

      {/* ── RSVP SECTION ── */}
      <section
        className="px-6 py-24 md:py-40 relative overflow-hidden"
        style={{ backgroundColor: theme.colorBg || '#fdfaf5' }}
      >
        {config.sectionBackgrounds?.rsvp && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url(${config.sectionBackgrounds.rsvp})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(2px)',
              transform: 'scale(1.02)',
              opacity: 0.85
            }}
          />
        )}
        <div
          className="relative z-10 max-w-2xl mx-auto p-10 md:p-20 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.04)] border text-center"
          style={{ backgroundColor: theme.colorSurface || '#ffffff', borderColor: theme.colorSecondary || '#f9f6f1' }}
        >
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 border rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: theme.colorBg || '#fdfaf5', borderColor: theme.colorSecondary || '#f9f6f1' }}
          >
            <Mail size={32} strokeWidth={1} style={{ color: theme.colorPrimary || '#C9956A' }} />
          </div>

          <div className="space-y-6 mb-12">
            <h2
              className="font-serif text-4xl md:text-5xl leading-tight italic"
              style={{ color: theme.colorTextDark || '#1e293b' }}
            >
              Please Confirm
            </h2>
            <p
              className="font-sans text-[10px] font-black uppercase tracking-[0.4em]"
              style={{ color: theme.colorTextLight || '#4A5568' }}
            >
              Kindly Reply by {config?.rsvp?.deadline || ''}
            </p>
            <div className="w-12 h-px mx-auto opacity-30" style={{ backgroundColor: theme.colorPrimary || '#C9956A' }} />
          </div>

          {rsvpStatus === 'success' ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={32} className="text-green-500" />
              </div>
              <h3 className="font-serif text-2xl italic">Thank You!</h3>
              <p className="font-serif text-lg text-slate-500">Your reply has been sent via WhatsApp. We can&apos;t wait to see you!</p>
            </motion.div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-8">
              <div className="space-y-8 text-left">
                {fieldsToRender.map((field, idx) => {
                  const isAttending = formData.attending && (formData.attending.toLowerCase().includes('accept') || formData.attending.toLowerCase().includes('yes') || formData.attending.toLowerCase().includes('attending'));
                  const isAlwaysVisible = field.id === 'guestName' || field.id === 'attending';
                  
                  if (!isAlwaysVisible && !isAttending) return null;

                  return (
                    <div key={field.id || idx} className="flex flex-col">
                      <label className="font-sans text-[10px] font-black uppercase tracking-widest text-[var(--colorTextLight)] mb-2" style={{ color: theme.colorTextLight || '#8A7F6A' }}>
                        {field.label} {field.required && "*"}
                      </label>

                      {field.type === 'textarea' ? (
                        <textarea 
                          required={field.required} 
                          placeholder={field.placeholder} 
                          className="w-full bg-transparent border-b-2 py-4 font-serif text-xl italic outline-none transition-all placeholder:text-slate-300 resize-none" 
                          style={{ borderBottomColor: theme.colorSecondary || '#E8D5B7', color: theme.colorTextDark || '#1e293b' }} 
                          value={formData[field.id] || ''} 
                          onChange={e => setFormData({ ...formData, [field.id]: e.target.value })} 
                          onFocus={e => e.target.style.borderBottomColor = theme.colorPrimary || '#C9956A'}
                          onBlur={e => e.target.style.borderBottomColor = theme.colorSecondary || '#E8D5B7'}
                        />
                      ) : field.type === 'button-group' ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                          {field.options?.split(',').map((opt, i) => {
                            const active = formData[field.id] === opt.trim();
                            return (
                              <label key={i} className="flex-1 p-4 rounded-2xl border transition-all duration-300 flex items-center justify-center cursor-pointer text-center" style={{ backgroundColor: active ? (theme.colorTextDark || '#1e293b') : (theme.colorBg || '#FAF7F2'), borderColor: active ? (theme.colorTextDark || '#1e293b') : (theme.colorSecondary || '#E8D5B7'), transform: active ? 'scale(1.02)' : 'scale(1)' }}>
                                <input type="radio" name={field.id} value={opt.trim()} className="hidden" required={field.required && !formData[field.id]} onChange={e => setFormData({ ...formData, [field.id]: e.target.value })} />
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: active ? (theme.colorSurface || '#ffffff') : (theme.colorTextLight || '#8A7F6A') }}>{opt.trim()}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : field.type === 'checkbox-group' ? (
                        <div className="flex flex-col gap-2">
                          {field.options?.split(',').map((opt, i) => {
                            const isChecked = (formData[field.id] || '').includes(opt.trim());
                            return (
                              <label key={i} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                                <div className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all`} style={{ backgroundColor: isChecked ? (theme.colorPrimary || '#C9956A') : (theme.colorSurface || '#ffffff'), borderColor: isChecked ? (theme.colorPrimary || '#C9956A') : (theme.colorSecondary || '#E8D5B7') }}>
                                  {isChecked && <Check size={12} style={{ color: theme.colorSurface || '#ffffff' }} />}
                                </div>
                                <input type="checkbox" className="hidden" value={opt.trim()} onChange={e => {
                                  let current = formData[field.id] ? formData[field.id].split(', ') : [];
                                  if (e.target.checked) current.push(opt.trim());
                                  else current = current.filter(o => o !== opt.trim());
                                  setFormData({ ...formData, [field.id]: current.join(', ') });
                                }} />
                                <span className="text-sm font-serif italic transition-colors" style={{ color: theme.colorTextLight || '#8A7F6A' }}>{opt.trim()}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : field.type === 'guest-count' ? (
                        <select name={field.id} required={field.required} className="w-full bg-transparent border-b-2 py-4 font-serif text-xl italic outline-none transition-all cursor-pointer appearance-none" style={{ borderBottomColor: theme.colorSecondary || '#E8D5B7', color: theme.colorTextDark || '#1e293b' }} value={formData[field.id] || ''} onChange={e => setFormData({ ...formData, [field.id]: e.target.value })} onFocus={e => e.target.style.borderBottomColor = theme.colorPrimary || '#C9956A'} onBlur={e => e.target.style.borderBottomColor = theme.colorSecondary || '#E8D5B7'}>
                          <option value="">-- Number of Guests --</option>
                          {Array.from({ length: config?.rsvp?.maxGuests || 5 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                          ))}
                        </select>
                      ) : field.type === 'select' ? (
                        <select name={field.id} required={field.required} className="w-full bg-transparent border-b-2 py-4 font-serif text-xl italic outline-none transition-all cursor-pointer appearance-none" style={{ borderBottomColor: theme.colorSecondary || '#E8D5B7', color: theme.colorTextDark || '#1e293b' }} value={formData[field.id] || ''} onChange={e => setFormData({ ...formData, [field.id]: e.target.value })} onFocus={e => e.target.style.borderBottomColor = theme.colorPrimary || '#C9956A'} onBlur={e => e.target.style.borderBottomColor = theme.colorSecondary || '#E8D5B7'}>
                          <option value="">-- Please Select --</option>
                          {field.options?.split(',').map((opt, i) => (
                            <option key={i} value={opt.trim()}>{opt.trim()}</option>
                          ))}
                        </select>
                      ) : (
                        <input type={field.type} name={field.id} required={field.required} placeholder={field.placeholder} className="w-full bg-transparent border-b-2 py-4 font-serif text-xl italic outline-none transition-all placeholder:text-slate-300" style={{ borderBottomColor: theme.colorSecondary || '#E8D5B7', color: theme.colorTextDark || '#1e293b' }} value={formData[field.id] || ''} onChange={e => setFormData({ ...formData, [field.id]: e.target.value })} onFocus={e => e.target.style.borderBottomColor = theme.colorPrimary || '#C9956A'} onBlur={e => e.target.style.borderBottomColor = theme.colorSecondary || '#E8D5B7'} />
                      )}
                      {errors[field.id] && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-widest">{errors[field.id]}</p>}
                    </div>
                  );
                })}

                <button
                  type="submit"
                  disabled={rsvpStatus === 'loading'}
                  className="w-full py-5 text-white font-sans text-xs font-black uppercase tracking-[0.5em] shadow-2xl transition-all duration-500 disabled:opacity-30 rounded-2xl group flex items-center justify-center gap-3"
                  style={{ backgroundColor: theme.colorTextDark || '#1e293b' }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = theme.colorPrimary || '#C9956A'; }}
                  onMouseLeave={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = theme.colorTextDark || '#1e293b'; }}
                >
                  {rsvpStatus === 'loading' ? (
                    <span
                      className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#ffffff' }}
                    />
                  ) : (
                    <>Send Reply <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      {replaced.footer ? (
        <SectionReplacement sectionKey="footer" src={replaced.footer} />
      ) : (
      <section
        className="py-32 text-center border-t relative overflow-hidden"
        style={{ backgroundColor: theme.colorBg || '#FAF7F2', borderTopColor: theme.colorSecondary || '#E8D5B7' }}
      >
        {config.sectionBackgrounds?.footer && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              backgroundImage: `url(${config.sectionBackgrounds.footer})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(10px)',
              transform: 'scale(1.02)',
              opacity: 0.3
            }}
          />
        )}
        <div className="relative z-10 space-y-8 px-6">
          <div className="text-4xl opacity-20" style={{ color: theme.colorPrimary || '#C9956A' }}>❦</div>
          <h2
            className="font-serif text-5xl md:text-7xl italic leading-none opacity-20"
            style={{ color: theme.colorTextDark || '#2C2018' }}
          >
            See you there
          </h2>
          <p
            className="font-sans text-[10px] font-black uppercase tracking-[0.6em]"
            style={{ color: theme.colorTextLight || '#8A7F6A' }}
          >
            {displayName
              ? displayName
              : <>{config?.couple?.bride?.firstName || ''} & {config?.couple?.groom?.firstName || ''}</>
            } • {config?.wedding?.date || ''}
          </p>
          <p
            className="font-sans text-[10px] tracking-[0.4em] uppercase"
            style={{ color: theme.colorTextLight || '#8A7F6A', opacity: 0.5 }}
          >
            Handcrafted with Love — KodeXlk +94 75 013 3608
          </p>
        </div>
      </section>
      )}
    </div>
  );
}

function LayoutElevenCountdown({ config, theme, labels, layoutSettings }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const targetDate = new Date(config?.wedding?.dateTimeISO || config?.wedding?.date || Date.now()).getTime();

    const calculateTimeLeft = () => {
      const difference = targetDate - new Date().getTime();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeout(() => setTimeLeft(calculateTimeLeft()), 0);
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [config?.wedding?.dateTimeISO, config?.wedding?.date]);

  if (!timeLeft) return null;

  return (
    <section
      className="px-6 py-20 md:py-32"
      style={{ backgroundColor: theme.colorSurface || '#ffffff' }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <span
            className="font-sans text-[10px] font-black uppercase tracking-[0.4em]"
            style={{ color: theme.colorPrimary || '#C9956A' }}
          >
            {labels.countdownLabel || 'The Celebration Begins In'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds }
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 md:p-10 rounded-[20px] md:rounded-[32px] border flex flex-col items-center justify-center space-y-2 md:space-y-4 transition-all duration-500 hover:shadow-xl group"
              style={{
                backgroundColor: theme.colorBg || '#fdfaf5',
                borderColor: `${theme.colorPrimary || '#C9956A'}20`
              }}
            >
              <span
                className="font-serif text-4xl md:text-6xl italic leading-none"
                style={{ color: theme.colorTextDark || '#1e293b' }}
              >
                {String(item.value).padStart(2, '0')}
              </span>
              <span
                className="font-sans text-[10px] font-black uppercase tracking-[0.2em] opacity-40"
                style={{ color: theme.colorTextLight || '#4A5568' }}
              >
                {item.label}
              </span>
              <div
                className="absolute inset-0 rounded-[20px] md:rounded-[32px] border-2 border-transparent group-hover:border-opacity-100 transition-all duration-700 pointer-events-none"
                style={{ borderColor: theme.colorPrimary || '#C9956A' }}
              />
            </div>
          ))}
        </div>

        {layoutSettings.countdownExtraText && (
          <p className="mt-12 text-center italic text-sm tracking-widest opacity-80" style={{ color: theme.colorPrimary || '#C9956A' }}>
            {layoutSettings.countdownExtraText}
          </p>
        )}
      </div>
    </section>
  );
}
