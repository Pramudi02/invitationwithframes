'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function CinematicScrollHero({ config, onComplete }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Extract couple & wedding data
  const couple = config?.couple || {};
  const bride = couple.bride?.firstName || 'Bride';
  const groom = couple.groom?.firstName || 'Groom';
  const displayNames = couple.displayNames || `${groom} & ${bride}`;
  const tagline = couple.tagline || 'Two hearts, one destination.';
  const displayDate = config?.wedding?.displayDate || 'December 19, 2026';
  const venueCity = config?.events?.ceremony?.venueName || 'COLOMBO';

  // Frames source resolution: from config or default manifest
  const cinematicConfig = config?.cinematicFrames || {};
  const frameUrls = useMemo(() => {
    if (cinematicConfig.frames && cinematicConfig.frames.length > 0) {
      return cinematicConfig.frames;
    }
    // Fallback: check if standard frames exist
    const count = cinematicConfig.frameCount || 60;
    const folder = cinematicConfig.folder || `/frames/${config?.slug || 'wedding'}`;
    return Array.from({ length: count }, (_, i) => `${folder}/frame-${String(i + 1).padStart(4, '0')}.webp`);
  }, [cinematicConfig, config?.slug]);

  const totalFrames = frameUrls.length;

  // Draw a frame to canvas with object-fit: cover scaling
  const drawFrame = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // object-fit: cover calculation
    const hRatio = width / imgWidth;
    const vRatio = height / imgHeight;
    const ratio = Math.max(hRatio, vRatio);

    const centerShiftX = (width - imgWidth * ratio) / 2;
    const centerShiftY = (height - imgHeight * ratio) / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(
      img,
      0, 0, imgWidth, imgHeight,
      centerShiftX, centerShiftY, imgWidth * ratio, imgHeight * ratio
    );
  }, []);

  // Preload all frames into memory
  useEffect(() => {
    if (totalFrames === 0) {
      setIsReady(true);
      return;
    }

    let loadedCount = 0;
    const images = [];
    let isCancelled = false;

    frameUrls.forEach((url, index) => {
      const img = new Image();
      img.src = url;

      img.onload = () => {
        if (isCancelled) return;
        loadedCount++;
        const pct = Math.round((loadedCount / totalFrames) * 100);
        setLoadingProgress(pct);

        // Draw first frame immediately when ready
        if (index === 0) {
          drawFrame(img);
        }

        if (loadedCount >= totalFrames) {
          setIsReady(true);
        }
      };

      img.onerror = () => {
        if (isCancelled) return;
        loadedCount++;
        const pct = Math.round((loadedCount / totalFrames) * 100);
        setLoadingProgress(pct);
        if (loadedCount >= totalFrames) {
          setIsReady(true);
        }
      };

      images.push(img);
    });

    imagesRef.current = images;

    // Failsafe timeout in case some image fails
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 4000);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [frameUrls, totalFrames, drawFrame]);

  // Handle Resize & Canvas Resolution
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Redraw current frame
      const currentIdx = Math.min(
        totalFrames - 1,
        Math.max(0, Math.floor(scrollProgress * (totalFrames - 1)))
      );
      if (imagesRef.current[currentIdx]) {
        drawFrame(imagesRef.current[currentIdx]);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [scrollProgress, totalFrames, drawFrame]);

  // Scroll Scrubbing Engine
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const container = containerRef.current;
          if (!container) {
            ticking = false;
            return;
          }

          const rect = container.getBoundingClientRect();
          const totalScrollDistance = rect.height - window.innerHeight;

          if (totalScrollDistance > 0) {
            const rawProgress = -rect.top / totalScrollDistance;
            const progress = Math.max(0, Math.min(1, rawProgress));
            setScrollProgress(progress);

            if (totalFrames > 0 && imagesRef.current.length > 0) {
              const frameIndex = Math.min(
                totalFrames - 1,
                Math.max(0, Math.floor(progress * (totalFrames - 1)))
              );
              const img = imagesRef.current[frameIndex];
              if (img && img.complete) {
                drawFrame(img);
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalFrames, drawFrame]);

  // Dynamic Scroll Height based on frame count
  const scrollHeight = useMemo(() => {
    if (totalFrames <= 0) return '100vh';
    return `${Math.max(450, Math.min(700, totalFrames * 2.5))}vh`;
  }, [totalFrames]);

  // Phase opacity helpers
  const getPhaseOpacity = (start, end, p = scrollProgress) => {
    if (p < start || p > end) return 0;
    const mid = (start + end) / 2;
    const halfSpan = (end - start) / 2;
    const dist = Math.abs(p - mid);
    return Math.max(0, Math.min(1, 1 - dist / halfSpan));
  };

  const phase1Opacity = getPhaseOpacity(0.02, 0.22);
  const phase2Opacity = getPhaseOpacity(0.24, 0.44);
  const phase3Opacity = getPhaseOpacity(0.46, 0.66);
  const phase4Opacity = getPhaseOpacity(0.68, 0.88);
  const tailFadeOpacity = scrollProgress > 0.86 ? (scrollProgress - 0.86) / 0.14 : 0;

  return (
    <>
      {/* 1. CINEMATIC BOARDING PRELOADER GATE */}
      <AnimatePresence>
        {!isReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#050C1E] text-white px-6 text-center select-none"
          >
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#A9BEDD] mb-4">
              Flight to Forever
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#F2EFE7] mb-2">
              {displayNames}
            </h2>
            <p className="font-serif italic text-base text-[#D9A85C] mb-8">
              {displayDate}
            </p>

            {/* Flight Path Progress Track */}
            <div className="w-64 max-w-xs relative my-4">
              <div className="h-[2px] w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D9A85C] to-[#FBE398] transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>

            <p className="font-sans text-[11px] tracking-widest text-[#A9BEDD] uppercase mt-2">
              Preparing your journey · {loadingProgress}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. TALL SCROLL FILM CONTAINER */}
      <section
        ref={containerRef}
        aria-label="Cinematic Frame Motion Section"
        className="relative w-full z-10"
        style={{ height: scrollHeight }}
      >
        {/* Sticky 100dvh Stage */}
        <div className="sticky top-0 w-full h-screen h-[100dvh] overflow-hidden bg-[#050C1E]">
          
          {/* Scrubbed Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full block bg-[#050C1E]"
          />

          {/* Cinematic Vignette */}
          <div className="absolute inset-0 pointer-events-none z-[5] bg-gradient-to-b from-[#050C1E]/70 via-transparent to-[#050C1E]/80" />

          {/* Tail Transition: Fades into next section */}
          <div
            className="absolute inset-0 pointer-events-none z-[6] bg-gradient-to-b from-transparent via-[#050C1E]/70 to-[#050C1E] transition-opacity duration-300"
            style={{ opacity: tailFadeOpacity }}
          />

          {/* ========================================================
              3. SYNCHRONIZED FLOATING FRAMER MOTION OVERLAYS
              ======================================================== */}
          <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center p-6 text-center">
            
            {/* Phase 1: Formal Invitation Opening */}
            <div
              className="absolute transition-opacity duration-500 max-w-lg"
              style={{ opacity: phase1Opacity }}
            >
              <p className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-[#A9BEDD] mb-2">
                Together with their families
              </p>
              <h3 className="font-serif text-3xl sm:text-5xl font-bold text-[#F2EFE7] italic">
                You Are Cordially Invited
              </h3>
            </div>

            {/* Phase 2: Romantic Tagline */}
            <div
              className="absolute transition-opacity duration-500 max-w-md"
              style={{ opacity: phase2Opacity }}
            >
              <p className="font-serif italic text-2xl sm:text-4xl text-[#F2EFE7] leading-relaxed">
                "{tagline}"
              </p>
            </div>

            {/* Phase 3: Destination Highlight */}
            <div
              className="absolute transition-opacity duration-500 max-w-md"
              style={{ opacity: phase3Opacity }}
            >
              <p className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-[#D9A85C] mb-2">
                Destination
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-widest text-[#F2EFE7] uppercase">
                {venueCity}
              </h2>
            </div>

            {/* Phase 4: Couple Names Grand Reveal */}
            <div
              className="absolute transition-opacity duration-500 max-w-xl"
              style={{ opacity: phase4Opacity }}
            >
              <p className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-[#D9A85C] mb-3">
                Celebrating The Union Of
              </p>
              <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold text-[#F2EFE7] leading-none mb-4">
                {displayNames}
              </h1>
              <p className="font-serif italic text-lg sm:text-xl text-[#FBE398]">
                {displayDate}
              </p>
            </div>

            {/* Scroll Down Cue */}
            <div
              className="absolute bottom-6 sm:bottom-10 flex flex-col items-center text-[#A9BEDD] transition-opacity duration-300"
              style={{ opacity: scrollProgress < 0.85 ? 1 - scrollProgress * 1.1 : 0 }}
            >
              <p className="font-sans text-[9px] sm:text-[10px] font-semibold tracking-[0.3em] uppercase mb-1">
                Scroll to explore
              </p>
              <div className="w-[1px] h-8 bg-gradient-to-b from-[#A9BEDD] to-transparent animate-pulse" />
              <ChevronDown size={14} className="animate-bounce mt-1 text-[#D9A85C]" />
            </div>

          </div>

        </div>
      </section>
    </>
  );
}
