/**
 * Escribe platform.html — la página que explica cuándo abre la plataforma.
 *
 * Mientras el acceso no esté abierto, todos los botones de Login llevan aquí
 * en vez de al formulario de Meetmaps. Mandar a alguien a un login que le va a
 * rechazar, sin decirle por qué, es peor que no tener botón: el visitante
 * concluye que la web está rota o que el evento no tiene plataforma.
 *
 * La fecha, el enlace de alta y el de acceso salen de assets/js/data/site.js,
 * que es de donde salen también los botones. Así la página y los botones no
 * pueden decir cosas distintas.
 *
 *   node tools/build-platform-page.js
 *
 * Hay que volver a ejecutarlo si cambia la fecha o alguno de los dos enlaces.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'platform.html');

/* --- Cargar los datos y los componentes, como hace el navegador ----------- */

const sandbox = { window: {} };
vm.createContext(sandbox);
['assets/js/data/site.js', 'assets/js/components.js'].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
});
const MBB = sandbox.window.MBB;
const site = MBB.site;
const esc = MBB.esc;

const login = site.login || {};
const reg = site.register || {};

if (!login.opensAt) {
  console.error(
    'site.login.opensAt está vacío, así que la plataforma ya está abierta y\n' +
    'esta página no tiene nada que anunciar. No se ha escrito nada.'
  );
  process.exit(1);
}

const abre = new Date(login.opensAt);
if (isNaN(abre.getTime())) {
  console.error('site.login.opensAt no se entiende: ' + login.opensAt);
  process.exit(1);
}

/* La fecha en inglés y con la hora de Bilbao, que es la que vale: quien lo lea
   desde otro país tiene que saber a qué hora abre aquí, no a la suya. */
const cuando = abre.toLocaleDateString('en-GB', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  timeZone: 'Europe/Madrid'
});
const hora = abre.toLocaleTimeString('en-GB', {
  hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
});

const titulo = 'The platform opens on ' +
  abre.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titulo)} — Match Bilbao Bizkaia 2026</title>
  <meta name="description" content="${esc(
    'The Match Bilbao Bizkaia 2026 platform opens on ' + cuando +
    '. You can create your profile now.'
  )}">
  <meta name="theme-color" content="#ae0000">
  <link rel="icon" href="assets/img/brand/bilbao-bizkaia.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap">
  <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="header" id="header" data-menu="closed">${MBB.Header(site, { base: '' })}</header>

  <main id="main">
    <section class="section">
      <div class="shell gate">
        <p class="kicker">${esc(site.event.name)} ${esc(site.event.edition)}</p>
        <h1 class="h-1">${esc(titulo)}</h1>

        <p class="lead measure">Access to your profile, your availability and your
        meeting agenda opens on <strong>${esc(cuando)}</strong> at ${esc(hora)}
        (Bilbao time). Until then the platform is being prepared, and signing in
        is not yet possible.</p>

        <p class="measure">You do not have to wait to take part. Create your
        profile now — tell us about your company, your markets and who you would
        like to meet — and you will be ready to schedule your meetings the moment
        the platform opens.</p>

        <p class="gate__actions">
          ${reg.url
            ? `<a class="btn btn--lg" href="${esc(reg.url)}" target="_blank" rel="noopener">${esc(reg.label)}</a>`
            : ''}
          <a class="btn btn--lg btn--outline" href="index.html">Back to the site</a>
        </p>

        <p class="gate__help">Questions about your registration? Write to
        <a class="link-red" href="mailto:${esc(site.footer.mail)}">${esc(site.footer.mail)}</a>.</p>
      </div>
    </section>
  </main>

  <footer class="footer" id="footer">${MBB.Footer(site, { base: '' })}</footer>

  <script src="assets/js/data/site.js"></script>
  <script src="assets/js/components.js"></script>
  <script src="assets/js/main.js"></script>
</body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('platform.html — abre el %s a las %s (hora de Bilbao)', cuando, hora);
