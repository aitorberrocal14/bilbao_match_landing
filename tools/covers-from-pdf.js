/**
 * Turns the first page of each brochure PDF into its cover image.
 *
 * Drop the PDFs in a folder, name each file after the brochure id used in
 * assets/js/data/discover.js (city-experience.pdf, coast.pdf, …) and run:
 *
 *   node tools/covers-from-pdf.js <folder>
 *
 * It writes assets/img/brochures/<id>.jpg at 800×1024 — the size the gallery
 * expects — replacing the stand-in covers. Then rebuild what you need:
 *
 *   node tools/build-standalone.js   # refreshes the single-file version
 *
 * Requires poppler-utils (`apt-get install poppler-utils`, or `brew install
 * poppler` on a Mac).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets/img/brochures');
const WIDTH = 800;
const HEIGHT = 1024;

const src = process.argv[2];
if (!src) {
  console.error('Usage: node tools/covers-from-pdf.js <folder with the PDFs>');
  process.exit(1);
}
if (!fs.existsSync(src)) {
  console.error('No such folder: %s', src);
  process.exit(1);
}

try {
  execFileSync('pdftoppm', ['-v'], { stdio: 'ignore' });
} catch (e) {
  console.error(
    'pdftoppm not found. Install poppler-utils:\n' +
      '  Debian/Ubuntu: sudo apt-get install poppler-utils\n' +
      '  macOS:         brew install poppler'
  );
  process.exit(1);
}

const pdfs = fs.readdirSync(src).filter((f) => /\.pdf$/i.test(f));
if (!pdfs.length) {
  console.error('No PDF files in %s', src);
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

pdfs.forEach((file) => {
  const id = path.basename(file, path.extname(file));
  const target = path.join(OUT, id); // pdftoppm appends the extension

  execFileSync('pdftoppm', [
    '-jpeg',
    '-jpegopt', 'quality=88',
    '-f', '1', '-l', '1',        // first page only
    '-scale-to-x', String(WIDTH),
    '-scale-to-y', String(HEIGHT),
    '-singlefile',
    path.join(src, file),
    target
  ]);

  const written = target + '.jpg';
  const size = fs.existsSync(written) ? fs.statSync(written).size : 0;
  console.log('  ✓ %s.jpg (%d KB)', id, Math.round(size / 1024));
});

console.log(
  '\nWrote %d covers into assets/img/brochures/.\n' +
    'Now run: node tools/build-standalone.js',
  pdfs.length
);
