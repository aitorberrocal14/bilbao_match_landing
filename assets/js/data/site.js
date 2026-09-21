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

    // La cita, en un solo sitio. De aquí se sacan solos los enlaces a Google
    // Calendar, a Outlook, a Office 365 y el archivo .ics para Apple y para
    // cualquier otro programa. Antes había una dirección de Google escrita a
    // mano, que solo servía para Google y había que rehacer entera si cambiaba
    // una hora.
    //
    // Las horas se escriben con su desfase (+02:00 es la hora de Bilbao en
    // octubre), para que a quien lo abra desde otro país le caiga a la hora
    // correcta y no a la suya.
    calendar: {
      title: 'Match Bilbao Bizkaia 2026',
      details: 'International tourism networking event in Bilbao Bizkaia.',
      location: 'Bilbao, Bizkaia, Basque Country',
      start: '2026-10-06T09:00:00+02:00',
      end: '2026-10-10T18:00:00+02:00'
    }
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
    label: 'Login',

    // La plataforma no abre hasta el 28 de septiembre a las 00:01, hora
    // peninsular (el +02:00 es el horario de verano, que ese día sigue
    // vigente). Hasta entonces TODOS los botones de Login llevan a
    // platform.html, que lo explica, en vez de a un formulario que rechazaría
    // a todo el mundo sin decir por qué.
    //
    // Llegada la fecha el cambio ocurre solo: nadie tiene que acordarse de
    // tocar nada a medianoche. Y vacía esta línea y los botones vuelven a ir
    // directos, por si hubiera que abrir antes.
    opensAt: '2026-09-28T00:01:00+02:00',
    waiting: 'platform.html'
  },

  /* --- Alta en la plataforma --------------------------------------------- */
  // Esto sí está abierto desde ya: cualquiera puede crear su perfil aunque
  // todavía no pueda entrar.
  register: {
    url: 'https://event.meetmaps.com/MATCHBILBAOBIZKAIA2026/en/registration',
    // La frase entera se usa donde hay sitio: la banda del final de la
    // portada y la página de aviso.
    label: 'Create your profile',
    // En la cabecera solo cabe una palabra, y ahí conviven con el Login, el
    // logotipo y el menú. Vacía esto y la cabecera usa la frase larga.
    short: 'Register'
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
      // Cuatro, no cinco. El programa tiene cinco pestañas porque la estancia
      // dura cinco días, pero el día 5 es solo check-out y traslados al
      // aeropuerto: no hay programa ese día. Contarlo inflaba la cifra y además
      // contradecía al texto de arriba, que siempre ha dicho "Four days".
      { value: '4', label: 'Days of programme' },
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
    title:
      'Do you want to receive Bilbao Bizkaia’s Professional Newsletter? ' +
      'Click here!',
    // La pregunta se basta sola. Si algún día hace falta explicar más, se
    // escribe aquí y aparece un párrafo debajo; vacío, no se dibuja nada.
    text: '',
    // Dos públicos, dos formularios.
    //
    // No se pide el correo aquí. El visitante elige qué es, y desde ahí va al
    // formulario de Mailchimp que le corresponde, que es donde se piden los
    // datos y donde se registra el consentimiento. Así esta web no recoge
    // ningún dato personal: solo enlaza.
    //
    // Para añadir o cambiar un público, basta con tocar esta lista.
    // El botón habla en primera persona: el visitante se reconoce en él y
    // pincha. `note` es una línea explicativa opcional bajo cada botón; vacía,
    // el botón queda con su frase y nada más.
    audiences: [
      {
        label: 'I’m a Basque Supplier',
        note: '',
        url: 'https://bilbaoturismo.us17.list-manage.com/subscribe?u=5be092a34755c7cdec316f8cf&id=35fe8d2bdf'
      },
      {
        label: 'I’m an International Trade Agent or Media',
        note: '',
        url: 'https://bilbaoturismo.us17.list-manage.com/subscribe?u=5be092a34755c7cdec316f8cf&id=010b640237'
      }
    ],
    // El consentimiento se pide en el formulario de destino, no aquí, porque
    // aquí no se recoge nada. Si se escribe algo, sale en letra pequeña bajo
    // los botones; vacío, no sale nada.
    consent: ''
  }
};
