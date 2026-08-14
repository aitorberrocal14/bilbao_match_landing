/**
 * Normalises brochure cover images to the size the gallery expects.
 *
 * Use this when you have the covers as pictures rather than as PDFs — for
 * instance saved straight from Issuu. Name each file after the brochure id
 * used in assets/js/data/discover.js (place-to-be.jpg, coastline.png, …) and:
 *
 *   node tools/covers-from-images.js <folder>
 *
 * Every file is re-framed to 800×1024 and written to
 * assets/img/brochures/<id>.jpg. Covers are portrait, so a landscape or
 * square source is centre-cropped rather than squashed.
 *
 * For PDFs use tools/covers-from-pdf.js instead — it gives a sharper result
 * because it renders the page rather than resampling a picture of it.
 *
 * Requires Playwright (dev-only): npm i -D playwright
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets/img/brochures');
const W = 800;
const H = 1024;

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
};

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error('Usage: node tools/covers-from-images.js <folder with the images>');
  process.exit(1);
}

const files = fs
  .readdirSync(src)
  .filter((f) => MIME[path.extname(f).toLowerCase()]);

if (!files.length) {
  console.error('No images in %s', src);
  process.exit(1);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined
  });
  const page = await browser.newPage({ viewport: { width: W, height: H } });

  for (const file of files) {
    const id = path.basename(file, path.extname(file));
    const data = fs.readFileSync(path.join(src, file)).toString('base64');
    const mime = MIME[path.extname(file).toLowerCase()];

    await page.setContent(
      `<style>html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden}
       img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}</style>
       <img src="data:${mime};base64,${data}">`,
      { waitUntil: 'load' }
    );
    // Wait for the decode, otherwise a large source screenshots blank.
    await page.evaluate(
      () => document.querySelector('img').decode().catch(() => {})
    );

    await page.screenshot({
      path: path.join(OUT, `${id}.jpg`),
      type: 'jpeg',
      quality: 88
    });

    const size = fs.statSync(path.join(OUT, `${id}.jpg`)).size;
    console.log('  ✓ %s.jpg (%d KB)', id, Math.round(size / 1024));
  }

  await browser.close();
  console.log(
    '\nWrote %d covers into assets/img/brochures/.\n' +
      'Now run: node tools/build-wp-seed.js && node tools/build-standalone.js',
    files.length
  );
})();
