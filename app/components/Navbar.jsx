'use client';
import { useState, useEffect, useRef } from 'react';

export default function Navbar({ config, birthdayData = null, generalData = null }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef(null);

  const displayName = birthdayData?.celebrantName
    || generalData?.eventTitle
    || generalData?.hostName
    || config?.couple?.displayNames
    || '';

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: [1.0], rootMargin: '-60px 0px 0px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const links = [
    { href: '#story', label: 'Our Story' },
    { href: '#events', label: 'Events' },
    { href: '#rsvp', label: 'Reply' },
  ];

  const closeMenu = () => setMenuOpen(false);

  const layout = config?.heroLayout ?? 1;
  const isLayout9 = false;

  return (
    <>
      <div ref={sentinelRef} className="absolute top-0 left-0 w-full h-px pointer-events-none z-[-1]" />
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between
          px-6 md:px-12 transition-all duration-300
          ${scrolled
            ? (isLayout9 ? 'py-3 bg-slate-900/95 backdrop-blur-lg shadow-xl border-b border-white/5' : 'py-3 bg-[var(--colorBg)]/95 backdrop-blur-lg shadow-sm')
            : 'py-5 bg-transparent'
          }`}
      >
        {/* Logo / Names */}
        <span
          className={`font-script text-2xl tracking-wide transition-colors duration-300
            ${scrolled 
              ? (isLayout9 ? 'text-white' : 'text-[var(--colorPrimary)]') 
              : (isLayout9 ? 'text-white' : 'text-[var(--colorTextDark)]')}`}
        >
          {displayName}
        </span>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-8">
          {links.map(l => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`font-sans text-xs font-semibold tracking-[0.15em] uppercase
                  relative group transition-colors duration-300
                  ${isLayout9 ? 'text-white/70 hover:text-white' : 'text-[var(--colorTextDark)]/70 hover:text-[var(--colorPrimary)]'}`}
              >
                {l.label}
                <span className={`absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full ${isLayout9 ? 'bg-white' : 'bg-[var(--colorPrimary)]'}`} />
              </a>
            </li>
          ))}
        </ul>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          className="md:hidden flex flex-col gap-1.5 p-1"
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className={`block w-6 h-px transition-all duration-300
                ${isLayout9 ? 'bg-white' : 'bg-[var(--colorTextDark)]'}
                ${menuOpen && i === 0 ? 'rotate-45 translate-y-2' : ''}
                ${menuOpen && i === 1 ? 'opacity-0' : ''}
                ${menuOpen && i === 2 ? '-rotate-45 -translate-y-2' : ''}
              `}
            />
          ))}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300
          ${menuOpen ? 'visible' : 'invisible'}`}
      >
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300
            ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMenu}
        />
        <aside
          className={`absolute top-0 right-0 h-full w-72 shadow-2xl
            flex flex-col pt-20 transition-transform duration-300
            ${isLayout9 ? 'bg-slate-900 text-white' : 'bg-[var(--colorSurface)] text-[var(--colorTextDark)]'}
            ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={closeMenu}
              className={`px-8 py-4 font-sans text-xs font-semibold tracking-[0.18em]
                uppercase border-b transition-colors
                ${isLayout9 
                  ? 'border-white/5 hover:text-[var(--colorPrimary)]' 
                  : 'border-[var(--colorPrimary)]/15 hover:text-[var(--colorPrimary)]'}`}
            >
              {l.label}
            </a>
          ))}
        </aside>
      </div>
    </>
  );
}
