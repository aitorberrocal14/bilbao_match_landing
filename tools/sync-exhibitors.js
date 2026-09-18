/**
 * Brings the exhibitor list in from the event platform.
 *
 *   node tools/sync-exhibitors.js                  # calls the platform
 *   node tools/sync-exhibitors.js --fixture <file> # replays a saved response
 *   node tools/sync-exhibitors.js --dry-run        # says what would change
 *
 * The site is static: the visitor's browser never talks to the platform, and
 * the key never leaves the machine that runs this. What the platform returns
 * is written into assets/js/data/exhibitors.js and the logos into
 * assets/img/exhibitors/, and the ordinary build scripts turn that into pages.
 * If the platform is down, this fails and nothing changes — the site keeps
 * serving the last list it had, which is what you want during an event.
 *
 * Configuration, from the environment (never from the repository):
 *   MBB_API_URL       the endpoint
 *   MBB_API_KEY       the user_key the platform issues
 *   MBB_EVENT_ID      the event
 *
 * The platform does not carry everything the page shows — a category, a named
 * contact, a postal address — so those live in exhibitors-local.json and are
 * merged on top. A sync never overwrites them.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'assets/js/data/exhibitors.js');
const LOCAL = path.join(ROOT, 'assets/js/data/exhibitors-local.json');
const LOGOS = path.join(ROOT, 'assets/img/exhibitors');

const argv = process.argv.slice(2);
const has = (flag) => argv.includes(flag);
const valueOf = (flag) => {
  const i = argv.indexOf(flag);
  return i === -1 ? null : argv[i + 1];
};

const DRY = has('--dry-run');
const FIXTURE = valueOf('--fixture');
const ALLOW_SHRINK = has('--allow-shrink');

/* --- helpers -------------------------------------------------------------- */

/** The slug an exhibitor page is addressed by. Stable: it is what URLs use. */
function slugify(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function quote(s) {
  return "'" + String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function die(message) {
  console.error('\n  ' + message + '\n');
  process.exit(1);
}

/* --- 1. the platform's answer --------------------------------------------- */

async function fetchExhibitors() {
  if (FIXTURE) {
    console.log('Replaying %s', FIXTURE);
    return JSON.parse(fs.readFileSync(path.resolve(FIXTURE), 'utf8'));
  }

  const url = process.env.MBB_API_URL;
  const key = process.env.MBB_API_KEY;
  const event = process.env.MBB_EVENT_ID;

  if (!url || !key || !event) {
    die(
      'Set MBB_API_URL, MBB_API_KEY and MBB_EVENT_ID, or pass --fixture <file>.\n' +
      '  The key belongs in the environment or in the repository secrets,\n' +
      '  never in a file that is committed.'
    );
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      action: 'exhibitor_get_all',
      event_id: Number(event),
      user_key: key
    })
  });

  if (!res.ok) {
    die('The platform answered ' + res.status + ' ' + res.statusText + '.');
  }
  return res.json();
}

/* --- 2. reading it ---------------------------------------------------------
   Written defensively on purpose: this runs unattended, and a malformed
   answer that is quietly treated as "no exhibitors" would empty the site. */

function readResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    die('The platform did not answer with an object.');
  }

  const error = payload.error;
  if (error && Number(error.code)) {
    die('The platform refused: ' + error.code + ' ' + (error.message || ''));
  }

  const body = payload.body || {};
  // The contract writes `exhibitors` as an object; a list is what a list of
  // exhibitors actually is, so accept either rather than break on the day they
  // fix it.
  let list = body.exhibitors;
  if (list && !Array.isArray(list)) {
    list = Object.values(list);
  }
  if (!Array.isArray(list)) {
    die('The answer carried no exhibitor list (body.exhibitors).');
  }
  return list;
}

/** The English text of a description, falling back to whatever there is. */
function descriptionOf(entry) {
  const all = Array.isArray(entry.description) ? entry.description : [];
  const pick =
    all.find((d) => /^en/i.test(String(d.lang || ''))) ||
    all.find((d) => String(d.description || '').trim()) ||
    null;
  const text = pick ? String(pick.description || '') : '';

  // Paragraphs, from whatever the platform's editor produced.
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split(/\n{1,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/* --- 3. the local half ------------------------------------------------------ */

function readLocal() {
  if (!fs.existsSync(LOCAL)) return {};
  return JSON.parse(fs.readFileSync(LOCAL, 'utf8'));
}

/**
 * Finds the local record for an exhibitor, in three passes:
 *
 *   1. the platform's id, once it has been pinned — immune to renaming;
 *   2. the slug of the name, which is how most of a hand-typed list matches;
 *   3. the name recorded locally, because not every slug was derived from its
 *      name — one of them carries a typo that is live in a published URL, and
 *      those URLs are not ours to break.
 */
function localFor(local, entry, slug) {
  const keys = Object.keys(local).filter((k) => k[0] !== '_');
  const id = String(entry.id_exhibitor);

  const byId = keys.find((k) => local[k].apiId != null && String(local[k].apiId) === id);
  if (byId) return { key: byId, record: local[byId], pinned: true };

  if (local[slug]) return { key: slug, record: local[slug], pinned: false };

  const byName = keys.find((k) => local[k].name && slugify(local[k].name) === slug);
  if (byName) return { key: byName, record: local[byName], pinned: false };

  return { key: slug, record: null, pinned: false };
}

/* --- 4. logos --------------------------------------------------------------- */

async function fetchLogo(url, slug) {
  if (!url || !/^https?:\/\//i.test(url)) return null;

  const res = await fetch(url);
  if (!res.ok) {
    console.warn('  ! logo %s: %s', slug, res.status);
    return null;
  }

  const type = (res.headers.get('content-type') || '').toLowerCase();
  const ext = type.includes('png')
    ? '.png'
    : type.includes('svg')
      ? '.svg'
      : type.includes('webp')
        ? '.webp'
        : '.jpg';

  const file = slug + ext;
  const buf = Buffer.from(await res.arrayBuffer());

  const full = path.join(LOGOS, file);
  if (fs.existsSync(full) && fs.readFileSync(full).equals(buf)) {
    return file; // unchanged
  }
  if (!DRY) {
    fs.mkdirSync(LOGOS, { recursive: true });
    fs.writeFileSync(full, buf);
  }
  return file;
}

/** The logo already in the repository for this slug, whatever its extension. */
function existingLogo(slug) {
  if (!fs.existsSync(LOGOS)) return null;
  const match = fs
    .readdirSync(LOGOS)
    .find((f) => f.replace(/\.[^.]+$/, '') === slug);
  return match || null;
}

/* --- 5. writing ------------------------------------------------------------- */

function render(exhibitors, categories) {
  const lines = exhibitors.map((x) => {
    const out = [
      '  {',
      '    id: ' + quote(x.id) + ',',
      '    name: ' + quote(x.name) + ',',
      '    category: ' + quote(x.category) + ',',
      '    logo: ' + quote(x.logo) + ','
    ];

    [
      ['contactName', x.contactName],
      ['contactRole', x.contactRole],
      ['email', x.email],
      ['phone', x.phone],
      ['website', x.website],
      ['websiteLabel', x.websiteLabel],
      ['address', x.address]
    ].forEach(([key, value]) => {
      out.push('    ' + key + ': ' + quote(value) + ',');
    });

    if (x.social && Object.keys(x.social).length) {
      out.push('    social: {');
      Object.keys(x.social).forEach((k, i, all) => {
        out.push('      ' + k + ': ' + quote(x.social[k]) + (i === all.length - 1 ? '' : ','));
      });
      out.push('    },');
    }

    out.push('    paragraphs: [');
    out.push(x.paragraphs.map((p) => '      ' + quote(p)).join(',\n'));
    out.push('    ]');
    out.push('  }');
    return out.join('\n');
  });

  return (
    '/* =============================================================================\n' +
    '   EXHIBITORS\n' +
    '   -----------------------------------------------------------------------------\n' +
    '   GENERATED — do not edit by hand.\n' +
    '\n' +
    '   Written by tools/sync-exhibitors.js from the event platform. What the\n' +
    '   platform does not carry — the category, the named contact, the postal\n' +
    '   address — comes from assets/js/data/exhibitors-local.json, which is the\n' +
    '   file to edit; a sync merges it on top and never overwrites it.\n' +
    '\n' +
    '   Last sync: ' + new Date().toISOString().slice(0, 10) + '\n' +
    '   ========================================================================== */\n' +
    '\n' +
    'window.MBB = window.MBB || {};\n' +
    '\n' +
    '/* Categories as on the original site */\n' +
    'window.MBB.exhibitorCategories = [\n' +
    // Una por línea, como en el archivo escrito a mano: en varias líneas sus
    // `id:` caen a la misma sangría que los de los expositores y desbaratan
    // cualquier recuento que busque `^    id: `.
    categories
      .map((c) => '  { id: ' + quote(c.id) + ', label: ' + quote(c.label) + ' }')
      .join(',\n') +
    '\n];\n\n' +
    'window.MBB.exhibitors = [\n' +
    lines.join(',\n') +
    '\n];\n'
  );
}

/* --- main ------------------------------------------------------------------- */

(async () => {
  const payload = await fetchExhibitors();
  const raw = readResponse(payload);

  const local = readLocal();
  const categories = local._categories || [
    { id: 'all', label: 'All' },
    { id: 'accommodation', label: 'Accommodation' },
    { id: 'dmc', label: 'DMC' },
    { id: 'activities', label: 'Unique Activities' }
  ];
  const known = categories.map((c) => c.id);

  const visible = raw.filter((e) => !Number(e.hidden));
  visible.sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0));

  const uncategorised = [];
  const pinned = [];
  const exhibitors = [];

  for (const entry of visible) {
    const name = String(entry.name || '').trim();
    if (!name) continue;

    const slug = slugify(name);
    const found = localFor(local, entry, slug);
    const rec = found.record || {};
    const id = rec.slug || found.key || slug;

    if (found.record && !found.pinned) {
      pinned.push(id);
      rec.apiId = entry.id_exhibitor;
      local[found.key] = rec;
    }

    const logo = (await fetchLogo(entry.logo, id)) || existingLogo(id);

    const category = known.includes(rec.category) ? rec.category : '';
    if (!category) uncategorised.push(name);

    const web = String(entry.web || '').trim();
    exhibitors.push({
      id,
      name,
      category,
      logo: logo ? 'assets/img/exhibitors/' + logo : '',
      contactName: rec.contactName || '',
      contactRole: rec.contactRole || '',
      email: String(entry.email || '').trim(),
      phone: String(entry.phone || '').trim(),
      website: web,
      websiteLabel: web.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      address: rec.address || '',
      social: ['linkedin', 'twitter', 'facebook', 'instagram'].reduce((acc, k) => {
        const v = String(entry[k] || '').trim();
        if (v) acc[k] = v;
        return acc;
      }, {}),
      paragraphs: descriptionOf(entry)
    });
  }

  /* A sync that would gut the directory is a sync that has gone wrong. */
  const before = (fs.existsSync(DATA) ? fs.readFileSync(DATA, 'utf8').match(/^\s{4}id: /gm) || [] : []).length;
  if (before && exhibitors.length < before * 0.5 && !ALLOW_SHRINK) {
    die(
      'The platform returned ' + exhibitors.length + ' exhibitors where the site has ' +
      before + '.\n  Nothing was written. Re-run with --allow-shrink if that drop is real.'
    );
  }

  console.log(
    '%d exhibitors (%d hidden on the platform)%s',
    exhibitors.length,
    raw.length - visible.length,
    DRY ? ' — dry run, nothing written' : ''
  );
  if (pinned.length) {
    console.log('  matched by name and pinned to their platform id: %s', pinned.join(', '));
  }
  if (uncategorised.length) {
    console.log(
      '\n  %d without a category, so they appear under "All" only:\n    %s\n' +
      '  Add them to assets/js/data/exhibitors-local.json.',
      uncategorised.length,
      uncategorised.join('\n    ')
    );
  }

  if (DRY) return;

  fs.writeFileSync(DATA, render(exhibitors, categories));
  local._categories = categories;
  fs.writeFileSync(LOCAL, JSON.stringify(local, null, 2) + '\n');

  console.log('\nWrote %s', path.relative(ROOT, DATA));
  console.log('Now run: node tools/build-exhibitors.js && node tools/build-sitemap.js' +
    ' && node tools/build-wp-seed.js && node tools/build-standalone.js');
})().catch((err) => die(err && err.stack ? err.stack : String(err)));
