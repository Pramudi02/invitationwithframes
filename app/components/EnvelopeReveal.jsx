"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function EnvelopeReveal({ config, onOpenInvitation }) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract Dynamic Values
  const themeColor = config?.theme?.colorPrimary || '#7eb5b2';
  const bgImage = config?.coverImage || null;

  // Texts
  const tagline = config?.labels?.coverRevealTagline || "Welcome";
  const coupleNames = config?.couple ? `${config?.couple?.bride?.firstName || ''} & ${config?.couple?.groom?.firstName || ''}` : 'Nethmi & Isuru';
  
  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      if (onOpenInvitation) onOpenInvitation();
    }, 800); 
  };

  const backgroundStyle = bgImage 
    ? { 
        backgroundImage: `url(${bgImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }
    : {
        backgroundColor: themeColor,
        backgroundImage: `repeating-linear-gradient(to right, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15) 15px, rgba(0, 0, 0, 0.1) 15px, rgba(0, 0, 0, 0.1) 30px)`
      };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div 
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        >
          {/* Background (z-0) */}
          <div 
            className="absolute inset-0 z-0" 
            style={backgroundStyle}
          >
            {bgImage && <div className="absolute inset-0 bg-black/30" />}
          </div>

          {/* The Glassmorphism Card (Foreground, z-10) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="z-10 backdrop-blur-xl bg-white/10 border border-white/30 shadow-2xl rounded-3xl p-8 max-w-lg w-[90%] text-center flex flex-col items-center gap-6"
          >
            <h2 className="text-white text-xl md:text-2xl font-serif tracking-widest uppercase">
              {tagline}
            </h2>
            
            <div className="w-16 h-[1px] bg-white/50" />

            <h1 className="text-white text-4xl md:text-5xl font-sans font-light tracking-tight">
              {coupleNames}
            </h1>

            <button 
              onClick={handleOpen}
              className="mt-4 rounded-full bg-white/20 backdrop-blur-md border border-white/20 px-6 py-3 text-white text-sm font-bold tracking-widest uppercase hover:bg-white/30 transition-colors"
            >
              OPEN INVITATION
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
