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
  // The Meetmaps event platform. Empty this, or point it back inside the page
  // with a '#', and every Login button disappears — which is what should happen
  // if the platform is ever taken down, rather than leaving buttons that lead
  // nowhere.
  login: {
    url: 'https://event.meetmaps.com/MATCHBILBAOBIZKAIA2026/en/virtual/join',
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
      // Counted from the directory, so it follows the platform rather than
      // being a number to keep in step by hand.
      { value: 'count:exhibitors', label: 'Local exhibitors' },
      { value: '5', label: 'Days of programme' },
      { value: '1:1', label: 'Pre-scheduled meetings' }
    ],
    // Drop the file at the path below and it is used automatically.
    media: {
      image: 'assets/img/photos/puppy.jpg',
      video: '' // e.g. 'assets/video/hero-loop.mp4'
    }
  },

  /* --- Contact ----------------------------------------------------------- */
  contact: {
    intro:
      'Our team is here to help you prepare your participation, from ' +
      'registration and meeting scheduling to travel and accreditation.',
    // One address answers everything now, so "General enquiries" and
    // "Technical support" have been merged rather than printed twice.
    channels: [
      {
        title: 'Email',
        note: 'Programme, registration, participation and platform support',
        value: 'welcome@matchbilbaobizkaia.eus',
        href: 'mailto:welcome@matchbilbaobizkaia.eus',
        icon: 'mail'
      },
      {
        title: 'Telephone',
        note: 'Monday to Friday, 9:00 – 17:00 CET',
        value: '+34 944 205 377',
        href: 'tel:+34944205377',
        icon: 'phone'
      }
      // More channels can be added here — the row is built from this list,
      // so it adapts to however many there are.
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
    mail: 'welcome@matchbilbaobizkaia.eus'
  },

  /* --- Newsletter -------------------------------------------------------- */
  newsletter: {
    title: 'Stay close to the destination',
    text:
      'Receive the Match Bilbao Bizkaia 2026 programme updates, exhibitor ' +
      'announcements and registration reminders.',
    // [Insert newsletter endpoint] — point this at your CRM or mailing platform.
    //
    // Agreed in review, still to be built: this becomes a proper form rather
    // than a single email field, collecting
    //   · company name
    //   · contact email
    //   · where the company is based
    // Held back until it is decided where the entries should land — a CRM, a
    // mailing platform or an inbox — because that choice decides whether the
    // form posts to an endpoint, and what the consent wording has to say.
    action: '',
    consent:
      'By subscribing you accept the processing of your data for the purpose ' +
      'of receiving information about Match Bilbao Bizkaia.'
  }
};
