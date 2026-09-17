/**
 * Packs exactly what belongs on the web server into
 * dist/web-para-subir.zip, ready to unzip and drop into the public folder.
 *
 * The repository holds more than the site: the build scripts, the WordPress
 * plugin, the single-file copies, the git history. None of that should be on a
 * public server, and deciding what to leave out by hand — at an FTP client, at
 * speed, on a folder of 126 files — is exactly how a `tools/` folder ends up
 * published. So the decision is made once, here.
 *
 * What goes in: index.html, assets/, exhibitors/, admin/, robots.txt,
 * sitemap.xml. The same list the deployment workflow uses.
 *
 *   node tools/build-upload.js             → dist/web-para-subir.zip
 *   node tools/build-upload.js --dir _site → the same files, unzipped
 *   node tools/build-upload.js --test      → dist/web-de-prueba.zip
 *
 * The deployment workflow uses `--dir`, so what a push publishes and what this
 * package contains are the same set by construction, not by two lists kept in
 * step by hand.
 *
 * `--test` is the same site, prepared to live somewhere temporary — a
 * subfolder, a subdomain — without competing with the real one. Every page
 * gets a noindex, robots.txt refuses everything and the sitemap is left out.
 * Two copies of the same site indexed at once is the one real cost of having a
 * staging copy, and it is entirely avoidable.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

const dirFlag = process.argv.indexOf('--dir');
const outDir = dirFlag !== -1 ? process.argv[dirFlag + 1] : null;
if (dirFlag !== -1 && !outDir) {
  console.error('Uso: node tools/build-upload.js --dir <carpeta>');
  process.exit(1);
}

const isTest = process.argv.includes('--test');

const STAGE = outDir ? path.resolve(ROOT, outDir) : path.join(ROOT, 'dist', '_subir');
const ZIP = path.join(ROOT, 'dist', isTest ? 'web-de-prueba.zip' : 'web-para-subir.zip');

// Files at the root of the site, and whole folders that travel as they are.
const FILES = ['index.html', 'robots.txt', 'sitemap.xml'];
const DIRS = ['assets', 'exhibitors', 'admin'];

// Never published, whatever it is doing in the folder. The panel's password
// belongs on the server alone; the documentation and its screenshot belong in
// the repository, not on a public address.
const NEVER = new Set(['admin-config.php', '.DS_Store', 'Thumbs.db', 'panel.png']);
const NEVER_EXT = new Set(['.md']);

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (NEVER.has(entry.name)) continue;
    if (entry.isFile() && NEVER_EXT.has(path.extname(entry.name))) continue;
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

/* --- Stage ---------------------------------------------------------------- */

fs.rmSync(STAGE, { recursive: true, force: true });
fs.mkdirSync(STAGE, { recursive: true });

for (const f of FILES) {
  if (!fs.existsSync(path.join(ROOT, f))) throw new Error('Falta ' + f);
  fs.copyFileSync(path.join(ROOT, f), path.join(STAGE, f));
}
for (const d of DIRS) copyDir(path.join(ROOT, d), path.join(STAGE, d));

/* --- Keep a staging copy out of the search results ------------------------ */

if (isTest) {
  // Marked on every page rather than only in robots.txt: robots.txt asks a
  // crawler not to fetch a page, which is not the same as asking it not to
  // list one it already knows about. The meta tag is the instruction that
  // actually keeps it out of the results.
  const tag = '\n  <meta name="robots" content="noindex, nofollow">' +
    '\n  <!-- Copia de pruebas. No debe indexarse ni sustituir a la web real. -->';

  const pages = [path.join(STAGE, 'index.html')].concat(
    fs.readdirSync(path.join(STAGE, 'exhibitors'))
      .filter((f) => f.endsWith('.html'))
      .map((f) => path.join(STAGE, 'exhibitors', f))
  );

  for (const page of pages) {
    const html = fs.readFileSync(page, 'utf8');
    if (!html.includes('<head>')) throw new Error('Sin <head>: ' + page);
    fs.writeFileSync(page, html.replace('<head>', '<head>' + tag));
  }

  fs.writeFileSync(
    path.join(STAGE, 'robots.txt'),
    '# Copia de pruebas de Match Bilbao Bizkaia.\n' +
    '# La web real es https://www.matchbilbaobizkaia.eus/\n\n' +
    'User-agent: *\nDisallow: /\n'
  );

  // It lists the real addresses, so it has no business in a test copy.
  fs.rmSync(path.join(STAGE, 'sitemap.xml'), { force: true });
}

/* --- Check it is whole before handing it over ----------------------------- */

const pages = fs.readdirSync(path.join(STAGE, 'exhibitors')).filter((f) => f.endsWith('.html'));
const musts = [
  'index.html',
  'assets/css/styles.css',
  'assets/img/social-card.jpg',
  'admin/index.html'
];
for (const m of musts) {
  if (!fs.existsSync(path.join(STAGE, m))) throw new Error('Falta ' + m + ' en el paquete');
}
if (pages.length < 39) throw new Error('Solo hay ' + pages.length + ' páginas de expositor');
if (fs.existsSync(path.join(STAGE, 'admin', 'admin-config.php'))) {
  throw new Error('La contraseña del panel no puede viajar en el paquete');
}

/* --- Hand it over --------------------------------------------------------- */

if (outDir) {
  console.log('%s — %d páginas de expositor', outDir, pages.length);
  return;
}

// -r recurse, -q quiet, -X drop the filesystem extras. Zipped from inside the
// staging folder so the archive has no wrapper directory: unzipping it gives
// index.html and the folders directly, which is what has to land in the
// public folder of the hosting.
fs.rmSync(ZIP, { force: true });
execFileSync('zip', ['-rqX', ZIP, '.'], { cwd: STAGE });
fs.rmSync(STAGE, { recursive: true, force: true });

const count = execFileSync('unzip', ['-l', ZIP]).toString().trim().split('\n').pop();
console.log(
  'dist/%s — %s MB · %d páginas de expositor%s\n%s',
  path.basename(ZIP),
  (fs.statSync(ZIP).size / 1024 / 1024).toFixed(1),
  pages.length,
  isTest ? ' · sin indexar' : '',
  count.trim()
);
