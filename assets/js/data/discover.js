/* =============================================================================
   DISCOVER — ENGLISH BROCHURES
   -----------------------------------------------------------------------------
   Only the English editions are listed, as agreed for the 2026 site.

   Each item supports two display modes:
     • `pdf`   — opens / downloads the official PDF (used today)
     • `issuu` — paste the normal Issuu link of the document, e.g.
                 https://issuu.com/turismobilbao/docs/city_experience_en
                 It is turned into the embed URL automatically, so the brochure
                 is read inside the page instead of opening a preview panel.
   If both are present the Issuu reader is shown and the PDF stays available as
   a download link.
   ========================================================================== */

window.MBB = window.MBB || {};

window.MBB.discover = {
  // Publisher profile — linked from the Discover section as "all publications".
  issuuProfile: 'https://issuu.com/turismobilbao',
  // Deliberately no number: more titles are on the way, and a hardcoded count
  // would go out of date the moment one is added.
  intro:
    'Our official guides to Bilbao Bizkaia, in English. Browse them online ' +
    'or download them to prepare your programmes, itineraries and client ' +
    'proposals.',
  brochures: [
    {
      id: 'city-experience',
      title: 'City & Experience',
      subtitle: 'The art of living: Bilbao urban experiences.',
      cover: 'assets/img/brochures/city-experience.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/1453535/City_Experience_EN.pdf/0c9274b5-cbbe-e80e-a82d-b1458e1fc3a3?t=1522938860060',
      issuu: '' // paste the issuu.com/turismobilbao/docs/… link of this title
    },
    {
      id: 'coast',
      title: 'The Sea in its Soul',
      subtitle: 'The Bizkaia coast, where the mountains meet the sea.',
      cover: 'assets/img/brochures/coast.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/1453535/Sea_Soul_EN.pdf/fcb573e2-56d0-593a-b46e-a148139a6dc4?t=1522938869570',
      issuu: '' // paste the issuu.com/turismobilbao/docs/… link of this title
    },
    {
      id: 'culture',
      title: 'Crossroads of Culture',
      subtitle: 'In Bilbao, the local takes on universal significance.',
      cover: 'assets/img/brochures/culture.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/1453535/Crossroads_of_Culture_EN.pdf/832cb94d-aa88-59ac-ef33-ab1c0b761e34',
      issuu: '' // paste the issuu.com/turismobilbao/docs/… link of this title
    },
    {
      id: 'naturally',
      title: 'Naturally',
      subtitle: 'Breathe in the landscape: green Bizkaia getaways.',
      cover: 'assets/img/brochures/naturally.jpg',
      pdf: '', // [Insert English PDF link — missing on the current website]
      issuu: '' // paste the issuu.com/turismobilbao/docs/… link of this title
    },
    {
      id: 'gastronomy',
      title: 'Gastronomy & Wine Tourism',
      subtitle: 'The cuisine of Bizkaia in the gastronomic universe.',
      cover: 'assets/img/brochures/gastronomy.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/5582686/GASTRONOMY+2017_18+ENG.pdf/c6800e1f-31c7-e0e7-0e65-7d26e05946d9?t=1584454088883',
      issuu: '' // paste the issuu.com/turismobilbao/docs/… link of this title
    },
    {
      id: 'identity',
      title: 'Identity in Itself',
      subtitle: 'The reflection of a culture with its own character.',
      cover: 'assets/img/brochures/identity.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/5582656/IDENTITY+2019+ing.pdf',
      issuu: '' // paste the issuu.com/turismobilbao/docs/… link of this title
    },
    {
      id: 'drive-enjoy',
      title: 'Drive & Enjoy',
      subtitle: 'Choose your route: ten self-drive proposals across Bizkaia.',
      cover: 'assets/img/brochures/drive-enjoy.jpg',
      pdf: 'https://www.visitbiscay.eus/documents/1369190/6564805/DRIVE%26ENJOY+2020+ENGL_WEB.pdf/c180b49d-e311-6f41-2d0d-3c548e961734?t=1596716163107',
      issuu: '' // paste the issuu.com/turismobilbao/docs/… link of this title
    },

    /* -------------------------------------------------------------------
       English titles from the issuu.com/turismobilbao library.
       The subtitles are drafted from the titles the team supplied — worth a
       read before publishing. No PDF is listed: these are read on Issuu.
       ------------------------------------------------------------------- */
    {
      id: 'place-to-be',
      title: 'The Place to Be',
      subtitle: 'The essential guide to the destination.',
      cover: 'assets/img/brochures/place-to-be.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/place_to_be_2024web_en'
    },
    {
      id: 'land-city',
      title: 'Land & City',
      subtitle: 'The city and the land that surrounds it.',
      cover: 'assets/img/brochures/land-city.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/city__land_ing'
    },
    {
      id: 'coastline',
      title: 'Coastline',
      subtitle: 'The Bizkaia coast, beach by beach.',
      cover: 'assets/img/brochures/coastline.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/coastline_ingl_2023'
    },
    {
      id: 'iron-river',
      title: 'Iron River',
      subtitle: 'The estuary and its industrial heritage.',
      cover: 'assets/img/brochures/iron-river.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/iron_river_en'
    },
    {
      id: 'rural-tourism',
      title: 'Rural Tourism',
      subtitle: 'Farmhouses, valleys and village life in Bizkaia.',
      cover: 'assets/img/brochures/rural-tourism.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/turismo_rural_engl_'
    },
    {
      id: 'bike-spirit',
      title: 'Bike Spirit',
      subtitle: 'Cycle tourism across Bilbao Bizkaia.',
      cover: 'assets/img/brochures/bike-spirit.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/bike_spirit_en'
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
    youtubeId: '2tI7kgSjPi8',
    title: 'Match Bilbao Bizkaia 2025',
    caption:
      'Highlights of the latest edition: meetings, destination visits and new ' +
      'business connections.',
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
