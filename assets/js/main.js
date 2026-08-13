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
    var into = function (name, html) {
      var el = $('[data-mount="' + name + '"]');
      if (el) el.innerHTML = html;
    };

    into('header', MBB.Header(MBB.site));
    into('hero', MBB.Hero(MBB.site));
    into('event', MBB.EventIntro(MBB.eventIntro, MBB.site));
    into('programme', MBB.Programme(MBB.programme));
    into('presentation', MBB.Presentation(MBB.presentation));
    into('editions', MBB.Editions(MBB.editions));
    into(
      'experts',
      MBB.Experts(MBB.experts, MBB.site) +
        MBB.Directory(MBB.exhibitors, MBB.exhibitorCategories, MBB.experts.directory)
    );
    into('discover', MBB.Discover(MBB.discover));
    into('contact', MBB.Contact(MBB.site));
    into('footer', MBB.Footer(MBB.site));

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
      if (window.innerWidth > 900) closeMenu();
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
    var tabs = $all('.prog__tab');
    if (!tabs.length) return;

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
  }

  /* --------------------------------------------------------------------- */
  /* 5. Exhibitor grid — category filter                                    */
  /* --------------------------------------------------------------------- */
  function initDirectory() {
    var grid = $('#ex-grid');
    if (!grid) return;

    var empty = $('#ex-empty');
    var filters = $all('.filter');

    grid.innerHTML = MBB.exhibitors
      .map(function (x) { return MBB.ExhibitorTile(x); })
      .join('');

    var tiles = $all('.logo-tile', grid);

    function apply(cat) {
      var shown = 0;
      tiles.forEach(function (t) {
        var show = cat === 'all' || t.dataset.category === cat;
        t.hidden = !show;
        if (show) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    }

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        apply(btn.dataset.filter);
      });
    });

    apply('all');
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

      if (b.issuu) {
        // Issuu readers are designed to be embedded — show the brochure inline.
        body.innerHTML =
          '<iframe src="' + MBB.esc(b.issuu) + '" title="' + MBB.esc(b.title) +
          ' brochure" allowfullscreen></iframe>';
      } else {
        // The official PDFs are hosted on visitbiscay.eus, which does not allow
        // framing, so a preview panel is shown instead of a blocked iframe.
        body.innerHTML = MBB.BrochurePreview(b);
      }

      foot.innerHTML = b.pdf
        ? '<a class="btn btn--outline btn--sm" href="' + MBB.esc(b.pdf) +
          '" target="_blank" rel="noopener">Open in a new tab</a>' +
          '<a class="btn btn--sm" href="' + MBB.esc(b.pdf) + '" download>Download PDF</a>'
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
  /* 8. Login placeholder + newsletter                                      */
  /* --------------------------------------------------------------------- */
  function initForms() {
    $all('[data-login]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (a.getAttribute('href') !== '#login-placeholder') return;
        e.preventDefault();
        window.alert(
          'Login placeholder.\n\nConnect this button to the Match Bilbao Bizkaia ' +
          'meeting platform by setting `login.url` in assets/js/data/site.js.'
        );
      });
    });

    var form = $('#nl-form');
    if (!form) return;
    var status = $('#nl-status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('#nl-email').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        status.textContent = 'Please enter a valid email address.';
        return;
      }
      if (!MBB.site.newsletter.action) {
        status.textContent =
          'Thank you. [Insert newsletter endpoint in site.js to send this form.]';
        form.reset();
        return;
      }
      form.action = MBB.site.newsletter.action;
      form.method = 'post';
      form.submit();
    });
  }

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

        if (img.dataset.fallback === 'mark') {
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
  /* 10. Boot                                                               */
  /* --------------------------------------------------------------------- */
  function boot() {
    initImageFallbacks();
    if ($('[data-mount="header"]')) mount();   // landing page only
    initHeader();
    initProgramme();
    initDirectory();
    initVideos();
    initBrochures();
    initForms();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.MBB);
