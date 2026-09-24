/**
 * COMPRUEBA LA WEB DE VERDAD, EN UN NAVEGADOR
 * -----------------------------------------------------------------------------
 * Abre index.html en Chromium, la mira en ancho de ordenador y en ancho de
 * móvil, y comprueba lo que de verdad tiene que seguir funcionando. No lee el
 * código: lee la página ya dibujada, que es lo que ve el visitante.
 *
 *   node tools/verify/site.js
 *
 * Sale con código distinto de cero si algo falla, así que sirve para frenar un
 * cambio antes de subirlo.
 *
 * Necesita Playwright. Si no está instalado, lo dice y no finge que ha pasado.
 *
 * Por qué mide en vez de mirar
 * ----------------------------
 * Una captura de pantalla dice si algo se ve raro, pero no si se puede pulsar.
 * Aquí ha habido ya dos problemas que una captura habría dado por buenos: un
 * menú que se veía entero pero tenía tres de sus cuatro opciones tapadas por un
 * bloque en movimiento, y unas pestañas de día que en el móvil se quedaban dos
 * en rojo porque el ratón no existe. Por eso lo que se comprueba aquí es si el
 * navegador deja pulsar, cuánto mide y qué hay encima.
 */

const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.error(
    'Falta Playwright. Instálalo con:\n' +
    '  npm install -D playwright\n' +
    '(en este repositorio no hay package.json: las herramientas son de ' +
    'desarrollo y el servidor no ejecuta Node.)'
  );
  process.exit(2);
}

const ROOT = path.join(__dirname, '..', '..');
const PAGINA = 'file://' + path.join(ROOT, 'index.html');

// ADELANTAR EL RELOJ DEL NAVEGADOR.
//
// Media web cambia sola el día que abre la plataforma: el Login deja de llevar
// al cartel de aviso y lleva a Meetmaps, el propio cartel se aparta, y los dos
// botones de la cabecera se cambian los papeles. Eso hay que poder verlo ANTES
// de ese día, porque el día de después ya no hay margen para arreglarlo.
//
// Se sustituye el reloj del navegador por uno adelantado, y la página se dibuja
// creyendo que es esa fecha. No se toca ningún dato ni ningún archivo: lo que
// se mira es exactamente el mismo código que estará publicado.
const RELOJ = (iso) => {
  const real = Date;
  const salto = new real(iso).getTime() - real.now();
  class F extends real {
    constructor(...a) { if (!a.length) super(real.now() + salto); else super(...a); }
    static now() { return real.now() + salto; }
  }
  window.Date = F;
};

// El rojo de los botones, --red-btn, tal y como lo devuelve el navegador.
// Junto a él vivía SIN_FONDO, para distinguir el botón macizo del enlace
// cuando la cabecera tenía dos puertas. Ahora tiene una y siempre es maciza.
const ROJO = 'rgb(201, 32, 44)';

let fallos = 0;
function check(etiqueta, ok, detalle) {
  if (!ok) fallos++;
  const linea = etiqueta.padEnd(56) + (ok ? 'OK' : 'FALLA');
  console.log(detalle ? linea + '  (' + detalle + ')' : linea);
}

(async () => {
  const navegador = await chromium.launch();

  for (const [nombre, ancho] of [['ordenador', 1280], ['móvil', 390]]) {
    console.log('\n--- ' + nombre + ' (' + ancho + 'px) ---');

    const pagina = await navegador.newPage({ viewport: { width: ancho, height: 900 } });

    // Un error de JavaScript deja media página sin dibujar, así que se recoge.
    // Los de red no cuentan: las miniaturas de YouTube no cargan sin internet.
    const errores = [];
    pagina.on('pageerror', (e) => errores.push(e.message));
    pagina.on('console', (m) => {
      if (m.type() === 'error' && !/ERR_|CERT|Failed to load resource/.test(m.text())) {
        errores.push(m.text());
      }
    });

    await pagina.goto(PAGINA);
    await pagina.waitForTimeout(1200);

    /* --- Que la página esté entera ---------------------------------------- */
    const base = await pagina.evaluate(() => ({
      secciones: document.querySelectorAll('section').length,
      cabecera: !!document.querySelector('header'),
      pie: !!document.querySelector('.footer'),
      desborde: document.documentElement.scrollWidth > window.innerWidth + 1,
      // Sólo los que se ven. El mismo texto vive también en atributos, como
      // etiqueta de repuesto por si una imagen no carga, y ahí no molesta.
      huecos: [...document.querySelectorAll('*')]
        .filter(function (e) {
          if (e.children.length || !/\[Insert /.test(e.textContent)) return false;
          var c = e.getBoundingClientRect();
          return c.width > 0 && c.height > 0;
        })
        .map(function (e) { return e.textContent.trim(); })
    }));

    check('la página se monta entera', base.secciones >= 8 && base.cabecera && base.pie,
      base.secciones + ' secciones');
    check('no se sale de ancho', !base.desborde);
    check('sin marcadores [Insert ...] a la vista', base.huecos.length === 0,
      base.huecos.join(', '));

    // LAS NEGRITAS SE ESCRIBEN CON **DOS ASTERISCOS** EN LOS DATOS, y lo que
    // no puede pasar es que se vean. Si alguien escribe uno suelto, o los
    // cierra mal desde el panel, el visitante lee asteriscos en mitad de una
    // frase; y si el convertidor se rompiera, el texto se quedaría sin resaltar
    // y nadie lo notaría hasta mirarlo con calma.
    const negritas = await pagina.evaluate(() => ({
      asteriscos: (document.body.textContent.match(/\*\*/g) || []).length,
      resaltadas: document.querySelectorAll('.present strong').length,
      // Y lo que se resalta es texto, no etiquetas: si algo se colara sin
      // escapar, aquí aparecería un < o un > escrito.
      limpio: !/[<>]/.test(
        [...document.querySelectorAll('.present p')].map((e) => e.textContent).join(''))
    }));

    check('ningún asterisco a la vista', negritas.asteriscos === 0, negritas.asteriscos);
    check('el destino lleva sus negritas', negritas.resaltadas >= 5, negritas.resaltadas);
    check('  y no ha entrado ninguna etiqueta', negritas.limpio);

    /* --- El programa ------------------------------------------------------- */
    // Las pestañas de día sólo existen en la vista "Day by day". Sin este clic
    // se miden ocultas, dan 0 de alto y la comprobación pasa sin mirar nada.
    await pagina.click('.prog__view[data-view="detail"]');
    await pagina.waitForTimeout(200);

    const prog = await pagina.evaluate(() => {
      const pes = [...document.querySelectorAll('.prog__tab')];
      const caja = document.querySelector('.prog__tabs');
      return {
        dias: pes.length,
        seleccionados: pes.filter((p) => p.getAttribute('aria-selected') === 'true').length,
        alto: caja ? Math.round(caja.getBoundingClientRect().height) : 0,
        // En el móvil la fila se desliza en vez de amontonarse en varias líneas.
        seDesliza: caja ? caja.scrollWidth > caja.clientWidth : false,
        vistas: document.querySelectorAll('[data-view]').length
      };
    });

    check('cinco días de programa', prog.dias === 5, prog.dias);
    check('un solo día seleccionado', prog.seleccionados === 1, prog.seleccionados);
    check('las dos vistas existen', prog.vistas >= 2, prog.vistas);
    if (ancho < 700) {
      // Amontonadas en tres filas ocupaban más de 120px de pantalla.
      check('las pestañas caben en una fila', prog.alto < 90, prog.alto + 'px de alto');
    }

    /* --- La vista de conjunto: una tarjeta por día --------------------------- */
    // El programa es lo que la gente viene a mirar, así que tiene que caber de
    // un vistazo. En fila de ancho completo ocupaba pantalla y media y había
    // que bajar solo para saber cuántos días eran.
    // Arriba se ha pulsado "Day by day" para contar las pestañas, así que la
    // vista de conjunto está escondida y mediría cero. Se vuelve a ella.
    await pagina.click('.prog__view[data-view="overview"]');
    await pagina.waitForTimeout(200);

    const conj = await pagina.evaluate(() => {
      const sec = document.querySelector('#programme');
      const tarjetas = [...document.querySelectorAll('.ov-day')]
        .map((c) => c.getBoundingClientRect());
      const caja = document.querySelector('.prog__overview');
      return {
        n: tarjetas.length,
        // Cuántas alturas distintas ocupan: una sola = todas en la misma fila.
        filas: new Set(tarjetas.map((r) => Math.round(r.top))).size,
        pantallas: +(sec.getBoundingClientRect().height / window.innerHeight).toFixed(2),
        // En el móvil la fila se desliza; ahí está la prueba de que hay más
        // días de los que se ven.
        seDesliza: caja ? caja.scrollWidth > caja.clientWidth + 1 : false,
        cabenEnAncho: tarjetas.every((r) => r.width > 120),
        pagina: document.documentElement.scrollWidth <= document.documentElement.clientWidth
      };
    });

    /* --- El esquema de títulos ---------------------------------------------- */
    // Un lector de pantalla recorre la página saltando de título en título, y
    // para eso los niveles tienen que ir seguidos. Saltar de h2 a h4 deja un
    // hueco en ese esquema: el programa entero colgaba de la nada.
    //
    // Esto además es una afirmación de la declaración de accesibilidad, que es
    // un documento formal. Comprobarla vale más que escribirla.
    const titulos = await pagina.evaluate(() => {
      const h = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
      const saltos = [];
      for (let i = 1; i < h.length; i++) {
        if (+h[i].tagName[1] - +h[i - 1].tagName[1] > 1) {
          saltos.push(h[i - 1].tagName + '→' + h[i].tagName +
            ' (' + h[i].textContent.trim().slice(0, 30) + ')');
        }
      }
      return { saltos: saltos, h1: document.querySelectorAll('h1').length };
    });

    // Cada entrada del menú tiene que encontrar su sección EN ESTA página. Un
    // ancla que no la encuentra no avisa de nada: cambia la dirección del
    // navegador y la pantalla se queda exactamente igual, y quien lo pulsa
    // piensa que la web está rota, no que el enlace lo está.
    const menu = await pagina.evaluate(() =>
      window.MBB.site.nav
        .filter((n) => /^#/.test(n.href))
        .filter((n) => !document.getElementById(n.href.slice(1)))
        .map((n) => n.label + ' → ' + n.href));

    check('cada entrada del menú encuentra su sección', menu.length === 0,
      menu.join(' · ') || 'todas');

    check('un solo h1 en la página', titulos.h1 === 1, titulos.h1);
    check('los títulos van por orden, sin saltos de nivel',
      titulos.saltos.length === 0, titulos.saltos.join(' · ') || 'sin saltos');

    check('los cinco días, cada uno en su tarjeta', conj.n === 5, conj.n);

    // El día que se parte en dos dice adónde va cada grupo. El nombre del
    // grupo sale de `programme.groups`, que es lo que también rotula el
    // selector de la vista detallada: si alguien escribe "Group 1" a mano en
    // el texto de la ruta, un cambio de nombre deja los dos sitios diciendo
    // cosas distintas y nadie lo ve hasta que lo lee un participante.
    const parte = await pagina.evaluate(() => {
      const dia = window.MBB.programme.days.filter((d) => d.routes && d.routes.length)[0];
      if (!dia) return null;
      const i = window.MBB.programme.days.indexOf(dia);
      const tarjeta = document.querySelectorAll('.ov-day')[i];
      const lis = [...tarjeta.querySelectorAll('.ov-day__routes li')];
      return {
        rutas: dia.routes.length,
        pintadas: lis.length,
        // Cada línea empieza por el nombre del grupo y sigue con su texto.
        cuadran: dia.routes.every((r, n) => {
          const g = window.MBB.programme.groups.filter((x) => x.id === r.group)[0];
          const t = (lis[n] || {}).textContent || '';
          return g && t.indexOf(g.label) === 0 && t.indexOf(r.text) > -1;
        }),
        parteEnDos: !!dia.split && !!tarjeta.querySelector('.ov-day__split')
      };
    });

    if (parte) {
      check('el día que se parte dice adónde va cada grupo',
        parte.pintadas === parte.rutas && parte.cuadran,
        parte.pintadas + ' de ' + parte.rutas);
      check('  y avisa de que son dos itinerarios', parte.parteEnDos);
    }

    // Un momento marcado con `card: false` no sale en la tarjeta, Y NO LO
    // SUSTITUYE OTRO. Si lo sustituyera, quitar algo de la tarjeta sería
    // imposible —se cambiaría una línea por otra— y subirían al resumen del
    // día cosas que no lo resumen, como la hora de recoger a los guías.
    const tapado = await pagina.evaluate(() => {
      const p = window.MBB.programme;
      const i = p.days.findIndex((d) => d.slots.some((s) => s.card === false));
      if (i < 0) return null;
      const fuera = p.days[i].slots.filter((s) => s.card === false);
      const t = document.querySelectorAll('.ov-day')[i].textContent;
      return {
        titulos: fuera.map((s) => s.title),
        asoma: fuera.filter((s) => t.indexOf(s.title) > -1).map((s) => s.title),
        // Y sigue en el programa hora a hora: se quitó de la tarjeta, no del día.
        enElDia: fuera.every((s) =>
          [...document.querySelectorAll('.tl-item h3')].some((h) => h.textContent === s.title))
      };
    });

    if (tapado) {
      check('lo apartado de la tarjeta no asoma en ella',
        tapado.asoma.length === 0, tapado.asoma.join(' · ') || tapado.titulos.join(' · '));
      check('  pero sigue en el programa hora a hora', tapado.enElDia);
    }

    // La nota al pie del programa está vacía, así que no debe dibujarse un
    // párrafo vacío: media línea de aire de la nada, que es peor que el texto.
    const nota = await pagina.evaluate(() => ({
      dato: (window.MBB.programme.note || '').length,
      pintada: document.querySelectorAll('.prog__note').length
    }));
    check('sin nota al pie no se dibuja un hueco',
      nota.dato ? nota.pintada === 1 : nota.pintada === 0,
      nota.dato + ' caracteres · ' + nota.pintada + ' párrafo(s)');
    check('el programa cabe en poco más de una pantalla',
      conj.pantallas <= 1.25, conj.pantallas + ' pantallas');
    check('ninguna tarjeta queda estrujada', conj.cabenEnAncho);
    check('la página no se sale por el programa', conj.pagina);
    if (ancho < 700) {
      // Cinco tarjetas apiladas ocupaban más de dos pantallas: más que el
      // diseño que vinimos a condensar. Van en una fila que se desliza.
      check('en el móvil los días se deslizan', conj.filas === 1 && conj.seDesliza,
        conj.filas + ' fila(s), se desliza: ' + conj.seDesliza);
    } else if (ancho >= 1200) {
      // Solo se exige una sola fila donde de verdad caben cinco. Entre los 700
      // y los 1200 se reparten en dos filas, que es lo razonable y no un fallo.
      check('en pantalla ancha los cinco días caben a la vez', conj.filas === 1,
        conj.filas + ' fila(s)');
    }

    /* --- "Add to calendar" -------------------------------------------------- */
    await (await pagina.$('details.cal')).scrollIntoViewIfNeeded();
    await pagina.click('details.cal > summary');
    await pagina.waitForTimeout(120);   // a propósito: aún con la animación entrando

    const cal = await pagina.evaluate(() => {
      const opciones = [...document.querySelectorAll('.cal__menu a, .cal__menu button')];
      return {
        destinos: opciones.length,
        // Lo que importa no es que se vean, sino que el navegador deje pulsarlos.
        pulsables: opciones.filter((e) => {
          const c = e.getBoundingClientRect();
          const encima = document.elementFromPoint(c.x + c.width / 2, c.y + c.height / 2);
          return e === encima || e.contains(encima);
        }).length,
        descarga: document.querySelectorAll('.cal__menu [data-ics-event]').length,
        // El programa entero se descarga desde este mismo menú, debajo de su
        // propio encabezado. Tuvo un botón aparte al lado del desplegable
        // durante media tarde: dos botones con el mismo icono, casi del mismo
        // tamaño, y había que leerlos los dos para saber cuál era cuál.
        programa: document.querySelectorAll('.cal__menu [data-ics="all"]').length,
        grupos: [...document.querySelectorAll('.cal__menu .cal__group')]
          .map((e) => e.textContent.trim()),
        fuera: opciones.filter((e) => e.target === '_blank' && /noopener/.test(e.rel)).length,
        dentroDePantalla: opciones.every((e) => {
          const c = e.getBoundingClientRect();
          return c.left >= -1 && c.right <= window.innerWidth + 1;
        }),
        // Y ENTERO POR ABAJO, que es por donde se salía. El botón vive en la
        // barra del programa, dentro de una tarjeta alta: si se pulsaba con la
        // barra a media pantalla, el menú se desplegaba por debajo del borde y
        // parecía que no había pasado nada. Ahora la página se sube lo justo.
        seVeEntero: (() => {
          const c = document.querySelector('.cal__menu').getBoundingClientRect();
          return c.top >= -1 && c.bottom <= window.innerHeight + 1;
        })(),
        // Las fechas de los tres enlaces salen de site.js, no están escritas
        // a mano: si alguien las cambia en el panel, tienen que seguirlas.
        enLaBarra: document.querySelectorAll('.prog__bar .btn, .prog__bar .cal').length -
          document.querySelectorAll('.prog__bar .cal .btn').length,
        googleSigueALosDatos: (() => {
          const a = document.querySelector('.cal__menu a');
          const c = window.MBB.site.event.calendar;
          const utc = (iso) =>
            new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
          return a.href.indexOf(utc(c.start) + '/' + utc(c.end)) > -1;
        })()
      };
    });

    check('el calendario ofrece cinco opciones', cal.destinos === 5, cal.destinos);
    check('las cinco se pueden pulsar', cal.pulsables === 5,
      cal.pulsables + ' de ' + cal.destinos);
    check('tres abren fuera y dos descargan',
      cal.fuera === 3 && cal.descarga === 1 && cal.programa === 1,
      cal.fuera + ' fuera, ' + (cal.descarga + cal.programa) + ' descargan');
    // Sin los encabezados, "Apple Calendar" y "el programa entero" parecen dos
    // opciones de lo mismo, y no lo son: una guarda las fechas y la otra las
    // cuatro jornadas hora a hora.
    check('  y dice cuál guarda qué', cal.grupos.length === 2, cal.grupos.join(' · '));
    // Un solo botón de calendario en la barra del programa, no dos.
    check('  desde un solo botón', cal.enLaBarra === 1, cal.enLaBarra);
    check('las fechas salen de los datos, no a mano', cal.googleSigueALosDatos);
    check('el menú no se sale de la pantalla', cal.dentroDePantalla);
    check('  ni por debajo del borde', cal.seVeEntero);

    // El archivo se escribe en el momento: se comprueba que llega y qué dice.
    const descarga = pagina.waitForEvent('download', { timeout: 5000 });
    await pagina.click('.cal__menu [data-ics-event]');
    let ics = null;
    try {
      const d = await descarga;
      const ruta = await d.path();
      ics = require('fs').readFileSync(ruta, 'utf8');
      check('el .ics se descarga con su nombre',
        d.suggestedFilename() === 'match-bilbao-bizkaia-2026.ics', d.suggestedFilename());
    } catch (e) {
      check('el .ics se descarga con su nombre', false, e.message);
    }

    if (ics) {
      const c = await pagina.evaluate(() => window.MBB.site.event.calendar);
      const utc = (iso) =>
        new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      check('el .ics lleva las horas de los datos',
        ics.indexOf('DTSTART:' + utc(c.start)) > -1 && ics.indexOf('DTEND:' + utc(c.end)) > -1);
      check('el .ics termina las líneas en CRLF', /END:VCALENDAR\r\n$/.test(ics));
      check('el .ics protege las comas del lugar',
        ics.indexOf('LOCATION:' + c.location.replace(/,/g, '\\,')) > -1);
    }

    // Y el programa entero, desde ese mismo menú. Tenía botón propio al lado
    // del desplegable y se juntó aquí dentro; lo que descarga no ha cambiado,
    // así que se comprueba que sigue llegando y que trae las sesiones, no una
    // sola cita con las fechas —que es el otro archivo, el de arriba—.
    await pagina.click('details.cal > summary');
    await pagina.waitForTimeout(150);
    const descargaProg = pagina.waitForEvent('download', { timeout: 5000 });
    await pagina.click('.cal__menu [data-ics="all"]');
    try {
      const d = await descargaProg;
      const texto = require('fs').readFileSync(await d.path(), 'utf8');
      const citas = (texto.match(/BEGIN:VEVENT/g) || []).length;
      // Y con OTRO nombre que el archivo de las fechas. Con el mismo, el
      // segundo llega como «…(1).ics» y en la carpeta de descargas ya no hay
      // forma de saber cuál es cuál.
      check('el programa entero se descarga desde ese mismo menú',
        citas > 5 && d.suggestedFilename() === 'match-bilbao-bizkaia-2026-programme.ics',
        d.suggestedFilename() + ' · ' + citas + ' citas');
    } catch (e) {
      check('el programa entero se descarga desde ese mismo menú', false, e.message);
    }
    check('  y al descargar, el menú se cierra',
      !(await pagina.evaluate(() => !!document.querySelector('details.cal[open]'))));

    await pagina.click('details.cal > summary');
    await pagina.keyboard.press('Escape');
    check('se cierra con Escape',
      !(await pagina.evaluate(() => !!document.querySelector('details.cal[open]'))));

    /* --- El boletín --------------------------------------------------------- */
    const nl = await pagina.evaluate(() => {
      const opciones = [...document.querySelectorAll('.nl-opt')];
      return {
        publicos: opciones.length,
        distintos: new Set(opciones.map((a) => a.getAttribute('href'))).size,
        fuera: opciones.filter((a) => a.target === '_blank' && /noopener/.test(a.rel)).length,
        // Esta web no recoge ningún dato personal: no debe haber dónde escribir.
        campos: document.querySelectorAll('.newsletter input, .newsletter form').length
      };
    });

    check('el boletín ofrece dos públicos', nl.publicos === 2, nl.publicos);
    check('cada uno va a un formulario distinto', nl.distintos === 2, nl.distintos);
    check('los dos abren fuera', nl.fuera === 2, nl.fuera);
    check('no se pide ningún dato en la web', nl.campos === 0, nl.campos + ' campos');

    /* --- Login y vídeos ----------------------------------------------------- */
    const resto = await pagina.evaluate(() => ({
      login: document.querySelectorAll('a[href*="meetmaps.com"]').length,
      // Un botón de Login sin dirección no debe dibujarse.
      loginVacio: [...document.querySelectorAll('a')].filter(
        (a) => /^login$/i.test(a.textContent.trim()) && (!a.href || a.getAttribute('href') === '#')
      ).length,
      videos: document.querySelectorAll('[data-yt]').length,
      videosSinId: [...document.querySelectorAll('[data-yt]')].filter((v) => !v.dataset.yt).length
    }));

    /* --- La puerta de la plataforma ---------------------------------------- */
    // Mientras no abra, el Login no lleva al formulario de Meetmaps sino a la
    // página que explica cuándo. Y la fecha se dice ANTES de pulsar.
    const puerta = await pagina.evaluate(() => {
      const site = window.MBB.site;
      const abierta = window.MBB.platformOpen(site);
      const logins = [...document.querySelectorAll('a[data-login]')];
      return {
        abierta: abierta,
        logins: logins.length,
        todosALaEspera: logins.every((a) => a.getAttribute('href') === site.login.waiting),
        todosAMeetmaps: logins.every((a) => /^https?:/.test(a.getAttribute('href'))),
        aviso: (document.querySelector('.take-part__note') || {}).textContent || '',
        dia: window.MBB.platformOpensOn(site),
        // Y que el día que abra, los botones vuelvan solos a la plataforma.
        alAbrir: (() => {
          const copia = JSON.parse(JSON.stringify(site));
          copia.login.opensAt = '2020-01-01T00:00:00+01:00';
          return window.MBB.loginHref(copia, '');
        })(),
        alta: (document.querySelector('.take-part__half .btn') || {}).getAttribute
          ? document.querySelector('.take-part__half .btn').getAttribute('href') : ''
      };
    });

    if (puerta.abierta) {
      check('la plataforma está abierta: el Login va a Meetmaps', puerta.todosAMeetmaps);
    } else {
      check('antes de abrir, el Login va a la página de aviso', puerta.todosALaEspera,
        puerta.logins + ' botones');
      // AQUÍ SE EXIGÍA QUE LA TARJETA DIJERA LA FECHA ANTES DE PULSAR.
      //
      // Llevaba una línea, "Opens on 29 September", para que nadie pulsara
      // Login sin saber que todavía no abre. La organización pidió quitarla, y
      // con ella se va esta comprobación: no tiene sentido exigir un texto que
      // se ha decidido no poner.
      //
      // Lo que sí se sigue exigiendo —y es lo que ahora sostiene la promesa—
      // es la línea de arriba: que ese Login lleve al cartel que lo explica.
      // Mientras eso se cumpla, la información se lee un clic más tarde en vez
      // de no leerse. El día que alguien apunte el Login a otro sitio antes de
      // tiempo, esa comprobación falla.
      check('  y ese aviso sigue diciendo la fecha', puerta.dia && puerta.dia.length > 0,
        puerta.dia);
    }
    check('al llegar la fecha vuelve solo a la plataforma',
      /^https?:/.test(puerta.alAbrir || ''), puerta.alAbrir);
    check('hay un botón para darse de alta',
      /meetmaps\.com/.test(puerta.alta) && /registration/.test(puerta.alta), puerta.alta);

    /* --- La puerta de la barra de arriba ------------------------------------ */
    // UN SOLO BOTÓN, Y ES EL LOGIN. En la cabecera hubo dos —Login y alta— que
    // se cambiaban los papeles el día que abría la plataforma, y con dos hacía
    // falta esconder uno en el móvil para que cupieran. Ahora es uno, es el
    // mismo a cualquier ancho y no cambia nunca: lo único que cambia, y solo,
    // es a dónde lleva.
    //
    // Lo que se comprueba es que esté, que sea el botón rojo, que esté una
    // sola vez —una copia olvidada en el menú desplegable serían dos— y que el
    // alta ya no ande por ahí arriba. El alta no desaparece de la web: baja a
    // la tarjeta de la portada, y eso se mide unas líneas más abajo.
    const barra = await pagina.evaluate(() => {
      const visible = (e) => !!e && e.getBoundingClientRect().width > 0;
      const login = document.querySelector('.header__actions a[data-login]');
      return {
        login: visible(login),
        texto: login ? login.textContent.trim() : '',
        rojo: login ? getComputedStyle(login).backgroundColor : '',
        // Ni una segunda copia escondida en el menú.
        cuantos: [...document.querySelectorAll('.header a[data-login]')].filter(visible).length,
        alta: document.querySelectorAll('.header a[data-register]').length,
        dentro: document.documentElement.scrollWidth <= document.documentElement.clientWidth
      };
    });

    check('el Login está en la barra de arriba', barra.login, barra.texto);
    check('  y es el botón rojo',
      /rgba?\(20[0-9], 3[0-9], 4[0-9]/.test(barra.rojo), barra.rojo);
    check('  y está una vez y solo una', barra.cuantos === 1, barra.cuantos);
    check('el alta ya no está en la cabecera', barra.alta === 0,
      barra.alta + ' en la cabecera');
    check('la barra no se sale de ancho', barra.dentro);

    /* --- Dónde está cada cosa ----------------------------------------------- */
    // LAS DOS PUERTAS ESTÁN EN LA PORTADA, una sola vez.
    //
    // Han estado en tres sitios. Al final de "Meet BB's Experts", detrás de un
    // párrafo largo y de los cuatro pasos, donde quien pulsaba la entrada del
    // menú aterrizaba en una pared de texto con los botones fuera de la
    // pantalla. Luego al principio de esa sección, donde llenaban la pantalla
    // y dejaban el directorio —que es a lo que viene mucha gente— por debajo
    // del borde. Y ahora en la portada, cerrando la primera pantalla, que es
    // donde se le pide algo a quien acaba de leer de qué va esto.
    //
    // Se comprueba que esté en la portada y que no haya dos: dos bandas rojas
    // iguales no dan dos oportunidades de entrar, dan la sensación de que la
    // web insiste.
    const orden = await pagina.evaluate(() => {
      const y = (s) => { const e = document.querySelector(s);
        return e ? e.getBoundingClientRect().top + window.scrollY : null; };
      // El directorio, por su contenedor y no por la rejilla: antes de la
      // primera empresa no hay rejilla, solo el aviso de que se irá llenando.
      return {
        bandas: document.querySelectorAll('.take-part').length,
        enPortada: !!document.querySelector('#home .take-part'),
        directorio: y('.directory'),
        pasos: y('.steps'),
        pasosSueltos: document.querySelectorAll('.steps').length,
        // Y el directorio, pegado a la entrada de la sección: sin titular
        // propio en medio, que era otro <h2> del mismo tamaño para lo mismo.
        titularPropio: document.querySelectorAll('.directory h2').length
      };
    });

    check('las dos puertas están en la portada, y una sola vez',
      orden.bandas === 1 && orden.enPortada, orden.bandas + ' banda(s)');
    check('el directorio no repite titular', orden.titularPropio === 0,
      orden.titularPropio + ' titular(es)');
    // "CÓMO FUNCIONA" YA NO ESTÁ EN LA PORTADA.
    //
    // Los cuatro pasos han estado en tres sitios: al final de "Meet BB's
    // Experts", detrás del directorio, donde casi nadie llegaba; luego en su
    // propia banda gris debajo de la portada; y ahora en platform.html, que es
    // donde va a parar quien pulsa Login antes de que abra la plataforma.
    // Allí la pregunta se hace sola: «si todavía no puedo entrar, ¿para qué
    // me doy de alta ahora?». Aquí abajo se comprueba que estén allí.
    //
    // Lo que se mira en la portada es que NO hayan quedado dos copias. Que no
    // esté no es un fallo; que esté dos veces, sí.
    check('"cómo funciona" ya no está en la portada', orden.pasosSueltos === 0,
      orden.pasosSueltos + ' bloque(s) de pasos');

    check('ningún Login sin dirección', resto.loginVacio === 0, resto.loginVacio);
    check('las dos ediciones tienen vídeo',
      resto.videos === 2 && resto.videosSinId === 0,
      resto.videos + ' vídeos, ' + resto.videosSinId + ' sin identificador');

    /* --- Los vídeos, justo debajo de la portada ------------------------------ */
    // Estuvieron colgando de la presentación del destino, como un apartado
    // suyo. Son otra cosa —el evento contado en imágenes— y son lo que hace
    // bajar, así que van en su propia sección pegada a la portada, delante del
    // destino. En escritorio van uno al lado del otro; en el móvil, uno debajo
    // del otro y sin salirse, que es donde se rompía.
    const vid = await pagina.evaluate(() => {
      const sec = document.querySelector('#editions');
      const rejilla = document.querySelector('.videos');
      const secciones = [...document.querySelectorAll('main > section')].map((s) => s.id);
      return {
        dentro: !!(sec && rejilla && sec.contains(rejilla)),
        // Entre la portada y el destino, en ese orden y no en otro. Pegados a
        // la portada: es lo primero que hay al bajar, y es a donde lleva el
        // aviso con la flecha que la cierra.
        orden: secciones.indexOf('home') + 1 === secciones.indexOf('editions') &&
          secciones.indexOf('editions') + 1 === secciones.indexOf('presentation'),
        secciones: secciones.join(' › '),
        columnas: rejilla ? getComputedStyle(rejilla).gridTemplateColumns.split(' ').length : 0,
        // 16:9 con un margen de holgura: lo que no vale es un marco aplastado.
        proporcion: [...document.querySelectorAll('.video__frame')]
          .map((f) => f.getBoundingClientRect())
          .every((r) => r.width > 0 && Math.abs(r.width / r.height - 16 / 9) < 0.1),
        anchos: [...document.querySelectorAll('.video__frame')]
          .map((f) => f.getBoundingClientRect())
          .map((r) => Math.round(r.width) + '×' + Math.round(r.height)),
        cabe: [...document.querySelectorAll('.video__frame')]
          .map((f) => f.getBoundingClientRect())
          .every((r) => r.right <= document.documentElement.clientWidth + 1),
        // Su propio titular de sección, ahora que es una sección.
        h2: sec ? sec.querySelectorAll('h2').length : -1
      };
    });

    check('los vídeos tienen su propia sección', vid.dentro);
    check('  y van entre la portada y el destino', vid.orden, vid.secciones);
    check('un solo titular de sección', vid.h2 === 1, vid.h2 + ' h2');
    check('los vídeos se colocan según la pantalla',
      vid.columnas === (ancho < 900 ? 1 : 2), vid.columnas + ' columna(s)');
    check('los vídeos guardan la proporción y caben',
      vid.proporcion && vid.cabe, vid.anchos.join(' · '));

    /* --- Las fotos del destino: apiladas, a 4:3 y del tamaño justo ----------- */
    // Esto está aquí porque ya se rompió dos veces. La sección del destino no
    // entraba en una pantalla —944px de alto— y las dos veces se arregló
    // cambiando la sección en vez de las fotos: primero recortándolas a 2:1,
    // que deja una panorámica forzada que ya no es la foto sino un trozo; y
    // luego poniéndolas en fila, que rompía la composición de la página.
    //
    // Lo que funcionó fue lo simple: las mismas fotos, una encima de otra como
    // siempre, más pequeñas. Así que aquí se comprueban las tres cosas —que
    // sigan a 4:3, que sigan apiladas y que no vuelvan a crecer—, porque
    // cualquiera de las tres es el atajo que alguien va a coger la próxima vez
    // que algo tenga que caber.
    const fotos = await pagina.evaluate(() => {
      const cajas = [...document.querySelectorAll('.present__media img')]
        .map((i) => i.getBoundingClientRect());
      return {
        // 4:3 con holgura para el redondeo del navegador.
        proporcion: cajas.every((r) => r.width > 0 && Math.abs(r.width / r.height - 4 / 3) < 0.05),
        medidas: cajas.map((r) => Math.round(r.width) + '×' + Math.round(r.height)),
        // Apiladas: la segunda empieza por debajo de la primera, no a su lado.
        apiladas: cajas.length === 2 && cajas[1].top >= cajas[0].bottom - 1,
        ancha: Math.round(Math.max.apply(null, cajas.map((r) => r.width)))
      };
    });
    check('las fotos del destino siguen a 4:3', fotos.proporcion,
      fotos.medidas.join(' · '));
    check('  y siguen una encima de otra', fotos.apiladas);
    // El tope solo rige en escritorio. En el móvil la sección se lee bajando
    // de todas formas, así que allí aprovechan el ancho que haya.
    if (ancho > 900) {
      check('  y no han vuelto a crecer', fotos.ancha <= 335, fotos.ancha + 'px de ancho');
    }

    /* --- Nada roto por el camino -------------------------------------------- */
    check('sin errores de JavaScript', errores.length === 0, errores.join(' | '));

    await pagina.close();
  }

  /* --- El directorio, con empresas dentro ---------------------------------- */
  // El directorio publicado está vacío —las empresas llegan de Meetmaps— así
  // que los filtros no se pueden probar con la página tal cual. Se monta una
  // copia con tres empresas de mentira, una por categoría.
  //
  // Esto existe por un fallo concreto: `.logo-tile` declaraba `display`, y eso
  // anula el atributo `hidden` del navegador. El script ocultaba las tarjetas
  // al filtrar y el CSS las volvía a enseñar, así que pulsar un filtro no hacía
  // nada. Todo se veía perfecto; simplemente no funcionaba. Una captura de
  // pantalla lo habría dado por bueno.
  console.log('\n--- el directorio con empresas ---');

  const fs = require('fs');
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mbb-'));
  const pagina_tmp = path.join(tmp, 'index.html');

  // DOS categorías con empresas y UNA VACÍA a propósito: así se comprueba a la
  // vez que los filtros filtran y que la categoría sin nadie sigue apareciendo.
  // Antes se escondía, y entonces la web decía que el evento tiene dos
  // categorías cuando tiene tres — precisamente cuando el directorio está más
  // vacío, que es cuando más se mira.
  const MUESTRA = [
    ['berrocal', 'Berrocal', 'accommodation'],
    ['hotel-prueba', 'Hotel Prueba', 'accommodation'],
    ['xxx', 'xxx', 'activities']
  ];

  fs.writeFileSync(
    pagina_tmp,
    fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
      // Los recursos se cogen del repositorio, sin copiar nada.
      .replace(/(src|href)="assets\//g, '$1="file://' + path.join(ROOT, 'assets') + '/')
      // Y la lista de empresas se sustituye por la de prueba.
      .replace(
        /<script src="file:\/\/[^"]*data\/exhibitors\.js"><\/script>/,
        '<script src="file://' + path.join(ROOT, 'assets/js/data/exhibitors.js') + '"></script>' +
        '<script>window.MBB.exhibitors = ' + JSON.stringify(
          MUESTRA.map(([id, name, category]) => ({
            id, name, category, logo: '', contactName: 'Nombre', contactRole: 'Cargo',
            email: id + '@ejemplo.test', phone: '', website: '', websiteLabel: '',
            address: '', social: {}, paragraphs: ['Texto de prueba.']
          }))
        ) + ';</script>'
      )
  );

  const dir = await navegador.newPage({ viewport: { width: 1280, height: 1000 } });
  await dir.goto('file://' + pagina_tmp);
  await dir.waitForTimeout(1500);
  await (await dir.$('#exhibitors')).scrollIntoViewIfNeeded();
  await dir.waitForTimeout(400);

  const visibles = () => dir.evaluate(() =>
    [...document.querySelectorAll('.logo-tile')]
      .filter((t) => t.getBoundingClientRect().height > 0).length);

  check('se dibujan las tres empresas', (await visibles()) === 3, await visibles());

  // Las cuatro pestañas están siempre, incluida la de la categoría vacía.
  const pestanas = await dir.evaluate(() =>
    [...document.querySelectorAll('.filter')].map((f) => f.textContent.trim()));
  check('están las cuatro pestañas, también la vacía',
    pestanas.length === 4 && pestanas.indexOf('Basque DMC') > -1, pestanas.join(' · '));

  for (const [etiqueta, esperadas] of [
    ['Accommodation', 2], ['Basque DMC', 0],
    ['Boutique Experience in Bilbao Bizkaia', 1], ['All', 3]
  ]) {
    await dir.evaluate((t) => {
      const f = [...document.querySelectorAll('.filter')].find((b) => b.textContent.trim() === t);
      if (f) f.click();
    }, etiqueta);
    await dir.waitForTimeout(200);
    const n = await visibles();
    // Lo que se mide es cuántas tarjetas OCUPAN SITIO, no cuántas llevan el
    // atributo: el fallo era precisamente que lo llevaban y se veían igual.
    check('filtro "' + etiqueta + '"', n === esperadas, n + ' visibles, se esperaban ' + esperadas);

    // Y si no hay nada, el aviso tiene que decir POR QUÉ: una categoría vacía
    // y una búsqueda sin resultados se arreglan de forma distinta, y un solo
    // texto para las dos deja al visitante pensando que ha hecho algo mal.
    if (esperadas === 0) {
      const aviso = await dir.evaluate(() => {
        const e = document.querySelector('#ex-empty');
        return e && !e.hidden ? e.textContent.trim() : '';
      });
      check('  y explica que esa categoría está vacía',
        /yet/.test(aviso) && aviso.indexOf(etiqueta) > -1 && !/search/.test(aviso), aviso);
    }
  }

  await dir.close();
  fs.rmSync(tmp, { recursive: true, force: true });

  /* --- La cabecera, a cualquier ancho -------------------------------------- */
  // El menú necesita unos 1275px para caber en una fila. Por debajo se iba
  // envolviendo y la cabecera salía partida en dos y en tres filas: el
  // logotipo arriba y el menú desparramado debajo. En un portátil con la
  // ventana a media pantalla pasaba siempre, y se veía roto.
  //
  // La regla es simple y no depende de cuántas entradas tenga el menú: o el
  // menú cabe en UNA fila, o está plegado tras su botón. Nunca dos filas. Si
  // algún día se añade una entrada al menú y ya no cabe, esto lo dice.
  console.log('\n--- la cabecera a distintos anchos ---');

  const cab = await navegador.newPage({ viewport: { width: 1600, height: 700 } });
  await cab.goto(PAGINA);
  await cab.waitForTimeout(700);

  // Hasta los 320px, que es el móvil más estrecho que sigue en circulación.
  for (const w of [1600, 1440, 1366, 1280, 1250, 1200, 1100, 1024, 950, 820, 620, 390, 360, 320]) {
    await cab.setViewportSize({ width: w, height: 700 });
    await cab.waitForTimeout(160);
    const r = await cab.evaluate(() => {
      const vis = (e) => e && e.getBoundingClientRect().width > 0;
      const nav = document.querySelector('.header__nav');
      const plegado = getComputedStyle(nav).position === 'absolute';
      const ys = [...document.querySelectorAll('.header__links li')]
        .filter(vis).map((li) => Math.round(li.getBoundingClientRect().y));
      return {
        plegado: plegado,
        filas: new Set(ys).size,
        boton: vis(document.querySelector('.burger')),
        desborde: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    // Plegado: tiene que haber botón para abrirlo. Desplegado: una sola fila.
    const bien = r.plegado ? r.boton : r.filas === 1;
    check('a ' + w + 'px la cabecera aguanta', bien && !r.desborde,
      (r.plegado ? 'plegado tras el botón' : r.filas + ' fila(s)') +
      (r.desborde ? ' — SE SALE DE ANCHO' : ''));

    // Y el logotipo tiene que empezar donde empieza el texto de debajo. Antes
    // la cabecera usaba un ancho propio y quedaba 80px por fuera del contenido.
    const desfase = await cab.evaluate(() => {
      const m = document.querySelector('.header__brand');
      const t = document.querySelector('.hero__inner > div');
      if (!m || !t) return null;
      return Math.round(m.getBoundingClientRect().x - t.getBoundingClientRect().x);
    });
    check('a ' + w + 'px el logotipo va a una con el texto',
      desfase !== null && Math.abs(desfase) <= 2, desfase + 'px');
  }

  await cab.close();

  /* --- La portada, en una pantalla de portátil ----------------------------- */
  // La portada empezaba con 205px de blanco —93 de cabecera y 112 de hueco— y
  // ese blanco se pagaba al final: las cifras se quedaban por debajo del borde
  // de la pantalla en un portátil corriente, y había que bajar para saber que
  // estaban. Recortado el hueco, caben.
  //
  // La medida es a una altura concreta a propósito: 810px de alto es lo que
  // deja un portátil de los normales con el navegador maximizado. Si algún día
  // esto falla no es necesariamente un error —un bloque más o un texto más
  // largo también lo harían fallar—, pero entonces conviene saberlo y decidir,
  // en vez de enterarse por una captura.
  console.log('\n--- la portada en una pantalla de portátil ---');

  const port = await navegador.newContext({ viewport: { width: 1656, height: 810 } });
  const pp = await port.newPage();
  await pp.goto(PAGINA);
  await pp.waitForTimeout(900);
  const alto = await pp.evaluate(() => {
    document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'));
    // La banda de alta y Login cierra la portada. Sus BOTONES son para lo que
    // está ahí, así que lo que tiene que caber no es el principio de la banda:
    // es la banda entera.
    const c = document.querySelector('.hero .take-part').getBoundingClientRect();
    const h = document.querySelector('.header').getBoundingClientRect();
    const k = document.querySelector('.hero__dates').getBoundingClientRect();
    return {
      banda: Math.round(c.bottom),
      cue: Math.round(document.querySelector('#home .cue').getBoundingClientRect().bottom),
      hueco: Math.round(k.top - h.bottom),
      vh: window.innerHeight
    };
  });
  await port.close();

  check('la tarjeta de alta y Login se ve entera sin bajar', alto.banda <= alto.vh,
    alto.banda + 'px de ' + alto.vh);
  // Y el aviso de que debajo están los vídeos. Si cae por debajo del borde no
  // avisa a nadie: la portada mide más de una pantalla, así que lo único que
  // asomaría sería el principio de una carátula, que no dice de qué.
  check('  y el aviso de que hay más abajo, también', alto.cue <= alto.vh,
    alto.cue + 'px de ' + alto.vh);
  check('  y encima no sobra medio palmo de blanco', alto.hueco <= 80,
    alto.hueco + 'px entre la cabecera y la primera línea');

  // LO QUE SE VE AL PULSAR UNA ENTRADA DEL MENÚ.
  //
  // Dos sitios donde lo que se veía al llegar no era lo que había:
  //
  //   · "Destination" aterrizaba en el texto y la primera foto, con la segunda
  //     cortada por el borde de abajo. La sección no se veía entera nunca.
  //   · "Meet BB's Experts" aterrizaba en el titular y la banda roja, y ahí se
  //     acababa la pantalla: el directorio de expositores quedaba debajo sin
  //     nada que dijera que estaba ahí.
  //
  // Las dos cosas se arreglaron quitando aire, y las dos se vuelven a romper
  // en cuanto alguien añada un párrafo. Así que se miden.
  const clic = await navegador.newContext({ viewport: { width: 1656, height: 810 } });
  const pc = await clic.newPage();
  await pc.goto(PAGINA);
  await pc.waitForTimeout(900);
  await pc.evaluate(() =>
    document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')));

  // Los vídeos son una pantalla suya, debajo de la portada. Si no caben, el
  // pie que invita a seguir bajando se queda fuera y no invita a nadie.
  const altoVid = await pc.evaluate(() => ({
    sec: Math.round(document.querySelector('#editions').getBoundingClientRect().height),
    hueco: window.innerHeight - 93
  }));
  check('los vídeos caben en una pantalla', altoVid.sec <= altoVid.hueco,
    altoVid.sec + 'px de ' + altoVid.hueco);

  for (const [etiqueta, entrada, medir] of [
    // Destination cabe entera, y costó dos intentos fallidos llegar ahí. Las
    // fotos estuvieron recortadas a 2:1 para ganar alto y salían aplastadas;
    // luego a 4:3 y apiladas, y entonces la sección medía 944px y no entraba
    // en ninguna pantalla. Ahora van a 4:3 y EN FILA: dos fotos una al lado
    // de la otra miden la mitad de alto que dos en columna, y la sección se
    // queda en 674px sin tocarle la proporción a ninguna.
    ['al pulsar Destination se ve la sección entera', 'Destination',
      '#presentation'],
    // El programa es a lo que se llega desde el menú, y lo que se ve al llegar
    // tiene que ser el programa: los cinco días, no los tres de arriba. Entre
    // el relleno de la sección, el de la tarjeta y el hueco bajo el titular se
    // iban 330px antes de la primera palabra del primer día.
    ['al pulsar Programme se ve la tarjeta entera', 'Programme', '.prog-card'],
    ['al pulsar Meet BB\'s Experts se llega al directorio', "Meet BB's Experts",
      '#exhibitors']
  ]) {
    await pc.evaluate(() => window.scrollTo(0, 0));
    await pc.waitForTimeout(250);
    await pc.click(`.header__links a:text-is("${entrada}")`);
    await pc.waitForTimeout(1200);
    const r = await pc.evaluate((sel) => {
      const c = document.querySelector(sel).getBoundingClientRect();
      return { top: Math.round(c.top), bottom: Math.round(c.bottom), vh: window.innerHeight };
    }, medir);
    check(etiqueta, r.top >= -1 && r.bottom <= r.vh + 1,
      'de ' + r.top + ' a ' + r.bottom + ' en ' + r.vh + 'px');
  }

  // Y el aviso lleva a alguna parte: un pie que invita a bajar y no baja es
  // peor que no ponerlo.
  const cues = await pc.evaluate(() =>
    [...document.querySelectorAll('.cue__link')].map((a) => ({
      href: a.getAttribute('href'),
      existe: !!document.getElementById((a.getAttribute('href') || '').slice(1))
    })));
  await clic.close();

  // LA TARJETA DE ALTA Y LOGIN, EN LAS ALTURAS DE UN PORTÁTIL DE VERDAD.
  //
  // Un portátil de 1366×768 no da 768px de web: el navegador se lleva la barra
  // de direcciones, las pestañas y a veces la de marcadores, y Windows la del
  // sistema. Lo que queda son las alturas de abajo, de la peor a la mejor.
  //
  // Hubo una escalera de `zoom` que encogía la web entera para que la tarjeta
  // entrase en todas. Está quitada —el porqué, en la hoja de estilos—, así que
  // esto ya no mide ningún zoom: mide si la tarjeta cabe tal cual, con el
  // cuerpo de texto a su tamaño y sin que la página se salga de ancho.
  //
  // 538px se mide pero NO se exige. Es el caso peor —navegador con marcadores
  // y barra de tareas a la vez—, y hacerlo entrar costaba o aplastar las fotos
  // o bajar el texto de 14px, que es donde deja de leerse a gusto. Ahí la
  // tarjeta queda un poco por debajo del borde y se llega bajando, como al
  // resto de la página. Si algún día sube por sí sola, mejor; se verá aquí.
  for (const h of [538, 594, 627, 700, 760]) {
    const zc = await navegador.newContext({ viewport: { width: 1345, height: h } });
    const zp = await zc.newPage();
    await zp.goto(PAGINA);
    await zp.waitForTimeout(700);
    const z = await zp.evaluate(() => {
      document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'));
      const c = document.querySelector('.hero .take-part').getBoundingClientRect();
      // `.pillar p` y no `.hero__lead`: ese párrafo se quitó de la portada el
      // día que su sitio lo ocuparon los logos, y medirlo reventaba la prueba
      // entera. Los tres bloques de debajo son ahora el cuerpo de texto de la
      // portada, y son lo que no puede bajar de 14px.
      const px = parseFloat(getComputedStyle(document.querySelector('.pillar p')).fontSize);
      return { abajo: Math.round(c.bottom), vh: window.innerHeight,
        letra: +px.toFixed(1),
        desborde: document.documentElement.scrollWidth > document.documentElement.clientWidth };
    });
    await zc.close();
    const detalle = z.abajo + 'px de ' + z.vh + ' · letra ' + z.letra + 'px' +
      (z.desborde ? ' — SE SALE DE ANCHO' : '');
    if (h === 538) {
      console.log('a 538px de alto la tarjeta NO entra'.padEnd(56) +
        'SABIDO  (' + detalle + ')');
      continue;
    }
    check('a ' + h + 'px de alto la tarjeta entra',
      z.abajo <= z.vh && z.letra >= 14 && !z.desborde, detalle);
  }

  // LA CADENA DE FLECHAS. Cada sección termina diciendo qué hay debajo, y la
  // siguiente empieza donde apunta la anterior: portada → vídeos → destino →
  // programa → expositores → folletos → contacto. Seis flechas, una menos que
  // secciones, porque la última no tiene debajo más que el pie.
  //
  // Se comprueban las seis y se comprueba que lleven a alguna parte. Un ancla
  // que no encuentra su sección no avisa de nada: cambia la dirección del
  // navegador y la pantalla se queda igual.
  const CADENA = ['#editions', '#presentation', '#event', '#experts', '#discover', '#contact'];
  check('las flechas encadenan la página entera',
    cues.length === CADENA.length &&
    cues.every((c, i) => c.existe && c.href === CADENA[i]),
    cues.map((c) => c.href).join(' ') || 'ninguna');

  // Y las de las secciones que caben en una pantalla se ven sin bajar. En esas
  // la flecha es lo que dice que la página sigue, así que por debajo del borde
  // no sirve de nada.
  //
  // El programa y los folletos NO están en esta lista, y no es un olvido: uno
  // mide 907px y el otro 2554 —cinco días de agenda, doce folletos—, o sea más
  // de una pantalla por mucho que se recorte. Ahí la flecha va donde tiene que
  // ir, al final, y aparece cuando se termina de leer la sección, que es
  // justo cuando hace falta.
  const mira = await navegador.newContext({ viewport: { width: 1656, height: 810 } });
  const pm = await mira.newPage();
  await pm.goto(PAGINA);
  await pm.waitForTimeout(900);
  await pm.evaluate(() =>
    document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')));
  for (const sec of ['#home', '#editions', '#presentation', '#experts']) {
    await pm.evaluate((s) => { window.location.hash = s; }, sec);
    await pm.waitForTimeout(800);
    const v = await pm.evaluate((s) => {
      const c = document.querySelector(s + ' .cue');
      return c ? { abajo: Math.round(c.getBoundingClientRect().bottom), vh: window.innerHeight }
        : null;
    }, sec);
    check('  la flecha de ' + sec + ' se ve al llegar', v && v.abajo <= v.vh,
      v ? v.abajo + 'px de ' + v.vh : 'no hay flecha');
  }
  await mira.close();

  /* --- El botón de la cabecera, antes y después de abrir ------------------- */
  // LO QUE TIENE QUE PASAR EL 29 ES NADA.
  //
  // La cabecera llevaba dos botones que se cambiaban los papeles ese día: el
  // alta dejaba de ser el rojo y lo pasaba a ser el Login. Funcionaba, pero
  // era un cambio de aspecto disparado por una fecha, y un cambio que solo
  // ocurre una vez es un cambio que nadie ha visto ocurrir.
  //
  // Ahora hay un botón, el Login, y es el mismo los dos días. Lo único que
  // cambia es a dónde lleva: antes del 29 a la página que explica cuándo
  // abre, desde el 29 a Meetmaps. Así que esto se comprueba con el reloj
  // adelantado, y lo que se exige es justamente que NO cambie: mismo botón,
  // mismo rojo, mismo sitio, y ningún alta que haya vuelto a aparecer.
  console.log('\n--- el botón de la cabecera, antes y después del 29 ---');

  async function cabecera(cuando, ancho) {
    const ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 } });
    const pg = await ctx.newPage();
    if (cuando) await pg.addInitScript(RELOJ, cuando);
    await pg.goto(PAGINA);
    await pg.waitForTimeout(700);
    const r = await pg.evaluate(() => {
      const leer = (sel) => {
        const e = document.querySelector(sel);
        if (!e) return null;
        const s = getComputedStyle(e);
        return {
          fondo: s.backgroundColor,
          tinta: s.color,
          borde: parseFloat(s.borderTopWidth) + ' ' + s.borderTopColor,
          visible: e.getBoundingClientRect().width > 0
        };
      };
      const nav = document.querySelector('.header__nav');
      const ys = [...document.querySelectorAll('.header__links li')]
        .filter((li) => li.getBoundingClientRect().width > 0)
        .map((li) => Math.round(li.getBoundingClientRect().y));
      return {
        entrar: leer('.header__actions [data-login]'),
        alta: document.querySelectorAll('.header [data-register]').length,
        destino: (document.querySelector('.header__actions [data-login]') || {})
          .getAttribute ? document.querySelector('.header__actions [data-login]')
            .getAttribute('href') : '',
        plegado: getComputedStyle(nav).position === 'absolute',
        boton: document.querySelector('.burger').getBoundingClientRect().width > 0,
        filas: new Set(ys).size,
        desborde: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    await ctx.close();
    return r;
  }

  // Después de las 12:00 del día 29, que es cuando abre. Estuvo a las 09:00 de
  // ese día, que valía mientras la apertura era a las 00:01 y a esa hora ya
  // estaba abierta. Ahora las 09:00 caen del otro lado.
  const ABRE = '2026-09-29T12:30:00+02:00';
  const hoy = await cabecera(null, 1280);
  const luego = await cabecera(ABRE, 1280);

  check('cerrada, el Login es el botón rojo',
    hoy.entrar && hoy.entrar.fondo === ROJO && hoy.entrar.tinta === 'rgb(255, 255, 255)',
    hoy.entrar && hoy.entrar.fondo + ' · letra ' + hoy.entrar.tinta);
  check('abierta, el Login sigue siendo el mismo botón',
    luego.entrar && luego.entrar.fondo === hoy.entrar.fondo &&
    luego.entrar.tinta === hoy.entrar.tinta && luego.entrar.borde === hoy.entrar.borde,
    luego.entrar && luego.entrar.fondo + ' · letra ' + luego.entrar.tinta);
  check('el alta no está en la cabecera ninguno de los dos días',
    hoy.alta === 0 && luego.alta === 0,
    'antes ' + hoy.alta + ' · después ' + luego.alta);

  // Lo único que cambia el 29 es a dónde lleva, y eso sí se exige que cambie:
  // si el día 29 siguiera llevando al cartel de "abre el 29", el botón se
  // estaría riendo de quien lo pulsa.
  check('lo único que cambia el 29 es a dónde lleva',
    /platform\.html$/.test(hoy.destino || '') && /^https?:/.test(luego.destino || ''),
    (hoy.destino || '?') + '  →  ' + (luego.destino || '?'));

  // Y LO QUE SE ROMPÍA SIN QUE NADIE LO VIERA: con dos pastillas en vez de
  // una, la fila de la cabecera pesaba unos 45px más, y la primera versión de
  // aquello partía el menú en dos filas a 1280px —la anchura de portátil más
  // corriente que hay— pero solo a partir del día que abriera la plataforma.
  // Nadie lo habría visto hasta el 29 por la mañana.
  //
  // Con un botón que no cambia, ese riesgo se acabó. La medida se queda igual
  // —catorce anchuras con el reloj adelantado—, porque comprobar que algo
  // sigue sin romperse cuesta lo mismo que comprobarlo la primera vez, y
  // porque el menú sí puede volver a crecer: basta con añadirle una entrada.
  for (const w of [1600, 1440, 1366, 1280, 1276, 1275, 1200, 1100, 1024, 950, 820, 620, 390, 320]) {
    const est = await cabecera(ABRE, w);
    // El Login se queda en la barra a cualquier ancho. Siendo el único botón
    // cabe hasta en 320px, y esconderlo sería esconder lo único que se pulsa.
    const menu = est.plegado ? est.boton : est.filas === 1;
    check('abierta, a ' + w + 'px la cabecera aguanta',
      menu && est.entrar.visible && !est.desborde,
      (est.plegado ? 'plegado tras el botón' : est.filas + ' fila(s)') +
      ', Login en la barra' + (est.desborde ? ' — SE SALE DE ANCHO' : ''));
  }

  /* --- Lo que el servidor publica ------------------------------------------ */
  // deploy.php se planta si le falta uno de los archivos de su lista: no copia
  // nada y deja la web como estaba. Así que un nombre en esa lista que no
  // exista en el repositorio no es un despiste, es un despliegue parado.
  console.log('\n--- lo que publica el servidor ---');

  const deploy = fs.readFileSync(path.join(ROOT, 'server/deploy.php'), 'utf8');
  // Se quedan solo los nombres entrecomillados: la lista lleva comentarios
  // entre medias, y partir por comas sin más los tomaba por archivos.
  const lista = ((deploy.match(/\$FILES\s*=\s*\[([\s\S]*?)\]/) || [, ''])[1]
    .match(/'([^']+)'/g) || []).map((s) => s.replace(/'/g, ''));

  check('deploy.php enumera archivos', lista.length > 0, lista.join(' '));
  for (const f of lista) {
    check('  publica ' + f, fs.existsSync(path.join(ROOT, f)));
  }
  // El .htaccess es el que impide que el navegador mezcle versiones. Si se cae
  // de la lista, deja de publicarse y el problema vuelve sin hacer ruido.
  check('el .htaccess se publica', lista.indexOf('.htaccess') > -1, lista.join(' '));
  const htaccess = fs.readFileSync(path.join(ROOT, '.htaccess'), 'utf8');
  check('el .htaccess obliga a revalidar', /no-cache/.test(htaccess));

  // Y manda todo a una sola dirección. La web responde igual con www y sin él,
  // y sin esto son dos webs iguales compitiendo en Google.
  check('  y manda las dos direcciones a una sola',
    /RewriteCond %\{HTTP_HOST\} \^www\\\./.test(htaccess) && /R=301/.test(htaccess));
  // Lo que NO puede redirigir es la carpeta por la que el hosting valida el
  // certificado SSL. Si alguien quita esta excepción, la web sigue funcionando
  // y el fallo no aparece hasta el día que toque renovar, con la web entera
  // dando aviso de sitio no seguro. Es el tipo de cosa que solo se ve aquí.
  check('  sin tocar la validación del certificado',
    /!\^\/\\\.well-known\//.test(htaccess),
    /well-known/.test(htaccess) ? 'la excepción está' : 'FALTA la excepción');
  // El destino de la redirección y lo que declara la web tienen que ser el
  // mismo. Mandar a www y declarar el canonical sin www deja al buscador con
  // dos instrucciones contrarias.
  const portada = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const can = (portada.match(/<link rel="canonical" href="([^"]+)"/) || [, ''])[1];
  check('  y a donde manda es lo que dice el canonical',
    /^https:\/\/matchbilbaobizkaia\.eus\//.test(can), can || 'sin canonical');

  // El panel de administración edita la web: quien lo abre cambia los textos,
  // el programa y los folletos. Mientras no tenga contraseña no puede estar
  // publicado, y hay DOS caminos por los que podría volver —el despliegue
  // automático y el paquete que se sube a mano—, así que se vigilan los dos.
  const dirsDeploy = (deploy.match(/\$DIRS\s*=\s*\[([^\]]*)\]/) || [, ''])[1];
  const retirar = (deploy.match(/\$RETIRAR\s*=\s*\[([^\]]*)\]/) || [, ''])[1];
  const paquete = fs.readFileSync(path.join(ROOT, 'tools/build-site.js'), 'utf8');
  const dirsPaquete = (paquete.match(/const DIRS\s*=\s*\[([^\]]*)\]/) || [, ''])[1];

  check('el despliegue no publica el panel', !/admin/.test(dirsDeploy), dirsDeploy.trim());
  check('el despliegue retira el panel de la web', /'admin'/.test(retirar), retirar.trim());
  check('el paquete manual tampoco lleva el panel',
    !/admin/.test(dirsPaquete), dirsPaquete.trim());

  // EL PANEL NO PUEDE ENSEÑAR A SUBIR POR FTP.
  //
  // El despliegue copia el repositorio encima de la carpeta pública cada media
  // hora. Un archivo subido por FTP dura hasta el siguiente repaso y
  // desaparece, y el registro dice «Copiados 1 archivos» como si todo hubiera
  // ido bien. Comprobado a mano: se edita un dato en la carpeta pública, se
  // lanza deploy.php y el cambio ya no está.
  //
  // Así que el panel tiene que mandar sus archivos AL REPOSITORIO. Si alguien
  // devuelve las instrucciones antiguas, esto lo dice.
  const panel = fs.readFileSync(path.join(ROOT, 'admin/admin.js'), 'utf8');
  const instrucciones = (panel.match(/Conéctate por FTP[^']*/g) || [])
    .concat(panel.match(/sube[^']*por FTP a <code>assets\/js/g) || []);

  check('el panel no manda subir los datos por FTP',
    instrucciones.length === 0, instrucciones.join(' · ') || 'ninguna instrucción de FTP');
  check('el panel manda los cambios al repositorio',
    /Upload files/.test(panel) && /repositorio/.test(panel));

  // Y que no siga diciendo que Meetmaps está por conectar, que lo está.
  check('el panel no dice que Meetmaps esté por conectar',
    !/cuando se conecte Meetmaps/i.test(panel));

  /* --- La página de aviso, que no es la portada ---------------------------- */
  // Esto existe por un fallo que se veía perfecto y no funcionaba: en
  // platform.html el menú se dibujaba entero, pero sus enlaces eran "#discover"
  // y esa sección no está en esa página. Pulsar cambiaba la dirección del
  // navegador y nada más: ni saltaba, ni avisaba, ni se movía la pantalla.
  // Parecía una página rota y estática.
  //
  // Lo que se comprueba aquí no es que los enlaces existan —existían— sino que
  // LLEVAN A ALGÚN SITIO desde la página en la que están.
  console.log('\n--- la página de aviso (platform.html) ---');

  const aviso = await navegador.newPage({ viewport: { width: 1280, height: 1000 } });
  const erroresAviso = [];
  aviso.on('pageerror', (e) => erroresAviso.push(String(e)));
  await aviso.goto('file://' + path.join(ROOT, 'platform.html'));
  await aviso.waitForTimeout(600);

  // Lo primero y lo más importante de esta página: que se lea SIN JavaScript.
  // Es la página a la que mandamos a todo el que pulsa "Login", así que no
  // puede depender de que tres archivos lleguen y se ejecuten para enseñar un
  // párrafo. Se abre con el script desactivado y tiene que decir lo mismo.
  const mudo = await navegador.newContext({ javaScriptEnabled: false });
  const sinJs = await mudo.newPage();
  await sinJs.goto('file://' + path.join(ROOT, 'platform.html'));
  const crudo = await sinJs.evaluate(() => {
    const g = document.querySelector('[data-gate]');
    const enlaces = g ? [...g.querySelectorAll('a')].map((a) => a.getAttribute('href')) : [];
    return { texto: (g ? g.textContent : '').replace(/\s+/g, ' ').trim(), enlaces };
  });
  await mudo.close();

  // La fecha que lee la gente y la que manda a los botones tienen que ser la
  // misma. Si alguien cambia `opensAt` y se olvida del texto —o al revés— la
  // web diría un día y se abriría otro, y nadie se enteraría hasta ese día.
  const dia = await aviso.evaluate(() => window.MBB.platformOpensOn(window.MBB.site));
  const completa = await aviso.evaluate(() => window.MBB.platformOpensFull(window.MBB.site));

  // El aviso llegó a ser dos párrafos largos y se midió por su longitud: más
  // de 200 caracteres significaba que el texto estaba escrito en el HTML y no
  // lo dibujaba el script. Ahora son un titular y dos botones —lo demás
  // repetía lo que ya decían ellos—, así que contar letras ya no dice nada.
  // Se comprueba lo que de verdad importa: que sin JavaScript se lea QUÉ pasa
  // y CUÁNDO, que es a lo que viene quien pulsa Login y aterriza aquí.
  check('el aviso se lee sin JavaScript',
    /platform opens/i.test(crudo.texto) && crudo.texto.indexOf(dia) > -1,
    crudo.texto.slice(0, 70) + '…');
  // Y esa fecha tiene que salir de la misma que usan los botones. Si alguien
  // cambia `opensAt` y se olvida del texto —o al revés— la web diría un día y
  // se abriría otro, y nadie se enteraría hasta ese día. Esto falla aquí, en
  // el banco de pruebas, y no el 29 por la mañana delante de la gente.
  //
  // Se mira solo "29 September", la forma corta del titular. La larga
  // —"Tuesday 29 September 2026"— estaba en un párrafo que ya no existe;
  // `platformOpensFull` sigue ahí para quien la necesite.
  //
  // La hora no se comprueba porque no se escribe: la página dice el día y
  // nada más, aunque `opensAt` lleve las 00:01 para saber cuándo cambiar.
  check('el texto escrito dice la misma fecha que site.js',
    crudo.texto.indexOf(dia) > -1,
    crudo.texto.indexOf(dia) > -1 ? dia + ' (de ' + completa.fecha + ')'
      : 'falta en platform.html: ' + dia);

  // Y NO ANUNCIA LA HORA, a propósito. `opensAt` la lleva —las 12:00 del día
  // 29— porque el cambio tiene que ocurrir en un instante concreto, pero esta
  // página dice el día y nada más: la hora la avisa la organización por correo
  // a quien está inscrito.
  //
  // Se comprueba porque es una decisión, no una casualidad: si alguien la
  // escribe aquí pensando que ayuda, conviene que salte y se hable, en vez de
  // que la web y el correo digan cosas distintas.
  check('el aviso no anuncia una hora', !/\d{1,2}:\d{2}/.test(crudo.texto),
    (crudo.texto.match(/\d{1,2}:\d{2}/) || ['sin hora'])[0]);
  check('sin JavaScript, el alta y la vuelta siguen a mano',
    crudo.enlaces.some((h) => /registration/.test(h)) &&
    crudo.enlaces.some((h) => /^\.\/$/.test(h)), crudo.enlaces.join(' '));

  const p = await aviso.evaluate(() => {
    const internos = [...document.querySelectorAll('.header a, .footer a')]
      .map((a) => ({ t: (a.textContent || '').trim(), h: a.getAttribute('href') || '' }))
      .filter((a) => a.h && !/^(mailto|tel|https?):/.test(a.h));
    return {
      montada: !!document.querySelector('.gate'),
      cabecera: !!document.querySelector('.header__brand'),
      pie: !!document.querySelector('.footer'),
      // Un ancla que no encuentra su sección en ESTA página no lleva a ninguna
      // parte. Los legales todavía son marcadores y se cuentan aparte.
      sinDestino: internos.filter(
        (a) => a.h.charAt(0) === '#' &&
          !/^#legal-/.test(a.h) &&
          !document.getElementById(a.h.slice(1))
      ),
      aPortada: internos.filter((a) => /^\.\/#/.test(a.h)).length,
      // Y el Login, estando ya en la página de aviso, no puede llevar aquí
      // mismo: sería pulsar y que no pase nada.
      loginACasa: [...document.querySelectorAll('a[data-login]')]
        .filter((a) => /platform\.html$/.test(a.getAttribute('href') || '')).length,
      // El alta ya no está en la cabecera de ninguna página. Aquí lo que tiene
      // que estar es el botón grande del cuerpo, "Create your profile", que
      // es el motivo de que esta página exista: quien pulsa Login antes del 29
      // llega aquí, no puede entrar todavía, y lo que puede hacer es darse de
      // alta. Va escrito en el HTML, así que se lee sin JavaScript.
      alta: [...document.querySelectorAll('[data-gate] a')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => /registration/.test(h || '')),
      // Los cuatro pasos de "cómo funciona", que ahora viven aquí. Van
      // DESPUÉS del aviso: lo primero es que la plataforma todavía no abre,
      // y esto es la respuesta a la pregunta que deja esa frase.
      pasos: document.querySelectorAll('#how .step').length,
      pasosTitular: (document.querySelector('#how h2') || {}).textContent || '',
      pasosDebajo: (() => {
        const g = document.querySelector('[data-gate]');
        const h = document.querySelector('#how');
        return !!(g && h && g.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING);
      })()
    };
  });

  check('la página de aviso se monta', p.montada && p.cabecera && p.pie);
  check('ningún enlace del menú se queda sin destino',
    p.sinDestino.length === 0, JSON.stringify(p.sinDestino));
  check('el menú lleva de vuelta a la portada', p.aPortada > 0, p.aPortada + ' enlaces');
  check('el Login no se apunta a sí mismo', p.loginACasa === 0, p.loginACasa);
  check('el alta sigue a mano en el cuerpo de la página',
    p.alta.length > 0 && /registration/.test(p.alta[0] || ''), p.alta.join(' '));
  // "CÓMO FUNCIONA" SE MUDÓ AQUÍ, y esta página solo cargaba site.js. Si
  // alguien quita el <script> de content.js, el bloque no revienta la página
  // —cada sección se dibuja en su try/catch— sino que desaparece en silencio,
  // que es peor. Por eso se cuentan los pasos y se lee el titular.
  check('los cuatro pasos de "cómo funciona" están aquí', p.pasos === 4,
    p.pasos + ' paso(s) · «' + p.pasosTitular + '»');
  check('  y van después del aviso, no delante', p.pasosDebajo);
  check('sin errores de JavaScript', erroresAviso.length === 0, erroresAviso.join(' | '));

  await aviso.close();

  /* --- Las cuatro páginas legales ------------------------------------------ */
  // Son las que alguien busca cuando hay una reclamación, así que son las
  // peores que pueden estar rotas. Y como platform.html, tienen que leerse
  // aunque el JavaScript no llegue: por eso se abren con el script apagado.
  console.log('\n--- las páginas legales ---');

  const LEGALES = [
    ['privacy.html', 'Privacy policy'],
    ['cookies.html', 'Cookie policy'],
    ['legal-notice.html', 'Legal notice'],
    ['accessibility.html', 'Accessibility statement']
  ];

  // La portada se dibuja entera desde los datos, así que sin JavaScript se
  // queda en blanco —quince caracteres— salvo por el bloque de reserva. Ese
  // bloque es la única información que le llega a un buscador viejo, a una red
  // corporativa que bloquea scripts o a quien navega sin ellos.
  const sinJsPortada = await navegador.newContext({ javaScriptEnabled: false });
  const portadaMuda = await sinJsPortada.newPage();
  await portadaMuda.goto(PAGINA);
  const reserva = await portadaMuda.evaluate(() => {
    const t = document.body.innerText.replace(/\s+/g, ' ').trim();
    return {
      largo: t.length,
      fecha: /October 2026/.test(t),
      alta: [...document.querySelectorAll('noscript a')]
        .some((a) => /registration/.test(a.getAttribute('href') || '')),
      correo: /welcome@matchbilbaobizkaia\.eus/.test(t)
    };
  });
  await sinJsPortada.close();

  check('sin JavaScript la portada no se queda en blanco',
    reserva.largo > 500, reserva.largo + ' caracteres');
  check('  y dice las fechas, el alta y el contacto',
    reserva.fecha && reserva.alta && reserva.correo,
    'fechas ' + reserva.fecha + ' · alta ' + reserva.alta + ' · correo ' + reserva.correo);

  const mudas = await navegador.newContext({ javaScriptEnabled: false });
  const pendientes = [];

  for (const [archivo, titulo] of LEGALES) {
    const lp = await mudas.newPage();
    await lp.goto('file://' + path.join(ROOT, archivo));
    const r = await lp.evaluate(() => {
      const t = document.body.textContent.replace(/\s+/g, ' ').trim();
      // El pie va en todas las páginas, así que un nivel mal puesto ahí rompe
      // el esquema en las cuatro a la vez. Se mira en cada una.
      const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
      const saltos = [];
      for (let i = 1; i < hs.length; i++) {
        if (+hs[i].tagName[1] - +hs[i - 1].tagName[1] > 1) {
          saltos.push(hs[i - 1].tagName + '→' + hs[i].tagName);
        }
      }

      return {
        h1: (document.querySelector('h1') || {}).textContent || '',
        largo: t.length,
        saltos: saltos,
        // Lo que todavía no se puede escribir sin que lo diga la organización.
        huecos: (t.match(/\[Insert [^\]]+\]/g) || []),
        // La portada se nombra como carpeta, «./», no como archivo. Si alguien
        // vuelve a escribir «index.html» aquí, la dirección que la gente copia
        // y pega vuelve a llevar el nombre del archivo, y el buscador vuelve a
        // ver dos páginas donde hay una.
        vuelta: [...document.querySelectorAll('a')]
          .some((a) => /^\.\/$/.test(a.getAttribute('href') || ''))
      };
    });
    await lp.close();

    check(archivo + ' se lee sin JavaScript',
      r.h1.trim() === titulo && r.largo > 1200, r.h1.trim() + ' · ' + r.largo + ' caracteres');
    check('  y se puede volver a la web', r.vuelta);
    check('  y sus títulos van por orden', r.saltos.length === 0,
      r.saltos.join(' · ') || 'sin saltos');
    r.huecos.forEach((h) => pendientes.push(archivo + ': ' + h));
  }
  await mudas.close();

  // El pie tiene que llevar a las cuatro, y desde cualquier página.
  const pie = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
  await pie.goto(PAGINA);
  await pie.waitForTimeout(700);
  const enlaces = await pie.evaluate(() => [...document.querySelectorAll('.footer a')]
    .map((a) => a.getAttribute('href')));
  await pie.close();

  for (const [archivo] of LEGALES) {
    check('el pie enlaza ' + archivo, enlaces.indexOf(archivo) > -1);
  }
  check('ningún enlace legal sin destino',
    !enlaces.some((h) => /^#legal-/.test(h || '')),
    enlaces.filter((h) => /^#legal-/.test(h || '')).join(' ') || 'ninguno');

  // Y el día que abra, esta página tiene que apartarse sola. Se adelanta el
  // reloj del navegador y se comprueba a dónde acaba el visitante. Meetmaps no
  // existe desde aquí, así que se intercepta la salida para ver la dirección.
  //
  // El caso del medio es el que importa desde que la apertura son las 12:00 y
  // no las 00:01: EL MISMO DÍA 29, POR LA MAÑANA, la plataforma todavía está
  // cerrada y el cartel tiene que seguir puesto. Si alguien vuelve a mover la
  // hora y se le olvida el cartel, aquí se ve.
  for (const [etiqueta, cuando, esperaIrse] of [
    ['la víspera el aviso sigue puesto', '2026-09-28T23:59:00+02:00', false],
    ['la mañana del 29 sigue puesto, que aún no ha abierto',
      '2026-09-29T09:00:00+02:00', false],
    ['a las 12:00 del 29 el aviso se aparta solo', '2026-09-29T12:01:00+02:00', true],
    ['semanas después sigue apartándose', '2026-10-15T12:00:00+02:00', true]
  ]) {
    const ctx = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
    let fueA = null;
    await ctx.route('**://event.meetmaps.com/**', (ruta) => {
      fueA = ruta.request().url();
      ruta.fulfill({ status: 200, contentType: 'text/html', body: 'ok' });
    });
    const t = await ctx.newPage();
    await t.addInitScript(RELOJ, cuando);
    await t.goto('file://' + path.join(ROOT, 'platform.html'));
    await t.waitForTimeout(700);
    const titular = await t.evaluate(() => {
      const h = document.querySelector('h1');
      return h ? h.textContent.trim() : '';
    });
    check(etiqueta, esperaIrse ? /virtual\/join/.test(fueA || '') : fueA === null,
      fueA ? 'va a ' + fueA : 'se queda en "' + titular + '"');
    await ctx.close();
  }

  await navegador.close();

  console.log(
    '\n' + (fallos ? fallos + ' comprobaciones fallan' : 'Todas las comprobaciones pasan')
  );

  // Los datos que solo puede dar la organización —el NIF, la dirección, el
  // correo de protección de datos, el grado de cumplimiento de accesibilidad—
  // se listan aparte y NO cuentan como fallo.
  //
  // No son un fallo porque no hay nada que arreglar en el código: falta un dato
  // que no se puede inventar. Y van en su propio bloque, y no escondidos en la
  // lista de comprobaciones, para que se vean de un vistazo y no se publique la
  // web con "[Insert NIF]" en la página de privacidad.
  if (pendientes.length) {
    console.log(
      '\nPENDIENTE DE DATOS (' + pendientes.length + ') — no es un fallo del código,\n' +
      'son datos que tiene que dar la organización antes de publicar:'
    );
    pendientes.forEach(function (p) { console.log('  · ' + p); });
  }

  process.exit(fallos ? 1 : 0);
})();
