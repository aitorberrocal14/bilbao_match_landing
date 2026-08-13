/* =============================================================================
   APP — mounts the components and wires the interactions
   ========================================================================== */

(function (MBB) {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* --------------------------------------------------------------------- */
  /* 1. Mount sections                                                      */
  /* --------------------------------------------------------------------- */
  function mount() {
    var into = function (name, html) {
      var el = $('[data-mount="' + name + '"]');
      if (el) el.innerHTML = html;
    };

    $('#nav').innerHTML = MBB.Navbar(MBB.site);
    $('#home').innerHTML = MBB.Hero(MBB.site);

    into('event', MBB.EventIntro(MBB.eventIntro, MBB.site) + MBB.Programme(MBB.programme));
    into('presentation', MBB.Presentation(MBB.presentation));
    into('editions', MBB.Editions(MBB.editions));
    into(
      'experts',
      MBB.Experts(MBB.experts, MBB.site) +
        MBB.Directory(MBB.exhibitors, MBB.exhibitorCategories, MBB.experts.directory)
    );
    into('discover', MBB.Discover(MBB.discover));
    into('contact', MBB.Contact(MBB.site));

    $('#footer').innerHTML = MBB.Footer(MBB.site);

    document.title =
      MBB.site.event.name + ' ' + MBB.site.event.edition + ' — ' +
      MBB.site.event.dates + ' · Basque Country';
  }

  /* --------------------------------------------------------------------- */
  /* 2. Navbar: state, mobile menu, scroll spy                              */
  /* --------------------------------------------------------------------- */
  function initNav() {
    var nav = $('#nav');
    var burger = $('.nav__burger', nav);
    var links = $$('.nav__link', nav);

    function setState() {
      var overHero = window.scrollY < window.innerHeight - 140;
      nav.dataset.state = overHero && nav.dataset.menu !== 'open' ? 'top' : 'pinned';
    }

    function closeMenu() {
      nav.dataset.menu = 'closed';
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
      document.body.classList.remove('no-scroll');
      setState();
    }

    burger.addEventListener('click', function () {
      var open = nav.dataset.menu === 'open';
      if (open) { closeMenu(); return; }
      nav.dataset.menu = 'open';
      nav.dataset.state = 'pinned';
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
    });

    links.forEach(function (a) { a.addEventListener('click', closeMenu); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.dataset.menu === 'open') closeMenu();
    });

    window.addEventListener('scroll', setState, { passive: true });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) closeMenu();
    });
    setState();

    /* Scroll spy ------------------------------------------------------- */
    var sections = links
      .map(function (a) { return document.getElementById(a.hash.slice(1)); })
      .filter(Boolean);

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
    var els = $$('[data-reveal]');
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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    els.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------------------- */
  /* 4. Programme tabs                                                      */
  /* --------------------------------------------------------------------- */
  function initProgramme() {
    var tabs = $$('.prog__tab');
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
  /* 5. Exhibitor directory: filter + search                                */
  /* --------------------------------------------------------------------- */
  function initDirectory() {
    var grid = $('#ex-grid');
    if (!grid) return;

    var empty = $('#ex-empty');
    var count = $('#ex-count');
    var input = $('#ex-search');
    var filters = $$('.filter');
    var active = 'all';

    grid.innerHTML = MBB.exhibitors
      .map(function (x) { return MBB.ExhibitorCard(x, MBB.exhibitorCategories); })
      .join('');

    var cards = $$('.ex-card', grid);

    function apply() {
      var q = (input.value || '').trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var okCat = active === 'all' || card.dataset.category === active;
        var okQ = !q || card.dataset.name.indexOf(q) > -1;
        var show = okCat && okQ;
        card.hidden = !show;
        if (show) shown++;
      });

      empty.hidden = shown !== 0;
      count.textContent =
        shown + (shown === 1 ? ' exhibitor' : ' exhibitors') +
        ' of ' + cards.length + ' shown';
    }

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        active = btn.dataset.filter;
        filters.forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        apply();
      });
    });

    input.addEventListener('input', apply);
    apply();
  }

  /* --------------------------------------------------------------------- */
  /* 6. Video facades (click to load YouTube)                               */
  /* --------------------------------------------------------------------- */
  function initVideos() {
    $$('[data-yt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.yt;
        var frame = btn.closest('.video-card__frame');
        frame.innerHTML =
          '<iframe src="https://www.youtube-nocookie.com/embed/' +
          encodeURIComponent(id) + '?autoplay=1&rel=0" title="Match Bilbao Bizkaia video" ' +
          'allow="accelerometer; autoplay; clipboard-write; encrypted-media; ' +
          'gyroscope; picture-in-picture" allowfullscreen></iframe>';
      });
    });
  }

  /* --------------------------------------------------------------------- */
  /* 7. Brochure modal (Issuu embed or PDF)                                 */
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
        // Issuu readers are made to be embedded — show the brochure inline.
        body.innerHTML =
          '<iframe src="' + MBB.esc(b.issuu) + '" title="' + MBB.esc(b.title) +
          ' brochure" allowfullscreen></iframe>';
      } else if (b.pdf) {
        // The official PDFs are hosted on visitbiscay.eus, which does not allow
        // framing. Present a clean preview panel instead of a blocked iframe.
        body.innerHTML = MBB.BrochurePreview(b);
      } else {
        body.innerHTML =
          '<div class="ph">[Insert Issuu brochure link or PDF for “' +
          MBB.esc(b.title) + '”]</div>';
      }

      foot.innerHTML =
        (b.pdf
          ? '<a class="btn btn--outline btn--sm" href="' + MBB.esc(b.pdf) +
            '" target="_blank" rel="noopener">Open in a new tab</a>' +
            '<a class="btn btn--primary btn--sm" href="' + MBB.esc(b.pdf) +
            '" download>Download PDF</a>'
          : '<span style="font-size:.85rem;color:var(--ink-4)">Document not yet available</span>');

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

    $$('[data-brochure]').forEach(function (btn) {
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
    $$('[data-login]').forEach(function (a) {
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
  /* Any image tagged with data-fallback is replaced by a branded stand-in if
     the file is not on the server yet — placeholders never break the layout. */
  function initImageFallbacks() {
    document.addEventListener(
      'error',
      function (e) {
        var img = e.target;
        if (!img || img.tagName !== 'IMG' || !img.dataset.fallback) return;

        if (img.dataset.fallback === 'mark') {
          var mark = document.createElement('span');
          mark.className = 'ex-card__mark';
          mark.textContent = img.dataset.initials || '';
          img.replaceWith(mark);
        } else if (img.dataset.fallback === 'cover') {
          var wrap = document.createElement('div');
          wrap.innerHTML = MBB.CoverPlaceholder(img.dataset.title || '');
          img.replaceWith(wrap.firstChild);
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
    mount();
    initNav();
    initProgramme();
    initDirectory();
    initVideos();
    initBrochures();
    initForms();
    initReveal();
    document.documentElement.classList.add('is-ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.MBB);
