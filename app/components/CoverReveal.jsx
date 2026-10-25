'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSyncExternalStore } from 'react';

export default function CoverReveal({ config, onOpen, labels = {}, birthdayData = null, generalData = null }) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const { couple = {}, wedding = {}, revealCoverImage } = config || {};
  const displayName = birthdayData?.celebrantName
    ? birthdayData.celebrantName
    : (generalData?.eventTitle || generalData?.hostName)
      ? (generalData.eventTitle || generalData.hostName)
      : null;

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: "easeInOut" } }}
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: 'var(--colorBg)',
        ...(revealCoverImage ? {
          backgroundImage: `url(${revealCoverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {})
      }}
    >
      {/* Overlay for better readability if needed */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        className="relative z-10 w-[90%] max-w-lg bg-white/60 backdrop-blur-md p-8 md:p-14 text-center shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/40 rounded-2xl"
      >
        {/* Paper texture (optional, subtle) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }}
        />

        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-2xl" />

        <div className="relative z-10 flex flex-col items-center">
          <p className="font-script text-2xl md:text-3xl text-[var(--colorPrimary)] mb-6">
            {labels.coverRevealTagline || "We're getting married!"}
          </p>

          {/* Decorative element */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-8 bg-[var(--colorPrimary)] opacity-30" />
            <span className="text-[var(--colorPrimary)] text-xl">🌿</span>
            <div className="h-px w-8 bg-[var(--colorPrimary)] opacity-30" />
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-[#2C2018] mb-12 leading-tight">
            {displayName
              ? displayName.toUpperCase()
              : <>{(couple?.groom?.firstName || '').toUpperCase()} & {(couple?.bride?.firstName || '').toUpperCase()}</>
            }
          </h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpen}
            className="group flex flex-col items-center gap-3 outline-none"
          >
            <div className="w-16 h-16 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:border-[var(--colorPrimary)] group-hover:bg-[var(--colorPrimary)]/10 shadow-lg">
              <span className="text-2xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">💌</span>
            </div>
            <span className="font-sans text-[0.65rem] tracking-[0.25em] uppercase text-[var(--colorPrimary)] font-bold drop-shadow-sm">
              Open Invitation
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* Floating elements for extra flair */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-10 text-4xl opacity-20"
        >🍃</motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 right-10 text-4xl opacity-20"
        >🌸</motion.div>
      </div>
    </motion.div>
  );
}
