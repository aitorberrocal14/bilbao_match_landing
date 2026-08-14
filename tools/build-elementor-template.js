/**
 * Builds an importable Elementor template for the landing page.
 *
 * Hybrid on purpose:
 *   · the simple sections — hero, event intro, presentation, videos, the four
 *     steps, the login band and contact — are native Elementor widgets, so the
 *     team edits them visually;
 *   · the three that depend on behaviour — the exhibitor grid with its filter,
 *     the programme tabs and the brochure gallery with its reader — stay as
 *     plugin shortcodes, because rebuilding them with widgets would make them
 *     both uglier and more fragile.
 *
 * Import it in WordPress: Templates → Saved Templates → Import Templates.
 *
 *   node tools/build-elementor-template.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'wordpress/elementor/match-bilbao-bizkaia-2026.json');

/* --- read the copy from the site data, so nothing is retyped ------------- */
const sandbox = { window: {} };
vm.createContext(sandbox);
['assets/js/data/site.js', 'assets/js/data/content.js'].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
});
const { site, presentation, experts, eventIntro } = sandbox.window.MBB;

/* --- Elementor building blocks -------------------------------------------- */
let seq = 0;
const id = () => (++seq).toString(16).padStart(7, 'a');

const RED = '#AE0000';
const GREY = '#7A7A7A';
const DARK = '#54595F';

const section = (settings, columns) => ({
  id: id(),
  elType: 'section',
  settings: Object.assign({ layout: 'boxed' }, settings),
  elements: columns,
  isInner: false
});

const column = (size, widgets, settings = {}) => ({
  id: id(),
  elType: 'column',
  settings: Object.assign({ _column_size: size, _inline_size: null }, settings),
  elements: widgets,
  isInner: false
});

const widget = (type, settings) => ({
  id: id(),
  elType: 'widget',
  widgetType: type,
  settings,
  elements: []
});

/* Heading in Bariol red — the site's own voice. */
const heading = (title, tag = 'h2', extra = {}) =>
  widget(
    'heading',
    Object.assign(
      {
        title,
        header_size: tag,
        _css_classes: 'mbb-heading',
        title_color: RED,
        typography_typography: 'custom',
        typography_font_family: 'Bariol',
        typography_font_weight: '700'
      },
      extra
    )
  );

const text = (html, extra = {}) =>
  widget(
    'text-editor',
    Object.assign(
      {
        editor: html,
        _css_classes: 'mbb-text',
        text_color: GREY,
        typography_typography: 'custom',
        typography_font_family: 'Roboto'
      },
      extra
    )
  );

const button = (label, url, outline = false) =>
  widget('button', {
    text: label,
    link: { url, is_external: '', nofollow: '' },
    _css_classes: 'mbb-button' + (outline ? ' mbb-button--outline' : ''),
    button_type: '',
    size: 'md'
  });

const shortcode = (code) => widget('shortcode', { shortcode: code });

/** Column widths that add up to exactly 100 — Elementor rejects 99 or 101. */
const split = (n) => {
  const base = Math.floor(100 / n);
  const sizes = new Array(n).fill(base);
  for (let i = 0; i < 100 - base * n; i++) sizes[i] += 1;
  return sizes;
};

const spacer = (size = 40) =>
  widget('spacer', { space: { unit: 'px', size } });

const PAD = (top, bottom) => ({
  padding: { unit: 'px', top: String(top), right: '0', bottom: String(bottom), left: '0', isLinked: false }
});

/* --- the page ------------------------------------------------------------- */
const content = [];

/* 1 — Hero (native) */
content.push(
  section(Object.assign({ content_width: { unit: 'px', size: 1140 } }, PAD(70, 50)), [
    column(60, [
      text(`<p style="letter-spacing:.14em;text-transform:uppercase;font-size:.92rem">${site.hero.kicker}</p>`, {
        text_color: '#9AA0A6'
      }),
      heading(`${site.hero.title} ${site.hero.titleYear}`, 'h1', {
        typography_font_size: { unit: 'px', size: 52 }
      }),
      text(`<p style="font-size:1.35rem;line-height:1.35">${site.hero.subtitle}</p>`, {
        text_color: DARK
      }),
      text(`<p>${site.hero.lead}</p>`),
      button('Explore the event', '#event'),
      button("Meet BB's Experts", '#experts', true)
    ]),
    column(40, [
      widget('image', {
        image: { url: '', id: '' }, // pick the hero image in the editor
        image_size: 'large',
        caption_source: 'none'
      })
    ])
  ])
);

/* Key figures (native) */
content.push(
  section(PAD(10, 60), site.hero.facts.map((f) =>
    column(25, [
      heading(f.value, 'h3', { typography_font_size: { unit: 'px', size: 34 } }),
      text(`<p style="letter-spacing:.06em;text-transform:uppercase;font-size:.8rem">${f.label}</p>`, {
        text_color: '#9AA0A6'
      })
    ])
  ))
);

/* 2 — Event introduction (native) */
content.push(
  section(PAD(60, 20), [
    column(100, [
      heading(`${site.event.name} ${site.event.edition}`, 'h2'),
      text(`<p>${eventIntro.lead}</p>`),
      button('Add to calendar', site.event.calendarUrl)
    ])
  ])
);

content.push(
  section(PAD(0, 60), eventIntro.highlights.map((h, i) =>
    column(split(eventIntro.highlights.length)[i], [
      heading(h.title, 'h3', { typography_font_size: { unit: 'px', size: 20 } }),
      text(`<p>${h.text}</p>`)
    ])
  ))
);

/* 3 — Programme (shortcode: tabs and sessions come from the admin) */
content.push(
  section(Object.assign({ _css_classes: 'mbb-soft' }, PAD(0, 0)), [
    column(100, [shortcode('[mbb_programme]')])
  ])
);

/* 4 — Presentation of Bilbao (native) */
content.push(
  section(PAD(70, 60), [
    column(55, [
      heading(presentation.title, 'h2'),
      text(
        presentation.paragraphs.map((p) => `<p>${p}</p>`).join(''),
        { _css_classes: 'mbb-text mbb-justify' }
      )
    ]),
    column(45, [
      widget('image', { image: { url: '', id: '' }, image_size: 'large', caption_source: 'none' }),
      spacer(16),
      widget('image', { image: { url: '', id: '' }, image_size: 'large', caption_source: 'none' })
    ])
  ])
);

/* The four destination pillars (native) */
content.push(
  section(PAD(0, 70), presentation.pillars.map((p) =>
    column(25, [
      heading(p.title, 'h3', { typography_font_size: { unit: 'px', size: 20 } }),
      text(`<p>${p.text}</p>`)
    ])
  ))
);

/* 5 — Latest editions (native: Elementor's own video widget, lazy loaded) */
content.push(
  section(Object.assign({ _css_classes: 'mbb-soft' }, PAD(70, 70)), [
    column(100, [heading('Match Bilbao Bizkaia Latest Editions', 'h2', { align: 'center' })])
  ])
);

content.push(
  section(Object.assign({ _css_classes: 'mbb-soft' }, PAD(0, 70)), [
    column(50, [
      widget('video', {
        youtube_url: 'https://www.youtube.com/watch?v=2tI7kgSjPi8',
        show_image_overlay: 'yes',
        image_overlay: { url: '', id: '' },
        lazy_load: 'yes',
        aspect_ratio: '169'
      }),
      heading('Match Bilbao Bizkaia 2025', 'h3', { typography_font_size: { unit: 'px', size: 20 } }),
      text('<p>Highlights of the latest edition: three days of meetings, destination visits and new business connections.</p>')
    ]),
    column(50, [
      widget('video', {
        youtube_url: '', // [second video]
        show_image_overlay: 'yes',
        lazy_load: 'yes',
        aspect_ratio: '169'
      }),
      heading('The destination in motion', 'h3', { typography_font_size: { unit: 'px', size: 20 } }),
      text('<p>A short portrait of Bilbao Bizkaia as seen by the professionals who welcome visitors every day.</p>')
    ])
  ])
);

/* 6 — Meet BB's Experts (native) */
content.push(
  section(PAD(70, 30), [
    column(100, [
      heading(experts.title, 'h2', { align: 'center' }),
      text(`<p style="text-align:center">${experts.lead}</p><p style="text-align:center">${experts.body}</p>`)
    ])
  ])
);

content.push(
  section(PAD(0, 50), experts.steps.map((s) =>
    column(25, [
      heading(s.n, 'h4', { align: 'center', typography_font_size: { unit: 'px', size: 22 } }),
      heading(s.title, 'h3', { align: 'center', typography_font_size: { unit: 'px', size: 18 } }),
      text(`<p style="text-align:center">${s.text}</p>`)
    ])
  ))
);

/* The red login band (native) */
content.push(
  section(
    Object.assign(
      { _css_classes: 'mbb-band', background_background: 'classic', background_color: RED },
      {
        padding: { unit: 'px', top: '45', right: '40', bottom: '45', left: '40', isLinked: false }
      }
    ),
    [
      column(70, [
        heading(experts.loginPanel.title, 'h3', { title_color: '#FFFFFF' }),
        text(`<p>${experts.loginPanel.text}</p>`, { text_color: '#FFFFFF' })
      ]),
      column(30, [
        widget('button', {
          text: site.login.label,
          link: { url: site.login.url, is_external: '', nofollow: '' },
          align: 'right',
          background_color: '#FFFFFF',
          button_text_color: RED,
          border_radius: { unit: 'px', top: '999', right: '999', bottom: '999', left: '999', isLinked: true }
        })
      ])
    ]
  )
);

/* 7 — Exhibitors (shortcode: the grid, the filter and the per-company pages) */
content.push(section(PAD(0, 0), [column(100, [shortcode('[mbb_exhibitors]')])]));

/* 8 — Discover (shortcode: the gallery and the Issuu reader) */
content.push(section(PAD(0, 0), [column(100, [shortcode('[mbb_discover]')])]));

/* 9 — Contact (native) */
content.push(
  section(PAD(70, 30), [
    column(100, [
      heading('Contact', 'h2', { align: 'center' }),
      text(`<p style="text-align:center">${site.contact.intro}</p>`)
    ])
  ])
);

content.push(
  section(PAD(0, 70), site.contact.channels.map((c) =>
    column(25, [
      heading(c.title, 'h3', { typography_font_size: { unit: 'px', size: 18 } }),
      text(`<p>${c.note}</p><p><a href="${c.href}">${c.value}</a></p>`)
    ])
  ))
);

/* --- write ---------------------------------------------------------------- */
const template = {
  version: '0.4',
  title: 'Match Bilbao Bizkaia 2026',
  type: 'page',
  content,
  page_settings: {
    hide_title: 'yes'
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(template, null, 1));

const count = (type) =>
  JSON.stringify(content).split('"widgetType":"' + type + '"').length - 1;

console.log('Wrote %s', path.relative(ROOT, OUT));
console.log(
  '  %d sections · %d headings · %d texts · %d buttons · %d images · %d videos · %d shortcodes',
  content.length,
  count('heading'),
  count('text-editor'),
  count('button'),
  count('image'),
  count('video'),
  count('shortcode')
);
