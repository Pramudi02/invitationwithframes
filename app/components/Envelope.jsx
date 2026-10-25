'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useSyncExternalStore } from 'react';

function subscribeToResize(cb) {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
}

export default function Envelope({ config, onOpen, labels = {}, birthdayData = null, generalData = null }) {
  const [isOpen, setIsOpen] = useState(false);

  const isDesktop = useSyncExternalStore(
    subscribeToResize,
    () => window.innerWidth >= 768,
    () => false,
  );
  // useSyncExternalStore returns the server snapshot (false) on SSR and the
  // real value on the client, giving us hydration safety without setState in effects.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => onOpen(), 1000);
  };

  const bgImage = config?.coverImage || null;
  const themeColor = config?.theme?.colorPrimary || '#7eb5b2';
  
  const dynamicNamesHere = birthdayData?.celebrantName
    || generalData?.eventTitle
    || generalData?.hostName
    || config.envelope?.subtitle
    || config?.couple?.displayNames
    || 'Nethmi & Isuru';

  // Ensure safe fallback for theme color
  const safeThemeColor = themeColor || '#5c8d8a';

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.8, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]"
        >
          <div className="fixed inset-0 w-full h-screen overflow-hidden font-sans bg-[#020617] text-white flex items-center justify-center">
            
            {/* 1. STATIC MAIN BACKGROUND */}
            {bgImage && (
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center" 
                style={{ backgroundImage: `url(${bgImage})` }}
              />
            )}

            {/* 2. WET GLOSSY CSS WITH FAST FULL-SWEEP LIGHTING */}
            <style>
              {`
                @import url('https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@500;600;700;800&family=Noto+Serif+Sinhala:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

                /* Fixed Keyframes: Travels from completely off-screen left to completely off-screen right */
                @keyframes shimmer {
                  0% { transform: translateX(-150%) skewX(-35deg); }
                  70% { transform: translateX(150%) skewX(-35deg); }
                  /* 70% to 100% creates a natural brief pause between the fast sweeps */
                  100% { transform: translateX(150%) skewX(-35deg); }
                }

                .wet-glass {
                  position: relative;
                  overflow: hidden; 
                  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%);
                  backdrop-filter: blur(20px) saturate(180%) contrast(110%);
                  -webkit-backdrop-filter: blur(20px) saturate(180%) contrast(110%);
                  box-shadow: 
                    inset 2px 2px 5px rgba(255, 255, 255, 0.6), 
                    inset -2px -2px 5px rgba(0, 0, 0, 0.05), 
                    0 25px 50px rgba(0, 0, 0, 0.15);
                  border: 1px solid rgba(255, 255, 255, 0.2);
                }

                /* The light sweep element */
                .wet-glass::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
                  /* Runs fully every 3.5 seconds (Fast sweep + brief pause) */
                  animation: shimmer 3.5s infinite ease-in-out;
                  pointer-events: none;
                }
              `}
            </style>

            {/* 3. MAIN CONTENT WRAPPER */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-12 px-4">

              {/* THE WET GLOSSY CARD */}
              <div className="wet-glass w-[88%] sm:w-[85%] md:w-auto md:min-w-[700px] max-w-4xl px-6 md:px-20 pt-14 pb-20 md:pt-16 md:pb-24 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                
                <h2 className="text-gray-900 text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-6 md:mb-8 drop-shadow-sm relative z-20">
                  {labels?.coverRevealTagline || "You Have Been Invited!"}
                </h2>

                <h1 
                  className="text-gray-950 text-5xl sm:text-6xl md:text-7xl flex flex-col md:flex-row items-center justify-center whitespace-nowrap relative z-20"
                  style={{ 
                    fontFamily: '"Playfair Display", "Abhaya Libre", "Noto Serif Sinhala", serif',
                    fontWeight: '700',
                    lineHeight: '1.2',
                    textShadow: '0 2px 8px rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {typeof dynamicNamesHere === 'string' && dynamicNamesHere.includes('&') ? (
                    <>
                      <span className="block">{dynamicNamesHere.split('&')[0].trim()}</span>
                      <span className="block px-6 md:px-10 my-3 md:my-0 text-4xl sm:text-5xl md:text-6xl text-gray-800 font-medium italic">&amp;</span>
                      <span className="block">{dynamicNamesHere.split('&')[1].trim()}</span>
                    </>
                  ) : (
                    dynamicNamesHere
                  )}
                </h1>
              </div>

              {/* THE WET GLOSSY BUTTON */}
              <button 
                onClick={handleOpen}
                className="wet-glass px-10 py-4 rounded-full text-gray-950 font-bold tracking-wide transition-transform duration-300 hover:scale-105 flex items-center justify-center"
              >
                <span className="relative z-20">Open Invitation</span>
              </button>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
