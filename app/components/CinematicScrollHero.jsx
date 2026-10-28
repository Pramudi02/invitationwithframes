'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CinematicScrollHero({ config, hasOpened }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);

  const activeFrameRef = useRef(0);
  const totalFramesRef = useRef(0);
  const lastStepTimeRef = useRef(0);
  const deltaAccumulatorRef = useRef(0);
  const touchStartYRef = useRef(null);

  const [frameList, setFrameList] = useState([]);
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
  totalFramesRef.current = totalFrames;

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

    // Desktop widescreen: contain mode to keep full vertical envelope visible in the exact same center position
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
        if (idx === activeFrameRef.current || (activeFrameRef.current === 0 && idx === 0)) {
          drawFrame(idx);
        }
      };

      loadedImages[idx] = img;
    });

    imagesRef.current = loadedImages;

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

    drawFrame(activeFrameRef.current);
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

  // 6. Step to frame helper
  const setFrame = useCallback((newIdx) => {
    const clamped = Math.max(0, Math.min(totalFramesRef.current - 1, newIdx));
    if (clamped !== activeFrameRef.current) {
      activeFrameRef.current = clamped;
      setActiveFrameIndex(clamped);
      drawFrame(clamped);
    }
  }, [drawFrame]);

  const stepNext = useCallback(() => {
    if (activeFrameRef.current < totalFramesRef.current - 1) {
      setFrame(activeFrameRef.current + 1);
      return true;
    }
    return false;
  }, [setFrame]);

  const stepPrev = useCallback(() => {
    if (activeFrameRef.current > 0) {
      setFrame(activeFrameRef.current - 1);
      return true;
    }
    return false;
  }, [setFrame]);

  // 7. IN-PLACE FRAME SCROLL ENGINE
  // Locks position at the top while frames advance one-by-one on scroll.
  // The element DOES NOT move up until the last frame is reached!
  useEffect(() => {
    if (totalFrames <= 1) return;

    const STEP_THRESHOLD = 35; // pixel delta accumulation
    const STEP_COOLDOWN = 60;  // ms minimum between frames for silky smooth scrubbing

    // Mouse Wheel / Trackpad Scroll
    const handleWheel = (e) => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const current = activeFrameRef.current;
      const total = totalFramesRef.current;
      const now = performance.now();

      // If scrolling DOWN and not yet at the last frame:
      if (e.deltaY > 0 && current < total - 1) {
        // Prevent page from scrolling up! Stay in same position!
        e.preventDefault();

        if (now - lastStepTimeRef.current > STEP_COOLDOWN) {
          deltaAccumulatorRef.current += e.deltaY;
          if (deltaAccumulatorRef.current >= STEP_THRESHOLD) {
            deltaAccumulatorRef.current = 0;
            lastStepTimeRef.current = now;
            stepNext();
          }
        }
        return;
      }

      // If scrolling UP and at the very top of the page:
      if (e.deltaY < 0 && scrollY <= 5 && current > 0) {
        e.preventDefault();

        if (now - lastStepTimeRef.current > STEP_COOLDOWN) {
          deltaAccumulatorRef.current += e.deltaY;
          if (deltaAccumulatorRef.current <= -STEP_THRESHOLD) {
            deltaAccumulatorRef.current = 0;
            lastStepTimeRef.current = now;
            stepPrev();
          }
        }
        return;
      }

      // Otherwise: At the last frame and scrolling down -> allow normal page scroll down!
    };

    // Touch events for Mobile (iPhone, Android)
    const handleTouchStart = (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (touchStartYRef.current === null || !e.touches || e.touches.length === 0) return;

      const currentY = e.touches[0].clientY;
      const diffY = touchStartYRef.current - currentY;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const current = activeFrameRef.current;
      const total = totalFramesRef.current;
      const now = performance.now();

      // Swiping UP (scrolling down)
      if (diffY > 20 && current < total - 1) {
        e.preventDefault();

        if (now - lastStepTimeRef.current > STEP_COOLDOWN) {
          if (diffY > 30) {
            touchStartYRef.current = currentY;
            lastStepTimeRef.current = now;
            stepNext();
          }
        }
        return;
      }

      // Swiping DOWN (scrolling up at top of page)
      if (diffY < -20 && scrollY <= 5 && current > 0) {
        e.preventDefault();

        if (now - lastStepTimeRef.current > STEP_COOLDOWN) {
          if (diffY < -30) {
            touchStartYRef.current = currentY;
            lastStepTimeRef.current = now;
            stepPrev();
          }
        }
        return;
      }
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = null;
    };

    // Keyboard ArrowDown / ArrowUp / Space support
    const handleKeyDown = (e) => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const current = activeFrameRef.current;
      const total = totalFramesRef.current;

      if ((e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') && current < total - 1) {
        e.preventDefault();
        stepNext();
      } else if ((e.key === 'ArrowUp' || e.key === 'PageUp') && scrollY <= 5 && current > 0) {
        e.preventDefault();
        stepPrev();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [totalFrames, stepNext, stepPrev]);

  const isLastFrame = activeFrameIndex >= totalFrames - 1;
  const currentFrameUrl = frameList[activeFrameIndex] || frameList[0] || '';

  // Handler when user clicks bottom cue or envelope
  const handleStageClick = () => {
    if (!isLastFrame) {
      stepNext();
    } else {
      // At last frame, smooth scroll to the next invitation section
      const nextSection = document.getElementById('hero-invitation-section');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      ref={containerRef}
      aria-label="Cinematic Frame Motion Section"
      className="relative w-full h-screen h-[100dvh] overflow-hidden bg-[#0d0407] flex items-center justify-center select-none"
    >
      {/* 1. Ambient Blurred Backdrop for widescreen displays */}
      {currentFrameUrl && (
        <img
          src={currentFrameUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-35 scale-110 pointer-events-none z-0"
        />
      )}

      {/* 2. Hardware-accelerated visible image layer (GUARANTEES 100% VISIBILITY IN SAME POSITION) */}
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
      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-10 select-none">
        <div className="px-5 py-2 rounded-full bg-black/45 backdrop-blur-md border border-[#D9A85C]/35 text-center shadow-lg">
          <p className="font-sans text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#F2EFE7]">
            {displayNames}
          </p>
        </div>
      </div>

      {/* 5. Interactive Bottom Cue Indicator */}
      <div
        onClick={handleStageClick}
        className="absolute bottom-6 sm:bottom-8 flex flex-col items-center text-white/90 z-20 cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <span className="font-sans text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase mb-1 drop-shadow-md text-[#FBE398]">
          {!isLastFrame ? 'Scroll down to open' : 'Scroll to view invitation'}
        </span>

        {/* Subtle Frame Dots Indicator */}
        <div className="flex items-center gap-1 my-1.5">
          {frameList.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full transition-all duration-200 ${
                idx === activeFrameIndex
                  ? 'w-4 bg-[#FBE398]'
                  : 'w-1 bg-white/30'
              }`}
            />
          ))}
        </div>

        <ChevronDown
          size={18}
          className={`text-[#FBE398] drop-shadow transition-transform duration-300 ${
            isLastFrame ? 'animate-bounce' : 'animate-pulse'
          }`}
        />
      </div>
    </section>
  );
}
