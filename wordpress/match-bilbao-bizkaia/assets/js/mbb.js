/* =============================================================================
   Match Bilbao Bizkaia — front-end behaviour
   -----------------------------------------------------------------------------
   Programme tabs, exhibitor filter, click-to-load video and the brochure modal.
   No dependencies; everything is scoped to the .mbb wrapper.
   ========================================================================== */

(function () {
  'use strict';

  var $all = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* --- Programme: views, itineraries and the calendar file ---------------- */
  function initProgramme() {
    var card = document.querySelector('.mbb .prog-card');
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
        panes.forEach(function (p) { p.hidden = p.dataset.pane !== btn.dataset.view; });
      });
    });

    /* --- the two itineraries --------------------------------------------- */
    var group = 'g1';

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
    // The programme travels in the page as JSON, so the file is built by the
    // same code the static site uses and the two produce identical results.
    var raw = document.getElementById('mbb-programme');
    if (!raw) return;

    var programme;
    try {
      programme = JSON.parse(raw.textContent);
    } catch (e) {
      return;
    }

    $all('[data-ics]', card).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var day = btn.dataset.ics;
        var text = buildIcs(programme, { day: day, group: group });
        var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'match-bilbao-bizkaia-2026' + (day === 'all' ? '' : '-' + day) + '.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    });
  }

  function buildIcs(programme, opts) {
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
  }

  /* --- Exhibitor filter --------------------------------------------------- */
  function initDirectory() {
    var grid = document.getElementById('ex-grid');
    if (!grid) return;

    var empty = document.getElementById('ex-empty');
    var count = document.getElementById('ex-count');
    var search = document.getElementById('ex-search');
    var tiles = $all('.logo-tile', grid);
    var filters = $all('.mbb .filter');
    var category = 'all';

    // Mirrors MBB_Template::search_key() in PHP, which built the data-name
    // attribute: lower case, accents removed.
    function fold(s) {
      var t = String(s == null ? '' : s).toLowerCase();
      return t.normalize ? t.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : t;
    }

    function apply() {
      // Category and search apply together, so a search runs inside the
      // category on screen rather than silently reaching outside it.
      var query = search ? fold(search.value.trim()) : '';
      var shown = 0;

      tiles.forEach(function (t) {
        var show =
          (category === 'all' || t.dataset.category === category) &&
          (!query || (t.dataset.name || '').indexOf(query) !== -1);
        t.hidden = !show;
        if (show) shown++;
      });

      if (empty) empty.hidden = shown !== 0;
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
      search.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && search.value) {
          search.value = '';
          apply();
        }
      });
    }

    apply();
  }

  /* --- Videos: load the player only when the visitor asks for it ---------- */
  function initVideos() {
    $all('.mbb [data-yt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var frame = btn.closest('.video__frame');
        frame.innerHTML =
          '<iframe src="https://www.youtube-nocookie.com/embed/' +
          encodeURIComponent(btn.dataset.yt) + '?autoplay=1&rel=0" ' +
          'title="Match Bilbao Bizkaia" allow="accelerometer; autoplay; ' +
          'clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
          'allowfullscreen></iframe>';
      });
    });
  }

  /* --- Brochure modal ------------------------------------------------------ */
  function initBrochures() {
    var modal = document.getElementById('mbb-modal');
    if (!modal) return;

    var title = document.getElementById('mbb-modal-title');
    var body = document.getElementById('mbb-modal-body');
    var foot = document.getElementById('mbb-modal-foot');
    var lastFocus = null;

    function esc(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function open(btn) {
      var d = btn.dataset;
      title.textContent = d.title || '';

      if (d.reader) {
        // Issuu readers are made to be embedded — show the brochure inline.
        body.innerHTML = '<iframe src="' + esc(d.reader) + '" title="' +
          esc(d.title) + '" allowfullscreen></iframe>';
      } else {
        // PDFs are hosted elsewhere and usually refuse framing: show a panel.
        var cover = btn.innerHTML;
        body.innerHTML =
          '<div class="preview"><div class="preview__cover">' + cover + '</div>' +
          '<div class="preview__copy"><h4>' + esc(d.title) + '</h4>' +
          '<p>' + esc(d.subtitle) + '</p>' +
          '<p class="preview__note">' + (d.pdf
            ? 'The document opens on the official tourism website, where you can read it online or download the PDF.'
            : 'No document has been linked to this brochure yet.') +
          '</p></div></div>';
      }

      var actions = '';
      if (d.issuu) {
        actions += '<a class="btn btn--outline btn--sm" href="' + esc(d.issuu) +
          '" target="_blank" rel="noopener">Read on Issuu</a>';
      }
      if (d.pdf) {
        if (!d.issuu) {
          actions += '<a class="btn btn--outline btn--sm" href="' + esc(d.pdf) +
            '" target="_blank" rel="noopener">Open in a new tab</a>';
        }
        actions += '<a class="btn btn--sm" href="' + esc(d.pdf) + '" download>Download PDF</a>';
      }
      foot.innerHTML = actions;

      lastFocus = document.activeElement;
      modal.dataset.open = 'true';
      document.body.classList.add('mbb-no-scroll');
      modal.querySelector('.modal__close').focus();
    }

    function close() {
      modal.dataset.open = 'false';
      body.innerHTML = '';
      document.body.classList.remove('mbb-no-scroll');
      if (lastFocus) lastFocus.focus();
    }

    $all('.mbb [data-title][data-subtitle]').forEach(function (btn) {
      if (!btn.classList.contains('brochure__cover')) return;
      btn.addEventListener('click', function () { open(btn); });
    });

    modal.querySelector('.modal__close').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.dataset.open === 'true') close();
    });
  }

  /* --- Reveal on scroll ---------------------------------------------------- */
  function initReveal() {
    var els = $all('.mbb [data-reveal]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* --- Image fallbacks ------------------------------------------------------ */
  function initImageFallbacks() {
    document.addEventListener('error', function (e) {
      var img = e.target;
      if (!img || img.tagName !== 'IMG' || !img.dataset.fallback) return;
      if (img.dataset.fallback === 'src') {
        var alt = img.dataset.srcAlt;
        delete img.dataset.srcAlt;
        if (alt) { img.src = alt; return; }
      }
      img.remove();
    }, true); // error events do not bubble
  }

  function boot() {
    initImageFallbacks();
    initProgramme();
    initDirectory();
    initVideos();
    initBrochures();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
