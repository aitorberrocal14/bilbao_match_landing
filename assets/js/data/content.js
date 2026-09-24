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
    'destination presents itself to the international Travel Trade. Over four ' +
    'days, carefully selected international tour operators and travel agencies ' +
    'meet the basque companies that design, host and deliver the Bilbao ' +
    'Bizkaia experience — in person, on the ground and with time to interact ' +
    '& experience the destination.',
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
  title: 'Bilbao Bizkaia',
  // LO QUE VA ENTRE **DOS ASTERISCOS** SALE EN NEGRITA.
  //
  // No es Markdown ni nada parecido: es lo único que se entiende aquí, y a
  // propósito. Estos textos se editan desde el panel, y un campo que aceptara
  // HTML sería un campo por el que entra cualquier cosa. Todo lo que se
  // escriba se escapa antes de dibujarse; de ahí solo se salvan los pares de
  // asteriscos. Un asterisco suelto no hace nada y se ve tal cual.
  //
  // Los párrafos van justificados —los dos bordes rectos— por la clase
  // `text-justify`, que se la pone el componente.
  paragraphs: [
    'Bilbao is a city that reinvented itself, and did so without losing its ' +
    'character. In one generation it turned an **industrial estuary** into an ' +
    'open, walkable capital of contemporary **architecture, museums and ' +
    'design** — a **transformation** now studied worldwide and still visible ' +
    'on every riverbank.',

    'Around it, Bizkaia offers a rare concentration of experiences within a ' +
    'short drive: a **dramatic coastline of fishing villages, cliffs and surf ' +
    'beaches**; the **Urdaibai Biosphere Reserve; green valleys, farmhouses ' +
    'and txakoli vineyards**; and a **gastronomic culture of pintxo bars, ' +
    'markets and Michelin-starred kitchens** that has become part of the ' +
    'destination\'s identity.',

    'For the professional visitor, this compact geography is the real ' +
    'advantage. Bilbao combines an **international airport, a modern ' +
    'convention centre, an efficient public transport network** and a ' +
    'hospitality sector used to hosting international audiences — with the ' +
    'sea, the mountains and the old town all within reach of the same working ' +
    'day.',

    'Above all, Bilbao Bizkaia is a **welcoming place to do business**. Match ' +
    'Bilbao Bizkaia exists to open that network to you directly, and to make ' +
    'the destination easy to programme, easy to sell and easy to recommend.'
  ],
  // Two photographs only, as agreed in review. Drop the files in
  // assets/img/photos/ with these names and they appear; if one is missing a
  // labelled placeholder takes its place so the layout never breaks.
  media: [
    { file: 'assets/img/photos/gaztelugatxe.jpg', caption: 'San Juan de Gaztelugatxe' },
    { file: 'assets/img/photos/bilbao-casco-viejo.jpg', caption: "Panoramic view of Bilbao's Old Town" }
  ]
};

/* --- Meet BB's Experts --------------------------------------------------- */
window.MBB.experts = {
  eyebrow: 'Networking',
  title: "Meet BB's Experts",
  // La entrada de la sección, y lo único que hay entre el titular y el
  // directorio: dice de quién es la lista y qué se puede hacer con ella.
  //
  // El directorio tenía antes su propio titular, "Exhibitors", justo debajo de
  // "Meet BB's Experts", con un texto propio debajo. Se quitaron los dos —dos
  // titulares seguidos del mismo tamaño para una sola cosa— y lo que queda es
  // esta línea.
  lead:
    'Behind every itinerary there is someone local who makes it work. Search ' +
    'Bilbao Bizkaia\'s experts by category or by name.',
  // El titular de los cuatro pasos y su párrafo. Cierran la portada.
  howTitle: 'How the matchmaking works',
  body:
    'Create your profile, browse the exhibitor directory, request the ' +
    'appointments that matter to you and manage your confirmed meetings from ' +
    'a single agenda.',
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
  // La mitad izquierda de la banda roja: para quien todavía no está dentro.
  registerPanel: {
    title: 'Not registered yet?',
    // Más corto que antes, y dice lo mismo. La frase empezaba por "Create your
    // profile on the Match Bilbao Bizkaia platform", que es literalmente lo
    // que pone el botón de debajo y el nombre que hay en el titular de la
    // página: tres líneas para llegar a lo único que aporta, que es QUÉ te van
    // a preguntar. Eso es lo que queda.
    text:
      'Tell us about your company, your markets and who you would like to meet.'
  },

  // Y la derecha, para quien ya lo está.
  loginPanel: {
    title: 'Already registered?',
    text:
      'Access your profile, your availability and your confirmed meeting ' +
      'agenda on the Match Bilbao Bizkaia platform.',
    help: 'Need help signing in? Write to welcome@matchbilbaobizkaia.eus'
  },
  // El directorio ya no lleva titular ni texto propios: los dice la sección,
  // arriba. Se queda el bloque por si algún día vuelve a hacer falta, y para
  // que el panel no se quede con un campo apuntando a la nada.
  directory: {
    title: '',
    text: ''
  }
};
