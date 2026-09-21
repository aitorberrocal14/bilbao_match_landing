/**
 * Builds the whole site as ONE self-contained HTML file at
 * dist/match-bilbao-bizkaia-2026.html.
 *
 * Everything is inlined — stylesheet, scripts, the Bariol font files, the 39
 * exhibitor logos, the brochure covers and the institutional marks — and the
 * exhibitor pages become client-side views of the same file, so a single
 * document behaves like the full multi-page site.
 *
 * Use it to email or hand over the concept. The real deployment stays the
 * folder itself, with one real HTML file per exhibitor (better for SEO).
 *
 *   node tools/build-standalone.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function dataUri(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  const mime = MIME[path.extname(abs).toLowerCase()];
  if (!mime) return null;
  return `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`;
}

/** Inline every local asset path found in a string. */
function inlineAssets(source) {
  return source.replace(/assets\/(?:img|fonts)\/[A-Za-z0-9._\/-]+/g, (rel) => {
    return dataUri(rel) || rel; // missing on purpose → JS placeholder fallback
  });
}

/* --- stylesheet: resolve ../fonts/… first, then the rest ----------------- */
let css = read('assets/css/styles.css').replace(
  /\.\.\/fonts\/([A-Za-z0-9._-]+)/g,
  (m, file) => dataUri(`assets/fonts/${file}`) || m
);
css = inlineAssets(css);

/* --- scripts ------------------------------------------------------------- */
const SCRIPTS = [
  'assets/js/data/site.js',
  'assets/js/data/content.js',
  'assets/js/data/programme.js',
  'assets/js/data/exhibitors.js',
  'assets/js/data/discover.js',
  'assets/js/components.js',
  'assets/js/main.js'
];
const bundle = SCRIPTS.map((f) => inlineAssets(read(f))).join('\n;\n') +
  // Esta copia es un archivo suelto: no tiene al lado el platform.html que
  // explica cuándo abre la plataforma, así que el botón de Login apuntaría a
  // una página que aquí no existe. Se quita la espera y el botón va directo,
  // que es lo único que puede funcionar en un archivo que se abre desde una
  // memoria USB o un adjunto de correo.
  '\n;\nwindow.MBB.site.login.opensAt = \'\';\n';

/* --- client-side exhibitor views ----------------------------------------- */
/* In the folder version each exhibitor is its own HTML file. Here the same
   component is rendered into a view of this single document, addressed by
   #/exhibitor/<id> so the browser's back button keeps working. */
const router = `
(function () {
  'use strict';
  var MBB = window.MBB;
  var main = document.getElementById('main');
  var footer = document.getElementById('footer');

  var view = document.createElement('div');
  view.id = 'ex-view';
  view.hidden = true;
  main.parentNode.insertBefore(view, footer);

  function byId(id) {
    return MBB.exhibitors.filter(function (x) { return x.id === id; })[0];
  }

  /* Four other exhibitors, same category first — as in build-exhibitors.js */
  function relatedTo(x) {
    var all = MBB.exhibitors;
    var i = all.indexOf(x);
    var pool = all.filter(function (o) { return o !== x && o.category === x.category; })
      .concat(all.filter(function (o) { return o !== x && o.category !== x.category; }));
    var out = [];
    for (var k = 0; k < 4; k++) out.push(pool[(i + k) % pool.length]);
    return out;
  }

  function bindTiles(root) {
    Array.prototype.forEach.call(root.querySelectorAll('.logo-tile'), function (a) {
      if (a.dataset.routed) return;
      a.dataset.routed = '1';
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var href = a.getAttribute('href') || '';
        var id = href.replace(/^.*\\/(.+)\\.html$/, '$1');
        if (id) location.hash = '#/exhibitor/' + id;
      });
    });
  }

  function showExhibitor(id) {
    var x = byId(id);
    if (!x) { showLanding(); return; }

    view.innerHTML = MBB.ExhibitorPage(x, MBB.exhibitorCategories, relatedTo(x), '');
    // Rewrite the links that point at the folder version of the site.
    Array.prototype.forEach.call(view.querySelectorAll('a[href$="index.html#exhibitors"]'),
      function (a) { a.setAttribute('href', '#exhibitors'); });

    main.hidden = true;
    view.hidden = false;
    document.title = x.name + ' — Match Bilbao Bizkaia 2026';
    window.scrollTo(0, 0);
    bindTiles(view);
  }

  function showLanding(anchor) {
    view.hidden = true;
    view.innerHTML = '';
    main.hidden = false;
    document.title = 'Match Bilbao Bizkaia 2026';
    if (anchor) {
      var el = document.getElementById(anchor);
      if (el) el.scrollIntoView();
    }
  }

  function route() {
    var m = /^#\\/exhibitor\\/(.+)$/.exec(location.hash);
    if (m) { showExhibitor(decodeURIComponent(m[1])); return; }
    showLanding(location.hash ? location.hash.slice(1) : '');
  }

  function start() {
    bindTiles(document);          // the grid is built by main.js on DOM ready
    window.addEventListener('hashchange', route);
    route();
  }

  // main.js mounts on DOMContentLoaded; register after it so the tiles exist.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
`;

/* --- assemble ------------------------------------------------------------ */
let html = read('index.html');

// Roboto comes from Google Fonts; keep the link so an online viewer gets it,
// the CSS stack already falls back to a system sans otherwise.
html = html.replace(
  /\s*<link rel="stylesheet" href="assets\/css\/styles\.css">/,
  () => '\n  <style>\n' + css + '\n  </style>'
);

html = html.replace(/[ \t]*<script src="assets\/js\/[^"]+"><\/script>\n?/g, '');
html = html.replace(
  '</body>',
  () => '  <script>\n' + bundle + '\n' + router + '\n  </script>\n</body>'
);

// Favicon and any remaining references in the markup.
html = inlineAssets(html);

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
const out = path.join(ROOT, 'dist', 'match-bilbao-bizkaia-2026.html');
fs.writeFileSync(out, html);

// The same file, already carrying the name a web server looks for.
console.log(
  'Wrote %s (%s MB)',
  path.relative(ROOT, out),
  (fs.statSync(out).size / 1048576).toFixed(2)
);
