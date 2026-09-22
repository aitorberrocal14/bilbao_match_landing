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
 *
 * Por qué se guardan DOS cabeceras y DOS pies
 * -------------------------------------------
 * Porque no son los mismos todo el año. El día que abre la plataforma, el
 * Login deja de llevar al cartel de aviso y lleva a Meetmaps, y además cambia
 * de aspecto: pasa a rojo macizo y el alta se queda en blanco.
 *
 * Aquí se dibuja una sola vez y se pega en 39 páginas, así que guardar una
 * única versión congela esas páginas en el estado que tuviera la web el día
 * que se ejecutó este archivo. El 29 por la mañana la portada diría una cosa
 * y las fichas de expositor otra, sin que nadie hubiera tocado nada y sin
 * nada que mirar para entender por qué.
 *
 * La solución no es dibujarlas en PHP —eso es lo que este archivo existe para
 * evitar—, sino guardar las dos y dejar que sync.php ELIJA por fecha. PHP
 * sigue sin dibujar nada: escoge entre dos textos ya hechos por los
 * componentes de verdad. Y sync.php corre cada tres minutos, así que el
 * cambio llega solo.
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

// Dibuja algo poniéndole al sandbox un reloj distinto del de hoy, para poder
// capturar cómo se verá la web un día que todavía no ha llegado. El reloj se
// devuelve a su sitio siempre, pase lo que pase dentro.
function conReloj(iso, dibuja) {
  if (!iso) return dibuja();
  const real = sandbox.Date;
  const salto = new real(iso).getTime() - real.now();
  class Falso extends real {
    constructor(...a) { if (!a.length) super(real.now() + salto); else super(...a); }
    static now() { return real.now() + salto; }
  }
  sandbox.Date = Falso;
  try { return dibuja(); } finally { sandbox.Date = real; }
}

// Un día antes y un día después de que abra. Se fijan las dos fechas en vez de
// usar "hoy" para una de ellas: así este archivo da exactamente el mismo
// resultado se ejecute cuando se ejecute, antes o después del 29.
const ABRE = (MBB.site.login || {}).opensAt || '';
const DIA = 24 * 60 * 60 * 1000;
const ANTES = ABRE ? new Date(new Date(ABRE).getTime() - DIA).toISOString() : '';
const DESPUES = ABRE ? new Date(new Date(ABRE).getTime() + DIA).toISOString() : '';

const chrome = {
  _readme:
    'Generado por tools/build-chrome.js. La cabecera, el pie y los iconos de las ' +
    'páginas de expositor, tal y como los dibuja el sitio. server/sync.php los ' +
    'pega tal cual para no tener que redibujarlos en PHP. No editar a mano. ' +
    'Van dos versiones de la cabecera y del pie: la de antes de que abra la ' +
    'plataforma y la de después. sync.php elige por fecha, comparando con ' +
    'opensAt.',
  base: BASE,
  opensAt: ABRE,
  header: conReloj(ANTES, () => MBB.Header(MBB.site, { base: BASE })),
  footer: conReloj(ANTES, () => MBB.Footer(MBB.site, { base: BASE })),
  headerOpen: conReloj(DESPUES, () => MBB.Header(MBB.site, { base: BASE })),
  footerOpen: conReloj(DESPUES, () => MBB.Footer(MBB.site, { base: BASE })),
  icons: icons
};

const outDir = path.join(ROOT, 'server');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'chrome.json');
fs.writeFileSync(out, JSON.stringify(chrome, null, 2) + '\n');

console.log(
  'server/chrome.json — cabecera %d B, pie %d B, %d iconos%s',
  Buffer.byteLength(chrome.header),
  Buffer.byteLength(chrome.footer),
  ICON_KEYS.length,
  ABRE
    ? (chrome.header === chrome.headerOpen
        ? ' — OJO: la cabecera no cambia al abrir la plataforma'
        : ' · y su versión de cuando abra la plataforma')
    : ''
);
