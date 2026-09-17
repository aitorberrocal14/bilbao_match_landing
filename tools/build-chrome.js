/**
 * Captures the header and footer of an exhibitor page, exactly as the
 * JavaScript components render them, into server/chrome.json.
 *
 *   node tools/build-chrome.js
 *
 * Why this exists
 * ---------------
 * The exhibitor pages are regenerated on the hosting by server/sync.php, which
 * is PHP, while the site's rendering lives in JavaScript. Anything PHP has to
 * draw is a second implementation of the same design, and two implementations
 * drift.
 *
 * The header and footer are identical on all 39 pages — same markup, same
 * `../` base — so they do not need drawing at all. They are captured here,
 * once, by the real components, and PHP pastes them in verbatim. That leaves
 * only the body of the page for PHP to render, and the site chrome with a
 * single source.
 *
 * Re-run after changing the menu, the Login URL, the footer or the
 * institutional logos — the same moments that already required regenerating
 * the exhibitor pages.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

const sandbox = { window: {}, module: { exports: {} }, Date };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

['assets/js/data/site.js', 'assets/js/components.js'].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
});

const MBB = sandbox.window.MBB;
const BASE = '../'; // exhibitor pages live one folder down

// The six icons the contact block of an exhibitor page uses. Exported rather
// than copied into the PHP by hand, for the same reason as the chrome: one
// source, so a change to an icon cannot leave the two renderers disagreeing.
const ICON_KEYS = ['badge', 'briefcase', 'mail', 'phone', 'link', 'pin'];

const icons = {};
ICON_KEYS.forEach((k) => {
  if (!MBB.icons[k]) throw new Error('Falta el icono ' + k + ' en components.js');
  icons[k] = MBB.icons[k];
});

const chrome = {
  _readme:
    'Generado por tools/build-chrome.js. La cabecera, el pie y los iconos de las ' +
    'páginas de expositor, tal y como los dibuja el sitio. server/sync.php los ' +
    'pega tal cual para no tener que redibujarlos en PHP. No editar a mano.',
  base: BASE,
  header: MBB.Header(MBB.site, { base: BASE }),
  footer: MBB.Footer(MBB.site, { base: BASE }),
  icons: icons
};

const outDir = path.join(ROOT, 'server');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'chrome.json');
fs.writeFileSync(out, JSON.stringify(chrome, null, 2) + '\n');

console.log(
  'server/chrome.json — cabecera %d B, pie %d B, %d iconos',
  Buffer.byteLength(chrome.header),
  Buffer.byteLength(chrome.footer),
  ICON_KEYS.length
);
