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

  /* --- Programme tabs ---------------------------------------------------- */
  function initProgramme() {
    var tabs = $all('.mbb .prog__tab');
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

  /* --- Exhibitor filter --------------------------------------------------- */
  function initDirectory() {
    var grid = document.getElementById('ex-grid');
    if (!grid) return;

    var empty = document.getElementById('ex-empty');
    var tiles = $all('.logo-tile', grid);
    var filters = $all('.mbb .filter');

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
