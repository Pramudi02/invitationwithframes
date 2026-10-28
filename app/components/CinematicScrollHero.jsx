'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CinematicScrollHero({ config, hasOpened }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(-1);
  const activeFrameRef = useRef(0);

  const [frameList, setFrameList] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);

  // Extract couple info for subtle elegant top badge
  const couple = config?.couple || {};
  const bride = couple.bride?.firstName || 'Bride';
  const groom = couple.groom?.firstName || 'Groom';
  const displayNames = couple.displayNames || `${groom} & ${bride}`;

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

      // Fallback: 11 default user envelope frames
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
    if (!img || !img.complete || img.naturalWidth === 0) {
      if (img && !img.complete) {
        img.onload = () => {
          if (activeFrameRef.current === frameIdx) {
            drawFrame(frameIdx);
          }
        };
      }
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    if (width === 0 || height === 0) return;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const canvasRatio = width / height;

    let drawW, drawH, drawX, drawY;

    // Desktop widescreen: contain mode to keep full vertical envelope visible
    if (canvasRatio > 1.1) {
      const scale = height / imgHeight;
      drawW = imgWidth * scale;
      drawH = height;
      drawX = (width - drawW) / 2;
      drawY = 0;
    } else {
      // Mobile & vertical displays: cover mode for full edge-to-edge immersion
      const hRatio = width / imgWidth;
      const vRatio = height / imgHeight;
      const ratio = Math.max(hRatio, vRatio);
      drawW = imgWidth * ratio;
      drawH = imgHeight * ratio;
      drawX = (width - drawW) / 2;
      drawY = (height - drawH) / 2;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, imgWidth, imgHeight, drawX, drawY, drawW, drawH);

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
        // If this image is the active frame (or initial frame 0), draw it immediately!
        if (idx === activeFrameRef.current || (activeFrameRef.current === 0 && idx === 0)) {
          drawFrame(idx);
        }
      };

      loadedImages[idx] = img;
    });

    imagesRef.current = loadedImages;

    // If frame 0 is already cached in browser memory, draw immediately
    if (loadedImages[0] && loadedImages[0].complete && loadedImages[0].naturalWidth > 0) {
      drawFrame(0);
    }

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

    if (width === 0 || height === 0) return;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Immediately repaint active frame
    const activeIdx = activeFrameRef.current >= 0 ? activeFrameRef.current : 0;
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

  // 5. When invitation opens, ensure canvas is measured and initial frame is painted
  useEffect(() => {
    if (hasOpened) {
      const timer = setTimeout(() => {
        resizeCanvas();
        drawFrame(0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [hasOpened, resizeCanvas, drawFrame]);

  // 6. Scroll-scrubbing engine
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

            activeFrameRef.current = targetFrame;
            setActiveFrameIndex(targetFrame);
            drawFrame(targetFrame);
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

  // 7. Natural scroll track height (scales with number of frames)
  const scrollHeight = useMemo(() => {
    if (totalFrames <= 0) return '100vh';
    if (totalFrames <= 20) return `${Math.max(220, totalFrames * 22)}vh`;
    if (totalFrames <= 60) return `${Math.max(300, totalFrames * 6)}vh`;
    return `${Math.min(650, totalFrames * 2.5)}vh`;
  }, [totalFrames]);

  const currentFrameUrl = frameList[activeFrameIndex] || frameList[0] || '';

  return (
    <section
      ref={containerRef}
      aria-label="Cinematic Frame Motion Section"
      className="relative w-full z-10"
      style={{ height: scrollHeight }}
    >
      {/* Sticky 100dvh Fullscreen Viewport Stage */}
      <div className="sticky top-0 w-full h-screen h-[100dvh] overflow-hidden bg-[#0d0407] flex items-center justify-center">
        
        {/* 1. Ambient Blurred Backdrop for widescreen displays */}
        {currentFrameUrl && (
          <img
            src={currentFrameUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110 pointer-events-none z-0"
          />
        )}

        {/* 2. Hardware-accelerated visible image layer (GUARANTEES 100% VISIBILITY AT ALL TIMES) */}
        {currentFrameUrl && (
          <img
            src={currentFrameUrl}
            alt="Wedding envelope frame"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-[1]"
          />
        )}

        {/* 3. High-performance canvas scrub layer for 60fps frame painting */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block bg-transparent pointer-events-none z-[2]"
        />

        {/* 4. Elegant Minimal Top Pill Badge (Does not obstruct wax seal) */}
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-10 transition-opacity duration-500 select-none"
          style={{ opacity: scrollProgress < 0.92 ? 1 : 0 }}
        >
          <div className="px-5 py-2 rounded-full bg-black/45 backdrop-blur-md border border-[#D9A85C]/35 text-center shadow-lg">
            <p className="font-sans text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#F2EFE7]">
              {displayNames}
            </p>
          </div>
        </div>

        {/* 5. Sleek Scroll-Down Indicator Cue */}
        <div
          className="absolute bottom-6 sm:bottom-8 flex flex-col items-center text-white/90 pointer-events-none z-10 transition-opacity duration-300 select-none"
          style={{ opacity: scrollProgress < 0.85 ? Math.max(0, 1 - scrollProgress * 1.3) : 0 }}
        >
          <span className="font-sans text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase mb-1 drop-shadow-md text-[#FBE398]">
            Scroll down to open
          </span>
          <div className="w-[1px] h-7 bg-gradient-to-b from-[#FBE398] to-transparent animate-pulse" />
          <ChevronDown size={16} className="animate-bounce mt-1 text-[#FBE398] drop-shadow" />
        </div>

      </div>
    </section>
  );
}
