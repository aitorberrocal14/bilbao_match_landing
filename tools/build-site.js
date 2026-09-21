/**
 * Monta en una carpeta exactamente lo que es la web, y nada más.
 *
 * El repositorio tiene más cosas que el sitio: los scripts de construcción, la
 * copia de un solo archivo, la documentación, el historial de git. Nada de eso
 * debe acabar en un servidor público, y decidir qué se deja fuera a mano, a
 * toda prisa, sobre una carpeta de más de cien archivos, es exactamente como
 * termina publicada una carpeta `tools/`. Así que la decisión se toma una vez,
 * aquí.
 *
 * Lo que entra: index.html, platform.html, assets/, exhibitors/, robots.txt,
 * sitemap.xml y .htaccess. La misma lista que usa server/deploy.php en el
 * servidor.
 *
 * El panel de administración NO entra, y no es un olvido. El panel edita la
 * web: quien lo abre cambia los textos, el programa y los folletos. Estaba
 * publicado confiando en una contraseña de carpeta que se pone a mano desde el
 * hosting, y mientras no esté puesta, la dirección está abierta a cualquiera
 * que la escriba. Se publica cuando esté protegido, no antes.
 *
 * El panel no se pierde: `node tools/build-admin-standalone.js` lo deja entero
 * en un solo archivo, para abrir desde el escritorio y fuera de internet.
 *
 *   node tools/build-site.js --dir _site
 *   node tools/build-site.js --dir _pruebas --test
 *
 * Lo usan los flujos de GitHub, así que lo que se publica al hacer push y lo
 * que dice esta lista son el mismo conjunto por construcción, no por dos
 * listas que alguien mantiene en paralelo.
 *
 * `--test` es el mismo sitio preparado para vivir en algún sitio temporal —una
 * subcarpeta, un subdominio— sin competir con el real. Cada página lleva un
 * noindex, robots.txt lo rechaza todo y el sitemap se queda fuera. Dos copias
 * del mismo sitio indexadas a la vez es el único coste real de tener una copia
 * de pruebas, y es del todo evitable.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const dirFlag = process.argv.indexOf('--dir');
const outDir = dirFlag !== -1 ? process.argv[dirFlag + 1] : null;
if (!outDir) {
  console.error('Uso: node tools/build-site.js --dir <carpeta> [--test]');
  process.exit(1);
}

const isTest = process.argv.includes('--test');
const STAGE = path.resolve(ROOT, outDir);

// Files at the root of the site, and whole folders that travel as they are.
const FILES = ['index.html', 'platform.html', 'robots.txt', 'sitemap.xml', '.htaccess'];
const DIRS = ['assets', 'exhibitors'];

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
  'assets/img/social-card.jpg'
];
for (const m of musts) {
  if (!fs.existsSync(path.join(STAGE, m))) throw new Error('Falta ' + m + ' en el paquete');
}
// Una página por expositor, ni una menos. Comparar contra la lista de datos y
// no contra un número fijo: el directorio lo llena la plataforma según se
// registran las empresas, así que cualquier cifra es legítima — incluido cero,
// antes de la primera alta. Lo que nunca es legítimo es que no coincidan, que
// es justo la señal de un paquete a medio construir.
const listed = (
  fs.readFileSync(path.join(STAGE, 'assets/js/data/exhibitors.js'), 'utf8')
    .match(/^\s{4}id: /gm) || []
).length;

if (pages.length !== listed) {
  throw new Error(
    'Hay ' + listed + ' expositores en los datos pero ' + pages.length + ' páginas. ' +
    'Ejecuta node tools/build-exhibitors.js'
  );
}
// El panel no puede colarse en el paquete por ninguna vía: ni la carpeta, ni
// la contraseña que vive dentro de ella.
if (fs.existsSync(path.join(STAGE, 'admin'))) {
  throw new Error('El panel de administración no puede viajar en el paquete');
}

/* --- Hand it over --------------------------------------------------------- */

console.log('%s — %d páginas de expositor%s', outDir, pages.length,
  isTest ? ' · sin indexar' : '');
