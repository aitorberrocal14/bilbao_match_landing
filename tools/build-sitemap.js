/**
 * Writes sitemap.xml from the same data the site renders from: the landing
 * page plus one entry per exhibitor page. Run it whenever the exhibitor list
 * changes, so the sitemap cannot drift away from the pages that exist.
 *
 *   node tools/build-sitemap.js
 *
 * The address below has to match the canonical link in index.html.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.matchbilbaobizkaia.eus';

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(ROOT, 'assets/js/data/exhibitors.js'), 'utf8'),
  sandbox,
  { filename: 'exhibitors.js' }
);
const exhibitors = sandbox.window.MBB.exhibitors;

// Dated from the newest source file rather than from the clock, so rebuilding
// without having changed anything does not churn the sitemap.
const stamp = ['assets/js/data/exhibitors.js', 'assets/js/data/site.js', 'index.html']
  .map((f) => fs.statSync(path.join(ROOT, f)).mtime)
  .sort((a, b) => b - a)[0]
  .toISOString()
  .slice(0, 10);

const url = (loc, priority) =>
  '  <url>\n' +
  '    <loc>' + loc + '</loc>\n' +
  '    <lastmod>' + stamp + '</lastmod>\n' +
  '    <priority>' + priority + '</priority>\n' +
  '  </url>';

const body = [url(SITE + '/', '1.0')].concat(
  exhibitors.map((x) => url(SITE + '/exhibitors/' + x.id + '.html', '0.6'))
);

fs.writeFileSync(
  path.join(ROOT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    body.join('\n') +
    '\n</urlset>\n'
);

console.log('sitemap.xml: %d URLs (1 landing + %d exhibitors)', body.length, exhibitors.length);
