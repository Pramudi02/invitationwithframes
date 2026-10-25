'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

function numericDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d)) return '';
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}.${dd}.${yy}`;
}

function dayName(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

const ScrollCue = () => (
  <a
    href="#story"
    aria-label="Scroll"
    className="flex flex-col items-center gap-1 mt-8 mx-auto w-fit"
    style={{ opacity: 0.5, color: 'var(--colorTextDark)' }}
  >
    <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>
      Scroll
    </span>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  </a>
);

const LoadingSpinner = ({ isVisible }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
    transition={{ duration: 1.5, ease: 'easeInOut' }}
    className="fixed inset-0 flex items-center justify-center z-50 bg-white pointer-events-none"
    style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      className="w-12 h-12 border-2 border-transparent rounded-full"
      style={{ borderTopColor: 'var(--colorPrimary)', borderRightColor: 'var(--colorPrimary)' }}
    />
  </motion.div>
);

/* ─────────────────────────────────────────────────────────
   LAYOUT 1 — Rectangular Ornate Frame
───────────────────────────────────────────────────────── */
function Layout1({ config, labels = {}, birthdayData = null, generalData = null }) {
  const { couple = {}, wedding = {}, events = {}, heroImage } = config;
  const ceremony = events?.ceremony || {};
  const dayLabel = dayName(wedding?.dateTimeISO);
  const names = resolveNames(config, birthdayData, generalData);

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 'clamp(320px, 90vw, 540px)',
          minHeight: 'clamp(600px, 80vh, 850px)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.15)',
          backgroundColor: 'var(--colorBg)',
          position: 'relative',
          overflow: 'hidden',
          padding: '16px',
        }}
      >
        {/* Double Rectangular Border */}
        <div style={{ position: 'absolute', inset: '16px', border: '2px solid var(--colorPrimary)', pointerEvents: 'none', zIndex: 10 }} />
        <div style={{ position: 'absolute', inset: '22px', border: '1px solid var(--colorPrimary)', opacity: 0.5, pointerEvents: 'none', zIndex: 10 }} />

        {/* Hero BG Image Area - Top Half */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', right: '24px', height: '45%' }}>
          {heroImage && <Image src={heroImage} alt="Hero Background" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'top', opacity: 0.8 }} />}
          {!heroImage && <div className="w-full h-full bg-slate-100 flex items-center justify-center opacity-20">No Image</div>}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, var(--colorBg) 95%)' }} />
        </div>

        {/* Content Box */}
        <div className="relative z-20 flex flex-col items-center justify-end pt-[50%] h-full text-center px-8 pb-16">
          <p style={{ ...eyebrow, marginBottom: '24px' }}>{labels.heroEyebrow || 'Wedding Celebration'}</p>

          <h1 className="font-serif tracking-widest leading-tight" style={{ fontSize: 'clamp(32px, 8vw, 42px)', color: 'var(--colorTextDark)' }}>
            {names.name1.toUpperCase()}
          </h1>
          {names.showBoth && (
            <>
              <span className="font-script my-2" style={{ fontSize: '32px', color: 'var(--colorPrimary)' }}>&</span>
              <h1 className="font-serif tracking-widest leading-tight" style={{ fontSize: 'clamp(32px, 8vw, 42px)', color: 'var(--colorTextDark)' }}>
                {names.name2.toUpperCase()}
              </h1>
            </>
          )}

          <div style={{ width: '60px', height: '1.5px', background: 'var(--colorPrimary)', margin: '32px 0', opacity: 0.8 }} />

          <p style={detail}>{dayLabel ? dayLabel + ', ' : ''} {wedding?.displayDate}</p>
          {(wedding?.heroTime || ceremony?.time) && <p style={{ ...detail, marginTop: '4px' }}>{wedding?.heroTime || ceremony.time}</p>}

          {ceremony?.venueName && (
            <>
              <p className="font-script mt-6" style={{ fontSize: '20px', color: 'var(--colorPrimary)' }}>Venue</p>
              <p style={{ ...detail, marginTop: '4px' }}>{ceremony?.venueName}</p>
            </>
          )}

        </div>
      </motion.div>
      <ScrollCue />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LAYOUT 2 — Oval Ornate Frame inside Card
───────────────────────────────────────────────────────── */
function Layout2({ config, labels = {}, birthdayData = null, generalData = null }) {
  const { couple = {}, wedding = {}, events = {}, heroImage } = config;
  const ceremony = events?.ceremony || {};
  const dayLabel = dayName(wedding?.dateTimeISO);
  const names = resolveNames(config, birthdayData, generalData);

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 'clamp(320px, 90vw, 540px)',
          minHeight: 'clamp(600px, 80vh, 850px)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.15)',
          backgroundColor: 'var(--colorBg)',
          position: 'relative',
          overflow: 'hidden',
          padding: '24px',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: heroImage ? 'flex-start' : 'center',
        }}
      >
        {/* Floating Oval Window */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', bottom: '16px', border: '1px solid var(--colorPrimary)', opacity: 0.4, borderRadius: '50% 50% / 10% 10%', pointerEvents: 'none' }} />

        {heroImage && (
          <div style={{
            margin: '0 auto 24px', width: 'clamp(200px, 60vw, 300px)', height: 'clamp(280px, 80vw, 400px)',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid var(--colorPrimary)',
            padding: '4px',
            position: 'relative'
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
              <Image src={heroImage || '/images/placeholder.png'} alt="Hero" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'top' }} />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center text-center px-4 w-full">
          <p className="font-script text-[var(--colorPrimary)] mb-2" style={{ fontSize: 'clamp(28px, 6vw, 40px)' }}>{labels.heroHeading || 'We Are Getting Married'}</p>

          <h1 className="font-serif" style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: 'var(--colorTextDark)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {names.name1}
          </h1>
          {names.showBoth && (
            <>
              <div style={{ height: '40px', width: '1px', background: 'var(--colorSecondary)', margin: '12px 0' }} />
              <h1 className="font-serif" style={{ fontSize: 'clamp(24px, 5vw, 32px)', color: 'var(--colorTextDark)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {names.name2}
              </h1>
            </>
          )}

          <div className="flex gap-4 mt-8 items-center text-[var(--colorTextDark)] opacity-80 uppercase tracking-widest font-sans text-xs">
            <span>{dayLabel}</span>
            <span className="w-1.5 h-1.5 bg-[var(--colorPrimary)] rounded-full" />
            <span>{wedding?.displayDate}</span>
          </div>

          {ceremony?.venueName && (
            <p className="font-sans text-[0.65rem] tracking-widest uppercase mt-4 text-[var(--colorTextDark)]/70 max-w-[200px]">
              {ceremony?.venueName}
            </p>
          )}

        </div>
      </motion.div>
      <ScrollCue />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LAYOUT 3 — Royal Arch & Peacocks (Indian Style)
───────────────────────────────────────────────────────── */
function Layout3({ config, isOpened, birthdayData = null, generalData = null }) {
  const { wedding = {}, events = {}, heroImage } = config;
  const ceremony = events?.ceremony || {};
  const dayLabel = dayName(wedding?.dateTimeISO);
  // Prefer the dedicated Hero Time (new invitations); fall back to ceremony time for existing ones.
  const heroTime = wedding?.heroTime || ceremony?.time;
  const names = resolveNames(config, birthdayData, generalData);

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 'clamp(320px, 88vw, 480px)',
          height: 'clamp(540px, 78vh, 720px)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.2)',
          background: 'var(--colorBg)',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
        }}
      >
        {/* ── ROYAL ORNATE BORDERS ── */}
        <div className="absolute inset-4 border-2 border-double border-[var(--colorPrimary)]/30 rounded-2xl pointer-events-none z-[15]" />
        <div className="absolute inset-6 border border-[var(--colorPrimary)]/10 rounded-xl pointer-events-none z-[15]" />

        {/* Top Mandala Motif */}
        <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-48 h-48 opacity-[0.07] pointer-events-none z-10 animate-spin-slow">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-[var(--colorPrimary)]">
            <path d="M50 0C51.1 0 52 0.9 52 2V10.2C65.3 11.5 76.5 22.7 77.8 36H86C87.1 36 88 36.9 88 38C88 39.1 87.1 40 86 40H77.8C76.8 51.6 68.7 61.3 58 64.9V72.1C64 73.8 68.5 79.4 68.5 86C68.5 87.1 67.6 88 66.5 88C65.4 88 64.5 87.1 64.5 86C64.5 81.3 60.7 77.5 56 77.5H44C39.3 77.5 35.5 81.3 35.5 86C35.5 87.1 34.6 88 33.5 88C32.4 88 31.5 87.1 31.5 86C31.5 79.4 36 73.8 42 72.1V64.9C31.3 61.3 23.2 51.6 22.2 40H14C12.9 40 12 39.1 12 38C12 36.9 12.9 36 14 36H22.2C23.5 22.7 34.7 11.5 48 10.2V2C48 0.9 48.9 0 50 0ZM50 14.2C38 14.2 28.2 24 28.2 36C28.2 48 38 57.8 50 57.8C62 57.8 71.8 48 71.8 36C71.8 24 62 14.2 50 14.2Z" />
          </svg>
        </div>

        {/* Hero Image — top 58% of card (resolves correctly with fixed height) */}
        {heroImage && (
          <div className="absolute inset-x-0 top-0 z-0" style={{ height: '58%' }}>
            <Image src={heroImage || '/images/placeholder.png'} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'top center', opacity: 0.9 }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, var(--colorBg) 100%)' }} />
          </div>
        )}

        {/* Content — anchored to bottom, grows upward */}
        <div
          className="absolute inset-x-0 z-20 flex flex-col items-center text-center px-8"
          style={{ bottom: '60px' }}
        >
          <motion.h1
            initial={{ opacity: 0, x: -60 }}
            animate={isOpened ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
            className="font-script leading-[0.9] text-[var(--colorTextDark)] drop-shadow-sm filter brightness-90"
            style={{ fontSize: 'clamp(2.6rem, 9vw, 4.5rem)' }}
          >
            {names.name1}
          </motion.h1>

          {names.showBoth && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isOpened ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex items-center gap-5 my-2"
            >
              <div className="h-px w-8 bg-[var(--colorTextDark)]/20" />
              <span className="font-serif text-[9px] tracking-[0.5em] uppercase text-[var(--colorTextDark)] opacity-40 font-bold">and</span>
              <div className="h-px w-8 bg-[var(--colorTextDark)]/20" />
            </motion.div>
          )}

          {names.showBoth && (
            <motion.h1
              initial={{ opacity: 0, x: 60 }}
              animate={isOpened ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
              className="font-script leading-[0.9] text-[var(--colorTextDark)] drop-shadow-sm filter brightness-90"
              style={{ fontSize: 'clamp(2.6rem, 9vw, 4.5rem)' }}
            >
              {names.name2}
            </motion.h1>
          )}

          <div style={{ width: '72px', height: '1.5px', background: 'var(--colorPrimary)', margin: '14px 0 16px', opacity: 0.5 }} />

          <p className="font-sans text-[11px] tracking-[0.35em] uppercase opacity-75 font-black mb-1" style={{ color: 'var(--colorTextDark)' }}>
            {dayLabel ? dayLabel + ', ' : ''}{wedding?.displayDate}
          </p>
          {heroTime && (
            <p className="font-sans text-[11px] tracking-[0.35em] mt-2 uppercase opacity-75 font-black" style={{ color: 'var(--colorTextDark)' }}>
              Time {heroTime}
            </p>
          )}
          {ceremony?.venueName && (
            <p className="font-sans text-[10px] tracking-widest uppercase mt-3 opacity-55 max-w-[220px]" style={{ color: 'var(--colorTextDark)' }}>
              {ceremony.venueName}
            </p>
          )}
        </div>

        {/* Decorative Peacocks Footer */}
        <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-3 pointer-events-none z-20">
          
          <div className="flex justify-center gap-10 opacity-75">
            {config.heroDecorationLeftImage ? (
              <img
                src={config.heroDecorationLeftImage}
                alt=""
                className="h-9 w-9 object-contain"
              />
            ) : (
              <span className="text-3xl filter saturate-[0.2] brightness-125" style={{ color: 'var(--colorPrimary)' }}>🦚</span>
            )}
            {config.heroDecorationRightImage ? (
              <img
                src={config.heroDecorationRightImage}
                alt=""
                className="h-9 w-9 object-contain"
              />
            ) : (
              <span className="text-3xl filter saturate-[0.2] brightness-125" style={{ transform: 'scaleX(-1)', color: 'var(--colorPrimary)' }}>🦚</span>
            )}
          </div>
        </div>
      </motion.div>
      <ScrollCue />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main export — reads heroLayout from config
───────────────────────────────────────────────────────── */
function ordinalSuffix(n) {
  const v = n % 100;
  const s = ['th', 'st', 'nd', 'rd'];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function resolveNames(config, birthdayData, generalData) {
  if (birthdayData?.celebrantName) {
    const age = birthdayData.age ? Number(birthdayData.age) : null;
    const ageStr = age && age > 0 ? `${ordinalSuffix(age)} ` : '';
    return { name1: `${birthdayData.celebrantName}'s ${ageStr}Birthday`, name2: null, showBoth: false };
  }
  if (generalData?.eventTitle || generalData?.hostName) {
    return { name1: generalData.eventTitle || generalData.hostName, name2: null, showBoth: false };
  }
  return {
    name1: config?.couple?.groom?.firstName || 'Groom',
    name2: config?.couple?.bride?.firstName || 'Bride',
    showBoth: true,
  };
}

export default function Hero({ config, isOpened, labels = {}, birthdayData = null, generalData = null }) {
  const layout = config?.heroLayout ?? 1;
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <LoadingSpinner isVisible={showLoading} />
      <section
        id="hero"
        className={`${layout === 9 ? '' : 'min-h-screen flex flex-col items-center justify-center'} relative overflow-hidden transition-all duration-500`}
        style={{ backgroundColor: 'var(--colorBg)' }}
      >
      {/* ── HERO VIDEO BACKGROUND ── */}
      {config.heroVideo && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-80"
            preload="metadata"
            onError={(e) => {
              console.warn('Hero video failed to load:', e);
              e.target.style.display = 'none';
            }}
          >
            <source src={config.heroVideo} type="video/mp4" />
            <source src={config.heroVideo.replace('.mp4', '.webm')} type="video/webm" />
          </video>
          {/* Subtle Video Overlay */}
          <div 
            className="absolute inset-0 z-10" 
            style={{ 
              background: `linear-gradient(to bottom, ${config.theme?.heroOverlayStart || 'rgba(0,0,0,0.3)'}, ${config.theme?.heroOverlayEnd || 'rgba(0,0,0,0.1)'})` 
            }} 
          />
        </div>
      )}

      {/* ── BLURRED BACKGROUND LAYER (Fallback or secondary) ── */}
      {config.sectionBackgrounds?.hero && !config.heroVideo && layout !== 9 && (
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-1000 z-0"
          style={{
            backgroundImage: `url(${config.sectionBackgrounds.hero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(0px)',
            transform: 'scale(1.05)',
            opacity: 0.6
          }}
        />
      )}
      {/* Subtle global overlay */}
      <div className="absolute inset-0 bg-black/10 z-[1] pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: 'radial-gradient(circle at 50% 50%, var(--colorPrimary) 0%, transparent 60%)', opacity: 0.03 }} />
      <div className={`relative z-10 w-full flex justify-center ${layout === 9 ? 'p-0' : 'py-20 px-4'}`}>
        {layout === 9 ? <Layout9 config={config} /> : 
         (layout === 8 || layout === 11) ? <Layout8 config={config} labels={labels} birthdayData={birthdayData} generalData={generalData} /> : 
         layout === 7 ? <Layout7 config={config} labels={labels} birthdayData={birthdayData} generalData={generalData} /> : 
         layout === 6 ? <Layout6 config={config} labels={labels} birthdayData={birthdayData} generalData={generalData} /> : 
         layout === 5 ? <Layout5 config={config} birthdayData={birthdayData} generalData={generalData} /> : 
         layout === 4 ? <Layout4 config={config} labels={labels} birthdayData={birthdayData} generalData={generalData} /> : 
         layout === 3 ? <Layout3 config={config} isOpened={isOpened} birthdayData={birthdayData} generalData={generalData} /> : 
         layout === 2 ? <Layout2 config={config} labels={labels} birthdayData={birthdayData} generalData={generalData} /> : <Layout1 config={config} labels={labels} birthdayData={birthdayData} generalData={generalData} />}
      </div>
    </section>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   LAYOUT 9 — Modern Full Cover (Textless)
───────────────────────────────────────────────────────── */
function Layout9({ config }) {
  const { heroImage, sectionBackgrounds } = config;
  const heroBg = sectionBackgrounds?.hero || heroImage || '';

  return (
    <div className="w-full relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="w-full"
      >
        {heroBg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroBg}
            alt="Wedding Hero"
            className="w-full h-auto block"
          />
        ) : (
          <div className="w-full aspect-video bg-neutral-900 flex items-center justify-center text-white/20">
            No Hero Image Selected
          </div>
        )}
        {/* Very Subtle Gradient Overlay for bottom transition */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      </motion.div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 opacity-50 text-white">
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LAYOUT 4 — Nature Arch (Premium Design)
   Inspired by a forest garden arch with central couple
───────────────────────────────────────────────────────── */
function Layout4({ config, labels = {}, birthdayData = null, generalData = null }) {
  const { couple = {}, wedding = {}, events = {}, heroImage, coupleImages } = config;
  const ceremony = events?.ceremony || {};
  // Prefer the dedicated Hero Time (new invitations); fall back to ceremony time for existing ones.
  const heroTime = wedding?.heroTime || ceremony?.time;
  const dateObj = wedding?.dateTimeISO ? new Date(wedding.dateTimeISO) : null;
  const dayLabel = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase() : '';
  const month = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : '';
  const dayNum = dateObj && !isNaN(dateObj.getTime()) ? dateObj.getDate() : '';
  const year = dateObj && !isNaN(dateObj.getTime()) ? dateObj.getFullYear() : '';

  const heroBg = heroImage || '';
  const names = resolveNames(config, birthdayData, generalData);

  return (
    <div className="flex flex-col items-center w-full max-w-[600px] mx-auto min-h-[85vh] bg-white relative overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.15)] border-[12px] border-white">
      {/* Full Background (Liquid Layer) */}
      <div className="absolute inset-x-0 top-0 bottom-0 z-0">
         <Image src={heroBg || '/images/placeholder.png'} alt="Hero Background" fill style={{ objectFit: 'cover', objectPosition: 'top', opacity: 0.15, filter: 'blur(10px) saturate(1.5)' }} />
      </div>

      {/* ── TOP DATE HEADER (Matching image layout) ── */}
      <div className="relative z-20 w-full px-6 pt-10 pb-6 flex flex-col md:flex-row items-center justify-center md:justify-between border-b border-black/5 gap-6 md:gap-0">
        <div className="flex-1 text-center font-sans font-bold text-[14px] md:text-[16px] tracking-[0.25em] uppercase text-[#2C2018] opacity-90 w-full">
          {dayLabel || 'SUNDAY'}
        </div>
        
        {/* Central Date Box (Liquid Glass Box) */}
        <div className="relative flex flex-col items-center px-10 py-6">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-lg border border-white/60 shadow-sm" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="font-sans font-bold text-[12px] tracking-widest text-[#8A7F6A] mb-1">{month}</span>
            <span className="font-serif text-6xl text-[#2C2018] leading-none mb-1">{dayNum}</span>
            <span className="font-sans text-[11px] tracking-[0.2em] text-[#8A7F6A] font-bold">{year}</span>
          </div>
          {/* Vertical separators match the image style */}
          <div className="absolute -left-0 top-6 bottom-6 w-px bg-black/10" />
          <div className="absolute -right-0 top-6 bottom-6 w-px bg-black/10" />
        </div>

        <div className="flex-1 text-center font-sans font-bold text-[14px] md:text-[16px] tracking-[0.25em] uppercase text-[#2C2018] opacity-90 w-full">
          {heroTime ? `AT ${heroTime.toUpperCase()}` : 'AT 10:00 AM'}
        </div>
      </div>

      {/* ── MAIN LIQUID GLASS ARCH ── */}
      <div className="relative w-full flex-1 px-4 mt-8 mb-4">
        <div className="relative w-full h-[540px] rounded-t-[180px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.12)] border border-white/40 group">
          
          {/* Internal Shimmer Layer */}
          <div className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-tr from-white/0 via-white/10 to-transparent animate-shimmer" />

          {/* Primary View (Arched Photo) */}
          <div className="absolute inset-0 z-10 transition-transform duration-700 group-hover:scale-105">
            {heroBg ? (
              <Image src={heroBg} alt="Hero" fill style={{ objectFit: 'cover', objectPosition: 'top' }} />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center opacity-20">No Image</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
          </div>
        </div>

        {/* Decorative Glass Highlights floating beneath the arch */}
        <div className="absolute -bottom-10 left-10 w-24 h-24 bg-white/40 backdrop-blur-xl rounded-full border border-white/60 -z-10 shadow-lg blur-sm" />
        <div className="absolute -top-10 right-10 w-32 h-32 bg-white/20 backdrop-blur-2xl rounded-full border border-white/40 -z-10 animate-float" />
      </div>

      {/* ── FOOTER NAMES & BRANDING ── */}
      <div className="relative z-40 text-center flex flex-col items-center py-8 bg-white w-full">
        <h2 className="font-serif text-3xl md:text-5xl text-[#2C2018] tracking-[0.2em] uppercase mb-4 font-medium transition-all duration-500 group-hover:tracking-[0.25em]">
          {names.name1}{names.showBoth && ` & ${names.name2}`}
        </h2>

        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-8 bg-[#8A7F6A]/30" />
          <span className="font-sans text-[9px] tracking-[0.4em] uppercase text-[#8A7F6A] font-bold">The Celebration Of</span>
          <div className="h-px w-8 bg-[#8A7F6A]/30" />
        </div>

        <p className="font-serif text-sm md:text-base text-[#2C2018]/80 italic opacity-70">
          {labels.heroFamiliesLine || 'Together with their families invite you to their wedding'}
        </p>
      </div>

      {/* Extra Liquid Corner Flair */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[var(--colorPrimary)]/5 to-transparent opacity-30 pointer-events-none" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LAYOUT 5 — Modern Minimalist High-Contrast
───────────────────────────────────────────────────────── */
function Layout5({ config, birthdayData = null, generalData = null }) {
  const { couple = {}, wedding = {}, heroImage } = config;
  const eventType = config?.eventType || 'wedding';
  const year = wedding?.dateTimeISO ? new Date(wedding.dateTimeISO).getFullYear() : '';
  const names = resolveNames(config, birthdayData, generalData);

  const subLabel = names.showBoth
    ? `The Wedding of ${names.name1} & ${names.name2}`
    : names.name1;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-6 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "circOut" }}
        className="relative mb-12 w-full"
      >
        <div className="w-1 h-16 bg-[var(--colorPrimary)] mx-auto mb-8 opacity-40" />
        {names.showBoth ? (
          <>
            <h1 className="font-serif text-[clamp(64px,15vw,120px)] leading-[0.8] tracking-tighter text-[var(--colorTextDark)] mb-4">
              {names.name1.charAt(0)}<span className="text-[var(--colorPrimary)]">&</span>{names.name2.charAt(0)}
            </h1>
            <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-[var(--colorTextDark)] opacity-60">
              {subLabel}
            </p>
          </>
        ) : (
          <h1 className="font-serif text-[clamp(32px,6vw,64px)] leading-tight tracking-tight text-[var(--colorTextDark)] mb-4">
            {names.name1}
          </h1>
        )}
      </motion.div>

      <div className="flex flex-col items-center gap-4">
        <p className="font-serif text-3xl italic text-[var(--colorTextDark)]">{wedding?.displayDate}</p>
        <div className="h-px w-12 bg-[var(--colorPrimary)]" />
        <p className="font-sans text-xs tracking-[0.3em] uppercase opacity-70">{year ? `${year} • ` : ''}SAVE THE DATE</p>
      </div>

      {heroImage && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 w-full max-w-xs md:max-w-sm aspect-[4/5] rounded-full overflow-hidden border border-[var(--colorPrimary)]/20 p-4 relative"
        >
          <Image src={heroImage || '/images/placeholder.png'} alt="Hero" fill style={{ objectFit: 'cover' }} className="rounded-full grayscale hover:grayscale-0 transition-all duration-1000" />
        </motion.div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LAYOUT 6 — Helper: Floral Corner decoration
   Defined outside Layout6 so it is stable across renders
───────────────────────────────────────────────────────── */
function SvgFloralCorner({ path, className, delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut", delay }}
      className={`absolute w-64 md:w-96 h-64 md:h-96 -z-10 pointer-events-none ${className}`}
    >
      <div 
        className="w-full h-full"
        style={{ 
          maskImage: `url('${path}')`,
          WebkitMaskImage: `url('${path}')`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          backgroundColor: 'var(--colorPrimary)',
          opacity: 0.15,
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))'
        }} 
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   LAYOUT 6 — Watercolor Floral (Garden Theme)
───────────────────────────────────────────────────────── */
function Layout6({ config, labels = {}, birthdayData = null, generalData = null }) {
  const { couple = {}, wedding = {}, events = {}, heroImage } = config;
  const [showOptions, setShowOptions] = useState(false);
  const names = resolveNames(config, birthdayData, generalData);

  const handleSaveToCalendar = () => {
    setShowOptions(!showOptions);
  };

  const generateGoogleUrl = () => {
    const start = wedding?.dateTimeISO?.replace(/[-:]/g, '').split('.')[0] + 'Z' || '';
    const end = start; // Same for simplicity or handle duration
    const title = encodeURIComponent(`Wedding of ${couple?.groom?.firstName} & ${couple?.bride?.firstName}`);
    const location = encodeURIComponent(events?.ceremony?.location || 'Wedding Venue');
    const details = encodeURIComponent('Looking forward to seeing you there!');
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}&sf=true&output=xml`;
  };

  const handleIcsDownload = () => {
    const start = wedding?.dateTimeISO?.replace(/[-:]/g, '').split('.')[0] + 'Z' || '';
    const title = `Wedding of ${couple?.groom?.firstName} & ${couple?.bride?.firstName}`;
    const location = events?.ceremony?.location || 'Wedding Venue';
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${start}`,
      `SUMMARY:${title}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${labels.heroFamiliesIcal || 'Together with their families\\, invite you to their wedding.'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'wedding-save-the-date.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[70vh] justify-start pt-12 md:pt-20 pb-8 px-4 md:px-6 relative overflow-hidden mx-auto max-w-5xl"
      style={{
        borderRadius: '200px 200px 40px 40px',
        border: '3px solid var(--colorPrimary)',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.6), 0 30px 60px rgba(0,0,0,0.08), 0 0 0 1px var(--colorPrimary)/20'
      }}
    >
      {/* ── CUSTOM FLORAL CORNERS ── */}
      <SvgFloralCorner path="/images/flowers/top-left.svg" className="-top-12 -left-12 rotate-[-5deg]" delay={0} />
      <SvgFloralCorner path="/images/flowers/top-right.svg" className="-top-12 -right-12 rotate-[5deg]" delay={0.3} />
      <SvgFloralCorner path="/images/flowers/bottom-left.svg" className="-bottom-12 -left-12 rotate-[5deg]" delay={0.6} />
      <SvgFloralCorner path="/images/flowers/bottom-right.svg" className="-bottom-12 -right-12 rotate-[-5deg]" delay={0.9} />

      {/* ── CONTENT AREA ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="text-center z-10 w-full max-w-2xl px-6"
      >
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="flex items-center gap-3 mb-3 group">
            <div className="h-px w-5 md:w-10 bg-[var(--colorPrimary)]/20 transition-all group-hover:w-14" />
            {names.showBoth
              ? <p className="font-sans text-[8px] md:text-[9px] tracking-[0.4em] uppercase text-[var(--colorTextDark)]/60 font-bold">The Wedding of</p>
              : <p className="font-sans text-[8px] md:text-[9px] tracking-[0.4em] uppercase text-[var(--colorTextDark)]/60 font-bold">You are invited</p>
            }
          </div>
          <h1 className="font-script text-[clamp(50px,10vw,80px)] text-[var(--colorPrimary)] mb-1 leading-[0.7]">
            {names.name1}
          </h1>
          {names.showBoth && (
            <>
              <div className="flex items-center justify-center gap-4 my-2">
                 <div className="w-1.5 h-1.5 rounded-full border border-[var(--colorSecondary)]/40" />
                 <span className="font-script text-[clamp(32px,6vw,48px)] text-[var(--colorPrimary)] font-light leading-none">&</span>
                 <div className="w-1.5 h-1.5 rounded-full border border-[var(--colorSecondary)]/40" />
              </div>
              <h1 className="font-script text-[clamp(50px,10vw,80px)] text-[var(--colorPrimary)] leading-[0.7]">
                {names.name2}
              </h1>
            </>
          )}
        </div>

        {/* Elegant Garden Plaque with Calendar trigger */}
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-[50px_15px_50px_15px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] -z-10 group-hover:bg-white/60 transition-colors duration-500" />
          <div className="px-8 md:px-12 py-4 md:py-6 border border-[var(--colorPrimary)]/10 rounded-[50px_15px_50px_15px] relative">
            <p className="font-serif text-xl md:text-2xl text-[var(--colorTextDark)] tracking-wider mb-1">{wedding?.displayDate}</p>
            <div className="h-px w-8 bg-[var(--colorPrimary)]/30 mx-auto my-2" />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveToCalendar}
              className="px-4 py-1 rounded-full border border-[var(--colorPrimary)]/20 font-sans text-[9px] tracking-[0.2em] uppercase text-[var(--colorPrimary)] font-black flex items-center gap-2 mx-auto hover:bg-[var(--colorPrimary)]/5 transition-all"
            >
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Save the Date
            </motion.button>

            {/* Options Overlay */}
            <AnimatePresence>
              {showOptions && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute left-1/2 -translate-x-1/2 bottom-[110%] mb-2 bg-white/95 backdrop-blur-xl border border-[var(--colorPrimary)]/10 rounded-2xl p-2 flex items-center gap-2 shadow-xl z-20 whitespace-nowrap"
                >
                  <a 
                    href={generateGoogleUrl()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-[var(--colorPrimary)] hover:bg-[var(--colorPrimary)]/5 flex items-center gap-2"
                  >
                    Google
                  </a>
                  <div className="w-px h-4 bg-gray-200" />
                  <button 
                    onClick={handleIcsDownload}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-[var(--colorTextDark)]/70 hover:bg-black/5 flex items-center gap-2"
                  >
                    Apple / Outlook
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Corner Decorative Dots */}
            <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-[var(--colorPrimary)]/20" />
            <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-[var(--colorPrimary)]/20" />
          </div>
        </div>
      </motion.div>

      {/* ── PHOTO AREA ── */}
      {heroImage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
          className="mt-2 w-full max-w-sm aspect-[3/4] p-3 relative"
        >
          <div className="absolute inset-0 border border-[var(--colorPrimary)]/10 rounded-[3rem] scale-[1.02] -z-10" />
          <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.1)] border-[6px] border-white relative group">
            <Image src={heroImage || '/images/placeholder.png'} alt="Hero" fill style={{ objectFit: 'cover' }} className="transition-transform duration-[3000ms] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--colorPrimary)]/20 to-transparent mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LAYOUT 7 — Retro Polaroid / Scrapbook
───────────────────────────────────────────────────────── */
function Layout7({ config, labels = {}, birthdayData = null, generalData = null }) {
  const { couple = {}, wedding = {}, heroImage } = config;
  const names = resolveNames(config, birthdayData, generalData);

  return (
    <div className="flex flex-col items-center w-full py-16 px-6">
      <motion.div
        initial={{ rotate: -3, opacity: 0, scale: 0.9 }}
        animate={{ rotate: -2, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white p-6 pb-20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 max-w-sm w-full relative z-10"
      >
        <div className="aspect-[3/4] bg-slate-100 overflow-hidden mb-6">
          {heroImage ? (
            <Image src={heroImage || '/images/placeholder.png'} alt="Hero" fill style={{ objectFit: 'cover', objectPosition: 'center 20%' }} className="sepia-[0.3]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-10 font-bold">MISSING</div>
          )}
        </div>
        <div className="text-center">
          <h1 className="font-script text-4xl text-slate-800 mb-2">{labels.photoLabel || 'Our Wedding Day'}</h1>
          <p className="font-sans text-xs tracking-widest uppercase text-slate-400">{wedding?.displayDate}</p>
        </div>
        {/* Tape effect */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 bg-white/40 backdrop-blur-sm border border-white/20 rotate-1 shadow-sm mix-blend-overlay" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center"
      >
        <h2 className="font-serif text-4xl text-[var(--colorPrimary)] mb-4">
          {names.name1}{names.showBoth && <> <span className="text-2xl font-script">&</span> {names.name2}</>}
        </h2>
        <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-[var(--colorTextDark)]/60">
          Capture these moments with us
        </p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   LAYOUT 8 — Sinhala Traditional (Sri Lankan style)
───────────────────────────────────────────────────────── */
function Layout8({ config, labels = {}, birthdayData = null, generalData = null }) {
  const { couple = {}, wedding = {}, events = {}, heroImage } = config;
  const ceremony = events?.ceremony || {};
  const names = resolveNames(config, birthdayData, generalData);

  return (
    <div className="flex flex-col items-center w-full min-h-[85vh] relative overflow-hidden bg-[var(--colorBg)] px-6">
      {/* Traditional Bo Leaf pattern hints in background */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="var(--colorPrimary)">
          <path d="M100,20 C100,20 160,80 160,120 C160,160 130,180 100,180 C70,180 40,160 40,120 C40,80 100,20 100,20 Z" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-xl bg-white/50 backdrop-blur-md rounded-[40px] border-4 border-double border-[var(--colorPrimary)] p-8 md:p-12 text-center mt-12 md:mt-20 mb-8 shadow-2xl mx-auto"
      >
        {/* Traditional Symbol */}
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-[var(--colorPrimary)] flex items-center justify-center">
            <span className="text-2xl text-[var(--colorPrimary)]">🪔</span>
          </div>
        </div>

        <p className="font-sinhala text-lg md:text-xl text-[var(--colorTextDark)] mb-6 leading-relaxed">
          ශුභ මංගලම් <br />
          <span className="text-sm opacity-60">Subha Mangalam</span>
        </p>

        <h1 className="font-sinhala text-3xl md:text-6xl text-[var(--colorPrimary)] mb-4 tracking-tight">
          {names.name1}{names.showBoth && ` සහ ${names.name2}`}
        </h1>

        <div className="flex items-center justify-center gap-4 my-8">
          <div className="h-px flex-1 bg-[var(--colorPrimary)]/30" />
          <div className="w-3 h-3 rotate-45 bg-[var(--colorPrimary)]" />
          <div className="h-px flex-1 bg-[var(--colorPrimary)]/30" />
        </div>

        <div className="space-y-4">
          <p className="font-sinhala text-2xl text-[var(--colorTextDark)]">
            {wedding?.displayDate}
          </p>
          <p className="font-sans text-[10px] tracking-[0.4em] uppercase opacity-50 mb-4">{labels.heroEyebrow || 'Wedding Celebration'}</p>
          
          {ceremony?.venueName && (
            <div className="bg-[var(--colorPrimary)]/5 p-4 rounded-2xl inline-block w-full max-w-xs">
              <p className="font-sinhala text-sm text-[var(--colorTextDark)]/80 mb-1 font-bold">පින්බර උත්සව අවස්ථාව</p>
              <p className="font-sans text-xs font-bold uppercase">{ceremony?.venueName}</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-[var(--colorPrimary)] opacity-40 text-3xl">✾</div>
      </motion.div>

      {heroImage && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="w-full h-64 md:h-96 -mt-32 relative z-0"
        >
          <Image src={heroImage || '/images/placeholder.png'} alt="Hero" fill style={{ objectFit: 'cover', maskImage: 'linear-gradient(to top, transparent, black)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--colorBg)] to-transparent" />
        </motion.div>
      )}
    </div>
  );
}

/* ── Shared style constants ── */
const eyebrow = {
  fontFamily: 'var(--font-sans, sans-serif)',
  fontSize: '10px',
  letterSpacing: '0.24em',
  color: 'var(--colorPrimary)',
  textTransform: 'uppercase',
  fontWeight: 400,
  opacity: 0.9,
};

const divider = {
  width: '44px',
  height: '1px',
  background: 'var(--colorSecondary)',
  margin: '0 auto 16px',
};

const detail = {
  fontFamily: 'var(--font-sans, sans-serif)',
  fontSize: 'clamp(9px, 1.8vw, 11px)',
  letterSpacing: '0.2em',
  color: 'var(--colorTextDark)',
  textTransform: 'uppercase',
  fontWeight: 400,
  opacity: 0.8,
};
