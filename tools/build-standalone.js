/**
 * Builds a single self-contained HTML file (CSS, JS and images inlined as
 * data URIs) at dist/match-bilbao-bizkaia-2026.html.
 *
 * Useful for emailing the concept to a stakeholder who should be able to
 * double-click a file and see the page — no server, no folder of assets.
 * The site itself does not need this: deploy the repository as-is.
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
  '.svg': 'image/svg+xml'
};

/** Inline every local asset path found in a string as a data URI. */
function inlineAssets(source) {
  return source.replace(/assets\/img\/[A-Za-z0-9._\/-]+/g, (rel) => {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) return rel; // missing on purpose → JS fallback
    const mime = MIME[path.extname(abs).toLowerCase()];
    if (!mime) return rel;
    return `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`;
  });
}

const SCRIPTS = [
  'assets/js/data/site.js',
  'assets/js/data/content.js',
  'assets/js/data/programme.js',
  'assets/js/data/exhibitors.js',
  'assets/js/data/discover.js',
  'assets/js/components.js',
  'assets/js/main.js'
];

let html = read('index.html');

// Replace the stylesheet link with an inline <style>.
// NB: replacement values are passed as functions — a literal string would let
// `$$`, `$&` etc. inside the source be interpreted as substitution patterns.
html = html.replace(
  /\s*<link rel="stylesheet" href="assets\/css\/styles\.css">/,
  () => '\n  <style>\n' + inlineAssets(read('assets/css/styles.css')) + '\n  </style>'
);

// Drop the individual <script src> tags, then append one inlined bundle in
// the same load order just before </body>.
html = html.replace(/[ \t]*<script src="assets\/js\/[^"]+"><\/script>\n?/g, '');

const bundle = SCRIPTS.map((f) => inlineAssets(read(f))).join('\n;\n');
html = html.replace(
  '</body>',
  () => '  <script>\n' + bundle + '\n  </script>\n</body>'
);

// Favicon and any remaining asset references in the markup.
html = inlineAssets(html);

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
const out = path.join(ROOT, 'dist', 'match-bilbao-bizkaia-2026.html');
fs.writeFileSync(out, html);

console.log(
  'Wrote %s (%s MB)',
  path.relative(ROOT, out),
  (fs.statSync(out).size / 1048576).toFixed(2)
);
