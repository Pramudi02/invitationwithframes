'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useSyncExternalStore } from 'react';

/**
 * Royal Envelope Opening Animation
 * Inspired by Sri Lankan royal invitation aesthetics.
 * Features:
 * - Deep red textured envelope
 * - Gold band across the middle
 * - Professional wax seal with initials
 * - Smooth opening flap and sliding card
 */
export default function RoyalEnvelope({ config, onOpen, birthdayData = null, generalData = null }) {
  const [stage, setStage] = useState('closed'); // closed | opening | sliding
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const handleOpen = () => {
    if (stage !== 'closed') return;
    
    // 1. Initiate opening
    setStage('opening');
    
    // 2. Card starts sliding after flap is mostly open
    setTimeout(() => {
      setStage('sliding');
      
      // 3. Final callback to show main content after a shorter pause
      setTimeout(() => {
        onOpen();
      }, 1800);
    }, 500);
  };

  if (!mounted) return null;

  const displayName = birthdayData?.celebrantName
    || generalData?.eventTitle
    || generalData?.hostName
    || null;
  const initial1 = displayName
    ? (displayName[0] || '').toUpperCase()
    : (config.couple?.bride?.firstName?.[0] || 'D').toUpperCase();
  const initial2 = displayName ? null : (config.couple?.groom?.firstName?.[0] || 'C').toUpperCase();

  const brideInitial = config.couple?.bride?.firstName?.[0] || 'D';
  const groomInitial = config.couple?.groom?.firstName?.[0] || 'C';

  // Theme resolution with overrides
  const royalSettings = config.envelope?.royal || {};
  const theme = config.theme || {
    colorPrimary: '#91091E',
    colorBg: '#3D0010'
  };

  const primaryColor = royalSettings.envelopeColor || theme.colorPrimary || '#91091E';
  const bgColor1 = royalSettings.bgColor1 || theme.colorBg || '#3D0010';
  const bgColor2 = royalSettings.bgColor2 || theme.colorPrimary || '#91091E';
  const sealColor = royalSettings.sealColor || primaryColor;
  const sealImage = royalSettings.sealImage || null;

  // Animation Variants
  const flapVariants = {
    closed: { rotateX: 0, zIndex: 40 },
    opening: { 
      rotateX: -170, 
      zIndex: 5, 
      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } 
    }
  };

  // Mirrored motion: Container moves down, Card moves up twice as much (relative)
  const containerVariants = {
    closed: { y: 0 },
    sliding: {
      y: '45%',
      transition: { duration: 1.5, ease: [0.19, 1, 0.22, 1], delay: 0.1 }
    }
  };

  const cardVariants = {
    closed: { y: 0, scale: 0.95, opacity: 0 },
    sliding: { 
      y: '-90%', // Relative to downward moving container, results in -45% absolute
      scale: 1, 
      opacity: 1,
      transition: { duration: 1.0, ease: [0.19, 1, 0.22, 1], delay: 0.1 } 
    }
  };

  const sealVariants = {
    closed: { scale: 1, opacity: 1, y: 0 },
    opening: { 
      scale: 1.1, 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.5, ease: "easeIn" } 
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden" 
      style={{ background: `radial-gradient(circle at center, ${bgColor2} 0%, ${bgColor1} 100%)` }}
    >
      {/* Background Ambience Overlay */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
      
      <div className="relative w-[90%] max-w-[500px] aspect-[4/3] perspective-[2000px]">
        
        {/* ENVELOPE BASE (Wrapper for mirrored motion) */}
        <motion.div 
          className="relative w-full h-full preserve-3d" 
          style={{ transformStyle: 'preserve-3d' }}
          variants={containerVariants}
          initial="closed"
          animate={stage === 'sliding' ? 'sliding' : 'closed'}
        >
          
          {/* 1. BACK PANEL */}
          <div 
            className="absolute inset-0 z-0 shadow-2xl"
            style={{ 
              backgroundColor: primaryColor,
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
              backgroundBlendMode: 'multiply',
              borderRadius: '8px'
            }}
          >
            {/* Interior shadow */}
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.3)]" />
          </div>

          {/* 2. INVITATION CARD */}
          <motion.div
            variants={cardVariants}
            initial="closed"
            animate={stage === 'sliding' ? 'sliding' : (stage === 'opening' ? { opacity: 1 } : 'closed')}
            className="absolute inset-x-4 top-4 bottom-4 z-[15] bg-[#FFFDF2] shadow-2xl flex flex-col items-center justify-center text-center p-8 border border-[#D4AF37]/20"
            style={{ 
              borderRadius: '12px 12px 4px 4px',
            }}
          >
            <div className="border-2 border-[#D4AF37]/10 absolute inset-2 rounded-[10px_10px_2px_2px] pointer-events-none" />
            
            <div className="relative z-10 w-full">
              <p className="font-serif italic text-[#C5A059] text-sm mb-4">You are cordially invited</p>
              <h2 className="font-serif text-3xl md:text-4xl text-[#3D0010] mb-4 leading-tight">
                {displayName
                  ? displayName
                  : <>{config.couple?.bride?.firstName} <br/>
                      <span className="font-script text-2xl text-[#C5A059]">&</span> <br/>
                      {config.couple?.groom?.firstName}
                    </>
                }
              </h2>
              <div className="w-12 h-px bg-[#C5A059]/30 mx-auto mb-4" />
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#3D0010]/60">
                {config.wedding?.displayDate}
              </p>
            </div>
          </motion.div>

          {/* 3. FRONT PANEL (Left, Right, Bottom flaps) */}
          <div className="absolute inset-0 z-30 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
            {/* Left */}
            <div className="absolute inset-y-0 left-0 w-[51%]" 
                 style={{ 
                   backgroundColor: primaryColor,
                   clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)', 
                   backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                   backgroundBlendMode: 'multiply'
                 }} />
            {/* Right */}
            <div className="absolute inset-y-0 right-0 w-[51%]" 
                 style={{ 
                   backgroundColor: primaryColor,
                   clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)', 
                   backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                   backgroundBlendMode: 'multiply'
                 }} />
            {/* Bottom */}
            <div className="absolute inset-x-0 bottom-0 h-3/5" 
                 style={{ 
                   backgroundColor: primaryColor,
                   filter: 'brightness(0.9)',
                   clipPath: 'polygon(0% 100%, 50% 20%, 100% 100%)', 
                   backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
                   backgroundBlendMode: 'multiply'
                 }} />
          </div>

          {/* 4. HIGH-FIDELITY 3D GOLD BAND */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-full h-14 md:h-20 z-[60] shadow-[0_10px_40px_rgba(0,0,0,0.6)] transition-all duration-700 overflow-hidden flex flex-col justify-between py-1"
            style={{ 
              background: 'linear-gradient(to right, #5d401a 0%, #b8860b 20%, #f7e48b 45%, #ffffff 50%, #f7e48b 55%, #b8860b 80%, #5d401a 100%)',
              borderTop: '0.5px solid rgba(255,255,255,0.4)',
              borderBottom: '0.5px solid rgba(0,0,0,0.4)'
            }}
          >
            {/* Inner Accent Stripes */}
            <div className="w-full h-px bg-white/40 shadow-[0_0.5px_1px_rgba(0,0,0,0.2)]" />
            <div className="w-full h-px bg-white/40 shadow-[0_-0.5px_1px_rgba(0,0,0,0.2)]" />
            
            {/* Surface Gleam */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          </div>

          {/* 5. TOP FLAP */}
          <motion.div
            variants={flapVariants}
            initial="closed"
            animate={(stage === 'opening' || stage === 'sliding') ? 'opening' : 'closed'}
            className="absolute inset-x-0 top-0 h-1/2 origin-top z-40 transition-shadow duration-500"
            style={{ 
              backgroundColor: primaryColor,
              clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              transformStyle: 'preserve-3d',
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")',
              backgroundBlendMode: 'multiply',
              boxShadow: stage === 'closed' ? '0 15px 30px rgba(0,0,0,0.4)' : 'none'
            }}
          >
            {/* Flap Interior shadow */}
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>

          {/* 6. WAX SEAL ASSEMBLY */}
          <AnimatePresence>
            {stage === 'closed' && (
              <motion.div
                variants={sealVariants}
                initial="closed"
                exit="opening"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] cursor-pointer bg-transparent"
                onClick={handleOpen}
              >
                {/* 1. PRESSING EFFECT (Indentation on paper) */}
                <div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none opacity-40"
                  style={{ 
                    background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, transparent 70%)',
                    borderRadius: '50%',
                  }}
                />

                {/* 2. 3D Wax Seal Body - High Fidelity Organic Style */}
                <div 
                  className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 duration-300 relative"
                  style={{ 
                    backgroundColor: sealImage ? 'transparent' : sealColor,
                    borderRadius: '48% 52% 43% 57% / 54% 42% 58% 46%',
                    boxShadow: sealImage ? 'none' : `
                      0 2px 4px rgba(0,0,0,0.5),
                      0 8px 16px rgba(0,0,0,0.3),
                      inset 0 -12px 12px rgba(0,0,0,0.3),
                      inset 0 12px 12px rgba(255,255,255,0.2),
                      inset -4px -4px 10px rgba(0,0,0,0.2)
                    `
                  }}
                >
                  {/* Outer Rim Highlight (Specular) */}
                  {!sealImage && <div className="absolute top-[8%] left-[12%] w-[40%] h-[25%] bg-white/30 rounded-full blur-[3px] -rotate-[35deg] pointer-events-none" />}

                  {/* Deep Recessed Center Area */}
                  <div 
                    className={`${sealImage ? 'w-full h-full' : 'w-[72%] h-[72%]'} flex flex-col items-center justify-center relative z-10 overflow-hidden`}
                    style={{ 
                      borderRadius: '50%',
                      backgroundColor: sealImage ? 'transparent' : 'rgba(0,0,0,0.15)',
                      boxShadow: sealImage ? 'none' : 'inset 0 10px 10px rgba(0,0,0,0.6), inset 0 -4px 6px rgba(255,255,255,0.1), 0 2px 2px rgba(255,255,255,0.2)',
                      border: sealImage ? 'none' : '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    {sealImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sealImage}
                        alt="Wax seal"
                        className="w-full h-full object-contain select-none pointer-events-none"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                      />
                    ) : (
                      <span className="font-serif font-black italic text-[#D4AF37] text-lg md:text-xl whitespace-nowrap select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                        {initial1}
                        {initial2 && <><span className="font-script text-[10px] mx-1 not-italic font-normal">&</span>{initial2}</>}
                      </span>
                    )}
                  </div>

                  {/* Surface Wax Texture (Subtle Glow) */}
                  {!sealImage && (
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-30"
                      style={{
                        borderRadius: 'inherit',
                        background: 'radial-gradient(circle at 30% 30%, white 0%, transparent 40%)',
                      }}
                    />
                  )}
                </div>
                
                {/* 3. CLICK INSTRUCTION - Absolutely positioned below to avoid breaking symmetry */}
                <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-max text-center">
                  <p className="font-sans text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-[#C5A059] font-bold drop-shadow-sm select-none">
                    BREAK THE SEAL
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
