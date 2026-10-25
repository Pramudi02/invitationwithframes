/**
 * Default configuration for a new wedding invitation.
 * This acts as the "schema" for the multi-tenant platform.
 */
export const getDefaultConfig = (slug) => ({
  slug, // Mandatory unique identifier (e.g., "kasun-nimesha")
  couple: {
    bride: { firstName: 'Bride', lastName: '', fullName: '' },
    groom: { firstName: 'Groom', lastName: '', fullName: '' },
    displayNames: 'Groom & Bride',
    tagline: 'Together Forever'
  },
  wedding: {
    dateTimeISO: new Date().toISOString(),
    displayDate: 'December 19, 2026',
    year: '2026',
    heroTime: '10:00 AM' // Time shown on the hero card. Only set on newly created invitations.
  },
  story: {
    invitationText: 'Together with their families, we invite you to celebrate our joyful union.',
    paragraphs: [
      'We met in an unexpected way, and it turned into the most beautiful chapter of our lives.',
      'Now, we are excited to start our journey together forever.'
    ]
  },
  events: {
    ceremony: {
      title: 'Wedding Ceremony',
      icon: '🌸',
      time: '10:00 AM',
      venueName: 'Avenue Gardens',
      address: '123 Lotus Lane, Colombo, Sri Lanka',
      mapsUrl: '',
      dressCode: 'Formal'
    }
  },
  extraEvents: [],
  gallery: [],
  audioUrl: '',
  heroImage: '',
  heroVideo: '',
  heroLayout: 1,
  layoutSettings: {}, // Allows flexible dynamic JSON by layout ID
  revealStyle: 'envelope', // 'envelope' | 'couple' | 'cover' | 'premium_envelope'
  theme: {
    colorPrimary: '#C9956A',
    colorSecondary: '#E8D5B7',
    colorTextLight: '#8A7F6A',
    colorTextDark: '#2C2018',
    colorBg: '#FAF7F2',
    colorSurface: '#FFFFFF',
    heroOverlayStart: 'rgba(18, 12, 6, 0.55)',
    heroOverlayEnd: 'rgba(18, 12, 6, 0.25)'
  },
  rsvp: {
    whatsappNumber: '',
    deadline: 'December 1, 2026',
    maxGuests: 2,
    dietaryTitle: null,   // null = use built-in default title
    dietaryItems: null,   // null = use built-in defaults; set to [{id, label}] array to customise
    fields: undefined // Allows dynamic array of form fields
  },
  envelope: {
    title: 'A Wedding Invitation',
    subtitle: 'Groom & Bride',
    buttonText: 'Open Invitation',
    bgImage: '',
    waxSealImage: '/images/wax-seal.png',
    premium: {
      waxSealColor: '#8a0303',
      envelopeColor: '#ffffff',
      liningColor: '#f3f4f6'
    },
    royal: {
      envelopeColor: '#91091E',
      bgColor1: '#3D0010',
      bgColor2: '#91091E',
      sealColor: '#91091E'
    }
  },
  envelopeColors: {
    back: '#064e3b',
    pocket: '#047857',
    flap: '#064e3b',
    card: '#fef3c7',
    seal: '#dc2626'
  },
  timeline: [
    { time: '04:00 PM', title: 'The Ceremony', description: 'Exchange of vows at the main altar', icon: '💍' },
    { time: '05:30 PM', title: 'Cocktail Hour', description: 'Drinks and appetizers on the lawn', icon: '🍸' },
    { time: '07:00 PM', title: 'Grand Dinner', description: 'A gourmet feast followed by toasts', icon: '🍽️' },
    { time: '09:00 PM', title: 'The Party', description: 'Dancing and celebration all night long', icon: '💃' }
  ],
  meta: {
    title: 'Wedding Invitation',
    description: 'Join us as we celebrate our union.',
    ogImage: ''
  },
  sectionBackgrounds: {
    hero: '',
    story: '',
    events: '',
    gallery: '',
    rsvp: '',
    footer: ''
  },
  // Full-section image overrides. A non-empty URL replaces that section's
  // entire rendered content with the image (Layout 9 hero styling: 100% width,
  // natural height, uncropped). Empty = render the section normally.
  sectionReplacements: {
    story: '',
    timeline: '',
    events: '',
    guestCard: '',
    footer: ''
  },
  sharePreviewImageUrl: '',
  isActive: true,
  clientPasscode: null  // Optional: set a passcode to protect the client dashboard
});
