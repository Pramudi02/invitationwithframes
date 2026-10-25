'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function FullPageLoader({ isLoading, onLoadComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFadeOut(true);
      const timer = setTimeout(() => {
        onLoadComplete?.();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading, onLoadComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-white pointer-events-none"
      style={{ pointerEvents: fadeOut ? 'none' : 'auto' }}
    >
      <div className="flex flex-col items-center gap-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-3 border-transparent rounded-full"
          style={{ borderTopColor: 'var(--colorPrimary)', borderRightColor: 'var(--colorPrimary)' }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1 }}
          className="text-sm tracking-widest uppercase font-sans"
          style={{ color: 'var(--colorTextDark)' }}
        >
          Loading
        </motion.p>
      </div>
    </motion.div>
  );
}
