'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function CoupleReveal({ config, onOpen, onStart, onRoseLoaded, children, labels = {}, birthdayData = null, generalData = null }) {
  const [stage, setStage] = useState('idle'); // 'idle' | 'running' | 'revealing' | 'done'
  const [roseLoaded, setRoseLoaded] = useState(false);
  const [hideRose, setHideRose] = useState(false);

  const groomImg = config.coupleImages?.groom;
  const brideImg = config.coupleImages?.bride;

  const displayName = birthdayData?.celebrantName
    || generalData?.eventTitle
    || generalData?.hostName
    || config?.couple?.displayNames
    || '';

  // For rose animation: wait for gif to load, then use its duration
  // For couple running: use fixed 3s before reveal, 5s total
  const isRoseStyle = config.revealStyle === 'couple_rose';
  const roseDuration = config.coupleRevealRoseDuration || 3300; // milliseconds, user can override
  const roseRevealDelay = isRoseStyle && roseLoaded ? roseDuration : 3000;

  useEffect(() => {
    if (stage !== 'running') {
      return undefined;
    }

    // Hide rose gif 300ms before reveal to prevent looping.
    const hideRoseTimer = setTimeout(() => {
      setHideRose(true);
    }, roseRevealDelay - 300);

    const metTimer = setTimeout(() => {
      setStage('revealing');
    }, roseRevealDelay);

    return () => {
      clearTimeout(hideRoseTimer);
      clearTimeout(metTimer);
    };
  }, [roseRevealDelay, stage]);

  useEffect(() => {
    if (stage !== 'revealing') {
      return undefined;
    }

    const doneTimer = setTimeout(() => {
      setStage('done');
      onOpen();
    }, 300);

    return () => clearTimeout(doneTimer);
  }, [onOpen, stage]);

  // Perfectly formed centered heart path
  const heartPath = "M0 -25 C -45 -70, -90 -25, -60 20 C -35 60, 0 110, 0 110 C 0 110, 35 60, 60 20 C 90 -25, 45 -70, 0 -25 Z";

  return (
    <>
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="heartClip" clipPathUnits="userSpaceOnUse">
            <motion.path
              d={heartPath}
              initial={{ scale: 0, x: "50vw", y: "50vh" }}
              animate={{
                scale: stage === 'revealing' ? 30 : 0,
                x: "50vw", y: "50vh"
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
            />
          </clipPath>
        </defs>
      </svg>

      {/* Tap-to-open screen */}
      {stage === 'idle' && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-cover bg-center"
          style={{
            backgroundColor: 'var(--colorBg)',
            backgroundImage: config.coupleRevealOpeningBgImage
              ? `url(${config.coupleRevealOpeningBgImage})`
              : undefined
          }}
        >
          <div className="absolute inset-0 bg-[var(--colorBg)]/50" />
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 text-4xl">🌸</div>
            <div className="absolute bottom-10 right-10 text-4xl">🌸</div>
            <div className="absolute top-1/4 right-20 text-2xl">✨</div>
            <div className="absolute bottom-1/4 left-20 text-2xl">✨</div>
          </div>

          <motion.button
            type="button"
            onClick={() => {
              onStart?.();
              setStage('running');
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full border border-[var(--colorPrimary)] bg-white/80 px-8 py-4 font-semibold uppercase tracking-[0.2em] text-[var(--colorPrimary)] shadow-lg backdrop-blur-sm"
          >
            tap to open
          </motion.button>
        </div>
      )}

      {/* The Running Layer */}
      {stage === 'running' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--colorBg)' }}>
          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 text-4xl">🌸</div>
            <div className="absolute bottom-10 right-10 text-4xl">🌸</div>
            <div className="absolute top-1/4 right-20 text-2xl">✨</div>
            <div className="absolute bottom-1/4 left-20 text-2xl">✨</div>
          </div>

          <div className="relative w-full max-w-lg h-64 flex items-center justify-center pointer-events-none">
            {config.revealStyle === 'couple_rose' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: hideRose ? 0 : 1, scale: 0.95 }}
                transition={{ duration: hideRose ? 0.3 : 1.2, ease: "easeOut" }}
                className="absolute flex items-center justify-center -translate-y-10"
              >
                {config.coupleRevealRoseGif ? (
                  <img
                    src={config.coupleRevealRoseGif}
                    alt="Rose Animation"
                    className="h-64 w-auto object-contain"
                    onLoad={() => {
                      setRoseLoaded(true);
                      onRoseLoaded?.();
                    }}
                  />
                ) : (
                  <span className="text-8xl">🌹</span>
                )}
              </motion.div>
            ) : (
              <>
                {/* Groom */}
                <motion.div
                  initial={{ x: '-100vw', opacity: 0 }}
                  animate={{ x: -70, opacity: 1 }}
                  transition={{ duration: 4, ease: "easeOut" }}
                  className="absolute"
                >
                  {groomImg ? (
                    <img src={groomImg} alt="Groom" className="h-40 w-auto object-contain" />
                  ) : (
                    <span className="text-7xl block transform -scale-x-100">🏃‍♂️</span>
                  )}
                </motion.div>

                {/* Bride */}
                <motion.div
                  initial={{ x: '100vw', opacity: 0 }}
                  animate={{ x: 70, opacity: 1 }}
                  transition={{ duration: 4, ease: "easeOut" }}
                  className="absolute"
                >
                  {brideImg ? (
                    <img src={brideImg} alt="Bride" className="h-40 w-auto object-contain" />
                  ) : (
                    <span className="text-7xl">🏃‍♀️</span>
                  )}
                </motion.div>
              </>
            )}

            {/* Text Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute -bottom-10 text-center"
            >
              <p className="font-script text-4xl text-[var(--colorPrimary)] drop-shadow-sm mb-2">
                {displayName}
              </p>
              <p className="text-[0.65rem] tracking-[0.2em] uppercase text-[var(--colorTextDark)] opacity-80 font-bold border-t border-[var(--colorPrimary)]/50 pt-2 inline-block">
                {labels.coupleRevealTagline || 'Are Getting Married'}
              </p>
            </motion.div>
          </div>

          <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-1 bg-[var(--colorPrimary)]/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: roseRevealDelay / 1000, ease: "linear" }}
              className="h-full bg-[var(--colorPrimary)]"
            />
          </motion.div>
        </div>
      )}

      {/* The Dynamic Masked Content Layer */}
      {stage === 'revealing' && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ filter: "blur(20px)", opacity: 0 }}
          animate={{ filter: "blur(0px)", opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ clipPath: "url(#heartClip)" }}
        >
          {children}
        </motion.div>
      )}

      {/* Once done, the component unmounts itself entirely via ClientHome.jsx state, leaving just the raw children in ClientHome. */}
    </>
  );
}
