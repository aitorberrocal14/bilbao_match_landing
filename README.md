# Match Bilbao Bizkaia 2026 — Landing page

A modern, responsive, single-page landing site for the 2026 edition of **Match
Bilbao Bizkaia**, the professional meeting point of the Bilbao Bizkaia
destination.

The design keeps the institutional character of the current site — the red
wordmark, the tourism-authority tone, the exhibitor directory — but rebuilds it
around a clearer hierarchy, more whitespace, larger visuals and a content model
that can be updated without touching markup.

```
npx serve .        # or: python3 -m http.server 8000
```

No build step, no dependencies. Open `index.html` through a local server (the
data files are plain scripts, so `file://` also works).

To send the concept to someone who should just double-click a file:

```
node tools/build-standalone.js     # → dist/match-bilbao-bizkaia-2026.html
```

That produces one self-contained HTML file with all CSS, JS and images inlined.
It is a convenience for review only — deploy the repository as-is.

---

## 1. Site structure

Single page, five sections, one persistent navbar.

| # | Section | Anchor | Replaces / notes |
|---|---------|--------|------------------|
| — | Navbar + Login | — | Home · Match Bilbao Bizkaia 2026 · Meet BB's Experts · Discover · Contact · **Login** |
| 1 | Hero / Home | `#home` | New — full-bleed, event identity, three CTAs, fact strip |
| 2 | Match Bilbao Bizkaia 2026 | `#event` | Replaces **"Match in Places"** — becomes the main event section |
| 2a | · Event Programme | `#event` | New — three-day tabbed timeline |
| 2b | · Presentation of Bilbao | `#presentation` | Rewritten destination copy + four pillars |
| 2c | · Latest Editions | `#editions` | Two YouTube slots with captions |
| 3 | Meet BB's Experts | `#experts` | Renames **"Virtual Match"**; contains the second Login button and the exhibitor directory |
| 4 | Discover Bilbao Bizkaia | `#discover` | Simplified — English brochures only |
| 5 | Contact | `#contact` | Contact channels + newsletter |
| — | Footer | — | Institutional band, navigation, social, legal |

**Removed as requested:** the entire *Match Live* screen and its four
session cards. Nothing from it is carried over.

---

## 2. UX/UI concept

**The idea in one line:** an institutional site that behaves like a premium
destination brochure — calm, spacious, image-led, with everything a
professional visitor needs reachable in one scroll.

**Principles applied**

- **One page, one narrative.** What the event is → when it happens → where it
  happens → who you will meet → what you can take away → how to reach us. The
  navbar mirrors that order, so the menu is a table of contents, not a
  sitemap.
- **Two decisions per screen, maximum.** Every section offers a primary action
  (explore, log in, view brochure) and at most one secondary one. The old site
  asked visitors to choose between seven top-level items before knowing what
  the event was.
- **Login is never more than one glance away.** It sits in the navbar at all
  times, in the hero, in a dedicated panel inside *Meet BB's Experts* and in
  the footer — four entry points, one destination.
- **Scannable density where it matters.** The exhibitor directory is the
  working tool of the site: category tabs, live search and a running count let
  a buyer find "the DMCs" in two clicks instead of scrolling 39 cards.
- **Content, not layout, is what changes.** Every list on the page — days,
  slots, exhibitors, brochures, contact channels — is a data file. Adding the
  2027 edition means editing JavaScript objects, not HTML.
- **Restrained motion.** A soft reveal on scroll, a colour shift on the navbar,
  a lift on hover. Nothing parallaxes, nothing autoplays with sound, and
  everything stops under `prefers-reduced-motion`.
- **Accessibility as part of the institutional standard.** Skip link, semantic
  landmarks, ARIA tabs and filters, visible focus rings, ~AA contrast on text,
  keyboard-navigable modal and menu.

---

## 3. Section-by-section copy

All visible copy lives in `assets/js/data/`. The full English text is written
there and can be handed to the communications team as-is.

| Content | File |
|---|---|
| Navigation, hero, contact, footer, newsletter | `data/site.js` |
| Event intro, Presentation of Bilbao, pillars, Meet BB's Experts | `data/content.js` |
| Three-day programme | `data/programme.js` |
| 39 exhibitors + categories | `data/exhibitors.js` |
| Brochures + edition videos | `data/discover.js` |

**Tone:** institutional, tourism-oriented, polished, welcoming, written for an
international trade audience. British English throughout, sentence case for
headings, no exclamation marks, no marketing superlatives.

**Highlights**

- *Hero:* "Match Bilbao Bizkaia 2026 — The official professional meeting point
  of the Bilbao Bizkaia destination."
- *Event:* "Match Bilbao Bizkaia is the professional meeting point where the
  destination presents itself to the international travel trade…"
- *Presentation of Bilbao:* four paragraphs covering the city's
  transformation, the concentration of coast/nature/gastronomy in Bizkaia, the
  practical advantages for professional visitors, and the invitation to do
  business — rewritten from the themes of the current site rather than copied.
- *Meet BB's Experts:* "Behind every itinerary there is someone local who makes
  it work…" plus a four-step "how it works" sequence.
- *Discover:* "Seven official guides to Bilbao Bizkaia, in English…"

---

## 4. Wireframe / content outline

```
┌─ NAVBAR ─ wordmark · 2026 ─────── nav items ──────── [ Login ] ─┐  sticky
└─────────────────────────────────────────────────────────────────┘

┌─ 1. HERO ───────────────────────────────────── full viewport ───┐
│  ● 8–10 June 2026 · Bilbao, Basque Country                      │
│  MATCH BILBAO BIZKAIA                                           │
│  2026                          (outlined)                       │
│  Subtitle · value proposition                                   │
│  [Explore the event] [Meet BB's Experts] [Login]                │
│ ─────────────────────────────────────────────────────────────── │
│  39+ exhibitors │ 3 days │ 4 pillars │ 1:1 meetings             │
└─────────────────────────────────────────────────────────────────┘

┌─ 2. MATCH BILBAO BIZKAIA 2026 ──────────────────────────────────┐
│  eyebrow / H2 / lead / [Add to calendar]   │  3 highlights      │
│                                                                 │
│  EVENT PROGRAMME                                                │
│  [ Day 1 ][ Day 2 ][ Day 3 ]  ← tabs                            │
│  09:00 ─●─ Accreditation and welcome coffee                     │
│  10:00 ─●─ ▓ Official opening (featured card)                   │
│  …                                                              │
└─────────────────────────────────────────────────────────────────┘

┌─ 2b. PRESENTATION OF BILBAO ─────────────── light background ───┐
│  Editorial column (4 paragraphs)     │  Image mosaic (1 + 2)    │
│  ── City ── Coast ── Culture ── Nature ──  (4 pillar cards)     │
└─────────────────────────────────────────────────────────────────┘

┌─ 2c. LATEST EDITIONS ────────────────────── dark background ────┐
│  [ ▶ video 1 ]            [ ▶ video 2 ]                         │
│  caption                  caption                               │
└─────────────────────────────────────────────────────────────────┘

┌─ 3. MEET BB'S EXPERTS ──────────────────────────────────────────┐
│  intro copy                          │  01 02 / 03 04 steps     │
│  ▓▓ Already registered? …                        [ Login ] ▓▓   │
│                                                                 │
│  EXHIBITORS                                                     │
│  [All 39][Hotels 21][DMCs 9][Agencies 2]…      [ search 🔍 ]    │
│  ┌ logo ┐ ┌ logo ┐ ┌ logo ┐ ┌ logo ┐                            │
│  │ card │ │ card │ │ card │ │ card │  … 39 cards                │
└─────────────────────────────────────────────────────────────────┘

┌─ 4. DISCOVER BILBAO BIZKAIA ─────────────── light background ───┐
│  ┌cover┐ ┌cover┐ ┌cover┐ ┌cover┐ ┌cover┐ ┌cover┐ ┌cover┐        │
│  title  title  title  title  title  title  title                │
│  ↓ View brochure → modal (Issuu embed or PDF preview panel)     │
└─────────────────────────────────────────────────────────────────┘

┌─ 5. CONTACT ─────────────────────────────── dark background ────┐
│  Let's talk                    │  4 contact channel cards       │
│  Newsletter: [ email ] [Subscribe]                              │
└─────────────────────────────────────────────────────────────────┘

┌─ FOOTER ────────────────────────────────────────────────────────┐
│  ░ In cooperation with: institutional logos (light band) ░      │
│  wordmark + statement │ Navigate │ Event │ Follow                │
│  © 2026 Bilbao Bizkaia          Privacy · Cookies · Legal        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Visual design direction

**Colour** — sampled from the official marks, so the palette is the brand's own.

| Token | Value | Use |
|---|---|---|
| `--red` | `#BE1E2D` | Brand red, sampled from the Match wordmark. Primary actions, eyebrows, accents |
| `--red-deep` | `#9C1524` | Hover state |
| `--burgundy` / `--burgundy-ink` | `#6D0F1E` / `#3D0910` | Deep gradients in the hero and login panel |
| `--ink` | `#14161A` | Charcoal for dark sections, headings, footer |
| `--sand` / `--sand-2` | `#F6F3F0` / `#EFEAE5` | Warm light neutrals — alternating section grounds |
| `--line` | `#E4DFDA` | Hairlines, card borders, dividing grids |
| `--white` | `#FFFFFF` | Base ground, card fills, institutional logo band |

Red is used as punctuation, never as a field: accents, a single primary button
per screen, timeline markers, the 3px rule under each heading. The rhythm of the
page comes from alternating white → sand → charcoal grounds.

**Typography** — a single grotesque family across the page, differentiated by
weight and tracking rather than by mixing typefaces. Display sizes are set at
`800` weight with `-0.035em` tracking for a compact, confident masthead;
body text runs at `1.65` line height for long-form readability. The stack is
`Inter` first with a full system fallback, so the page renders identically
without any webfont request. To move to a licensed institutional face, change
`--font-display` / `--font-sans` in `styles.css` — nothing else needs editing.

**Layout** — a 1240px shell with fluid gutters (`clamp(1.25rem, 5vw, 3.5rem)`)
and fluid section rhythm (`clamp(4.5rem, 9vw, 8.5rem)`). Content columns are
asymmetric (roughly 55/45) so editorial text never exceeds a comfortable
measure. Cards use 10–16px radii, hairline borders and shadow only on hover —
elevation signals interactivity, not decoration.

**Imagery** — large, uncropped, always with a caption. The hero takes a
full-bleed image or muted video loop behind a dual gradient scrim, so headline
contrast holds regardless of the photograph chosen.

**Motion** — a 22px rise + fade on entry (`cubic-bezier(0.22, 0.61, 0.36, 1)`,
750ms), staggered per group; navbar transitions from transparent to frosted
white after the hero; buttons lift 1px. All of it disabled under
`prefers-reduced-motion`.

---

## 6. Front-end implementation

### Architecture

```
index.html                  Section shells + mount points only
assets/
  css/styles.css            Design tokens → components → responsive
  js/
    data/site.js            Nav, hero, contact, footer, newsletter, login URL
    data/content.js         Event intro, Presentation of Bilbao, experts copy
    data/programme.js       Days → slots
    data/exhibitors.js      39 exhibitors + category taxonomy
    data/discover.js        Brochures + edition videos
    components.js           Pure render functions (data in → HTML out)
    main.js                 Mounting + interactions
  img/
    brand/                  Match wordmark + institutional logos
    exhibitors/             39 logos, named after each exhibitor id
    brochures/              Brochure covers (drop-in)
    photos/                 Destination photography (drop-in)
```

`index.html` contains no content. Each section is an empty shell with a
`data-mount` attribute; `main.js` fills it from `components.js`. Every component
is a pure function of its data, which makes the port to React or Next.js
mechanical:

```js
// today
MBB.ExhibitorCard(exhibitor, categories)   // → HTML string

// as a React component — same props, same output
<ExhibitorCard exhibitor={exhibitor} categories={categories} />
```

For Next.js, move `assets/js/data/*.js` to `/data` as ES modules, translate
`components.js` into `/components/*.jsx` one-for-one, and keep `styles.css` as
a global stylesheet or split it per component. The data contracts do not change.

### Interactions in `main.js`

| | |
|---|---|
| Navbar | Transparent over hero → frosted when pinned; mobile drawer; scroll-spy sets `aria-current` |
| Programme | ARIA tablist, arrow-key navigation between days |
| Directory | Category filter + live search (AND logic), live result count, empty state |
| Videos | Click-to-load facade — the YouTube iframe (`youtube-nocookie`) is only injected on play, so no third-party request on first load |
| Brochures | Modal with focus management and Escape-to-close; Issuu embeds inline, PDFs get a preview panel with open/download actions |
| Images | Capture-phase `error` handler swaps any missing file for a branded placeholder — the layout never breaks on a missing asset |
| Newsletter | Client-side validation; posts to `site.newsletter.action` once set |

### Adding content later

**A new exhibitor** — drop `assets/img/exhibitors/my-company.jpg` and append:

```js
{
  id: 'my-company',
  name: 'My Company',
  category: 'dmc',              // must match a category id
  logo: 'assets/img/exhibitors/my-company.jpg',
  description: 'One short sentence.',
  website: 'https://example.com'
}
```

**A new category** — add one entry to `MBB.exhibitorCategories`. The filter tab
and its count appear automatically; empty categories are hidden.

**A programme change** — edit `data/programme.js`. Days and slots render in the
order they appear; `feature: true` promotes a slot to a highlighted card.

**A new edition** — duplicate the repository, change `site.event`, replace the
programme, swap the video IDs. The design does not need to be touched.

---

## Placeholders to replace before going live

| Placeholder | Where | What is needed |
|---|---|---|
| `[Insert hero image or video]` | `site.js › hero.media` | 2400×1350 JPG at `assets/img/photos/hero.jpg`, or an MP4 loop |
| `[Insert Bilbao city image]`, `[Insert gastronomy image]` | `content.js › presentation.media` | Two destination photos |
| `[Insert YouTube video 1 / 2]` | `discover.js › editions` | Two YouTube video IDs |
| `[Insert brochure cover]` | `assets/img/brochures/` | Seven covers named `city-experience.jpg`, `coast.jpg`, `culture.jpg`, `naturally.jpg`, `gastronomy.jpg`, `identity.jpg`, `drive-enjoy.jpg` |
| `[Insert Issuu brochure link]` | `discover.js › brochures` | Optional — enables the inline reader instead of the PDF panel |
| `[Insert English PDF link]` | `discover.js › naturally` | The *Naturally* English PDF is missing on the current site |
| `[Insert login / meeting platform URL]` | `site.js › login.url` | The real platform URL — until then the buttons show a notice |
| `[Insert newsletter endpoint]` | `site.js › newsletter.action` | CRM or mailing-platform endpoint |
| `[Insert legal link]` × 4 | `site.js › footer.legal` | Privacy, cookies, legal notice, accessibility |
| `[Insert venue]` / `[Insert programme details]` | `programme.js` | Confirmed venues and times |
| `[Insert social share image]` | `index.html` | 1200×630 Open Graph image |

### Assets carried over from the current site

Real and reusable: the **Match Bilbao Bizkaia wordmark**, the **39 exhibitor
logos**, the four **institutional logos** and one **coastline photograph**. The
brochure cover files in the source export were reconstructed grey placeholders
rather than the real artwork, so they were not shipped — the gallery renders a
branded stand-in until the genuine covers are supplied.

### Content decisions worth confirming

- **Dates.** 8–10 June 2026 is a working assumption based on the June pattern of
  previous editions. Set the real dates in `site.js › event` and
  `programme.js`.
- **Exhibitor categories.** The source site had three (Accommodation, DMC,
  Unique Activities). These were expanded to six to match the requested
  taxonomy; associations (NEKATUR, Aktiba, OPCE Vasca) were moved to
  *Institutions & associations*, and travel agencies and tourism services split
  out of *DMC*. Reassign freely by editing each `category` field.
- **Exhibitor descriptions** were condensed to one sentence each from the
  profile text on the current site, and lightly edited into consistent English.
