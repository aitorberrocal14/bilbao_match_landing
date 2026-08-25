/* =============================================================================
   DISCOVER — ENGLISH BROCHURES
   -----------------------------------------------------------------------------
   The sixteen English titles of the destination, taken from the marketing
   folder G:\Promo Exterior y Mkt\2 PROMOCION INVERSA\BROCHURES\EN, which is the
   authoritative list. Every cover is the first page of its own PDF, and every
   title and subtitle is transcribed from the cover itself.

   Each item supports two display modes:
     • `issuu` — paste the normal Issuu link of the document, e.g.
                 https://issuu.com/turismobilbao/docs/coastline_ingl_2023
                 It is turned into the embed URL automatically, so the brochure
                 is read inside the page.
     • `pdf`   — a direct link to the file, offered as a download.
   With neither, the card still shows the cover but has nothing to open.

   Fifteen of the sixteen are linked. Only Film Locations is outstanding: it
   was not found on the publisher profile, so it may be unpublished or filed
   under a title that does not mention film. See tools/issuu-links.js for how
   to list the whole profile in one go, and remember to scroll to the bottom
   first — the profile loads its publications as you go.
   ========================================================================== */

window.MBB = window.MBB || {};

window.MBB.discover = {
  // Publisher profile — linked from the Discover section as "all publications".
  issuuProfile: 'https://issuu.com/turismobilbao',
  intro:
    'Our official guides to Bilbao Bizkaia, in English. Browse them online ' +
    'or download them to prepare your programmes, itineraries and client ' +
    'proposals.',
  brochures: [
    {
      id: 'city-experience',
      title: 'City & Experience',
      subtitle: 'The art of living: Bilbao, urban experiences.',
      cover: 'assets/img/brochures/city-experience.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/bajabilbao_city_ing'
    },
    {
      id: 'coastline',
      title: 'A Stunning Coastline',
      subtitle: 'Coast of Bizkaia: seafaring and unique features.',
      cover: 'assets/img/brochures/coastline.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/coastline_ingl_2023'
    },
    {
      id: 'land-city',
      title: 'Land & City',
      subtitle: 'At the heart of the destination: green, blue and titanium experiences.',
      cover: 'assets/img/brochures/land-city.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/city__land_ing'
    },
    {
      id: 'culture',
      title: 'Crossroads of Culture',
      subtitle: 'In Bilbao, the local takes on universal significance.',
      cover: 'assets/img/brochures/culture.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/cultura_2016_'
    },
    {
      id: 'gastronomy',
      title: 'Gastronomy & Wine Tourism',
      subtitle: 'Well known and recognised: the cuisine of Bizkaia in the gastronomic universe.',
      cover: 'assets/img/brochures/gastronomy.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/baja_bi_gastro_ingles'
    },
    {
      id: 'txakoli',
      title: 'Txakoli',
      subtitle: 'A wine with Basque essence: an experience available to few.',
      cover: 'assets/img/brochures/txakoli.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/txakoli_2020_en'
    },
    {
      id: 'identity',
      title: 'Identity in Itself',
      subtitle: 'The reflection of an identity: the heart and soul of the Basque people.',
      cover: 'assets/img/brochures/identity.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/baja_bi_identidad_2016_ing'
    },
    {
      id: 'rural-tourism',
      title: 'Rural Tourism',
      subtitle: 'The landscape as a destination: away from the noise, close to people.',
      cover: 'assets/img/brochures/rural-tourism.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/turismo_rural_engl_'
    },
    {
      id: 'family-tourism',
      title: 'Family Plans',
      subtitle: 'Ideas for living experiences with the family.',
      cover: 'assets/img/brochures/family-tourism.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/turismo_familiar_ingles_2021'
    },
    {
      id: 'bike-spirit',
      title: 'Bike Spirit',
      subtitle: 'Thrills on two wheels: 16 cycling proposals.',
      cover: 'assets/img/brochures/bike-spirit.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/bike_spirit_en'
    },
    {
      id: 'drive-enjoy',
      title: 'Drive & Enjoy',
      subtitle: 'Experiences on wheels: choose your route from ten proposals.',
      cover: 'assets/img/brochures/drive-enjoy.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/alt_touring_2017_ingles'
    },
    {
      id: 'bus-train',
      title: 'Train & Bus',
      subtitle: 'The most sustainable way to get to know the region: 16 routes.',
      cover: 'assets/img/brochures/bus-train.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/tren_bus_2019_en'
    },
    {
      id: 'shopping',
      title: 'Truly Unique Shopping',
      subtitle: 'Truly unique purchases, with Basque flavour.',
      cover: 'assets/img/brochures/shopping.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/shopping_2020_en'
    },
    {
      id: 'film-locations',
      title: 'Film Locations',
      subtitle: 'A film city, a film territory: routes through the seventh art.',
      cover: 'assets/img/brochures/film-locations.jpg',
      pdf: '',
      issuu: '' // [Insert Issuu link]
    },
    {
      id: 'athletic-experience',
      title: 'Athletic Club Experience',
      subtitle: 'Be part of something unique: San Mamés and the Athletic Club Museum.',
      cover: 'assets/img/brochures/athletic-experience.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/athletic_experience_ingles_2021'
    },
    {
      id: 'lgbti',
      title: 'Pride Everywhere',
      subtitle: 'Be, explore, enjoy: sharing our pride with you.',
      cover: 'assets/img/brochures/lgbti.jpg',
      pdf: '',
      issuu: 'https://issuu.com/turismobilbao/docs/lgbt_eng'
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
