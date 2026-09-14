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
    var links = site.nav
      .map(function (n) {
        var href = /^#/.test(n.href) ? base + (base ? 'index.html' : '') + n.href : n.href;
        return '<li><a class="header__link" href="' + esc(href) + '">' + esc(n.label) + '</a></li>';
      })
      .join('');

    return (
      '<div class="shell shell--wide header__inner">' +
        '<a class="header__brand" href="' + esc(base || '') + (base ? 'index.html' : '#home') + '">' +
          '<img src="' + esc(base) + 'assets/img/brand/match-bilbao-bizkaia-wordmark.png" ' +
            'alt="Match Bilbao Bizkaia">' +
          '<span class="header__year">' + esc(site.event.edition) + '</span>' +
        '</a>' +
        '<nav class="header__nav" aria-label="Main"><ul class="header__links" id="nav-links">' +
          links +
        '</ul></nav>' +
        '<div class="header__actions">' +
          '<a class="btn btn--sm" href="' + esc(site.login.url) + '" data-login>' +
            esc(site.login.label) + '</a>' +
          '<button class="burger" type="button" aria-label="Open menu" ' +
            'aria-expanded="false" aria-controls="nav-links">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  };

  /* --- Hero -------------------------------------------------------------- */
  MBB.Hero = function (site) {
    var h = site.hero;

    var media = h.media && h.media.image
      ? '<img src="' + esc(h.media.image) + '" alt="" data-fallback="ph" ' +
        'data-label="[Insert hero image]">'
      : '<div class="ph">[Insert hero image]</div>';

    var ctas = h.ctas
      .map(function (c) {
        return '<a class="btn btn--lg' + (c.variant === 'ghost' ? ' btn--outline' : '') +
          '" href="' + esc(c.href) + '">' + esc(c.label) + '</a>';
      })
      .join('') +
      '<a class="btn btn--lg btn--outline" href="' + esc(site.login.url) + '" data-login>' +
      esc(site.login.label) + '</a>';

    var facts = h.facts
      .map(function (f) {
        return '<div class="hero__fact"><span class="v">' + esc(f.value) + '</span>' +
          '<span class="l">' + esc(f.label) + '</span></div>';
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
            '<div class="hero__ctas">' + ctas + '</div>' +
          '</div>' +
          '<div class="hero__media" data-reveal style="--d:100ms">' + media + '</div>' +
        '</div>' +
        '<div class="hero__facts" data-reveal>' + facts + '</div>' +
      '</div>'
    );
  };

  /* --- Section 2: event intro + programme -------------------------------- */
  MBB.EventIntro = function (intro, site) {
    var items = intro.highlights
      .map(function (h) {
        return '<div class="pillar"><h3>' + esc(h.title) + '</h3><p>' + esc(h.text) + '</p></div>';
      })
      .join('');

    return (
      '<div class="section-head" data-reveal>' +
        '<h2 class="h-1">' + esc(intro.title) + '</h2>' +
        '<p class="lead measure">' + esc(intro.lead) + '</p>' +
        '<p style="margin-top:1.5rem"><a class="btn" href="' + esc(site.event.calendarUrl) +
          '" target="_blank" rel="noopener">Add to calendar</a></p>' +
      '</div>' +
      '<div class="pillars" data-reveal style="--d:100ms">' + items + '</div>'
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
  MBB.Programme = function (programme) {
    var days = programme.days;

    /* --- shared pieces -------------------------------------------------- */

    function slotItem(s) {
      // A line with nothing but a time and a title is a transfer or a meeting
      // point; it does not need the room a described session needs.
      var brief = !s.text && !s.venue;
      return (
        '<li class="tl-item' + (s.feature ? ' tl-item--feature' : '') +
          (brief ? ' tl-item--brief' : '') + '"' +
          (s.group ? ' data-group="' + esc(s.group) + '"' : '') + '>' +
          '<span class="tl-item__time' + (s.open ? ' tl-item__time--open' : '') + '">' +
            (s.open ? 'Flight times' : esc(s.time)) +
          '</span>' +
          '<div class="tl-item__body">' +
            '<h4>' + esc(s.title) + '</h4>' +
            (s.text ? '<p>' + esc(s.text) + '</p>' : '') +
            (s.venue ? '<span class="tl-item__venue">' + esc(s.venue) + '</span>' : '') +
          '</div>' +
        '</li>'
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
            '<ol class="timeline">' + d.slots.map(slotItem).join('') + '</ol>' +
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
    // Three moments per day: the ones marked as the highlights of that day,
    // falling back to the first slots when a day has none.
    var overview = days
      .map(function (d) {
        // Start from the moments marked as the highlights of the day, then top
        // up with the earliest slots that have a time — a day whose highlight
        // is the evening should not be summarised by its transfers.
        var chosen = [];
        d.slots.forEach(function (s, i) { if (s.feature) chosen.push(i); });
        d.slots.forEach(function (s, i) {
          if (chosen.length < 3 && !s.feature && !s.open) chosen.push(i);
        });
        if (!chosen.length) d.slots.forEach(function (s, i) { chosen.push(i); });

        var seen = {};
        var lines = chosen
          .sort(function (a, b) { return a - b; })
          .slice(0, 3)
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

        return (
          '<li class="ov-day">' +
            '<p class="ov-day__date">' + esc(d.date) + '</p>' +
            '<h3 class="ov-day__theme">' + esc(d.theme) + '</h3>' +
            '<p class="ov-day__text">' + esc(d.summary) + '</p>' +
            '<ul class="ov-day__list">' + lines + '</ul>' +
            (d.split ? '<p class="ov-day__split">Two itineraries</p>' : '') +
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
          '<button class="btn btn--sm" type="button" data-ics="all">' +
            ICONS.calendar + 'Add the full programme' +
          '</button>' +
        '</div>' +

        '<div class="prog__pane" data-pane="detail" hidden>' +
          '<div class="prog__tabs" role="tablist" aria-label="Programme days">' + tabs + '</div>' +
          panels +
        '</div>' +

        '<div class="prog__pane" data-pane="overview">' +
          '<ol class="prog__overview">' + overview + '</ol>' +
        '</div>' +

        '<p class="prog__note">' + esc(programme.note) + '</p>' +
      '</div>'
    );
  };

  /* --- Presentation of Bilbao -------------------------------------------- */
  MBB.Presentation = function (p) {
    var paras = p.paragraphs.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');

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

    return (
      '<div class="section-head section-head--center" data-reveal>' +
        '<h2 class="h-1">Match Bilbao Bizkaia Latest Editions</h2>' +
        '<p>A look back at how the event brings the destination and the ' +
        'international travel trade together.</p>' +
      '</div>' +
      '<div class="videos">' + cards + '</div>'
    );
  };

  /* --- Meet BB's Experts -------------------------------------------------- */
  MBB.Experts = function (e, site) {
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
      '<div class="section-head section-head--center" data-reveal>' +
        '<h2 class="h-1">' + esc(e.title) + '</h2>' +
        '<p class="lead">' + esc(e.lead) + '</p>' +
        '<p>' + esc(e.body) + '</p>' +
      '</div>' +
      '<div class="steps" data-reveal>' + steps + '</div>' +
      '<div class="login-band" data-reveal>' +
        '<div>' +
          '<h3>' + esc(e.loginPanel.title) + '</h3>' +
          '<p>' + esc(e.loginPanel.text) + '</p>' +
          '<small>' + esc(e.loginPanel.help) + '</small>' +
        '</div>' +
        '<a class="btn btn--lg btn--light" href="' + esc(site.login.url) + '" data-login>' +
          esc(site.login.label) + '</a>' +
      '</div>'
    );
  };

  /* --- Exhibitors: filters + full-bleed logo grid ------------------------- */
  MBB.Directory = function (exhibitors, categories, copy) {
    var counts = {};
    exhibitors.forEach(function (x) { counts[x.category] = (counts[x.category] || 0) + 1; });

    var filters = categories
      .map(function (c, i) {
        if (c.id !== 'all' && !counts[c.id]) return '';
        return (
          '<button class="filter" type="button" data-filter="' + esc(c.id) + '" ' +
            'aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' + esc(c.label) + '</button>'
        );
      })
      .join('');

    return (
      '<div class="directory" id="exhibitors">' +
        '<div class="section-head section-head--center" data-reveal>' +
          '<h2 class="h-1">' + esc(copy.title) + '</h2>' +
          '<p>' + esc(copy.text) + '</p>' +
        '</div>' +
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
          'index.html#exhibitors">See more exhibitors &gt; &gt;</a></p>' +
      '</div>' +
      '<div class="shell shell--wide"><div class="ex-related">' + relatedTiles + '</div></div>' +
      '<div class="ex-back"><a class="btn btn--outline btn--sm" href="' + esc(base) +
        'index.html#exhibitors">Back to the directory</a></div>'
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
          '<h4>' + esc(b.title) + '</h4>' +
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
          '<p>' + esc(nl.text) + '</p></div>' +
        '<div data-reveal style="--d:80ms">' +
          '<form class="nl-form" id="nl-form" novalidate>' +
            '<label class="sr-only" for="nl-email">Email address</label>' +
            '<input id="nl-email" type="email" name="email" placeholder="your@company.com" required>' +
            '<button class="btn" type="submit">Subscribe</button>' +
          '</form>' +
          '<p class="nl-status" id="nl-status" role="status"></p>' +
          '<p class="nl-consent">' + esc(nl.consent) + '</p>' +
        '</div>' +
      '</div>'
    );
  };

  /* --- Footer -------------------------------------------------------------- */
  MBB.Footer = function (site, opts) {
    opts = opts || {};
    var base = opts.base || '';
    var home = base ? base + 'index.html' : '';
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

    var legal = f.legal
      .map(function (l) { return '<a href="' + esc(l.href) + '">' + esc(l.label) + '</a>'; })
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
          '<div><h4>Navigate</h4><ul>' + navLinks +
            '<li><a href="' + esc(site.login.url) + '" data-login>' + esc(site.login.label) +
            '</a></li></ul></div>' +
          '<div><h4>Event</h4><ul>' +
            '<li><a href="' + esc(home) + '#event">Programme</a></li>' +
            '<li><a href="' + esc(home) + '#presentation">Presentation of Bilbao</a></li>' +
            '<li><a href="' + esc(home) + '#exhibitors">Exhibitors</a></li>' +
            '<li><a href="' + esc(home) + '#discover">Brochures</a></li>' +
          '</ul></div>' +
          '<div><h4>Follow the destination</h4>' + social + '</div>' +
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
