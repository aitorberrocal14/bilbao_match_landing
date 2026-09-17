<?php
/**
 * PUBLICA LA WEB DESDE EL REPOSITORIO
 * -----------------------------------------------------------------------------
 * Trae los últimos cambios con `git pull` y copia a la carpeta pública lo que
 * de verdad es la web. Se ejecuta desde Servidor → Tareas programadas:
 *
 *     php /home/matchbilbaobizkaia/repo/server/deploy.php
 *
 * Y para ver qué haría sin tocar nada:
 *
 *     php .../deploy.php --dry-run
 *
 * Con esto se acaban las subidas a mano: se cambia algo en el repositorio y la
 * web se actualiza sola.
 *
 * Quién manda sobre qué
 * ---------------------
 * Dos cosas escriben en la carpeta pública y hay que tenerlo claro:
 *
 *   · EL REPOSITORIO manda sobre el diseño, los textos, el programa, los
 *     folletos y el panel de administración.
 *
 *   · LA PLATAFORMA manda sobre los expositores. sync.php reescribe la lista,
 *     los logotipos, las fichas y el sitemap cada vez que se ejecuta.
 *
 * Por eso el orden del cron es: primero deploy.php, después sync.php. El
 * despliegue deja la web como está en el repositorio —expositores incluidos, que
 * en el repositorio están vacíos— y el sync la vuelve a llenar desde Meetmaps.
 * Si se hiciera al revés, cada despliegue borraría los expositores hasta el día
 * siguiente.
 *
 * Dónde va el repositorio
 * -----------------------
 * FUERA de la carpeta pública: en /home/<cuenta>/repo. Nunca dentro de www.
 * Un clon dentro de la web deja la carpeta .git accesible desde internet, y con
 * ella el historial completo del proyecto.
 */

declare(strict_types=1);

/* --- Compatibilidad: este hosting ejecuta PHP 7.0 en el cron ---------------- */

if (!function_exists('str_ends_with')) {
    function str_ends_with(string $h, string $n): bool { return $n === '' || substr($h, -strlen($n)) === $n; }
}

/* --- Dónde está todo ------------------------------------------------------- */

define('MBB_REPO', dirname(__DIR__));                  // el clon del repositorio

$argv = isset($argv) ? $argv : [];
$DRY = in_array('--dry-run', $argv, true);

/** La carpeta pública: la que se llama `www` y cuelga de la cuenta. */
function web_root(): string
{
    $home = dirname(MBB_REPO);
    foreach ([$home . '/www', $home . '/public_html', $home . '/htdocs'] as $c) {
        if (is_dir($c)) { return $c; }
    }
    return '';
}

/**
 * Lo que se publica. La misma lista que tools/build-upload.js, porque publicar
 * de dos maneras distintas acaba con dos webs distintas.
 */
$FILES = ['index.html', 'robots.txt', 'sitemap.xml'];
$DIRS  = ['assets', 'exhibitors', 'admin'];

/** Nunca se copia: la contraseña del panel vive en el servidor y solo ahí. */
$NEVER = ['admin-config.php', 'config.php', 'sync.log', '.DS_Store', 'panel.png'];

/* --- Salida ---------------------------------------------------------------- */

$LOG = [];

function say(string $line)
{
    global $LOG;
    $stamped = date('Y-m-d H:i:s') . '  ' . $line;
    $LOG[] = $stamped;
    if (PHP_SAPI === 'cli') { echo $stamped, PHP_EOL; }
}

function flush_log()
{
    global $LOG;
    $file = MBB_REPO . '/server/deploy.log';
    $old = is_file($file) ? array_slice(file($file, FILE_IGNORE_NEW_LINES), -200) : [];
    @file_put_contents($file, implode("\n", array_merge($old, $LOG)) . "\n");
}

function die_with(string $message)
{
    say('ERROR: ' . $message);
    flush_log();
    exit(1);
}

/* --- 1. Traer los cambios --------------------------------------------------- */

if (!is_dir(MBB_REPO . '/.git')) {
    die_with(
        MBB_REPO . ' no es un repositorio. Clónalo primero con una tarea programada: ' .
        'git clone <url> ' . MBB_REPO
    );
}

$antes = trim((string) shell_exec('git -C ' . escapeshellarg(MBB_REPO) . ' rev-parse --short HEAD 2>&1'));

$salida = (string) shell_exec(
    'git -C ' . escapeshellarg(MBB_REPO) . ' pull --ff-only 2>&1'
);
say('git pull: ' . trim(preg_replace('/\s+/', ' ', $salida)));

$ahora = trim((string) shell_exec('git -C ' . escapeshellarg(MBB_REPO) . ' rev-parse --short HEAD 2>&1'));

// No se sale aquí aunque no haya commits nuevos. "El repositorio no ha
// cambiado" no es lo mismo que "la web está al día": en el primer despliegue la
// carpeta pública está vacía, y si alguien borra un archivo por error hay que
// reponerlo. La copia compara contra el destino, archivo a archivo, y no cuesta
// nada cuando ya está todo igual.
say($antes === $ahora ? 'Sin commits nuevos (' . $ahora . ').' : 'De ' . $antes . ' a ' . $ahora . '.');

/* --- 2. Comprobar antes de copiar ------------------------------------------- */

$WEB = web_root();
if ($WEB === '') {
    die_with('No se encuentra la carpeta pública junto a ' . dirname(MBB_REPO) . '.');
}
if (!is_writable($WEB)) {
    die_with($WEB . ' no se puede escribir.');
}

foreach ($FILES as $f) {
    if (!is_file(MBB_REPO . '/' . $f)) { die_with('Falta ' . $f . ' en el repositorio.'); }
}
foreach (['assets/css/styles.css', 'assets/js/main.js', 'admin/index.html'] as $f) {
    if (!is_file(MBB_REPO . '/' . $f)) { die_with('Falta ' . $f . ' en el repositorio.'); }
}

/* --- 3. Copiar -------------------------------------------------------------- */

$copiados = 0;
$saltados = 0;

function copiar(string $desde, string $hasta, bool $dry)
{
    global $copiados, $saltados, $NEVER;

    if (!is_dir($hasta) && !$dry) { @mkdir($hasta, 0755, true); }

    foreach (scandir($desde) as $entry) {
        if ($entry === '.' || $entry === '..') { continue; }
        if (in_array($entry, $NEVER, true)) { continue; }
        if (str_ends_with($entry, '.md')) { continue; }

        $src = $desde . '/' . $entry;
        $dst = $hasta . '/' . $entry;

        if (is_dir($src)) {
            copiar($src, $dst, $dry);
            continue;
        }

        // Solo lo que ha cambiado: una copia idéntica no aporta nada y deja la
        // fecha de modificación mintiendo sobre cuándo cambió el archivo.
        if (is_file($dst) && filesize($dst) === filesize($src) && md5_file($dst) === md5_file($src)) {
            $saltados++;
            continue;
        }

        if (!$dry) {
            if (!@copy($src, $dst)) { die_with('No se ha podido copiar ' . $entry); }
        }
        $copiados++;
    }
}

foreach ($FILES as $f) {
    $src = MBB_REPO . '/' . $f;
    $dst = $WEB . '/' . $f;
    if (is_file($dst) && md5_file($dst) === md5_file($src)) { $saltados++; continue; }
    if (!$DRY && !@copy($src, $dst)) { die_with('No se ha podido copiar ' . $f); }
    $copiados++;
}

foreach ($DIRS as $d) {
    if (is_dir(MBB_REPO . '/' . $d)) {
        copiar(MBB_REPO . '/' . $d, $WEB . '/' . $d, $DRY);
    }
}

say(
    ($DRY ? 'ENSAYO: se copiarían ' : 'Copiados ') . $copiados . ' archivos, ' .
    $saltados . ' ya estaban iguales.'
);

if ($DRY) {
    say('Ensayo terminado. No se ha tocado nada.');
} else {
    say('Web actualizada en ' . $WEB);
    say('Recuerda: los expositores los repone sync.php, que debe ejecutarse después.');
}

flush_log();
