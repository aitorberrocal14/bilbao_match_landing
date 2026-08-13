/* =============================================================================
   EXHIBITORS DIRECTORY
   -----------------------------------------------------------------------------
   Base list carried over from the current Match Bilbao Bizkaia website.
   To add a new exhibitor for the 2026 edition, copy one entry, drop the logo in
   assets/img/exhibitors/ and keep the same field names. The filter tabs are
   generated from `categories`, so a new category only needs to be declared once.

   Entry fields:
     id          — unique slug, also used for the logo file name
     name        — display name
     category    — must match one of the `categories` ids below
     logo        — path to the logo file (leave '' to show a lettermark)
     description — one short sentence, plain English
     website     — external profile link (optional)
   ========================================================================== */

window.MBB = window.MBB || {};

window.MBB.exhibitorCategories = [
  { id: 'all',          label: 'All exhibitors' },
  { id: 'hotels',       label: 'Hotels & accommodation' },
  { id: 'dmc',          label: 'DMCs' },
  { id: 'agencies',     label: 'Travel agencies' },
  { id: 'experiences',  label: 'Experiences' },
  { id: 'services',     label: 'Tourism services' },
  { id: 'institutions', label: 'Institutions & associations' }
];

window.MBB.exhibitors = [
  {
    id: 'gran-hotel-domine',
    name: 'Gran Hotel Domine',
    category: 'hotels',
    logo: 'assets/img/exhibitors/gran-hotel-domine.jpg',
    description: 'Design hotel facing the Guggenheim Museum, with 145 rooms, a rooftop breakfast terrace and a wellness centre.',
    website: 'https://www.hoteldominebilbao.com'
  },
  {
    id: 'hotel-carlton-hotel-abando',
    name: 'Hotel Carlton & Hotel Abando',
    category: 'hotels',
    logo: 'assets/img/exhibitors/hotel-carlton-hotel-abando.jpg',
    description: 'Aránzazu Hotels\' 5- and 4-star properties in central Bilbao, led by the historic Hotel Carlton.',
    website: 'https://www.aranzazu-hoteles.com'
  },
  {
    id: 'melia-bilbao-hotel-5',
    name: 'Meliá Bilbao 5*',
    category: 'hotels',
    logo: 'assets/img/exhibitors/melia-bilbao-hotel-5.jpg',
    description: 'Landmark five-star hotel beside the Euskalduna Conference Centre, the Nervión river and Doña Casilda park.',
    website: 'https://www.melia.com'
  },
  {
    id: 'radisson-collection-hotel-gran-via-bilbao',
    name: 'Radisson Collection Gran Vía Bilbao',
    category: 'hotels',
    logo: 'assets/img/exhibitors/radisson-collection-hotel-gran-via-bilbao.png',
    description: 'Contemporary five-star hotel on Bilbao\'s main avenue, minutes from the city\'s cultural district.',
    website: 'https://www.radissonhotels.com/en-us/brand/radisson-collection'
  },
  {
    id: 'ercilla-de-bilbao-autograph-collection',
    name: 'Ercilla de Bilbao, Autograph Collection',
    category: 'hotels',
    logo: 'assets/img/exhibitors/ercilla-de-bilbao-autograph-collection.jpg',
    description: 'A Bilbao institution since 1972, fully redesigned and now part of Marriott\'s Autograph Collection.',
    website: 'https://www.ercilladebilbao.com'
  },
  {
    id: 'nh-collection-villa-de-bilbao',
    name: 'NH Collection Villa de Bilbao',
    category: 'hotels',
    logo: 'assets/img/exhibitors/nh-collection-villa-de-bilbao.jpg',
    description: 'Contemporary city-centre hotel with extensive meeting facilities, on Gran Vía.',
    website: 'https://www.nh-hotels.com'
  },
  {
    id: 'hotel-catalonia-gran-via-bilbao',
    name: 'Hotel Catalonia Gran Vía Bilbao',
    category: 'hotels',
    logo: 'assets/img/exhibitors/hotel-catalonia-gran-via-bilbao.jpg',
    description: 'New four-star hotel downtown, five minutes on foot from Euskalduna and San Mamés.',
    website: 'https://www.cataloniahotels.com/es/hotel/catalonia-gran-via-bilbao'
  },
  {
    id: 'hotel-gran-bilbao',
    name: 'Hotel Gran Bilbao',
    category: 'hotels',
    logo: 'assets/img/exhibitors/hotel-gran-bilbao.jpg',
    description: 'Four-star contemporary hotel in the city centre, a short walk from the Old Town.',
    website: 'https://www.hotelgranbilbao.com'
  },
  {
    id: 'hotel-miro-bilbao',
    name: 'Hotel Miró Bilbao',
    category: 'hotels',
    logo: 'assets/img/exhibitors/hotel-miro-bilbao.jpg',
    description: 'Boutique hotel on Bilbao\'s golden mile, between the Guggenheim and the Fine Arts Museum.',
    website: 'https://www.mirohotelbilbao.com'
  },
  {
    id: 'hotel-mercure-bilbao-jardines-de-albia',
    name: 'Mercure Bilbao Jardines de Albia',
    category: 'hotels',
    logo: 'assets/img/exhibitors/hotel-mercure-bilbao-jardines-de-albia.jpg',
    description: 'Centrally located hotel next to the Guggenheim, the Fine Arts Museum and the Old Town.',
    website: 'https://all.accor.com/hotel/A057/index.es.shtml'
  },
  {
    id: 'hotel-zenit-bilbao',
    name: 'Hotel Zenit Bilbao',
    category: 'hotels',
    logo: 'assets/img/exhibitors/hotel-zenit-bilbao.jpg',
    description: 'Four-star hotel in the Indautxu district, well connected by tram and on foot.',
    website: 'https://bilbao.zenithoteles.com'
  },
  {
    id: 'hogel-tayko-bilbao',
    name: 'Hotel Tayko Bilbao',
    category: 'hotels',
    logo: 'assets/img/exhibitors/hogel-tayko-bilbao.jpg',
    description: 'Four-star hotel in the heart of the Old Town, home to two Martín Berasategui restaurants.',
    website: 'https://www.taykohotels.com'
  },
  {
    id: 'abba-suites-bilbao-city-center',
    name: 'abba Suites Bilbao City Center',
    category: 'hotels',
    logo: 'assets/img/exhibitors/abba-suites-bilbao-city-center.jpg',
    description: 'Fully equipped suites in the centre of Bilbao, designed for longer and independent stays.',
    website: 'https://www.abbahoteles.com'
  },
  {
    id: 'leonardo-hotels',
    name: 'Leonardo Hotels — NYX Bilbao',
    category: 'hotels',
    logo: 'assets/img/exhibitors/leonardo-hotels.jpg',
    description: 'A new generation of design-led city accommodation, opened in Bilbao in 2019.',
    website: 'https://www.leonardo-hotels.com/nyx-hotel-bilbao'
  },
  {
    id: 'barcelo-hotels-resorts',
    name: 'Barceló Hotels & Resorts',
    category: 'hotels',
    logo: 'assets/img/exhibitors/barcelo-hotels-resorts.jpg',
    description: 'MICE-focused hotel group with two full-facility properties in the centre of Bilbao.',
    website: ''
  },
  {
    id: 'hoteles-silken',
    name: 'Hoteles Silken',
    category: 'hotels',
    logo: 'assets/img/exhibitors/hoteles-silken.jpg',
    description: 'Spanish hotel group offering a home-from-home stay across its Basque and national portfolio.',
    website: 'https://www.hoteles-silken.com/es/'
  },
  {
    id: 'hotel-palacio-urgoiti',
    name: 'Hotel Palacio Urgoiti',
    category: 'hotels',
    logo: 'assets/img/exhibitors/hotel-palacio-urgoiti.jpg',
    description: 'A restored palace hotel just outside Bilbao, with golf, events and countryside surroundings.',
    website: 'https://www.palaciourgoiti.com'
  },
  {
    id: 'hotel-nafarrola',
    name: 'Hotel Nafarrola',
    category: 'hotels',
    logo: 'assets/img/exhibitors/hotel-nafarrola.jpg',
    description: 'Sea-facing hotel in Bermeo, in the heart of the Urdaibai Biosphere Reserve.',
    website: 'https://www.hotelnafarrola.com'
  },
  {
    id: 'etxelaia',
    name: 'Etxelaia',
    category: 'hotels',
    logo: 'assets/img/exhibitors/etxelaia.png',
    description: 'Luxury rural accommodation and event venue in a restored building set in the Basque countryside.',
    website: 'https://www.etxelaia.com'
  },
  {
    id: 'moana-eco-surf-house',
    name: 'Moana Eco Surf House',
    category: 'hotels',
    logo: 'assets/img/exhibitors/moana-eco-surf-house.jpg',
    description: 'Sustainable surf house in Sopela, 300 metres from the beach, built around nature and the ocean.',
    website: ''
  },
  {
    id: 'xarma-charming-lodging-in-the-basque-country',
    name: 'XARMA Charming Lodging',
    category: 'hotels',
    logo: 'assets/img/exhibitors/xarma-charming-lodging-in-the-basque-country.jpg',
    description: 'A collection of family-run, character accommodation across the Basque Country.',
    website: 'https://www.xarmahotels.com'
  },
  {
    id: 'sti-dmc-ttoo-bilbao-basque-country',
    name: 'STI — DMC & Tour Operator',
    category: 'dmc',
    logo: 'assets/img/exhibitors/sti-dmc-ttoo-bilbao-basque-country.jpg',
    description: 'Experienced DMC and tour operator for Bilbao Bizkaia, the Basque Country and northern Spain.',
    website: 'https://www.stipaisvasco.com/en'
  },
  {
    id: 'romotur-dmc',
    name: 'Romotur DMC',
    category: 'dmc',
    logo: 'assets/img/exhibitors/romotur-dmc.jpg',
    description: 'Over 25 years designing MICE programmes and incoming leisure travel in the Basque Country.',
    website: 'https://romotur.com/'
  },
  {
    id: 'destination-consultant-dmc-basque-country',
    name: 'Destination Consultant — DMC Basque Country',
    category: 'dmc',
    logo: 'assets/img/exhibitors/destination-consultant-dmc-basque-country.jpg',
    description: 'Bilbao-based DMC operating across the Basque Country and the north of Spain.',
    website: 'https://basquecountry-spain-dmc.com'
  },
  {
    id: 'nis-dmc',
    name: 'NIS DMC — North Incoming Service',
    category: 'dmc',
    logo: 'assets/img/exhibitors/nis-dmc.jpg',
    description: 'Incoming agency with 29 years of experience in the Basque Country, La Rioja and northern Spain.',
    website: ''
  },
  {
    id: 'basque-experiences',
    name: 'Basque Experiences',
    category: 'dmc',
    logo: 'assets/img/exhibitors/basque-experiences.jpg',
    description: 'Made-to-measure premium private tours for agencies, tour operators and discerning travellers.',
    website: 'https://www.basqueexperiences.com'
  },
  {
    id: 'xarmanta-life',
    name: 'Xarmanta Life',
    category: 'dmc',
    logo: 'assets/img/exhibitors/xarmanta-life.png',
    description: 'DMC and MICE specialist designing experiences from a different perspective on the destination.',
    website: 'https://www.xarmantalife.com'
  },
  {
    id: 'go-basquing',
    name: 'go Basquing',
    category: 'dmc',
    logo: 'assets/img/exhibitors/go-basquing.jpg',
    description: 'Local storytelling and programme design for leisure groups, incentives and company offsites.',
    website: 'https://www.gobasquing.com'
  },
  {
    id: 'explora-norte',
    name: 'Explora-Norte',
    category: 'dmc',
    logo: 'assets/img/exhibitors/explora-norte.jpg',
    description: 'A tailor-made experience workshop with deep local knowledge of the Basque Country.',
    website: ''
  },
  {
    id: 'bilbao-paso-a-paso',
    name: 'Bilbao Paso a Paso',
    category: 'dmc',
    logo: 'assets/img/exhibitors/bilbao-paso-a-paso.jpg',
    description: 'One of the oldest Basque incoming companies, specialised in MICE and cultural tourism.',
    website: 'https://www.bilbaopasoapaso.com/'
  },
  {
    id: 'azul-marino-viajes',
    name: 'Azul Marino Viajes',
    category: 'agencies',
    logo: 'assets/img/exhibitors/azul-marino-viajes.jpg',
    description: 'Bilbao-born travel group with more than 40 years of experience and a national network.',
    website: 'https://dmc.w2m.travel/'
  },
  {
    id: 'fresco-tours',
    name: 'Fresco Tours',
    category: 'agencies',
    logo: 'assets/img/exhibitors/fresco-tours.jpg',
    description: 'Travel agency specialising in cultural walking tours along the Camino de Santiago and beyond.',
    website: 'https://www.frescotours.com'
  },
  {
    id: 'bilbaoservices-com-viajesgarcia-com',
    name: 'BilbaoServices / Viajes García',
    category: 'services',
    logo: 'assets/img/exhibitors/bilbaoservices-com-viajesgarcia-com.jpg',
    description: 'Tour services company covering Bilbao, the Basque Country and the surrounding regions.',
    website: 'http://www.bilbaoservices.com'
  },
  {
    id: 'basqueland-serv-turisticos',
    name: 'Basqueland Servicios Turísticos',
    category: 'services',
    logo: 'assets/img/exhibitors/basqueland-serv-turisticos.jpg',
    description: 'Tourism services for groups and individuals: events, congresses and incentive programmes.',
    website: 'https://www.basquelands.com'
  },
  {
    id: 'bodega-crusoe-treasure',
    name: 'Bodega Crusoe Treasure',
    category: 'experiences',
    logo: 'assets/img/exhibitors/bodega-crusoe-treasure.jpg',
    description: 'The world\'s first underwater winery and artificial reef, with over ten years of research.',
    website: 'https://underwaterwine.com/'
  },
  {
    id: 'bizi-cycle-tours',
    name: 'Bizi Cycle Tours',
    category: 'experiences',
    logo: 'assets/img/exhibitors/bizi-cycle-tours.jpg',
    description: 'Cycling tours combining sport and discovery across Bilbao and the Basque Country.',
    website: 'https://www.bizicycletours.com/'
  },
  {
    id: 'aktiba',
    name: 'Aktiba',
    category: 'institutions',
    logo: 'assets/img/exhibitors/aktiba.jpg',
    description: 'The Basque association of active tourism, adventure sports and nature companies, founded in 2004.',
    website: 'https://aktiba.eus/en/'
  },
  {
    id: 'opce-vasca-association',
    name: 'OPCE Vasca Association',
    category: 'institutions',
    logo: 'assets/img/exhibitors/opce-vasca-association.jpg',
    description: 'Association of Basque professional congress and event organisers, positioning the region for MICE.',
    website: 'https://www.opce.eus/en/'
  },
  {
    id: 'nekatur-basque-rural-lodging',
    name: 'NEKATUR — Basque Rural Lodging',
    category: 'institutions',
    logo: 'assets/img/exhibitors/nekatur-basque-rural-lodging.png',
    description: 'The Basque rural accommodation association, bringing together around 250 establishments.',
    website: 'https://www.nekatur.net/Default.aspx?lang=en-US'
  }
];
