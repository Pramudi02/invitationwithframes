'use client';
import { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';

function CountdownBlock({ value, unit }) {
  const [prev, setPrev]   = useState(value);
  const [flip, setFlip]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (value !== prev) {
      const t1 = setTimeout(() => setFlip(true), 0);
      const t2 = setTimeout(() => { setFlip(false); setPrev(value); }, 350);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [value, prev]);

  const formatted = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center backdrop-blur-md transition-all duration-300 rounded-2xl px-1.5 py-4 sm:px-6 sm:py-6 min-w-[62px] sm:min-w-[110px] bg-white/5 border border-[var(--colorSecondary)]/20">
      <span
        ref={ref}
        className={`font-sans font-black leading-none text-3xl sm:text-5xl tracking-tighter text-[var(--colorSecondary)] ${flip ? 'flip' : ''}`}
      >
        {formatted}
      </span>
      <span className="font-sans text-[0.5rem] sm:text-[0.6rem] tracking-[0.2em] sm:tracking-[0.3em] uppercase mt-2 text-[var(--colorTextLight)]/40">
        {unit}
      </span>
    </div>
  );
}

function computeTimeLeft(t) {
  const diff = t - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000)  / 60000),
    seconds: Math.floor((diff % 60000)    / 1000),
  };
}

export default function Countdown({ config, labels = {} }) {
  // useSyncExternalStore gives a stable isMounted that avoids setState-in-effect
  const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const target = useMemo(
    () => config?.wedding?.dateTimeISO ? new Date(config.wedding.dateTimeISO).getTime() : 0,
    [config]
  );

  const [timeLeft, setTimeLeft] = useState(null);
  const [done,     setDone]     = useState(false);

  useEffect(() => {
    // Defer the initial setState to avoid synchronous setState-in-effect
    const t0 = setTimeout(() => setTimeLeft(computeTimeLeft(target)), 0);

    const id = setInterval(() => {
      const tl = computeTimeLeft(target);
      if (!tl) { setDone(true); clearInterval(id); return; }
      setTimeLeft(tl);
    }, 1000);
    return () => { clearTimeout(t0); clearInterval(id); };
  }, [target]);

  const currentLayout = config?.heroLayout || 1;
  const dynamicSettings = config?.layoutSettings?.[`layout_${currentLayout}`] || {};
  const layout = config?.heroLayout ?? 1;

  // If not mounted, render the section structure with empty blocks
  if (!isMounted) {
    return (
      <section id="countdown" className="bg-[var(--colorTextDark)] text-[var(--colorTextLight)] py-16 md:py-24 text-center overflow-hidden">
        <div className="flex justify-center items-center gap-1 sm:gap-5 flex-nowrap px-1 sm:px-4 opacity-0 scale-95 sm:scale-100 transition-transform">
           <div className="min-w-[62px] sm:min-w-[100px] h-20 sm:h-24 bg-white/5 rounded-xl transition-all" />
           <div className="min-w-[62px] sm:min-w-[100px] h-20 sm:h-24 bg-white/5 rounded-xl transition-all" />
           <div className="min-w-[62px] sm:min-w-[100px] h-20 sm:h-24 bg-white/5 rounded-xl transition-all" />
           <div className="min-w-[62px] sm:min-w-[100px] h-20 sm:h-24 bg-white/5 rounded-xl transition-all" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="countdown"
      className="bg-[var(--colorTextDark)] text-[var(--colorTextLight)] py-16 md:py-24 text-center overflow-hidden"
    >
      <div className="font-sans text-[10px] tracking-[0.6em] uppercase font-bold mb-10 text-[var(--colorSecondary)]">
        {labels.countdownLabel || 'Counting down to the big day'}
      </div>

      {done ? (
        <p className="font-script text-3xl text-[var(--colorSecondary)] px-4">
          🎉 Today is the day! Congratulations! 🎉
        </p>
      ) : timeLeft && (
        <div className="flex justify-center items-center gap-1 sm:gap-5 flex-nowrap px-1 sm:px-4 overflow-hidden">
          <CountdownBlock value={timeLeft.days}    unit="Days" />
          <span className="font-serif text-xl sm:text-3xl mb-3 sm:mb-5 opacity-20 text-[var(--colorSecondary)]">:</span>
          <CountdownBlock value={timeLeft.hours}   unit="Hours" />
          <span className="font-serif text-xl sm:text-3xl mb-3 sm:mb-5 opacity-20 text-[var(--colorSecondary)]">:</span>
          <CountdownBlock value={timeLeft.minutes} unit="Minutes" />
          <span className="font-serif text-xl sm:text-3xl mb-3 sm:mb-5 opacity-20 text-[var(--colorSecondary)]">:</span>
          <CountdownBlock value={timeLeft.seconds} unit="Seconds" />
        </div>
      )}

      {dynamicSettings.countdownExtraText && (
        <p className="mt-8 text-center italic text-sm tracking-widest text-[var(--colorSecondary)] opacity-80">{dynamicSettings.countdownExtraText}</p>
      )}
    </section>
  );
}
