/**
 * Generates one page per exhibitor into exhibitors/<id>.html, the same way the
 * current Match Bilbao Bizkaia website gives every company its own screen.
 *
 * The pages are built from the same data and the same components as the
 * landing page, so the two can never drift apart.
 *
 *   node tools/build-exhibitors.js
 *
 * Re-run it after editing assets/js/data/exhibitors.js.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

/* Load the browser data + component files in a minimal DOM-less sandbox. */
const sandbox = { window: {}, module: { exports: {} }, Date };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

[
  'assets/js/data/site.js',
  'assets/js/data/content.js',
  'assets/js/data/exhibitors.js',
  'assets/js/components.js'
].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
});

const MBB = sandbox.window.MBB;
const { site, exhibitors, exhibitorCategories: categories } = MBB;

const esc = MBB.esc;
const BASE = '../'; // pages live one folder down

/** Four other exhibitors, preferring the same category — as on the old site. */
function relatedTo(x) {
  const i = exhibitors.indexOf(x);
  const sameCat = exhibitors.filter((o) => o !== x && o.category === x.category);
  const rest = exhibitors.filter((o) => o !== x && o.category !== x.category);
  const pool = sameCat.concat(rest);
  // Rotate by index so each page shows a different set.
  return Array.from({ length: 4 }, (_, k) => pool[(i + k) % pool.length]);
}

const page = (x) => {
  const description = (x.paragraphs[0] || '')
    .slice(0, 180)
    .replace(/"/g, "'");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(x.name)} — Match Bilbao Bizkaia 2026</title>
  <meta name="description" content="${esc(description)}">
  <meta name="theme-color" content="#ae0000">
  <link rel="icon" href="${BASE}assets/img/brand/bilbao-bizkaia.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap">
  <link rel="stylesheet" href="${BASE}assets/css/styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="header" id="header" data-menu="closed">${MBB.Header(site, { base: BASE })}</header>

  <main id="main">
    ${MBB.ExhibitorPage(x, categories, relatedTo(x), BASE)}
  </main>

  <footer class="footer" id="footer">${MBB.Footer(site, { base: BASE })}</footer>

  <script src="${BASE}assets/js/data/site.js"></script>
  <script src="${BASE}assets/js/components.js"></script>
  <script src="${BASE}assets/js/main.js"></script>
</body>
</html>
`;
};

const outDir = path.join(ROOT, 'exhibitors');
fs.mkdirSync(outDir, { recursive: true });

// Remove pages for exhibitors that no longer exist.
const keep = new Set(exhibitors.map((x) => `${x.id}.html`));
fs.readdirSync(outDir)
  .filter((f) => f.endsWith('.html') && !keep.has(f))
  .forEach((f) => fs.unlinkSync(path.join(outDir, f)));

exhibitors.forEach((x) => {
  fs.writeFileSync(path.join(outDir, `${x.id}.html`), page(x));
});

console.log('Generated %d exhibitor pages in exhibitors/', exhibitors.length);
