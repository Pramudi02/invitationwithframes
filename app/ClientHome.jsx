'use client';

import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music } from 'lucide-react';

import Envelope from './components/Envelope';
import CoupleReveal from './components/CoupleReveal';
import CoverReveal from './components/CoverReveal';
import FadeReveal from './components/FadeReveal';
import PremiumEnvelope from './components/PremiumEnvelope';
import RoyalEnvelope from './components/RoyalEnvelope';
import MintEnvelope from './components/MintEnvelope';
import UniversalPreloader from './components/UniversalPreloader';
import FullPageLoader from './components/FullPageLoader';
import FallingPetals from './components/FallingPetals';

import FramedWeddingInvitation from './components/FramedWeddingInvitation';
import { PRESET_THEMES } from '../lib/themes';
import { getLabels } from '../lib/eventLabels';

export default function ClientHome({ config }) {
  const audioRef = useRef(null);
  const interactionHandledRef = useRef(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // useSyncExternalStore for hydration safety
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  // Fallback loader removal after max 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-play audio on first user interaction if audioUrl is present
  useEffect(() => {
    if (!config?.audioUrl || !audioRef.current || interactionHandledRef.current) return;

    let isAttemptingToPlay = false;

    const playAudioOnInteract = () => {
      if (interactionHandledRef.current) return;

      if (audioRef.current && !audioPlaying && !isAttemptingToPlay) {
        isAttemptingToPlay = true;
        audioRef.current.play()
          .then(() => {
            setAudioPlaying(true);
            interactionHandledRef.current = true;
            window.removeEventListener('scroll', playAudioOnInteract);
            window.removeEventListener('touchstart', playAudioOnInteract);
            window.removeEventListener('click', playAudioOnInteract);
          })
          .catch(() => {
            isAttemptingToPlay = false;
          });
      }
    };

    window.addEventListener('scroll', playAudioOnInteract, { passive: true });
    window.addEventListener('touchstart', playAudioOnInteract, { passive: true });
    window.addEventListener('click', playAudioOnInteract, { passive: true });

    return () => {
      window.removeEventListener('scroll', playAudioOnInteract);
      window.removeEventListener('touchstart', playAudioOnInteract);
      window.removeEventListener('click', playAudioOnInteract);
    };
  }, [config?.audioUrl, audioPlaying]);

  // Handler when user triggers invitation opening
  const handleOpen = () => {
    setHasOpened(true);
    interactionHandledRef.current = true;
    if (audioRef.current && config?.audioUrl) {
      audioRef.current.play()
        .then(() => setAudioPlaying(true))
        .catch(() => {});
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('scroll'));
    }, 100);
  };

  const handleRevealStart = () => {
    interactionHandledRef.current = true;
    if (audioRef.current && config?.audioUrl) {
      audioRef.current.play()
        .then(() => setAudioPlaying(true))
        .catch(() => {});
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    interactionHandledRef.current = true;

    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setAudioPlaying(true);
    }
  };

  const revealStyle = config?.revealStyle || 'envelope';
  const themeId = config?.themeId || (typeof config?.theme === 'string' ? config.theme : 'gold');

  // Safe theme color resolution
  const resolvedColors = PRESET_THEMES.find(t => t.id === themeId)?.colors || (typeof config?.theme === 'object' ? config.theme : PRESET_THEMES[0].colors);
  
  const theme = {
    colorPrimary: config?.theme?.colorPrimary || resolvedColors?.colorPrimary || '#C9956A',
    colorSecondary: config?.theme?.colorSecondary || resolvedColors?.colorSecondary || '#E8D5B7',
    colorTextLight: config?.theme?.colorTextLight || resolvedColors?.colorTextLight || '#8A7F6A',
    colorTextDark: config?.theme?.colorTextDark || resolvedColors?.colorTextDark || '#2C2018',
    colorBg: config?.theme?.colorBg || resolvedColors?.colorBg || '#FAF7F2',
    colorSurface: config?.theme?.colorSurface || resolvedColors?.colorSurface || '#FFFFFF',
    heroOverlayStart: config?.theme?.heroOverlayStart || resolvedColors?.heroOverlayStart || 'rgba(18, 12, 6, 0.55)',
    heroOverlayEnd: config?.theme?.heroOverlayEnd || resolvedColors?.heroOverlayEnd || 'rgba(18, 12, 6, 0.25)',
  };

  const labels = getLabels(config?.eventType || 'wedding');

  if (!mounted) return null;

  const themeStyles = `
    :root {
      --colorPrimary: ${theme.colorPrimary};
      --colorSecondary: ${theme.colorSecondary};
      --colorTextLight: ${theme.colorTextLight};
      --colorTextDark: ${theme.colorTextDark};
      --colorBg: ${theme.colorBg};
      --colorSurface: ${theme.colorSurface};
      --heroOverlayStart: ${theme.heroOverlayStart};
      --heroOverlayEnd: ${theme.heroOverlayEnd};
    }
  `;

  return (
    <>
      <FullPageLoader isLoading={isLoading} onLoadComplete={() => {}} />
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />

      {/* Hidden audio element for background romantic music */}
      {config?.audioUrl && (
        <audio ref={audioRef} src={config.audioUrl} loop preload="auto" style={{ display: 'none' }} />
      )}

      {/* Envelope & Preloader Reveal Layer */}
      <UniversalPreloader config={config} onReveal={handleOpen}>
        <AnimatePresence mode="wait">
          {!hasOpened && !isLoading && (
            revealStyle === 'cover' ? (
              <CoverReveal key="cover-reveal" config={config} onOpen={handleOpen} labels={labels} />
            ) : (revealStyle === 'couple' || revealStyle === 'couple_rose') ? (
              <CoupleReveal key="couple-reveal" config={config} onOpen={handleOpen} onStart={handleRevealStart} labels={labels} />
            ) : revealStyle === 'fade' ? (
              <FadeReveal key="fade-reveal" config={config} onOpen={handleOpen} />
            ) : (revealStyle === 'royal-envelope' || revealStyle === 'royal_envelope') ? (
              <RoyalEnvelope key="royal-envelope" config={config} onOpen={handleOpen} />
            ) : (revealStyle === 'mint-envelope' || revealStyle === 'mint_envelope') ? (
              <MintEnvelope key="mint-envelope" config={config} onOpenInvitation={handleOpen} />
            ) : (
              <Envelope key="envelope-layer" config={config} onOpen={handleOpen} labels={labels} />
            )
          )}
        </AnimatePresence>

        {/* Main Wedding Invitation Website Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hasOpened ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className={!hasOpened ? "opacity-0 pointer-events-none fixed inset-0 z-[-1]" : ""}
        >
          {/* THE SINGLE MODERN, UNIQUE, ELEGANT FRAMED TEMPLATE */}
          <FramedWeddingInvitation config={config} />

          {/* Floating Audio Disc Toggle Button */}
          {config?.audioUrl && (
            <div className="fixed bottom-6 right-6 z-[999] flex items-center">
              <button
                onClick={toggleAudio}
                className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md shadow-2xl border border-[var(--colorPrimary)]/40 hover:scale-110 active:scale-95 transition-all duration-300"
                aria-label={audioPlaying ? 'Mute background music' : 'Play background music'}
              >
                {/* Vinyl Grooves & Spinning Indicator */}
                <span className={`absolute inset-1 rounded-full border border-[var(--colorPrimary)]/30 ${audioPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`} />
                <span className={`absolute inset-2.5 rounded-full border border-[var(--colorPrimary)]/20 ${audioPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />

                {audioPlaying ? (
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-3 bg-[var(--colorPrimary)] rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                    <span className="w-1 h-5 bg-[var(--colorPrimary)] rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                    <span className="w-1 h-2.5 bg-[var(--colorPrimary)] rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" />
                  </div>
                ) : (
                  <Music size={18} className="text-[var(--colorTextDark)]/60 group-hover:text-[var(--colorPrimary)] transition-colors" />
                )}
              </button>
            </div>
          )}
        </motion.div>
      </UniversalPreloader>

      {/* Atmospheric Falling Petals */}
      {config?.fallingPetals && hasOpened && (
        <FallingPetals color={theme.colorPrimary} />
      )}
    </>
  );
}
