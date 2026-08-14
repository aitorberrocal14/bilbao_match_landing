/**
 * Renders a cover image for every English brochure into
 * assets/img/brochures/<id>.jpg.
 *
 * These are stand-in covers in the destination's own visual language, made so
 * the Discover gallery is complete today. When the real artwork is available,
 * simply overwrite the JPG files with the first page of each PDF (800×1024)
 * and delete this script — nothing else needs to change.
 *
 *   node tools/build-brochure-covers.js
 *
 * Requires Playwright (dev-only): npm i -D playwright
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets/img/brochures');
const W = 800;
const H = 1024;

/* Read the brochure list from the data file. */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(ROOT, 'assets/js/data/discover.js'), 'utf8'),
  sandbox
);
const brochures = sandbox.window.MBB.discover.brochures;

/* Each brochure gets its own tone, taken from the theme it covers. */
const TONE = {
  'city-experience': ['#8e1420', '#4a0a12'],
  coast: ['#1d5a6b', '#0c2b34'],
  culture: ['#7a2a13', '#3a1208'],
  naturally: ['#2f5a2a', '#142a12'],
  gastronomy: ['#8a1c38', '#3d0c19'],
  identity: ['#3c3f52', '#1a1c26'],
  'drive-enjoy': ['#a05a12', '#4a2807'],
  // English titles from the Issuu library
  'place-to-be': ['#8e1420', '#3d0910'],
  'land-city': ['#3f5d33', '#17240f'],
  coastline: ['#155a72', '#082733'],
  'iron-river': ['#5a4636', '#241a12'],
  'rural-tourism': ['#4a5f2a', '#1d2a0f'],
  'bike-spirit': ['#8a4a12', '#3a1d06']
};

const bariol = fs
  .readFileSync(path.join(ROOT, 'assets/fonts/bariol-bold.ttf'))
  .toString('base64');
const logo = fs
  .readFileSync(path.join(ROOT, 'assets/img/brand/bilbao-bizkaia-be-basque.png'))
  .toString('base64');

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const html = (b) => {
  const [c1, c2] = TONE[b.id] || ['#ae0000', '#3d0910'];
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Bariol;src:url(data:font/ttf;base64,${bariol}) format('truetype');font-weight:700}
*{margin:0;box-sizing:border-box}
body{width:${W}px;height:${H}px;overflow:hidden;font-family:Bariol,sans-serif;
  background:linear-gradient(155deg,${c1} 0%,${c2} 100%);color:#fff;
  display:flex;flex-direction:column;justify-content:space-between;padding:64px 60px 56px;position:relative}
/* Faint contour lines — a nod to the coastline and the hills of Bizkaia */
body::before{content:'';position:absolute;inset:0;opacity:.13;
  background-image:repeating-radial-gradient(circle at 82% 12%,#fff 0 1px,transparent 1px 26px)}
.top{position:relative;z-index:1}
.eyebrow{font-size:22px;letter-spacing:.24em;text-transform:uppercase;opacity:.8}
.rule{width:110px;height:5px;background:#fff;margin-top:26px}
.mid{position:relative;z-index:1}
h1{font-size:82px;line-height:.96;letter-spacing:-.02em}
.sub{font-size:26px;line-height:1.35;opacity:.85;margin-top:26px;max-width:17ch}
.bot{position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:space-between}
.lang{font-size:20px;letter-spacing:.22em;text-transform:uppercase;opacity:.7}
img{height:104px;width:auto}
</style></head><body>
  <div class="top"><div class="eyebrow">Bilbao Bizkaia</div><div class="rule"></div></div>
  <div class="mid"><h1>${esc(b.title)}</h1><p class="sub">${esc(b.subtitle)}</p></div>
  <div class="bot"><span class="lang">English edition</span>
    <img src="data:image/png;base64,${logo}" alt=""></div>
</body></html>`;
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined
  });
  const page = await browser.newPage({ viewport: { width: W, height: H } });

  for (const b of brochures) {
    await page.setContent(html(b), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(OUT, `${b.id}.jpg`),
      type: 'jpeg',
      quality: 88
    });
    console.log('  ✓ %s.jpg', b.id);
  }

  await browser.close();
  console.log('Rendered %d brochure covers into assets/img/brochures/', brochures.length);
})();
