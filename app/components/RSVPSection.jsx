'use client';
import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDietaryTitle, getDietaryItems, getInitialDietary, buildDietaryString } from '../../lib/dietary';

// ── Suspense-wrapped public export — callers don't need their own boundary ─
export default function RSVPSection(props) {
  return (
    <Suspense fallback={null}>
      <RSVPSectionInner {...props} />
    </Suspense>
  );
}

// ── Inner component that has access to searchParams ────────────────────────
function RSVPSectionInner({ config, labels = {} }) {
  const searchParams = useSearchParams();

  // Read URL params for personalisation
  const urlGuest = useMemo(() => {
    const raw = searchParams.get('guest');
    if (!raw) return '';
    try { return decodeURIComponent(raw).trim(); } catch { return raw.trim(); }
  }, [searchParams]);

  const urlPax = useMemo(() => {
    const raw = searchParams.get('pax');
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return (!isNaN(n) && n > 0) ? n : null;
  }, [searchParams]);

  const rsvp = config?.rsvp || {};
  const dietaryItems = getDietaryItems(config);
  const dietaryTitle = getDietaryTitle(config);
  const currentLayout = config?.heroLayout || 1;

  const layoutSpecificFields = config?.layoutSettings?.[`layout_${currentLayout}`]?.rsvpFields;

  const defaultRsvpFields = [
    { id: "guestName", type: "text", label: "Guest Name", placeholder: "Enter your full name", required: true },
    { id: "attending", type: "button-group", label: "Attending?", options: "Joyfully Accept,Regretfully Decline", required: true },
    { id: "guestCount", type: "guest-count", label: "Guest Count", placeholder: "1", required: true },
    { id: "menu", type: "checkbox-group", label: "Menu Choice", options: "Chicken,Fish,Vegetarian", required: false },
    { id: "message", type: "textarea", label: "Message to the Couple", placeholder: "Write your wishes here...", required: false }
  ];

  // BACKWARD COMPATIBILITY LOGIC:
  let fieldsToRender;

  if (layoutSpecificFields === undefined) {
    // LEGACY INVITATION: The config doesn't have the new array structure.
    // Fallback to the old global config or default static fields so old users don't lose their RSVP form!
    fieldsToRender = config?.rsvp?.fields || defaultRsvpFields; 
  } else {
    // NEW INVITATION: Admin has saved the new builder state (either populated or explicitly [] empty).
    fieldsToRender = layoutSpecificFields;
  }

  const [formData, setFormData] = useState(() => {
    // Pre-fill guestName from URL param if present
    return urlGuest ? { guestName: urlGuest } : {};
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const headerRef = useRef(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('opacity-100', '!translate-y-0'); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const layout = config?.heroLayout ?? 1;

  // We need to know if the user accepted to show extra fields.
  // Find the specific 'attending' field configuration to know what the 'accept' option is.
  const attendingField = fieldsToRender.find(f => f.id === 'attending');
  const acceptOption = attendingField?.options?.split(',')[0]?.trim()?.toLowerCase() || 'accept';

  const userAttendingStatus = formData['attending']?.toLowerCase() || '';
  // Check if user's selection includes the first option (which is usually the "Yes/Accept" option)
  const isAttending = userAttendingStatus.includes(acceptOption) || userAttendingStatus.includes('yes');

  function validate() {
    const e = {};
    fieldsToRender.forEach(field => {
      if (field.required && !formData[field.id]?.toString().trim()) {
        e[field.id] = 'This field is required.';
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const handleCheckboxChange = (fieldId, option, isChecked) => {
    let current = formData[fieldId] ? formData[fieldId].split(', ') : [];
    if (isChecked) current.push(option);
    else current = current.filter(o => o !== option);
    setFormData({ ...formData, [fieldId]: current.join(', ') });
  };

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('loading');

    try {
      // ONLY include fields that were visible to the user
      const visibleFields = fieldsToRender.filter(field => {
        if (field.id === 'guestName' || field.id === 'attending') return true;
        return isAttending; // Extra fields only matter if attending
      });

      // Get submission destination (default to whatsapp for backward compatibility)
      const submissionDest = config?.rsvp?.submissionDestination || 'whatsapp';
      const googleSheetUrl = config?.rsvp?.googleSheetUrl;

      // Build form object for submission
      const submitData = {};
      visibleFields.forEach(field => {
        submitData[field.label] = formData[field.id] || 'Not provided';
      });

      if (submissionDest === 'google-sheet') {
        // Send to Google Sheet via API proxy (to bypass CORS)
        if (!googleSheetUrl) {
          setStatus('error');
          alert('Google Sheet not configured. Please contact the couple.');
          return;
        }

        try {
          const response = await fetch('/api/rsvp-submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              googleSheetUrl,
              ...submitData,
            }),
          });

          const result = await response.json();
          if (result.success) {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
          } else {
            throw new Error(result.error);
          }
        } catch (err) {
          console.error('Google Sheet submission error:', err);
          setStatus('error');
          setTimeout(() => setStatus('idle'), 2000);
        }
      } else {
        // Send to WhatsApp (original behavior)
        const fieldsText = visibleFields.map(field => {
          const val = formData[field.id];
          return `*${field.label}:* ${val ? val : 'Not provided'}`;
        }).join('\n');

        const waMessage = `${labels.rsvpMessageHeader || '💍 *Wedding Invitation Reply* 💍'}\n\n${fieldsText}`;

        const encodedMessage = encodeURIComponent(waMessage);
        const cleanNumber = (rsvp?.whatsappNumber || '').replace(/[+\s-]/g, '').replace(/^0+/, '');
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');

        setStatus('success');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  const guestOptions = Array.from({ length: rsvp?.maxGuests || 2 }, (_, i) => i + 1);

  const optionBtnCls = (active, layoutId) => {
    // Base classes common to all layouts
    const base = `flex items-center justify-center gap-3 cursor-pointer text-center px-6 py-3.5 transition-all duration-300 select-none animate-fade-in`;

    // Layout-specific styling definitions
    const configs = {
      1: { // Classic Elegant
        nonActive: `bg-white/60 border border-[var(--colorPrimary)]/15 text-[var(--colorTextDark)]/60 rounded-full font-serif text-base italic hover:border-[var(--colorPrimary)]/30 hover:bg-white`,
        active: `bg-[var(--colorPrimary)] border border-[var(--colorPrimary)] text-white rounded-full font-serif text-base italic shadow-[0_8px_20px_var(--colorPrimary)/30] scale-[1.03]`,
      },
      2: { // Modern Minimal
        nonActive: `bg-[var(--colorBg)] border border-[var(--colorTextDark)]/10 text-[var(--colorTextDark)]/50 rounded-xl font-sans text-xs font-semibold uppercase tracking-widest hover:border-[var(--colorPrimary)]/50 hover:text-[var(--colorPrimary)]`,
        active: `bg-white border-2 border-[var(--colorPrimary)] text-[var(--colorTextDark)] rounded-xl font-sans text-xs font-semibold uppercase tracking-widest shadow-xl scale-[1.02]`,
      },
      3: { // Framed/Vintage
        nonActive: `bg-transparent border border-[var(--colorPrimary)]/30 text-[var(--colorTextDark)]/60 rounded-none font-serif text-lg hover:border-[var(--colorPrimary)] hover:bg-[var(--colorPrimary)]/5`,
        active: `bg-[var(--colorPrimary)]/10 border-2 border-[var(--colorPrimary)] text-[var(--colorTextDark)] rounded-none font-serif text-lg font-medium shadow-inner scale-[1.01]`,
      },
      4: { // Typographic Bold
        nonActive: `bg-transparent border border-slate-200 text-slate-400 rounded-none font-sans text-[10px] font-bold uppercase tracking-[0.4em] hover:border-slate-400 hover:text-slate-600`,
        active: `bg-[var(--colorTextDark)] border border-[var(--colorTextDark)] text-white rounded-none font-sans text-[10px] font-bold uppercase tracking-[0.4em] shadow-2xl`,
      },
      5: { // Maximalist Block
        nonActive: `bg-white border-2 border-[var(--colorTextDark)] text-[var(--colorTextDark)]/60 rounded-none font-sans text-xs uppercase tracking-[0.2em] hover:text-[var(--colorTextDark)] hover:bg-[var(--colorPrimary)]/5`,
        active: `bg-[var(--colorPrimary)] border-2 border-[var(--colorTextDark)] text-[var(--colorTextDark)] rounded-none font-sans text-xs uppercase tracking-[0.2em] shadow-[8px_8px_0_var(--colorTextDark)] -translate-y-1 -translate-x-1`,
      },
      6: { // Soft Organic
        nonActive: `bg-white/60 border border-[var(--colorPrimary)]/20 text-[var(--colorTextDark)]/50 rounded-[30px] font-serif text-lg italic hover:border-[var(--colorPrimary)]/40 hover:bg-white`,
        active: `bg-[var(--colorPrimary)] border border-[var(--colorPrimary)] text-white rounded-[30px] font-serif text-lg italic shadow-lg`,
      },
      7: { // Script/Chic
        nonActive: `bg-transparent border-b-2 border-slate-100 text-slate-400 rounded-none font-script text-2xl hover:border-slate-300`,
        active: `bg-white border-b-2 border-[var(--colorPrimary)] text-[var(--colorTextDark)] rounded-sm font-script text-2xl shadow-sm`,
      },
      8: { // Universal Layout 8
        nonActive: `bg-white border border-[var(--colorPrimary)]/20 text-[var(--colorTextDark)]/60 rounded-lg font-serif text-base hover:border-[var(--colorPrimary)]/50`,
        active: `bg-[var(--colorPrimary)]/10 border-2 border-[var(--colorPrimary)] text-[var(--colorTextDark)] rounded-lg font-serif text-base shadow-md scale-[1.02]`,
      }
    };

    const currentConfig = configs[layoutId] || configs[1]; // Fallback to Layout 1
    return `${base} ${active ? currentConfig.active : currentConfig.nonActive}`;
  };

  // Layout Styles
  let bgClass = "bg-[var(--colorBg)]";
  let inputCls = `w-full px-4 py-3 rounded-none font-serif text-base bg-white/40 text-[var(--colorTextDark)] placeholder:text-[var(--colorTextDark)]/35 placeholder:italic border border-[var(--colorPrimary)]/30 outline-none focus:border-[var(--colorPrimary)] focus:ring-1 focus:ring-[var(--colorPrimary)] transition-all duration-200`;
  let labelCls = "block font-sans text-xs font-semibold tracking-widest uppercase text-[var(--colorTextDark)] opacity-80 mb-1.5";
  let btnCls = "w-full flex items-center justify-center gap-2 py-4 bg-[var(--colorPrimary)] text-white font-sans text-xs font-bold tracking-widest uppercase shadow-[0_4px_18px_var(--colorPrimary)/40] hover:bg-transparent hover:text-[var(--colorPrimary)] border border-[var(--colorPrimary)] transition-all duration-300";

  if (layout === 2) {
    inputCls = `w-full px-4 py-4 rounded-xl font-serif text-base bg-[var(--colorBg)]/50 border-b-2 border-[var(--colorPrimary)]/50 focus:border-[var(--colorPrimary)] outline-none transition-all duration-200 placeholder:text-[var(--colorTextDark)]/40`;
    btnCls = "w-full flex items-center justify-center py-5 rounded-full bg-[var(--colorTextDark)] text-[var(--colorBg)] font-sans text-sm font-bold tracking-widest uppercase hover:bg-[var(--colorPrimary)] hover:text-white transition-all duration-300 shadow-xl";
  } else if (layout === 3) {
    inputCls = `w-full px-4 py-3 font-serif text-base bg-[var(--colorPrimary)]/5 text-[var(--colorTextDark)] placeholder:text-[var(--colorTextDark)]/40 border border-[var(--colorPrimary)]/40 outline-none focus:border-[var(--colorPrimary)] focus:ring-1 focus:ring-[var(--colorPrimary)] transition-all duration-200 shadow-inner`;
    btnCls = "w-full flex items-center justify-center py-4 bg-[var(--colorTextDark)] text-[var(--colorBg)] font-sans text-xs font-bold tracking-widest uppercase shadow-lg hover:bg-[var(--colorPrimary)] hover:text-white transition-all duration-300 border border-[var(--colorPrimary)]";
  } else if (layout === 4) {
    inputCls = `w-full px-6 py-4 rounded-none font-serif text-lg bg-white border border-[var(--colorTextDark)]/10 focus:border-[var(--colorPrimary)] outline-none transition-all duration-300 placeholder:opacity-30`;
    btnCls = "w-full flex items-center justify-center py-5 bg-[var(--colorTextDark)] text-white font-sans text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-[var(--colorPrimary)] transition-all duration-500 shadow-2xl";
  } else if (layout === 5) {
    inputCls = `w-full px-4 py-3 rounded-none border-2 border-[var(--colorTextDark)] bg-white focus:bg-[var(--colorPrimary)]/5 outline-none transition-all font-sans text-sm uppercase tracking-widest`;
    btnCls = "w-full py-4 bg-[var(--colorTextDark)] text-white font-sans text-xs font-black uppercase tracking-[0.5em] hover:bg-white hover:text-[var(--colorTextDark)] border-2 border-[var(--colorTextDark)] transition-all shadow-[8px_8px_0_var(--colorPrimary)]";
  } else if (layout === 6) {
    inputCls = `w-full px-5 py-3 rounded-[30px] border border-[var(--colorPrimary)]/20 bg-white/50 focus:bg-white outline-none transition-all font-serif italic text-lg`;
    btnCls = "w-full py-4 rounded-[30px] bg-[var(--colorPrimary)] text-white font-sans text-xs font-bold tracking-widest uppercase hover:opacity-80 transition-opacity shadow-lg";
  } else if (layout === 7) {
    inputCls = `w-full px-4 py-3 bg-white border-b-2 border-slate-200 focus:border-[var(--colorPrimary)] outline-none transition-all font-script text-xl`;
    btnCls = "w-full py-3 bg-slate-800 text-white font-script text-2xl hover:bg-[var(--colorPrimary)] transition-all rounded-sm shadow-md";
  } else if (layout === 8 || layout === 11) {
    inputCls = `w-full px-4 py-3 rounded-lg border-2 border-[var(--colorPrimary)]/30 bg-white focus:border-[var(--colorPrimary)] outline-none transition-all font-sinhala text-base`;
    btnCls = "w-full py-4 rounded-xl bg-[var(--colorPrimary)] text-white font-sinhala text-lg hover:bg-[var(--colorTextDark)] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)]";
  }

  // If the admin has removed ALL fields, completely hide the RSVP section
  if (!fieldsToRender || fieldsToRender.length === 0) {
    return null;
  }

  if (status === 'success') {
    return (
      <section
        id="rsvp"
        className="py-20 md:py-28 transition-colors duration-500"
        style={{
          backgroundColor: 'var(--colorBg)',
          ...(config?.sectionBackgrounds?.rsvp ? {
            backgroundImage: `url(${config.sectionBackgrounds.rsvp})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(255,255,255,0.8)'
          } : {})
        }}
      >
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className={`${layout === 4 ? 'bg-white text-[var(--colorTextDark)]' : 'bg-[var(--colorPrimary)]/10 text-[var(--colorTextDark)]'} border border-[var(--colorPrimary)]/25 rounded-2xl p-10 shadow-xl`}>
            <p className="text-4xl mb-4 text-[var(--colorPrimary)] drop-shadow-sm">🌿</p>
            <h2 className="font-serif text-3xl mb-4 italic text-[var(--colorTextDark)]">Thank You</h2>
            <p className="font-serif text-xl leading-relaxed text-[var(--colorTextDark)]/80">
              Your reply has been received.<br />We look forward to celebrating with you!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="rsvp"
      className="py-20 md:py-32 relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: 'var(--colorBg)' }}
    >
      {/* ── SECTION BACKGROUND IMAGE ── */}
      {config?.sectionBackgrounds?.rsvp && (
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-transform duration-1000"
          style={{
            backgroundImage: `url(${config.sectionBackgrounds.rsvp})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)',
            transform: 'scale(1.02)',
            opacity: 0.85
          }}
        />
      )}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-white/5" />
      {layout === 1 && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 20% 80%, var(--colorPrimary) 0%, transparent 55%), radial-gradient(circle at 80% 20%, var(--colorPrimary) 0%, transparent 55%)', opacity: 0.05 }} />
      )}
      {layout === 3 && (
        <>
          <div className="absolute inset-8 border border-[var(--colorPrimary)] pointer-events-none opacity-30 mix-blend-multiply" />
          <div className="absolute inset-12 border border-[var(--colorPrimary)] pointer-events-none opacity-20 outline outline-1 outline-offset-2 outline-[var(--colorPrimary)]" />
        </>
      )}

      <div className={`relative max-w-2xl mx-auto px-6 transition-all ${layout === 4 ? 'bg-white p-10 md:p-16 shadow-2xl border-t-[12px] border-[var(--colorPrimary)]'
        : layout === 3 ? 'bg-[var(--colorBg)] p-8 md:p-14 shadow-2xl border border-[var(--colorPrimary)]/30'
          : layout === 2 ? 'bg-white/40 p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] rounded-[40px] border border-white/60 backdrop-blur-md'
            : 'bg-[var(--colorPrimary)]/5 p-6 md:p-10 border border-[var(--colorPrimary)]/20'
        }`}>

        {/* Header */}
        <div ref={headerRef} className="text-center mb-12 opacity-0 translate-y-8 transition-all duration-1000">
          {layout === 4 ? (
            <>
              <h2 className="font-sans text-5xl md:text-6xl font-bold text-[var(--colorTextDark)] mb-4 tracking-tighter">Please Confirm</h2>
              <p className="font-sans text-xs md:text-sm text-[var(--colorTextDark)] opacity-70">Kindly respond by {rsvp?.deadline || ''}</p>
            </>
          ) : layout === 3 ? (
            <>
              <span className="text-3xl text-[var(--colorPrimary)] mb-4 block">❀</span>
              <h2 className="font-serif text-4xl md:text-5xl text-[var(--colorTextDark)] mb-4 tracking-wide">Please Confirm</h2>
              <div className="w-24 h-0.5 bg-[var(--colorPrimary)] mx-auto opacity-60 mb-4" />
              <p className="font-sans text-xs tracking-widest uppercase text-[var(--colorTextDark)]/80">Please respond by {rsvp?.deadline || ''}</p>
            </>
          ) : layout === 2 ? (
            <>
              <h2 className="font-serif text-4xl md:text-6xl font-bold uppercase tracking-widest text-[var(--colorTextDark)] mb-4 drop-shadow-sm">Please Confirm</h2>
              <p className="font-script text-3xl text-[var(--colorPrimary)] mb-6">We would love to see you</p>
              <div className="w-16 h-px bg-[var(--colorPrimary)] mx-auto opacity-70" />
              <p className="font-sans text-xs tracking-widest uppercase text-[var(--colorTextDark)]/70 mt-6">Respond by {rsvp?.deadline || ''}</p>
            </>
          ) : (
            <>
              <p className="font-sans text-[0.7rem] tracking-[0.3em] uppercase text-[var(--colorPrimary)] mb-3">We Hope to See You</p>
              <h2 className="font-serif text-4xl md:text-5xl font-normal text-[var(--colorTextDark)] mb-3">
                Please Confirm
              </h2>
              <span className="text-[var(--colorPrimary)]/60 text-2xl">❧</span>
              <p className="font-sans text-sm text-[var(--colorTextDark)]/55 mt-3">
                Kindly respond by <strong className="text-[var(--colorPrimary)]">{rsvp?.deadline || ''}</strong>
              </p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 relative z-10 w-full max-w-lg mx-auto">
          {fieldsToRender.map((field, idx) => {
            const isCore = field.id === 'guestName' || field.id === 'attending';
            
            // Hide extra fields if user hasn't accepted yet
            if (!isCore && !isAttending) return null;

            return (
            <div key={field.id || idx} className="flex flex-col animate-fade-in-up">
              <label className={labelCls}>
                {field.label} {field.required && "*"}
              </label>

              {field.type === 'textarea' ? (
                <textarea name={field.id} required={field.required} placeholder={field.placeholder} className={`${inputCls} resize-y min-h-[100px]`} value={formData[field.id] || ''} onChange={e => setFormData({ ...formData, [field.id]: e.target.value })} />
              ) : field.type === 'button-group' ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  {field.options?.split(',').map((opt, i) => {
                    const active = formData[field.id] === opt.trim();
                    return (
                      <label key={i} className={optionBtnCls(active, layout) + " flex-1"}>
                        <input type="radio" name={field.id} value={opt.trim()} className="hidden" required={field.required && !formData[field.id]} onChange={e => setFormData({ ...formData, [field.id]: e.target.value })} />
                        {opt.trim()}
                      </label>
                    );
                  })}
                </div>
              ) : field.type === 'checkbox-group' ? (
                <div className="flex flex-col gap-2 mt-1">
                  {field.options?.split(',').map((opt, i) => {
                    const isChecked = (formData[field.id] || '').includes(opt.trim());
                    return (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-[var(--colorPrimary)] border-[var(--colorPrimary)] text-white' : 'bg-white border-slate-300'}`}>
                          {isChecked && <CheckIcon size={12} />}
                        </div>
                        <input type="checkbox" className="hidden" value={opt.trim()} onChange={e => handleCheckboxChange(field.id, opt.trim(), e.target.checked)} />
                        <span className="font-sans text-sm text-[var(--colorTextDark)]/80 group-hover:text-[var(--colorTextDark)]">{opt.trim()}</span>
                      </label>
                    );
                  })}
                </div>
              ) : field.type === 'guest-count' ? (
                <>
                  {urlPax && (
                    <p className="text-[10px] font-sans uppercase tracking-widest" style={{ color: 'var(--colorPrimary)', opacity: 0.75, marginBottom: '0.375rem' }}>
                      Max allowed: {urlPax} {urlPax === 1 ? 'guest' : 'guests'}
                    </p>
                  )}
                  <select
                    name={field.id}
                    required={field.required}
                    className={`${inputCls} appearance-none cursor-pointer`}
                    value={formData[field.id] || ''}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      // Enforce pax cap on manual change (defensive)
                      if (urlPax && val > urlPax) return;
                      setFormData({ ...formData, [field.id]: e.target.value });
                    }}
                  >
                    <option value="">-- Number of Guests --</option>
                    {Array.from(
                      { length: urlPax ? Math.min(urlPax, config?.rsvp?.maxGuests || 50) : (config?.rsvp?.maxGuests || 5) },
                      (_, i) => i + 1
                    ).map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </>
              ) : field.type === 'select' ? (
                <div className="relative">
                  <select name={field.id} required={field.required} className={`${inputCls} appearance-none cursor-pointer`} value={formData[field.id] || ''} onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}>
                    <option value="">-- Please Select --</option>
                    {field.options?.split(',').map((opt, i) => (
                      <option key={i} value={opt.trim()}>{opt.trim()}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <input type={field.type} name={field.id} required={field.required} placeholder={field.placeholder} className={inputCls} value={formData[field.id] || ''} onChange={e => setFormData({ ...formData, [field.id]: e.target.value })} />
              )}
              {errors[field.id] && <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-widest">{errors[field.id]}</p>}
            </div>
          )})}

          <button
            type="submit"
            disabled={status === 'loading'}
            className={btnCls}
          >
            {status === 'loading' ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : status === 'success' ? (
              <>Submitted ✨</>
            ) : (
              <>{(config?.rsvp?.submissionDestination === 'google-sheet') ? 'Submit' : 'Confirm via WhatsApp'}</>
            )}
          </button>

          {status === 'error' && (
            <p className="text-center text-red-500 text-sm font-sans mt-2">
              Oops! Something went wrong. Please try again or contact us directly.
            </p>
          )}
        </form>
      </div>

    </section>
  );
}

// ── HeartIcon Helper ──
function HeartIcon({ size = 60, fill = false }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.89-8.89 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ── CheckIcon Helper ──
function CheckIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
