/* =============================================================================
   DISCOVER — ENGLISH BROCHURES
   -----------------------------------------------------------------------------
   Only the English editions are listed, as agreed for the 2026 site.

   Each item supports two display modes:
     • `pdf`   — opens / downloads the official PDF (used today)
     • `issuu` — set an Issuu reader URL and the card opens an embedded preview
   If both are present, the embedded Issuu preview takes priority in the modal
   and the PDF stays available as a download link.
   ========================================================================== */

window.MBB = window.MBB || {};

window.MBB.discover = {
  intro:
    'Seven official guides to Bilbao Bizkaia, in English. Browse them online ' +
    'or download them to prepare your programmes, itineraries and client ' +
    'proposals.',
  brochures: [
    {
      id: 'city-experience',
      title: 'City & Experience',
      subtitle: 'The art of living: Bilbao urban experiences.',
      cover: 'assets/img/brochures/city-experience.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/1453535/City_Experience_EN.pdf/0c9274b5-cbbe-e80e-a82d-b1458e1fc3a3?t=1522938860060',
      issuu: '' // [Insert Issuu brochure link]
    },
    {
      id: 'coast',
      title: 'The Sea in its Soul',
      subtitle: 'The Bizkaia coast, where the mountains meet the sea.',
      cover: 'assets/img/brochures/coast.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/1453535/Sea_Soul_EN.pdf/fcb573e2-56d0-593a-b46e-a148139a6dc4?t=1522938869570',
      issuu: '' // [Insert Issuu brochure link]
    },
    {
      id: 'culture',
      title: 'Crossroads of Culture',
      subtitle: 'In Bilbao, the local takes on universal significance.',
      cover: 'assets/img/brochures/culture.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/1453535/Crossroads_of_Culture_EN.pdf/832cb94d-aa88-59ac-ef33-ab1c0b761e34',
      issuu: '' // [Insert Issuu brochure link]
    },
    {
      id: 'naturally',
      title: 'Naturally',
      subtitle: 'Breathe in the landscape: green Bizkaia getaways.',
      cover: 'assets/img/brochures/naturally.jpg',
      pdf: '', // [Insert English PDF link — missing on the current website]
      issuu: '' // [Insert Issuu brochure link]
    },
    {
      id: 'gastronomy',
      title: 'Gastronomy & Wine Tourism',
      subtitle: 'The cuisine of Bizkaia in the gastronomic universe.',
      cover: 'assets/img/brochures/gastronomy.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/5582686/GASTRONOMY+2017_18+ENG.pdf/c6800e1f-31c7-e0e7-0e65-7d26e05946d9?t=1584454088883',
      issuu: '' // [Insert Issuu brochure link]
    },
    {
      id: 'identity',
      title: 'Identity in Itself',
      subtitle: 'The reflection of a culture with its own character.',
      cover: 'assets/img/brochures/identity.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/5582656/IDENTITY+2019+ing.pdf',
      issuu: '' // [Insert Issuu brochure link]
    },
    {
      id: 'drive-enjoy',
      title: 'Drive & Enjoy',
      subtitle: 'Choose your route: ten self-drive proposals across Bizkaia.',
      cover: 'assets/img/brochures/drive-enjoy.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/6564805/DRIVE%26ENJOY+2020+ENGL_WEB.pdf/c180b49d-e311-6f41-2d0d-3c548e961734?t=1596716163107',
      issuu: '' // [Insert Issuu brochure link]
    }
  ]
};

/* =============================================================================
   LATEST EDITIONS — VIDEO
   -----------------------------------------------------------------------------
   Replace `youtubeId` with the real video IDs. The player is only loaded when
   the visitor clicks play, which keeps the page fast and avoids third-party
   cookies on first load.
   ========================================================================== */

window.MBB.editions = [
  {
    youtubeId: '', // [Insert YouTube video 1]
    title: 'Match Bilbao Bizkaia 2025',
    caption:
      'Highlights of the latest edition: three days of meetings, destination ' +
      'visits and new business connections.',
    thumbnail: '' // optional local fallback image
  },
  {
    youtubeId: '', // [Insert YouTube video 2]
    title: 'The destination in motion',
    caption:
      'A short portrait of Bilbao Bizkaia as seen by the professionals who ' +
      'welcome visitors every day.',
    thumbnail: ''
  }
];
