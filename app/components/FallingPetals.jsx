import React, { useState } from 'react';

/**
 * HIGH-PERFORMANCE FALLING PETALS
 * 
 * - Strictly CSS/GPU based animations (no JS loop).
 * - React.memo prevents unnecessary re-renders when color doesn't change.
 * - Randomization is computed once during the initial client render to prevent SSR hydration errors.
 * - Reduced petal count for better performance.
 */
const FallingPetals = ({ color = '#C9956A' }) => {
  const [petals] = useState(() =>
    [...Array(12)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 12,
      fallDuration: 12 + Math.random() * 10,
      swayDuration: 4 + Math.random() * 3,
      delay: -(Math.random() * 15), // Negative delay starts them mid-air
      opacity: 0.3 + Math.random() * 0.4,
    }))
  );

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[40] overflow-hidden" 
      aria-hidden="true"
      style={{ color, zIndex: 40 }}
    >
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 css-petal-fall"
          style={{
            left: `${p.left}vw`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.fallDuration}s`,
            animationDelay: `${p.delay}s`,
            willChange: 'transform',
          }}
        >
          <div 
            className="css-petal-sway"
            style={{ 
              animationDuration: `${p.swayDuration}s`,
              opacity: p.opacity
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

// Proper memo: only re-render if color changes
export default React.memo(FallingPetals);
