/**
 * Stamps the address the site is published at into the places that have to
 * carry it in full: the canonical link, the sharing tags, the structured data,
 * the sitemap and robots.txt.
 *
 *   node tools/set-site-url.js https://match.example.org
 *   node tools/set-site-url.js https://user.github.io/repo/
 *
 * Everything else on the page is linked relatively and works at any address;
 * these few are absolute by definition — a sharing card cannot point at a
 * relative image, and a canonical link that is wrong is worse than none.
 *
 * The deployment workflow runs this with the real Pages address, so the
 * published site always describes itself correctly. Run it by hand when the
 * final domain is in place, and commit the result.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

let base = process.argv[2];
if (!base) {
  console.error('Usage: node tools/set-site-url.js <https://address/>');
  process.exit(1);
}
// One trailing slash, no more: the rest of the file assumes exactly that.
base = base.replace(/\/+$/, '') + '/';

if (!/^https?:\/\//.test(base)) {
  console.error('The address has to start with http:// or https://');
  process.exit(1);
}

const changed = [];

/* --- index.html ----------------------------------------------------------- */
const indexPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const before = html;

const asset = (file) => base + file;

html = html
  .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${base}$2`)
  .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${base}$2`)
  .replace(
    /(<meta property="og:image" content=")[^"]*(")/,
    `$1${asset('assets/img/social-card.jpg')}$2`
  )
  .replace(
    /(<meta name="twitter:image" content=")[^"]*(")/,
    `$1${asset('assets/img/social-card.jpg')}$2`
  )
  // Inside the JSON-LD block, which describes the same page.
  .replace(/("url":\s*")https?:\/\/[^"]*(")/, `$1${base}$2`)
  .replace(
    /("image":\s*")https?:\/\/[^"]*(")/,
    `$1${asset('assets/img/social-card.jpg')}$2`
  );

if (html !== before) {
  fs.writeFileSync(indexPath, html);
  changed.push('index.html');
}

/* --- sitemap.xml ---------------------------------------------------------- */
// Rebuilt rather than patched, so it cannot drift from the exhibitor list.
const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const xml = fs
    .readFileSync(sitemapPath, 'utf8')
    .replace(/<loc>https?:\/\/[^<]*?\/(?=(?:exhibitors\/|<\/loc>))/g, `<loc>${base}`);
  fs.writeFileSync(sitemapPath, xml);
  changed.push('sitemap.xml');
}

/* --- robots.txt ----------------------------------------------------------- */
const robotsPath = path.join(ROOT, 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const txt = fs
    .readFileSync(robotsPath, 'utf8')
    .replace(/^Sitemap:.*$/m, `Sitemap: ${base}sitemap.xml`);
  fs.writeFileSync(robotsPath, txt);
  changed.push('robots.txt');
}

console.log('Site address set to %s in: %s', base, changed.join(', '));
