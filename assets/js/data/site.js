/* =============================================================================
   SITE DATA — Match Bilbao Bizkaia 2026
   -----------------------------------------------------------------------------
   Global, non-repeating content: navigation, hero, calls to action, contact
   details and footer. Edit the values here; the components read from them.
   ========================================================================== */

window.MBB = window.MBB || {};

window.MBB.site = {
  /* --- Event identity ---------------------------------------------------- */
  event: {
    name: 'Match Bilbao Bizkaia',
    edition: '2026',
    dates: '6 – 10 October 2026',
    location: 'Bilbao · Bizkaia · Basque Country',
    // Used for the "Add to calendar" link (ICS-free Google Calendar template).
    calendarUrl:
      'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=Match+Bilbao+Bizkaia+2026' +
      '&dates=20261006T070000Z/20261010T160000Z' +
      '&details=International+tourism+networking+event+in+Bilbao+Bizkaia.' +
      '&location=Bilbao%2C+Bizkaia%2C+Basque+Country'
  },

  /* --- Primary navigation ------------------------------------------------ */
  nav: [
    { label: 'Home', href: '#home' },
    { label: 'Match Bilbao Bizkaia 2026', href: '#event' },
    { label: "Meet BB's Experts", href: '#experts' },
    { label: 'Discover', href: '#discover' },
    { label: 'Contact', href: '#contact' }
  ],

  /* --- Login ------------------------------------------------------------- */
  // [Insert login / meeting platform URL] — replace with the real platform URL.
  login: {
    url: '#login-placeholder',
    label: 'Login'
  },

  /* --- Hero -------------------------------------------------------------- */
  hero: {
    kicker: '6 – 10 October 2026 · Bilbao, Basque Country',
    title: 'Match Bilbao Bizkaia',
    titleYear: '2026',
    subtitle:
      'The official professional meeting point of the Bilbao Bizkaia destination.',
    lead:
      'Four days of curated B2B meetings, destination knowledge and shared ' +
      'discovery, bringing international buyers together with the tourism ' +
      'professionals who know Bilbao Bizkaia best.',
    ctas: [
      { label: 'Explore the event', href: '#event', variant: 'primary' },
      { label: "Meet BB's Experts", href: '#experts', variant: 'ghost' }
    ],
    // Quick facts shown under the hero.
    facts: [
      { value: '49', label: 'Local exhibitors' },
      { value: '4', label: 'Days of programme' },
      { value: '1:1', label: 'Pre-scheduled meetings' }
    ],
    // [Insert hero image or video] — drop a file at the path below and it will
    // be used automatically as the hero backdrop. Recommended: 2400×1350 JPG,
    // or an MP4 loop of max. 6 MB.
    media: {
      image: 'assets/img/photos/hero.jpg',
      video: '' // e.g. 'assets/video/hero-loop.mp4'
    }
  },

  /* --- Contact ----------------------------------------------------------- */
  contact: {
    intro:
      'Our team is here to help you prepare your participation, from ' +
      'registration and meeting scheduling to travel and accreditation.',
    channels: [
      {
        title: 'General enquiries',
        note: 'Programme, registration and participation',
        value: 'info@matchbilbaobizkaia.eus',
        href: 'mailto:info@matchbilbaobizkaia.eus',
        icon: 'mail'
      },
      {
        title: 'Technical support',
        note: 'Meeting platform and login assistance',
        value: 'help@matchbilbaobizkaia.eus',
        href: 'mailto:help@matchbilbaobizkaia.eus',
        icon: 'support'
      },
      {
        title: 'WhatsApp support',
        note: 'Monday to Friday, 9:00 – 17:00 CET',
        value: '+34 689 505 376',
        href: 'https://wa.me/34689505376',
        icon: 'chat'
      },
      {
        title: 'Event organisation',
        note: 'Bilbao Bizkaia tourism promotion office',
        value: 'bilbaobizkaia@promotourist.net',
        href: 'mailto:bilbaobizkaia@promotourist.net',
        icon: 'office'
      }
    ]
  },

  /* --- Footer ------------------------------------------------------------ */
  footer: {
    statement:
      'Match Bilbao Bizkaia is organised by the tourism authorities of Bilbao ' +
      'and Bizkaia to connect the destination with the international travel trade.',
    // Institutional logos. `plain: true` shows the mark directly on the dark
    // ground; the others sit in a white box, as on the current site.
    institutions: [
      { name: 'Bilbao Bizkaia', file: 'assets/img/brand/bilbao-bizkaia-be-basque.png', href: 'https://www.bilbaoturismo.net/', plain: true },
      { name: 'In cooperation with Spain', file: 'assets/img/brand/spain.png', href: 'https://www.spain.info/en/' },
      { name: 'Euskadi Basque Country', file: 'assets/img/brand/euskadi-basque-country.png', href: 'http://www.euskaditurismo.eus/' },
      { name: 'Gobierno Vasco — Departamento de Turismo', file: 'assets/img/brand/dpto-turismo.png', href: 'https://www.visitbiscay.eus/' }
    ],
    social: [
      {
        handle: '@bilbaoturismo',
        links: [
          { label: 'Facebook', href: 'https://www.facebook.com/BilbaoTurismo/' },
          { label: 'Instagram', href: 'https://www.instagram.com/bilbaoturismo/' },
          { label: 'X', href: 'https://twitter.com/bilbaoturismo' },
          { label: 'Website', href: 'https://www.bilbaoturismo.net/' }
        ]
      },
      {
        handle: '@visitbiscay',
        links: [
          { label: 'Facebook', href: 'https://www.facebook.com/visitbiscay' },
          { label: 'Instagram', href: 'https://www.instagram.com/visitbiscay/' },
          { label: 'X', href: 'https://twitter.com/visitbiscay' },
          { label: 'Website', href: 'https://www.visitbiscay.eus/' }
        ]
      }
    ],
    legal: [
      { label: 'Privacy policy', href: '#legal-privacy' },      // [Insert legal link]
      { label: 'Cookie policy', href: '#legal-cookies' },       // [Insert legal link]
      { label: 'Legal notice', href: '#legal-notice' },         // [Insert legal link]
      { label: 'Accessibility', href: '#legal-accessibility' }  // [Insert legal link]
    ],
    copyright: 'Bilbao Bizkaia. All rights reserved.',
    mail: 'info@matchbilbaobizkaia.eus'
  },

  /* --- Newsletter -------------------------------------------------------- */
  newsletter: {
    title: 'Stay close to the destination',
    text:
      'Receive the Match Bilbao Bizkaia 2026 programme updates, exhibitor ' +
      'announcements and registration reminders.',
    // [Insert newsletter endpoint] — point this at your CRM or mailing platform.
    action: '',
    consent:
      'By subscribing you accept the processing of your data for the purpose ' +
      'of receiving information about Match Bilbao Bizkaia.'
  }
};
