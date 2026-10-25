'use client';
import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function Timeline({ config, labels = {} }) {
  const { timeline = [], theme = {} } = config || {};
  const listRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (listRef.current) {
      observer.observe(listRef.current);
    }
    return () => observer.disconnect();
  }, []);

  if (!timeline || timeline.length === 0) return null;

  return (
    <section 
      id="timeline"
      className="py-20 md:py-32 relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: 'var(--colorBg)' }}
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--colorPrimary)]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--colorPrimary)]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-[0.7rem] uppercase tracking-[0.4em] text-[var(--colorPrimary)] mb-3 block font-bold"
          >
            {labels.timelineEyebrow || 'The Big Day'}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl text-[var(--colorTextDark)] mb-4"
          >
            {labels.timelineHeading || 'Wedding Timeline'}
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={isVisible ? { width: 60 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-1 bg-[var(--colorPrimary)]/30 mx-auto rounded-full"
          />
        </div>

        <div ref={listRef} className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--colorPrimary)]/30 to-transparent transform -translate-x-1/2" />

          <div className="space-y-12 md:space-y-24">
            {timeline.map((event, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  className={`relative flex items-center justify-start md:justify-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Content Card */}
                  <div className={`w-full md:w-[45%] pl-12 md:pl-0 ${isEven ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}`}>
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-50 transition-transform hover:scale-[1.02]">
                       <span className="font-sans text-[0.65rem] font-black uppercase tracking-[0.2em] text-[var(--colorPrimary)] mb-2 block">
                         {event.time}
                       </span>
                       <h3 className="font-serif text-2xl text-[var(--colorTextDark)] mb-2">
                         {event.title}
                       </h3>
                       <p className="font-serif italic text-sm text-[var(--colorTextDark)]/60 leading-relaxed">
                         {event.description}
                       </p>
                    </div>
                  </div>

                  {/* Icon Node */}
                  <div className="absolute left-4 md:left-1/2 top-0 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-20">
                    <div 
                      className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl shadow-xl border-4"
                      style={{ 
                        backgroundColor: 'var(--colorSurface)',
                        borderColor: 'var(--colorBg)',
                        color: 'var(--colorPrimary)'
                      }}
                    >
                      {event.icon || '✨'}
                    </div>
                  </div>
                  
                  {/* Spacing for desktop */}
                  <div className="hidden md:block w-[45%]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
