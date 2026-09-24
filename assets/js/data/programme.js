/* =============================================================================
   EVENT PROGRAMME
   -----------------------------------------------------------------------------
   The real programme of Match Bilbao Bizkaia 2026, 6 – 10 October, translated
   from the official document. Five days: participants arrive on Tuesday 6 and
   leave on Saturday 10, and both of those days carry programme of their own.

   On Wednesday 7 the event splits into two groups with different itineraries,
   so every slot that day is marked with the group it belongs to. Days without
   such marks are the same for everyone.

   Slot fields:
     time    — start, 24h "HH:MM". Also what the timeline rail shows.
     end     — optional end time; when absent the slot runs to the next one,
               which is what the calendar export assumes.
     title   — slot heading
     text    — one short supporting sentence (optional)
     venue   — location line (optional)
     group   — 'g1' / 'g2' on a day that splits; omitted when it is shared
     feature — true to give the slot a highlighted card
     open    — true when the time is not fixed yet (arrivals, departures); the
               slot is shown without a time and left out of the calendar file.
     card    — false keeps the slot off the day's card in the overview, and
               nothing takes its place: the card simply shows one line fewer.
               Use it for something the card already says in other words. The
               slot stays in the detailed view and in the calendar file.

   Day fields worth knowing about:
     split   — true when the day runs in two groups. Turns on the group
               switcher in the detailed view and the "Two itineraries" line.
     routes  — on a day that splits, one line per group saying where it goes:
               { group: 'g1', text: '…' }. Shown on the day's card. The group
               name comes from `groups` below, not from this text.
   ========================================================================== */

window.MBB = window.MBB || {};

window.MBB.programme = {
  // Used by the calendar export. Bilbao is on Central European Time.
  timezone: 'Europe/Madrid',

  // La nota al pie del programa. VACÍA A PROPÓSITO: eran tres frases de letra
  // pequeña debajo de las tarjetas, alargaban la sección y decían cosas que ya
  // se dicen en el correo de confirmación. Escribiendo algo aquí —o en el
  // panel— vuelve a salir sola; no hay que tocar código.
  //
  // Decía esto, por si hiciera falta recuperarla:
  //   "All times are shown in Central European Time. Arrival and departure
  //    times follow each participant's flights and are confirmed individually.
  //    The final programme is confirmed to registered participants by email."
  note: '',

  // The two itineraries of Wednesday 7. Both groups stay in the same hotel.
  groups: [
    { id: 'g1', label: 'Group 1' },
    { id: 'g2', label: 'Group 2' }
  ],

  days: [
    /* --- Tuesday 6 ------------------------------------------------------- */
    {
      id: 'day-1',
      label: 'Day 1',
      date: 'Tuesday 6 October',
      dateISO: '2026-10-06',
      theme: 'Welcome',
      summary:
        'Arrival, transfer to the hotel and the welcome dinner at San Mamés ' +
        'stadium.',
      slots: [
        {
          open: true,
          title: 'Arrival at Bilbao International Airport',
          text:
            'The official vehicle waits for every participant on arrival and ' +
            'takes them to the hotel.',
          tag: 'destination'
        },
        {
          open: true,
          title: 'Check-in and welcome drink',
          text: 'Both groups stay in the same hotel.',
          venue: 'Hotel Radisson Bilbao',
          tag: 'social'
        },
        {
          time: '18:15',
          title: 'Meeting point in the lobby',
          text:
            'If the forecast is poor, 18:30 for the tram transfer or 18:40 ' +
            'for the bus.',
          venue: 'Hotel Radisson Bilbao',
          tag: 'destination'
        },
        {
          time: '19:00',
          end: '19:30',
          title: 'Guided tour of the stadium',
          venue: 'San Mamés',
          tag: 'destination'
        },
        {
          time: '19:30',
          title: 'Welcome cocktail',
          venue: 'San Mamés Jatetxea',
          tag: 'social'
        },
        {
          time: '20:00',
          title: 'Welcome dinner',
          venue: 'San Mamés Jatetxea',
          tag: 'social',
          feature: true
        },
        {
          time: '21:40',
          end: '22:10',
          title: 'Transfer back to the hotel by bus',
          tag: 'destination'
        }
      ]
    },

    /* --- Wednesday 7 — two itineraries ----------------------------------- */
    {
      id: 'day-2',
      label: 'Day 2',
      date: 'Wednesday 7 October',
      dateISO: '2026-10-07',
      theme: 'Coast of Bizkaia',
      // FALTAN CUATRO PALABRAS RESPECTO AL TEXTO ORIGINAL, y no es un descuido.
      //
      // Decía «…de Bizkaia, IN TWO GROUPS WITH DIFFERENT ROUTES, ending in
      // lunch…», y eso ya lo dicen dos cosas que están justo debajo: el rótulo
      // «Two itineraries» y las dos líneas que nombran adónde va cada grupo.
      // Dicho tres veces seguidas en una tarjeta de 220px de ancho.
      //
      // Y se pagaba caro: esas cuatro palabras eran dos líneas más en la
      // tarjeta más alta, y como todas las tarjetas se igualan a la más alta,
      // eran 48px en las cinco. Con ellas, el programa no cabía en una
      // pantalla de portátil; sin ellas, cabe. Si se quieren de vuelta, se
      // escriben aquí y lo único que pasa es que hay que bajar un poco.
      summary:
        'A full day through the coast of Bizkaia, ending in lunch together ' +
        'at Bodega Berroja (located in the Urdaibai Biosphere Reserve) and ' +
        'dinner on a rooftop.',
      split: true,
      // Adónde va cada grupo, en una línea. El detalle hora a hora está abajo,
      // en los slots, pero para eso hay que abrir "Day by day" y elegir grupo:
      // quien solo mira la tarjeta del día quiere saber si le toca el bosque
      // de Oma o Urkiola, no a qué hora sale el minibús.
      //
      // El nombre del grupo no se escribe aquí: sale de `groups`, arriba, que
      // es lo que también rotula el selector de la vista detallada. Escrito
      // dos veces, un día dirían cosas distintas.
      routes: [
        { group: 'g1', text: 'Oma Forest, Gernika & Gaztelugatxe.' },
        { group: 'g2', text: 'Gaztelugatxe, Bermeo & Urkiola Natural Park.' }
      ],
      slots: [
        /* Group 1 — Oma Forest, Gernika */
        { group: 'g1', time: '09:00', title: 'Guide and minibus presentation', venue: 'Hotel Radisson Bilbao', tag: 'destination' },
        { group: 'g1', time: '09:15', title: 'Departure from the hotel', tag: 'destination' },
        {
          group: 'g1',
          time: '10:15',
          end: '11:30',
          title: 'Guided visit to the Oma Forest by 4x4',
          text: 'The painted forest of Agustín Ibarrola, inside the Urdaibai Biosphere Reserve.',
          tag: 'destination',
          feature: true,
          // Fuera de la tarjeta del día, no del programa. La tarjeta ya dice
          // "Group 1: Oma Forest, Gernika & Gaztelugatxe" dos líneas más
          // arriba, y repetirlo justo debajo hacía que el día pareciera tener
          // una sola cosa. Sigue entero en "Day by day" y en el calendario.
          card: false
        },
        { group: 'g1', time: '11:45', title: 'Coffee break', venue: 'Lezika', tag: 'social' },
        { group: 'g1', time: '12:15', title: 'Transfer to Gernika', tag: 'destination' },
        { group: 'g1', time: '12:30', title: 'Arrival in Gernika and visit to the town', tag: 'destination' },
        { group: 'g1', time: '13:15', title: 'Peace Museum', venue: 'Gernika', tag: 'destination' },
        { group: 'g1', time: '13:45', title: 'Departure for Bodega Berroja', tag: 'destination' },
        {
          group: 'g1',
          time: '14:00',
          end: '15:45',
          title: 'Lunch, wine tasting and herri kirolak exhibition',
          text: 'Basque rural sports, shown by the athletes who compete in them.',
          venue: 'Bodega Berroja',
          tag: 'social',
          feature: true
        },
        { group: 'g1', time: '16:45', title: 'Stop at the San Juan de Gaztelugatxe viewpoint', tag: 'destination' },
        { group: 'g1', time: '17:30', title: 'Return to Bilbao', tag: 'destination' },
        { group: 'g1', time: '18:15', title: 'Arrival at the hotel and free time', tag: 'social' },
        { group: 'g1', time: '19:30', title: 'Meet the guide for the transfer to the rooftop', tag: 'destination' },
        { group: 'g1', time: '20:00', title: 'Dinner', venue: 'Ercilla rooftop', tag: 'social', feature: true },

        /* Group 2 — Gaztelugatxe, Bermeo, Urkiola */
        { group: 'g2', time: '09:00', title: 'Guide and minibus presentation', venue: 'Hotel Radisson Bilbao', tag: 'destination' },
        { group: 'g2', time: '09:15', title: 'Departure from the hotel', tag: 'destination' },
        {
          group: 'g2',
          time: '10:15',
          end: '11:30',
          title: 'San Juan de Gaztelugatxe: the climb to the hermitage',
          text: 'The 241 steps out along the causeway and up to the chapel.',
          tag: 'destination',
          feature: true
        },
        { group: 'g2', time: '11:45', title: 'Departure for Bermeo', tag: 'destination' },
        {
          group: 'g2',
          time: '12:00',
          end: '13:00',
          title: 'Bermeo and Conservas Arroyabe',
          text: 'A walk through the fishing town and a visit to the cannery.',
          tag: 'destination'
        },
        { group: 'g2', time: '13:30', title: 'Arrival at Bodega Berroja', tag: 'destination' },
        {
          group: 'g2',
          time: '14:00',
          end: '15:45',
          title: 'Lunch, wine tasting and herri kirolak exhibition',
          text: 'Basque rural sports, shown by the athletes who compete in them.',
          venue: 'Bodega Berroja',
          tag: 'social',
          feature: true
        },
        {
          group: 'g2',
          time: '16:45',
          title: 'Urkiola: the sanctuary and the Tres Cruces viewpoint',
          tag: 'destination'
        },
        { group: 'g2', time: '17:15', title: 'Return to Bilbao', tag: 'destination' },
        { group: 'g2', time: '18:15', title: 'Arrival at the hotel and free time', tag: 'social' },
        { group: 'g2', time: '19:30', title: 'Meet the guide for the transfer to the rooftop', tag: 'destination' },
        { group: 'g2', time: '20:00', title: 'Dinner', venue: 'The Artist rooftop', tag: 'social', feature: true }
      ]
    },

    /* --- Thursday 8 ------------------------------------------------------ */
    {
      id: 'day-3',
      label: 'Day 3',
      date: 'Thursday 8 October',
      dateISO: '2026-10-08',
      theme: 'Donostia',
      summary:
        'Both groups travel together to San Sebastián, and return for dinner ' +
        'reached by boat across the estuary.',
      slots: [
        {
          time: '09:00',
          title: 'Meeting point in the lobby',
          text:
            'Both groups spend the day together; the walking tours are run in ' +
            'groups of no more than 25.',
          tag: 'destination'
        },
        { time: '10:30', title: 'Arrival in Donostia and meeting with the guide', tag: 'destination' },
        { time: '11:00', title: 'Miramar Palace: the groups divide', tag: 'destination' },
        {
          time: '11:00',
          end: '12:50',
          title: 'La Concha, the Town Hall, Alderdi Eder and the Old Town',
          text: 'The main landmarks of San Sebastián on foot.',
          tag: 'destination',
          feature: true
        },
        { time: '13:00', title: 'Welcome at Muka: gilda and txakoli', venue: 'Muka', tag: 'social' },
        { time: '13:20', title: 'Lunch', venue: 'Muka', tag: 'social' },
        { time: '15:00', title: 'Walk to Avenida Navarra for departure', tag: 'destination' },
        { time: '15:15', title: 'Departure for Bilbao', tag: 'destination' },
        { time: '16:30', title: 'Arrival at the hotel', venue: 'Hotel Radisson Bilbao', tag: 'destination' },
        { time: '17:45', title: 'Meeting point in the lobby', tag: 'destination' },
        { time: '18:00', title: 'Departure by boat', venue: 'Vincci Consulado', tag: 'destination' },
        {
          time: '19:45',
          title: 'Crusoe Treasure underwater winery',
          text: 'Wine aged on the seabed of the Bay of Plentzia.',
          tag: 'destination',
          feature: true
        },
        { time: '20:15', title: 'Boarding for Portugalete', tag: 'destination' },
        {
          time: '20:30',
          title: 'Dinner',
          venue: 'Gran Hotel Puente Colgante',
          tag: 'social',
          feature: true
        },
        { time: '22:00', end: '22:30', title: 'Return to the hotel', tag: 'destination' }
      ]
    },

    /* --- Friday 9 -------------------------------------------------------- */
    {
      id: 'day-4',
      label: 'Day 4',
      date: 'Friday 9 October',
      dateISO: '2026-10-09',
      theme: 'B2B workshop & Bilbao',
      summary:
        'The working morning at the Iberdrola Tower, pintxos in the Old Town, ' +
        'and a private visit to the Guggenheim before the farewell dinner.',
      slots: [
        { time: '08:00', title: 'Meeting point in the lobby', text: 'For the transfer to the Iberdrola Tower.', tag: 'destination' },
        { time: '08:15', title: 'Departure for the Iberdrola Tower', tag: 'destination' },
        { time: '08:30', title: 'Arrival, accreditations and table allocation', venue: 'Iberdrola Tower', tag: 'meetings' },
        { time: '08:45', title: 'Institutional intervention', venue: 'Iberdrola Tower', tag: 'meetings' },
        {
          time: '09:10',
          end: '13:00',
          title: 'B2B workshop',
          text:
            'The working session of the event: pre-scheduled appointments ' +
            'between international buyers and the exhibitors of the destination.',
          venue: 'Iberdrola Tower',
          tag: 'meetings',
          feature: true
        },
        { time: '13:00', title: 'Transfer to the Old Town by tram, through Abandoibarra', tag: 'destination' },
        {
          time: '13:15',
          end: '15:30',
          title: 'Walk and pintxos tour of the Old Town',
          tag: 'social',
          feature: true
        },
        { time: '15:30', end: '18:45', title: 'Free afternoon', text: 'To explore the city, or to rest.', tag: 'social' },
        { time: '18:45', title: 'Meeting point in the lobby', tag: 'destination' },
        {
          time: '19:15',
          end: '20:15',
          title: 'Private guided visit to the Guggenheim Museum Bilbao',
          tag: 'destination',
          feature: true
        },
        { time: '20:30', title: 'Seating', venue: 'Guggenheim Museum Bilbao', tag: 'social' },
        {
          time: '20:45',
          end: '22:30',
          title: 'Farewell dinner',
          venue: 'Guggenheim Museum Bilbao',
          tag: 'social',
          feature: true
        },
        { time: '22:45', end: '23:15', title: 'Return to the hotel', tag: 'destination' }
      ]
    },

    /* --- Saturday 10 ----------------------------------------------------- */
    {
      id: 'day-5',
      label: 'Day 5',
      date: 'Saturday 10 October',
      dateISO: '2026-10-10',
      theme: 'Departure',
      summary: 'Check-out and transfers to the airport.',
      slots: [
        { open: true, title: 'Check-out', venue: 'Hotel Radisson Bilbao', tag: 'social' },
        {
          open: true,
          title: 'Transfers to the airport',
          text: 'Times follow each participant’s flight.',
          tag: 'destination'
        }
      ]
    }
  ]
};
