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
 * Y esa separación se cumple de verdad: los archivos que escribe el sync —la
 * lista, las fichas, los logotipos y el sitemap— este despliegue los copia solo
 * si no existen todavía, y a partir de ahí no los toca. Ver $DE_LA_PLATAFORMA.
 *
 * Durante un tiempo no fue así, y el efecto era desconcertante: el sync llenaba
 * el directorio y el siguiente despliegue lo vaciaba con la versión del
 * repositorio, que está vacía a propósito. La web enseñaba expositores diez
 * minutos de cada hora. Los dos registros decían que todo había ido bien,
 * porque cada uno había hecho su trabajo.
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

/**
 * A dónde se publica.
 *
 * Por defecto la carpeta pública de la cuenta. Pero mientras se prueba, la web
 * vive en una subcarpeta —www/pruebasbilbaoekintza26— y conviene poder apuntar
 * ahí sin mover el clon: el repositorio nunca debe estar dentro de la carpeta
 * pública, porque eso deja `.git` descargable desde internet y con él todo el
 * historial del proyecto.
 *
 * Se cambia con `web_dir` en config.php, o con --to en la línea de comandos.
 */
function web_root(array $conf, array $argv): string
{
    $i = array_search('--to', $argv, true);
    if ($i !== false && isset($argv[$i + 1])) {
        return rtrim($argv[$i + 1], '/');
    }
    if (!empty($conf['web_dir'])) {
        return rtrim($conf['web_dir'], '/');
    }

    $home = dirname(MBB_REPO);
    foreach ([$home . '/www', $home . '/public_html', $home . '/htdocs'] as $c) {
        if (is_dir($c)) { return $c; }
    }
    return '';
}

/** La configuración, si la hay. deploy.php funciona igual sin ella. */
function read_config(): array
{
    $home = dirname(MBB_REPO);
    foreach ([$home . '/config.php', MBB_REPO . '/server/config.php'] as $c) {
        if (is_file($c)) {
            $conf = require $c;
            if (is_array($conf)) { return $conf; }
        }
    }
    return [];
}

/**
 * Lo que se publica. Todo lo demás —documentación, herramientas, el historial
 * de git— se queda en el repositorio y no llega nunca a la carpeta pública.
 */
$FILES = ['index.html', 'platform.html', 'robots.txt', 'sitemap.xml'];
$DIRS  = ['assets', 'exhibitors', 'admin'];

/** Nunca se copia: la contraseña del panel vive en el servidor y solo ahí. */
$NEVER = ['admin-config.php', 'config.php', 'sync.log', '.DS_Store', 'panel.png'];

/**
 * Lo que manda la PLATAFORMA, no el repositorio.
 *
 * Estos son los archivos que escribe sync.php con lo que llega de Meetmaps, y
 * en el repositorio están vacíos a propósito: la lista de expositores, sus
 * páginas, sus logotipos y el sitemap que los enumera.
 *
 * Se copian solo si NO existen ya en la web —para que una instalación nueva
 * arranque con algo— y a partir de ahí no se tocan nunca más. Sin esto, cada
 * despliegue pisaba el trabajo del sync con la versión vacía del repositorio:
 * el directorio se llenaba a las y cinco y se vaciaba a las y cuarto, y así
 * todo el día. La cabecera de este archivo ya decía que la plataforma mandaba
 * sobre los expositores; esto es lo que hacía falta para que fuera verdad.
 */
$DE_LA_PLATAFORMA = [
    'sitemap.xml',
    'assets/js/data/exhibitors.js',
    'assets/js/data/exhibitors-local.json',
    'assets/img/exhibitors',
    'exhibitors',
];

/** ¿Este archivo lo escribe el sync? La ruta va relativa a la raíz de la web. */
function manda_la_plataforma(string $rel): bool
{
    global $DE_LA_PLATAFORMA;

    foreach ($DE_LA_PLATAFORMA as $suyo) {
        if ($rel === $suyo || strpos($rel, $suyo . '/') === 0) { return true; }
    }
    return false;
}

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

/* --- 1b. ¿Ha cambiado este mismo archivo? ----------------------------------
   PHP lee el script entero antes de ejecutarlo, así que la ejecución que se
   trae un cambio en deploy.php sigue corriendo con la versión vieja: la lista
   de lo que se publica, las reglas, todo. El cambio no surtía efecto hasta la
   vuelta siguiente, quince minutos después, sin que nada lo dijera.

   Pasó de verdad: se añadió platform.html a la lista, el despliegue se lo
   trajo al clon y no lo copió a la web. La página daba 404 y el registro decía
   que todo había ido bien.

   Así que si el pull ha tocado este archivo, se vuelve a ejecutar una sola vez
   —de ahí --reexec, que impide que se llame a sí mismo sin fin— y ya con la
   versión nueva. */

if ($antes !== $ahora && !in_array('--reexec', $argv, true)) {
    $tocados = (string) shell_exec(
        'git -C ' . escapeshellarg(MBB_REPO) . ' diff --name-only ' .
        escapeshellarg($antes) . ' ' . escapeshellarg($ahora) . ' 2>&1'
    );

    if (strpos($tocados, 'server/deploy.php') !== false) {
        say('Este mismo deploy.php ha cambiado; se repite con la versión nueva.');
        flush_log();

        $cmd = escapeshellarg(PHP_BINARY) . ' ' . escapeshellarg(__FILE__) . ' --reexec';
        foreach (array_slice($argv, 1) as $a) { $cmd .= ' ' . escapeshellarg($a); }

        passthru($cmd, $codigo);
        exit((int) $codigo);
    }
}

/* --- 2. Comprobar antes de copiar ------------------------------------------- */

$WEB = web_root(read_config(), $argv);
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

/* --- 3. Coger el turno ------------------------------------------------------ */
/* A partir de aquí se escribe en la carpeta pública, y sync.php escribe en la
   misma. Uno de los dos espera. El git pull de arriba no hace falta protegerlo:
   toca el repositorio, no la web. */

require __DIR__ . '/turno.php';

$TURNO = mbb_coger_turno('deploy', 'say');
if ($TURNO === false) {
    flush_log();
    exit(0);                       // No es un error: le toca al otro, ya volverá.
}

/* --- 4. Copiar -------------------------------------------------------------- */

$copiados = 0;
$saltados = 0;
$respetados = 0;   // los que escribe el sync y este despliegue no toca

function copiar(string $desde, string $hasta, bool $dry, string $rel = '')
{
    global $copiados, $saltados, $respetados, $NEVER;

    if (!is_dir($hasta) && !$dry) { @mkdir($hasta, 0755, true); }

    foreach (scandir($desde) as $entry) {
        if ($entry === '.' || $entry === '..') { continue; }
        if (in_array($entry, $NEVER, true)) { continue; }
        if (str_ends_with($entry, '.md')) { continue; }

        $src = $desde . '/' . $entry;
        $dst = $hasta . '/' . $entry;
        $ruta = $rel === '' ? $entry : $rel . '/' . $entry;

        if (is_dir($src)) {
            copiar($src, $dst, $dry, $ruta);
            continue;
        }

        // Lo que escribe el sync no se pisa, salvo que aún no exista.
        if (manda_la_plataforma($ruta) && is_file($dst)) {
            $respetados++;
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
    if (manda_la_plataforma($f) && is_file($dst)) { $respetados++; continue; }
    if (is_file($dst) && md5_file($dst) === md5_file($src)) { $saltados++; continue; }
    if (!$DRY && !@copy($src, $dst)) { die_with('No se ha podido copiar ' . $f); }
    $copiados++;
}

foreach ($DIRS as $d) {
    if (is_dir(MBB_REPO . '/' . $d)) {
        copiar(MBB_REPO . '/' . $d, $WEB . '/' . $d, $DRY, $d);
    }
}

say(
    ($DRY ? 'ENSAYO: se copiarían ' : 'Copiados ') . $copiados . ' archivos, ' .
    $saltados . ' ya estaban iguales' .
    ($respetados ? ', ' . $respetados . ' son de la plataforma y no se tocan' : '') . '.'
);

if ($DRY) {
    say('Ensayo terminado. No se ha tocado nada.');
} else {
    say('Web actualizada en ' . $WEB);
    say('Los expositores no se tocan: los escribe sync.php desde la plataforma.');
}

mbb_soltar_turno($TURNO);
flush_log();
