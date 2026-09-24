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
  // EL MENÚ VA EN EL ORDEN EN QUE ESTÁ LA PÁGINA, y cada entrada nombra lo que
  // se encuentra al llegar. Hubo una que decía "Match Bilbao Bizkaia 2026" y
  // llevaba al programa: repetía el nombre que ya está en el logotipo y no
  // avisaba de a dónde iba. Ahora son dos, y cada una dice lo suyo.
  nav: [
    { label: 'Home', href: '#home' },
    { label: 'Destination', href: '#presentation' },
    // "Programme" y no "Event Programme", y no es capricho: con la etiqueta
    // larga la fila mide 12px más de los que hay a 1280px —la anchura de
    // portátil más corriente— desde el día que el Login pasa a ser una pastilla
    // y ocupa 33px más. El menú se partía en dos filas. La sección se titula
    // "Event Programme" en grande dos pantallas más abajo, así que la palabra
    // no se pierde: solo no se repite donde no cabe.
    { label: 'Programme', href: '#event' },
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

    // La plataforma abre el martes 29 de septiembre a las 12:00 del mediodía,
    // hora peninsular (el +02:00 es el horario de verano, que ese día sigue
    // vigente). Hasta ese momento TODOS los botones de Login llevan a
    // platform.html, que lo explica, en vez de a un formulario que rechazaría
    // a todo el mundo sin decir por qué.
    //
    // Llegada la hora el cambio ocurre solo: nadie tiene que acordarse de
    // tocar nada ese mediodía. Y vacía esta línea y los botones vuelven a ir
    // directos, por si hubiera que abrir antes.
    //
    // LA HORA IMPORTA, Y POR ESO SE ESCRIBE TAMBIÉN EN platform.html.
    // Estuvo a las 00:01, y entonces anunciar la hora no le servía a nadie:
    // quien entrase el día 29 se lo encontraba abierto. A las 12:00 no: media
    // jornada de ese día la plataforma sigue cerrada, y alguien que lea "abre
    // el 29" un martes a las diez de la mañana tiene todo el derecho a pensar
    // que algo está roto. Si esta hora cambia, cambia también la de esa
    // página; las pruebas no pasan si las dos no dicen lo mismo.
    opensAt: '2026-09-29T12:00:00+02:00',
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
    // ESTE PÁRRAFO YA NO SE DIBUJA. Decía lo mismo que la línea de arriba con
    // más palabras, y su sitio lo ocupan ahora los logos de quien respalda el
    // evento. Se queda escrito porque recuperarlo es volver a ponerlo en
    // components.js, y porque el panel lo sigue editando.
    lead:
      'Four days of curated B2B meetings, destination knowledge and shared ' +
      'discovery, bringing international buyers together with the tourism ' +
      'professionals who know Bilbao Bizkaia best.',
    // LOS LOGOS DE LA PORTADA, POR GRUPOS.
    //
    // No son los mismos que los del pie ni van igual. Abajo están todos y en
    // una sola fila, que es lo que toca al cerrar la web. Aquí arriba solo van
    // estos tres y separados por lo que son: quien organiza no es lo mismo que
    // quien acompaña, y una fila corrida los iguala. Euskadi y el Gobierno
    // Vasco se quedan solo en el pie.
    //
    // Los logos no se escriben aquí: se nombran, y el archivo y el enlace
    // salen de `footer.institutions`, más abajo en este mismo archivo. Los
    // nombres tienen que coincidir palabra por palabra con los de allí; uno
    // que no coincida no se dibuja, en vez de dibujar un hueco roto.
    //
    // El orden de los grupos y el de los logos dentro de cada grupo es el que
    // se ve en la página, así que cambiarlo aquí es cambiarlo en la portada.
    partners: {
      groups: [
        { label: 'Organizer', names: ['Bilbao Bizkaia'] },
        {
          label: 'Strategic Partners',
          names: ['In cooperation with Spain', 'Wizz Air']
        }
      ]
    },
    // LOS DOS BOTONES DE LA PORTADA. VACÍOS A PROPÓSITO.
    //
    // Eran "Explore the event" y "Meet BB's Experts", y llevaban a secciones
    // de esta misma página a las que también se llega por el menú. Ocupaban el
    // sitio con más valor de la web —justo debajo de la entrada— para ofrecer
    // bajar un poco. Ahí está ahora la banda roja: darse de alta o entrar, que
    // es lo único que de verdad hay que pedirle a quien llega.
    //
    // Añadiendo uno aquí —o en el panel— vuelven a salir, encima de la banda.
    ctas: [],
    // LAS CIFRAS DE DEBAJO DE LA PORTADA. VACÍAS A PROPÓSITO.
    //
    // Eran tres —expositores, días de programa y 1:1— y ocupaban el final de
    // la primera pantalla. Ahí está ahora la banda roja de darse de alta o
    // entrar, que es lo que se le pide a quien acaba de leer la entrada. Las
    // cifras contaban el evento; la banda pide hacer algo, y en ese sitio lo
    // segundo vale más.
    //
    // Escribiendo una aquí —o en el panel— vuelven a salir, encima de la
    // banda. No hay que tocar código. Eran estas:
    //
    //   { value: 'count:exhibitors', label: 'Local exhibitors' }
    //       ↑ se contaba sola desde el directorio, no había que mantenerla.
    //   { value: '4',   label: 'Days of programme' }
    //       ↑ cuatro y no cinco: el día 5 es solo check-out y traslados.
    //   { value: '1:1', label: 'Pre-scheduled meetings' }
    facts: [],
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
        note: 'Monday to Friday, 9:00 – 15:00 CET',
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
    // Institutional logos. Todos van en caja blanca sobre el gris del pie, que
    // es lo que hace legible cualquier marca con la letra oscura. Un logotipo
    // dibujado para fondo oscuro puede llevar `plain: true` y se pone directo
    // sobre el gris, sin caja; ahora mismo no lo usa ninguno.
    //
    // Estos mismos logotipos alimentan la fila de la portada: `hero.partners`
    // los nombra en grupos y de aquí saca el archivo y el enlace.
    institutions: [
      // EL MISMO ARCHIVO ARRIBA Y ABAJO, y con caja blanca como los demás.
      //
      // Aquí hubo dos versiones y un lío: la del pie llevaba la letra en
      // blanco —dibujada para este fondo oscuro— y la portada necesitaba otra
      // con la letra negra. Llegó la horizontal, que es la buena, y lleva la
      // letra negra: sobre el gris del pie no se leería suelta, así que va en
      // caja blanca igual que Turespaña, Euskadi y el Gobierno Vasco.
      //
      // Con eso sobra el `plain` que llevaba —"va sin caja porque el fondo es
      // oscuro"— y sobra tener dos archivos. Uno, y el mismo en los dos sitios.
      {
        name: 'Bilbao Bizkaia',
        file: 'assets/img/brand/bilbao-bizkaia-horizontal.png',
        href: 'https://www.bilbaoturismo.net/'
      },
      { name: 'In cooperation with Spain', file: 'assets/img/brand/spain.png', href: 'https://www.spain.info/en/' },
      // La dirección va sin idioma —wizzair.com a secas y no /es-es— porque
      // esta web la lee gente de toda Europa: así Wizz Air le enseña a cada
      // uno el suyo, en vez de mandar a un comprador alemán a la versión
      // española. Si algún día interesa forzar el castellano, se añade /es-es.
      { name: 'Wizz Air', file: 'assets/img/brand/wizzair.png', href: 'https://www.wizzair.com/' },
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
    // Las cuatro páginas legales. Antes eran anclas —#legal-privacy y
    // compañía— que no existían en ninguna parte: pulsarlas cambiaba la
    // dirección del navegador y nada más. Son justo los enlaces que alguien
    // busca cuando hay una reclamación, así que eran los peores que podían
    // estar rotos.
    legal: [
      { label: 'Privacy policy', href: 'privacy.html' },
      { label: 'Cookie policy', href: 'cookies.html' },
      { label: 'Legal notice', href: 'legal-notice.html' },
      { label: 'Accessibility', href: 'accessibility.html' }
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
