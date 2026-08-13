# Match Bilbao Bizkaia 2026

Landing page for the 2026 edition of **Match Bilbao Bizkaia**, the professional
meeting point of the Bilbao Bizkaia destination.

The visual language is the one of the current website — Bariol headings in the
institutional red, Roboto body copy, a white ground, the full-bleed exhibitor
logo grid and the dark footer with its diagonal edge. What changes is the
structure of the site, not its look.

```
open index.html          # works straight from the file system
python3 -m http.server   # or serve the folder, if you prefer
```

No build step and no dependencies to view the site. Three small Node scripts
regenerate content (see *Build scripts* below).

There is also a **single-file version** for review or handover:

```
node tools/build-standalone.js   # → dist/match-bilbao-bizkaia-2026.html
```

One HTML file with the stylesheet, the scripts, the Bariol fonts, the 39 logos
and the brochure covers inlined; the exhibitor pages become views of the same
document, addressed by `#/exhibitor/<id>` so the back button keeps working. It
is for sharing only — deploy the folder, which serves a real HTML file per
exhibitor.

---

## 1. Site structure

One landing page, plus one page per exhibitor.

| Section | Anchor | Notes |
|---|---|---|
| Header + **Login** | — | Home · Match Bilbao Bizkaia 2026 · Meet BB's Experts · Discover · Contact |
| **1. Hero / Home** | `#home` | Event title, subtitle, value proposition, CTAs, key figures |
| **2. Match Bilbao Bizkaia 2026** | `#event` | Replaces *Match in Places* as the main event section |
| · Event Programme | `#programme` | Three-day agenda, one tab per day |
| · Presentation of Bilbao | `#presentation` | Destination copy + the four pillars |
| · Latest Editions | `#editions` | Two YouTube slots with captions |
| **3. Meet BB's Experts** | `#experts` | Renames *Virtual Match*; holds the second Login button |
| · Exhibitors | `#exhibitors` | Logo grid + category filter |
| **4. Discover Bilbao Bizkaia** | `#discover` | The seven English brochures |
| **5. Contact** | `#contact` | Contact channels + newsletter |
| Footer | — | Institutional logos, navigation, social, legal |
| **Exhibitor pages** | `exhibitors/<id>.html` | One screen per company, as on the current site |

*Match Live* is removed entirely.

---

## 2. UX/UI concept

**The idea:** keep the institutional face of the site exactly as it is, and put
the structure behind it in order.

- **One page, one narrative.** What the event is → when → where → who you will
  meet → what you can take away → how to reach us. The navigation mirrors that
  order, so the menu reads as a table of contents.
- **The brand comes first in the directory.** Exhibitors are shown as a dense,
  edge-to-edge grid of logos with no card chrome, exactly as today: the visitor
  recognises companies by their mark, not by a text label. The name appears on
  hover, and the logo is the link.
- **Every exhibitor keeps its own screen.** Clicking a logo opens a full page
  with the logo, category, contact block and profile text — the same layout the
  current site uses — generated from the same data as the grid.
- **Login is never far.** Header, hero, the red band inside *Meet BB's Experts*,
  and the footer.
- **Content, not layout, is what changes.** Days, slots, exhibitors, brochures
  and contact channels are all data files.
- **Restrained motion.** A soft fade-in on scroll and nothing else; disabled
  under `prefers-reduced-motion`.
- **Accessibility.** Skip link, semantic landmarks, ARIA tabs and filters,
  visible focus rings, keyboard-navigable menu and modal.

---

## 3. Section-by-section copy

All visible copy lives in `assets/js/data/` and can be edited without touching
markup.

| Content | File |
|---|---|
| Navigation, hero, contact, footer, newsletter | `data/site.js` |
| Event intro, Presentation of Bilbao, pillars, Meet BB's Experts | `data/content.js` |
| Three-day programme | `data/programme.js` |
| 39 exhibitors, with contact block and profile text | `data/exhibitors.js` |
| Brochures + edition videos | `data/discover.js` |

**Tone:** institutional, tourism-oriented, polished, welcoming, written for an
international trade audience. British English, sentence case, no superlatives.

Exhibitor profile texts, contact people, addresses and websites are carried over
verbatim from the current site.

---

## 4. Wireframe / content outline

```
┌─ HEADER ─ wordmark · 2026 ─────── nav ──────────────── [ LOGIN ] ─┐  sticky
└───────────────────────────────────────────────────────────────────┘

┌─ 1. HERO ─────────────────────────────────────────────────────────┐
│  8–10 JUNE 2026 · BILBAO, BASQUE COUNTRY                          │
│  Match Bilbao Bizkaia 2026        │   [ hero image ]              │
│  subtitle · value proposition     │                               │
│  [Explore the event][Meet BB's Experts][Login]                    │
│ ───────────────────────────────────────────────────────────────── │
│  39+ exhibitors │ 3 days │ 4 pillars │ 1:1 meetings               │
└───────────────────────────────────────────────────────────────────┘

┌─ 2. MATCH BILBAO BIZKAIA 2026 ────────────────────────────────────┐
│  H2 · lead · [Add to calendar]                                    │
│  Structured B2B meetings │ The destination first hand │ Network    │
└───────────────────────────────────────────────────────────────────┘

┌─ EVENT PROGRAMME ──────────────────────────────── light ground ───┐
│              Monday 8 June · Tuesday 9 June · Wednesday 10 June    │
│  09:00 │ Accreditation and welcome coffee                         │
│  10:00 │ Official opening — Bilbao Bizkaia 2026                   │
│  …                                                                │
└───────────────────────────────────────────────────────────────────┘

┌─ PRESENTATION OF BILBAO ──────────────────────────────────────────┐
│  Editorial column (4 paragraphs)      │  photographs              │
│  City ── Coast ── Culture & gastronomy ── Nature                  │
└───────────────────────────────────────────────────────────────────┘

┌─ LATEST EDITIONS ──────────────────────────────── light ground ───┐
│  [ ▶ video 1 ]                    [ ▶ video 2 ]                   │
└───────────────────────────────────────────────────────────────────┘

┌─ 3. MEET BB'S EXPERTS ────────────────────────────────────────────┐
│                       intro copy (centred)                        │
│      ①            ②             ③             ④                   │
│  ▓▓ Already registered? ……………………………………… [ LOGIN ] ▓▓ (red band)   │
│                                                                   │
│                          Exhibitors                               │
│           All · Accommodation · DMC · Unique Activities           │
│  ┌──────┬──────┬──────┬──────┐   full-bleed logo grid             │
│  │ logo │ logo │ logo │ logo │   → each tile links to its page    │
│  └──────┴──────┴──────┴──────┘                                    │
└───────────────────────────────────────────────────────────────────┘

┌─ EXHIBITOR PAGE — exhibitors/<id>.html ───────────────────────────┐
│                       Company name (red)                          │
│  ┌──────────┐   ▸ contact person   ▸ email                        │
│  │   logo   │   ▸ role             ▸ phone                        │
│  └──────────┘   ▸ website          ▸ address                      │
│   Category                                                        │
│  Justified profile text …                                         │
│                  See more exhibitors > >                          │
│  ┌──────┬──────┬──────┬──────┐  four related exhibitors           │
└───────────────────────────────────────────────────────────────────┘

┌─ 4. DISCOVER BILBAO BIZKAIA ──────────────────── light ground ────┐
│  ┌cover┐ ┌cover┐ ┌cover┐ ┌cover┐   7 English brochures            │
│  title  title  title  title        → view / download PDF          │
└───────────────────────────────────────────────────────────────────┘

┌─ 5. CONTACT ──────────────────────────────────────────────────────┐
│  4 contact channels · newsletter                                  │
└───────────────────────────────────────────────────────────────────┘

╲───── diagonal edge ───────────────────────────────────────────────╱
┌─ FOOTER (charcoal) ───────────────────────────────────────────────┐
│  Bilbao Bizkaia · España · Euskadi · Gobierno Vasco               │
│  wordmark + statement │ Navigate │ Event │ Follow                 │
└───────────────────────────────────────────────────────────────────┘
```

---

## 5. Visual design direction

Taken from the current site, not reinvented.

**Colour**

| Token | Value | Origin |
|---|---|---|
| `--red` | `#AE0000` | Heading colour of the current site (Elementor "primary") |
| `--red-btn` | `#C9202C` | The LOG IN pill |
| `--grey-dark` | `#54595F` | Elementor "secondary" |
| `--grey` | `#7A7A7A` | Body text colour |
| `--charcoal` | `#333333` | Footer |
| `--bg` / `--bg-soft` | `#FFFFFF` / `#F7F7F7` | White ground, with a soft grey for alternating sections |

**Typography** — **Bariol Bold** for every heading, in red, self-hosted from the
font files of the current site (`assets/fonts/`). **Roboto** for body copy, in
grey, loaded from Google Fonts with a system fallback. Both are exactly what the
site uses today.

**Layout** — 1140px shell (1300px for the exhibitor grid), fluid gutters, white
sections alternating with `#F7F7F7`. No card borders or shadows in the content
areas; separation comes from whitespace and hairline rules, as on the original.

**Exhibitor grid** — four square tiles per row, no gaps, logo `object-fit:
contain` on white so every mark keeps its own background. Three columns below
900px, two below 620px.

**Footer** — the diagonal edge is a white block with a charcoal triangle cut into
it (`clip-path`), reproducing the wedge of the current site. The Bilbao Bizkaia
mark sits directly on the charcoal; the partner marks sit in white boxes.

**Motion** — a 16px fade-and-rise on entry, 600ms. Nothing else.

---

## 6. Front-end implementation

```
index.html                  Section shells + mount points only
exhibitors/<id>.html        39 generated exhibitor pages
assets/
  css/styles.css            Fonts → tokens → components → responsive
  fonts/                    Bariol regular + bold
  js/
    data/site.js            Nav, hero, contact, footer, newsletter, login URL
    data/content.js         Event intro, Presentation of Bilbao, experts copy
    data/programme.js       Days → slots
    data/exhibitors.js      39 exhibitors (contact block + profile text)
    data/discover.js        Brochures + edition videos
    components.js           Pure render functions (data in → HTML out)
    main.js                 Mounting + interactions
  img/
    brand/ exhibitors/ brochures/ photos/
tools/
  build-exhibitors.js       Generates exhibitors/*.html
  build-brochure-covers.js  Renders the brochure cover images
  build-standalone.js       Bundles everything into one shareable HTML file
```

`index.html` holds no content: each section is an empty shell with a
`data-mount` attribute that `main.js` fills from `components.js`. Every component
is a pure function of its data, so the port to React or Next.js is mechanical:

```js
MBB.ExhibitorTile(exhibitor)                  // → HTML string
<ExhibitorTile exhibitor={exhibitor} />       // same props, same output
```

The exhibitor pages are generated by running the *same* components in Node, so
the grid and the detail pages can never drift apart.

### Interactions

| | |
|---|---|
| Header | Mobile drawer, scroll-spy sets `aria-current` |
| Programme | ARIA tablist, arrow-key navigation between days |
| Exhibitors | Category filter; each tile links to its own page |
| Videos | Click-to-load facade — the `youtube-nocookie` iframe is injected only on play |
| Brochures | Modal preview with focus management and Escape-to-close |
| Images | Capture-phase `error` handler swaps a missing file for a labelled placeholder |
| Newsletter | Client-side validation; posts to `site.newsletter.action` once set |

### Build scripts

```
node tools/build-exhibitors.js        # after editing data/exhibitors.js
node tools/build-brochure-covers.js   # only to regenerate the cover images
node tools/build-standalone.js        # one-file version for sharing
```

`build-brochure-covers.js` needs Playwright (`npm i -D playwright`); the other
two have no dependencies. None of them is needed to view the site.

### Adding content later

**A new exhibitor** — drop `assets/img/exhibitors/my-company.jpg`, append an
entry to `data/exhibitors.js`, run `node tools/build-exhibitors.js`:

```js
{
  id: 'my-company',
  name: 'My Company',
  category: 'accommodation',        // accommodation | dmc | activities
  logo: 'assets/img/exhibitors/my-company.jpg',
  contactName: 'Name Surname',
  contactRole: 'Sales Manager',
  email: 'sales@example.com',
  phone: '34600000000',
  website: 'https://example.com',
  websiteLabel: 'www.example.com',
  address: 'Street 1, 48001 Bilbao Bizkaia',
  paragraphs: ['First paragraph.', 'Second paragraph.']
}
```

**A new category** — add one entry to `MBB.exhibitorCategories`; the filter
appears automatically and empty categories are hidden.

**A programme change** — edit `data/programme.js`. `feature: true` highlights a
slot.

**A new edition** — change `site.event`, replace the programme, swap the video
IDs. The design does not need to be touched.

---

## Placeholders to replace before going live

| Placeholder | Where | What is needed |
|---|---|---|
| `[Insert hero image]` | `site.js › hero.media` | A landscape destination photo at `assets/img/photos/hero.jpg` |
| `[Insert Bilbao city image]`, `[Insert gastronomy image]` | `content.js › presentation.media` | Two destination photos |
| `[Insert YouTube video 1 / 2]` | `discover.js › editions` | Two YouTube video IDs |
| Brochure covers | `assets/img/brochures/` | See *Brochures* below |
| `[Insert English PDF link]` | `discover.js › naturally` | The *Naturally* English PDF — missing on the current site |
| `[Insert Issuu brochure link]` | `discover.js › brochures` | Optional: enables the inline reader instead of the preview panel |
| `[Insert login / meeting platform URL]` | `site.js › login.url` | The real platform URL |
| `[Insert newsletter endpoint]` | `site.js › newsletter.action` | CRM or mailing-platform endpoint |
| `[Insert legal link]` × 4 | `site.js › footer.legal` | Privacy, cookies, legal notice, accessibility |
| `[Insert venue]` / times | `programme.js` | Confirmed venues and times |
| `[Insert social share image]` | `index.html` | 1200×630 Open Graph image |

### Brochures

All seven English brochures are included, each with a cover: *City &
Experience*, *The Sea in its Soul*, *Crossroads of Culture*, *Naturally*,
*Gastronomy & Wine Tourism*, *Identity in Itself* and *Drive & Enjoy*. Six link
to the official Visit Biscay PDF; *Naturally* needs its English PDF link.

The cover images in `assets/img/brochures/` were designed for this site, in the
destination's own colours and typeface. The files in the source export were grey
reconstruction placeholders, not the real artwork, and the official PDFs are not
reachable from this environment. **To use the real covers, export the first page
of each PDF at 800×1024 and overwrite the JPG of the same name** — nothing else
changes.

### Assets carried over from the current site

The Match Bilbao Bizkaia wordmark, the Bariol typeface, the 39 exhibitor logos
with their full profile data, the four institutional logos and one coastline
photograph.

### Content decisions worth confirming

- **Dates.** 8–10 June 2026 is a working assumption based on the June pattern of
  previous editions. Set the real dates in `site.js › event` and `programme.js`.
- **Categories.** The three categories of the current site are kept as they
  are: Accommodation, DMC and Unique Activities.
