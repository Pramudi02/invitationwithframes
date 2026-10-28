'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function CinematicScrollHero({ config }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(-1);

  const [frameList, setFrameList] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);

  // Extract couple & wedding data
  const couple = config?.couple || {};
  const bride = couple.bride?.firstName || 'Bride';
  const groom = couple.groom?.firstName || 'Groom';
  const displayNames = couple.displayNames || `${groom} & ${bride}`;
  const tagline = couple.tagline || 'Two hearts, one destination.';
  const displayDate = config?.wedding?.displayDate || 'December 19, 2026';
  const venueCity = config?.events?.ceremony?.venueName || 'COLOMBO';

  // 1. Fetch available frames dynamically from API or config
  useEffect(() => {
    let isCancelled = false;

    async function loadFrames() {
      // If config explicitly defines frames, use those
      if (config?.cinematicFrames?.frames && config.cinematicFrames.frames.length > 0) {
        if (!isCancelled) setFrameList(config.cinematicFrames.frames);
        return;
      }

      // Otherwise discover frames dynamically from server
      try {
        const slug = config?.slug || '';
        const res = await fetch(`/api/frames?slug=${slug}`);
        const data = await res.json();
        if (data.success && data.frames && data.frames.length > 0) {
          if (!isCancelled) setFrameList(data.frames);
          return;
        }
      } catch (err) {
        console.warn('Frame discovery fallback:', err);
      }

      // Fallback if discovery fails
      if (!isCancelled) {
        setFrameList(Array.from({ length: 11 }, (_, i) => `/frames/frame_${String(i + 1).padStart(4, '0')}.webp`));
      }
    }

    loadFrames();
    return () => { isCancelled = true; };
  }, [config?.slug, config?.cinematicFrames]);

  const totalFrames = frameList.length;

  // 2. High-performance canvas drawing
  const drawFrame = useCallback((frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIdx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // object-fit: cover scaling
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

    currentFrameRef.current = frameIdx;
  }, []);

  // 3. Preload all frame images into memory
  useEffect(() => {
    if (totalFrames === 0) return;

    let isCancelled = false;
    const loadedImages = [];

    frameList.forEach((url, idx) => {
      const img = new Image();
      img.src = url;

      img.onload = () => {
        if (isCancelled) return;
        // Draw the very first frame immediately as soon as it arrives!
        if (idx === 0 && currentFrameRef.current === -1) {
          drawFrame(0);
        }
      };

      loadedImages[idx] = img;
    });

    imagesRef.current = loadedImages;

    return () => {
      isCancelled = true;
    };
  }, [frameList, totalFrames, drawFrame]);

  // 4. Set canvas pixel density and handle resize
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Immediately repaint current frame
    const activeIdx = currentFrameRef.current >= 0 ? currentFrameRef.current : 0;
    drawFrame(activeIdx);
  }, [drawFrame]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
    };
  }, [resizeCanvas]);

  // 5. Scroll-scrubbing engine
  useEffect(() => {
    if (totalFrames === 0) return;

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
            // progress: 0.0 at top of section, 1.0 at bottom of section
            const rawProgress = -rect.top / totalScrollDistance;
            const progress = Math.max(0, Math.min(1, rawProgress));
            setScrollProgress(progress);

            // Compute frame index (0 to totalFrames - 1)
            const targetFrame = Math.min(
              totalFrames - 1,
              Math.max(0, Math.floor(progress * totalFrames))
            );

            setActiveFrameIndex(targetFrame);

            if (targetFrame !== currentFrameRef.current) {
              drawFrame(targetFrame);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalFrames, drawFrame]);

  // 6. Natural scroll track height (scales with number of frames)
  const scrollHeight = useMemo(() => {
    if (totalFrames <= 0) return '100vh';
    if (totalFrames <= 20) return `${Math.max(220, totalFrames * 22)}vh`;
    if (totalFrames <= 60) return `${Math.max(300, totalFrames * 6)}vh`;
    return `${Math.min(650, totalFrames * 2.5)}vh`;
  }, [totalFrames]);

  // Phase opacity calculations
  const getPhaseOpacity = (start, end, p = scrollProgress) => {
    if (p < start || p > end) return 0;
    const mid = (start + end) / 2;
    const halfSpan = (end - start) / 2;
    const dist = Math.abs(p - mid);
    return Math.max(0, Math.min(1, 1 - dist / halfSpan));
  };

  const phase1Opacity = getPhaseOpacity(0.02, 0.24);
  const phase2Opacity = getPhaseOpacity(0.26, 0.48);
  const phase3Opacity = getPhaseOpacity(0.50, 0.72);
  const phase4Opacity = getPhaseOpacity(0.74, 0.92);
  const tailFadeOpacity = scrollProgress > 0.88 ? (scrollProgress - 0.88) / 0.12 : 0;

  return (
    <section
      ref={containerRef}
      aria-label="Cinematic Frame Motion Section"
      className="relative w-full z-10"
      style={{ height: scrollHeight }}
    >
      {/* Sticky 100dvh Fullscreen Viewport Stage */}
      <div className="sticky top-0 w-full h-screen h-[100dvh] overflow-hidden bg-[#050C1E]">
        
        {/* Scrubbed High-Performance Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block bg-[#050C1E]"
        />

        {/* Fallback image behind canvas for instant visual feedback */}
        {frameList[0] && (
          <img
            src={frameList[activeFrameIndex] || frameList[0]}
            alt="Cinematic frame"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none -z-10"
          />
        )}

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 pointer-events-none z-[5] bg-gradient-to-b from-[#050C1E]/60 via-transparent to-[#050C1E]/75" />

        {/* Tail Transition: Fades into next section */}
        <div
          className="absolute inset-0 pointer-events-none z-[6] bg-gradient-to-b from-transparent via-[#050C1E]/70 to-[#050C1E] transition-opacity duration-300"
          style={{ opacity: tailFadeOpacity }}
        />

        {/* ========================================================
            SYNCHRONIZED FLOATING FRAMER MOTION OVERLAYS
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
              Scroll down
            </p>
            <div className="w-[1px] h-8 bg-gradient-to-b from-[#A9BEDD] to-transparent animate-pulse" />
            <ChevronDown size={14} className="animate-bounce mt-1 text-[#D9A85C]" />
          </div>

        </div>

      </div>
    </section>
  );
}
