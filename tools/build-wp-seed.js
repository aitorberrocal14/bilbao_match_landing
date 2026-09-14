/**
 * Packages the site content for the WordPress plugin:
 *   · wordpress/match-bilbao-bizkaia/data/seed.json  (exhibitors, brochures, programme)
 *   · the fonts, logos, covers and brand images the plugin needs
 *
 * Run it after changing anything under assets/js/data/.
 *
 *   node tools/build-wp-seed.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const PLUGIN = path.join(ROOT, 'wordpress/match-bilbao-bizkaia');

/* --- read the browser data files ---------------------------------------- */
const sandbox = { window: {} };
vm.createContext(sandbox);
[
  'assets/js/data/exhibitors.js',
  'assets/js/data/discover.js',
  'assets/js/data/programme.js'
].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
});
const MBB = sandbox.window.MBB;

/* --- exhibitors ---------------------------------------------------------- */
const exhibitors = MBB.exhibitors.map((x) => ({
  slug: x.id,
  name: x.name,
  category: x.category === 'activities' ? 'activities' : x.category,
  logo: path.basename(x.logo),
  contact_name: x.contactName,
  contact_role: x.contactRole,
  email: x.email,
  phone: x.phone,
  website: x.website,
  website_label: x.websiteLabel,
  address: x.address,
  paragraphs: x.paragraphs
}));

/* --- brochures ----------------------------------------------------------- */
const brochures = MBB.discover.brochures.map((b) => ({
  slug: b.id,
  title: b.title,
  subtitle: b.subtitle,
  cover: path.basename(b.cover),
  pdf: b.pdf,
  issuu: b.issuu
}));

/* --- programme ----------------------------------------------------------- */
const sessions = [];
MBB.programme.days.forEach((day, i) => {
  day.slots.forEach((slot) => {
    sessions.push({
      day: i + 1,
      time: slot.time || '',
      end: slot.end || '',
      title: slot.title,
      text: slot.text || '',
      venue: slot.venue || '',
      // '' on a day everyone shares; 'g1'/'g2' on the day that splits.
      group: slot.group || '',
      // A slot whose hour follows a flight rather than the programme.
      open: !!slot.open,
      feature: !!slot.feature
    });
  });
});

fs.mkdirSync(path.join(PLUGIN, 'data'), { recursive: true });
fs.writeFileSync(
  path.join(PLUGIN, 'data/seed.json'),
  JSON.stringify({ exhibitors, brochures, sessions }, null, 1)
);

/* --- assets -------------------------------------------------------------- */
// The destination is a mirror of the source, not an accumulation of everything
// that has ever been there: anything the source no longer has is dropped, so a
// renamed or retired image cannot linger inside the plugin.
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  const keep = new Set(fs.readdirSync(from));
  for (const name of fs.readdirSync(to)) {
    if (!keep.has(name)) fs.rmSync(path.join(to, name), { recursive: true, force: true });
  }
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

copyDir(path.join(ROOT, 'assets/fonts'), path.join(PLUGIN, 'assets/fonts'));
copyDir(path.join(ROOT, 'assets/img/exhibitors'), path.join(PLUGIN, 'assets/img/exhibitors'));
copyDir(path.join(ROOT, 'assets/img/brochures'), path.join(PLUGIN, 'assets/img/brochures'));
copyDir(path.join(ROOT, 'assets/img/brand'), path.join(PLUGIN, 'assets/img/brand'));
// The hero and the destination mosaic take their images from the Media Library
// by attachment ID, so these are not read from disk by the plugin — they ship
// with it only so the editor has them to hand when uploading.
copyDir(path.join(ROOT, 'assets/img/photos'), path.join(PLUGIN, 'assets/img/photos'));

console.log(
  'seed.json: %d exhibitors, %d brochures, %d sessions',
  exhibitors.length,
  brochures.length,
  sessions.length
);
console.log('assets copied into the plugin');
