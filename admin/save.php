<?php
/**
 * SAVING FROM THE ADMINISTRATION PANEL
 * -----------------------------------------------------------------------------
 * Lets admin/index.html write the five data files straight to the server, so
 * publishing is a button rather than a download and an FTP client.
 *
 * It is off until configured. Copy admin-config-sample.php to admin-config.php
 * and set a password; without that file this script answers "not ready" and the
 * panel falls back to downloading the files.
 *
 * What it will do:
 *   · write, and only write, the five known files in assets/js/data/
 *   · keep the previous version of each as <name>.bak, so one mistake is
 *     undoable without a backup of the whole site
 *
 * What it will not do:
 *   · accept any other filename, at any path
 *   · accept content that does not look like the data files it is replacing
 *   · work without the password
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const DATA_DIR = __DIR__ . '/../assets/js/data';

// The only names that may be written. Anything else is refused, whatever it
// claims to be — this is what stops a request writing into the site at large.
const ALLOWED = [
    'site.js',
    'content.js',
    'programme.js',
    'exhibitors.js',
    'discover.js',
];

const MAX_BYTES = 4 * 1024 * 1024; // the largest data file is well under 1 MB

/** Configured password, or null when the panel has not been set up. */
function admin_token(): ?string
{
    $config = __DIR__ . '/admin-config.php';
    if (!is_file($config)) {
        return null;
    }
    $token = require $config;
    if (!is_string($token) || $token === '' || $token === 'CAMBIA-ESTA-CONTRASENA') {
        return null;
    }
    return $token;
}

function fail(string $message, int $status = 400): void
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

/* --- Is the panel allowed to save at all? --------------------------------- */

$token = admin_token();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    // Two separate conditions, reported separately. Whoever sets this up is
    // doing it on a server they cannot see into, and "not configured" without
    // saying which half is missing turns a two-minute job into an afternoon.
    $configured = $token !== null;
    $writable   = is_dir(DATA_DIR) && is_writable(DATA_DIR);

    echo json_encode([
        'ready'      => $configured && $writable,
        'configured' => $configured,
        'writable'   => $writable,
    ]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail('Método no permitido.', 405);
}

if ($token === null) {
    fail('El guardado directo no está configurado en el servidor.', 503);
}

/* --- The request ---------------------------------------------------------- */

$raw = file_get_contents('php://input', false, null, 0, MAX_BYTES * 2);
$body = json_decode((string) $raw, true);

if (!is_array($body)) {
    fail('La petición no es válida.');
}

// hash_equals compares in constant time, so a wrong password gives away
// nothing about how wrong it was.
if (!is_string($body['token'] ?? null) || !hash_equals($token, $body['token'])) {
    usleep(400000); // blunt the edge off guessing
    fail('Contraseña incorrecta.', 401);
}

$files = $body['files'] ?? null;
if (!is_array($files) || $files === []) {
    fail('No se ha enviado ningún archivo.');
}

/* --- Check everything before writing anything ----------------------------- */

$checked = [];

foreach ($files as $name => $content) {
    if (!is_string($name) || basename($name) !== $name || !in_array($name, ALLOWED, true)) {
        fail('Archivo no permitido.');
    }
    if (!is_string($content) || $content === '') {
        fail(sprintf('El contenido de %s está vacío.', $name));
    }
    if (strlen($content) > MAX_BYTES) {
        fail(sprintf('%s es demasiado grande.', $name));
    }
    // A data file assigns globals on window.MBB. Something that does not is not
    // one of these files, whatever its name says.
    if (strpos($content, 'window.MBB.') === false) {
        fail(sprintf('%s no tiene la forma de un archivo de datos.', $name));
    }
    $checked[$name] = $content;
}

if (!is_dir(DATA_DIR) || !is_writable(DATA_DIR)) {
    fail('El servidor no puede escribir en assets/js/data/.', 500);
}

/* --- Write ---------------------------------------------------------------- */

$written = [];

foreach ($checked as $name => $content) {
    $path = DATA_DIR . '/' . $name;

    // Keep the version being replaced. One step back is all anyone needs when
    // the mistake is noticed within the minute.
    if (is_file($path)) {
        @copy($path, $path . '.bak');
    }

    // Written beside the target and moved into place, so a request that dies
    // halfway cannot leave the site loading half a file.
    $temp = $path . '.tmp';
    if (file_put_contents($temp, $content, LOCK_EX) === false || !rename($temp, $path)) {
        @unlink($temp);
        fail(sprintf('No se ha podido escribir %s.', $name), 500);
    }

    $written[] = $name;
}

echo json_encode(['ok' => true, 'written' => $written], JSON_UNESCAPED_UNICODE);
