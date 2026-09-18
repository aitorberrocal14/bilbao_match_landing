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
        fuera: opciones.filter((e) => e.target === '_blank' && /noopener/.test(e.rel)).length,
        dentroDePantalla: opciones.every((e) => {
          const c = e.getBoundingClientRect();
          return c.left >= -1 && c.right <= window.innerWidth + 1;
        }),
        // Las fechas de los tres enlaces salen de site.js, no están escritas
        // a mano: si alguien las cambia en el panel, tienen que seguirlas.
        googleSigueALosDatos: (() => {
          const a = document.querySelector('.cal__menu a');
          const c = window.MBB.site.event.calendar;
          const utc = (iso) =>
            new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
          return a.href.indexOf(utc(c.start) + '/' + utc(c.end)) > -1;
        })()
      };
    });

    check('el calendario ofrece cuatro destinos', cal.destinos === 4, cal.destinos);
    check('los cuatro se pueden pulsar', cal.pulsables === 4,
      cal.pulsables + ' de ' + cal.destinos);
    check('tres abren fuera y uno descarga', cal.fuera === 3 && cal.descarga === 1,
      cal.fuera + ' fuera, ' + cal.descarga + ' descarga');
    check('las fechas salen de los datos, no a mano', cal.googleSigueALosDatos);
    check('el menú no se sale de la pantalla', cal.dentroDePantalla);

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

    check('los botones de Login llevan a la plataforma', resto.login > 0, resto.login);
    check('ningún Login sin dirección', resto.loginVacio === 0, resto.loginVacio);
    check('las dos ediciones tienen vídeo',
      resto.videos === 2 && resto.videosSinId === 0,
      resto.videos + ' vídeos, ' + resto.videosSinId + ' sin identificador');

    /* --- Nada roto por el camino -------------------------------------------- */
    check('sin errores de JavaScript', errores.length === 0, errores.join(' | '));

    await pagina.close();
  }

  await navegador.close();

  console.log(
    '\n' + (fallos ? fallos + ' comprobaciones fallan' : 'Todas las comprobaciones pasan')
  );
  process.exit(fallos ? 1 : 0);
})();
