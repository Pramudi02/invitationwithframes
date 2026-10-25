'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * PersonalizedGreeting — reads `?guest=` and `?pax=` URL params and renders
 * an elegant, personalised greeting block that overlays the generic invite text.
 *
 * IMPORTANT: this component must always be rendered inside a <Suspense> boundary
 * because useSearchParams() opts the component into dynamic rendering.
 * The exported default wraps itself in <Suspense> automatically, so callers just
 * do: <PersonalizedGreeting config={config} />
 */

// ── Inner component that reads params ────────────────────────────────────────
function GreetingInner({ config, className = '' }) {
  const searchParams = useSearchParams();
  const rawGuest = searchParams.get('guest');
  const rawPax = searchParams.get('pax');

  // Decode safely
  let guestName = null;
  if (rawGuest) {
    try { guestName = decodeURIComponent(rawGuest).trim(); } catch { guestName = rawGuest.trim(); }
    if (!guestName) guestName = null;
  }

  const pax = rawPax ? parseInt(rawPax, 10) : null;
  const validPax = pax && !isNaN(pax) && pax > 0;

  // No params — fall back to config greeting or nothing (renders null so existing content shows)
  if (!guestName && !validPax) return null;

  return (
    <div className={`personalized-greeting ${className}`} aria-live="polite">
      {guestName && (
        <p className="greeting-dear">
          Dear {guestName},
        </p>
      )}
      {validPax && (
        <p className="greeting-seats">
          We have reserved{' '}
          <span className="greeting-seats-count">{pax}</span>{' '}
          {pax === 1 ? 'seat' : 'seats'} in your honour.
        </p>
      )}

      {/* Scoped styles — written as a real <style> tag so they work in every layout
          without relying on Tailwind class availability in this subtree. */}
      <style>{`
        .personalized-greeting {
          text-align: center;
          margin: 1.25rem auto 0;
          max-width: 480px;
          animation: greet-in 0.8s ease both;
        }
        @keyframes greet-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .greeting-dear {
          font-family: var(--font-serif, Georgia, 'Times New Roman', serif);
          font-style: italic;
          font-size: clamp(1.25rem, 3vw, 1.875rem);
          line-height: 1.3;
          color: var(--colorPrimary, #C9956A);
          margin: 0 0 0.375rem;
          text-shadow: 0 1px 8px rgba(0,0,0,0.25);
          letter-spacing: 0.01em;
        }
        .greeting-seats {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: clamp(0.75rem, 1.5vw, 0.8125rem);
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          margin: 0;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
        }
        .greeting-seats-count {
          font-weight: 700;
          color: var(--colorPrimary, #C9956A);
        }
        /* Dark-bg variant override — used in LayoutTen */
        .personalized-greeting.on-light .greeting-dear {
          text-shadow: none;
          color: var(--colorPrimary, #C9956A);
        }
        .personalized-greeting.on-light .greeting-seats {
          color: var(--colorTextLight, #8A7F6A);
          text-shadow: none;
        }
      `}</style>
    </div>
  );
}

// ── Public default export — self-wraps in Suspense ───────────────────────────
export default function PersonalizedGreeting({ config, className }) {
  return (
    <Suspense fallback={null}>
      <GreetingInner config={config} className={className} />
    </Suspense>
  );
}
