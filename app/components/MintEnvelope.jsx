'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { PRESET_THEMES } from '../../lib/themes';

export default function MintEnvelope({ config, onOpenInvitation }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      onOpenInvitation();
    }, 2200); // 0.8s for doors + 1.0s viewing time + 0.4s fade
  };

  const themeId = config.themeId || config.theme || 'gold';
  const theme = PRESET_THEMES.find(t => t.id === themeId)?.colors || config.theme || PRESET_THEMES[0].colors;

  const innerBgImage = config.envelope?.bgImage || config?.revealCoverImage || config?.heroImage || '/placeholder-wedding.jpg';
  const doorBgImage = config.envelope?.outerBgImage;

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
      transition={isOpen ? { duration: 0.4, delay: 1.8, ease: "easeOut" } : { duration: 0 }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#fdfaf5] overflow-hidden p-6 font-serif"
    >
      
      {/* ── CENTRAL DOOR LAYOUT ── */}
      <div 
        className="relative w-full max-w-[420px] md:max-w-[500px] aspect-[2/3] max-h-[75vh] cursor-pointer shadow-2xl flex flex-col"
        style={{ perspective: '2000px' }}
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* INNER CONTENT (Visible as doors open) */}
        <div className="absolute inset-4 rounded-[30px] bg-white shadow-inner flex flex-col items-center justify-center text-center p-8 border border-slate-100 overflow-hidden">
           
           {/* Inner Photo */}
           {innerBgImage && (
             <Image
               src={innerBgImage}
               alt="Inner Photo"
               fill
               style={{ objectFit: 'cover' }}
             />
           )}
        </div>

        {/* ── LEFT DOOR ── */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={isOpen ? { rotateY: -110 } : isHovered ? { rotateY: -4 } : { rotateY: 0 }}
          transition={{ duration: isOpen ? 0.8 : 0.4, ease: [0.45, 0.05, 0.55, 0.95] }}
          style={{ originX: 0, transformStyle: 'preserve-3d' }}
          className="absolute left-0 top-0 w-1/2 h-full z-20"
        >
          {/* Back side of Left Door (Gold) */}
          <div 
             className="absolute inset-0 w-full h-full rounded-r-[40px] bg-gradient-to-l from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] border-l border-white/40"
             style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          />

          {/* Front Side of Left Door */}
          <div 
            className="absolute inset-0 w-full h-full rounded-l-[40px] shadow-2xl border-r border-white/10 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              backgroundImage: doorBgImage ? `url(${doorBgImage})` : 'none',
              backgroundColor: doorBgImage ? 'transparent' : '#4A2335',
              backgroundSize: '200% 100%',
              backgroundPosition: 'left center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Fallback Gradient if no image */}
            {!doorBgImage && <div className="absolute inset-0 bg-gradient-to-b from-[#4A2335] to-[#2D1A25]" />}
            
            {/* Subtle Overlay Texture */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-[length:16px_16px]" />
            
            {/* Left Door Handle */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-24 bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-700 rounded-full shadow-lg border border-yellow-300/30">
               <div className="absolute inset-y-2 inset-x-0.5 bg-white/20 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT DOOR ── */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={isOpen ? { rotateY: 110 } : isHovered ? { rotateY: 4 } : { rotateY: 0 }}
          transition={{ duration: isOpen ? 0.8 : 0.4, ease: [0.45, 0.05, 0.55, 0.95] }}
          style={{ originX: 1, transformStyle: 'preserve-3d' }}
          className="absolute right-0 top-0 w-1/2 h-full z-20"
        >
          {/* Back side of Right Door (Gold) */}
          <div 
             className="absolute inset-0 w-full h-full rounded-l-[40px] bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] border-r border-white/40"
             style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          />

          {/* Front Side of Right Door */}
          <div 
            className="absolute inset-0 w-full h-full rounded-r-[40px] shadow-2xl border-l border-white/10 overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              backgroundImage: doorBgImage ? `url(${doorBgImage})` : 'none',
              backgroundColor: doorBgImage ? 'transparent' : '#4A2335',
              backgroundSize: '200% 100%',
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Fallback Gradient if no image */}
            {!doorBgImage && <div className="absolute inset-0 bg-gradient-to-b from-[#4A2335] to-[#2D1A25]" />}

            {/* Subtle Overlay Texture */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,#fff_1px,transparent_1px)] bg-[length:16px_16px]" />
            
            {/* Right Door Handle */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-24 bg-gradient-to-l from-yellow-200 via-yellow-500 to-yellow-700 rounded-full shadow-lg border border-yellow-300/30">
               <div className="absolute inset-y-2 inset-x-0.5 bg-white/20 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating CTA (Stays behind doors) */}
      {!isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 md:mt-14 px-10 py-4 rounded-full shadow-2xl border backdrop-blur-xl animate-pulse active:scale-95 transition-transform z-[100]"
          style={{ 
            backgroundColor: `${theme.colorPrimary}25`, 
            borderColor: `${theme.colorPrimary}60`,
            boxShadow: `0 10px 40px ${theme.colorPrimary}30`
          }}
        >
          <p 
            className="font-sans text-[10px] md:text-[13px] uppercase tracking-[0.5em] font-black"
            style={{ color: theme.colorPrimary, textShadow: `0 0 20px ${theme.colorPrimary}40` }}
          >
            Tap Handles to Open
          </p>
        </motion.div>
      )}

    </motion.div>
  );
}
