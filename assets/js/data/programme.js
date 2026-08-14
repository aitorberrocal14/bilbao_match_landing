/* =============================================================================
   EVENT PROGRAMME
   -----------------------------------------------------------------------------
   6 – 10 October 2026. Participants arrive on Tuesday 6 and leave on Saturday
   10; there is no programme on the last day, so the agenda covers four days:
   Tuesday 6 to Friday 9.

   [Insert programme details] — times and titles below are a working proposal so
   the layout can be reviewed. Add, remove or reorder days and slots freely: the
   timeline renders whatever it finds here.

   Slot fields:
     time    — displayed on the timeline rail
     title   — slot heading
     text    — one short supporting sentence (optional)
     venue   — location line (optional)
     feature — true to give the slot a highlighted card
   ========================================================================== */

window.MBB = window.MBB || {};

window.MBB.programme = {
  note:
    'Participants arrive on Tuesday 6 October and depart on Saturday 10. All ' +
    'times are shown in CET (Central European Time). The final programme will ' +
    'be confirmed to registered participants by email.',
  days: [
    {
      id: 'day-1',
      label: 'Day 1',
      date: 'Tuesday 6 October',
      theme: 'Arrival & welcome',
      slots: [
        {
          time: '15:00',
          title: 'Arrivals and accreditation',
          text: 'Collect your badge and meeting schedule at the main desk.',
          venue: '[Insert venue]',
          tag: 'social'
        },
        {
          time: '18:00',
          title: 'Official opening — Bilbao Bizkaia 2026',
          text:
            'Institutional welcome and presentation of the destination strategy ' +
            'for the coming season.',
          venue: '[Insert venue]',
          tag: 'plenary',
          feature: true
        },
        {
          time: '20:30',
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
      date: 'Wednesday 7 October',
      theme: 'Business & the city',
      slots: [
        {
          time: '09:00',
          title: 'Destination briefing',
          text:
            'A concise overview of the Bilbao Bizkaia tourism offer, market by ' +
            'market.',
          tag: 'destination'
        },
        {
          time: '10:00',
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
        }
      ]
    },
    {
      id: 'day-3',
      label: 'Day 3',
      date: 'Thursday 8 October',
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
          title: 'Coast experience — Urdaibai and Gaztelugatxe',
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
      id: 'day-4',
      label: 'Day 4',
      date: 'Friday 9 October',
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
