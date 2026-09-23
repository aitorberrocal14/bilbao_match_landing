/* =============================================================================
   COMPONENTS
   -----------------------------------------------------------------------------
   Pure functions: data in, HTML string out. Used by main.js for the landing
   page and by tools/build-exhibitors.js to generate the exhibitor pages, so the
   two always look the same.
   ========================================================================== */

window.MBB = window.MBB || {};

(function (MBB) {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  /**
   * Lo mismo que `esc`, pero dejando poner NEGRITA con **dos asteriscos**.
   *
   * El texto del destino lleva resaltadas media docena de cosas —el estuario
   * industrial, la costa, Urdaibai, el aeropuerto— y son cuatro párrafos
   * largos: sin nada que destaque hay que leérselos enteros para saber si hay
   * algo que interese.
   *
   * Lo que NO se hace es guardar `<strong>` en los datos y dibujarlo tal cual.
   * Estos textos se editan desde el panel, y un campo que acepta HTML es un
   * campo por el que entra cualquier cosa: un `<script>`, una etiqueta a
   * medio cerrar que se come el resto de la página. Aquí se escapa PRIMERO
   * —así todo lo que llegue es texto— y solo después se convierten los pares
   * de asteriscos. Entra negrita y no entra nada más.
   */
  var fuerte = function (s) {
    return esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  };

  /**
   * Folds a name down to what a search should match: lower case, no accents,
   * so that typing "melia" or "aranzazu" finds "Meliá" and "Aránzazu". Exposed
   * because the tiles are built here and searched in main.js, and both sides
   * have to fold the same way.
   */
  MBB.searchKey = function (s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  var ICONS = {
    arrow: '<svg class="ico" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    download: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M2.5 13h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.5v11l9-5.5-9-5.5Z"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    // exhibitor contact block — same set of concepts as the original site
    badge: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6.6" r="1.7" stroke="currentColor" stroke-width="1.3"/><path d="M5.2 11.4c.5-1.2 1.6-1.8 2.8-1.8s2.3.6 2.8 1.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    briefcase: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="5" width="12" height="8.5" rx="1.4" stroke="currentColor" stroke-width="1.3"/><path d="M6 5V3.6A1.1 1.1 0 0 1 7.1 2.5h1.8A1.1 1.1 0 0 1 10 3.6V5" stroke="currentColor" stroke-width="1.3"/></svg>',
    mail: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1.4" stroke="currentColor" stroke-width="1.3"/><path d="m2.6 5 5.4 3.9L13.4 5" stroke="currentColor" stroke-width="1.3"/></svg>',
    phone: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3.7c0-.6.5-1.2 1.2-1.2h1.3c.5 0 1 .4 1.1.9l.4 1.8c.1.4-.1.8-.4 1l-.9.7c.8 1.6 2 2.8 3.6 3.6l.7-.9c.2-.3.6-.5 1-.4l1.8.4c.5.1.9.6.9 1.1v1.3c0 .7-.6 1.2-1.2 1.2C7.2 13.2 3 9 3 3.7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    link: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6.7 9.3a2.6 2.6 0 0 0 3.9.3l1.8-1.8a2.6 2.6 0 0 0-3.7-3.7l-1 1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M9.3 6.7a2.6 2.6 0 0 0-3.9-.3L3.6 8.2a2.6 2.6 0 0 0 3.7 3.7l1-1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    pin: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 14s4.5-4.2 4.5-7.6A4.5 4.5 0 0 0 3.5 6.4C3.5 9.8 8 14 8 14Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="8" cy="6.4" r="1.6" stroke="currentColor" stroke-width="1.3"/></svg>',
    support: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 5.5v3M8 10.6v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    chat: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.5 8.5c0 2.5-2.5 4.5-5.5 4.5-.7 0-1.4-.1-2-.3L3 13.5l.8-2.4A4.3 4.3 0 0 1 2.5 8.5C2.5 6 5 4 8 4s5.5 2 5.5 4.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    office: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 13.5V4.2L8 2l5.5 2.2v9.3M6 13.5V9h4v4.5" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    facebook: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M9.5 15V8.7h2.1l.3-2.4H9.5V4.8c0-.7.2-1.2 1.2-1.2h1.3V1.4A17 17 0 0 0 10.1 1C8.3 1 7 2.1 7 4.5v1.8H5v2.4h2V15h2.5Z"/></svg>',
    instagram: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.4" y="2.4" width="11.2" height="11.2" rx="3.4" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2.6" stroke="currentColor" stroke-width="1.4"/><circle cx="11.3" cy="4.7" r=".9" fill="currentColor"/></svg>',
    x: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M11.9 1.9h2.2L9.3 7.4l5.7 7.5h-4.5L7 10.2l-4 4.7H.8l5.2-6L.5 1.9h4.6l3.1 4.2 3.7-4.2Zm-.8 11.6h1.2L4.9 3.2H3.6l7.5 10.3Z"/></svg>',
    globe: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5.7" stroke="currentColor" stroke-width="1.3"/><path d="M2.4 8h11.2M8 2.3c1.5 1.6 2.3 3.6 2.3 5.7S9.5 12.1 8 13.7C6.5 12.1 5.7 10.1 5.7 8S6.5 3.9 8 2.3Z" stroke="currentColor" stroke-width="1.3"/></svg>',
    searchGlass: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7.2" cy="7.2" r="4.2" stroke="currentColor" stroke-width="1.4"/><path d="m10.4 10.4 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    calendar: '<svg class="ico" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3.5" width="12" height="10" rx="1.4" stroke="currentColor" stroke-width="1.3"/><path d="M2 6.6h12M5.4 2.2v2.4M10.6 2.2v2.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>'
  };
  MBB.icons = ICONS;
  MBB.esc = esc;

  /**
   * The Login buttons only exist once there is somewhere for them to go.
   *
   * Until the platform address is known the field holds a placeholder, and a
   * button that leads nowhere is worse on a published site than no button at
   * all: it looks broken, and the visitor who needs the platform concludes the
   * event has none. So an empty value, or anything still pointing inside the
   * page, hides them; a real address shows them and opens in a new tab, since
   * the platform is a different site and nobody should lose the page to reach
   * it.
   */
  function loginHref(site, base) {
    var login = site.login || {};
    var url = (login.url || '').trim();
    if (!url || url.charAt(0) === '#') return null;

    // Hasta que la plataforma abre, el botón no lleva al formulario de acceso
    // sino a la página que explica cuándo. Mandar a alguien a un login que le
    // va a rechazar, sin decirle por qué, es peor que no tener botón.
    //
    // La fecha manda: llegado el día el cambio ocurre solo, sin que nadie
    // tenga que tocar nada a medianoche.
    if (login.opensAt && login.waiting && !MBB.platformOpen(site)) {
      return (base || '') + login.waiting;
    }
    return url;
  }

  /**
   * ¿Está abierta ya la plataforma?
   *
   * Se mira contra el reloj de quien visita, que puede estar mal. No pasa
   * nada: esto no guarda ninguna puerta —la de verdad la guarda Meetmaps—,
   * solo decide qué se le cuenta a la gente. Alguien con el reloj adelantado
   * llegará a un login que le dirá que no, que es exactamente lo que habría
   * pasado sin todo esto.
   */
  MBB.platformOpen = function (site) {
    var cuando = (site.login || {}).opensAt;
    if (!cuando) return true;
    var abre = new Date(cuando);
    return isNaN(abre.getTime()) || Date.now() >= abre.getTime();
  };

  /**
   * "28 September", sacado de la fecha para no escribirla dos veces.
   *
   * Y con la zona de Bilbao puesta a mano, que no es un detalle: las 00:01 del
   * 28 aquí son las 22:01 del 27 en Londres, así que sin fijarla la web le
   * anunciaría a media Europa un día que no es. La fecha que importa es la de
   * aquí, porque es cuando abre.
   */
  MBB.platformOpensOn = function (site) {
    var abre = new Date((site.login || {}).opensAt);
    if (isNaN(abre.getTime())) return '';
    return abre.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', timeZone: 'Europe/Madrid'
    });
  };

  /** "Monday, 28 September 2026" y "00:01", en hora de Bilbao. */
  MBB.platformOpensFull = function (site) {
    var abre = new Date((site.login || {}).opensAt);
    if (isNaN(abre.getTime())) return null;
    return {
      fecha: abre.toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        timeZone: 'Europe/Madrid'
      }),
      hora: abre.toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
      })
    };
  };

  /**
   * El aviso de platform.html CUANDO LA PLATAFORMA YA HA ABIERTO.
   *
   * El mensaje de espera —el que se lee hasta el día 28— no se dibuja aquí:
   * está escrito en el propio platform.html, como HTML corriente. Eso es a
   * posta. Esa página existe para decirle una cosa a quien pulsa "Login", y no
   * puede depender de que tres archivos de JavaScript lleguen y se ejecuten
   * para enseñar un párrafo: si algo fallaba, la persona se encontraba una
   * pantalla en blanco justo donde más falta hacía el mensaje.
   *
   * Lo que sí hace falta hacer con el script es lo de después: llegada la
   * fecha, esta página no puede seguir insistiendo en un día que ya pasó.
   * Alguien puede llegar meses más tarde desde un enlace guardado. Entonces
   * —y solo entonces— este texto sustituye al escrito.
   */
  MBB.PlatformGate = function (site) {
    var correo = (site.footer || {}).mail || '';

    return (
      '<div class="shell gate">' +
        '<p class="kicker">' + esc(site.event.name) + ' ' + esc(site.event.edition) + '</p>' +
        '<h1 class="h-1">The platform is open</h1>' +
        '<p class="lead measure">Sign in to reach your profile, your ' +
          'availability and your confirmed meeting agenda.</p>' +
        '<p class="gate__actions">' +
          '<a class="btn btn--lg" href="' + esc(site.login.url) + '" ' +
            'target="_blank" rel="noopener">' + esc(site.login.label) + '</a>' +
          '<a class="btn btn--lg btn--outline" href="./">Back to the site</a>' +
        '</p>' +
        (correo
          ? '<p class="gate__help">Questions about your registration? Write to ' +
            '<a class="link-red" href="mailto:' + esc(correo) + '">' + esc(correo) + '</a>.</p>'
          : '') +
      '</div>'
    );
  };

  function loginLink(site, classes, base) {
    var url = loginHref(site, base);
    if (!url) return '';
    // La página de aviso es nuestra: se abre en la misma pestaña. La
    // plataforma es otro sitio y se abre aparte, para no perder la página.
    var fuera = /^https?:/i.test(url);
    return '<a class="' + classes + '" href="' + esc(url) + '" data-login' +
      (fuera ? ' target="_blank" rel="noopener"' : '') + '>' +
      esc(site.login.label) + '</a>';
  }

  /**
   * El botón de alta, hermano del de Login.
   *
   * Vacía `site.register.url` y desaparece, igual que el de Login: es lo que
   * tiene que pasar el día que se cierren las inscripciones, en vez de dejar
   * un botón que lleva a un formulario cerrado.
   */
  function registerLink(site, classes, corto) {
    var reg = site.register || {};
    if (!reg.url) return '';
    // En la cabecera cabe una palabra, no una frase: ahí se usa `short`. En el
    // cuerpo de la página, donde hay sitio, se usa la frase entera, que dice
    // mejor lo que uno va a hacer.
    var texto = corto ? (reg.short || reg.label) : reg.label;
    return '<a class="' + classes + '" href="' + esc(reg.url) + '" data-register ' +
      'target="_blank" rel="noopener">' + esc(texto || 'Register') + '</a>';
  }

  MBB.loginHref = loginHref;

  /**
   * Turns the ordinary Issuu link of a document into its embeddable reader URL,
   * so the content team can paste the link straight from the browser bar:
   *   https://issuu.com/turismobilbao/docs/city_experience_en
   *   → https://e.issuu.com/embed.html?u=turismobilbao&d=city_experience_en
   * Already-embeddable URLs are returned untouched. Anything else (a profile
   * link, for instance) returns '' — a document is required, not a publisher.
   */
  MBB.issuuEmbed = function (url) {
    if (!url) return '';
    if (/(^|\.)issuu\.com\/embed/.test(url) || /e\.issuu\.com/.test(url)) return url;

    var m = /issuu\.com\/([^\/?#]+)\/docs\/([^\/?#]+)/.exec(url);
    if (!m) return '';
    return 'https://e.issuu.com/embed.html?u=' +
      encodeURIComponent(m[1]) + '&d=' + encodeURIComponent(m[2]);
  };

  /* --- Header ------------------------------------------------------------ */
  MBB.Header = function (site, opts) {
    opts = opts || {};
    var base = opts.base || '';          // '../' when rendered inside /exhibitors

    // Dónde viven las secciones del menú. En la portada están aquí mismo, así
    // que "#discover" basta. En cualquier otra página —la ficha de un
    // expositor, la de aviso de la plataforma— hay que nombrar la portada, o
    // el enlace solo cambia la dirección del navegador y no lleva a ninguna
    // parte: la pantalla se queda exactamente igual, sin decir por qué.
    var portada = opts.home != null ? opts.home : base;

    var links = site.nav
      .map(function (n) {
        var href = /^#/.test(n.href) ? portada + n.href : n.href;
        return '<li><a class="header__link" href="' + esc(href) + '">' + esc(n.label) + '</a></li>';
      })
      .join('');

    // En un móvil estrecho no caben a la vez el logotipo, el Login, el alta y
    // el botón del menú: algo se sale por el lado. Así que en pantalla pequeña
    // el Login baja al menú desplegable —donde tiene su sitio y una zona de
    // pulsación decente— y arriba se queda el alta, que es la acción que
    // buscamos de quien llega por primera vez. De 620px para arriba esta
    // entrada no se dibuja y el Login vuelve a la cabecera.
    // Estando ya en la página de aviso, un Login que lleva a la página de
    // aviso no hace nada: cambia la dirección y la pantalla se queda igual.
    // Ahí sobra, y el alta se queda sola. Abierta la plataforma el Login ya
    // lleva a Meetmaps, así que vuelve a la cabecera por su cuenta.
    var abierta = MBB.platformOpen(site);
    var conLogin = !(opts.aviso && !abierta);

    var loginEnMenu = conLogin ? loginLink(site, 'header__link', base) : '';
    if (loginEnMenu) links += '<li class="header__links-login">' + loginEnMenu + '</li>';

    return (
      '<div class="shell shell--wide header__inner">' +
        '<a class="header__brand" href="' + esc(portada + '#home') + '">' +
          '<img src="' + esc(base) + 'assets/img/brand/match-bilbao-bizkaia-wordmark.png" ' +
            'alt="Match Bilbao Bizkaia">' +
          '<span class="header__year">' + esc(site.event.edition) + '</span>' +
        '</a>' +
        '<nav class="header__nav" aria-label="Main"><ul class="header__links" id="nav-links">' +
          links +
        '</ul></nav>' +
        '<div class="header__actions">' +
          // DOS PUERTAS, Y LA QUE MANDA CAMBIA EL DÍA QUE ABRE LA PLATAFORMA.
          //
          // Hasta que abre, entrar no es posible: quien llega solo puede darse
          // de alta, así que el alta se lleva el rojo macizo y el Login se
          // queda como enlace. Si los dos fueran botones rojos, el visitante
          // nuevo tendría que leerlos para saber cuál es el suyo.
          //
          // Abierta la plataforma se cambian los papeles. La mayoría de quien
          // llega entonces ya tiene su perfil hecho y viene a entrar, no a
          // apuntarse: el Login pasa a rojo macizo y el alta se queda en
          // blanco con el borde rojo —sigue a la vista, para quien llegue
          // tarde, pero deja de ser lo primero que pide que lo pulsen.
          //
          // Es automático: lo decide la misma fecha que ya decide a dónde
          // lleva el Login, `login.opensAt` en site.js. No hay que acordarse
          // de venir a cambiarlo ese día.
          (conLogin
            ? loginLink(site, 'header__enter ' + (abierta ? 'btn btn--sm' : 'header__login'), base)
            : '') +
          registerLink(site, 'btn btn--sm' + (abierta ? ' btn--outline' : ''), true) +
          '<button class="burger" type="button" aria-label="Open menu" ' +
            'aria-expanded="false" aria-controls="nav-links">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  };

  /* --- Hero -------------------------------------------------------------- */
  /**
   * La portada.
   *
   * @param {object} site   window.MBB.site
   * @param {object} intro  window.MBB.eventIntro — de aquí salen los tres
   *                        bloques ("Structured B2B meetings", …). Vivían en
   *                        una sección aparte, debajo, que repetía casi palabra
   *                        por palabra lo que ya dice la entrada de la portada.
   *                        Se quitó la sección y los bloques subieron aquí, que
   *                        es donde sirven: los lee quien acaba de llegar,
   *                        antes de decidir si sigue bajando.
   */
  MBB.Hero = function (site, intro, opts) {
    opts = opts || {};
    var h = site.hero;

    var media = h.media && h.media.image
      ? '<img src="' + esc(h.media.image) + '" alt="" data-fallback="ph" ' +
        'data-label="[Insert hero image]">'
      : '<div class="ph">[Insert hero image]</div>';

    // LOS BOTONES DE LA PORTADA YA NO ESTÁN, y en su sitio está la banda roja.
    //
    // Eran "Explore the event" y "Meet BB's Experts": dos enlaces a secciones
    // de esta misma página, a las que también se llega por el menú. Ocupaban
    // el sitio con más valor de toda la web —justo debajo de la entrada, donde
    // mira todo el mundo— para ofrecer bajar un poco.
    //
    // Ahí está ahora lo único que de verdad hay que pedirle a quien llega:
    // darse de alta o entrar. Sigue habiendo datos por si alguien los quiere
    // de vuelta; simplemente no se dibujan.
    var ctas = h.ctas
      .map(function (c) {
        return '<a class="btn btn--lg' + (c.variant === 'ghost' ? ' btn--outline' : '') +
          '" href="' + esc(c.href) + '">' + esc(c.label) + '</a>';
      })
      .join('');

    var facts = h.facts
      .map(function (f) {
        // A figure written as 'count:exhibitors' is the size of the directory,
        // so it follows the companies that register instead of being a number
        // somebody has to remember to change.
        if (f.value === 'count:exhibitors') {
          var n = (MBB.exhibitors || []).length;
          // Before the first company registers the honest figure is zero, and
          // "0 Local exhibitors" under the title reads as a broken page rather
          // than as an event that has not opened registration yet. The fact
          // simply waits its turn.
          if (!n) return '';
          return '<div class="hero__fact"><span class="v">' + esc(String(n)) + '</span>' +
            '<span class="l">' + esc(f.label) + '</span></div>';
        }

        return '<div class="hero__fact"><span class="v">' + esc(f.value) + '</span>' +
          '<span class="l">' + esc(f.label) + '</span></div>';
      })
      .join('');

    // Los tres bloques, entre la entrada y las cifras. Van en <h2> y no en
    // <h3>: aquí encima solo está el <h1> de la portada, y saltar de h1 a h3
    // deja un hueco en el esquema por el que un lector de pantalla recorre la
    // página. El tamaño lo pone la hoja de estilos, así que se ven igual.
    var pilares = ((intro && intro.highlights) || [])
      .map(function (p) {
        return '<div class="pillar"><h2>' + esc(p.title) + '</h2><p>' +
          esc(p.text) + '</p></div>';
      })
      .join('');

    return (
      '<div class="shell">' +
        '<div class="hero__inner">' +
          '<div data-reveal>' +
            '<p class="hero__dates">' + esc(h.kicker) + '</p>' +
            '<h1 class="h-hero hero__title">' + esc(h.title) +
              ' <span class="yr">' + esc(h.titleYear) + '</span></h1>' +
            '<p class="hero__subtitle">' + esc(h.subtitle) + '</p>' +
            '<p class="hero__lead lead">' + esc(h.lead) + '</p>' +
            (ctas ? '<div class="hero__ctas">' + ctas + '</div>' : '') +
            (opts.banda || '') +
          '</div>' +
          '<div class="hero__media" data-reveal style="--d:100ms">' + media + '</div>' +
        '</div>' +
        (pilares ? '<div class="pillars" data-reveal>' + pilares + '</div>' : '') +
        // AQUÍ ESTABAN LAS CIFRAS —2 expositores, 4 días, 1:1— y luego la banda
        // roja. Las cifras siguen en site.js sin dibujarse, y la banda ha
        // subido al hueco que dejaron los dos botones, arriba.
        //
        // Lo que cierra la portada ahora es CÓMO FUNCIONA: los cuatro pasos,
        // de crear el perfil a reunirse. Estaban al final de "Meet BB's
        // Experts", después del directorio, donde casi nadie llegaba. Aquí
        // responden la segunda pregunta de quien acaba de leer la primera.
        (facts ? '<div class="hero__facts" data-reveal>' + facts + '</div>' : '') +
        (opts.pasos || '') +
      '</div>'
    );
  };

  /* --- AQUÍ HABÍA UNA SECCIÓN, Y SE QUITÓ --------------------------------
   *
   * Se llamaba "Match Bilbao Bizkaia 2026" y llevaba un titular, un párrafo de
   * entrada, el botón de añadir al calendario y los tres bloques destacados.
   *
   * El párrafo decía casi lo mismo que la entrada de la portada, tres pantallas
   * más arriba, y el titular repetía el nombre del evento que ya está en el
   * logotipo, en la portada y en la pestaña del navegador. Quien bajaba se
   * encontraba leyendo dos veces lo mismo y concluía que se había perdido.
   *
   * No se tiró nada de lo que servía, se repartió:
   *   · los tres bloques → MBB.Hero, entre la entrada y las cifras;
   *   · el botón de añadir al calendario → MBB.Programme, en su barra.
   *
   * El texto sigue en data/content.js, sin dibujarse. No estorba y es lo que
   * hay que recuperar si algún día se quiere volver atrás.
   */


  /* --- "Add to calendar": one date, four destinations --------------------- */
  /**
   * Cada programa de calendario tiene su propia manera de recibir una cita, y
   * no hay ninguna que valga para todos. Así que se ofrecen las cuatro que
   * cubren a casi todo el mundo y el visitante elige la suya, en vez de
   * mandarles a todos a Google como hasta ahora.
   *
   * Los tres primeros son direcciones web: se abre el calendario del visitante
   * con la cita ya rellenada y solo tiene que darle a guardar. El cuarto es un
   * archivo .ics, que es el formato que entienden Apple Calendar, Thunderbird,
   * Outlook de escritorio y prácticamente cualquier otro.
   *
   * @param {object} cal  site.event.calendar
   */
  MBB.calendarLinks = function (cal) {
    // 2026-10-06T09:00:00+02:00 → 20261006T070000Z, que es lo que piden Google
    // y el formato .ics. Se pasa por Date, así que el desfase se aplica solo.
    function utc(iso) {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }

    var desde = utc(cal.start);
    var hasta = utc(cal.end);
    if (!desde || !hasta) return [];

    var q = encodeURIComponent;

    return [
      {
        label: 'Google Calendar',
        href:
          'https://calendar.google.com/calendar/render?action=TEMPLATE' +
          '&text=' + q(cal.title) +
          '&dates=' + desde + '/' + hasta +
          '&details=' + q(cal.details) +
          '&location=' + q(cal.location)
      },
      {
        label: 'Outlook',
        href:
          'https://outlook.live.com/calendar/0/deeplink/compose' +
          '?path=/calendar/action/compose&rru=addevent' +
          '&subject=' + q(cal.title) +
          '&body=' + q(cal.details) +
          '&location=' + q(cal.location) +
          '&startdt=' + q(cal.start) +
          '&enddt=' + q(cal.end)
      },
      {
        label: 'Office 365',
        href:
          'https://outlook.office.com/calendar/0/deeplink/compose' +
          '?path=/calendar/action/compose&rru=addevent' +
          '&subject=' + q(cal.title) +
          '&body=' + q(cal.details) +
          '&location=' + q(cal.location) +
          '&startdt=' + q(cal.start) +
          '&enddt=' + q(cal.end)
      },
      {
        // Un archivo, no un enlace. Y se escribe en el momento, desde estos
        // mismos datos: si fuera un archivo guardado, el día que alguien
        // cambiara una hora desde el panel los tres de arriba dirían una cosa
        // y este otra, y nadie se enteraría hasta que alguien llegase tarde.
        label: 'Apple Calendar',
        archivo: true,
        note: 'Also for Thunderbird and desktop Outlook'
      }
    ];
  };

  /**
   * La cita entera en formato iCalendar, que es lo que entienden Apple
   * Calendar, Thunderbird y el Outlook de escritorio.
   *
   * @param {object} cal  site.event.calendar
   */
  MBB.eventIcs = function (cal) {
    function esc2(s) {
      return String(s == null ? '' : s)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
    }

    function utc(iso) {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }

    var desde = utc(cal.start);
    if (!desde) return '';

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Match Bilbao Bizkaia//Event//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      // Identificador fijo: descargarlo dos veces actualiza la cita que ya se
      // tenía en vez de dejar dos iguales en el calendario.
      'UID:match-bilbao-bizkaia-' + desde + '@matchbilbaobizkaia.eus',
      'DTSTAMP:' + utc(new Date().toISOString()),
      'DTSTART:' + desde,
      'DTEND:' + utc(cal.end),
      'SUMMARY:' + esc2(cal.title),
      'DESCRIPTION:' + esc2(cal.details),
      'LOCATION:' + esc2(cal.location),
      'END:VEVENT',
      'END:VCALENDAR'
      // Las líneas de un .ics acaban en CRLF, no en salto de línea a secas.
    ].join('\r\n') + '\r\n';
  };

  /**
   * El botón con su menú. Es un <details>: se abre y se cierra sin una línea de
   * JavaScript, se maneja con el teclado desde el primer día y sigue
   * funcionando aunque el navegador no ejecute scripts.
   *
   * @param {object} cal   site.event.calendar
   * @param {object} opts  { base: prefijo para el archivo .ics }
   */
  /**
   * @param {object} cal    site.event.calendar
   * @param {string} extra  `<li>`s que se añaden debajo, separados y con su
   *                        propio encabezado. Es como el programa entero entra
   *                        en este mismo menú en vez de tener un botón aparte:
   *                        dos botones de calendario, uno al lado del otro y
   *                        casi iguales, obligaban a leerlos los dos para
   *                        averiguar en qué se diferencian.
   */
  MBB.CalendarButton = function (cal, extra) {
    var opciones = MBB.calendarLinks(cal);
    if (!opciones.length) return '';

    var items = opciones
      .map(function (o) {
        // El que descarga es un botón, no un enlace: no lleva a ninguna parte,
        // hace algo. Y así el lector de pantalla lo anuncia por lo que es.
        var dentro =
          '<span>' + esc(o.label) + '</span>' +
          (o.note ? '<small>' + esc(o.note) + '</small>' : '');

        return o.archivo
          ? '<li><button type="button" data-ics-event>' + dentro + '</button></li>'
          : '<li><a href="' + esc(o.href) + '" target="_blank" rel="noopener">' +
              dentro + '</a></li>';
      })
      .join('');

    // Con un solo grupo los encabezados sobran: cuatro destinos y nada más que
    // elegir. En cuanto hay dos cosas distintas —las fechas y el programa
    // entero— hay que decir cuál es cuál, o "Apple Calendar" y "The full
    // programme" parecen dos opciones de lo mismo.
    var lista = extra
      ? '<li class="cal__group">The dates of the event</li>' + items +
        '<li class="cal__group cal__group--sep">The whole programme</li>' + extra
      : items;

    return (
      '<details class="cal">' +
        '<summary class="btn">' + ICONS.calendar + 'Add to calendar</summary>' +
        '<ul class="cal__menu">' + lista + '</ul>' +
      '</details>'
    );
  };


  /* --- Calendar export ---------------------------------------------------- */
  /**
   * Builds an iCalendar file from the programme, so a participant can put the
   * whole week — or one day of it — into whatever calendar they use. A file
   * rather than a link to one particular calendar service: this works with
   * Google, Outlook, Apple and everything else that reads .ics.
   *
   * Times are written in local Bilbao time with a TZID, and the VTIMEZONE
   * below tells the reader what that means, so the events land at the right
   * hour whatever timezone the reader is in. A slot with no fixed time
   * (arrivals, departures) becomes an all-day entry, because that is what is
   * actually known about it.
   *
   * @param {object} programme  window.MBB.programme
   * @param {object} opts       { day: id|'all', group: 'g1'|'g2' }
   */
  MBB.ics = function (programme, opts) {
    opts = opts || {};
    var wantDay = opts.day && opts.day !== 'all' ? opts.day : null;
    var group = opts.group || (programme.groups && programme.groups[0] && programme.groups[0].id);

    function esc2(s) {
      return String(s == null ? '' : s)
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\r?\n/g, '\\n');
    }

    // iCalendar lines are limited to 75 octets; longer ones continue on the
    // next line, marked by a leading space.
    function fold(line) {
      if (line.length <= 73) return line;
      var out = line.slice(0, 73);
      var rest = line.slice(73);
      while (rest.length) {
        out += '\r\n ' + rest.slice(0, 72);
        rest = rest.slice(72);
      }
      return out;
    }

    function stamp() {
      return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    }

    function plusMinutes(hhmm, mins) {
      var p = hhmm.split(':');
      var t = parseInt(p[0], 10) * 60 + parseInt(p[1], 10) + mins;
      t = Math.min(t, 23 * 60 + 59);
      return ('0' + Math.floor(t / 60)).slice(-2) + ('0' + (t % 60)).slice(-2);
    }

    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Match Bilbao Bizkaia//Programme 2026//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Match Bilbao Bizkaia 2026',
      'X-WR-TIMEZONE:' + programme.timezone,
      // Central European Time, with the rule that moves it to summer time, so
      // the file stays correct if the event ever moves across the change.
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Madrid',
      'BEGIN:DAYLIGHT',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'TZNAME:CEST',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
      'END:DAYLIGHT',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'TZNAME:CET',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
      'END:STANDARD',
      'END:VTIMEZONE'
    ];

    var now = stamp();

    programme.days.forEach(function (d) {
      if (wantDay && d.id !== wantDay) return;

      var date = d.dateISO.replace(/-/g, '');
      // On a day that splits, only the chosen itinerary is exported: two
      // parallel routes in one calendar would be unreadable.
      var slots = d.slots.filter(function (s) { return !s.group || s.group === group; });

      slots.forEach(function (s, i) {
        var uid = 'mbb2026-' + d.id + '-' + i + '@matchbilbaobizkaia.eus';
        var desc = [s.text || '', s.venue ? 'Venue: ' + s.venue : ''].filter(Boolean).join('\n');

        lines.push('BEGIN:VEVENT');
        lines.push('UID:' + uid);
        lines.push('DTSTAMP:' + now);

        if (s.open) {
          // No fixed time yet: an all-day entry says that honestly.
          var next = new Date(d.dateISO + 'T00:00:00Z');
          next.setUTCDate(next.getUTCDate() + 1);
          lines.push('DTSTART;VALUE=DATE:' + date);
          lines.push('DTEND;VALUE=DATE:' + next.toISOString().slice(0, 10).replace(/-/g, ''));
        } else {
          var endTime = s.end;
          if (!endTime) {
            var following = slots[i + 1];
            endTime = following && following.time ? following.time : plusMinutes(s.time, 60);
          }
          lines.push('DTSTART;TZID=Europe/Madrid:' + date + 'T' + s.time.replace(':', '') + '00');
          lines.push('DTEND;TZID=Europe/Madrid:' + date + 'T' + endTime.replace(':', '') + '00');
        }

        lines.push(fold('SUMMARY:' + esc2(s.title)));
        if (desc) lines.push(fold('DESCRIPTION:' + esc2(desc)));
        if (s.venue) lines.push(fold('LOCATION:' + esc2(s.venue)));
        lines.push('END:VEVENT');
      });
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  };

  /**
   * The programme, in two views over the same data.
   *
   * "Detailed" keeps the day-by-day timeline; "Overview" puts the five days
   * side by side so the shape of the week can be taken in at a glance — which
   * is what a buyer deciding whether to come actually wants first.
   *
   * Wednesday splits into two itineraries. Rather than give the groups a view
   * of their own, the split lives inside that day, because it is a property of
   * the day and not a way of reading the programme.
   */
  /**
   * @param {object} programme  window.MBB.programme
   * @param {object} site       window.MBB.site — solo para la fecha del evento
   *                            que necesita el botón de añadir al calendario.
   */
  MBB.Programme = function (programme, site) {
    var days = programme.days;

    /* --- shared pieces -------------------------------------------------- */

    // The part of the day a slot belongs to. Grouping by it gives a fifteen-slot
    // day three anchors, which is what makes it readable without colour.
    function bandOf(s) {
      if (s.open || !s.time) return 'open';
      var hour = parseInt(s.time.slice(0, 2), 10);
      return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    }

    var BAND_LABEL = {
      open: 'Times follow your flight',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening'
    };

    function slotItem(s) {
      // A line with nothing but a time and a title is a transfer or a meeting
      // point; it does not need the room a described session needs.
      var brief = !s.text && !s.venue;

      // The end time is what separates a four-hour workshop from a fifteen
      // minute transfer, so it is shown wherever it is known.
      var time = s.open
        ? ''
        : esc(s.time) + (s.end ? '<span class="tl-item__to">' + esc(s.end) + '</span>' : '');

      return (
        '<li class="tl-item' + (s.feature ? ' tl-item--feature' : '') +
          (brief ? ' tl-item--brief' : '') + '">' +
          '<span class="tl-item__time">' + time + '</span>' +
          '<div class="tl-item__body">' +
            // h3 y no h4: el titular de la sección es «Event Programme», un h2,
            // y entre medias no hay ningún h3. Saltar de h2 a h4 rompe el
            // esquema con el que un lector de pantalla recorre la página, y
            // además contradecía lo que la declaración de accesibilidad afirma.
            '<h3>' + esc(s.title) + '</h3>' +
            (s.text ? '<p>' + esc(s.text) + '</p>' : '') +
            (s.venue ? '<span class="tl-item__venue">' + esc(s.venue) + '</span>' : '') +
          '</div>' +
        '</li>'
      );
    }

    /**
     * One day's slots, cut into parts of the day. Each part is a list of its
     * own, so the rail that runs down the times breaks where the day does.
     */
    function timeline(slots, group) {
      var order = ['open', 'morning', 'afternoon', 'evening'];
      var bands = {};
      slots.forEach(function (s) {
        var b = bandOf(s);
        (bands[b] = bands[b] || []).push(s);
      });

      var html = order
        .filter(function (b) { return bands[b]; })
        .map(function (b) {
          return (
            '<section class="tl-band">' +
              '<p class="tl-band__label">' + esc(BAND_LABEL[b]) + '</p>' +
              '<ol class="timeline">' + bands[b].map(slotItem).join('') + '</ol>' +
            '</section>'
          );
        })
        .join('');

      return (
        '<div class="tl"' + (group ? ' data-group="' + esc(group) + '"' : '') + '>' +
          html +
        '</div>'
      );
    }

    /* --- detailed view --------------------------------------------------- */

    var tabs = days
      .map(function (d, i) {
        return (
          '<button class="prog__tab" type="button" role="tab" id="tab-' + esc(d.id) + '" ' +
            'aria-controls="panel-' + esc(d.id) + '" aria-selected="' + (i === 0 ? 'true' : 'false') +
            '" tabindex="' + (i === 0 ? '0' : '-1') + '">' +
            esc(d.date) + '<span class="d">' + esc(d.label) + '</span>' +
          '</button>'
        );
      })
      .join('');

    var panels = days
      .map(function (d, i) {
        var groupBar = '';
        if (d.split) {
          groupBar =
            '<div class="prog__groups" role="group" aria-label="Itinerary">' +
              programme.groups
                .map(function (g, gi) {
                  return (
                    '<button class="prog__group" type="button" data-group="' + esc(g.id) + '" ' +
                      'aria-pressed="' + (gi === 0 ? 'true' : 'false') + '">' + esc(g.label) + '</button>'
                  );
                })
                .join('') +
              '<span class="prog__groups__note">Two itineraries run in parallel on this day.</span>' +
            '</div>';
        }

        return (
          '<div class="prog__panel" role="tabpanel" id="panel-' + esc(d.id) + '" ' +
            'aria-labelledby="tab-' + esc(d.id) + '"' + (i === 0 ? '' : ' hidden') +
            (d.split ? ' data-split="true"' : '') + '>' +
            '<p class="prog__theme">' + esc(d.theme) + '</p>' +
            groupBar +
            // A split day gets one timeline per itinerary rather than one list
            // with rows hidden inside it: the parts of the day have to be
            // worked out over the slots actually on screen.
            (d.split
              ? programme.groups
                  .map(function (g) {
                    return timeline(
                      d.slots.filter(function (s) { return s.group === g.id; }),
                      g.id
                    );
                  })
                  .join('')
              : timeline(d.slots)) +
            '<p class="prog__day-cal">' +
              '<button class="btn btn--outline btn--sm" type="button" data-ics="' + esc(d.id) + '">' +
                ICONS.calendar + 'Add ' + esc(d.label.toLowerCase()) + ' to my calendar' +
              '</button>' +
            '</p>' +
          '</div>'
        );
      })
      .join('');

    /* --- overview view --------------------------------------------------- */

    /**
     * Adónde va cada grupo, en un día que se parte en dos.
     *
     * El rótulo ("Group 1") no está escrito en el texto de la ruta: se busca
     * en `programme.groups`, que es lo mismo que rotula el selector de la
     * vista detallada. Así, el día que alguien renombre los grupos —"Route A"
     * y "Route B", pongamos— cambian los dos sitios a la vez y no queda una
     * tarjeta hablando de un grupo que ya no se llama así.
     */
    function rutas(d) {
      var lineas = (d.routes || [])
        .map(function (r) {
          var g = (programme.groups || []).filter(function (x) {
            return x.id === r.group;
          })[0];
          return '<li><b>' + esc((g ? g.label : r.group) + ':') + '</b> ' +
            esc(r.text) + '</li>';
        })
        .join('');

      return lineas ? '<ul class="ov-day__routes">' + lineas + '</ul>' : '';
    }

    // Three moments per day: the ones marked as the highlights of that day,
    // falling back to the first slots when a day has none.
    var overview = days
      .map(function (d) {
        // Start from the moments marked as the highlights of the day, then top
        // up with the earliest slots that have a time — a day whose highlight
        // is the evening should not be summarised by its transfers.
        //
        // UN MOMENTO PUEDE PEDIR NO SALIR AQUÍ, con `card: false`. Y cuando lo
        // pide, la tarjeta se queda con una línea MENOS: no entra otra en su
        // lugar. Si entrara, quitar algo de la tarjeta sería imposible —se
        // cambiaría una línea por otra— y además subiría al resumen del día
        // cosas que no resumen nada, como la hora de recoger a los guías.
        // El momento sigue en el programa hora a hora y en el calendario:
        // `card: false` habla de la tarjeta, no del día.
        var fuera = d.slots.filter(function (s) { return s.card === false; });
        var tope = Math.max(1, 3 - fuera.filter(function (s) { return s.feature; }).length);

        var visible = function (s) { return s.card !== false; };
        var chosen = [];
        d.slots.forEach(function (s, i) { if (s.feature && visible(s)) chosen.push(i); });
        d.slots.forEach(function (s, i) {
          if (chosen.length < tope && !s.feature && !s.open && visible(s)) chosen.push(i);
        });
        if (!chosen.length) {
          d.slots.forEach(function (s, i) { if (visible(s)) chosen.push(i); });
        }

        var seen = {};
        var lines = chosen
          .sort(function (a, b) { return a - b; })
          .slice(0, tope)
          .map(function (i) { return d.slots[i]; })
          .filter(function (s) {
            if (seen[s.title]) return false;
            seen[s.title] = true;
            return true;
          })
          .map(function (s) {
            return (
              '<li>' +
                (s.open ? '' : '<span class="ov__t">' + esc(s.time) + '</span>') +
                esc(s.title) +
              '</li>'
            );
          })
          .join('');

        // Una tarjeta por día. Antes era una fila de ancho completo por día, y
        // los cinco días ocupaban pantalla y media de una web donde el
        // programa es lo que la gente viene a mirar: había que bajar para
        // enterarse de cuántos días eran. En tarjetas se ven los cinco de una
        // vez y se comparan sin leer, que es lo que se hace con un programa.
        return (
          '<li class="ov-day">' +
            '<p class="ov-day__n">' + esc(d.label) + '</p>' +
            '<p class="ov-day__date">' + esc(d.date) + '</p>' +
            '<h3 class="ov-day__theme">' + esc(d.theme) + '</h3>' +
            (d.split ? '<p class="ov-day__split">Two itineraries</p>' : '') +
            '<p class="ov-day__text">' + esc(d.summary) + '</p>' +
            rutas(d) +
            '<ul class="ov-day__list">' + lines + '</ul>' +
          '</li>'
        );
      })
      .join('');

    /* --- the card -------------------------------------------------------- */
    // The programme sits in a raised card, joined to the section above it, so
    // it reads as the centre of gravity of the page and not as one more block.
    return (
      '<div class="prog-card" data-reveal>' +
        '<h2 class="h-prog">Event Programme</h2>' +

        '<div class="prog__bar">' +
          '<div class="prog__views" role="group" aria-label="Programme view">' +
            '<button class="prog__view" type="button" data-view="overview" aria-pressed="true">Overview</button>' +
            '<button class="prog__view" type="button" data-view="detail" aria-pressed="false">Day by day</button>' +
          '</div>' +
          // UN SOLO BOTÓN DE CALENDARIO, CON LAS DOS COSAS DENTRO.
          //
          // Aquí hubo un momento dos botones, y era un error: "Add to
          // calendar" y "Add the full programme", uno al lado del otro, casi
          // del mismo tamaño y con el mismo icono. Para saber en qué se
          // diferencian había que leerlos los dos y pensarlo, que es justo lo
          // que un botón no debería pedir.
          //
          // Y se diferencian de verdad: uno guarda LAS FECHAS —una sola cita,
          // para quien todavía está decidiendo si viene— y el otro EL PROGRAMA
          // ENTERO, una cita por cada sesión de cada día. Así que se juntan en
          // el desplegable, que es donde una diferencia se puede explicar en
          // una línea en vez de en la cara de un botón.
          (site
            ? MBB.CalendarButton(
                site.event.calendar,
                '<li><button type="button" data-ics="all">' +
                  '<span>Every session, as a file</span>' +
                  '<small>The four days, hour by hour</small>' +
                '</button></li>'
              )
            : '') +
        '</div>' +

        '<div class="prog__pane" data-pane="detail" hidden>' +
          '<div class="prog__tabs" role="tablist" aria-label="Programme days">' + tabs + '</div>' +
          panels +
        '</div>' +

        '<div class="prog__pane" data-pane="overview">' +
          '<ol class="prog__overview">' + overview + '</ol>' +
        '</div>' +

        // La nota al pie sale solo si hay nota. Estuvo puesta y se quitó por
        // larga: tres frases de letra pequeña debajo del programa, que casi
        // nadie leía y que alargaban la sección. Lo que decía —que las horas
        // son las de aquí y que el programa definitivo se confirma por
        // correo— sigue diciéndose donde toca: en el correo mismo.
        //
        // El campo sigue existiendo en data/programme.js y en el panel: se
        // escribe algo ahí y vuelve a salir. Por eso esto es una condición y
        // no una línea borrada.
        (programme.note ? '<p class="prog__note">' + esc(programme.note) + '</p>' : '') +
      '</div>'
    );
  };

  /* --- Presentation of Bilbao -------------------------------------------- */
  MBB.Presentation = function (p) {
    // `fuerte` y no `esc`: estos párrafos llevan negritas escritas con dos
    // asteriscos. Van justificados por la clase `text-justify` de abajo.
    var paras = p.paragraphs.map(function (t) { return '<p>' + fuerte(t) + '</p>'; }).join('');

    var media = p.media
      .map(function (m) {
        var isPh = /^\[/.test(m.caption);
        if (isPh) return '<figure><div class="ph">' + esc(m.caption) + '</div></figure>';
        return (
          '<figure>' +
            '<img src="' + esc(m.file) + '" alt="' + esc(m.caption) + '" loading="lazy">' +
            '<figcaption class="present__cap">' + esc(m.caption) + '</figcaption>' +
          '</figure>'
        );
      })
      .join('');

    return (
      '<div class="present">' +
        '<div data-reveal>' +
          '<h2 class="h-1">' + esc(p.title) + '</h2>' +
          '<div class="text-justify">' + paras + '</div>' +
        '</div>' +
        '<div class="present__media" data-reveal style="--d:100ms">' + media + '</div>' +
      '</div>'
    );
  };

  /* --- Latest editions --------------------------------------------------- */
  MBB.Editions = function (editions) {
    var cards = editions
      .map(function (v, i) {
        var frame;
        if (v.youtubeId) {
          var yt = encodeURIComponent(v.youtubeId);
          // maxresdefault only exists for HD uploads; hqdefault always does.
          var thumb = v.thumbnail || 'https://i.ytimg.com/vi/' + yt + '/maxresdefault.jpg';
          frame =
            '<img src="' + esc(thumb) + '" alt="" loading="lazy" data-fallback="src" ' +
              'data-src-alt="https://i.ytimg.com/vi/' + esc(yt) + '/hqdefault.jpg">' +
            '<button class="video__play" type="button" data-yt="' + esc(v.youtubeId) + '" ' +
              'aria-label="Play: ' + esc(v.title) + '">' + ICONS.play + '</button>';
        } else {
          frame =
            '<button class="video__play" type="button" disabled ' +
              'aria-label="Video not available yet">' + ICONS.play + '</button>' +
            '<span class="video__ph">[Insert YouTube video ' + (i + 1) + ']</span>';
        }

        return (
          '<article data-reveal style="--d:' + i * 90 + 'ms">' +
            '<div class="video__frame">' + frame + '</div>' +
            '<div class="video__meta"><h3>' + esc(v.title) + '</h3>' +
              '<p>' + esc(v.caption) + '</p></div>' +
          '</article>'
        );
      })
      .join('');

    // El titular es un <h2> desde que esto es una sección suya y no un
    // apartado de la presentación del destino. Mientras colgaba de ella iba un
    // escalón por debajo, que es lo que hay que hacer cuando algo está dentro
    // de otra cosa; ahora ya no lo está.
    return (
      '<div class="section-head section-head--center videos__head" data-reveal>' +
        '<h2 class="h-2">Latest editions</h2>' +
        '<p>A look back at how the event brings the destination and the ' +
        'international travel trade together.</p>' +
      '</div>' +
      '<div class="videos">' + cards + '</div>' +
      // Dos carátulas grandes llenan la pantalla, y quien llega aquí no tiene
      // por qué saber que debajo está el destino.
      MBB.ScrollCue('#presentation', 'Discover Bilbao Bizkaia')
    );
  };

  /**
   * UN PIE QUE DICE QUE HAY MÁS ABAJO.
   *
   * Existe por un problema que solo se ve midiendo dónde acaba la pantalla.
   * Al pulsar "Meet BB's Experts" se aterriza en el titular, el párrafo y la
   * banda roja de Login: la pantalla se llena, parece que la sección es eso, y
   * el directorio de expositores —que es a lo que viene mucha gente— queda por
   * debajo del borde sin nada que avise de que está ahí. Lo mismo con los
   * vídeos: dos carátulas grandes llenan la pantalla y el destino se queda
   * detrás.
   *
   * Es un enlace de verdad, no un adorno: se pulsa y baja. Y lleva flecha
   * porque el texto solo no se lee como algo que se pueda pulsar.
   *
   * @param {string} destino  '#exhibitors'
   * @param {string} texto    lo que se lee
   */
  MBB.ScrollCue = function (destino, texto) {
    if (!destino || !texto) return '';
    return (
      '<p class="cue" data-reveal>' +
        '<a class="cue__link" href="' + esc(destino) + '">' +
          '<span>' + esc(texto) + '</span>' +
          '<span class="cue__arrow" aria-hidden="true"></span>' +
        '</a>' +
      '</p>'
    );
  };

  /* --- Meet BB's Experts -------------------------------------------------- */
  MBB.Experts = function (e, site, opts) {
    opts = opts || {};

    // ORDEN DE LA SECCIÓN. Las dos puertas —darse de alta y entrar— van
    // ARRIBA, pegadas al titular.
    //
    // Antes iban al final, después de un párrafo largo y de los cuatro pasos.
    // Quien pulsaba "Meet BB's Experts" en el menú aterrizaba en una pared de
    // texto: lo que venía a hacer estaba fuera de la pantalla, y los
    // expositores, más abajo todavía. Ahora lo primero que ve es a dónde ir, y
    // justo debajo asoma el resto.
    //
    // La banda desaparece entera si no hay a dónde ir: un panel titulado
    // "Already registered?" sin sitio donde entrar se lee como una página rota.
    return (
      '<div class="section-head section-head--center" data-reveal>' +
        '<h2 class="h-1">' + esc(e.title) + '</h2>' +
        '<p class="lead">' + esc(e.lead) + '</p>' +
      '</div>' +
      // Y debajo del titular, los expositores. Sin nada en medio.
      //
      // Aquí estaba la banda roja de alta y Login, y se ha subido a la
      // portada: llenaba la pantalla entera y dejaba el directorio —que es a
      // lo que viene mucha gente— por debajo del borde, con un pie que
      // avisaba de que estaba ahí. Quitada la banda, el aviso sobra: el
      // directorio empieza donde acaba el titular.
      //
      // El directorio ya no trae su propio titular. Tenía uno, "Exhibitors",
      // justo debajo de "Meet BB's Experts": dos titulares seguidos, del mismo
      // tamaño, para una sola cosa. El texto que llevaba debajo es ahora la
      // entrada de la sección. El directorio lo arma main.js, que es quien
      // tiene los datos; esta función solo decide en qué orden va todo.
      // Y nada más. El párrafo explicativo y los cuatro pasos estaban aquí
      // debajo, detrás del directorio, y han subido a la portada: cuentan cómo
      // funciona esto, que es la segunda pregunta de quien acaba de llegar, no
      // la última de quien ya ha recorrido la lista de empresas.
      (opts.directorio || '')
    );
  };

  /**
   * CÓMO FUNCIONA: el párrafo y los cuatro pasos.
   *
   * Vivía dentro de "Meet BB's Experts" y ahora cierra la portada, así que se
   * dibuja aparte y lo coloca quien lo pide. El titular es <h2> porque en la
   * portada cuelga del <h1> de la página; dentro de una sección colgaría de su
   * <h2> y tendría que ser <h3>.
   */
  MBB.HowItWorks = function (e) {
    var steps = e.steps
      .map(function (s) {
        return (
          '<div class="step">' +
            '<span class="step__n">' + esc(s.n) + '</span>' +
            '<h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p>' +
          '</div>'
        );
      })
      .join('');

    return (
      '<div class="section-head section-head--center steps__head" data-reveal>' +
        '<h2 class="h-2">' + esc(e.howTitle || 'How it works') + '</h2>' +
        '<p>' + esc(e.body) + '</p>' +
      '</div>' +
      '<div class="steps" data-reveal>' + steps + '</div>'
    );
  };

  /**
   * La banda roja: crear perfil a la izquierda, entrar a la derecha.
   *
   * @param {object} site  window.MBB.site
   * @param {object} e     window.MBB.experts
   * @param {object} opts  { base } cuando se dibuja fuera de la portada
   */
  /**
   * @param {object} opts  { base, slim }
   *
   * `slim` es la versión de la portada. La banda vive ahora ahí, debajo de los
   * tres bloques, en el sitio donde estaban las cifras. Y en la portada no
   * caben los dos párrafos explicativos: entre la entrada, los bloques y esto,
   * la primera pantalla se pasaba de largo y había que bajar para ver el botón
   * —justo lo contrario de para lo que está ahí—.
   *
   * Así que la versión de la portada se queda con lo que hace falta para
   * decidir: qué eres —nuevo o de vuelta— y el botón. Lo que explican los
   * párrafos lo cuenta la propia plataforma en cuanto se entra, y no hace
   * falta leerlo antes para saber cuál de los dos botones es el tuyo.
   *
   * El aviso de la fecha SÍ se queda: enterarse de que la plataforma no ha
   * abierto después de pulsar es enterarse tarde.
   */
  MBB.LoginBand = function (site, e, opts) {
    opts = opts || {};
    var base = opts.base || '';
    var slim = !!opts.slim;
    var reg = site.register || {};
    var abierta = MBB.platformOpen(site);

    // Mientras no esté abierta se dice la fecha, y se dice en el botón mismo:
    // enterarse después de pulsar es enterarse tarde.
    // En la portada el aviso va en la misma fila que el botón, así que se dice
    // en tres palabras: al lado de un botón que pone "Login", debajo de
    // "Already registered?", no hace falta explicar de qué abre.
    var aviso = abierta
      ? ''
      : '<p class="login-band__note">' +
          (slim ? 'Opens on ' : 'Access to the platform opens on ') +
          esc(MBB.platformOpensOn(site)) + '.</p>';

    // En la portada los titulares de la banda cuelgan del <h1> de la página, y
    // ahí un <h3> dejaría un hueco en el esquema de títulos. Dentro de "Meet
    // BB's Experts" cuelgan del <h2> de la sección, y ahí <h3> es lo que toca.
    var t = slim ? 'h2' : 'h3';
    var titular = function (texto) {
      return '<' + t + '>' + esc(texto) + '</' + t + '>';
    };
    var boton = slim ? 'btn btn--light' : 'btn btn--lg btn--light';

    var alta = reg.url
      ? '<div class="login-band__half">' +
          titular(e.registerPanel.title) +
          (slim ? '' : '<p>' + esc(e.registerPanel.text) + '</p>') +
          '<a class="' + boton + '" href="' + esc(reg.url) + '" ' +
            'target="_blank" rel="noopener">' + esc(reg.label) + '</a>' +
        '</div>'
      : '';

    var entrar =
      '<div class="login-band__half">' +
        titular(e.loginPanel.title) +
        (slim ? '' : '<p>' + esc(e.loginPanel.text) + '</p>') +
        aviso +
        loginLink(site, boton, base) +
        (slim ? '' : '<small>' + esc(e.loginPanel.help) + '</small>') +
      '</div>';

    return '<div class="login-band' + (slim ? ' login-band--slim' : '') +
      '" data-reveal>' + alta + entrar + '</div>';
  };

  /* --- Exhibitors: filters + full-bleed logo grid ------------------------- */
  MBB.Directory = function (exhibitors, categories, copy) {
    var counts = {};
    exhibitors.forEach(function (x) { counts[x.category] = (counts[x.category] || 0) + 1; });

    // LAS TRES CATEGORÍAS SE ENSEÑAN SIEMPRE, tengan empresas o no.
    //
    // Antes se escondía la que estuviera vacía, para que nadie pulsara un
    // filtro y se encontrara una rejilla en blanco. Suena razonable y es peor,
    // porque los filtros no son solo una herramienta para buscar: son el índice
    // de qué clase de empresas hay en este destino. Escondiendo una, la web
    // dice que el evento tiene dos categorías cuando tiene tres.
    //
    // Y el efecto es más raro cuanto más vacío está el directorio, que es
    // justo cuando más se mira: los filtros aparecen y desaparecen solos según
    // quién se haya inscrito esa mañana. Un alojamiento que entra a ver si le
    // interesa el evento no encuentra su categoría, y concluye que no es para
    // él.
    //
    // Una categoría sin empresas todavía no es un error: es un evento que se
    // está llenando. Se dice con esas palabras al pulsarla —lo hace apply() en
    // main.js— en vez de esconder la pregunta.
    var filters = categories
      .map(function (c, i) {
        return (
          '<button class="filter" type="button" data-filter="' + esc(c.id) + '" ' +
            'aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' + esc(c.label) + '</button>'
        );
      })
      .join('');

    // Before the first company registers there is nothing to filter and nothing
    // to search, and the tools would sit above an empty grid offering to narrow
    // down nothing. So the heading stands on its own and says what will be here.
    //
    // Y no lleva botón de Login. Esta sección es el escaparate de las empresas,
    // no una puerta de acceso — y justo encima está la banda «Already
    // registered?» con el suyo, y otro más en la cabecera. Tres botones iguales
    // en una pantalla no dan tres oportunidades de entrar: dan la sensación de
    // que la página insiste.
    if (!exhibitors.length) {
      return (
        '<div class="directory" id="exhibitors">' +
          // Sin titular, igual que cuando hay empresas. La entrada de la
          // sección habla de filtrar y buscar, y aquí todavía no hay ni
          // filtros ni buscador: lo aclaran estas dos líneas, que es mejor
          // que callarse y dejar una sección que promete algo que no está.
          '<div class="dir-waiting" data-reveal>' +
            '<p class="lead">The exhibitor directory opens as companies register.</p>' +
            '<p>Every participating company of the Bilbao Bizkaia destination will ' +
              'appear here, each with its own profile.</p>' +
          '</div>' +
        '</div>'
      );
    }

    return (
      '<div class="directory" id="exhibitors">' +
        // SIN TITULAR PROPIO. El de la sección, "Meet BB's Experts", está dos
        // líneas más arriba, y debajo va el texto que antes llevaba este
        // bloque. Dos titulares seguidos del mismo tamaño no separaban dos
        // temas: partían uno en dos.
        '<div class="dir-tools">' +
          '<div class="filters" role="group" aria-label="Filter exhibitors by category">' +
            filters +
          '</div>' +
          '<div class="dir-search">' +
            '<label class="sr-only" for="ex-search">Search exhibitors by name</label>' +
            '<span class="dir-search__ico" aria-hidden="true">' + ICONS.searchGlass + '</span>' +
            '<input type="search" id="ex-search" placeholder="Search by name" ' +
              'autocomplete="off" spellcheck="false">' +
          '</div>' +
        '</div>' +
        '<p class="dir-count" id="ex-count" role="status" aria-live="polite"></p>' +
        '<div class="logo-grid" id="ex-grid"></div>' +
        '<p class="directory__empty" id="ex-empty" hidden>No exhibitors match your search.</p>' +
      '</div>'
    );
  };

  /** One logo tile. The brand fills the tile; the name appears on hover. */
  MBB.ExhibitorTile = function (x, opts) {
    opts = opts || {};
    var base = opts.base || '';
    var initials = x.name
      .replace(/[^A-Za-z\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w[0].toUpperCase(); })
      .join('');

    var logo = x.logo
      ? '<img src="' + esc(base + x.logo) + '" alt="' + esc(x.name) + '" loading="lazy" ' +
        'data-fallback="mark" data-initials="' + esc(initials) + '">'
      : '<span class="logo-tile__mark">' + esc(initials) + '</span>';

    return (
      '<a class="logo-tile" href="' + esc(base) + 'exhibitors/' + esc(x.id) + '.html" ' +
        'data-category="' + esc(x.category) + '" ' +
        // Indexed on the name and on the web address, because the logo on the
        // tile is often the group's brand rather than the name of the entry —
        // "Aránzazu Hoteles" on the tile, "Hotel Carlton & Hotel Abando" in
        // the record, aranzazu-hoteles.com in both.
        'data-name="' + esc(MBB.searchKey(x.name + ' ' + (x.websiteLabel || x.website || ''))) + '" ' +
        'title="' + esc(x.name) + '">' +
        logo +
        '<span class="logo-tile__name">' + esc(x.name) + '</span>' +
      '</a>'
    );
  };

  /* --- Exhibitor page ----------------------------------------------------- */
  MBB.ExhibitorPage = function (x, categories, related, base) {
    // '' is a valid base (single-file build); only fill in when omitted.
    base = base === undefined || base === null ? '../' : base;

    var cat = categories.filter(function (c) { return c.id === x.category; })[0];

    var rows = [
      { icon: 'badge', text: x.contactName },
      { icon: 'briefcase', text: x.contactRole },
      { icon: 'mail', text: x.email, href: x.email ? 'mailto:' + x.email : '' },
      { icon: 'phone', text: x.phone, href: x.phone ? 'tel:' + x.phone.replace(/\s/g, '') : '' },
      { icon: 'link', text: x.websiteLabel || x.website, href: x.website },
      { icon: 'pin', text: x.address }
    ]
      .filter(function (r) { return r.text; })
      .map(function (r) {
        var value = r.href
          ? '<a href="' + esc(r.href) + '"' +
            (/^https?:/.test(r.href) ? ' target="_blank" rel="noopener"' : '') + '>' +
            esc(r.text) + '</a>'
          : esc(r.text);
        return '<li>' + ICONS[r.icon] + '<span>' + value + '</span></li>';
      })
      .join('');

    var body = x.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');

    var relatedTiles = related
      .map(function (r) { return MBB.ExhibitorTile(r, { base: base }); })
      .join('');

    return (
      '<div class="shell ex-page">' +
        '<h1 class="h-1 ex-page__title">' + esc(x.name) + '</h1>' +
        '<div class="ex-head">' +
          '<div>' +
            (x.logo
              ? '<img class="ex-head__logo" src="' + esc(base + x.logo) + '" alt="' +
                esc(x.name) + ' logo">'
              : '<div class="ph" style="aspect-ratio:1/1">[Insert logo]</div>') +
            '<p class="ex-head__cat">' + esc(cat ? cat.label : x.category) + '</p>' +
          '</div>' +
          '<ul class="ex-contact">' + rows + '</ul>' +
        '</div>' +
        '<div class="ex-body text-justify">' + body + '</div>' +
        '<p class="ex-more"><a class="link-red" href="' + esc(base) +
          '#exhibitors">See more exhibitors &gt; &gt;</a></p>' +
      '</div>' +
      '<div class="shell shell--wide"><div class="ex-related">' + relatedTiles + '</div></div>' +
      '<div class="ex-back"><a class="btn btn--outline btn--sm" href="' + esc(base) +
        '#exhibitors">Back to the directory</a></div>'
    );
  };

  /* --- Discover ----------------------------------------------------------- */
  MBB.Discover = function (d) {
    var cards = d.brochures
      .map(function (b, i) {
        var cover = b.cover
          ? '<img src="' + esc(b.cover) + '" alt="' + esc(b.title) + ' brochure cover" ' +
            'loading="lazy" data-fallback="ph" data-label="[Insert brochure cover]">'
          : '<div class="ph">[Insert brochure cover]</div>';

        // Only flag a missing link when there is genuinely nothing to open.
        var links = [];
        if (b.issuu) {
          links.push('<a class="brochure__dl" href="' + esc(b.issuu) + '" ' +
            'target="_blank" rel="noopener">' + ICONS.link + 'Read on Issuu</a>');
        }
        if (b.pdf) {
          links.push('<a class="brochure__dl" href="' + esc(b.pdf) + '" target="_blank" ' +
            'rel="noopener" download>' + ICONS.download + 'Download PDF</a>');
        }
        if (!links.length) {
          links.push('<span class="brochure__dl" style="opacity:.5">[Insert link]</span>');
        }
        var dl = links.join('');

        return (
          '<article class="brochure" data-reveal style="--d:' + (i % 4) * 70 + 'ms">' +
            '<button class="brochure__cover" type="button" data-brochure="' + esc(b.id) + '" ' +
              'aria-label="View brochure: ' + esc(b.title) + '">' + cover + '</button>' +
            '<div class="brochure__meta">' +
              '<h3>' + esc(b.title) + '</h3>' +
              '<p>' + esc(b.subtitle) + '</p>' +
              '<div class="brochure__links">' + dl + '</div>' +
            '</div>' +
          '</article>'
        );
      })
      .join('');

    var profile = d.issuuProfile
      ? '<p class="brochures__all"><a class="link-red" href="' + esc(d.issuuProfile) +
        '" target="_blank" rel="noopener">See all our publications on Issuu ' +
        '&gt; &gt;</a></p>'
      : '';

    return (
      '<div class="section-head section-head--center" data-reveal>' +
        '<h2 class="h-1">Discover Bilbao Bizkaia</h2>' +
        '<p>' + esc(d.intro) + '</p>' +
      '</div>' +
      '<div class="brochures">' + cards + '</div>' +
      profile
    );
  };

  MBB.BrochurePreview = function (b) {
    var cover = b.cover
      ? '<img src="' + esc(b.cover) + '" alt="' + esc(b.title) + ' brochure cover">'
      : '<div class="ph">[Insert brochure cover]</div>';

    return (
      '<div class="preview">' +
        '<div class="preview__cover">' + cover + '</div>' +
        '<div class="preview__copy">' +
          '<h3>' + esc(b.title) + '</h3>' +
          '<p>' + esc(b.subtitle) + '</p>' +
          '<p class="preview__note">Published by Visit Biscay. The document opens ' +
          'on the official tourism website, where you can read it online or ' +
          'download the PDF.</p>' +
        '</div>' +
      '</div>'
    );
  };

  /* --- Contact ------------------------------------------------------------ */
  MBB.Contact = function (site) {
    var channels = site.contact.channels
      .map(function (c) {
        return (
          '<div class="channel">' +
            '<span class="channel__icon">' + (ICONS[c.icon] || ICONS.mail) + '</span>' +
            '<h3>' + esc(c.title) + '</h3>' +
            '<p class="note">' + esc(c.note) + '</p>' +
            '<a href="' + esc(c.href) + '"' +
              (/^https?:/.test(c.href) ? ' target="_blank" rel="noopener"' : '') + '>' +
              esc(c.value) + '</a>' +
          '</div>'
        );
      })
      .join('');

    var nl = site.newsletter;

    return (
      '<div class="section-head section-head--center" data-reveal>' +
        '<h2 class="h-1">Contact</h2>' +
        '<p>' + esc(site.contact.intro) + '</p>' +
      '</div>' +
      '<div class="channels" data-reveal>' + channels + '</div>' +
      '<div class="newsletter">' +
        '<div data-reveal><h3 class="h-2">' + esc(nl.title) + '</h3>' +
          (nl.text ? '<p>' + esc(nl.text) + '</p>' : '') + '</div>' +
        // Elegir antes que escribir. Los dos públicos quieren cosas distintas y
        // van a listas distintas, así que se pregunta lo único que hace falta
        // saber aquí — cuál de los dos eres — y el resto se pide en el
        // formulario de destino. Esta web no recoge ningún dato personal.
        '<div data-reveal style="--d:80ms">' +
          '<div class="nl-choice">' +
            (nl.audiences || [])
              .map(function (a) {
                return (
                  '<a class="nl-opt" href="' + esc(a.url) + '" ' +
                    'target="_blank" rel="noopener">' +
                    '<span class="nl-opt__label">' + esc(a.label) + '</span>' +
                    (a.note ? '<span class="nl-opt__note">' + esc(a.note) + '</span>' : '') +
                  '</a>'
                );
              })
              .join('') +
          '</div>' +
          (nl.consent ? '<p class="nl-consent">' + esc(nl.consent) + '</p>' : '') +
        '</div>' +
      '</div>'
    );
  };

  /* --- Footer -------------------------------------------------------------- */
  MBB.Footer = function (site, opts) {
    opts = opts || {};
    var base = opts.base || '';
    // Mismo asunto que en la cabecera: desde una página que no es la portada,
    // "#discover" no lleva a ninguna parte. Hay que nombrarla.
    var home = opts.home != null ? opts.home : base;
    // Y lo mismo que arriba: en la página de aviso, un Login que lleva a la
    // página de aviso es un enlace que no hace nada.
    var conLogin = !(opts.aviso && !MBB.platformOpen(site));
    var f = site.footer;

    var insts = f.institutions
      .map(function (i) {
        return (
          '<a class="insts__item' + (i.plain ? ' insts__item--plain' : '') + '" ' +
            'href="' + esc(i.href) + '" target="_blank" rel="noopener" ' +
            'aria-label="' + esc(i.name) + '">' +
            '<img src="' + esc(base + i.file) + '" alt="' + esc(i.name) + '" loading="lazy">' +
          '</a>'
        );
      })
      .join('');

    var navLinks = site.nav
      .map(function (n) {
        return '<li><a href="' + esc(home) + esc(n.href) + '">' + esc(n.label) + '</a></li>';
      })
      .join('');

    var SOCIAL_ICON = {
      Facebook: 'facebook', Instagram: 'instagram', X: 'x', Website: 'globe'
    };

    var social = f.social
      .map(function (s) {
        return (
          '<p class="footer__handle">' + esc(s.handle) + '</p>' +
          '<div class="footer__socials">' +
            s.links.map(function (l) {
              return '<a href="' + esc(l.href) + '" target="_blank" rel="noopener" ' +
                'aria-label="' + esc(s.handle + ' on ' + l.label) + '">' +
                (ICONS[SOCIAL_ICON[l.label]] || ICONS.globe) + '</a>';
            }).join('') +
          '</div>'
        );
      })
      .join('');

    // Las páginas legales están en la raíz de la web. Desde la ficha de un
    // expositor, que vive en su propia carpeta, "privacy.html" apuntaría
    // dentro de esa carpeta y daría 404: hay que anteponerle el camino de
    // vuelta. Las direcciones completas y los anclas se dejan como están.
    var legal = f.legal
      .map(function (l) {
        var href = /^([a-z]+:|#|\/)/i.test(l.href) ? l.href : base + l.href;
        return '<a href="' + esc(href) + '">' + esc(l.label) + '</a>';
      })
      .join('');

    return (
      '<div class="footer__wedge"></div>' +
      '<div class="shell">' +
        '<div class="insts__row">' + insts + '</div>' +
        '<div class="footer__top">' +
          '<div class="footer__brand">' +
            '<img src="' + esc(base) + 'assets/img/brand/match-bilbao-bizkaia-wordmark.png" ' +
              'alt="Match Bilbao Bizkaia">' +
            '<p class="footer__statement">' + esc(f.statement) + '</p>' +
          '</div>' +
          '<div><h2>Navigate</h2><ul>' + navLinks +
            (conLogin && loginHref(site, base)
              ? '<li>' + loginLink(site, '', base) + '</li>' : '') +
          '</ul></div>' +
          '<div><h2>Event</h2><ul>' +
            '<li><a href="' + esc(home) + '#event">Programme</a></li>' +
            '<li><a href="' + esc(home) + '#presentation">Presentation of Bilbao</a></li>' +
            '<li><a href="' + esc(home) + '#exhibitors">Exhibitors</a></li>' +
            '<li><a href="' + esc(home) + '#discover">Brochures</a></li>' +
          '</ul></div>' +
          '<div><h2>Follow the destination</h2>' + social + '</div>' +
        '</div>' +
        '<div class="footer__bar">' +
          '<p style="margin:0">© ' + new Date().getFullYear() + ' ' + esc(f.copyright) +
            ' · ' + esc(f.mail) + '</p>' +
          '<nav class="footer__legal" aria-label="Legal">' + legal + '</nav>' +
        '</div>' +
      '</div>'
    );
  };
})(window.MBB);

/* Node (build scripts) can require this file too. */
if (typeof module !== 'undefined' && module.exports) module.exports = window.MBB;
