/* =============================================================================
   EDITORIAL CONTENT
   -----------------------------------------------------------------------------
   Long-form copy for the "Presentation of Bilbao", the destination pillars and
   the "Meet BB's Experts" section. Kept apart from the layout so the text can be
   updated by the communication team without touching markup.
   ========================================================================== */

window.MBB = window.MBB || {};

/* --- Section 2 intro ----------------------------------------------------- */
window.MBB.eventIntro = {
  eyebrow: 'The event',
  title: 'Match Bilbao Bizkaia 2026',
  lead:
    'Match Bilbao Bizkaia is the professional meeting point where the ' +
    'destination presents itself to the international travel trade. Over four ' +
    'days, buyers, tour operators and media meet the companies that design, ' +
    'host and deliver the Bilbao Bizkaia experience — in person, on the ground ' +
    'and with time to talk properly.',
  highlights: [
    {
      title: 'Structured B2B meetings',
      text:
        'A pre-scheduled agenda of one-to-one appointments, matched to your ' +
        'markets and interests before you arrive.'
    },
    {
      title: 'The destination first hand',
      text:
        'Guided experiences through the city, the coast and the natural ' +
        'landscapes that define Bizkaia.'
    },
    {
      title: 'A trusted local network',
      text:
        'Hotels, DMCs, agencies, experience providers and institutions, all ' +
        'under one accreditation.'
    }
  ]
};

/* --- Presentation of Bilbao ---------------------------------------------- */
window.MBB.presentation = {
  eyebrow: 'The destination',
  title: 'Presentation of Bilbao',
  paragraphs: [
    'Bilbao is a city that reinvented itself, and did so without losing its ' +
    'character. In one generation it turned an industrial estuary into an ' +
    'open, walkable capital of contemporary architecture, museums and design — ' +
    'a transformation now studied worldwide and still visible on every ' +
    'riverbank.',

    'Around it, Bizkaia offers a rare concentration of experiences within a ' +
    'short drive: a dramatic coastline of fishing villages, cliffs and surf ' +
    'beaches; the Urdaibai Biosphere Reserve; green valleys, farmhouses and ' +
    'txakoli vineyards; and a gastronomic culture of pintxo bars, markets and ' +
    'Michelin-starred kitchens that has become part of the destination\'s ' +
    'identity.',

    'For the professional visitor, this compact geography is the real ' +
    'advantage. Bilbao combines an international airport, a modern convention ' +
    'centre, an efficient public transport network and a hospitality sector ' +
    'used to hosting international audiences — with the sea, the mountains and ' +
    'the old town all within reach of the same working day.',

    'Above all, Bilbao Bizkaia is a welcoming place to do business. Match ' +
    'Bilbao Bizkaia exists to open that network to you directly, and to make ' +
    'the destination easy to programme, easy to sell and easy to recommend.'
  ],
  // Photography for the editorial mosaic. Files that are not there yet fall
  // back to a labelled placeholder tile, so the layout never breaks.
  // Source: W:\08 Bilbao Turismo\Promocion Desarrollo Productos\
  //         Promo Exterior y Mkt\3 SOPORTES PROMOCION\BANCO IMAGENES
  media: [
    { file: 'assets/img/photos/gaztelugatxe.jpg', caption: '[Insert Gaztelugatxe photo]' },
    { file: 'assets/img/photos/bilbao-2.jpg', caption: '[Insert second photo]' },
    { file: 'assets/img/photos/bilbao-3.jpg', caption: '[Insert third photo]' }
  ]
};

/* --- Meet BB's Experts --------------------------------------------------- */
window.MBB.experts = {
  eyebrow: 'Networking',
  title: "Meet BB's Experts",
  lead:
    'Behind every itinerary there is someone local who makes it work. Meet ' +
    "BB's Experts is the meeting space of Match Bilbao Bizkaia: it connects " +
    'international professionals with the hotels, DMCs, agencies, experience ' +
    'providers and institutions of the destination.',
  body:
    'Create your profile, browse the exhibitor directory, request the ' +
    'appointments that matter to you and manage your confirmed meetings from a ' +
    'single agenda — before, during and after the event.',
  steps: [
    {
      n: '01',
      title: 'Create your profile',
      text: 'Register on the platform and tell us about your company and markets.'
    },
    {
      n: '02',
      title: 'Set your availability',
      text: 'Select the time slots when you are open to meet during the event.'
    },
    {
      n: '03',
      title: 'Request meetings',
      text: 'Explore the exhibitor directory and request your preferred appointments.'
    },
    {
      n: '04',
      title: 'Meet and follow up',
      text: 'Confirm your agenda, meet in Bilbao and keep the contacts afterwards.'
    }
  ],
  loginPanel: {
    title: 'Already registered?',
    text:
      'Access your profile, your availability and your confirmed meeting ' +
      'agenda on the Match Bilbao Bizkaia platform.',
    help: 'Need help signing in? Write to help@matchbilbaobizkaia.eus'
  },
  directory: {
    title: 'Exhibitors',
    text:
      'The professionals of the Bilbao Bizkaia destination taking part in the ' +
      'event. Filter by category or search by name.'
  }
};
