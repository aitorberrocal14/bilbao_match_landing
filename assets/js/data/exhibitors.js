/* =============================================================================
   EXHIBITORS
   -----------------------------------------------------------------------------
   The full exhibitor list carried over from the current Match Bilbao Bizkaia
   website, including the contact block and profile text of each company.

   The directory renders as a full-bleed grid of logos — the brand is what the
   visitor sees first, exactly as on the original site — and each entry has its
   own page, generated into exhibitors/<id>.html by tools/build-exhibitors.js.

   To add an exhibitor: drop the logo in assets/img/exhibitors/, copy one entry
   below, then run `node tools/build-exhibitors.js`.
   ========================================================================== */

window.MBB = window.MBB || {};

/* Categories as on the original site */
window.MBB.exhibitorCategories = [
  { id: 'all',           label: 'All' },
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'dmc',           label: 'DMC' },
  { id: 'activities',    label: 'Unique Activities' }
];

window.MBB.exhibitors = [
  {
    id: 'bodega-crusoe-treasure',
    name: 'Bodega Crusoe Treasure',
    category: 'activities',
    logo: 'assets/img/exhibitors/bodega-crusoe-treasure.jpg',
    contactName: 'Anna Riera',
    contactRole: 'Tourism Manager',
    email: 'anna@crusoetreasure.com',
    phone: '+34 688 63 81 14',
    website: 'https://underwaterwine.com/',
    websiteLabel: 'https://underwaterwine.com/',
    address: 'C/ Uribitarte 6, 2ª planta 48001 Bilbao (Bizkaia). Spain',
    paragraphs: [
      'We are the first underwater winery and artificial reef in the world with over 10 years research in underwater wines.',
      'Our team of master winemakers, led by enologist Antonio Palacios seek out and blend unique terroirs based on years of experience. We then ‘treasure’ these wines in the sea to bring out their full potential. The results are limited-edition underwater wines of extraordinary quality.',
      'Located in the picturesque Plentzia Bay on the Basque Coast of Spain, Crusoe Treasure Winery has taken the art of wine making to new depths by perfecting the science of underwater aging.',
      'Visitors from all over the world have come to visit our winery under the sea.',
      'Join us aboard Crusoe Treasure. Meet one of the founding members and learn more about the passion and history behind our wines. Sample our undersea wines on land or aboard our boat, try a duet tasting, or simply take in the spectacular scenery of the Bay of Plentzia. Located near Bilbao in the province of Bizkaia.'
    ]
  },
  {
    id: 'hotel-catalonia-gran-via-bilbao',
    name: 'HOTEL CATALONIA GRAN VIA BILBAO',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/hotel-catalonia-gran-via-bilbao.jpg',
    contactName: 'Alberto Cueto Lojo',
    contactRole: 'Hotel Manager',
    email: 'bilbao.direccion@cataloniahotels.com',
    phone: '+34 944 00 79 46',
    website: 'https://www.cataloniahotels.com/es/hotel/catalonia-gran-via-bilbao',
    websiteLabel: 'https://www.cataloniahotels.com/es/hotel/catalonia-gran-via-bilbao',
    address: 'Gran Vía de Don Diego Lopez de Haro 7348011 Bilbao, Vizcaya',
    paragraphs: [
      'New 4 star hotel located in Bilbao downtown (5 min walking distance to Esukalduna Conference Center and San Mames Stadium and 10 min walking distance to guggenheim museum). Last technology meeting rooms with capacity up to 125 people, spa and wellness area, rooftop pool, gastro-bar and private patio. 106 modern and full equiped rooms (Nespresso machine, tea facilities, iron, safe, haidryer…)'
    ]
  },
  {
    id: 'basque-experiences',
    name: 'Basque Experiences',
    category: 'dmc',
    logo: 'assets/img/exhibitors/basque-experiences.jpg',
    contactName: 'Erik Sadler',
    contactRole: 'Co-Founder',
    email: 'erik@basqueexperiences.com',
    phone: '34662234755',
    website: 'https://www.basqueexperiences.com',
    websiteLabel: 'www.basqueexperiences.com',
    address: 'JUAN DE GARAY 17 LONJA 48003 BILBAO BIZKAIA SPAIN',
    paragraphs: [
      'Basque Experiences is a DMC, Incoming Tour Operator and Travel Agency.',
      'We create and manage made-to-measure, premium, private tours for agencies, tour operators, discerning travellers and groups seeking authentic and different experiences in the Basque Country and the North of Spain.',
      'Innovative, and always looking to evolve, our unique English-Spanish profile enables us to understand, develop and maintain close relationships with our clients, be they individuals or large operators, who trust us with all their requirements.',
      'We seek to satisfy our clients by listening to and understanding their individual needs and expectations. From inception to completion, working in English, we collaborate closely with a broad spectrum of hand-selected suppliers to this special part of Europe, remarkably rich in culture, cuisine, and history.',
      'With our focus solely on incoming services we are confident that we can give you a truly memorable and complete experience of the Basque Country and the North of Spain.'
    ]
  },
  {
    id: 'etxelaia',
    name: 'Etxelaia',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/etxelaia.png',
    contactName: 'Juan Aldamizgogeascoa',
    contactRole: 'Owner',
    email: 'juan@etxelaia.com',
    phone: '699865046',
    website: 'https://www.etxelaia.com',
    websiteLabel: 'www.etxelaia.com',
    address: 'Zelaieta Kalea 1, 48314, Gautegiz Arteaga (Bizkaia)',
    paragraphs: [
      'Etxelaia is a new, inviting place for luxury accommodation and events in the midst of a rural settingEtxelaia\'s value is principally the building\'s aesthetic charm, the history that goes with it and the quality of services and the surroundings.It is a unique building with a very interesting story of how it was builtEtxelaia\'s interior decor is also to be highlighted. The consistent mix of classic and modern pieces aims to preserve the essence of the original, two hundred year old building without compromising the comfort of a modern home.A third, differentiating factor of Etxelaia is the quality of services on offer. We only work with suppliers that meet maximum levels of quality to match the setting provided by the house. These services are accompanied by round-the-clock customer care ready to attend any reasonable need guests may have.And the final factor and reason to chose Etxalaia is its location. We are in Gautegiz Arteaga, in the Urdaibai Biosphere Reserve. This is a unique natural environment with stunning landscape and many leisure activities such as hiking, water sports (canoeing, surfing, stand up paddle boarding, etc) biking, art, gastronomy, culture, history etc.'
    ]
  },
  {
    id: 'nekatur-basque-rural-lodging',
    name: 'NEKATUR — Basque Rural Lodging',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/nekatur-basque-rural-lodging.png',
    contactName: 'Amaia Pagola',
    contactRole: 'Technical Staff',
    email: 'erreserbak@nekatur.net',
    phone: '34943327090',
    website: 'https://www.nekatur.net/Default.aspx?lang=en-US',
    websiteLabel: 'https://www.nekatur.net/Default.aspx?lang=en-US',
    address: 'c/Juan Fermin Gilisagasti, 2 - of.31020018 Donostia-San Sebastián (Gipuzkoa)',
    paragraphs: [
      'Nekatur is the Association of Rural Lodging of Euskadi, which encompasses around 250 establishments, where one can enjoy a quiet stay, without crowds, receiving a close and familiar treatment and in direct contact with nature.Staying at these offers the possibility of getting to know and enjoy the Basque gastronomy, culture and folklore.From Nekatur, among others, promotion and sales actions are made of these rural accommodations, offering the possibility of making reservations.'
    ]
  },
  {
    id: 'gran-hotel-domine',
    name: 'Gran Hotel Domine',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/gran-hotel-domine.jpg',
    contactName: 'Estibaliz Egusquiza',
    contactRole: 'Director of Sales & Marketing',
    email: 'sales@hoteldominebilbao.com',
    phone: '34661171757',
    website: 'https://www.hoteldominebilbao.com',
    websiteLabel: 'www.hoteldominebilbao.com',
    address: 'Alameda Mazarredo, 61 48009 Bilbao Bizkaia',
    paragraphs: [
      'The Gran Hotel Domine is located in the city’s most desired location, directly opposite Guggenheim Museum Bilbao.',
      'With 145 air-conditioned and soundproofed rooms and suites, some with views of the Guggenheim, guests can enjoy a relaxing stay in the heart of Bilbao. Rooms feature en-suite bathrooms with bathtubs, bathrobe and slippers, free WiFi, USB connection and a 40″ flat-screen TV with international satellite channels and HDMI.',
      'Breakfast is served on the roof terrace with spectacular views over the museum and the River Nervion. Guests can also sample different dining options at either the gastronomic Beltz restaurant, the more informal Le Café or at the stylish Sixty-One Lobby Bar.',
      'The Hotel Domine has a Wellness Centre with fitness area, sauna and Turkish bath, while staff at the hotel’s 24-hour reception can provide information about what to see and do in Bilbao and the Basque Country.',
      'Apart from the Guggenheim, The Museum of Fine Arts and the Maritime Museum are both within 500 metres of the hotel. The Ensanche, the city’s shopping area, is just a few minutes away, and offers a fabulous selection of shops and boutiques, while the old town has a wonderful collection of tapas (pintxos) bars and restaurants.'
    ]
  },
  {
    id: 'bilbaoservices-com-viajesgarcia-com',
    name: 'BilbaoServices.com / Viajesgarcia.com',
    category: 'dmc',
    logo: 'assets/img/exhibitors/bilbaoservices-com-viajesgarcia-com.jpg',
    contactName: 'Carlos Garcia',
    contactRole: 'CEO',
    email: 'clientes@viajesgarcia.com',
    phone: '944278006',
    website: 'http://www.bilbaoservices.com https://www.viajesgarcia.com',
    websiteLabel: 'http://www.bilbaoservices.com https://www.viajesgarcia.com',
    address: 'Estrada de Mala 8 (48012) Bilbao. SPAIN.',
    paragraphs: [
      'Tours and incoming services in Bilbao (Basque Country)',
      'Bilbao Services is a company specializes in tours services to visit the Basque Country and the main areas of interest surrounding.',
      'Our human equip of professionals is one of the leading for groups and tour Management in the Basque Country and the North of Spain Destination.',
      'We allow users to create their own tailor-made visits or you can let our professionals who are eager to plan your ideal travel experience. Should you like to have more information about any of our services please be free to contact with us.',
      'History, art, gastronomy, nature, coast, mountains, sports, shopping… are presents in our tours.',
      'http://www.bilbaoservices.com https://www.viajesgarcia.com',
      'Buses in Bilbao (Biscay, Spain). Rental and Reserves',
      'In our bus rental company in Bilbao (Bizkaia) we want to satisfy our customers with the quality of our services, having highly qualified staff with excellent treatment to travelers.',
      'We have a varied and modern vehicle fleet, following an exhaustive control in its maintenance and cleaning. A wide range of vehicles adapted for each type of service and number of passengers. We offer buses of different size and capacity for large, medium and small groups, with the possibility of minibuses and minibuses.'
    ]
  },
  {
    id: 'azul-marino-viajes',
    name: 'Azul Marino Viajes',
    category: 'dmc',
    logo: 'assets/img/exhibitors/azul-marino-viajes.jpg',
    contactName: 'Athenea',
    contactRole: 'Bilbao DMC Manager',
    email: 'athenea.sanchez@w2m.com',
    phone: '(+34) 94 645 60 00',
    website: 'https://dmc.w2m.travel/',
    websiteLabel: 'https://dmc.w2m.travel/',
    address: 'Edificio Grupo AM. c/ Canciller Ayala, 2 | 48008 Bilbao',
    paragraphs: [
      'Grupo Viajes Azul Marino (Grupo AM) is a tourism company with more than 40 years of experience. The family company was founded in Bilbao where we have our central offices.Nowadays, there are more than 200 people in the team: Experts in travel and in tourism who guarantee the quality in all our services. Grupo AM is always growing and innovating.In our group we have different departments and brands, wholesalers, incoming, Business, DMC, LeisureWe also have 30 shops around Spain selling all our products.We have been the suppliers of very important Bank & Insurances trademarks, Medical Congresses, Football & Basketball teams and a lot of other satisfied customers.We want to be your partner in the Basque Country and in Spain putting at your disposal more than 200 people working in our Group.¡¡Let’s start working together!!'
    ]
  },
  {
    id: 'abba-suites-bilbao-city-center',
    name: 'abba Suites Bilbao City Center',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/abba-suites-bilbao-city-center.jpg',
    contactName: 'David García Celdrán',
    contactRole: 'International Sales Director',
    email: 'd.garcia@abbahoteles.com',
    phone: '34647329606',
    website: 'https://www.abbahoteles.com',
    websiteLabel: 'https://www.abbahoteles.com',
    address: 'C/ Huertas de la Villa, 15 48007 Bilbao Spain',
    paragraphs: [
      '35 Apartments / 24 hour reception / Daily cleaning service / Parking / Free WiFi',
      'The new abba Suites Bilbao City Center​ are fully equipped with everything you could need for a perfect stay in Bilbao, a true home away from home.',
      'Off the Paseo Campo Volantín, opposite the Guggenheim. 5 minutes’ walk from the city’s business and financial district and 15 minutes by car from the Airport.',
      'At abba Suites Bilbao City Center, we take care of our guests and offer them the best services and facilities so that they can enjoy a stay that exceeds their expectations, full of comfort and personalized attention.',
      'Every day we work on our services being adapted to new technologies and the needs of each guest, we take care of the last detail.'
    ]
  },
  {
    id: 'sti-dmc-ttoo-bilbao-basque-country',
    name: 'STI — DMC & TTOO Bilbao / Basque Country',
    category: 'dmc',
    logo: 'assets/img/exhibitors/sti-dmc-ttoo-bilbao-basque-country.jpg',
    contactName: 'Enrique Hernaez',
    contactRole: 'CEO',
    email: 'ehernaez@stipaisvasco.com',
    phone: '34946071707',
    website: 'https://www.stipaisvasco.com/en',
    websiteLabel: 'https://www.stipaisvasco.com/en',
    address: 'Zabalea, 2948960 GALDAKAOBIZKAIA-BASQUE COUNTRY',
    paragraphs: [
      'STI is an experienced DMC & TTOO at BILBAO BIZKAIA & BASQUE COUNTRY & NORTHERN SPAIN.A wide range of own programs, products and services specially prepared for International Visitors that give opportunity for travel on best basis for receive the best service.Our experienced team will offer quality services as company possessing extensive local knowledge, Expertise and resources, specializing in the design and implementation of any format of Programs , events, activities, tours, transportation, etc.We offer a wide range of Programs covering all over BILBAO & BASQUE COUNTRY Programs with own operation and Regular Departures for Circuits, Stays, Day tours, Activities. Our expert team is prepared for attend any request with personal assistance and specially singular options for Tailor Made Programs including the best special and singular Activities for FIT and Groups including Incentive & Thematic Programs.STI with an experienced team and more than 16 years working at Destination works exclusively for Travel Agencies & Tour Operators offering a full service with full guaranty and quality service.Specialist in tailor made Programs and special and thematic activities and routes for FIT-INDIVIDUALS & GROUPS offering you special & high level services & programs. STI offers you highly personalized proposals in order to obtain the best satisfaction from your clients in our destination!'
    ]
  },
  {
    id: 'hotel-gran-bilbao',
    name: 'Hotel Gran Bilbao',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/hotel-gran-bilbao.jpg',
    contactName: 'Raúl Amestoy Lara',
    contactRole: 'Hotel Manager',
    email: 'subdireccion@hotelgranbilbao.com',
    phone: '34653723746',
    website: 'https://www.hotelgranbilbao.com',
    websiteLabel: 'https://www.hotelgranbilbao.com',
    address: 'Avda Indalecio Prieto 1Bilbao',
    paragraphs: [
      'The Hotel Gran Bilbao is a 4-star hotel, with contemporary design, located within the city centre, a few steps away from the Old Town, the main tourist quarter in Bilbao. It offers 202 contemporary rooms with urban design, featuring different wallpapers as decoration. Bedrooms start from standard rooms with comfortable bed and spacious bathrooms, following other room types such as the Urban Rooms, View Rooms, Neon Rooms or Superior Rooms. The hotel also features triple and quadruple rooms, with comfortable beds for all the occupants (no rollaway beds used). This hotel is the main hotel in Bilbao for meetings and events, offering its own Conference Centre with one auditorium, 10 versatile meeting rooms, banquet service, 1.800 square metres of meeting space to support meetings and more than 10 years of experience. The Hotel Gran Bilbao believes in a healthy lifestyle, which can be experienced across its restaurant, menus and other F&B offerings. The well-known breakfast buffet features a healthy corner with homemade recipes designed by a nutritionist. The healthy recipes can be included in the coffee breaks and cocktails, just as healthy options or in a full healthy coffee break or cocktail. At the restaurant we offer as well healthy dishes on the menu that can be incorporated to our groups and corporate menus. The hotel is conveniently located with very easy access to the A-68 and A-8 highway, and the international airport of Bilbao is just 15 minutes driving. Public transport network is also accessible by bus, metro or tram. There are 3 underground floors of private garage parking with direct access to the Conference Centre.'
    ]
  },
  {
    id: 'xarma-charming-lodging-in-the-basque-country',
    name: 'XARMA — Charming Lodging in the Basque Country',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/xarma-charming-lodging-in-the-basque-country.jpg',
    contactName: 'Mertxe Begiristain',
    contactRole: 'Marketing manager',
    email: 'xarma@xarmahotels.com',
    phone: '34619560123',
    website: 'https://www.xarmahotels.com',
    websiteLabel: 'www.xarmahotels.com',
    address: 'Barrio Olagorta, 6 Ea - Bizkaia Basque Country',
    paragraphs: [
      'Xarma is the association of charming accommodation in Basque Country, where accommodation meets the following requirements: – Family Management – Commitment to quality – Personalized treatment – Buildings with history www.xarmahotels.com'
    ]
  },
  {
    id: 'nh-collection-villa-de-bilbao',
    name: 'NH Collection Villa de Bilbao',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/nh-collection-villa-de-bilbao.jpg',
    contactName: 'Natalia Alonso',
    contactRole: 'Meetings & Events Manager',
    email: 'n.alonso@nh-hotels.com',
    phone: '34944416000',
    website: 'https://www.nh-hotels.com',
    websiteLabel: 'https://www.nh-hotels.com',
    address: 'Gran Vía, 8748011 BilbaoSpain',
    paragraphs: [
      'The stylish, contemporary NH Collection Villa de Bilbao has a reputation for being one of the best hotels in the city. Not only is it right in the heart of Bilbao’s commercial district, the Guggenheim, the Bilbao Fine Arts Museum and the Congress Palace are all within easy walking distance too. And the San Mamés football stadium, famed for its unique design, is just 100 meters away.Travel around with ease – the hotel is near the metro station, airport and highways.Experience the Michelin-starred restaurants and authentic pintxos-tapas bars on your doorstep.Reserve a personal shopper, or enjoy VIP treatment at the Guggenheim and Bilbao Fine Arts Museum – our staff can organize it.Elegant and spacious, the hotel’s 142 refurbished rooms are decorated in a relaxing, contemporary style.Enjoy inspiring views of the city and mountains from some rooms.Relax with a hot drink – rooms come with tea and coffee making facilities.Spread out in connecting rooms.Cool, creative Basque cuisine is on the menu at the hotel’s popular restaurant, Le Bol Blanc. The bar offers an impressive selection of gins and vodkas.Park in the hotel’s private car park (upon availability).Our clients can enjoy our magnificent gym with great views of the city.Central location and staff focused on making guests feel unique make the hotel an ideal venue for business events and social gatherings. We can provide everything from furniture to audio visual equipment, as well as offering the latest technology.'
    ]
  },
  {
    id: 'hoteles-silken',
    name: 'HOTELES SILKEN',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/hoteles-silken.jpg',
    contactName: 'OLATZ',
    contactRole: 'SALES',
    email: 'ventas.indautxu@hotelesilken.com',
    phone: '+34649998376',
    website: 'https://www.hoteles-silken.com/es/',
    websiteLabel: 'https://www.hoteles-silken.com/es/',
    address: '',
    paragraphs: [
      'Because we know that traveling means knowing but also feeling at home, at Silken Hotels we advocate being your refuge in all our hotels. We put at your disposal cutting-edge design, comfort, functionality and the best location you are looking for in each of your experiences. We welcome you in facilities of unbeatable quality and always with attentive and professional treatment with the sole objective that you enjoy our hotel as much as you will enjoy your trip. Bilbao, Lekeitio, and Durango are our destinations in BIZKAIA; 3 locations that will allow you to get to know our land in detail; 3 4-star hotels to enjoy the best experience. The reputation that our guests have given us is our best letter of introduction. Come and meet us.'
    ]
  },
  {
    id: 'romotur-dmc',
    name: 'Romotur DMC',
    category: 'dmc',
    logo: 'assets/img/exhibitors/romotur-dmc.jpg',
    contactName: 'Anna Galatina',
    contactRole: 'Commercial',
    email: 'agalatina@romotur.com',
    phone: '34944433463',
    website: 'https://romotur.com/',
    websiteLabel: 'https://romotur.com/',
    address: 'Gordoniz 22, 1 48012 Bilbao',
    paragraphs: [
      'Romotur is a DMC with more than 25 years of experience in the MICE business and incoming leisure tourism. We design exclusive experiences for business incentive programs and leisure groups in wonderful places in the Basque Country and Northern Spain, such as Bilbao, San Sebastian, Vitoria, Rioja, Santander, Galicia, etc. We also support the organization of large-scale events like car launches, conventions, congresses and any kind of event where you need the trust and knowledge of the most experienced local DMC.'
    ]
  },
  {
    id: 'hotel-carlton-hotel-abando',
    name: 'Hotel Carlton & Hotel Abando',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/hotel-carlton-hotel-abando.jpg',
    contactName: 'Silvia Varea & Irune Martin',
    contactRole: 'Sales Manager',
    email: 'svarea@aranzazu-hoteles.com',
    phone: '+34 96611724',
    website: 'https://www.aranzazu-hoteles.com',
    websiteLabel: 'www.aranzazu-hoteles.com',
    address: '',
    paragraphs: [
      'Aránzazu Hotels is a hotel group made up of 5 and 4 star hotels located in the center of the city of Bilbao.From the grandeur of the Hotel Carlton (declared an architectural, artistic and cultural monument) to the functionality of the Hotel Abando (former Trueba cinemas of the Villa de Bilbao), our staff strives to adapt to each type of client with the constant goal of meeting all your needs.Since 1965, our maxim has always been the satisfaction of our guests, that is why we put all our effort to make your stay in the hotels that make up the Aránzazu group unique.We combine tradition and modernity, elegant and functional spaces, good gastronomy, excellent locations and personalized service, making our hotels ideal for both business and leisure trips.We invite you to learn more about our hotels, looking forward to having you with us soon'
    ]
  },
  {
    id: 'destination-consultant-dmc-basque-country',
    name: 'Destination Consultant — DMC Basque Country',
    category: 'dmc',
    logo: 'assets/img/exhibitors/destination-consultant-dmc-basque-country.jpg',
    contactName: 'Gorka Marques',
    contactRole: 'General Manager',
    email: 'gorka@basquecountry-spain-dmc.com',
    phone: '34944717557',
    website: 'https://basquecountry-spain-dmc.com',
    websiteLabel: 'https://basquecountry-spain-dmc.com',
    address: 'C/Muguru 8, entreplanta 48960 - Galdakao - Bilbao Bizkaia Spain',
    paragraphs: [
      'We are DESTINATION CONSULTANT, a DMC located in Bilbao but working the whole of the Basque Country & North of Spain.',
      'We have a MICE Dept. and a LEISURE Dept.',
      'Quality services, attention, best selection of guides, restaurants, venues, unique experiences with Basque and local flavours, hotels, etc.',
      'We take good care of the small details and we have an experienced and creative team at your disposal.',
      'From single services to full programs. We will help & support you alll the way.',
      'As if we were your own office in the Basque Country & North of Spain',
      'Lets meet and I will show you all the possibilities that our destination has to offer without any compromise.'
    ]
  },
  {
    id: 'xarmanta-life',
    name: 'Xarmanta Life',
    category: 'dmc',
    logo: 'assets/img/exhibitors/xarmanta-life.png',
    contactName: 'Itziar Fernández Lamborena',
    contactRole: 'CEO',
    email: 'itziar@xarmantalife.com',
    phone: '+34 685752334',
    website: 'https://www.xarmantalife.com',
    websiteLabel: 'https://www.xarmantalife.com',
    address: 'Edifico Fátima, A, Dpto. 3ALTO ENEKURI 48950 ERANDIOBizkaia',
    paragraphs: [
      'Xarmantalife was born with a clear objective, to design and develop experiences from a different vision and perspective both in the DMC and MICE sectors.We create exceptional experiences and innovative services tailored to improve the lives of our clients.Our travels, our events, are a whim, a need, a dream, a challenge that we make come true.We are inspired by our own curiosity, our creativity, our experience, our passion for a job well done and most importantly, our deep love for our land, the Basque Country.We make the little details make all the difference.Our Services:- Meeting and Congresses- Events and Communication- Incentive trips and activities- Business travel- Leisure trips- Wine and food experiences- VIP shuttle service'
    ]
  },
  {
    id: 'basqueland-serv-turisticos',
    name: 'Basqueland Servicios Turísticos',
    category: 'dmc',
    logo: 'assets/img/exhibitors/basqueland-serv-turisticos.jpg',
    contactName: 'Cris del Rio',
    contactRole: 'CEO',
    email: 'info@basquelands.com',
    phone: '34946462433',
    website: 'https://www.basquelands.com',
    websiteLabel: 'www.basquelands.com',
    address: '',
    paragraphs: [
      'We provide a diversity of tourist services in the Basque Country, either for groups or individuals. We organize events, congresses, incentive programs, cultural or gastronomic tours, trips for the elderly, etc.',
      'Through Basquelands Tourist Services you will find any service that makes your stay or that of your clients something really special. As a receptive agency specialized in the Basque Country, we want to be your closest collaborators. In any of the modalities we design innovative products with content, seeking to enrich the personal experience of each client through close contact with the reality and customs of this country.'
    ]
  },
  {
    id: 'hotel-palacio-urgoiti',
    name: 'Hotel Palacio Urgoiti',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/hotel-palacio-urgoiti.jpg',
    contactName: 'Mikel Solano',
    contactRole: 'CEO',
    email: 'msolano@palaciourgoiti.com',
    phone: '+34 946746868',
    website: 'https://www.palaciourgoiti.com',
    websiteLabel: 'www.palaciourgoiti.com',
    address: 'C/ARRITUGANE SN 48100 MUNGIA BIZKAIA',
    paragraphs: [
      'Have you ever dreamt with living a unique experience sleeping in a palace? Palacio Urgoiti Hotel has at its guests’ disposal a wide range of services to make your experience with us an unforgettable stay.',
      'It is situated near the Bilbao airport and at 10 minutes of the centre of the city. Palacio Urgoiti is completely sourrounded by countryside and has 43 comfortable rooms, all of them fully-equipped with the best technology, features and services to offer an incomparable stay.',
      'At Palacio Urgoiti Hotel our priority is to offer our guests the total comfortable stay. We have the different types of rooms and services to fulfil our guests’ expectations.',
      'Palacio Urgoiti Hotel offers all the services that you will need for your break. We also have at your disposal a golf course, event rooms, heated pool, gym, restaurant and a wide range of services.'
    ]
  },
  {
    id: 'radisson-collection-hotel-gran-via-bilbao',
    name: 'Radisson Collection Hotel Gran Via Bilbao',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/radisson-collection-hotel-gran-via-bilbao.png',
    contactName: 'Ander Elortegi Leniz',
    contactRole: 'Director General',
    email: 'info.bilbao@radissoncollection.com',
    phone: '+34 946 05 67 53 [1]',
    website: 'https://www.radissonhotels.com/en-us/brand/radisson-collection',
    websiteLabel: 'https://www.radissonhotels.com/en-us/brand/radisson-collection',
    address: 'Gran Vía Don Diego López de Haro 4, 48001 Bilbao Bizkaia',
    paragraphs: [
      'Discover vibrant Bilbao and immerse yourself in everything the city has to offer while staying at the contemporary 5-star Radisson Collection Hotel, Gran Vía Bilbao. Conveniently located in the heart of the city, the cosmopolitan Gran Vía district, the hotel is within minutes of Bilbao’s iconic attractions. Combining grand spaces with casual elegance, the hotel is a haven of calm and respite. Marvel at the distinctive pillars of the hotel’s façade before stepping inside to find a renewed Art Déco style with Japanese touches. Enjoy exceptional experiences and services throughout the hotel. With 137 rooms and suites, the incredible NKO Restaurant by Eneko Atxa where Basque and Japanese cuisine comes into its own, and the speakeasy-style rooftop bar with vertical gardens and colorful parasols; a true escape above the city.'
    ]
  },
  {
    id: 'hotel-nafarrola',
    name: 'Hotel Nafarrola',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/hotel-nafarrola.jpg',
    contactName: 'Josu Goikoetxea',
    contactRole: 'Hotel Manager',
    email: 'info@hotelnafarrola.com',
    phone: '+34 659 696 288',
    website: 'https://www.hotelnafarrola.com',
    websiteLabel: 'https://www.hotelnafarrola.com',
    address: 'Artike Auzoa 45, 48370, Bermeo, Biscay, SPAIN',
    paragraphs: [
      'Looking towards the sea and the foothills of the mountain, surrounded by pastures and pure nature, in Bermeo, in the heart of the Urdaibai Biosphere Reserve and just a few minutes from San Juan de Gaztelugatxe and Mundaka, 4* Hotel Nafarrola offers its guests a space of peace and tranquility within the framework incomparable of a farmhouse proposed as monument.',
      'In the interior, the rustic and minimalist style are perfectly combined in all of our spacious rooms, that are equipped with jacuzzi, terrace and king-size bed. Outside, Hotel Nafarrola evokes visitors the perfect union between the modernity and the history of the original farmhouse.',
      'Comfort, culture and nature combined perfectly.'
    ]
  },
  {
    id: 'leonardo-hotels',
    name: 'Leonardo Hotels',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/leonardo-hotels.jpg',
    contactName: 'Diego Buendía',
    contactRole: 'Director of Sales Spain',
    email: 'diego.buendia@leonardo-hotels.com',
    phone: '34 91 553 59 00',
    website: 'https://www.leonardo-hotels.com/nyx-hotel-bilbao',
    websiteLabel: 'https://www.leonardo-hotels.com/nyx-hotel-bilbao',
    address: 'Areatza Kalea 4 , 48005 Bilbao',
    paragraphs: [
      'Since April 2019! : Our very first and brand new concept hotel in Bilbao: The NYX Hotel Bilbao welcomes you to a whole new generation of accommodation. At NYX Hotel Bilbao, not only are you amazed with the hotel’s artistic design, but we also pay careful attention to your value of freedom, taking care of your individual lifestyle and assuring your high level of satisfaction.',
      'What is so special about NYX Hotel Bilbao?',
      'Art has always been the soul and source of inspiration in every NYX Hotel. At NYX Hotel Bilbao, we embrace the charm of nature, hence incorporating it as our main theme for both the exterior and the interior design of the hotel.',
      'The heart of the NYX Hotel Bilbao is formed by our employees – the City Lovers. They love their city, are perfect guides and always know exactly which of Bilbao’s many attractions will make your stay an extraordinary experience, such as: Guggenheim Museum Bilbao, a museum of modern and contemporary art; Isozaki Atea, the tallest residential building (twin towers) of Bilbao,Teatro Arriaga at Arriaga Plaza, the famous opera house in Neo-baroque style.',
      'Centrally located, NYX Hotel Bilbao is also suited to business people with a convenient connection to several companies as well as the conference centre, which is only 2km away.',
      'NYX Hotel Bilbao features 108 rooms, modernly equipped with air-conditioning and high-speed Wi-Fi. The “Clash” Restaurant and Bar offers an international breakfast buffet and a wide range of liquors selection for an enjoyable evening. Besides, our rooftop terrace will be the perfect place for you to relax and chill after a long and productive day.',
      'A spacious conference room is available for business meetings that are all kitted out with the latest equipment.'
    ]
  },
  {
    id: 'barcelo-hotels-resorts',
    name: 'Barceló Hotels & Resorts',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/barcelo-hotels-resorts.jpg',
    contactName: 'Alberto No',
    contactRole: 'MICE Sales Manager',
    email: 'alberto.no@barcelo.com',
    phone: '+34 639169947',
    website: 'https://barcelo.com',
    websiteLabel: 'barcelo.com',
    address: 'Avenida Zumalakarregi 40',
    paragraphs: [
      'Barceló Hotel Group is a MICE-centric hospitality company operating worldwide which is offering two full MICE facility properties in Bilbao city centre: Barceló Bilbao Nervión and Occidental Bilbao.',
      'Barceló Bilbao Nervion is the largest hotel in the Basque Country with 350 guest rooms and 10 meeting rooms. Its extraordinary location next to Bilbao City Council, by the river promenade, make it the perfect spot for combining any kind of meeting and event with some leisure in town.',
      'Occidental Bilbao is an easy living concept hotel with the largest meeting room inside a hotel in the city. With 200 guest rooms, 10 meeting rooms and beautiful common areas, including a fully fledged fitness centre, indoor and outdoor swimming pool and a gorgeous open lobby F&B space, Occidental Bilbao is about the most trendy you can find in Bilbao for any conference, seminar or convention.'
    ]
  },
  {
    id: 'hogel-tayko-bilbao',
    name: 'Hotel Tayko Bilbao',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/hogel-tayko-bilbao.jpg',
    contactName: 'Israel Muñiz',
    contactRole: 'General Manager',
    email: 'israel@taykohotels.com',
    phone: '+34 944652070',
    website: 'https://www.taykohotels.com',
    websiteLabel: 'www.taykohotels.com',
    address: 'Ribera 1348005 Bilbao',
    paragraphs: [
      '4 star hotel in the center of the Old city. 2 restaurants.- Ola Martin Berasategui with 1 Michelin Star – Patri Martin Berasategui'
    ]
  },
  {
    id: 'ercilla-de-bilbao-autograph-collection',
    name: 'Ercilla de Bilbao Autograph Collection',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/ercilla-de-bilbao-autograph-collection.jpg',
    contactName: 'Adrian Vicente',
    contactRole: 'Sales Manager',
    email: 'avicente@ercilladebilbao.com',
    phone: '34944705700',
    website: 'https://www.ercilladebilbao.com',
    websiteLabel: 'www.ercilladebilbao.com',
    address: '',
    paragraphs: [
      'Ercilla Hotel open since 1972 has join Marriott after a complete renovation to met the Autograph Collection standards. Red Deer has completely redesigned this iconic central Bilbao institution, restoring the building to its original glory as a landmark venue in the vibrant Spanish city.Dating back to the 1970s and the first purpose built hotel in BIlbao, Hotel Ercilla was the go-go destination for every celebrity visiting the Basque region.Honouring the grandeur of the 1970s and 80s in all its brashness and observing the hotel´s own unique heritage,history and design has been interlinked through the concept “Vintage Glamour the Bilbao Way”.',
      'With 285 rooms and meeting halls for almost 500 attendees Ercilla de Bilbao is the right option to stay in Bilbao'
    ]
  },
  {
    id: 'melia-bilbao-hotel-5',
    name: 'Meliá Bilbao Hotel 5*',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/melia-bilbao-hotel-5.jpg',
    contactName: 'Jon de Lorenzo',
    contactRole: 'Director of Sales & Marketing',
    email: 'jon.delorenzo@melia.com',
    phone: '34600949762',
    website: 'https://www.melia.com',
    websiteLabel: 'www.melia.com',
    address: 'Meliá Bilbao Hotel 5*Lehendakari Leizaola, 2948011. BilbaoSPAIN',
    paragraphs: [
      '·The elegant architecture dazzles alongside the Euskalduna Palace, Doña Casilda Park and the Nervión River. Enjoy a delightful walk along the shore to the historic city centre·A few minutes from the Guggenheim Museum, Museum of Fine Art and Iberdrola Tower, this hotel in the centre of Bilbao is ideal for cultural and business trips. Very well connected with public transport allowing visitors to get around the city very easily·Our spacious, bright rooms and suites offer magnificent views and amenities that will make your stay the most pleasant experience·Dining options for any time of day, from an extensive, healthy breakfast to tapas, pintxos and cocktails in the Q Lounge and Mediterranean cuisine at Quatre. The Aizan Restaurant serves Basque cuisine of the highest quality, seeking a modern twist to traditional cuisine using only the best ingredients·Stay in shape or relax in the large Wellness Centre with over 200 m2 of space including a fully equipped gym, heated semi-outdoor pool with great views, saunas and beauty and health treatments·Discover the ideal place to celebrate your professional or personal event in a unique hotel with an expert professional team and the finest facilities for creating memorable moments Located in the centre of the city, Meliá Bilbao perfectly combines comfort, quality, superb service, business and pleasure. It is located opposite the Congress Palace and the Música Euskalduna, the Doña Casilda Park, Ría Nervión and is only 15 minutes from the International Airport of Bilbao. Furthermore, it is a short walk from the Guggenheim Museum, the Museum of Fine Art and the new Maritime Museum.Designed by the prestigious architect Ricardo Legorreta, Meliá Bilbao is inspired by the work of the Basque sculptor Eduardo Chillida. Amongst its magnificent facilities and services, the hotel provides 211 contemporarily designed rooms; different dining spaces (Quatre Restaurant, Aizian Restaurant, Q Lounge pintxos-tapas bar and breakfast buffet); free Wi-Fi internet throughout the hotel; E – Point (*);Wellness Center with 24 hour gym, semi-outdoor heated pool and male and female sauna; 7 meeting rooms with a maximum capacity for up to 300 people; spectacular lobby 40 metres tall and private parking with direct access to reception'
    ]
  },
  {
    id: 'go-basquing',
    name: 'go Basquing',
    category: 'dmc',
    logo: 'assets/img/exhibitors/go-basquing.jpg',
    contactName: 'Iñigo Garcia-Valenzuela',
    contactRole: 'CEO',
    email: 'inigogv@gobasquing.com',
    phone: '34679342601',
    website: 'https://www.gobasquing.com',
    websiteLabel: 'www.gobasquing.com',
    address: 'Txakursolo, 3 48992 Getxo Bizkaia - Spain',
    paragraphs: [
      'We are a Boutique DMC based in Bilbao.',
      'Inspiring product managers to create local meaningful stories for leisure groups and team companies(incentives; offsites).',
      'We are local and will make everything easy for you !',
      'Our committment: it’s all about quality and details :)',
      'Based on our experience, we are launching a new range of programs for small groups.',
      'Let us help you to make a difference !!'
    ]
  },
  {
    id: 'fresco-tours',
    name: 'Fresco Tours',
    category: 'dmc',
    logo: 'assets/img/exhibitors/fresco-tours.jpg',
    contactName: 'Alex Chang',
    contactRole: 'CEO / Owner',
    email: 'info@frescotours.com',
    phone: '+34 944248989',
    website: 'https://www.frescotours.com',
    websiteLabel: 'https://www.frescotours.com',
    address: 'Colón de Larreategui 26 - 7ºC48009 Bilbao, Vizcaya',
    paragraphs: [
      'We are a travel agency specializing in cultural walking tours along the Camino de Santiago, Basque Country, Costa Brava and other parts of Spain.Based in Bilbao, we develop routes from our backyard through firsthand knowledge of the land and its people. We continue to foster and maintain strong, long-lasting relationships with local hotels, restaurants, and suppliers in order to assure that they meet our highest quality standards. Through regular visits and open communication with our many partners, we have formed a network of people and places ready to assist you on every step of your journey. We will truly take you off-the-beaten path and introduce you to our friends and favorite secret spots!'
    ]
  },
  {
    id: 'moana-eco-surf-house',
    name: 'Moana Eco Surf house',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/moana-eco-surf-house.jpg',
    contactName: 'Arantza Etxebarria',
    contactRole: 'Commercial',
    email: 'info@moanasurfhouse.com',
    phone: '+34 648 821 724',
    website: '',
    websiteLabel: '',
    address: '',
    paragraphs: [
      'Surfing, nature and sustainability. We offer a unique experience in Sopela, just 300 metres from the sea. Enjoy a privileged environment, a relaxed atmosphere and the best waves in the country.Moana Eco Surf House represents our passions and philosophy of life. Our hostel is built and managed in an environmentally-friendly way and promotes surfing, yoga and skating.Conceived to enjoy experience surrounded by people with the same interests and served by a team that will make guests feel right at home.'
    ]
  },
  {
    id: 'opce-vasca-association',
    name: 'OPCE VASCA ASSOCIATION',
    category: 'dmc',
    logo: 'assets/img/exhibitors/opce-vasca-association.jpg',
    contactName: 'Virginia Perez',
    contactRole: 'Event Manager',
    email: 'presidencia@opce.eus',
    phone: '+34 650 948 358',
    website: 'https://www.opce.eus/en/',
    websiteLabel: 'https://www.opce.eus/en/',
    address: 'Telesforo Aranzadi, 2-1º dcha48008 - Bilbao',
    paragraphs: [
      'To make the Basque Country and its companies a MICE reference.OPCE VASCA gathers companies specialised in organising congresses and events, backed by its professionalism, experience, operativeness, entrepreneurship, creativity, innovation, sustainability, efficiency…Companies that are excited about their projects and which inspire their customers, collaborators and workers.Decisive companies which also offer high queality in service management.'
    ]
  },
  {
    id: 'explora-norte',
    name: 'EXPLORA-NORTE',
    category: 'dmc',
    logo: 'assets/img/exhibitors/explora-norte.jpg',
    contactName: 'Laura Martinez',
    contactRole: 'CEO',
    email: 'INFO@EXPLORA-NORTE.COM',
    phone: '679593168',
    website: 'https://WWW.EXPLORANORTE.COM',
    websiteLabel: 'WWW.EXPLORANORTE.COM',
    address: '',
    paragraphs: [
      'Explora-Norte is a tailor-made experiences workshop. Our passion to discover has led us to be experts in tourism in the Basque Country, to visit every corner of Euskadi. All this allows us to design different luxury experiences that capture the essence of each place in a unique and personal way. We turn destinations into experiences. To do this, we design and organize premium, unique and experiential routes for those travelers who are looking for something different, taking maximum care of those small details that make a big difference. We seek exclusivity and personality. All our tours of Bilbao, San Sebastián and Vitoria are custom designed, with a selection of unique products designed to offer real experiences at the destination. We take care of every detail, we dedicate all the time and effort that each traveler deserves. Because we know that the difference between an ordinary trip and an amazing one is precisely in the small stitches… We do not believe in traveling for travel’s sake, but we are committed to offering a type of unique and unforgettable experience, a tour that, beyond the destination, produces sensations and experiences. Let the experience make you feel. We invite you to discover a territory full of contrasts, to enjoy its beauty and share our culture. Diverse perspectives through art, crafts, science, history, its gastronomy, its people, its traditions, its passions… We are specialists in experiences in the Basque Country, premium, alternative & leisure tourism and experts in excursions or tours of Bilbao, San Sebastián and Vitoria.'
    ]
  },
  {
    id: 'bilbao-paso-a-paso',
    name: 'BILBAO PASO A PASO',
    category: 'dmc',
    logo: 'assets/img/exhibitors/bilbao-paso-a-paso.jpg',
    contactName: 'Garbiñe Naverán',
    contactRole: 'CEO',
    email: 'naveran@bilbaopasopaso.com',
    phone: '34679363239',
    website: 'https://www.bilbaopasoapaso.com/',
    websiteLabel: 'https://www.bilbaopasoapaso.com/',
    address: 'c/San Nicolás de Olabeaga, 62B posterior 48013 Bilbao. Bizkaia',
    paragraphs: [
      'BILBAO PASO A PASO is one of the oldest Basque receptive tourism companies with more than twenty years of experience. We have specialized in MICE tourism, incentives, business trips, events, cruises, LGBT+ and the Basque diaspora with special emphasis on the Basque Country, Navarre, Cantabria, La Rioja and the French Basque Country, being the greatest specialist in the management of tourist groups from Japan in the Basque Country.',
      'At the same time, we coordinate cruise calls of different companies arriving at the ports of Asturias, Cantabria, and the Basque Country.',
      'We consider ourselves a “travel tailor shop” because we design each one of the trips according to our clients’ specific needs, making them unique and exclusive.',
      'Our philosophy consists of active and constant work in a relaxed and friendly environment. In BILBAO PASO A PASO you will find fun people to work with, but do not be fooled by this image.',
      'We enjoy what we do, but our work is always framed in the context of the professionalism demonstrated and contrasted throughout all these years.',
      'Furthermore, we have carried out various representation and advising functions in public institutions tourism boards. We are a founding member of the Association of the Basque Country Receptive Agency (ASOARTE), and a prominent member of the Bilbao Convention Bureau (BiCB).',
      'We have also participated in the main national and international tourism promotion events and fairs, which has led us to visit a large number of European, American, and Asian cities in the last two decades. This has been a useful and necessary experience that has helped us to develop and implement new and innovative services and products in a highly competitive and changing context.'
    ]
  },
  {
    id: 'hotel-miro-bilbao',
    name: 'Hotel Miro Bilbao',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/hotel-miro-bilbao.jpg',
    contactName: 'Estibaliz Egusquiza',
    contactRole: 'Director of Sales & Marketing',
    email: 'sales@mirohotelbilbao.com',
    phone: '34661171757',
    website: 'https://www.mirohotelbilbao.com',
    websiteLabel: 'www.mirohotelbilbao.com',
    address: 'Alameda Mazarredo, 77 48009 Bilbao Bizkaia',
    paragraphs: [
      'Located in the heart of the “golden mile” in beautiful Bilbao, Spain, Hotel Miro is an ideal location for exploring the city. You could hardly get any closer to the Guggenheim Museum without joining the works of art on its walls. The hotel is also on the doorstep of the Fine Arts Museum and several other cultural landmarks.',
      'Styled by famed fashion designer Antonio Miró — Spain’s answer to Calvin Klein — the 50 guestrooms celebrate clean, stylish design. Cream walls and white bed linen are accentuated with pops of color, creating a relaxed but elegant vibe. Floor-to-ceiling windows add to the breezy feeling, offering expansive views of the city, the Guggenheim, or the tranquil interior patios. Freshen up with a shower in the black marble bathroom using luxurious toiletries from the prestigious Gilchrist & Soames Reserve Collection before resting in your comfortable bed.',
      'The hotel fitness center is the place to go to keep active, and the private library is a quiet spot to relax. The elegant meeting rooms are perfect for intimate meetings or events.',
      'BBB Breakfast – Hotel Miro’s signature breakfast, the Brown Bread Bag breakfast, is 100% local. Start your day with sourdough and pastries from a local bakery, regional handmade jams, and naturally roasted organic coffee. The à la carte options also prize seasonal ingredients, with dishes like salted porridge, poached egg, avocado and Idiazábal (Basque Country cheese), and pancakes with red fruit and Urdaibai honey.',
      'While Hotel Miro does not have a full-service restaurant, neighboring restaurants, bistros, and cafés are sure to please. You can also take the 15-minute drive to Azurmendi, a three-star Michelin restaurant headed by celebrity chef Eneko Atxa. Spend another night pintxos-bar hopping along Plaza Nueva, or sample delicacies in the food halls of the Mercado de la Ribera.'
    ]
  },
  {
    id: 'hotel-mercure-bilbao-jardines-de-albia',
    name: 'Hotel Mercure Bilbao Jardines de Albia',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/hotel-mercure-bilbao-jardines-de-albia.jpg',
    contactName: 'Sito Pons',
    contactRole: 'General Manager',
    email: 'HA057-GM@ACCOR.COM',
    phone: '34672054235',
    website: 'https://all.accor.com/hotel/A057/index.es.shtml',
    websiteLabel: 'https://all.accor.com/hotel/A057/index.es.shtml',
    address: 'SAN VICENTE 6 48001 BILBAO',
    paragraphs: [
      'The Mercure Jardines de Albia Bilbao Hotel is next to the city’s main points of interest: Guggenheim Museum Bilbao, Museum of Fine Arts, and Old Town, with easy access to the Euskalduna Palace. It is ideal to enjoy the city, close to dining, bars, and shopping. The hotel has 138 rooms, breakfast, a spa to relax and 3 meeting rooms as well as paid parking with direct access to the hotel'
    ]
  },
  {
    id: 'aktiba',
    name: 'Aktiba',
    category: 'activities',
    logo: 'assets/img/exhibitors/aktiba.jpg',
    contactName: 'Marina Estancona',
    contactRole: 'Technical Office',
    email: 'info@aktiba.eus',
    phone: '+34 637 77 00 33',
    website: 'https://aktiba.eus/en/',
    websiteLabel: 'https://aktiba.eus/en/',
    address: '',
    paragraphs: [
      'Aktiba is the Basque Association of Active Tourism, Adventure Sports and Nature Companies, created in 2004 to bring together the key players in the Basque Country\'s active tourism and adventure sports industry in rural and urban environments.',
      'Aktiba is committed to integrating active tourism into the general tourism framework, providing companies with tools and services to enhance management, promoting professional training in the industry and fostering joint projects to absorb innovation into the industry.'
    ]
  },
  {
    id: 'hotel-zenit-bilbao',
    name: 'Hotel Zenit Bilbao',
    category: 'accommodation',
    logo: 'assets/img/exhibitors/hotel-zenit-bilbao.jpg',
    contactName: 'Joseba Goirigolzarri',
    contactRole: 'Hotel Manager',
    email: 'dirbilbao@zenithoteles.com',
    phone: '629657719',
    website: 'https://bilbao.zenithoteles.com',
    websiteLabel: 'https://bilbao.zenithoteles.com',
    address: 'Autonomia, 58 48012 Bilbao Bizkaia Basque Country',
    paragraphs: [
      'A 4-star hotel located in the Indautxu district. It’s central location allows visitors to visit the city on foot, or by using the modern Tram with a stop located directly in front of the Hotel entrance.',
      'The restaurant is situated on the principal floor which benefits from a 5 metre high ceiling, and gives access to a magnificent terrace, for the exclusive use of the clients.',
      'The Hotel offers a superb breakfast buffet, with much of the produce being certified with the Basque Label of quality and sourced locally.',
      'Lunches and dinners combine the best quality fresh produce with 24-hour room service.',
      'The Ondiz and Loiola lounges, located between ground and first floors, offer the latest technological facilities for whatever type of celebration or meeting.',
      'Clients can benefit from a recently updated WiFi service guaranteeing perfect coverage throughout the hotel.',
      'Hotel parking is located on the -1 and -2 floors and there is free use of the Urtzi Gymnasium, situated 200m from the hotel.'
    ]
  },
  {
    id: 'bizi-cycle-tours',
    name: 'Bizi Cycle Tours',
    category: 'activities',
    logo: 'assets/img/exhibitors/bizi-cycle-tours.jpg',
    contactName: 'Ander Ortiz de Zarate',
    contactRole: 'CEO',
    email: 'bizicycletours@gmail.com',
    phone: '690698551',
    website: 'https://www.bizicycletours.com/',
    websiteLabel: 'https://www.bizicycletours.com/',
    address: 'Jardines de Gernika 13, 8C 48003, Bilbao (Vizcaya), SPAIN',
    paragraphs: [
      'Bizi Cycle Tours is born to unite the new sports tourism with the charm and alternatives that Bilbao and the Basque Country can offer. After a lifetime dedicated to sport, former triathlon world champion, Virginia Berasategui makes all her knowledge of the astonishing roads and landscape of Bilbao available for bicycle tourists.',
      'At Bizi Cycle Tours, cycling is mixed with local gastronomy and culture to allow our customers to fully experience the Basque Country, especially Bilbao and its impressive surroundings.',
      '– The Basque Country is a region with unparalleled landscape and undoubtedly the home of cycling. It is the birthplace of great talents and there is a lot of respect for cyclists on the roads.',
      '– Ex-professional local sportsmen and sportswomen guiding our tours.',
      '– Obsession to get to know our customer and offer him/her the most customized and exclusive experience.',
      '– The most comprehensive and exclusive offer available on the luxury cycling tour market.',
      '– Our tracks have been refined by Virginia Berasategui after many years of training; they are full of magnificent scenery, hidden backroads and breath-taking spots.',
      '– Our customers also get the chance to savor traditional Basque cuisine, enjoy the exclusiveness of Michelin star restaurant or delight their palate with exclusive under water wine tasting.'
    ]
  },
  {
    id: 'nis-dmc',
    name: 'NIS DMC',
    category: 'dmc',
    logo: 'assets/img/exhibitors/nis-dmc.jpg',
    contactName: 'Chelo Escabias',
    contactRole: 'Commercial Dpt',
    email: 'mmar@nis.es',
    phone: '+34 618925415',
    website: 'https://nis.es',
    websiteLabel: 'nis.es',
    address: 'BILBAO',
    paragraphs: [
      'NIS, NORTH INCOMING SERVICE is an incoming agency operating in Basque Country & Rioja , Northern Spain. As a local DMC with more than 29 years of experience, we are specialized professionals in organizing incentive proposals, unique experiences, and tailored programs focused on our customers’ special interests, cultural, architectural, and gastronomical & wine tours in our destinations. NIS also offers innovative & sustainable experiences and tours, approaching visitors to our socio-cultural heritage in a creative and environmentally friendly way, in collaboration with local suppliers committed to these same values. Small-group custom tours, extensive knowledge and friendly local guides, authentic experiences with selected local providers and small producers, km0 and slow food-based gastronomy, environment-friendly mobility alternatives, green active options among nature, cultural heritage & rural lifestyle proposals. Our aim is to create unforgettable experiences and lasting impressions for your clients in our amazing destination.'
    ]
  }
];
