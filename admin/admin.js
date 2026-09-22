/* =============================================================================
   ADMINISTRATION PANEL
   -----------------------------------------------------------------------------
   The whole site, editable in a browser, by someone who has never seen a
   terminal.

   How it works
   ------------
   The site keeps its content in five data files that the page loads with
   ordinary script tags. This panel loads the same five, presents them as
   forms, and writes them back out. index.html is never touched: it is an empty
   shell and there is nothing in it to edit.

   Writing back out is deliberately dull — every value is serialised with
   JSON.stringify and assigned to its global. JSON is valid JavaScript, so a
   file written here cannot come out with a syntax error and take the site down,
   which is the one failure that matters when the person publishing does not
   read code.

   Publishing
   ----------
   "Publicar" downloads the files that changed, and those files go into the
   REPOSITORY — not onto the server by FTP, and not through admin/save.php.

   The server publishes itself from the repository every half hour, copying
   over whatever is in the public folder. Anything written straight there —
   by FTP or by save.php — lasts until the next pass and then disappears,
   with the deploy log reporting a perfectly normal run. Demonstrated: edit a
   data file in the public folder, run deploy.php, and the edit is gone.

   That is also why the panel is no longer published on the web: save.php
   cannot run if nobody can reach it, which removes the one path that could
   quietly lose somebody's afternoon.
   ========================================================================== */

(function () {
  'use strict';

  /* --- Small helpers ------------------------------------------------------ */

  var $ = function (id) { return document.getElementById(id); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  /** 'site.hero.facts.0.label' → the value, or undefined along a broken path. */
  function get(path) {
    return String(path).split('.').reduce(function (o, k) {
      return o == null ? undefined : o[k];
    }, STATE);
  }

  function set(path, value) {
    var keys = String(path).split('.');
    var last = keys.pop();
    var target = keys.reduce(function (o, k) { return o[k]; }, STATE);
    target[last] = value;
  }

  /* In the one-file version of the panel there is no assets/ folder next door,
     so the images it can preview travel inlined in a lookup table. */
  function assetUrl(rel) {
    var map = window.MBB_ASSETS;
    if (map && map[rel]) return map[rel];
    return window.MBB_STANDALONE ? '' : '../' + rel;
  }

  /** A stable id from a name: "Hotel Gran Bilbao" → "hotel-gran-bilbao". */
  function slugify(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'sin-nombre';
  }

  /* --- State -------------------------------------------------------------- */

  var SRC = window.MBB || {};

  // Everything the panel edits, in one object. Paths in the field definitions
  // are absolute from here.
  var STATE = {
    site: clone(SRC.site || {}),
    eventIntro: clone(SRC.eventIntro || {}),
    presentation: clone(SRC.presentation || {}),
    experts: clone(SRC.experts || {}),
    programme: clone(SRC.programme || {}),
    exhibitorCategories: clone(SRC.exhibitorCategories || []),
    exhibitors: clone(SRC.exhibitors || []),
    discover: clone(SRC.discover || {}),
    // Los vídeos viven en discover.js, junto a los folletos. Si no estuvieran
    // aquí, el panel reescribiría ese archivo sin ellos y desaparecerían de la
    // web en cuanto alguien pulsara Publicar.
    editions: clone(SRC.editions || [])
  };

  var dirty = false;

  function touch() {
    if (dirty) return;
    dirty = true;
    $('state').textContent = 'Cambios sin publicar';
    $('state').dataset.dirty = 'true';
  }

  window.addEventListener('beforeunload', function (e) {
    if (!dirty) return;
    e.preventDefault();
    e.returnValue = '';
  });

  /* --- Writing the files -------------------------------------------------- */

  // The explanation each file carries at the top. The panel rewrites the whole
  // file, so whatever a maintainer needs to know has to live here.
  var BANNERS = {
    'site.js':
      'SITE DATA — Match Bilbao Bizkaia 2026\n' +
      '-----------------------------------------------------------------------------\n' +
      'Navigation, hero, login, contact details, footer and newsletter.\n\n' +
      'Written by the administration panel (admin/index.html). Safe to edit by\n' +
      'hand, but keep the shape: the panel reads this file back in.',
    'content.js':
      'EDITORIAL CONTENT\n' +
      '-----------------------------------------------------------------------------\n' +
      'The long-form copy: the event introduction, the presentation of Bilbao and\n' +
      'the "Meet BB\'s Experts" section.\n\n' +
      'Written by the administration panel (admin/index.html).',
    'programme.js':
      'EVENT PROGRAMME\n' +
      '-----------------------------------------------------------------------------\n' +
      'Written by the administration panel (admin/index.html).\n\n' +
      'Slot fields:\n' +
      '  time    — start, 24h "HH:MM". Also what the timeline rail shows.\n' +
      '  end     — optional end time; when absent the slot runs to the next one,\n' +
      '            which is what the calendar export assumes.\n' +
      '  title   — slot heading\n' +
      '  text    — one short supporting sentence (optional)\n' +
      '  venue   — location line (optional)\n' +
      '  group   — \'g1\' / \'g2\' on a day that splits; omitted when it is shared\n' +
      '  feature — true to give the slot a highlighted card\n' +
      '  open    — true when the time is not fixed yet (arrivals, departures); the\n' +
      '            slot is shown without a time and left out of the calendar file.',
    'exhibitors.js':
      'EXHIBITORS\n' +
      '-----------------------------------------------------------------------------\n' +
      'The directory renders as a full-bleed grid of logos, and each entry has its\n' +
      'own page in exhibitors/<id>.html.\n\n' +
      'Written by the administration panel (admin/index.html). After adding or\n' +
      'removing an exhibitor the per-exhibitor pages have to be regenerated —\n' +
      'see the note on the Expositores screen of the panel.',
    'discover.js':
      'DISCOVER — BROCHURES AND EDITION VIDEOS\n' +
      '-----------------------------------------------------------------------------\n' +
      'Two things live here.\n\n' +
      'BROCHURES. Each one shows its cover and opens either an Issuu reader (paste\n' +
      'the normal Issuu link; it is turned into the embed URL automatically) or a\n' +
      'direct PDF download.\n\n' +
      'EDITIONS. The videos under the presentation of the destination. Only the\n' +
      'YouTube id is kept, and the player is loaded when someone presses play, so\n' +
      'the page stays fast and sets no YouTube cookies on anyone who walks past.\n' +
      'Leave `thumbnail` empty to use the still the video has on YouTube.\n\n' +
      'Written by the administration panel (admin/index.html).'
  };

  // Which globals belong in which file, in the order the file declares them.
  var FILES = [
    { name: 'site.js', keys: ['site'] },
    { name: 'content.js', keys: ['eventIntro', 'presentation', 'experts'] },
    { name: 'programme.js', keys: ['programme'] },
    { name: 'exhibitors.js', keys: ['exhibitorCategories', 'exhibitors'] },
    { name: 'discover.js', keys: ['discover', 'editions'] }
  ];

  function emit(file, state) {
    var rule = '   ==========================================================================';
    var banner =
      '/* =============================================================================\n' +
      BANNERS[file.name].split('\n').map(function (l) {
        return l ? '   ' + l : '';
      }).join('\n') + '\n' + rule + ' */\n\n' +
      'window.MBB = window.MBB || {};\n\n';

    return banner + file.keys.map(function (k) {
      return 'window.MBB.' + k + ' = ' + JSON.stringify(state[k], null, 2) + ';\n';
    }).join('\n');
  }

  // The files as they were when the panel opened, so "changed" means changed by
  // this session and not merely reformatted.
  var BASELINE = {};
  FILES.forEach(function (f) { BASELINE[f.name] = emit(f, STATE); });

  function changedFiles() {
    return FILES.filter(function (f) { return emit(f, STATE) !== BASELINE[f.name]; });
  }

  /* --- The field engine ---------------------------------------------------
     Screens declare what they hold; this turns that into markup and wires it
     up by delegation, so typing never costs a re-render and never loses focus.
     A field marked `refresh` redraws the screen on blur, which is how a
     repeater's summary line keeps up with the name inside it. */

  function fieldHtml(f, base) {
    if (f.t === 'note') {
      return '<div class="notice' + (f.kind ? ' notice--' + f.kind : '') + '">' + f.html + '</div>';
    }

    var path = base ? base + '.' + f.k : f.k;
    var value = get(path);
    var id = 'f-' + path.replace(/\./g, '-');
    var width = f.width ? ' field--' + f.width : '';
    var hint = f.hint ? '<p class="hint">' + f.hint + '</p>' : '';
    var attrs = 'id="' + id + '" data-path="' + esc(path) + '"' + (f.refresh ? ' data-refresh="1"' : '');

    if (f.t === 'check') {
      return '<div class="field field--check">' +
        '<input type="checkbox" ' + attrs + (value ? ' checked' : '') + '>' +
        '<label for="' + id + '">' + esc(f.label) + '</label>' + hint + '</div>';
    }

    var control;
    if (f.t === 'select') {
      var opts = typeof f.options === 'function' ? f.options() : f.options;
      control = '<select ' + attrs + '>' + opts.map(function (o) {
        return '<option value="' + esc(o.value) + '"' +
          (String(o.value) === String(value == null ? '' : value) ? ' selected' : '') +
          '>' + esc(o.label) + '</option>';
      }).join('') + '</select>';
    } else if (f.t === 'textarea') {
      control = '<textarea rows="' + (f.rows || 4) + '" ' + attrs + '>' + esc(value) + '</textarea>';
    } else if (f.t === 'paras') {
      control = '<textarea rows="' + (f.rows || 10) + '" ' + attrs + ' data-paras="1">' +
        esc((value || []).join('\n\n')) + '</textarea>';
    } else {
      control = '<input type="text" ' + attrs + ' value="' + esc(value) + '">';
    }

    return '<div class="field' + width + '"><label for="' + id + '">' + esc(f.label) + '</label>' +
      control + hint + preview(f, value) +
      '</div>';
  }

  /* A path that points at nothing shows no preview rather than a broken image:
     the field is still right, the file just is not there yet. */
  function preview(f, value) {
    if (f.t !== 'image' || !value) return '';
    var url = assetUrl(value);
    if (!url) return '';
    return '<img class="thumb" src="' + esc(url) + '" alt="" onerror="this.remove()">';
  }

  function fieldsHtml(fields, base) {
    return fields.map(function (f) {
      if (f.t === 'rep') return repHtml(f, base);
      if (f.t === 'coll') return collHtml(f, base);
      if (f.t === 'row') {
        return '<div class="row">' + fieldsHtml(f.fields, base) + '</div>';
      }
      return fieldHtml(f, base);
    }).join('');
  }

  function repHtml(f, base) {
    var path = base ? base + '.' + f.k : f.k;
    var list = get(path) || [];

    var items = list.map(function (item, i) {
      var title = f.title ? f.title(item, i) : (f.itemLabel || 'Elemento') + ' ' + (i + 1);
      return '<div class="rep">' +
        '<div class="rep__head">' +
          '<span class="rep__title">' + esc(title) + '</span>' +
          '<button type="button" class="btn btn--tiny" data-act="up" data-list="' + esc(path) + '" data-i="' + i + '"' +
            (i === 0 ? ' disabled' : '') + ' title="Subir">↑</button>' +
          '<button type="button" class="btn btn--tiny" data-act="down" data-list="' + esc(path) + '" data-i="' + i + '"' +
            (i === list.length - 1 ? ' disabled' : '') + ' title="Bajar">↓</button>' +
          '<button type="button" class="btn btn--tiny btn--danger" data-act="del" data-list="' + esc(path) + '" data-i="' + i + '"' +
            ' data-label="' + esc(title) + '" title="Eliminar">Eliminar</button>' +
        '</div>' +
        '<div class="rep__body">' + fieldsHtml(f.fields, path + '.' + i) + '</div>' +
      '</div>';
    }).join('');

    return '<div class="field"><span class="field__label">' + esc(f.label) + '</span>' +
      (f.hint ? '<p class="hint" style="margin-bottom:.6rem">' + f.hint + '</p>' : '') +
      items +
      '<button type="button" class="btn" data-act="add" data-list="' + esc(path) + '">' +
        'Añadir ' + esc((f.itemLabel || 'elemento').toLowerCase()) + '</button>' +
    '</div>';
  }

  /* A long list is a list plus one form, not eighty stacked forms. */
  var pick = {};   // list path → index currently open
  var query = {};  // list path → search text

  function collHtml(f, base) {
    var path = base ? base + '.' + f.k : f.k;
    var list = get(path) || [];
    if (pick[path] == null || pick[path] >= list.length) pick[path] = 0;

    var q = (query[path] || '').toLowerCase();
    var rows = list.map(function (item, i) {
      return { item: item, i: i };
    }).filter(function (r) {
      if (!q) return true;
      return String(f.search ? f.search(r.item) : '').toLowerCase().indexOf(q) !== -1;
    });

    var listHtml = rows.map(function (r) {
      return '<button type="button" data-act="pick" data-list="' + esc(path) + '" data-i="' + r.i + '"' +
        ' aria-current="' + (r.i === pick[path]) + '">' +
        esc(f.title(r.item, r.i)) +
        (f.sub ? '<span class="sub">' + esc(f.sub(r.item, r.i)) + '</span>' : '') +
      '</button>';
    }).join('') || '<p class="muted" style="padding:.75rem">Nada coincide.</p>';

    var current = list[pick[path]];
    var detail = current
      ? '<div class="card">' +
          '<h2>' + esc(f.title(current, pick[path])) + '</h2>' +
          fieldsHtml(f.fields, path + '.' + pick[path]) +
          '<div class="actions"><button type="button" class="btn btn--danger" data-act="del"' +
            ' data-list="' + esc(path) + '" data-i="' + pick[path] + '"' +
            ' data-label="' + esc(f.title(current, pick[path])) + '">Eliminar</button></div>' +
        '</div>'
      : '<div class="card"><p class="muted">La lista está vacía.</p></div>';

    return '<div class="coll">' +
      '<div class="coll__list">' +
        (f.search ? '<div class="coll__search"><input type="text" placeholder="Buscar…"' +
          ' data-act="search" data-list="' + esc(path) + '" value="' + esc(query[path] || '') + '"></div>' : '') +
        '<div class="coll__items">' + listHtml + '</div>' +
        '<div class="coll__foot"><button type="button" class="btn" data-act="add"' +
          ' data-list="' + esc(path) + '">Añadir ' + esc((f.itemLabel || 'elemento').toLowerCase()) + '</button></div>' +
      '</div>' +
      '<div class="coll__detail">' + detail + '</div>' +
    '</div>';
  }

  /* Blank items, by list path. Kept in one place so "Añadir" always produces
     something the site can render rather than an empty object. */
  var BLANKS = {
    'site.nav': function () { return { label: 'Nueva sección', href: '#' }; },
    'site.hero.facts': function () { return { value: '', label: '' }; },
    'site.hero.ctas': function () { return { label: '', href: '#', variant: 'ghost' }; },
    'site.contact.channels': function () { return { title: '', note: '', value: '', href: '', icon: 'mail' }; },
    'site.footer.institutions': function () { return { name: '', file: '', href: '', plain: false }; },
    'site.footer.social': function () { return { handle: '', links: [] }; },
    'site.footer.legal': function () { return { label: '', href: '#' }; },
    'eventIntro.highlights': function () { return { title: '', text: '' }; },
    'presentation.media': function () { return { file: '', caption: '' }; },
    'experts.steps': function () { return { n: '', title: '', text: '' }; },
    'programme.groups': function () { return { id: 'g' + (get('programme.groups').length + 1), label: '' }; },
    'programme.days': function () {
      var n = get('programme.days').length + 1;
      return { id: 'day-' + n, label: 'Day ' + n, date: '', dateISO: '', theme: '', summary: '', slots: [] };
    },
    'exhibitorCategories': function () { return { id: '', label: '' }; },
    'editions': function () { return { youtubeId: '', title: '', caption: '', thumbnail: '' }; },
    'exhibitors': function () {
      return {
        id: '', name: '', category: '', logo: '',
        contactName: '', contactRole: '', email: '', phone: '',
        website: '', websiteLabel: '', address: '', paragraphs: []
      };
    },
    'discover.brochures': function () {
      return { id: '', title: '', subtitle: '', cover: '', pdf: '', issuu: '' };
    }
  };

  function blankFor(path) {
    // Slots live under programme.days.<i>.slots, so match on the tail.
    if (/^programme\.days\.\d+\.slots$/.test(path)) {
      return { time: '', title: '', text: '', venue: '' };
    }
    if (/^site\.footer\.social\.\d+\.links$/.test(path)) return { label: '', href: '' };
    return BLANKS[path] ? BLANKS[path]() : {};
  }

  /* --- Screens ------------------------------------------------------------ */

  function categoryOptions() {
    return [{ value: '', label: '— sin categoría —' }].concat(
      (STATE.exhibitorCategories || [])
        .filter(function (c) { return c.id !== 'all'; })
        .map(function (c) { return { value: c.id, label: c.label }; })
    );
  }

  function groupOptions() {
    return [{ value: '', label: 'Todos los grupos' }].concat(
      (get('programme.groups') || []).map(function (g) {
        return { value: g.id, label: g.label };
      })
    );
  }

  var SCREENS = [
    /* ---------------------------------------------------------------- */
    {
      id: 'escritorio',
      label: 'Escritorio',
      title: 'Escritorio',
      lede: 'Todo lo que se ve en la web se edita desde el menú de la izquierda.',
      render: function () {
        var days = (get('programme.days') || []);
        var slots = days.reduce(function (n, d) { return n + (d.slots || []).length; }, 0);
        var linked = (get('discover.brochures') || []).filter(function (b) {
          return b.issuu || b.pdf;
        }).length;

        return '<div class="card"><h2>La web ahora mismo</h2><div class="stats">' +
            '<div><b>' + (STATE.exhibitors || []).length + '</b><span>Expositores</span></div>' +
            '<div><b>' + days.length + '</b><span>Días de programa</span></div>' +
            '<div><b>' + slots + '</b><span>Sesiones</span></div>' +
            '<div><b>' + linked + '</b><span>Folletos con enlace</span></div>' +
          '</div></div>' +
          '<div class="notice"><p><b>Cómo se trabaja aquí.</b> Se edita lo que haga falta, ' +
            'de una pantalla o de varias, y al terminar se pulsa <b>Publicar</b>. Hasta ' +
            'ese momento nada cambia en la web.</p></div>' +
          '<div class="card"><h2>Lo que este panel no toca</h2>' +
            '<p class="muted" style="margin-top:0">Para que quede claro qué se puede y qué no:</p>' +
            '<ul class="muted">' +
              '<li><b>El diseño</b> — colores, tipografías y maquetación viven en la hoja de ' +
                'estilos. Desde aquí no se pueden romper.</li>' +
              '<li><b>Las imágenes</b> — se editan las rutas, no los archivos. Una foto ' +
                'nueva se sube al repositorio, a <code>assets/img/</code>, y aquí se ' +
                'escribe su ruta. Subida por FTP funcionaría hoy, pero no estaría en ' +
                'el repositorio: se perdería en cuanto la web se reinstale o se mueva ' +
                'de servidor.</li>' +
              '<li><b>Los expositores</b> — llegan solos desde Meetmaps y se ' +
                'reescriben cada hora. Se cambian allí, no aquí.</li>' +
            '</ul>' +
          '</div>';
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'portada',
      label: 'Portada',
      title: 'Portada',
      lede: 'La primera pantalla: el titular, la entradilla, los botones y la fotografía de fondo.',
      cards: [
        {
          h2: 'El evento',
          fields: [
            { t: 'row', fields: [
              { t: 'text', k: 'site.event.dates', label: 'Fechas', hint: 'Como se escriben en la web: “6 – 10 October 2026”.' },
              { t: 'text', k: 'site.event.location', label: 'Lugar' }
            ] }
          ]
        },
        {
          h2: 'Botón “Add to calendar”',
          fields: [
            { t: 'note', html: '<p>De aquí salen los cuatro destinos del botón: Google Calendar, ' +
              'Outlook, Office 365 y el archivo para Apple Calendar. Se escribe una vez y los ' +
              'cuatro van solos.</p>' },
            { t: 'row', fields: [
              { t: 'text', k: 'site.event.calendar.start', label: 'Empieza',
                hint: 'Con hora y desfase: <code>2026-10-06T09:00:00+02:00</code>. El <code>+02:00</code> es la hora de Bilbao en octubre.' },
              { t: 'text', k: 'site.event.calendar.end', label: 'Termina',
                hint: 'Mismo formato. Si una de las dos no se entiende, el botón no se dibuja.' }
            ] },
            { t: 'text', k: 'site.event.calendar.title', label: 'Título de la cita' },
            { t: 'text', k: 'site.event.calendar.location', label: 'Lugar de la cita' },
            { t: 'textarea', k: 'site.event.calendar.details', label: 'Descripción', rows: 2 }
          ]
        },
        {
          h2: 'Titular',
          fields: [
            { t: 'text', k: 'site.hero.kicker', label: 'Línea superior' },
            { t: 'row', fields: [
              { t: 'text', k: 'site.hero.title', label: 'Título' },
              { t: 'text', k: 'site.hero.titleYear', label: 'Año', width: 'short' }
            ] },
            { t: 'text', k: 'site.hero.subtitle', label: 'Subtítulo' },
            { t: 'textarea', k: 'site.hero.lead', label: 'Entradilla', rows: 4 }
          ]
        },
        {
          h2: 'Botones',
          fields: [
            { t: 'rep', k: 'site.hero.ctas', label: 'Botones de la portada', itemLabel: 'Botón',
              title: function (o) { return o.label || 'Botón sin texto'; },
              fields: [
                { t: 'row', fields: [
                  { t: 'text', k: 'label', label: 'Texto', refresh: true },
                  { t: 'text', k: 'href', label: 'Destino', hint: 'Una sección de la web (#event) o una dirección completa.' }
                ] },
                { t: 'select', k: 'variant', label: 'Estilo', width: 'mid', options: [
                  { value: 'primary', label: 'Relleno (rojo)' },
                  { value: 'ghost', label: 'Contorno' }
                ] }
              ] }
          ]
        },
        {
          h2: 'Datos destacados',
          fields: [
            { t: 'rep', k: 'site.hero.facts', label: 'Cifras bajo el titular', itemLabel: 'Dato',
              hint: 'Escribir <code>count:exhibitors</code> como valor hace que la cifra se cuente sola a partir de la lista de expositores.',
              title: function (o) { return (o.value || '—') + ' · ' + (o.label || ''); },
              fields: [
                { t: 'row', fields: [
                  { t: 'text', k: 'value', label: 'Cifra', width: 'short', refresh: true },
                  { t: 'text', k: 'label', label: 'Texto', refresh: true }
                ] }
              ] }
          ]
        },
        {
          h2: 'Fondo',
          fields: [
            { t: 'image', k: 'site.hero.media.image', label: 'Fotografía',
              hint: 'Ruta desde la raíz de la web. La imagen se sube antes al repositorio, a <code>assets/img/photos/</code>.' },
            { t: 'text', k: 'site.hero.media.video', label: 'Vídeo (opcional)',
              hint: 'Si se rellena, sustituye a la fotografía. Ejemplo: <code>assets/video/hero.mp4</code>.' }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'menu',
      label: 'Menú y acceso',
      title: 'Menú y acceso',
      lede: 'El menú de navegación y el botón de Login que lleva a la plataforma.',
      cards: [
        {
          h2: 'Menú',
          fields: [
            { t: 'rep', k: 'site.nav', label: 'Secciones del menú', itemLabel: 'Sección',
              hint: 'El orden de esta lista es el orden del menú.',
              title: function (o) { return o.label || 'Sin texto'; },
              fields: [
                { t: 'row', fields: [
                  { t: 'text', k: 'label', label: 'Texto', refresh: true },
                  { t: 'text', k: 'href', label: 'Destino' }
                ] }
              ] }
          ]
        },
        {
          h2: 'Login',
          fields: [
            { t: 'note', html: '<p>Mientras la dirección sea <code>#login-placeholder</code>, ' +
              'el botón no lleva a ninguna parte. Hay que poner aquí la dirección de Meetmaps.</p>' },
            { t: 'row', fields: [
              { t: 'text', k: 'site.login.label', label: 'Texto del botón', width: 'mid' },
              { t: 'text', k: 'site.login.url', label: 'Dirección de la plataforma' }
            ] }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'evento',
      label: 'El evento',
      title: 'El evento',
      lede: 'La sección que explica qué es Match Bilbao Bizkaia.',
      cards: [
        {
          h2: 'Introducción',
          fields: [
            { t: 'row', fields: [
              { t: 'text', k: 'eventIntro.eyebrow', label: 'Antetítulo', width: 'mid' },
              { t: 'text', k: 'eventIntro.title', label: 'Título' }
            ] },
            { t: 'textarea', k: 'eventIntro.lead', label: 'Texto de entrada', rows: 6 }
          ]
        },
        {
          h2: 'Claves',
          fields: [
            { t: 'rep', k: 'eventIntro.highlights', label: 'Bloques destacados', itemLabel: 'Bloque',
              title: function (o) { return o.title || 'Bloque sin título'; },
              fields: [
                { t: 'text', k: 'title', label: 'Título', refresh: true },
                { t: 'textarea', k: 'text', label: 'Texto', rows: 3 }
              ] }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'bilbao',
      label: 'Presentación de Bilbao',
      title: 'Presentación de Bilbao',
      lede: 'El texto sobre el destino y las dos fotografías que lo acompañan.',
      cards: [
        {
          h2: 'Encabezado',
          fields: [
            { t: 'row', fields: [
              { t: 'text', k: 'presentation.eyebrow', label: 'Antetítulo', width: 'mid' },
              { t: 'text', k: 'presentation.title', label: 'Título' }
            ] }
          ]
        },
        {
          h2: 'Texto',
          fields: [
            { t: 'paras', k: 'presentation.paragraphs', label: 'Párrafos', rows: 16,
              hint: 'Un párrafo por bloque. Para separar párrafos, dejar <b>una línea en blanco</b> entre ellos.' }
          ]
        },
        {
          h2: 'Fotografías',
          fields: [
            { t: 'rep', k: 'presentation.media', label: 'Imágenes de la sección', itemLabel: 'Imagen',
              hint: 'Se acordaron dos. Si falta el archivo, la web muestra un hueco con el nombre en lugar de descuadrarse.',
              title: function (o) { return o.caption || o.file || 'Imagen'; },
              fields: [
                { t: 'image', k: 'file', label: 'Ruta del archivo' },
                { t: 'text', k: 'caption', label: 'Pie de foto', refresh: true }
              ] }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'experts',
      label: "Meet BB's Experts",
      title: "Meet BB's Experts",
      lede: 'La sección de networking: cómo funciona la plataforma y el acceso para registrados.',
      cards: [
        {
          h2: 'Encabezado',
          fields: [
            { t: 'row', fields: [
              { t: 'text', k: 'experts.eyebrow', label: 'Antetítulo', width: 'mid' },
              { t: 'text', k: 'experts.title', label: 'Título' }
            ] },
            { t: 'textarea', k: 'experts.lead', label: 'Entradilla', rows: 4 },
            { t: 'textarea', k: 'experts.body', label: 'Texto', rows: 4 }
          ]
        },
        {
          h2: 'Pasos',
          fields: [
            { t: 'rep', k: 'experts.steps', label: 'Los pasos del proceso', itemLabel: 'Paso',
              title: function (o) { return (o.n ? o.n + ' · ' : '') + (o.title || 'Sin título'); },
              fields: [
                { t: 'row', fields: [
                  { t: 'text', k: 'n', label: 'Número', width: 'short', refresh: true },
                  { t: 'text', k: 'title', label: 'Título', refresh: true }
                ] },
                { t: 'textarea', k: 'text', label: 'Texto', rows: 2 }
              ] }
          ]
        },
        {
          h2: 'Acceso para registrados',
          fields: [
            { t: 'text', k: 'experts.loginPanel.title', label: 'Título' },
            { t: 'textarea', k: 'experts.loginPanel.text', label: 'Texto', rows: 3 },
            { t: 'text', k: 'experts.loginPanel.help', label: 'Línea de ayuda' }
          ]
        },
        {
          h2: 'Encabezado del directorio',
          fields: [
            { t: 'text', k: 'experts.directory.title', label: 'Título' },
            { t: 'textarea', k: 'experts.directory.text', label: 'Texto', rows: 3 }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'programa',
      label: 'Programa',
      title: 'Programa',
      lede: 'Los días y las sesiones. Se elige un día arriba y se editan sus sesiones debajo.',
      render: function () {
        var days = get('programme.days') || [];
        if (day >= days.length) day = 0;

        var tabs = '<div class="tabs">' + days.map(function (d, i) {
          return '<button type="button" data-act="day" data-i="' + i + '"' +
            ' aria-current="' + (i === day) + '">' +
            esc(d.label || 'Día ' + (i + 1)) + ' <span class="muted">· ' +
            esc((d.slots || []).length) + '</span></button>';
        }).join('') +
        '<button type="button" class="btn" data-act="add" data-list="programme.days">Añadir día</button>' +
        '</div>';

        var general =
          '<div class="card"><h2>Ajustes generales</h2>' +
            fieldsHtml([
              { t: 'textarea', k: 'programme.note', label: 'Aviso bajo el programa', rows: 4 },
              { t: 'text', k: 'programme.timezone', label: 'Zona horaria', width: 'mid',
                hint: 'La usa la exportación al calendario. Para Bilbao, <code>Europe/Madrid</code>.' },
              { t: 'rep', k: 'programme.groups', label: 'Grupos', itemLabel: 'Grupo',
                hint: 'Solo hacen falta si algún día se divide en itinerarios distintos.',
                title: function (o) { return o.label || o.id; },
                fields: [
                  { t: 'row', fields: [
                    { t: 'text', k: 'id', label: 'Identificador', width: 'short' },
                    { t: 'text', k: 'label', label: 'Nombre', refresh: true }
                  ] }
                ] }
            ], null) +
          '</div>';

        if (!days.length) return tabs + general;

        var base = 'programme.days.' + day;
        var dayCard =
          '<div class="card"><h2>' + esc(days[day].label || 'Día') + '</h2>' +
            fieldsHtml([
              { t: 'row', fields: [
                { t: 'text', k: 'label', label: 'Etiqueta', width: 'short' },
                { t: 'text', k: 'date', label: 'Fecha escrita', hint: 'Como se lee en la web: “Tuesday 6 October”.' },
                { t: 'text', k: 'dateISO', label: 'Fecha real', width: 'short',
                  hint: 'Formato <code>2026-10-06</code>. La usa el calendario.' }
              ] },
              { t: 'row', fields: [
                { t: 'text', k: 'id', label: 'Identificador', width: 'short' },
                { t: 'text', k: 'theme', label: 'Tema del día' }
              ] },
              { t: 'textarea', k: 'summary', label: 'Resumen', rows: 3 },
              { t: 'check', k: 'split', label: 'Este día se divide en grupos',
                hint: 'Al marcarlo, la web muestra un selector de grupo y cada sesión debe indicar a qué grupo pertenece.' }
            ], base) +
          '</div>';

        var slots =
          '<div class="card"><h2>Sesiones del día</h2>' +
            fieldsHtml([
              { t: 'rep', k: 'slots', label: '', itemLabel: 'Sesión',
                title: function (o) {
                  return (o.open ? 'Sin hora fija' : (o.time || '--:--')) + ' · ' + (o.title || 'Sin título');
                },
                fields: [
                  { t: 'text', k: 'title', label: 'Título', refresh: true },
                  { t: 'row', fields: [
                    { t: 'text', k: 'time', label: 'Hora de inicio', width: 'short', refresh: true,
                      hint: 'Formato 24h, <code>09:30</code>.' },
                    { t: 'text', k: 'end', label: 'Hora de fin', width: 'short',
                      hint: 'Opcional. Si se deja vacía, la sesión llega hasta la siguiente.' },
                    { t: 'select', k: 'group', label: 'Grupo', options: groupOptions }
                  ] },
                  { t: 'textarea', k: 'text', label: 'Descripción', rows: 2,
                    hint: 'Una frase. Opcional.' },
                  { t: 'text', k: 'venue', label: 'Lugar', hint: 'Opcional.' },
                  { t: 'row', fields: [
                    { t: 'check', k: 'feature', label: 'Destacar esta sesión' },
                    { t: 'check', k: 'open', label: 'Sin hora fija', refresh: true }
                  ] }
                ] }
            ], base) +
          '</div>';

        return tabs + dayCard + slots + general;
      }
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'expositores',
      label: 'Expositores',
      title: 'Expositores',
      lede: 'Las empresas del directorio. Cada una tiene su propia página en la web.',
      cards: [
        {
          plain: true,
          fields: [
            { t: 'note', kind: 'warn', html:
              '<p><b>Al añadir o eliminar una empresa hay que regenerar sus páginas.</b> ' +
              'Cambiar textos de una empresa que ya existe no lo necesita: basta con publicar. ' +
              'Pero una empresa nueva no tendrá su página hasta que alguien ejecute ' +
              '<code>node tools/build-exhibitors.js</code>. Avisa a quien lleve la parte técnica.</p>' +
              '<p class="muted"><b>Meetmaps ya está conectado.</b> Esta lista la ' +
              'reescribe la plataforma cada hora, así que lo que se edite aquí se ' +
              'perderá en el siguiente repaso. Para cambiar los datos de una ' +
              'empresa, se cambian EN MEETMAPS y llegan solos. Esta pantalla ' +
              'queda para mirar.</p>' }
          ]
        },
        {
          plain: true,
          fields: [
            { t: 'coll', k: 'exhibitors', itemLabel: 'Empresa',
              title: function (o) { return o.name || 'Empresa sin nombre'; },
              sub: function (o) {
                var cat = (STATE.exhibitorCategories || []).filter(function (c) { return c.id === o.category; })[0];
                return cat ? cat.label : 'sin categoría';
              },
              search: function (o) { return (o.name || '') + ' ' + (o.website || ''); },
              fields: [
                { t: 'row', fields: [
                  { t: 'text', k: 'name', label: 'Nombre', refresh: true },
                  { t: 'select', k: 'category', label: 'Categoría', options: categoryOptions, refresh: true }
                ] },
                { t: 'text', k: 'id', label: 'Identificador',
                  hint: 'Es el nombre de su página: <code>exhibitors/&lt;identificador&gt;.html</code>. ' +
                    'Cambiarlo en una empresa que ya existe rompe el enlace publicado; no tocar sin motivo.' },
                { t: 'image', k: 'logo', label: 'Logotipo',
                  hint: 'Lo baja el sync desde la plataforma. No hace falta subirlo a mano.' },
                { t: 'row', fields: [
                  { t: 'text', k: 'contactName', label: 'Persona de contacto' },
                  { t: 'text', k: 'contactRole', label: 'Cargo' }
                ] },
                { t: 'row', fields: [
                  { t: 'text', k: 'email', label: 'Email' },
                  { t: 'text', k: 'phone', label: 'Teléfono' }
                ] },
                { t: 'row', fields: [
                  { t: 'text', k: 'website', label: 'Web' },
                  { t: 'text', k: 'websiteLabel', label: 'Web, como se muestra' }
                ] },
                { t: 'textarea', k: 'address', label: 'Dirección', rows: 2 },
                { t: 'paras', k: 'paragraphs', label: 'Descripción', rows: 12,
                  hint: 'Una línea en blanco entre párrafos.' }
              ] }
          ]
        },
        {
          h2: 'Categorías del filtro',
          fields: [
            { t: 'rep', k: 'exhibitorCategories', label: '', itemLabel: 'Categoría',
              hint: 'Son los botones que filtran el directorio. La primera, <code>all</code>, ' +
                'es el botón “All” y conviene dejarla. Rara vez hay que tocar esto.',
              title: function (o) { return o.label || o.id; },
              fields: [
                { t: 'row', fields: [
                  { t: 'text', k: 'id', label: 'Identificador', width: 'mid' },
                  { t: 'text', k: 'label', label: 'Nombre visible', refresh: true }
                ] }
              ] }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'videos',
      label: 'Vídeos',
      title: 'Vídeos de ediciones anteriores',
      lede: 'Los vídeos que se ven bajo la presentación del destino.',
      cards: [
        {
          plain: true,
          fields: [
            { t: 'note', html: '<p>El vídeo no se sube aquí: se sube a YouTube y aquí se pone ' +
              'su <b>identificador</b>, que es lo que va detrás de <code>watch?v=</code> en la ' +
              'dirección. De <code>youtube.com/watch?v=kkrUeAfrWEY</code>, el identificador es ' +
              '<code>kkrUeAfrWEY</code>.</p><p>El reproductor solo se carga cuando alguien le ' +
              'da al play, así que la página va rápida y no se ponen cookies de YouTube a quien ' +
              'solo pasa por delante.</p>' },
            { t: 'rep', k: 'editions', label: 'Vídeos', itemLabel: 'Vídeo',
              title: function (o) { return o.title || 'Vídeo sin título'; },
              sub: function (o) { return o.youtubeId ? o.youtubeId : 'sin identificador'; },
              fields: [
                { t: 'text', k: 'title', label: 'Título', refresh: true },
                { t: 'text', k: 'youtubeId', label: 'Identificador de YouTube', width: 'mid',
                  refresh: true,
                  hint: 'Solo el identificador, no la dirección entera. Vacío, el vídeo no se dibuja.' },
                { t: 'textarea', k: 'caption', label: 'Pie', rows: 2 },
                { t: 'image', k: 'thumbnail', label: 'Imagen de portada',
                  hint: 'Opcional. Vacío, se usa la que tenga el vídeo en YouTube — que es lo ' +
                    'recomendable, porque así se cambia en un solo sitio. Para poner otra, súbela ' +
                    'a <code>assets/img/photos/</code> y escribe aquí su ruta. Apaisada, ' +
                    '1280×720 o mayor.' }
              ] }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'folletos',
      label: 'Folletos',
      title: 'Folletos',
      lede: 'Las publicaciones en inglés del destino, con su portada y su enlace.',
      cards: [
        {
          h2: 'Encabezado',
          fields: [
            { t: 'textarea', k: 'discover.intro', label: 'Texto de entrada', rows: 3 },
            { t: 'text', k: 'discover.issuuProfile', label: 'Perfil de Issuu',
              hint: 'Se enlaza como “todas las publicaciones”.' }
          ]
        },
        {
          plain: true,
          fields: [
            { t: 'coll', k: 'discover.brochures', itemLabel: 'Folleto',
              title: function (o) { return o.title || 'Folleto sin título'; },
              sub: function (o) { return o.issuu ? 'Issuu' : (o.pdf ? 'PDF' : 'sin enlace'); },
              search: function (o) { return (o.title || '') + ' ' + (o.subtitle || ''); },
              fields: [
                { t: 'text', k: 'title', label: 'Título', refresh: true },
                { t: 'text', k: 'subtitle', label: 'Subtítulo' },
                { t: 'text', k: 'id', label: 'Identificador', width: 'mid' },
                { t: 'image', k: 'cover', label: 'Portada',
                  hint: 'Se sube antes al repositorio, a <code>assets/img/brochures/</code>.' },
                { t: 'text', k: 'issuu', label: 'Enlace de Issuu', refresh: true,
                  hint: 'El enlace normal de Issuu. Se convierte solo en lector incrustado.' },
                { t: 'text', k: 'pdf', label: 'Enlace al PDF', refresh: true,
                  hint: 'Alternativa a Issuu: se ofrece como descarga. Con los dos vacíos, ' +
                    'la portada se ve pero no abre nada.' }
              ] }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    {
      id: 'contacto',
      label: 'Contacto y pie',
      title: 'Contacto y pie',
      lede: 'Las vías de contacto, los logotipos institucionales, las redes y el aviso legal.',
      cards: [
        {
          h2: 'Contacto',
          fields: [
            { t: 'textarea', k: 'site.contact.intro', label: 'Texto de entrada', rows: 3 },
            { t: 'rep', k: 'site.contact.channels', label: 'Vías de contacto', itemLabel: 'Vía',
              title: function (o) { return (o.title || 'Sin título') + ' · ' + (o.value || ''); },
              fields: [
                { t: 'row', fields: [
                  { t: 'text', k: 'title', label: 'Título', width: 'mid', refresh: true },
                  { t: 'text', k: 'note', label: 'Aclaración' }
                ] },
                { t: 'row', fields: [
                  { t: 'text', k: 'value', label: 'Lo que se ve', refresh: true },
                  { t: 'text', k: 'href', label: 'Enlace',
                    hint: 'Un email va como <code>mailto:…</code>; un teléfono, como <code>tel:+34…</code>.' }
                ] },
                { t: 'select', k: 'icon', label: 'Icono', width: 'mid', options: [
                  { value: 'mail', label: 'Sobre' },
                  { value: 'phone', label: 'Teléfono' },
                  { value: 'support', label: 'Soporte' }
                ] }
              ] }
          ]
        },
        {
          h2: 'Boletín',
          fields: [
            { t: 'note', html: '<p>Aquí no se pide ningún correo. El visitante marca qué es y ' +
              'va al formulario de Mailchimp que le corresponde, que es donde se piden los datos ' +
              'y donde queda el consentimiento. Si borras las dos direcciones, el bloque ' +
              'desaparece de la web.</p>' },
            { t: 'text', k: 'site.newsletter.title', label: 'Título' },
            { t: 'textarea', k: 'site.newsletter.text', label: 'Texto', rows: 3 },
            { t: 'row', fields: [
              { t: 'text', k: 'site.newsletter.audiences.0.label', label: 'Público 1 — nombre' },
              { t: 'text', k: 'site.newsletter.audiences.0.note', label: 'Público 1 — quiénes son' }
            ] },
            { t: 'text', k: 'site.newsletter.audiences.0.url', label: 'Público 1 — formulario' },
            { t: 'row', fields: [
              { t: 'text', k: 'site.newsletter.audiences.1.label', label: 'Público 2 — nombre' },
              { t: 'text', k: 'site.newsletter.audiences.1.note', label: 'Público 2 — quiénes son' }
            ] },
            { t: 'text', k: 'site.newsletter.audiences.1.url', label: 'Público 2 — formulario' },
            { t: 'textarea', k: 'site.newsletter.consent', label: 'Aviso bajo la elección', rows: 2 }
          ]
        },
        {
          h2: 'Pie de página',
          fields: [
            { t: 'textarea', k: 'site.footer.statement', label: 'Declaración', rows: 3 },
            { t: 'row', fields: [
              { t: 'text', k: 'site.footer.copyright', label: 'Aviso de copyright' },
              { t: 'text', k: 'site.footer.mail', label: 'Email del pie' }
            ] }
          ]
        },
        {
          h2: 'Logotipos institucionales',
          fields: [
            { t: 'rep', k: 'site.footer.institutions', label: '', itemLabel: 'Institución',
              title: function (o) { return o.name || 'Sin nombre'; },
              fields: [
                { t: 'text', k: 'name', label: 'Nombre', refresh: true },
                { t: 'image', k: 'file', label: 'Logotipo' },
                { t: 'text', k: 'href', label: 'Enlace' },
                { t: 'check', k: 'plain', label: 'Sin caja blanca detrás',
                  hint: 'Para logotipos que ya funcionan sobre fondo oscuro.' }
              ] }
          ]
        },
        {
          h2: 'Redes sociales',
          fields: [
            { t: 'rep', k: 'site.footer.social', label: '', itemLabel: 'Cuenta',
              title: function (o) { return o.handle || 'Cuenta sin nombre'; },
              fields: [
                { t: 'text', k: 'handle', label: 'Nombre de la cuenta', width: 'mid', refresh: true },
                { t: 'rep', k: 'links', label: 'Enlaces', itemLabel: 'Enlace',
                  title: function (o) { return o.label || 'Sin texto'; },
                  fields: [
                    { t: 'row', fields: [
                      { t: 'text', k: 'label', label: 'Texto', width: 'mid', refresh: true },
                      { t: 'text', k: 'href', label: 'Dirección' }
                    ] }
                  ] }
              ] }
          ]
        },
        {
          h2: 'Avisos legales',
          fields: [
            { t: 'rep', k: 'site.footer.legal', label: '', itemLabel: 'Aviso',
              hint: 'Mientras el destino empiece por <code>#</code>, el enlace no lleva a ninguna parte.',
              title: function (o) { return o.label || 'Sin texto'; },
              fields: [
                { t: 'row', fields: [
                  { t: 'text', k: 'label', label: 'Texto', refresh: true },
                  { t: 'text', k: 'href', label: 'Dirección' }
                ] }
              ] }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- */
    { id: 'publicar', label: 'Publicar', title: 'Publicar', lede: '', render: renderPublish }
  ];

  var day = 0; // the programme day being edited

  /* --- Publishing --------------------------------------------------------- */

  var saver = null;       // null = not probed yet, false = unavailable, true = ready
  var saverWhy = null;    // what the server said was missing, when it can say

  function renderPublish() {
    var changed = changedFiles().map(function (f) { return f.name; });

    var rows = FILES.map(function (f) {
      var on = changed.indexOf(f.name) !== -1;
      return '<tr><td><code>' + esc(f.name) + '</code></td>' +
        '<td><span class="tag tag--' + (on ? 'changed' : 'same') + '">' +
          (on ? 'modificado' : 'sin cambios') + '</span></td>' +
        '<td>' + (on
          ? '<button type="button" class="btn btn--tiny" data-act="download" data-file="' + esc(f.name) + '">Descargar</button>'
          : '') + '</td></tr>';
    }).join('');

    // The one-file panel carries a copy of the data taken when it was built.
    // Publishing from a stale copy would quietly undo whatever was changed in
    // the meantime, so it says so before, not after.
    var copyWarning = window.MBB_STANDALONE
      ? '<div class="notice notice--warn"><p><b>Esta es la versión de un solo archivo.</b> ' +
        'Lleva dentro una copia de los datos de la web tomada el día que se generó. ' +
        'Sirve para probar el panel y para preparar cambios.</p>' +
        '<p>Si la web se ha modificado desde entonces por otra vía, publicar desde aquí ' +
        'desharía esos cambios. Para trabajar del todo tranquilo, usa el panel de ' +
        '<code>/admin/</code> en la web.</p></div>'
      : '';

    var head = copyWarning + (changed.length
      ? '<div class="notice"><p><b>' + changed.length +
          (changed.length === 1 ? ' archivo ha cambiado.' : ' archivos han cambiado.') +
          '</b> Nada de esto está en la web todavía.</p></div>'
      : '<div class="notice notice--ok"><p>No hay cambios pendientes: la web ya está igual que este panel.</p></div>');

    var how;
    if (saver === true) {
      how = '<div class="card"><h2>Publicar en la web</h2>' +
        '<p>El servidor está preparado para guardar directamente.</p>' +
        '<div class="field field--mid"><label for="token">Contraseña de publicación</label>' +
          '<input type="password" id="token" autocomplete="current-password"></div>' +
        '<div class="actions">' +
          '<button type="button" class="btn btn--primary" data-act="save"' +
            (changed.length ? '' : ' disabled') + '>Publicar los cambios</button>' +
        '</div>' +
        '<p class="hint" id="save-msg"></p></div>';
    } else {
      var ayuda = saverHelp();
      how = '<div class="card"><h2>Publicar en la web</h2>' +
        (ayuda
          ? '<div class="notice notice--warn">' + ayuda +
            '<p class="muted">Con eso resuelto, este panel guardará directamente en el ' +
            'servidor y no habrá que descargar ni subir nada.</p></div>'
          : '') +
        '<div class="notice notice--warn">' +
          '<p><b>NO subas estos archivos por FTP a la web.</b> El servidor se ' +
          'publica solo desde el repositorio: cada media hora copia encima lo ' +
          'que hay en GitHub. Un archivo subido por FTP dura hasta el siguiente ' +
          'repaso y desaparece sin que nada avise — el registro dirá que todo ' +
          'ha ido bien.</p>' +
          '<p class="muted">Los cambios van al repositorio, y de ahí bajan solos ' +
          'a la web. No hace falta saber usar git: se hace desde la página de ' +
          'GitHub, arrastrando el archivo.</p>' +
        '</div>' +
        '<ol>' +
          '<li>Pulsa <b>Descargar los cambios</b>. El navegador guardará uno o varios archivos ' +
            '<code>.js</code> en tu carpeta de descargas.</li>' +
          '<li>Abre el repositorio en GitHub y entra en la carpeta ' +
            '<code>assets/js/data/</code>.</li>' +
          '<li>Pulsa <b>Add file → Upload files</b> y arrastra ahí los archivos ' +
            'descargados. GitHub reemplaza los que ya existen con el mismo nombre.</li>' +
          '<li>Abajo, pulsa <b>Commit changes</b>. Basta con dejar el texto que ' +
            'propone.</li>' +
          '<li>Espera al siguiente repaso del servidor —como mucho media hora— y ' +
            'recarga la web. Si tienes prisa, quien lleve la parte técnica puede ' +
            'lanzarlo a mano.</li>' +
        '</ol>' +
        '<div class="actions">' +
          '<button type="button" class="btn btn--primary" data-act="download-all"' +
            (changed.length ? '' : ' disabled') + '>Descargar los cambios</button>' +
        '</div>' +
        '<p class="hint">Se descargan de uno en uno. Si el navegador pregunta si permites ' +
          'varias descargas, hay que aceptar.</p></div>';
    }

    return head + how +
      '<div class="card"><h2>Archivos</h2>' +
        '<table class="files"><thead><tr><th>Archivo</th><th>Estado</th><th></th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table>' +
        '<p class="hint">Todos van a la carpeta <code>assets/js/data/</code> de la web.</p>' +
      '</div>';
  }

  function download(name) {
    var file = FILES.filter(function (f) { return f.name === name; })[0];
    if (!file) return;
    var blob = new Blob([emit(file, STATE)], { type: 'application/javascript' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function downloadAll() {
    var names = changedFiles().map(function (f) { return f.name; });
    names.forEach(function (n, i) {
      setTimeout(function () { download(n); }, i * 500);
    });
    // Downloaded is not published, so the panel stays "dirty" until the files
    // are actually on the server. Only the direct save clears it.
  }

  function probeSaver() {
    if (saver !== null) return;
    if (location.protocol === 'file:') {
      saver = false;
      saverWhy = 'file';
      return;
    }
    fetch('save.php?probe=1', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (j) {
        saver = !!(j && j.ready);
        // The server distinguishes the two halves it needs, so say which one
        // is missing rather than leaving someone to guess on a machine they
        // cannot inspect.
        if (!saver) {
          if (j && j.configured === false) saverWhy = 'password';
          else if (j && j.writable === false) saverWhy = 'permissions';
        }
        if (route() === 'publicar') render();
      })
      .catch(function () {
        // Either save.php is not there, or PHP is not running and the server
        // handed back the source instead of executing it.
        saver = false;
        saverWhy = 'nophp';
        if (route() === 'publicar') render();
      });
  }

  /** What to tell someone about to set this up, given what the probe found. */
  function saverHelp() {
    if (saverWhy === 'password') {
      return '<p><b>Falta la contraseña.</b> En el servidor, dentro de la carpeta ' +
        '<code>admin/</code>, crea un archivo llamado <code>admin-config.php</code> ' +
        'con este contenido, cambiando la contraseña por una larga:</p>' +
        '<pre>&lt;?php\nreturn \'pon-aqui-una-contrasena-larga\';</pre>';
    }
    if (saverWhy === 'permissions') {
      return '<p><b>La contraseña está puesta, pero el servidor no puede escribir.</b> ' +
        'Dale permiso de escritura a la carpeta <code>assets/js/data/</code> desde ' +
        'el panel del hosting y recarga esta página.</p>';
    }
    if (saverWhy === 'nophp') {
      return '<p><b>El servidor no ha respondido a <code>admin/save.php</code>.</b> ' +
        'O el archivo no está subido, o el hosting no ejecuta PHP.</p>';
    }
    if (saverWhy === 'file') {
      return '<p>Este panel está abierto desde el disco, no desde la web. ' +
        'El guardado directo solo funciona en <code>tu-web/admin/</code>.</p>';
    }
    return '';
  }

  function save() {
    var token = ($('token') || {}).value || '';
    var msg = $('save-msg');
    var payload = {};
    changedFiles().forEach(function (f) { payload[f.name] = emit(f, STATE); });

    if (!Object.keys(payload).length) return;
    msg.textContent = 'Publicando…';

    fetch('save.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token, files: payload })
    })
      .then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, body: j }; });
      })
      .then(function (res) {
        if (!res.ok || !res.body.ok) {
          msg.textContent = 'No se ha podido publicar: ' + (res.body.error || 'error desconocido');
          return;
        }
        // The server now holds what the panel holds, so this becomes the new
        // point of comparison.
        FILES.forEach(function (f) { BASELINE[f.name] = emit(f, STATE); });
        dirty = false;
        $('state').textContent = 'Publicado';
        $('state').dataset.dirty = 'false';
        render();
        $('save-msg').textContent = 'Publicado. Recarga la web para verlo.';
      })
      .catch(function () {
        msg.textContent = 'No se ha podido contactar con el servidor.';
      });
  }

  /* --- Router and rendering ----------------------------------------------- */

  function route() {
    var id = (location.hash || '').replace(/^#\/?/, '');
    return SCREENS.some(function (s) { return s.id === id; }) ? id : 'escritorio';
  }

  function renderMenu() {
    var here = route();
    $('menu').innerHTML = SCREENS.map(function (s) {
      var sep = s.id === 'publicar' ? '<hr>' : '';
      return sep + '<a href="#/' + s.id + '"' +
        (s.id === here ? ' aria-current="page"' : '') + '>' + esc(s.label) + '</a>';
    }).join('');
  }

  function render() {
    var screen = SCREENS.filter(function (s) { return s.id === route(); })[0];
    renderMenu();

    var body =
      '<h1>' + esc(screen.title) + '</h1>' +
      (screen.lede ? '<p class="lede">' + esc(screen.lede) + '</p>' : '');

    if (screen.render) {
      body += screen.render();
    } else {
      body += (screen.cards || []).map(function (c) {
        var inner = (c.h2 ? '<h2>' + esc(c.h2) + '</h2>' : '') + fieldsHtml(c.fields, null);
        return c.plain ? inner : '<div class="card">' + inner + '</div>';
      }).join('');
    }

    $('screen').innerHTML = body;
    if (route() === 'publicar') probeSaver();
  }

  /* --- Events ------------------------------------------------------------- */

  // Typing writes to state and nothing else, so the caret stays put.
  $('screen').addEventListener('input', function (e) {
    var el = e.target;
    if (el.dataset.act === 'search') {
      // Redrawing the whole screen would take the caret out of the search box,
      // so only the list of results is replaced.
      query[el.dataset.list] = el.value;
      refreshCollList(el.dataset.list, el.closest('.coll'));
      return;
    }
    if (!el.dataset.path) return;
    writeField(el);
  });

  $('screen').addEventListener('change', function (e) {
    var el = e.target;
    if (!el.dataset.path) return;
    writeField(el);
    if (el.dataset.refresh) render();
  });

  function writeField(el) {
    var path = el.dataset.path;
    var value;
    if (el.type === 'checkbox') {
      value = el.checked;
    } else if (el.dataset.paras) {
      value = el.value.split(/\n\s*\n/).map(function (s) { return s.trim(); })
        .filter(function (s) { return s; });
    } else {
      value = el.value;
    }
    set(path, value);

    // A new entry needs an identifier, and nobody filling in a company name
    // should have to know that. Derived once, while it is still empty — never
    // recomputed, because the identifier is the address of a published page.
    var m = /^(exhibitors|discover\.brochures)\.(\d+)\.(name|title)$/.exec(path);
    if (m) {
      var item = get(m[1] + '.' + m[2]);
      if (!String(item.id || '').trim()) item.id = slugify(value);
    }

    touch();
  }

  /** Redraw only a collection's result list, so the search box keeps focus. */
  function refreshCollList(path, wrap) {
    if (!wrap) return;
    var screen = SCREENS.filter(function (s) { return s.id === route(); })[0];
    // Find the collection definition on this screen by its path.
    var found = null;
    (function walk(fields, base) {
      (fields || []).forEach(function (f) {
        if (f.t === 'row') return walk(f.fields, base);
        var p = base ? base + '.' + f.k : f.k;
        if (f.t === 'coll' && p === path) found = f;
        if (f.t === 'rep') walk(f.fields, p);
      });
    })((screen.cards || []).reduce(function (all, c) { return all.concat(c.fields || []); }, []), null);
    if (!found) return;

    var holder = document.createElement('div');
    holder.innerHTML = collHtml(found, null);
    var fresh = holder.querySelector('.coll__items');
    var live = wrap.querySelector('.coll__items');
    if (fresh && live) live.innerHTML = fresh.innerHTML;
  }

  $('screen').addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.dataset.act;
    var list = el.dataset.list;
    var i = parseInt(el.dataset.i, 10);

    if (act === 'pick') { pick[list] = i; render(); return; }
    if (act === 'day') { day = i; render(); return; }

    if (act === 'add') {
      var arr = get(list);
      if (!Array.isArray(arr)) { set(list, []); arr = get(list); }
      arr.push(blankFor(list));
      pick[list] = arr.length - 1;
      query[list] = '';
      if (list === 'programme.days') day = arr.length - 1;
      touch();
      render();
      return;
    }

    if (act === 'del') {
      var target = get(list);
      var label = el.dataset.label || 'este elemento';
      if (!confirm('¿Eliminar “' + label + '”?\n\nNo se borra de la web hasta que publiques.')) return;
      target.splice(i, 1);
      if (pick[list] >= target.length) pick[list] = Math.max(0, target.length - 1);
      if (list === 'programme.days' && day >= target.length) day = Math.max(0, target.length - 1);
      touch();
      render();
      return;
    }

    if (act === 'up' || act === 'down') {
      var l = get(list);
      var j = act === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= l.length) return;
      var tmp = l[i]; l[i] = l[j]; l[j] = tmp;
      if (pick[list] === i) pick[list] = j;
      touch();
      render();
      return;
    }

    if (act === 'download') { download(el.dataset.file); return; }
    if (act === 'download-all') { downloadAll(); return; }
    if (act === 'save') { save(); return; }
  });

  window.addEventListener('hashchange', render);

  /* --- Go ----------------------------------------------------------------- */

  if (!SRC.site || !SRC.exhibitors) {
    $('screen').innerHTML =
      '<div class="notice"><p><b>No se han podido leer los datos de la web.</b> ' +
      'Este panel tiene que quedarse en la carpeta <code>admin/</code>, junto a ' +
      '<code>assets/</code>. Si se ha movido o copiado a otro sitio, vuelve a ponerlo en su lugar.</p></div>';
    return;
  }

  if (!location.hash) location.hash = '#/escritorio';
  render();
})();
