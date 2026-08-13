/* =============================================================================
   COMPONENTS
   -----------------------------------------------------------------------------
   Each function returns an HTML string for one section. They are pure: data in,
   markup out. Swapping this file for React/Vue components is a one-to-one
   translation — the data contracts stay identical.
   ========================================================================== */

window.MBB = window.MBB || {};

(function (MBB) {
  'use strict';

  /* --- helpers ----------------------------------------------------------- */
  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  var ICONS = {
    arrow: '<svg class="ico" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    external: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3h7v7M13 3 6.5 9.5M11 10.5V13H3V5h2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    download: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M2.5 13h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="m10.5 10.5 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.5v11l9-5.5-9-5.5Z"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="3.25" y="7" width="9.5" height="7" rx="1.6" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.5"/></svg>',
    mail: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="m2.5 5 5.5 4 5.5-4" stroke="currentColor" stroke-width="1.4"/></svg>',
    support: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 5.5v3M8 10.6v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    chat: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.5 8.5c0 2.5-2.5 4.5-5.5 4.5-.7 0-1.4-.1-2-.3L3 13.5l.8-2.4A4.3 4.3 0 0 1 2.5 8.5C2.5 6 5 4 8 4s5.5 2 5.5 4.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    office: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 13.5V4.2L8 2l5.5 2.2v9.3M6 13.5V9h4v4.5" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>'
  };

  MBB.icons = ICONS;

  /* --- Navbar ------------------------------------------------------------ */
  MBB.Navbar = function (site) {
    var links = site.nav
      .map(function (n) {
        return (
          '<li><a class="nav__link" href="' + esc(n.href) + '">' + esc(n.label) + '</a></li>'
        );
      })
      .join('');

    return (
      '<div class="shell nav__inner">' +
        '<a class="nav__brand" href="#home" aria-label="Match Bilbao Bizkaia 2026 — home">' +
          '<img src="assets/img/brand/match-bilbao-bizkaia-wordmark.png" alt="Match Bilbao Bizkaia">' +
          '<span class="nav__brand-year">' + esc(site.event.edition) + '</span>' +
        '</a>' +
        '<nav aria-label="Main"><ul class="nav__links" id="nav-links">' + links + '</ul></nav>' +
        '<div class="nav__actions">' +
          '<a class="btn btn--dark btn--sm" href="' + esc(site.login.url) + '" data-login>' +
            ICONS.lock.replace('<svg', '<svg class="ico"') + esc(site.login.label) +
          '</a>' +
          '<button class="nav__burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  };

  /* --- Hero -------------------------------------------------------------- */
  MBB.Hero = function (site) {
    var h = site.hero;

    var media = '';
    if (h.media && h.media.video) {
      media =
        '<video autoplay muted loop playsinline poster="' + esc(h.media.image) + '">' +
          '<source src="' + esc(h.media.video) + '" type="video/mp4">' +
        '</video>';
    } else if (h.media && h.media.image) {
      // Fails silently to the gradient backdrop if the file is not present yet.
      media =
        '<img src="' + esc(h.media.image) + '" alt="" aria-hidden="true" ' +
        'onerror="this.remove()">';
    }

    var ctas = h.ctas
      .map(function (c) {
        return '<a class="btn btn--' + esc(c.variant) + ' btn--lg" href="' + esc(c.href) + '">' +
          esc(c.label) + (c.variant === 'primary' ? ICONS.arrow : '') + '</a>';
      })
      .join('');

    ctas +=
      '<a class="btn btn--ghost btn--lg" href="' + esc(site.login.url) + '" data-login>' +
      esc(site.login.label) + '</a>';

    var facts = h.facts
      .map(function (f) {
        return (
          '<div class="hero__fact">' +
            '<span class="v">' + esc(f.value) + '</span>' +
            '<span class="l">' + esc(f.label) + '</span>' +
          '</div>'
        );
      })
      .join('');

    return (
      '<div class="hero__bg">' + media + '</div>' +
      '<div class="hero__scrim"></div>' +
      '<div class="hero__grid"></div>' +
      '<div class="shell hero__inner">' +
        '<p class="hero__kicker" data-reveal><span class="dot"></span>' + esc(h.kicker) + '</p>' +
        '<h1 class="h-display hero__title" data-reveal style="--d:80ms">' +
          esc(h.title) + '<span class="year">' + esc(h.titleYear) + '</span>' +
        '</h1>' +
        '<p class="hero__subtitle" data-reveal style="--d:160ms">' + esc(h.subtitle) + '</p>' +
        '<p class="hero__lead" data-reveal style="--d:220ms">' + esc(h.lead) + '</p>' +
        '<div class="hero__ctas" data-reveal style="--d:280ms">' + ctas + '</div>' +
      '</div>' +
      '<div class="hero__facts">' +
        '<div class="shell">' +
          '<p class="hero__scroll">Scroll</p>' +
          '<div class="hero__facts-grid">' + facts + '</div>' +
        '</div>' +
      '</div>'
    );
  };

  /* --- Section 2: intro + programme + presentation + editions ------------ */
  MBB.EventIntro = function (intro, site) {
    var items = intro.highlights
      .map(function (h) {
        return (
          '<div class="highlight">' +
            '<span class="highlight__mark"></span>' +
            '<div><h3>' + esc(h.title) + '</h3><p>' + esc(h.text) + '</p></div>' +
          '</div>'
        );
      })
      .join('');

    return (
      '<div class="intro-grid">' +
        '<div data-reveal>' +
          '<p class="eyebrow">' + esc(intro.eyebrow) + '</p>' +
          '<h2 class="h-1">' + esc(intro.title) + '</h2>' +
          '<hr class="rule">' +
          '<p class="lead">' + esc(intro.lead) + '</p>' +
          '<a class="btn btn--outline" href="' + esc(site.event.calendarUrl) + '" target="_blank" rel="noopener">' +
            'Add to calendar' + ICONS.arrow +
          '</a>' +
        '</div>' +
        '<div class="highlights" data-reveal style="--d:120ms">' + items + '</div>' +
      '</div>'
    );
  };

  MBB.Programme = function (programme) {
    var tabs = programme.days
      .map(function (d, i) {
        return (
          '<button class="prog__tab" type="button" role="tab" ' +
            'id="tab-' + esc(d.id) + '" aria-controls="panel-' + esc(d.id) + '" ' +
            'aria-selected="' + (i === 0 ? 'true' : 'false') + '" ' +
            'tabindex="' + (i === 0 ? '0' : '-1') + '">' +
            '<span class="d">' + esc(d.label) + '</span>' +
            '<span class="t">' + esc(d.date) + '</span>' +
          '</button>'
        );
      })
      .join('');

    var panels = programme.days
      .map(function (d, i) {
        var slots = d.slots
          .map(function (s) {
            return (
              '<li class="tl-item' + (s.feature ? ' tl-item--feature' : '') + '" ' +
                'data-tag="' + esc(s.tag || 'default') + '">' +
                '<span class="tl-item__dot" aria-hidden="true"></span>' +
                '<span class="tl-item__time">' + esc(s.time) + '</span>' +
                '<div class="tl-item__body">' +
                  '<h4>' + esc(s.title) + '</h4>' +
                  (s.text ? '<p>' + esc(s.text) + '</p>' : '') +
                  (s.venue ? '<span class="tl-item__venue">' + esc(s.venue) + '</span>' : '') +
                '</div>' +
              '</li>'
            );
          })
          .join('');

        return (
          '<div class="prog__panel" role="tabpanel" id="panel-' + esc(d.id) + '" ' +
            'aria-labelledby="tab-' + esc(d.id) + '"' + (i === 0 ? '' : ' hidden') + '>' +
            '<p class="prog__theme">' + esc(d.theme) + '</p>' +
            '<ol class="timeline">' + slots + '</ol>' +
          '</div>'
        );
      })
      .join('');

    return (
      '<div class="programme" data-reveal>' +
        '<div class="section-head">' +
          '<p class="eyebrow">Event programme</p>' +
          '<h2 class="h-2">Three days, one clear agenda</h2>' +
          '<p class="lead">' + esc(programme.intro) + '</p>' +
        '</div>' +
        '<div class="prog__tabs" role="tablist" aria-label="Programme days">' + tabs + '</div>' +
        panels +
        '<p class="prog__note">' + esc(programme.note) + '</p>' +
      '</div>'
    );
  };

  MBB.Presentation = function (p) {
    var paras = p.paragraphs
      .map(function (t) { return '<p>' + esc(t) + '</p>'; })
      .join('');

    var tiles = p.media
      .map(function (m) {
        var isPlaceholder = /^\[/.test(m.caption);
        if (isPlaceholder) {
          return '<div class="mosaic__tile"><div class="ph">' + esc(m.caption) + '</div></div>';
        }
        return (
          '<figure class="mosaic__tile" style="margin:0">' +
            '<img src="' + esc(m.file) + '" alt="' + esc(m.caption) + '" loading="lazy">' +
            '<figcaption class="mosaic__cap">' + esc(m.caption) + '</figcaption>' +
          '</figure>'
        );
      })
      .join('');

    var pillars = p.pillars
      .map(function (pl, i) {
        return (
          '<div class="pillar">' +
            '<p class="pillar__n">0' + (i + 1) + '</p>' +
            '<h3>' + esc(pl.title) + '</h3>' +
            '<p>' + esc(pl.text) + '</p>' +
          '</div>'
        );
      })
      .join('');

    return (
      '<div class="present-grid">' +
        '<div class="present__copy" data-reveal>' +
          '<p class="eyebrow">' + esc(p.eyebrow) + '</p>' +
          '<h2 class="h-1">' + esc(p.title) + '</h2>' +
          '<hr class="rule">' +
          paras +
        '</div>' +
        '<div class="mosaic" data-reveal style="--d:120ms">' + tiles + '</div>' +
      '</div>' +
      '<div class="pillars" data-reveal>' + pillars + '</div>'
    );
  };

  MBB.Editions = function (editions) {
    var cards = editions
      .map(function (v, i) {
        var frame;
        if (v.youtubeId) {
          var thumb = v.thumbnail ||
            'https://i.ytimg.com/vi/' + encodeURIComponent(v.youtubeId) + '/maxresdefault.jpg';
          frame =
            '<img src="' + esc(thumb) + '" alt="" loading="lazy" onerror="this.remove()">' +
            '<button class="video-card__play" type="button" data-yt="' + esc(v.youtubeId) + '" ' +
              'aria-label="Play: ' + esc(v.title) + '">' + ICONS.play + '</button>';
        } else {
          frame =
            '<button class="video-card__play" type="button" disabled aria-label="Video not available yet">' +
              ICONS.play + '</button>' +
            '<span class="video-card__ph">[Insert YouTube video ' + (i + 1) + ']</span>';
        }

        return (
          '<article class="video-card" data-reveal style="--d:' + i * 90 + 'ms">' +
            '<div class="video-card__frame">' + frame + '</div>' +
            '<div class="video-card__meta">' +
              '<h3>' + esc(v.title) + '</h3>' +
              '<p>' + esc(v.caption) + '</p>' +
            '</div>' +
          '</article>'
        );
      })
      .join('');

    return (
      '<div class="section-head" data-reveal>' +
        '<p class="eyebrow">In pictures</p>' +
        '<h2 class="h-1">Match Bilbao Bizkaia latest editions</h2>' +
        '<p class="lead">A look back at how the event brings the destination and ' +
        'the international trade together.</p>' +
      '</div>' +
      '<div class="videos">' + cards + '</div>'
    );
  };

  /* --- Section 3: Meet BB's Experts -------------------------------------- */
  MBB.Experts = function (e, site) {
    var steps = e.steps
      .map(function (s) {
        return (
          '<div class="step">' +
            '<p class="step__n">' + esc(s.n) + '</p>' +
            '<h3>' + esc(s.title) + '</h3>' +
            '<p>' + esc(s.text) + '</p>' +
          '</div>'
        );
      })
      .join('');

    return (
      '<div class="experts-grid">' +
        '<div data-reveal>' +
          '<p class="eyebrow">' + esc(e.eyebrow) + '</p>' +
          '<h2 class="h-1">' + esc(e.title) + '</h2>' +
          '<hr class="rule">' +
          '<p class="lead">' + esc(e.lead) + '</p>' +
          '<p>' + esc(e.body) + '</p>' +
        '</div>' +
        '<div class="steps" data-reveal style="--d:120ms">' + steps + '</div>' +
      '</div>' +
      '<div class="login-panel" data-reveal>' +
        '<div>' +
          '<h3>' + esc(e.loginPanel.title) + '</h3>' +
          '<p>' + esc(e.loginPanel.text) + '</p>' +
          '<span class="login-panel__help">' + esc(e.loginPanel.help) + '</span>' +
        '</div>' +
        '<a class="btn btn--primary btn--lg" href="' + esc(site.login.url) + '" data-login>' +
          ICONS.lock.replace('<svg', '<svg class="ico"') + esc(site.login.label) +
        '</a>' +
      '</div>'
    );
  };

  MBB.Directory = function (exhibitors, categories, copy) {
    var counts = {};
    exhibitors.forEach(function (x) {
      counts[x.category] = (counts[x.category] || 0) + 1;
    });

    var filters = categories
      .map(function (c, i) {
        var n = c.id === 'all' ? exhibitors.length : counts[c.id] || 0;
        if (!n) return '';
        return (
          '<button class="filter" type="button" data-filter="' + esc(c.id) + '" ' +
            'aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
            esc(c.label) + '<span class="n">' + n + '</span>' +
          '</button>'
        );
      })
      .join('');

    return (
      '<div class="directory">' +
        '<div class="section-head" data-reveal>' +
          '<p class="eyebrow">Exhibitors</p>' +
          '<h2 class="h-2">' + esc(copy.title) + '</h2>' +
          '<p class="lead">' + esc(copy.text) + '</p>' +
        '</div>' +
        '<div class="directory__bar" data-reveal>' +
          '<div class="filters" role="group" aria-label="Filter exhibitors by category">' +
            filters +
          '</div>' +
          '<div class="search">' + ICONS.search +
            '<label class="sr-only" for="ex-search">Search exhibitors</label>' +
            '<input id="ex-search" type="search" placeholder="Search exhibitors…" autocomplete="off">' +
          '</div>' +
        '</div>' +
        '<div class="ex-grid" id="ex-grid" aria-live="polite"></div>' +
        '<p class="directory__empty" id="ex-empty" hidden>No exhibitors match your search.</p>' +
        '<p class="directory__count" id="ex-count"></p>' +
      '</div>'
    );
  };

  MBB.ExhibitorCard = function (x, categories) {
    var cat = categories.filter(function (c) { return c.id === x.category; })[0];
    var initials = x.name
      .replace(/[^A-Za-z\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w[0].toUpperCase(); })
      .join('');

    var logo = x.logo
      ? '<img src="' + esc(x.logo) + '" alt="' + esc(x.name) + ' logo" loading="lazy" ' +
        'data-fallback="mark" data-initials="' + esc(initials) + '">'
      : '<span class="ex-card__mark">' + esc(initials) + '</span>';

    var link = x.website
      ? '<a class="link-arrow" href="' + esc(x.website) + '" target="_blank" rel="noopener">' +
        'View profile' + ICONS.arrow + '</a>'
      : '<span class="link-arrow" style="color:var(--ink-4)">Profile coming soon</span>';

    return (
      '<article class="ex-card" data-category="' + esc(x.category) + '" ' +
        'data-name="' + esc(x.name.toLowerCase()) + '">' +
        '<div class="ex-card__logo">' + logo + '</div>' +
        '<div class="ex-card__body">' +
          '<p class="ex-card__cat">' + esc(cat ? cat.label : x.category) + '</p>' +
          '<h3 class="ex-card__name">' + esc(x.name) + '</h3>' +
          '<p class="ex-card__desc">' + esc(x.description) + '</p>' +
          '<div class="ex-card__foot">' + link + '</div>' +
        '</div>' +
      '</article>'
    );
  };

  /* --- Section 4: Discover ----------------------------------------------- */

  /**
   * Branded stand-in for a brochure cover that has not been supplied yet.
   * Keeps the gallery visually complete and clearly signals what is missing.
   */
  MBB.CoverPlaceholder = function (title) {
    return (
      '<div class="cover-ph">' +
        '<span class="cover-ph__brand">Bilbao Bizkaia</span>' +
        '<span class="cover-ph__title">' + esc(title) + '</span>' +
        '<span class="cover-ph__note">[Insert brochure cover]</span>' +
      '</div>'
    );
  };

  /**
   * Modal preview shown for brochures that are published as a PDF.
   * (Issuu-hosted brochures are embedded directly instead — see main.js.)
   */
  MBB.BrochurePreview = function (b) {
    var cover = b.cover
      ? '<img src="' + esc(b.cover) + '" alt="' + esc(b.title) + ' brochure cover" ' +
        'data-fallback="cover" data-title="' + esc(b.title) + '">'
      : MBB.CoverPlaceholder(b.title);

    return (
      '<div class="preview">' +
        '<div class="preview__cover">' + cover + '</div>' +
        '<div class="preview__copy">' +
          '<h4>' + esc(b.title) + '</h4>' +
          '<p>' + esc(b.subtitle) + '</p>' +
          '<p class="preview__note">Published by Visit Biscay. The document ' +
          'opens on the official tourism website, where you can read it online ' +
          'or download the PDF.</p>' +
        '</div>' +
      '</div>'
    );
  };

  MBB.Discover = function (d) {
    var cards = d.brochures
      .map(function (b, i) {
        // The cover file is optional: until the real artwork is dropped into
        // assets/img/brochures/, a branded placeholder cover is shown instead.
        var cover = b.cover
          ? '<img src="' + esc(b.cover) + '" alt="' + esc(b.title) + ' brochure cover" ' +
            'loading="lazy" data-fallback="cover" data-title="' + esc(b.title) + '">'
          : MBB.CoverPlaceholder(b.title);

        var dl = b.pdf
          ? '<a class="brochure__dl" href="' + esc(b.pdf) + '" target="_blank" rel="noopener" ' +
            'download>' + ICONS.download + 'Download PDF</a>'
          : '<span class="brochure__dl" style="opacity:.55">[Insert PDF link]</span>';

        return (
          '<article class="brochure" data-reveal style="--d:' + (i % 4) * 70 + 'ms">' +
            '<button class="brochure__cover" type="button" data-brochure="' + esc(b.id) + '" ' +
              'aria-label="View brochure: ' + esc(b.title) + '">' +
              cover +
              '<span class="brochure__view">View brochure</span>' +
            '</button>' +
            '<div class="brochure__meta">' +
              '<h3>' + esc(b.title) + '</h3>' +
              '<p>' + esc(b.subtitle) + '</p>' +
              '<div class="brochure__links">' + dl + '</div>' +
            '</div>' +
          '</article>'
        );
      })
      .join('');

    return (
      '<div class="section-head" data-reveal>' +
        '<p class="eyebrow">Destination library</p>' +
        '<h2 class="h-1">Discover Bilbao Bizkaia</h2>' +
        '<p class="lead">' + esc(d.intro) + '</p>' +
      '</div>' +
      '<div class="brochures">' + cards + '</div>'
    );
  };

  /* --- Section 5: Contact & footer --------------------------------------- */
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
      '<div class="contact-grid">' +
        '<div data-reveal>' +
          '<p class="eyebrow">Contact</p>' +
          '<h2 class="h-1">Let’s talk</h2>' +
          '<hr class="rule">' +
          '<p class="lead">' + esc(site.contact.intro) + '</p>' +
        '</div>' +
        '<div class="channels" data-reveal style="--d:120ms">' + channels + '</div>' +
      '</div>' +
      '<div class="newsletter">' +
        '<div data-reveal>' +
          '<h3>' + esc(nl.title) + '</h3>' +
          '<p>' + esc(nl.text) + '</p>' +
        '</div>' +
        '<div data-reveal style="--d:100ms">' +
          '<form class="nl-form" id="nl-form" novalidate>' +
            '<label class="sr-only" for="nl-email">Email address</label>' +
            '<input id="nl-email" type="email" name="email" placeholder="your@company.com" required>' +
            '<button class="btn btn--primary" type="submit">Subscribe' + ICONS.arrow + '</button>' +
          '</form>' +
          '<p class="nl-status" id="nl-status" role="status"></p>' +
          '<p class="nl-consent">' + esc(nl.consent) + '</p>' +
        '</div>' +
      '</div>'
    );
  };

  MBB.Footer = function (site) {
    var f = site.footer;

    var navLinks = site.nav
      .map(function (n) { return '<li><a href="' + esc(n.href) + '">' + esc(n.label) + '</a></li>'; })
      .join('');

    var social = f.social
      .map(function (s) {
        return (
          '<p class="footer__handle">' + esc(s.handle) + '</p>' +
          '<ul>' + s.links.map(function (l) {
            return '<li><a href="' + esc(l.href) + '" target="_blank" rel="noopener">' +
              esc(l.label) + '</a></li>';
          }).join('') + '</ul>'
        );
      })
      .join('');

    var legal = f.legal
      .map(function (l) { return '<a href="' + esc(l.href) + '">' + esc(l.label) + '</a>'; })
      .join('');

    var insts = f.institutions
      .map(function (i) {
        return (
          '<a href="' + esc(i.href) + '" target="_blank" rel="noopener" aria-label="' + esc(i.name) + '">' +
            '<img src="' + esc(i.file) + '" alt="' + esc(i.name) + '" loading="lazy">' +
          '</a>'
        );
      })
      .join('');

    return (
      // Institutional logo band — kept on a light ground so the official marks
      // keep their own colours, as required by their brand guidelines.
      '<div class="footer__insts">' +
        '<div class="shell footer__insts-row">' +
          '<span class="footer__insts-label">In cooperation with</span>' +
          '<div class="footer__insts-logos">' + insts + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="shell">' +
        '<div class="footer__top">' +
          '<div class="footer__brand">' +
            '<img src="assets/img/brand/match-bilbao-bizkaia-wordmark.png" alt="Match Bilbao Bizkaia">' +
            '<p class="footer__statement">' + esc(f.statement) + '</p>' +
          '</div>' +
          '<div><h4>Navigate</h4><ul>' + navLinks +
            '<li><a href="' + esc(site.login.url) + '" data-login>' + esc(site.login.label) + '</a></li>' +
          '</ul></div>' +
          '<div><h4>Event</h4><ul>' +
            '<li><a href="#event">Programme</a></li>' +
            '<li><a href="#presentation">Presentation of Bilbao</a></li>' +
            '<li><a href="#experts">Exhibitors</a></li>' +
            '<li><a href="#discover">Brochures</a></li>' +
          '</ul></div>' +
          '<div><h4>Follow the destination</h4>' + social + '</div>' +
        '</div>' +
        '<div class="footer__bar">' +
          '<p style="margin:0">© ' + new Date().getFullYear() + ' ' + esc(f.copyright) + '</p>' +
          '<nav class="footer__legal" aria-label="Legal">' + legal + '</nav>' +
        '</div>' +
      '</div>'
    );
  };

  MBB.esc = esc;
})(window.MBB);
