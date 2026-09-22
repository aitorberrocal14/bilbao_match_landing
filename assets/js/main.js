/* =============================================================================
   APP — mounts the components and wires the interactions
   ========================================================================== */

(function (MBB) {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $all = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* --------------------------------------------------------------------- */
  /* 1. Mount                                                               */
  /* --------------------------------------------------------------------- */
  function mount() {
    // El contenido se construye SOLO si la página tiene dónde ponerlo. No es
    // una optimización: platform.html carga únicamente site.js, así que pedirle
    // el programa o los folletos reventaría antes de llegar a lo suyo. Cada
    // página carga los datos que usa y monta lo que tiene.
    var into = function (name, construir) {
      var el = $('[data-mount="' + name + '"]');
      if (!el) return;

      // Cada sección se dibuja por su cuenta. Si una revienta —un dato mal
      // editado desde el panel, un archivo que no ha llegado todavía— se
      // pierde ESA sección y la página sigue en pie.
      //
      // Sin esto, un solo fallo dejaba la pantalla en blanco: ni cabecera, ni
      // pie, ni forma de saber qué había pasado. Y la web la van a editar
      // personas que no leen consolas de navegador.
      try {
        el.innerHTML = construir();
      } catch (e) {
        el.innerHTML = '';
        if (window.console && console.error) {
          console.error('No se ha podido dibujar la sección "' + name + '":', e);
        }
      }
    };

    // La cabecera necesita saber en qué página está. Si las secciones no están
    // aquí, sus enlaces tienen que nombrar la portada: si no, pulsar "Discover"
    // solo cambia la dirección del navegador y la pantalla se queda igual.
    var esPortada = !!$('[data-mount="hero"]');
    var esAviso = !!$('[data-gate]');

    // LA PORTADA SE NOMBRA COMO CARPETA, NO COMO ARCHIVO.
    //
    // «./» y «index.html» llevan al mismo sitio, pero el primero deja la
    // dirección limpia —matchbilbaobizkaia.eus/#discover— y el segundo la
    // ensucia con el nombre del archivo. Es cosmético, sí, pero esa dirección
    // es la que la gente copia y pega en un correo o en un mensaje.
    //
    // Y hay algo menos cosmético: dos direcciones distintas para la misma
    // página —con y sin index.html— son dos páginas para un buscador.
    var raiz = './';
    into('header', function () {
      return MBB.Header(MBB.site, {
        home: esPortada ? '' : raiz,
        aviso: esAviso
      });
    });
    into('hero', function () { return MBB.Hero(MBB.site, MBB.eventIntro); });
    into('programme', function () { return MBB.Programme(MBB.programme, MBB.site); });
    into('presentation', function () { return MBB.Presentation(MBB.presentation); });
    into('editions', function () { return MBB.Editions(MBB.editions); });
    // El directorio se le pasa a Experts en vez de pegarlo detrás: así el
    // orden de la sección lo decide un solo sitio —la propia función— y no
    // queda repartido entre dos archivos que hay que leer a la vez.
    into('experts', function () {
      return MBB.Experts(MBB.experts, MBB.site, {
        directorio: MBB.Directory(
          MBB.exhibitors, MBB.exhibitorCategories, MBB.experts.directory
        )
      });
    });
    into('discover', function () { return MBB.Discover(MBB.discover); });
    into('contact', function () { return MBB.Contact(MBB.site); });
    into('footer', function () {
      return MBB.Footer(MBB.site, { home: esPortada ? '' : raiz, aviso: esAviso });
    });
    // El aviso de platform.html viene escrito en el HTML y ya se está leyendo.
    // Si la plataforma sigue cerrada no hay nada que hacer. El día que abra,
    // esta página deja de tener sentido y se aparta sola: ver apartaElAviso().
    var puerta = $('[data-gate]');
    if (puerta && MBB.platformOpen(MBB.site)) {
      try {
        puerta.innerHTML = MBB.PlatformGate(MBB.site);
      } catch (e) {
        if (window.console && console.error) { console.error(e); }
      }
    }

    // El título solo lo pone la portada: las demás páginas traen el suyo en el
    // HTML y no hay que pisárselo.
    if (!$('[data-mount="hero"]')) return;

    document.title =
      MBB.site.event.name + ' ' + MBB.site.event.edition + ' — ' + MBB.site.event.dates;
  }

  /* --------------------------------------------------------------------- */
  /* 2. Header: mobile menu + scroll spy                                    */
  /* --------------------------------------------------------------------- */
  function initHeader() {
    var header = $('#header');
    if (!header) return;

    var burger = $('.burger', header);
    var links = $all('.header__link', header);

    function closeMenu() {
      header.dataset.menu = 'closed';
      if (burger) {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open menu');
      }
    }

    if (burger) {
      burger.addEventListener('click', function () {
        if (header.dataset.menu === 'open') { closeMenu(); return; }
        header.dataset.menu = 'open';
        burger.setAttribute('aria-expanded', 'true');
        burger.setAttribute('aria-label', 'Close menu');
      });
    }

    links.forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      // El mismo punto en el que el CSS despliega el menú (1275px). Si los dos
      // números no coinciden, al ensanchar la ventana el menú se queda abierto
      // por detrás de una cabecera que ya no tiene botón para cerrarlo.
      if (window.innerWidth > 1275) closeMenu();
    });

    var sections = links
      .map(function (a) {
        var i = a.hash ? document.getElementById(a.hash.slice(1)) : null;
        return i;
      })
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) {
            a.setAttribute('aria-current', a.hash === '#' + en.target.id ? 'true' : 'false');
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* --------------------------------------------------------------------- */
  /* 3. Reveal on scroll                                                    */
  /* --------------------------------------------------------------------- */
  function initReveal() {
    var els = $all('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          obs.unobserve(en.target);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------------------- */
  /* 4. Programme tabs                                                      */
  /* --------------------------------------------------------------------- */
  function initProgramme() {
    var card = $('.prog-card');
    if (!card) return;

    /* --- day tabs -------------------------------------------------------- */
    var tabs = $all('.prog__tab', card);

    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        select(next);
        next.focus();
      });
    });

    /* --- detailed / overview --------------------------------------------- */
    var views = $all('.prog__view', card);
    var panes = $all('.prog__pane', card);

    views.forEach(function (btn) {
      btn.addEventListener('click', function () {
        views.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        panes.forEach(function (p) {
          p.hidden = p.dataset.pane !== btn.dataset.view;
        });
      });
    });

    /* --- the two itineraries of Wednesday -------------------------------- */
    // The choice is remembered across the whole card, because the calendar
    // export has to follow whichever itinerary the visitor is reading.
    var group = (MBB.programme.groups && MBB.programme.groups[0] || {}).id || 'g1';

    function applyGroup() {
      $all('.prog__group', card).forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.group === group ? 'true' : 'false');
      });
      // A whole timeline per itinerary, not rows inside one: the parts of the
      // day are worked out per group, so they cannot be mixed.
      $all('.tl[data-group]', card).forEach(function (tl) {
        tl.hidden = tl.dataset.group !== group;
      });
    }

    $all('.prog__group', card).forEach(function (btn) {
      btn.addEventListener('click', function () {
        group = btn.dataset.group;
        applyGroup();
      });
    });
    applyGroup();

    /* --- calendar --------------------------------------------------------- */
    $all('[data-ics]', card).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var day = btn.dataset.ics;
        var text = MBB.ics(MBB.programme, { day: day, group: group });
        var name =
          'match-bilbao-bizkaia-2026' + (day === 'all' ? '' : '-' + day) + '.ics';

        // A Blob rather than a data: URI, so the file arrives with its own
        // name and the whole programme is not pushed through a URL.
        var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    });
  }

  /* --------------------------------------------------------------------- */
  /* 5. Exhibitor grid — category filter                                    */
  /* --------------------------------------------------------------------- */
  function initDirectory() {
    var grid = $('#ex-grid');
    if (!grid) return;

    var empty = $('#ex-empty');
    var count = $('#ex-count');
    var search = $('#ex-search');
    var filters = $all('.filter');

    grid.innerHTML = MBB.exhibitors
      .map(function (x) { return MBB.ExhibitorTile(x); })
      .join('');

    var tiles = $all('.logo-tile', grid);
    var category = 'all';

    function apply() {
      // Both conditions are applied together, so a search runs inside the
      // category on screen rather than silently reaching outside it.
      var query = search ? MBB.searchKey(search.value.trim()) : '';
      var shown = 0;

      tiles.forEach(function (t) {
        var show =
          (category === 'all' || t.dataset.category === category) &&
          (!query || (t.dataset.name || '').indexOf(query) !== -1);
        t.hidden = !show;
        if (show) shown++;
      });

      // El aviso de «no hay nada» tiene que decir POR QUÉ no hay nada, porque
      // ahora hay dos motivos distintos y se arreglan de forma distinta: una
      // búsqueda sin resultados se corrige escribiendo otra cosa; una categoría
      // sin empresas no se corrige, simplemente todavía no se ha inscrito
      // nadie. Un solo texto para las dos deja al visitante pensando que ha
      // hecho algo mal.
      if (empty) {
        empty.hidden = shown !== 0;
        if (shown === 0) {
          var cat = (MBB.exhibitorCategories || []).filter(function (c) {
            return c.id === category;
          })[0];
          empty.textContent = query
            ? 'No exhibitors match your search.'
            : 'No exhibitors in ' + (cat ? '“' + cat.label + '”' : 'this category') +
              ' yet. The directory fills up as companies register.';
        }
      }
      if (count) {
        count.textContent =
          shown === tiles.length
            ? tiles.length + ' exhibitors'
            : shown + ' of ' + tiles.length + ' exhibitors';
      }
    }

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        category = btn.dataset.filter;
        apply();
      });
    });

    if (search) {
      search.addEventListener('input', apply);
      // Escape clears the field rather than only clearing the browser's own
      // search affordance, which would leave the grid filtered.
      search.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && search.value) {
          search.value = '';
          apply();
        }
      });
    }

    apply();
  }

  /* --------------------------------------------------------------------- */
  /* 6. Video facades (click to load YouTube)                               */
  /* --------------------------------------------------------------------- */
  function initVideos() {
    $all('[data-yt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var frame = btn.closest('.video__frame');
        frame.innerHTML =
          '<iframe src="https://www.youtube-nocookie.com/embed/' +
          encodeURIComponent(btn.dataset.yt) + '?autoplay=1&rel=0" ' +
          'title="Match Bilbao Bizkaia video" allow="accelerometer; autoplay; ' +
          'clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
          'allowfullscreen></iframe>';
      });
    });
  }

  /* --------------------------------------------------------------------- */
  /* 7. Brochure modal                                                      */
  /* --------------------------------------------------------------------- */
  function initBrochures() {
    var modal = $('#modal');
    if (!modal) return;

    var title = $('#modal-title', modal);
    var body = $('#modal-body', modal);
    var foot = $('#modal-foot', modal);
    var lastFocus = null;

    function open(b) {
      title.textContent = b.title;

      var reader = MBB.issuuEmbed(b.issuu);

      if (reader) {
        // Issuu readers are designed to be embedded — show the brochure inline.
        body.innerHTML =
          '<iframe src="' + MBB.esc(reader) + '" title="' + MBB.esc(b.title) +
          ' brochure" allowfullscreen></iframe>';
      } else {
        // The official PDFs are hosted on visitbiscay.eus, which does not allow
        // framing, so a preview panel is shown instead of a blocked iframe.
        body.innerHTML = MBB.BrochurePreview(b);
      }

      var actions = [];
      if (b.issuu) {
        actions.push('<a class="btn btn--outline btn--sm" href="' + MBB.esc(b.issuu) +
          '" target="_blank" rel="noopener">Read on Issuu</a>');
      }
      if (b.pdf) {
        if (!b.issuu) {
          actions.push('<a class="btn btn--outline btn--sm" href="' + MBB.esc(b.pdf) +
            '" target="_blank" rel="noopener">Open in a new tab</a>');
        }
        actions.push('<a class="btn btn--sm" href="' + MBB.esc(b.pdf) +
          '" download>Download PDF</a>');
      }
      foot.innerHTML = actions.length
        ? actions.join('')
        : '<span style="font-size:.85rem;color:var(--grey-light)">' +
          '[Insert PDF or Issuu link for this brochure]</span>';

      lastFocus = document.activeElement;
      modal.dataset.open = 'true';
      document.body.classList.add('no-scroll');
      $('.modal__close', modal).focus();
    }

    function close() {
      modal.dataset.open = 'false';
      body.innerHTML = '';
      document.body.classList.remove('no-scroll');
      if (lastFocus) lastFocus.focus();
    }

    $all('[data-brochure]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var b = MBB.discover.brochures.filter(function (x) {
          return x.id === btn.dataset.brochure;
        })[0];
        if (b) open(b);
      });
    });

    $('.modal__close', modal).addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.dataset.open === 'true') close();
    });
  }

  /* --------------------------------------------------------------------- */
  /* 8. (libre)                                                             */
  /* --------------------------------------------------------------------- */
  // Aquí vivían dos cosas que ya no existen. El aviso de los botones de Login
  // sin configurar: ahora esos botones simplemente no se dibujan hasta que hay
  // una dirección. Y el formulario del boletín: ahora son dos enlaces a los
  // formularios de Mailchimp, así que no hay nada que validar ni que enviar —
  // y esta web no recoge ningún dato personal.
  function initForms() {}

  /* --------------------------------------------------------------------- */
  /* 9. Graceful image fallbacks                                            */
  /* --------------------------------------------------------------------- */
  /* Images tagged with data-fallback degrade to a labelled placeholder when
     the file has not been supplied yet, so the layout never breaks. */
  function initImageFallbacks() {
    document.addEventListener(
      'error',
      function (e) {
        var img = e.target;
        if (!img || img.tagName !== 'IMG' || !img.dataset.fallback) return;

        if (img.dataset.fallback === 'src') {
          // One retry against an alternative source, then give up quietly.
          var alt = img.dataset.srcAlt;
          delete img.dataset.srcAlt;
          if (alt) { img.src = alt; return; }
          img.remove();
        } else if (img.dataset.fallback === 'mark') {
          var mark = document.createElement('span');
          mark.className = 'logo-tile__mark';
          mark.textContent = img.dataset.initials || '';
          img.replaceWith(mark);
        } else if (img.dataset.fallback === 'ph') {
          var ph = document.createElement('div');
          ph.className = 'ph';
          ph.textContent = img.dataset.label || '[Insert image]';
          img.replaceWith(ph);
        } else {
          img.remove();
        }
      },
      true // error events do not bubble — listen in the capture phase
    );
  }

  /* --------------------------------------------------------------------- */
  /* 10. The "Add to calendar" menu                                         */
  /* --------------------------------------------------------------------- */
  /* El menú es un <details>: abrirlo, cerrarlo y recorrerlo con el teclado ya
     funciona sin nosotros. Lo único que falta es que se cierre al pulsar fuera
     o al darle a Escape, que es lo que cualquiera espera de un desplegable y
     lo que <details> no hace por su cuenta. */
  /**
   * Si el menú recién abierto se sale por debajo de la pantalla, se sube la
   * página lo justo para que se vea entero.
   *
   * El menú se abre HACIA ABAJO, y desde que el botón vive en la barra del
   * programa puede quedar a media pantalla de altura: se pulsa, se despliega
   * por debajo del borde y parece que no ha pasado nada. Sigue estando ahí
   * —basta con bajar— pero nadie baja para buscar algo que no sabe que se ha
   * abierto.
   *
   * Se mueve lo mínimo, y solo cuando de verdad no cabe: si el menú entero ya
   * se ve, la página no se mueve. El salto es seco y no animado a propósito:
   * son unos pocos píxeles con un menú ya abierto delante, y deslizarlos poco
   * a poco se lee como que la página se mueve sola.
   */
  function aLaVista(d) {
    var menu = d.querySelector('.cal__menu');
    if (!menu) return;
    // Hasta el siguiente fotograma el menú todavía no tiene medidas.
    requestAnimationFrame(function () {
      var c = menu.getBoundingClientRect();
      var sobra = c.bottom - (window.innerHeight - 16);
      if (sobra <= 0) return;
      // La hoja de estilos pide desplazamiento suave para toda la página, que
      // es lo que se quiere al saltar de una sección a otra desde el menú. Aquí
      // no: son unos pocos píxeles con el desplegable ya abierto delante, y
      // verlos deslizarse se lee como que la página se mueve sola. `instant`
      // se salta esa regla; si un navegador antiguo no lo entiende, se cae al
      // desplazamiento de siempre, que también deja el menú a la vista.
      try {
        window.scrollBy({ top: sobra, behavior: 'instant' });
      } catch (e) {
        window.scrollBy(0, sobra);
      }
    });
  }

  function initCalendarMenus() {
    // Los bloques que aún están entrando llevan un `transform`, y un elemento
    // transformado se dibuja por encima de uno que solo tiene z-index. Durante
    // ese medio segundo el menú se veía, pero tres de sus cuatro opciones no se
    // podían pulsar. Mientras está abierto, su bloque sube por encima de todo.
    $all('details.cal').forEach(function (d) {
      var bloque = d.closest('[data-reveal]') || d.parentElement;
      if (!bloque) return;
      // `toggle` no burbujea, así que se escucha en cada uno.
      d.addEventListener('toggle', function () {
        bloque.classList.toggle('cal-encima', d.open);
        if (d.open) aLaVista(d);
      });
    });

    // El .ics se escribe aquí, en el momento de pulsar, desde los mismos datos
    // que alimentan los otros tres destinos. No hay ningún archivo guardado que
    // pueda quedarse diciendo una hora vieja.
    $all('[data-ics-event]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var texto = MBB.eventIcs(MBB.site.event.calendar);
        if (!texto) return;

        var url = URL.createObjectURL(
          new Blob([texto], { type: 'text/calendar;charset=utf-8' })
        );
        var a = document.createElement('a');
        a.href = url;
        a.download = 'match-bilbao-bizkaia-2026.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        var menu = btn.closest('details.cal');
        if (menu) menu.open = false;
      });
    });

    function cerrarTodos(menos) {
      $all('details.cal[open]').forEach(function (d) {
        if (d !== menos) d.open = false;
      });
    }

    document.addEventListener('click', function (e) {
      var dentro = e.target.closest ? e.target.closest('details.cal') : null;
      cerrarTodos(dentro);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var abierto = $('details.cal[open]');
      if (!abierto) return;
      abierto.open = false;
      var boton = $('summary', abierto);
      if (boton) boton.focus();
    });
  }

  /* --------------------------------------------------------------------- */
  /* 11. Boot                                                               */
  /* --------------------------------------------------------------------- */
  /**
   * EL DÍA 28 ESTA PÁGINA SE APARTA SOLA.
   *
   * platform.html existe para una cosa: decirle a quien pulsa "Login" que
   * todavía no puede entrar. Abierta la plataforma ya no hace falta, y dejar a
   * alguien parado en ella sería mandarle a una vía muerta.
   *
   * A partir de esa fecha, quien llegue aquí —desde un correo de septiembre,
   * desde un enlace guardado, desde un mensaje reenviado— va directo al acceso
   * de Meetmaps sin ver nada por el camino. La página no desaparece del
   * servidor, y eso es a propósito: borrarla rompería todos esos enlaces con un
   * error 404. Sigue ahí, pero ya no se le enseña a nadie.
   *
   * Se usa replace() y no la dirección a secas para no dejar rastro en el
   * historial: si no, al darle a "atrás" el navegador volvería aquí y la página
   * le expulsaría otra vez, atrapándole en un bucle.
   *
   * Y si algún día se vacía `login.url` —la plataforma se retira— no hay a
   * dónde mandar a nadie y esto no se activa.
   */
  function apartaElAviso() {
    if (!$('[data-gate]')) return;                 // no estamos en esa página
    if (!MBB.platformOpen(MBB.site)) return;       // todavía no ha abierto

    var destino = ((MBB.site.login || {}).url || '').trim();
    if (!/^https?:/i.test(destino)) return;

    window.location.replace(destino);
  }

  function boot() {
    // Lo primero de todo: si hay que apartarse, cuanto antes, para que no se
    // llegue a ver un mensaje que ya no viene a cuento.
    apartaElAviso();

    initImageFallbacks();
    if ($('[data-mount="header"]')) mount();   // landing page only
    initHeader();
    initProgramme();
    initDirectory();
    initVideos();
    initBrochures();
    initForms();
    initCalendarMenus();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.MBB);
