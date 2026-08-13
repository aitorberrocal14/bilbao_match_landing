/* =============================================================================
   EVENT PROGRAMME
   -----------------------------------------------------------------------------
   [Insert programme details] — times and titles below are a working proposal so
   the layout can be reviewed. Add, remove or reorder days and slots freely: the
   timeline component renders whatever it finds here.

   Slot fields:
     time    — displayed on the timeline rail
     title   — slot heading
     text    — one short supporting sentence (optional)
     venue   — location line (optional)
     tag     — 'plenary' | 'meetings' | 'destination' | 'social' (styles the dot)
     feature — true to give the slot a highlighted card
   ========================================================================== */

window.MBB = window.MBB || {};

window.MBB.programme = {
  intro:
    'Three days built around one idea: fewer, better conversations. Mornings ' +
    'are dedicated to structured B2B meetings, afternoons to experiencing the ' +
    'destination first hand.',
  note:
    'All times are shown in CET (Central European Time). The final programme ' +
    'will be confirmed to registered participants by email.',
  days: [
    {
      id: 'day-1',
      label: 'Day 1',
      date: 'Monday 8 June',
      theme: 'Welcome & the city',
      slots: [
        {
          time: '09:00',
          title: 'Accreditation and welcome coffee',
          text: 'Collect your badge and meeting schedule at the main desk.',
          venue: '[Insert venue]',
          tag: 'social'
        },
        {
          time: '10:00',
          title: 'Official opening — Bilbao Bizkaia 2026',
          text:
            'Institutional welcome and presentation of the destination strategy ' +
            'for the coming season.',
          venue: '[Insert venue]',
          tag: 'plenary',
          feature: true
        },
        {
          time: '11:00',
          title: 'Destination briefing: city, coast, culture, nature',
          text:
            'A concise overview of the four pillars that shape the Bilbao ' +
            'Bizkaia tourism offer.',
          tag: 'destination'
        },
        {
          time: '12:00',
          title: 'B2B meetings — session I',
          text:
            'Pre-scheduled 15-minute appointments between international buyers ' +
            'and local exhibitors.',
          tag: 'meetings',
          feature: true
        },
        {
          time: '14:00',
          title: 'Networking lunch',
          text: 'Basque gastronomy served in an informal networking format.',
          tag: 'social'
        },
        {
          time: '16:00',
          title: 'Guided city experience',
          text:
            'Walking route through the Old Town, the riverside and the ' +
            'Guggenheim Museum area.',
          tag: 'destination'
        },
        {
          time: '20:00',
          title: 'Welcome dinner',
          text: 'Hosted by the Bilbao Bizkaia tourism authorities.',
          venue: '[Insert venue]',
          tag: 'social'
        }
      ]
    },
    {
      id: 'day-2',
      label: 'Day 2',
      date: 'Tuesday 9 June',
      theme: 'Business & the coast',
      slots: [
        {
          time: '09:30',
          title: 'B2B meetings — session II',
          text:
            'The main working session of the event, with the full exhibitor ' +
            'directory available.',
          tag: 'meetings',
          feature: true
        },
        {
          time: '12:00',
          title: 'Panel: travelling responsibly in Bizkaia',
          text:
            'Local operators and institutions discuss seasonality, capacity ' +
            'and sustainable growth.',
          tag: 'plenary'
        },
        {
          time: '13:30',
          title: 'Networking lunch',
          tag: 'social'
        },
        {
          time: '15:00',
          title: 'Coast experience — Urdaibai and the fishing villages',
          text:
            'Guided visit to the Biosphere Reserve, Bermeo and the Bizkaia ' +
            'coastline.',
          tag: 'destination',
          feature: true
        },
        {
          time: '20:30',
          title: 'Gastronomy evening',
          text: 'Pintxos route through the city with local producers.',
          tag: 'social'
        }
      ]
    },
    {
      id: 'day-3',
      label: 'Day 3',
      date: 'Wednesday 10 June',
      theme: 'Nature & next steps',
      slots: [
        {
          time: '09:30',
          title: 'B2B meetings — session III',
          text: 'Final round of appointments and follow-up conversations.',
          tag: 'meetings'
        },
        {
          time: '11:30',
          title: 'Workshop: building your Bilbao Bizkaia product',
          text:
            'Practical session on packaging the destination for international ' +
            'markets.',
          tag: 'plenary',
          feature: true
        },
        {
          time: '13:00',
          title: 'Closing lunch and conclusions',
          tag: 'social'
        },
        {
          time: '15:00',
          title: 'Optional post-event tours',
          text:
            'Choose between the wine country, the green interior or the ' +
            'industrial heritage route.',
          tag: 'destination'
        }
      ]
    }
  ]
};
