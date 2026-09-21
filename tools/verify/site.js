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
        aviso: (document.querySelector('.login-band__note') || {}).textContent || '',
        dia: window.MBB.platformOpensOn(site),
        // Y que el día que abra, los botones vuelvan solos a la plataforma.
        alAbrir: (() => {
          const copia = JSON.parse(JSON.stringify(site));
          copia.login.opensAt = '2020-01-01T00:00:00+01:00';
          return window.MBB.loginHref(copia, '');
        })(),
        alta: (document.querySelector('.login-band__half .btn') || {}).getAttribute
          ? document.querySelector('.login-band__half .btn').getAttribute('href') : ''
      };
    });

    if (puerta.abierta) {
      check('la plataforma está abierta: el Login va a Meetmaps', puerta.todosAMeetmaps);
    } else {
      check('antes de abrir, el Login va a la página de aviso', puerta.todosALaEspera,
        puerta.logins + ' botones');
      check('el aviso dice la fecha antes de pulsar',
        puerta.aviso.indexOf(puerta.dia) > -1, puerta.aviso.trim());
    }
    check('al llegar la fecha vuelve solo a la plataforma',
      /^https?:/.test(puerta.alAbrir || ''), puerta.alAbrir);
    check('hay un botón para darse de alta',
      /meetmaps\.com/.test(puerta.alta) && /registration/.test(puerta.alta), puerta.alta);

    /* --- Las dos puertas de la barra de arriba ------------------------------ */
    // Entrar y darse de alta conviven en la cabecera, y se distinguen sin leer:
    // el alta en rojo macizo, el Login como enlace. En móvil no caben los dos
    // al lado del logotipo y del botón del menú, así que el Login baja al menú
    // desplegable. Lo que no puede pasar nunca es que se pierda por el camino.
    const barra = await pagina.evaluate(() => {
      const visible = (e) => !!e && e.getBoundingClientRect().width > 0;
      const loginArriba = document.querySelector('.header__actions a[data-login]');
      const loginMenu = document.querySelector('.header__links-login a[data-login]');
      const alta = document.querySelector('.header__actions a[data-register]');
      return {
        alta: visible(alta),
        altaTexto: alta ? alta.textContent.trim() : '',
        altaUrl: alta ? alta.getAttribute('href') : '',
        altaRoja: alta ? getComputedStyle(alta).backgroundColor : '',
        // Uno de los dos, nunca los dos ni ninguno.
        loginUno: (visible(loginArriba) ? 1 : 0) + (visible(loginMenu) ? 1 : 0),
        loginDentro: document.documentElement.scrollWidth <= document.documentElement.clientWidth
      };
    });

    check('el alta está en la barra de arriba', barra.alta, barra.altaTexto);
    check('el alta lleva al formulario de registro',
      /registration/.test(barra.altaUrl || ''), barra.altaUrl);
    check('el alta se ve en rojo, no como enlace',
      /rgba?\(20[0-9], 3[0-9], 4[0-9]/.test(barra.altaRoja), barra.altaRoja);
    check('el Login está una vez y solo una', barra.loginUno === 1, barra.loginUno);
    check('la barra no se sale de ancho', barra.loginDentro);

    check('ningún Login sin dirección', resto.loginVacio === 0, resto.loginVacio);
    check('las dos ediciones tienen vídeo',
      resto.videos === 2 && resto.videosSinId === 0,
      resto.videos + ' vídeos, ' + resto.videosSinId + ' sin identificador');

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

  const MUESTRA = [
    ['berrocal', 'Berrocal', 'dmc'],
    ['xxx', 'xxx', 'activities'],
    ['hotel-prueba', 'Hotel Prueba', 'accommodation']
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

  for (const [etiqueta, esperadas] of [
    ['Accommodation', 1], ['Basque DMC', 1],
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
  }

  await dir.close();
  fs.rmSync(tmp, { recursive: true, force: true });

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
      aPortada: internos.filter((a) => /^index\.html#/.test(a.h)).length,
      // Y el Login, estando ya en la página de aviso, no puede llevar aquí
      // mismo: sería pulsar y que no pase nada.
      loginACasa: [...document.querySelectorAll('a[data-login]')]
        .filter((a) => /platform\.html$/.test(a.getAttribute('href') || '')).length,
      alta: [...document.querySelectorAll('.header a[data-register]')]
        .map((a) => a.getAttribute('href'))
    };
  });

  check('la página de aviso se monta', p.montada && p.cabecera && p.pie);
  check('ningún enlace del menú se queda sin destino',
    p.sinDestino.length === 0, JSON.stringify(p.sinDestino));
  check('el menú lleva de vuelta a la portada', p.aPortada > 0, p.aPortada + ' enlaces');
  check('el Login no se apunta a sí mismo', p.loginACasa === 0, p.loginACasa);
  check('el alta sigue a mano desde el menú',
    p.alta.length > 0 && /registration/.test(p.alta[0] || ''), p.alta.join(' '));
  check('sin errores de JavaScript', erroresAviso.length === 0, erroresAviso.join(' | '));

  await aviso.close();

  await navegador.close();

  console.log(
    '\n' + (fallos ? fallos + ' comprobaciones fallan' : 'Todas las comprobaciones pasan')
  );
  process.exit(fallos ? 1 : 0);
})();
