'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, Heart, Music, Volume2, VolumeX,
  ChevronDown, Send, CheckCircle2, Navigation, Sparkles,
  ChevronLeft, ChevronRight, X, ArrowUp, UserCheck, Utensils,
  ExternalLink, Check
} from 'lucide-react';
import CinematicScrollHero from './CinematicScrollHero';

// ==========================================
// 1. MONOGRAM COMPONENT (FRAMED CREST)
// ==========================================
function FramedMonogram({ brideName = 'B', groomName = 'G', size = 'md' }) {
  const bInitial = (brideName || 'B').trim().charAt(0).toUpperCase();
  const gInitial = (groomName || 'G').trim().charAt(0).toUpperCase();

  const dimensions = size === 'lg' ? 'w-24 h-24 sm:w-28 sm:h-28' : 'w-16 h-16 sm:w-20 sm:h-20';

  return (
    <div className={`relative ${dimensions} mx-auto flex items-center justify-center select-none`}>
      {/* Outer Rotating Gilded Ring */}
      <svg className="absolute inset-0 w-full h-full animate-[spin_30s_linear_infinite]" viewBox="0 0 100 100">
        <circle 
          cx="50" cy="50" r="46" 
          fill="none" 
          stroke="var(--colorPrimary)" 
          strokeWidth="1" 
          strokeDasharray="4 3" 
          opacity="0.6" 
        />
        <circle 
          cx="50" cy="50" r="41" 
          fill="none" 
          stroke="var(--colorPrimary)" 
          strokeWidth="0.75" 
          opacity="0.4" 
        />
      </svg>

      {/* Decorative Diamond Finials */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[var(--colorPrimary)]" />
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[var(--colorPrimary)]" />
      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-[var(--colorPrimary)]" />
      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-1.5 rotate-45 bg-[var(--colorPrimary)]" />

      {/* Inner Frame */}
      <div className="w-[82%] h-[82%] rounded-full border border-[var(--colorPrimary)]/70 bg-[var(--colorSurface)]/90 backdrop-blur-sm shadow-inner flex items-center justify-center">
        <div className="flex items-center justify-center tracking-tight font-serif text-[var(--colorTextDark)]">
          <span className="text-xl sm:text-2xl font-semibold italic">{gInitial}</span>
          <span className="font-script text-lg sm:text-xl text-[var(--colorPrimary)] mx-1">&</span>
          <span className="text-xl sm:text-2xl font-semibold italic">{bInitial}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. CORNER-BRACKETED LUXURY FRAME WRAPPER
// ==========================================
function LuxuryFrame({ children, className = '', glow = false }) {
  return (
    <div className={`relative p-5 sm:p-8 rounded-2xl bg-[var(--colorSurface)]/70 backdrop-blur-md border border-[var(--colorPrimary)]/30 ${glow ? 'shadow-[0_12px_45px_rgba(201,149,106,0.18)]' : 'shadow-[0_10px_35px_rgba(0,0,0,0.04)]'} ${className}`}>
      {/* Corner Brackets */}
      <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[var(--colorPrimary)]/70 pointer-events-none" />
      <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[var(--colorPrimary)]/70 pointer-events-none" />
      <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[var(--colorPrimary)]/70 pointer-events-none" />
      <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[var(--colorPrimary)]/70 pointer-events-none" />

      {/* Subtle Inner Pinstripe */}
      <div className="absolute inset-1.5 rounded-xl border border-[var(--colorPrimary)]/15 pointer-events-none" />

      {children}
    </div>
  );
}

// ==========================================
// 3. COUNTDOWN TIMER
// ==========================================
function FramedCountdown({ targetDateISO }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    if (!targetDateISO) return;

    const calculate = () => {
      const target = new Date(targetDateISO).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isPast: false
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDateISO]);

  const units = [
    { label: 'DAYS', val: timeLeft.days },
    { label: 'HOURS', val: timeLeft.hours },
    { label: 'MINUTES', val: timeLeft.minutes },
    { label: 'SECONDS', val: timeLeft.seconds }
  ];

  return (
    <div className="w-full max-w-xl mx-auto my-8">
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
        {units.map((unit, idx) => (
          <div key={idx} className="relative group">
            {/* Framed Tile */}
            <div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-md border border-[var(--colorPrimary)]/40 p-2.5 sm:p-4 text-center shadow-sm transition-all duration-300 hover:border-[var(--colorPrimary)]">
              {/* Corner Notches */}
              <div className="absolute top-1 left-1 w-1 h-1 bg-[var(--colorPrimary)]/50 rounded-full" />
              <div className="absolute top-1 right-1 w-1 h-1 bg-[var(--colorPrimary)]/50 rounded-full" />
              <div className="absolute bottom-1 left-1 w-1 h-1 bg-[var(--colorPrimary)]/50 rounded-full" />
              <div className="absolute bottom-1 right-1 w-1 h-1 bg-[var(--colorPrimary)]/50 rounded-full" />

              <div className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-[var(--colorTextDark)] tracking-tight">
                {String(unit.val).padStart(2, '0')}
              </div>
              <div className="text-[9px] sm:text-[11px] font-sans font-semibold tracking-widest text-[var(--colorTextLight)] uppercase mt-1">
                {unit.label}
              </div>
            </div>
          </div>
        ))}
      </div>
      {timeLeft.isPast && (
        <p className="text-center font-serif italic text-sm text-[var(--colorPrimary)] mt-3">
          The celebration has begun!
        </p>
      )}
    </div>
  );
}

// ==========================================
// 4. MAIN FRAMED INVITATION COMPONENT
// ==========================================
export default function FramedWeddingInvitation({ config, hasOpened }) {
  const searchParams = useSearchParams();

  // Dynamic Personalized Guest Name and Pax from URL (?guest=Name&pax=2 or ?to=Name)
  const guestName = useMemo(() => {
    const raw = searchParams.get('guest') || searchParams.get('to') || '';
    if (!raw) return '';
    try {
      return decodeURIComponent(raw).trim();
    } catch {
      return raw.trim();
    }
  }, [searchParams]);

  const urlPax = useMemo(() => {
    const raw = searchParams.get('pax');
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return (!isNaN(n) && n > 0) ? n : null;
  }, [searchParams]);

  // Gallery Lightbox State
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);

  // Selected Map Event Index for Location Map Box
  const [selectedMapEventIndex, setSelectedMapEventIndex] = useState(0);

  // Dynamic RSVP Form Builder Fields (Resolves from Admin's RSVP Form Builder Layout 1)
  const currentLayout = config?.heroLayout || 1;
  const layoutSpecificFields = config?.layoutSettings?.layout_1?.rsvpFields 
    || config?.layoutSettings?.[`layout_${currentLayout}`]?.rsvpFields;
  const globalFields = config?.rsvp?.fields;

  const defaultRsvpFields = useMemo(() => [
    { id: "guestName", type: "text", label: "Your Full Name", placeholder: "Enter your full name", required: true, isCore: true },
    { id: "attending", type: "button-group", label: "Will you attend?", options: "Joyfully Accept,Regretfully Decline", required: true, isCore: true },
    { id: "guestCount", type: "guest-count", label: "Number of Guests Attending", placeholder: "1", required: true },
    { id: "dietary", type: "text", label: "Dietary Requirements / Preferences", placeholder: "e.g. Vegetarian, Non-veg, Halal, Nut Allergy...", required: false },
    { id: "message", type: "textarea", label: "Wishes for the Couple", placeholder: "Send your warm blessings to the bride & groom...", required: false }
  ], []);

  const fieldsToRender = useMemo(() => {
    if (layoutSpecificFields && layoutSpecificFields.length > 0) return layoutSpecificFields;
    if (globalFields && globalFields.length > 0) return globalFields;
    return defaultRsvpFields;
  }, [layoutSpecificFields, globalFields, defaultRsvpFields]);

  // RSVP Dynamic Form State
  const [formData, setFormData] = useState(() => {
    const initial = {};
    if (guestName) {
      initial.guestName = guestName;
      initial.name = guestName;
    }
    const attendingField = fieldsToRender.find(f => f.id === 'attending');
    if (attendingField?.options) {
      const firstOpt = attendingField.options.split(',')[0]?.trim();
      if (firstOpt) initial.attending = firstOpt;
    }
    const guestCountField = fieldsToRender.find(f => f.type === 'guest-count' || f.id === 'guests' || f.id === 'guestCount');
    if (guestCountField) {
      initial[guestCountField.id] = urlPax ? Math.min(urlPax, 1) : 1;
    }
    return initial;
  });
  const [formErrors, setFormErrors] = useState({});
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // Sync guest name when URL parameter arrives
  useEffect(() => {
    if (guestName) {
      setFormData(prev => ({
        ...prev,
        guestName: prev.guestName || guestName,
        name: prev.name || guestName
      }));
    }
  }, [guestName]);

  // Attendance Status to determine if subsequent conditional fields show
  const attendingField = useMemo(() => fieldsToRender.find(f => f.id === 'attending'), [fieldsToRender]);
  const acceptOption = useMemo(() => attendingField?.options?.split(',')[0]?.trim()?.toLowerCase() || 'accept', [attendingField]);
  const userAttendingStatus = (formData['attending'] || '').toLowerCase();
  const isAttending = useMemo(() => {
    if (!attendingField) return true;
    return userAttendingStatus.includes(acceptOption) || userAttendingStatus.includes('accept') || userAttendingStatus.includes('yes');
  }, [attendingField, acceptOption, userAttendingStatus]);

  // Handle dynamic field value changes
  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => {
      const next = { ...prev, [fieldId]: value };
      if (fieldId === 'guestName') next.name = value;
      if (fieldId === 'name') next.guestName = value;
      return next;
    });
    if (formErrors[fieldId]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  // Validate only visible fields
  const validateForm = () => {
    const errs = {};
    fieldsToRender.forEach(field => {
      const isCore = field.id === 'guestName' || field.id === 'name' || field.id === 'attending';
      const isVisible = isCore || isAttending || field.type === 'textarea';
      if (!isVisible) return;

      if (field.required) {
        const val = formData[field.id];
        if (val === undefined || val === null || String(val).trim() === '') {
          errs[field.id] = `${field.label || 'This field'} is required`;
        }
      }
    });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Keyboard controls for gallery lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'Escape') setActivePhotoIndex(null);
      if (e.key === 'ArrowRight' && config.gallery?.length) {
        setActivePhotoIndex(prev => (prev + 1) % config.gallery.length);
      }
      if (e.key === 'ArrowLeft' && config.gallery?.length) {
        setActivePhotoIndex(prev => (prev - 1 + config.gallery.length) % config.gallery.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, config.gallery]);

  // Handle Calendar Export / Add to Google Calendar
  const handleAddToCalendar = () => {
    const title = `${config?.couple?.displayNames || 'Wedding'} Ceremony`;
    const venue = config?.events?.ceremony?.venueName || 'Wedding Venue';
    const address = config?.events?.ceremony?.address || '';
    const dateStr = config?.wedding?.dateTimeISO || new Date().toISOString();
    
    const startDate = new Date(dateStr);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 hours duration

    const formatGCalDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCalDate(startDate)}/${formatGCalDate(endDate)}&details=${encodeURIComponent('We look forward to celebrating with you!')}&location=${encodeURIComponent(`${venue}, ${address}`)}`;
    
    window.open(gCalUrl, '_blank');
  };

  // Handle WhatsApp RSVP with Dynamic Fields
  const handleWhatsAppRSVP = (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const cleanNumber = (config?.rsvp?.whatsappNumber || '').replace(/[+\s-]/g, '').replace(/^0+/, '');
    const coupleName = config?.couple?.displayNames || 'the happy couple';

    const visibleFields = fieldsToRender.filter(field => {
      const isCore = field.id === 'guestName' || field.id === 'name' || field.id === 'attending';
      return isCore || isAttending || field.type === 'textarea';
    });

    const fieldsText = visibleFields.map(field => {
      const val = formData[field.id];
      return `• *${field.label}:* ${val !== undefined && val !== null && String(val).trim() !== '' ? val : 'Not provided'}`;
    }).join('\n');

    const text = `💍 *Wedding Invitation RSVP for ${coupleName}* 💍\n\n` +
      `${fieldsText}\n\n` +
      `Warm regards,\n${formData.guestName || formData.name || 'Guest'}`;

    const waUrl = cleanNumber 
      ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank');
    setRsvpSubmitted(true);
  };

  // Handle Online Form RSVP Submission with Dynamic Fields
  const handleDirectRSVP = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setRsvpLoading(true);

    try {
      const visibleFields = fieldsToRender.filter(field => {
        const isCore = field.id === 'guestName' || field.id === 'name' || field.id === 'attending';
        return isCore || isAttending || field.type === 'textarea';
      });

      const submitData = {};
      visibleFields.forEach(field => {
        submitData[field.label] = formData[field.id] !== undefined ? formData[field.id] : 'Not provided';
      });

      const payload = {
        slug: config?.slug || 'wedding',
        guestName: formData.guestName || formData.name || 'Guest',
        attending: formData.attending || '',
        ...formData,
        ...submitData,
        googleSheetUrl: config?.rsvp?.googleSheetUrl || ''
      };

      if (config?.rsvp?.googleSheetUrl) {
        await fetch('/api/rsvp-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      setRsvpSubmitted(true);
    } catch (err) {
      console.error('RSVP submit error:', err);
      // Still show success to user
      setRsvpSubmitted(true);
    } finally {
      setRsvpLoading(false);
    }
  };

  // Safe Fallback Data
  const couple = config?.couple || {};
  const bride = couple.bride || { firstName: 'Bride' };
  const groom = couple.groom || { firstName: 'Groom' };
  const displayNames = couple.displayNames || `${groom.firstName} & ${bride.firstName}`;
  const tagline = couple.tagline || 'Together Forever';

  const wedding = config?.wedding || {};
  const displayDate = wedding.displayDate || 'December 19, 2026';
  const heroTime = wedding.heroTime || config?.events?.ceremony?.time || '10:00 AM';

  const story = config?.story || {};
  const invitationText = story.invitationText || 'Together with their families, we invite you to celebrate our joyful union.';
  const paragraphs = story.paragraphs || [
    'We met in an unexpected way, and it turned into the most beautiful chapter of our lives.',
    'Now, we are excited to start our journey together forever.'
  ];

  // Events Array
  const allEvents = [];
  if (config?.events?.ceremony) {
    allEvents.push({ ...config.events.ceremony, defaultType: 'Ceremony' });
  }
  if (Array.isArray(config?.extraEvents)) {
    allEvents.push(...config.extraEvents);
  }

  // Active Map Event & Query for Location Map Box
  const activeMapEvent = allEvents[selectedMapEventIndex] || allEvents[0] || null;

  const mapLocationQuery = useMemo(() => {
    if (!activeMapEvent) {
      return config?.wedding?.venue || config?.events?.ceremony?.venueName || 'Colombo, Sri Lanka';
    }
    const parts = [];
    if (activeMapEvent.venueName) parts.push(activeMapEvent.venueName);
    if (activeMapEvent.address) parts.push(activeMapEvent.address);
    return parts.join(', ') || config?.wedding?.venue || config?.events?.ceremony?.venueName || 'Colombo, Sri Lanka';
  }, [activeMapEvent, config]);

  const mapEmbedUrl = useMemo(() => {
    if (!mapLocationQuery) return '';
    return `https://maps.google.com/maps?q=${encodeURIComponent(mapLocationQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }, [mapLocationQuery]);

  const mapDirectionsUrl = useMemo(() => {
    if (activeMapEvent?.mapsUrl) return activeMapEvent.mapsUrl;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapLocationQuery)}`;
  }, [activeMapEvent, mapLocationQuery]);

  const googleMapsSearchUrl = useMemo(() => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocationQuery)}`;
  }, [mapLocationQuery]);

  // Gallery Array
  const gallery = Array.isArray(config?.gallery) ? config.gallery : [];

  // Timeline Array
  const timeline = Array.isArray(config?.timeline) ? config.timeline : [];

  // Hero Portrait Image
  const heroImg = config?.heroImage || (gallery[0]?.src) || null;
  const sectionBackgrounds = config?.sectionBackgrounds || {};
  const wholeBackground = config?.wholeBackground || config?.sectionBackgrounds?.whole || null;

  const getSectionBackgroundStyle = (sectionKey) => {
    const imageUrl = sectionBackgrounds[sectionKey];
    if (imageUrl) {
      return {
        backgroundImage: `url("${imageUrl}")`,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundColor: 'transparent',
      };
    }

    // When a whole background is set, let individual sections remain transparent
    // so the stationary full-page background image shows through
    if (wholeBackground) {
      return {
        backgroundColor: 'transparent',
      };
    }

    return undefined;
  };

  return (
    <div className={`relative w-full overflow-x-clip font-sans text-[var(--colorTextDark)] ${wholeBackground ? 'bg-transparent' : 'bg-[var(--colorBg)]'} selection:bg-[var(--colorPrimary)]/20 selection:text-[var(--colorPrimary)]`}>
      
      {/* Whole Page Fixed Stationary Background Image (Clean, 100% original brightness with NO dark overlay) */}
      {wholeBackground && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={wholeBackground}
            alt="Whole Page Background"
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* Background Decorative Floral / Pinstripe Texture (only shown when no wholeBackground) */}
      {!wholeBackground && (
        <div 
          className="fixed inset-0 pointer-events-none opacity-40 z-0 bg-repeat"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--colorPrimary) 0.75px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
      )}

      {/* ========================================================
          0. CINEMATIC SCROLL HERO (FRAME-BY-FRAME MOTION VIDEO)
          ======================================================== */}
      {config?.cinematicFrames?.enabled !== false && (
        <CinematicScrollHero config={config} hasOpened={hasOpened} />
      )}

      {/* ========================================================
          1. HERO SECTION ("THE GRAND FRAMED ENTRANCE")
          ======================================================== */}
      <section
        id="hero-invitation-section"
        className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-4 sm:px-6 z-10"
        style={getSectionBackgroundStyle('hero')}
      >
        
        {/* Subtle Ambient Radial Glow (only when no wholeBackground) */}
        {!wholeBackground && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[550px] h-[300px] sm:h-[550px] rounded-full bg-[var(--colorPrimary)]/10 blur-[100px] pointer-events-none" />
        )}

        <div className="w-full max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Framed Royal Monogram Crest */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-6"
          >
            <FramedMonogram 
              brideName={bride.firstName || bride.fullName} 
              groomName={groom.firstName || groom.fullName} 
              size="lg" 
            />
          </motion.div>

          {/* Invitation Subheader */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="w-8 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--colorPrimary)]" />
            <p className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[var(--colorTextLight)] uppercase">
              The Wedding Invitation
            </p>
            <span className="w-8 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--colorPrimary)]" />
          </motion.div>

          {/* Couple Display Names (Calligraphy + Serif) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--colorTextDark)] mb-4 leading-[1.15]"
          >
            {displayNames}
          </motion.h1>

          {/* Romantic Tagline */}
          {tagline && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="font-serif italic text-base sm:text-lg text-[var(--colorTextLight)] max-w-md mx-auto mb-8"
            >
              "{tagline}"
            </motion.p>
          )}

          {/* Featured Couple Portrait in Bespoke Arch Frame */}
          {heroImg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative my-6 max-w-sm sm:max-w-md w-full px-4"
            >
              {/* Outer Decorative Bevel Frame */}
              <div className="relative rounded-[160px_160px_24px_24px] p-2.5 sm:p-3.5 bg-gradient-to-b from-[var(--colorPrimary)]/40 via-[var(--colorPrimary)]/20 to-[var(--colorPrimary)]/40 shadow-2xl">
                
                {/* Inner Border */}
                <div className="relative overflow-hidden rounded-[150px_150px_18px_18px] border-2 border-white/80 bg-white">
                  <img
                    src={heroImg}
                    alt={displayNames}
                    className="w-full aspect-[3/4] object-cover transition-transform duration-1000 hover:scale-105"
                  />
                  {/* Subtle Corner Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--colorTextDark)]/35 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Gold Diamond Accent at top apex */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 border-2 border-[var(--colorPrimary)] bg-white flex items-center justify-center shadow-md">
                  <div className="w-2.5 h-2.5 bg-[var(--colorPrimary)]" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Framed Date & Time Plaque */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="inline-flex items-center gap-3 sm:gap-6 px-6 sm:px-8 py-3 rounded-full border border-[var(--colorPrimary)]/30 bg-white/70 backdrop-blur-md shadow-sm mt-4"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider text-[var(--colorTextDark)]">
              <Calendar size={15} className="text-[var(--colorPrimary)]" />
              <span>{displayDate}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--colorPrimary)]" />
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider text-[var(--colorTextDark)]">
              <Clock size={15} className="text-[var(--colorPrimary)]" />
              <span>{heroTime}</span>
            </div>
          </motion.div>

          {/* Live Countdown Timer */}
          <FramedCountdown targetDateISO={wedding.dateTimeISO} />

          {/* Action CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2"
          >
            <a
              href="#rsvp-section"
              className="px-8 py-3.5 rounded-full bg-[var(--colorPrimary)] text-white font-sans text-xs sm:text-sm font-bold tracking-widest uppercase shadow-[0_8px_25px_rgba(201,149,106,0.35)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              RSVP With Us
            </a>
            <button
              onClick={handleAddToCalendar}
              className="px-6 py-3.5 rounded-full border border-[var(--colorPrimary)]/40 bg-white/70 hover:bg-white text-[var(--colorTextDark)] font-sans text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 flex items-center gap-2"
            >
              <Calendar size={15} className="text-[var(--colorPrimary)]" />
              <span>Add to Calendar</span>
            </button>
          </motion.div>

        </div>

        {/* Scroll Cue Indicator */}
        <div className="mt-12 text-[var(--colorPrimary)] animate-bounce flex flex-col items-center">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ========================================================
          2. PERSONALIZED VIP GUEST INVITATION CARD
          ======================================================== */}
      <section
        className="relative py-12 px-4 sm:px-6 z-10"
        style={getSectionBackgroundStyle('guestCard')}
      >
        <div className="max-w-2xl mx-auto">
          <LuxuryFrame glow={true} className="text-center py-10 px-6 sm:px-12">
            
            {/* Wax Seal / Stamp Icon */}
            <div className="w-12 h-12 rounded-full mx-auto mb-4 border-2 border-[var(--colorPrimary)] bg-[var(--colorPrimary)]/10 flex items-center justify-center shadow-sm">
              <Heart size={20} className="text-[var(--colorPrimary)] fill-[var(--colorPrimary)]/30" />
            </div>

            <p className="font-sans text-[11px] font-bold tracking-[0.2em] text-[var(--colorPrimary)] uppercase mb-2">
              Cordially Invited
            </p>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--colorTextDark)] mb-4">
              {guestName ? `Dear ${guestName},` : 'Honored Guest,'}
            </h3>

            <p className="font-serif text-sm sm:text-base text-[var(--colorTextDark)]/80 leading-relaxed mb-6 max-w-lg mx-auto">
              Together with their families, <span className="font-semibold text-[var(--colorPrimary)]">{displayNames}</span> request the honor of your presence to share in their joy as they exchange their wedding vows and celebrate their union.
            </p>

            {/* Reserved Seats Pill */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--colorPrimary)]/10 border border-[var(--colorPrimary)]/25 text-xs font-semibold text-[var(--colorTextDark)]">
              <UserCheck size={14} className="text-[var(--colorPrimary)]" />
              <span>{config?.rsvp?.maxGuests || 2} Seat(s) Reserved in Your Honor</span>
            </div>

          </LuxuryFrame>
        </div>
      </section>

      {/* ========================================================
          3. OUR STORY SECTION ("CHAPTERS OF OUR LOVE")
          ======================================================== */}
      <section
        id="story-section"
        className="relative py-16 px-4 sm:px-6 z-10"
        style={getSectionBackgroundStyle('story')}
      >
        <div className="max-w-3xl mx-auto text-center">
          
          {/* Section Header */}
          <div className="mb-10">
            <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[var(--colorPrimary)] uppercase">
              Our Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--colorTextDark)] mt-2">
              The Story of Us
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4 text-[var(--colorPrimary)]">
              <span className="w-12 h-[1px] bg-current opacity-40" />
              <Sparkles size={14} />
              <span className="w-12 h-[1px] bg-current opacity-40" />
            </div>
          </div>

          <LuxuryFrame className="text-center p-8 sm:p-12">
            {/* Invitation Statement Quote */}
            <blockquote className="font-serif italic text-lg sm:text-xl text-[var(--colorTextDark)] mb-8 leading-relaxed">
              "{invitationText}"
            </blockquote>

            {/* Paragraphs with Dropcap */}
            <div className="space-y-4 text-left max-w-2xl mx-auto font-serif text-sm sm:text-base text-[var(--colorTextDark)]/80 leading-relaxed">
              {paragraphs.map((p, idx) => (
                <p key={idx} className="first-letter:text-3xl first-letter:font-bold first-letter:text-[var(--colorPrimary)] first-letter:mr-1">
                  {p}
                </p>
              ))}
            </div>
          </LuxuryFrame>

        </div>
      </section>

      {/* ========================================================
          4. WEDDING EVENTS & VENUES (CEREMONY & RECEPTION)
          ======================================================== */}
      <section
        id="events-section"
        className="relative py-16 px-4 sm:px-6 z-10"
        style={getSectionBackgroundStyle('events')}
      >
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[var(--colorPrimary)] uppercase">
              Where & When
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--colorTextDark)] mt-2">
              The Celebrations
            </h2>
          </div>

          <div className={`grid grid-cols-1 ${allEvents.length > 1 ? 'md:grid-cols-2' : 'max-w-xl mx-auto'} gap-6 sm:gap-8`}>
            {allEvents.map((evt, idx) => (
              <LuxuryFrame key={idx} className="flex flex-col justify-between">
                <div>
                  
                  {/* Event Photo if available */}
                  {evt.image && (
                    <div className="relative overflow-hidden rounded-xl mb-6 border border-[var(--colorPrimary)]/30 aspect-[16/9]">
                      <img
                        src={evt.image}
                        alt={evt.title || 'Event Venue'}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--colorTextDark)]/50 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  {/* Header Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-2xl">{evt.icon || '🌸'}</span>
                    <span className="px-3 py-1 rounded-full border border-[var(--colorPrimary)]/40 bg-[var(--colorPrimary)]/10 text-[var(--colorPrimary)] text-xs font-bold tracking-wider uppercase">
                      {evt.time || '10:00 AM'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-2xl font-bold text-[var(--colorTextDark)] mb-2">
                    {evt.title || evt.defaultType || 'Wedding Event'}
                  </h3>

                  {/* Venue Name */}
                  <div className="flex items-start gap-2.5 text-sm font-semibold text-[var(--colorTextDark)] mb-1">
                    <MapPin size={18} className="text-[var(--colorPrimary)] shrink-0 mt-0.5" />
                    <span>{evt.venueName || 'Venue to be announced'}</span>
                  </div>

                  {/* Address */}
                  {evt.address && (
                    <p className="text-xs sm:text-sm text-[var(--colorTextLight)] pl-7 mb-4">
                      {evt.address}
                    </p>
                  )}

                  {/* Dress Code */}
                  {evt.dressCode && (
                    <div className="pl-7 mb-6">
                      <span className="inline-block text-[11px] font-semibold tracking-wider text-[var(--colorTextDark)]/80 px-2.5 py-1 rounded-md bg-[var(--colorPrimary)]/10 border border-[var(--colorPrimary)]/20">
                        👗 Dress Code: {evt.dressCode}
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Actions */}
                <div className="pt-4 border-t border-[var(--colorPrimary)]/15 flex items-center gap-3">
                  {evt.mapsUrl ? (
                    <a
                      href={evt.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-lg bg-[var(--colorPrimary)] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[var(--colorPrimary)]/90 transition-all"
                    >
                      <Navigation size={14} />
                      <span>Get Directions</span>
                    </a>
                  ) : (
                    <div className="flex-1 py-2 text-center text-xs text-[var(--colorTextLight)] italic">
                      Directions available soon
                    </div>
                  )}
                </div>

              </LuxuryFrame>
            ))}
          </div>

          {/* ========================================================
              INTERACTIVE VENUE MAP BOX
              ======================================================== */}
          {mapLocationQuery && (
            <div id="location-map" className="mt-10 sm:mt-12">
              <LuxuryFrame glow={true} className="p-5 sm:p-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-[var(--colorPrimary)]/20">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[var(--colorPrimary)] mb-1">
                      <MapPin size={15} />
                      <span>Venue Location & Map</span>
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--colorTextDark)]">
                      {activeMapEvent?.title || activeMapEvent?.defaultType || 'Venue Location'}
                    </h3>
                    {(activeMapEvent?.venueName || activeMapEvent?.address) && (
                      <p className="font-serif text-xs sm:text-sm text-[var(--colorTextLight)] mt-1">
                        {activeMapEvent?.venueName && (
                          <span className="font-semibold text-[var(--colorTextDark)]">{activeMapEvent.venueName}</span>
                        )}
                        {activeMapEvent?.venueName && activeMapEvent?.address ? ' • ' : ''}
                        {activeMapEvent?.address}
                      </p>
                    )}
                  </div>

                  {/* Switcher Tabs if multiple events exist */}
                  {allEvents.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {allEvents.map((evt, idx) => {
                        const isSelected = selectedMapEventIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedMapEventIndex(idx)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-semibold transition-all duration-300 ${
                              isSelected
                                ? 'bg-[var(--colorPrimary)] text-white shadow-md scale-105'
                                : 'bg-white/60 text-[var(--colorTextDark)]/70 hover:bg-white border border-[var(--colorPrimary)]/25'
                            }`}
                          >
                            {evt.title || evt.defaultType || `Venue ${idx + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Google Map Embedded Frame */}
                <div className="relative overflow-hidden rounded-xl border border-[var(--colorPrimary)]/30 shadow-inner bg-slate-100 h-[280px] sm:h-[380px] w-full">
                  <iframe
                    title="Event Location Google Map"
                    src={mapEmbedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Map Action Links */}
                <div className="mt-5 pt-4 border-t border-[var(--colorPrimary)]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <span className="text-xs font-serif italic text-[var(--colorTextLight)]">
                    Easily navigate to {activeMapEvent?.venueName || 'the venue'} via Google Maps
                  </span>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <a
                      href={mapDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-[var(--colorPrimary)] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(201,149,106,0.25)] hover:scale-105 active:scale-95 transition-all"
                    >
                      <Navigation size={14} />
                      <span>Get Directions</span>
                    </a>

                    <a
                      href={googleMapsSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-full bg-white/70 hover:bg-white border border-[var(--colorPrimary)]/30 text-[var(--colorTextDark)] text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ExternalLink size={13} />
                      <span>Open in Maps</span>
                    </a>
                  </div>
                </div>

              </LuxuryFrame>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================
          5. THE DAY'S TIMELINE ("ORDER OF EVENTS")
          ======================================================== */}
      {timeline.length > 0 && (
        <section
          id="timeline-section"
          className="relative py-16 px-4 sm:px-6 z-10"
          style={getSectionBackgroundStyle('timeline')}
        >
          <div className="max-w-2xl mx-auto">
            
            <div className="text-center mb-12">
              <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[var(--colorPrimary)] uppercase">
                Order of Events
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--colorTextDark)] mt-2">
                The Wedding Day
              </h2>
            </div>

            <div className="relative border-l-2 border-[var(--colorPrimary)]/30 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative group">
                  
                  {/* Timeline Glowing Node */}
                  <div className="absolute -left-[33px] sm:-left-[41px] top-1.5 w-6 h-6 rounded-full border-2 border-[var(--colorPrimary)] bg-white flex items-center justify-center shadow-md">
                    <div className="w-2 h-2 rounded-full bg-[var(--colorPrimary)]" />
                  </div>

                  <LuxuryFrame className="p-5 sm:p-6 transition-all duration-300 hover:scale-[1.01]">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="text-xl">{item.icon || '✨'}</span>
                      <span className="px-2.5 py-0.5 rounded-full border border-[var(--colorPrimary)]/30 text-[var(--colorPrimary)] text-xs font-bold tracking-wider">
                        {item.time}
                      </span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-[var(--colorTextDark)]">
                      {item.title}
                    </h4>

                    {item.description && (
                      <p className="text-xs sm:text-sm text-[var(--colorTextDark)]/70 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </LuxuryFrame>

                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ========================================================
          6. "WITH FRAMES" PHOTO GALLERY
          ======================================================== */}
      {gallery.length > 0 && (
        <section
          id="gallery-section"
          className="relative py-16 px-4 sm:px-6 z-10"
          style={getSectionBackgroundStyle('gallery')}
        >
          <div className="max-w-5xl mx-auto">
            
            <div className="text-center mb-12">
              <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[var(--colorPrimary)] uppercase">
                Framed Moments
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--colorTextDark)] mt-2">
                Our Memories
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {gallery.map((img, idx) => {
                const src = typeof img === 'string' ? img : img.src;
                if (!src) return null;

                return (
                  <div
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className="relative group cursor-pointer overflow-hidden rounded-xl p-1.5 sm:p-2 bg-white shadow-md border border-[var(--colorPrimary)]/30 transition-all duration-300 hover:shadow-xl hover:scale-105"
                  >
                    {/* Inner Passe-Partout Frame */}
                    <div className="relative overflow-hidden rounded-lg aspect-[3/4]">
                      <img
                        src={src}
                        alt={`Wedding Memory ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold tracking-widest uppercase bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm transition-all duration-300 scale-90 group-hover:scale-100">
                          View
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* Lightbox Modal for Gallery */}
      <AnimatePresence>
        {activePhotoIndex !== null && gallery[activePhotoIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none"
            onClick={() => setActivePhotoIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhotoIndex(null)}
              className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            >
              <X size={24} />
            </button>

            {/* Prev Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((activePhotoIndex - 1 + gallery.length) % gallery.length);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIndex((activePhotoIndex + 1) % gallery.length);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            >
              <ChevronRight size={28} />
            </button>

            {/* Framed Lightbox Photo */}
            <div 
              className="relative max-w-4xl max-h-[85vh] p-3 rounded-2xl bg-white/10 border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={typeof gallery[activePhotoIndex] === 'string' ? gallery[activePhotoIndex] : gallery[activePhotoIndex].src}
                alt="Enlarged Memory"
                className="max-h-[80vh] w-auto object-contain rounded-xl"
              />
              <div className="text-center text-white/70 text-xs tracking-widest uppercase mt-3">
                {activePhotoIndex + 1} / {gallery.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          7. RSVP SECTION ("SAVE YOUR SEAT")
          ======================================================== */}
      {fieldsToRender && fieldsToRender.length > 0 && (
        <section
          id="rsvp-section"
          className="relative py-20 px-4 sm:px-6 z-10"
          style={getSectionBackgroundStyle('rsvp')}
        >
          <div className="max-w-2xl mx-auto">
            
            <div className="text-center mb-10">
              <span className="font-sans text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[var(--colorPrimary)] uppercase">
                Join Our Celebration
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--colorTextDark)] mt-2">
                RSVP
              </h2>
              {config?.rsvp?.deadline && (
                <p className="font-serif italic text-sm text-[var(--colorTextLight)] mt-2">
                  Kindly respond by {config.rsvp.deadline}
                </p>
              )}
            </div>

            <LuxuryFrame glow={true} className="p-6 sm:p-10">
              
              {rsvpSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[var(--colorTextDark)] mb-2">
                    Thank You!
                  </h3>
                  <p className="font-serif text-sm sm:text-base text-[var(--colorTextDark)]/70 max-w-md mx-auto mb-6">
                    Your response has been received with joy. We cannot wait to celebrate our union with you!
                  </p>
                  <button
                    onClick={() => setRsvpSubmitted(false)}
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--colorPrimary)] underline hover:opacity-80"
                  >
                    Submit another response
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleWhatsAppRSVP} className="space-y-6">
                  
                  {fieldsToRender.map((field, idx) => {
                    const isCore = field.id === 'guestName' || field.id === 'name' || field.id === 'attending';
                    const isVisible = isCore || isAttending || field.type === 'textarea';
                    if (!isVisible) return null;

                    const currentValue = formData[field.id] ?? (
                      (field.id === 'guestName' || field.id === 'name') 
                        ? (formData.guestName || formData.name || guestName || '') 
                        : ''
                    );

                    const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--colorPrimary)]/30 focus:border-[var(--colorPrimary)] bg-white/75 backdrop-blur-sm focus:bg-white/95 outline-none font-serif text-sm text-[var(--colorTextDark)] transition-all shadow-sm";

                    return (
                      <div key={field.id || idx} className="space-y-2 animate-fadeIn">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--colorTextDark)]/80">
                          {field.label || 'Question'} {field.required && <span className="text-[var(--colorPrimary)]">*</span>}
                        </label>

                        {/* 1. Textarea */}
                        {field.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            value={currentValue}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder || 'Write your message or wishes here...'}
                            className={`${inputClass} resize-y min-h-[90px]`}
                          />
                        ) : field.type === 'button-group' ? (
                          /* 2. Button Group (e.g. Attending Yes/No) */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(field.options || 'Joyfully Accept,Regretfully Decline').split(',').map((opt, i) => {
                              const choice = opt.trim();
                              const isSelected = currentValue === choice;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleFieldChange(field.id, choice)}
                                  className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-serif font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                    isSelected
                                      ? 'border-[var(--colorPrimary)] bg-[var(--colorPrimary)] text-white shadow-md scale-[1.01]'
                                      : 'border-[var(--colorPrimary)]/25 bg-white/60 text-[var(--colorTextDark)]/70 hover:bg-white hover:border-[var(--colorPrimary)]/50'
                                  }`}
                                >
                                  {isSelected && <CheckCircle2 size={15} className="text-white shrink-0" />}
                                  <span>{choice}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : field.type === 'checkbox-group' ? (
                          /* 3. Checkbox Group (Multiple Selection) */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {(field.options || '').split(',').map((opt, i) => {
                              const choice = opt.trim();
                              const selectedList = (currentValue || '').split(', ').filter(Boolean);
                              const isChecked = selectedList.includes(choice);
                              return (
                                <label
                                  key={i}
                                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                    isChecked
                                      ? 'bg-[var(--colorPrimary)]/15 border-[var(--colorPrimary)] text-[var(--colorTextDark)] font-semibold shadow-sm'
                                      : 'bg-white/60 border-[var(--colorPrimary)]/25 text-[var(--colorTextDark)]/75 hover:bg-white hover:border-[var(--colorPrimary)]/50'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                    isChecked ? 'bg-[var(--colorPrimary)] border-[var(--colorPrimary)] text-white' : 'bg-white/80 border-[var(--colorPrimary)]/40'
                                  }`}>
                                    {isChecked && <Check size={12} strokeWidth={3} />}
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      let updated;
                                      if (e.target.checked) {
                                        updated = [...selectedList, choice];
                                      } else {
                                        updated = selectedList.filter(item => item !== choice);
                                      }
                                      handleFieldChange(field.id, updated.join(', '));
                                    }}
                                    className="hidden"
                                  />
                                  <span className="text-xs sm:text-sm font-serif">{choice}</span>
                                </label>
                              );
                            })}
                          </div>
                        ) : field.type === 'guest-count' ? (
                          /* 4. Guest Count Select (Respects URL pax) */
                          <div>
                            {urlPax && (
                              <p className="text-[10px] font-sans uppercase tracking-widest text-[var(--colorPrimary)] mb-1.5 font-semibold">
                                Max allowed for your invitation: {urlPax} {urlPax === 1 ? 'guest' : 'guests'}
                              </p>
                            )}
                            <select
                              value={currentValue || (urlPax ? Math.min(urlPax, 1) : 1)}
                              onChange={(e) => handleFieldChange(field.id, Number(e.target.value))}
                              className={`${inputClass} cursor-pointer`}
                            >
                              {Array.from(
                                { length: urlPax ? Math.min(urlPax, config?.rsvp?.maxGuests || 50) : (config?.rsvp?.maxGuests || 5) },
                                (_, i) => i + 1
                              ).map((num) => (
                                <option key={num} value={num}>
                                  {num} {num === 1 ? 'Guest' : 'Guests'}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : field.type === 'select' ? (
                          /* 5. Dropdown Select */
                          <select
                            value={currentValue}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className={`${inputClass} cursor-pointer`}
                          >
                            <option value="">{field.placeholder || '-- Please Select --'}</option>
                            {(field.options || '').split(',').map((opt, i) => {
                              const choice = opt.trim();
                              return <option key={i} value={choice}>{choice}</option>;
                            })}
                          </select>
                        ) : field.type === 'number' ? (
                          /* 6. Number Input */
                          <input
                            type="number"
                            min={0}
                            value={currentValue}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder || '0'}
                            className={inputClass}
                          />
                        ) : field.type === 'tel' ? (
                          /* 7. Phone Input */
                          <input
                            type="tel"
                            value={currentValue}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder || '+94 77 123 4567'}
                            className={inputClass}
                          />
                        ) : (
                          /* 8. Default Short Text */
                          <input
                            type="text"
                            value={currentValue}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            placeholder={field.placeholder || 'Enter answer...'}
                            className={inputClass}
                          />
                        )}

                        {/* Error Feedback */}
                        {formErrors[field.id] && (
                          <p className="text-red-500 text-[11px] font-sans font-medium mt-1">
                            ⚠️ {formErrors[field.id]}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Submission Buttons */}
                  <div className="pt-4 flex flex-col gap-3">
                    {config?.rsvp?.submissionDestination === 'google-sheet' ? (
                      <>
                        <button
                          type="button"
                          onClick={handleDirectRSVP}
                          disabled={rsvpLoading}
                          className="w-full py-4 rounded-full bg-[var(--colorPrimary)] text-white text-xs sm:text-sm font-bold tracking-widest uppercase shadow-[0_8px_25px_rgba(201,149,106,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Send size={15} />
                          <span>{rsvpLoading ? 'Submitting...' : 'Submit RSVP'}</span>
                        </button>

                        {config?.rsvp?.whatsappNumber && (
                          <button
                            type="button"
                            onClick={handleWhatsAppRSVP}
                            className="w-full py-3 rounded-full border border-[var(--colorPrimary)]/40 bg-white/70 hover:bg-white text-[var(--colorTextDark)] text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <span>Send via WhatsApp</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          type="submit"
                          className="w-full py-4 rounded-full bg-[var(--colorPrimary)] text-white text-xs sm:text-sm font-bold tracking-widest uppercase shadow-[0_8px_25px_rgba(201,149,106,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Send size={15} />
                          <span>Send RSVP via WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleDirectRSVP}
                          disabled={rsvpLoading}
                          className="w-full py-3 rounded-full border border-[var(--colorPrimary)]/40 bg-white/70 hover:bg-white text-[var(--colorTextDark)] text-xs font-semibold tracking-wider uppercase transition-all duration-300"
                        >
                          {rsvpLoading ? 'Submitting...' : 'Submit Online Without WhatsApp'}
                        </button>
                      </>
                    )}
                  </div>

                </form>
              )}

            </LuxuryFrame>

          </div>
        </section>
      )}

      {/* ========================================================
          8. MODERN ELEGANT FOOTER
          ======================================================== */}
      <footer
        className={`relative py-16 px-4 sm:px-6 border-t border-[var(--colorPrimary)]/20 ${wholeBackground ? 'bg-transparent' : 'bg-white/50 backdrop-blur-md'} z-10 text-center`}
        style={getSectionBackgroundStyle('footer')}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center">
          
          <FramedMonogram 
            brideName={bride.firstName || bride.fullName} 
            groomName={groom.firstName || groom.fullName} 
            size="sm" 
          />

          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--colorTextDark)] mt-4">
            {displayNames}
          </h3>

          <p className="font-serif italic text-sm text-[var(--colorTextLight)] mt-2">
            {displayDate}
          </p>

          <p className="font-serif text-xs text-[var(--colorTextDark)]/60 mt-4 leading-relaxed max-w-sm">
            Thank you for being part of our story and celebrating our new beginning.
          </p>

          {/* Smooth Scroll to Top */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-8 p-3 rounded-full border border-[var(--colorPrimary)]/30 bg-white text-[var(--colorPrimary)] hover:bg-[var(--colorPrimary)] hover:text-white transition-all shadow-sm"
            aria-label="Back to Top"
          >
            <ArrowUp size={16} />
          </button>

          <p className="font-sans text-[10px] tracking-widest text-[var(--colorTextLight)] uppercase mt-6 opacity-60">
            © {config?.wedding?.year || new Date().getFullYear()} {displayNames}
          </p>

        </div>
      </footer>

    </div>
  );
}
