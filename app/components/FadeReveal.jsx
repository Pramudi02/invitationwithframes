'use client';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function FadeReveal({ config, onOpen }) {
  const { revealCoverImage, heroImage } = config;
  const bgImage = revealCoverImage || heroImage;

  useEffect(() => {
    // Automatically transition to the hero section after 3.5 seconds
    const timer = setTimeout(() => {
      onOpen();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onOpen]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
    >
      {bgImage ? (
        <div className="absolute inset-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 4, ease: "easeOut" }}
            className="w-full h-full overflow-hidden"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-slate-900" />
      )}
      
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Loading indicator (optional, very subtle) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 font-sans text-[10px] tracking-[0.5em] uppercase"
      >
        Loading
      </motion.div>
    </motion.div>
  );
}
