# Match Bilbao Bizkaia — WordPress plugin

The landing page as WordPress content. Exhibitors, brochures and the programme
are edited from the admin like any other content; every section is a shortcode;
and each exhibitor keeps its own page, as on the current site.

The design is the same one as the static version — same stylesheet, same
markup — so both stay identical.

---

## Install

1. Zip the `match-bilbao-bizkaia` folder (or upload it to
   `wp-content/plugins/` by FTP).
2. **Plugins → Add New → Upload Plugin**, choose the zip, install and activate.
3. A notice appears: **“Import the starting content”**. Click it and then
   **Import now**. That creates the 39 exhibitors with their logos and profile
   texts, the 7 English brochures with their covers, and a sample three-day
   programme.
4. Go to **Match Bilbao Bizkaia → Settings** and set at least the **Login /
   meeting platform** URL. Without it the Login buttons stay hidden.
5. Create a page — *Match Bilbao Bizkaia 2026* — and paste:

   ```
   [mbb_landing]
   ```

6. **Settings → Permalinks → Save** once, so the exhibitor URLs
   (`/exhibitors/gran-hotel-domine/`) start working.

The import can be run again safely: anything already there is skipped, so your
edits are never overwritten.

---

## Where each thing is edited

| What | Where |
|---|---|
| Exhibitors — logo, category, contact block, profile text, order | **Match Bilbao Bizkaia → Exhibitors** |
| Categories of the filter | **Exhibitors → Categories** |
| Brochures — cover, subtitle, PDF link, Issuu link | **Match Bilbao Bizkaia → Brochures** |
| Programme — day, time, title, description, venue, highlight | **Match Bilbao Bizkaia → Programme** |
| Hero, dates, figures, videos, login URL, contact channels | **Match Bilbao Bizkaia → Settings** |
| The long editorial copy | in the page itself, inside the shortcodes |

**Adding an exhibitor:** Exhibitors → Add exhibitor. The title is the company
name, the **featured image** is the logo, the **main editor** is the profile
text, and the fields under *Details* are the contact block. *Order* under Page
Attributes places it in the grid. Nothing else to do — the grid, its filter and
the company's own page all update on their own.

**Linking a brochure to Issuu:** paste the normal link of the document, e.g.
`https://issuu.com/turismobilbao/docs/city_experience_en`. It is converted to
the embedded reader automatically, so the brochure is read inside the page. A
profile link is ignored — the reader needs a document.

**A YouTube video:** paste the whole URL or just the ID. Both work.

---

## Shortcodes

`[mbb_landing]` outputs the whole page. To arrange the sections yourself, or to
mix them with Elementor rows, use them one by one:

| Shortcode | Section |
|---|---|
| `[mbb_hero]` | Hero |
| `[mbb_event]…text…[/mbb_event]` | Introduction + “Add to calendar” |
| `[mbb_programme]` | The three-day agenda |
| `[mbb_presentation images="12,34,56"]…text…[/mbb_presentation]` | Presentation of Bilbao. `images` takes media IDs |
| `[mbb_editions]` | Latest editions (video) |
| `[mbb_experts]…text…[/mbb_experts]` | Meet BB's Experts + the Login band |
| `[mbb_exhibitors]` | The logo grid and its filter |
| `[mbb_discover]` | The brochures |
| `[mbb_contact]` | Contact channels |

The enclosing ones take their copy from the page editor, so the communication
team writes it with the normal WordPress editor.

Optional attributes: `title` on `[mbb_presentation]`, `[mbb_experts]`,
`[mbb_exhibitors]` and `[mbb_discover]`; `text` on the last two;
`panel_title` and `panel_text` on `[mbb_experts]`.

---

## Notes for whoever maintains it

- **The theme keeps its header, menu and footer.** The plugin only outputs the
  sections, so the page sits inside the site like any other. The Login button
  in the site's own menu is a normal menu item pointing at the platform.
- **Nothing leaks into the theme.** Every rule is scoped under `.mbb`, so
  generic names like `.section`, `.btn` or `.lead` cannot clash with the theme
  or with Elementor. The one exception is `body.mbb-no-scroll`, which the
  brochure modal needs.
- **Bariol ships with the plugin**; Roboto is loaded from Google Fonts. To
  self-host Roboto too, drop the files in `assets/fonts/` and remove the
  `mbb-roboto` handle in `match-bilbao-bizkaia.php`.
- **Videos load only on click** (`youtube-nocookie`), so no third-party request
  is made until the visitor asks for it — one less thing for the cookie banner.
- **Exhibitor template:** copy `templates/single-exhibitor.php` into your theme
  as `single-mbb_exhibitor.php` to change it without touching the plugin.
- **Regenerating the assets:** the stylesheet, the seed content and the images
  come from the static site. After editing it, run from the repository root:

  ```
  node tools/build-wp-css.js     # → wordpress/…/assets/css/mbb.css
  node tools/build-wp-seed.js    # → wordpress/…/data/seed.json + images
  ```

---

## What still needs a real WordPress

This plugin was written and rendered against a stubbed WordPress, because the
build environment has no network access to download WordPress itself. The
front-end output is verified — it renders the same HTML as the static site, and
the tabs, the category filter and the brochure modal were exercised in a
browser. The parts that only a real install can confirm are the admin screens,
the import routine writing to the media library, and the permalinks. Test those
on a staging site before going live.
