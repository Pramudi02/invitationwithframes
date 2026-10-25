"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export default function PremiumEnvelope({ config, onOpenInvitation }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const envelopeVideo = config?.envelopeVideo || '/videos/envelope-open.mp4';
  const openMode = config?.envelopeOpenMode || 'auto';
  const [waitingForTap, setWaitingForTap] = useState(false);
  const isAutoOpen = openMode === 'auto' && !waitingForTap;

  const forceSkipAnimation = () => {
    setMediaReady(true);
    onOpenInvitation();
  };

  useEffect(() => {
    if (openMode !== 'tap' && videoRef.current) {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // The OS blocked autoplay (e.g., iOS Low Power Mode).
          console.warn("Autoplay blocked by OS. Falling back to Tap-to-Open UI.");
          // Instantly switch to our beautiful custom Tap to Open overlay
          setWaitingForTap(true); 
        });
      }
    }
  }, [openMode]); // Agent: ensure this runs when the video mounts

  useEffect(() => {
    // Clear old aggressive Service Workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          // Unregister existing to flush bad caches
          registration.unregister();
        }
        // Re-register the new, safe worker
        navigator.serviceWorker.register('/service-worker.js');
      });
    }

    if (openMode === 'tap' || waitingForTap) {
      // Instantly show the first frame and the Tap button. NO loading spinner.
      setMediaReady(true);
      if (openMode === 'tap') setWaitingForTap(true);
    } else {
      // 1. If the video hasn't successfully loaded and completed within 2.5s, skip EVERYTHING.
      const failsafe = setTimeout(() => {
        forceSkipAnimation();
      }, 2500);
      return () => clearTimeout(failsafe);
    }
  }, [openMode, waitingForTap]);

  const handleOpen = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setWaitingForTap(false); // Hide the overlay
    
    if (videoRef.current) {
      // Fast-start optimization: Ensure we are at the start and play immediately
      videoRef.current.currentTime = 0.1;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Video play failed:", error);
          // If play fails (e.g., policy or network), skip directly to invitation
          forceSkipAnimation();
        });
      }
      
      // Ensure the transition happens when the video finishes
      videoRef.current.onended = handleVideoEnd;
    } else {
      // Fallback if video ref is missing
      forceSkipAnimation();
    }
  };

  // Auto-open: trigger as soon as media is ready
  useEffect(() => {
    if (isAutoOpen && mediaReady && !isAnimating) {
      handleOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoOpen, mediaReady]);

  const handleVideoEnd = () => {
    setHasEnded(true);
    // Allow fade out animation to play before swapping components in parent
    setTimeout(() => {
      onOpenInvitation();
    }, 500);
  };

  return (
    <motion.div 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className={`z-[9999] flex items-center justify-center bg-gray-900/60 transition-all duration-500 ${!isAnimating && !isAutoOpen ? 'cursor-pointer' : ''} ${isAnimating ? 'pointer-events-none' : ''} fixed inset-0 w-screen h-screen overflow-hidden`}
      onClick={!isAutoOpen ? handleOpen : undefined}
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      
      <motion.div
        animate={{ opacity: hasEnded ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full flex items-center justify-center"
      >
        {/* Outer Wrapper: Acts as the mobile canvas (full screen) or desktop container */}
        <div className="relative w-full h-full sm:h-auto md:h-[85vh] sm:max-w-4xl lg:max-w-5xl md:max-w-none md:w-auto aspect-auto sm:aspect-[3/2] md:aspect-auto flex items-center justify-center sm:-translate-y-[10%] bg-transparent sm:overflow-visible">
          
          {/* Inner Video Wrapper: Centered horizontally on mobile, constrained & styled on desktop */}
          <div className="absolute inset-0 w-full h-full md:relative md:inset-auto md:h-full md:w-auto flex items-center justify-center md:rounded-2xl md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] md:border md:border-white/10 overflow-hidden bg-black">
            
            {/* Layer 2 - The Video or Fallback Image */}
            {envelopeVideo && !videoError ? (
              <video 
                key={envelopeVideo}
                ref={videoRef}
                className="h-full w-auto max-w-none absolute left-1/2 -translate-x-1/2 object-contain sm:relative sm:left-0 sm:translate-x-0 sm:w-full sm:h-full md:w-auto md:h-full md:object-contain bg-black"
                playsInline
                muted
                autoPlay={openMode !== 'tap'}
                onLoadedData={() => setMediaReady(true)}
                onEnded={handleVideoEnd}
                onError={(e) => {
                  console.warn('Video load error:', e);
                }}
                preload="metadata"
              >
                <source src={`${envelopeVideo}#t=0.001`} type="video/mp4" />
                <source src={`${envelopeVideo.replace('.mp4', '.webm')}#t=0.001`} type="video/webm" />
              </video>
            ) : (
              <img
                src={config?.heroImage || config?.envelopeImage || '/images/placeholder.png'}
                alt="Envelope"
                className="h-full w-auto max-w-none absolute left-1/2 -translate-x-1/2 object-contain sm:relative sm:left-0 sm:translate-x-0 sm:w-full sm:h-full md:w-auto md:h-full md:object-contain"
                onLoad={() => setMediaReady(true)}
                onError={() => setMediaReady(true)}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Global Loading Indicator / Prompt */}
      {!isAnimating && !isAutoOpen && (
         <div className={`absolute bottom-10 md:bottom-20 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-1000 z-[100] ${mediaReady ? 'opacity-100' : 'opacity-100'}`}>
           <span className="font-sans text-xs md:text-sm uppercase tracking-[0.4em] text-black bg-white/30 backdrop-blur-sm px-5 py-2.5 rounded-full whitespace-nowrap">
             Tap Anywhere to Open
           </span>
         </div>
      )}

      {!mediaReady && !isAnimating && (
         <div className="absolute inset-0 flex items-center justify-center z-[101]">
           <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
         </div>
      )}
    </motion.div>
  );
}
