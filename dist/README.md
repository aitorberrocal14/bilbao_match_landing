# Single-file build

`match-bilbao-bizkaia-2026.html` is the whole site — landing page and the 39
exhibitor pages — in one file, with the stylesheet, the scripts, the Bariol
fonts, the logos and the brochure covers inlined. Download it and open it: no
server, no folder of assets, works offline.

It is meant for review and handover. The real deployment is the repository
itself, which serves a proper HTML file per exhibitor (better for search
engines and for linking).

**It is generated, so it goes stale.** After changing anything under
`assets/`, rebuild it from the repository root:

```
node tools/build-standalone.js
```
