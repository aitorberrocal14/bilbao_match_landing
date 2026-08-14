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
      time: slot.time,
      title: slot.title,
      text: slot.text || '',
      venue: slot.venue || '',
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
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
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

console.log(
  'seed.json: %d exhibitors, %d brochures, %d sessions',
  exhibitors.length,
  brochures.length,
  sessions.length
);
console.log('assets copied into the plugin');
