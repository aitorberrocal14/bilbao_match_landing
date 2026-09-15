/**
 * Builds the administration panel as ONE self-contained HTML file at
 * dist/panel-match-bilbao-bizkaia.html.
 *
 * The stylesheet, the panel's script, the five data files and every image the
 * panel can preview are inlined, so the file opens with a double click from
 * anywhere — a desktop, an email attachment, a memory stick — with no folder
 * around it and nothing to install.
 *
 * It is for trying the panel and for preparing changes away from the server.
 * The data inside is a copy taken when the file was built, so the panel says
 * as much on its publishing screen: the one at /admin/ on the site is the one
 * that always sees the current content.
 *
 *   node tools/build-admin-standalone.js
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

const DATA_FILES = [
  'assets/js/data/site.js',
  'assets/js/data/content.js',
  'assets/js/data/programme.js',
  'assets/js/data/exhibitors.js',
  'assets/js/data/discover.js'
];

/* --- The images the panel offers a preview of ------------------------------
   Exactly the ones reachable from an `image` field: exhibitor logos, brochure
   covers, the hero photograph, the two photographs of the presentation and the
   institutional marks. Collected from the data rather than by sweeping
   assets/, so nothing travels that the panel would never show. */

function collectImagePaths(MBB) {
  const out = new Set();
  const add = (p) => { if (typeof p === 'string' && p.startsWith('assets/img/')) out.add(p); };

  add((MBB.site.hero.media || {}).image);
  (MBB.presentation.media || []).forEach((m) => add(m.file));
  (MBB.site.footer.institutions || []).forEach((i) => add(i.file));
  (MBB.exhibitors || []).forEach((x) => add(x.logo));
  (MBB.discover.brochures || []).forEach((b) => add(b.cover));

  return [...out];
}

function dataUri(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  const mime = MIME[path.extname(abs).toLowerCase()];
  if (!mime) return null;
  return `data:${mime};base64,${fs.readFileSync(abs).toString('base64')}`;
}

/* --- Read the site's data the same way the browser does -------------------- */

global.window = { MBB: {} };
DATA_FILES.forEach((f) => {
  // eslint-disable-next-line no-eval
  eval(read(f));
});
const MBB = global.window.MBB;

const images = collectImagePaths(MBB);
const assets = {};
let missing = 0;
images.forEach((rel) => {
  const uri = dataUri(rel);
  if (uri) assets[rel] = uri; else missing++;
});

/* --- Assemble -------------------------------------------------------------- */

// `</script>` inside a string would close the surrounding tag, so the one
// sequence that can break out is escaped.
const safe = (js) => js.replace(/<\/script/gi, '<\\/script');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Match Bilbao Bizkaia — Panel de administración</title>
<meta name="robots" content="noindex, nofollow">

<!--
  PANEL DE ADMINISTRACIÓN — versión de un solo archivo
  ---------------------------------------------------------------------------
  Generado por tools/build-admin-standalone.js el ${new Date().toISOString().slice(0, 10)}.

  Se abre con doble clic. Lleva dentro una copia de los datos de la web tomada
  el día que se generó, así que sirve para probar el panel y para preparar
  cambios; al publicar, descarga los archivos modificados para subirlos por FTP
  a assets/js/data/.

  El panel que siempre ve el contenido actual es el de /admin/ en la web.
-->

<style>
${read('admin/admin.css')}
</style>
</head>
<body>

<header class="bar">
  <span class="bar__brand">Match Bilbao Bizkaia <b>2026</b></span>
  <span class="bar__sep"></span>
  <span class="bar__state" id="state">Sin cambios</span>
  <a class="btn btn--primary" href="#/publicar">Publicar</a>
</header>

<div class="wrap">
  <nav class="menu" id="menu" aria-label="Secciones del panel"></nav>
  <main class="body" id="screen" tabindex="-1">
    <div class="card"><p class="muted">Cargando…</p></div>
  </main>
</div>

<script>window.MBB_STANDALONE = true;</script>
<script>window.MBB_ASSETS = ${safe(JSON.stringify(assets))};</script>

${DATA_FILES.map((f) => `<script>\n${safe(read(f))}\n</script>`).join('\n')}

<script>
${safe(read('admin/admin.js'))}
</script>
</body>
</html>
`;

const outDir = path.join(ROOT, 'dist');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'panel-match-bilbao-bizkaia.html');
fs.writeFileSync(out, html);

console.log(
  'dist/panel-match-bilbao-bizkaia.html — %s MB · %d imágenes incrustadas%s',
  (Buffer.byteLength(html) / 1024 / 1024).toFixed(1),
  Object.keys(assets).length,
  missing ? ` · ${missing} sin encontrar` : ''
);
