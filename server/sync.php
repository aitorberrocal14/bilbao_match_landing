<?php
/**
 * TRAE LOS EXPOSITORES DE MEETMAPS — versión para el servidor
 * -----------------------------------------------------------------------------
 * Consulta la plataforma, actualiza la lista de expositores, descarga los
 * logotipos nuevos, regenera la página de cada empresa y rehace el sitemap.
 *
 * Se ejecuta desde Servidor → Tareas programadas del panel del hosting:
 *
 *     php /home/matchbilbaobizkaia/www/server/sync.php
 *
 * Y se puede probar a mano sin tocar nada:
 *
 *     php .../server/sync.php --dry-run
 *     php .../server/sync.php --allow-shrink
 *
 * Y si la plataforma rechaza la petición, esto dice por qué —qué se le manda y
 * qué contesta, sin enseñar la clave:
 *
 *     php .../server/sync.php --dry-run --debug
 *
 * Y si lo que se quiere saber es si la clave sirve para algo, esto pregunta por
 * cada acción y dice cuáles acepta, sin escribir nada:
 *
 *     php .../server/sync.php --probe
 *
 * Por qué vive aquí y no en GitHub
 * --------------------------------
 * Porque la web tiene que seguir funcionando cuando la persona que la montó ya
 * no esté. Todo lo que necesita —la clave, el cron, los archivos— está en el
 * hosting de Bilbao Ekintza y no depende de ninguna cuenta personal.
 *
 * La clave
 * --------
 * En un archivo `config.php` que NO está dentro de la carpeta pública. Ver
 * config-sample.php. Un archivo .env en la web se puede descargar desde
 * internet; uno .php fuera de la raíz web, no.
 *
 * Lo que este archivo NO dibuja
 * -----------------------------
 * La cabecera y el pie los pega tal cual desde chrome.json, que los captura del
 * motor JavaScript del sitio. Así el diseño del armazón tiene una sola fuente y
 * no puede haber dos versiones que se separen.
 */

declare(strict_types=1);

/* --- Compatibilidad --------------------------------------------------------
   Este hosting tiene DOS versiones de PHP, y son distintas:

     · la web  (php-fpm) → 7.4
     · el cron (línea de comandos) → 7.0.33

   Esto se ejecuta desde el cron, así que manda la vieja. Todo lo que hay
   debajo está escrito para 7.0: nada de funciones flecha, ni tipos nullable,
   ni `void`. Las tres funciones de aquí abajo llegaron con PHP 8 y se definen
   si faltan, con function_exists, así que no estorban en versiones nuevas.

   Que funcione en 7.0 no significa que convenga quedarse ahí: ni 7.0 ni 7.4
   reciben parches de seguridad — 7.0 desde 2018, 7.4 desde 2022. En
   Servidor → PHP del panel se puede subir a 8.1, y el panel deja volver atrás
   si algo se tuerce. Aquí apenas hay PHP —este archivo y admin/save.php— así
   que el riesgo de subir es pequeño y el de quedarse no lo es. */

if (!function_exists('str_contains')) {
    function str_contains(string $h, string $n): bool { return $n === '' || strpos($h, $n) !== false; }
}
if (!function_exists('str_ends_with')) {
    function str_ends_with(string $h, string $n): bool { return $n === '' || substr($h, -strlen($n)) === $n; }
}
if (!function_exists('array_is_list')) {
    function array_is_list(array $a): bool { return $a === [] || array_keys($a) === range(0, count($a) - 1); }
}

/* --- Dónde está todo -------------------------------------------------------
   Esto no puede darse por hecho, y era un error real: `dirname(__DIR__)` es la
   carpeta que contiene a `server/`, que es la web SOLO si este archivo está
   dentro de la web. Cuando se ejecuta desde el clon del repositorio —que es lo
   normal— esa carpeta es el clon, no la web publicada.

   Escribir ahí habría tenido dos efectos, los dos malos: los expositores no
   habrían aparecido nunca en la web, y el clon habría quedado modificado, con
   lo que `git pull --ff-only` fallaría desde entonces y el despliegue se
   rompería. Así que la carpeta pública se resuelve igual que en deploy.php:
   del config primero, detectada después, y solo al final por vecindad. */

define('MBB_HERE', __DIR__);

/** Busca config.php subiendo desde aquí; devuelve [] si no hay. */
function mbb_find_config()
{
    $dir = MBB_HERE;
    for ($i = 0; $i < 5; $i++) {
        $c = $dir . '/config.php';
        if (is_file($c)) {
            $conf = require $c;
            if (is_array($conf)) { return $conf; }
        }
        $parent = dirname($dir);
        if ($parent === $dir) { break; }
        $dir = $parent;
    }
    return [];
}

$MBB_CONF = mbb_find_config();

/** La carpeta pública: la del config, la que se llame `www`, o la vecina. */
function mbb_web_root(array $conf)
{
    if (!empty($conf['web_dir']) && is_dir($conf['web_dir'])) {
        return rtrim($conf['web_dir'], '/');
    }
    $dir = MBB_HERE;
    for ($i = 0; $i < 5; $i++) {
        foreach (['/www', '/public_html', '/htdocs'] as $n) {
            if (is_dir($dir . $n)) { return $dir . $n; }
        }
        $parent = dirname($dir);
        if ($parent === $dir) { break; }
        $dir = $parent;
    }
    return dirname(MBB_HERE);
}

define('MBB_WEB', mbb_web_root($MBB_CONF));                // la carpeta pública
define('MBB_DATA', MBB_WEB . '/assets/js/data/exhibitors.js');
define('MBB_LOCAL', MBB_WEB . '/assets/js/data/exhibitors-local.json');
define('MBB_LOGOS', MBB_WEB . '/assets/img/exhibitors');
define('MBB_PAGES', MBB_WEB . '/exhibitors');
define('MBB_CHROME', __DIR__ . '/chrome.json');

$argv = $argv ?? [];
$DRY = in_array('--dry-run', $argv, true);
$ALLOW_SHRINK = in_array('--allow-shrink', $argv, true);

// Cuenta en voz alta qué se le manda a la plataforma y qué contesta. Cuando
// Meetmaps rechaza la petición dice sólo "Request invalid", que no distingue
// entre una clave que no vale, un evento que no es y un formato que no espera.
// Con esto se ve cuál de las tres es. La clave nunca se imprime: sólo cuánto
// mide y sus cuatro últimos caracteres, que basta para saber si es la que se
// pegó en config.php o se coló un espacio al copiarla.
$DEBUG = in_array('--debug', $argv, true);

// Pregunta a la plataforma por varias acciones y dice cuáles acepta. Sirve
// para separar dos cosas que se confunden: una clave que no vale de una clave
// que vale pero no tiene permiso para la acción que se le está pidiendo. No
// escribe nada, ni en la web ni en el registro más allá del veredicto.
$PROBE = in_array('--probe', $argv, true);

// Repite una respuesta guardada en lugar de llamar a la plataforma. Sirve para
// probar todo el recorrido —incluido lo que escribe y dónde— sin gastar una
// llamada a la API ni depender de que la plataforma esté disponible.
$FIXTURE = null;
$i_fix = array_search('--fixture', $argv, true);
if ($i_fix !== false && isset($argv[$i_fix + 1])) {
    $FIXTURE = $argv[$i_fix + 1];
}

/* --- Salida ---------------------------------------------------------------- */

$LOG = [];

function say($line)
{
    global $LOG;
    $stamped = date('Y-m-d H:i:s') . '  ' . $line;
    $LOG[] = $stamped;
    if (PHP_SAPI === 'cli') {
        echo $stamped, PHP_EOL;
    }
}

function die_with($message)
{
    say('ERROR: ' . $message);
    flush_log();
    exit(1);
}

function flush_log()
{
    global $LOG;
    // Junto al script, no dentro de la web: cuando esto corre desde el clon,
    // MBB_WEB es la carpeta publicada y crear un `server/` ahí dejaría el
    // registro descargable desde internet.
    $file = MBB_HERE . '/sync.log';
    // Solo las últimas 200 líneas: un registro que crece sin límite acaba
    // siendo un problema en lugar de una ayuda.
    $old = is_file($file) ? array_slice(file($file, FILE_IGNORE_NEW_LINES), -200) : [];
    @file_put_contents($file, implode("\n", array_merge($old, $LOG)) . "\n");
}

/* --- Ayudas ---------------------------------------------------------------- */

/** Lo mismo que el `esc` del sitio: escapa & < > " y deja las comillas simples. */
function esc($s): string
{
    return htmlspecialchars((string) ($s ?? ''), ENT_COMPAT, 'UTF-8');
}

/** Quita los acentos. Con intl si está; si no, con una tabla. */
function fold(string $s): string
{
    if (class_exists('Normalizer')) {
        $s = Normalizer::normalize($s, Normalizer::FORM_D);
        return preg_replace('/\p{Mn}/u', '', $s) ?? $s;
    }
    $from = ['á','à','ä','â','ã','å','é','è','ë','ê','í','ì','ï','î','ó','ò','ö','ô','õ','ú','ù','ü','û','ñ','ç',
             'Á','À','Ä','Â','Ã','Å','É','È','Ë','Ê','Í','Ì','Ï','Î','Ó','Ò','Ö','Ô','Õ','Ú','Ù','Ü','Û','Ñ','Ç'];
    $to   = ['a','a','a','a','a','a','e','e','e','e','i','i','i','i','o','o','o','o','o','u','u','u','u','n','c',
             'A','A','A','A','A','A','E','E','E','E','I','I','I','I','O','O','O','O','O','U','U','U','U','N','C'];
    return str_replace($from, $to, $s);
}

/** La clave por la que busca el directorio. Igual que MBB.searchKey. */
function search_key($s): string
{
    return fold(mb_strtolower((string) ($s ?? ''), 'UTF-8'));
}

/** El identificador por el que se direcciona una ficha. Igual que slugify. */
function slugify($name): string
{
    $s = fold((string) ($name ?? ''));
    $s = mb_strtolower($s, 'UTF-8');
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-');
}

/** Un literal de cadena de JavaScript, con comillas simples. Igual que quote(). */
function js_quote($s): string
{
    $s = (string) ($s ?? '');
    return "'" . str_replace(["\\", "'"], ["\\\\", "\\'"], $s) . "'";
}

/* --- 1. La respuesta de la plataforma -------------------------------------- */

function load_config(): array
{
    global $MBB_CONF, $FIXTURE;

    // Meetmaps a su clave la llama user_key. Aquí se aceptan los dos nombres,
    // porque config.php se escribió pidiendo api_key y no tiene sentido que un
    // archivo que ya funciona deje de funcionar por cambiarle el nombre a una
    // línea. user_key manda si están las dos.
    $clave = '';
    if (!empty($MBB_CONF['user_key'])) {
        $clave = (string) $MBB_CONF['user_key'];
    } elseif (!empty($MBB_CONF['api_key'])) {
        $clave = (string) $MBB_CONF['api_key'];
    }

    if ($FIXTURE === null && $clave === '') {
        die_with(
            'No hay configuración, o le falta la clave. En config.php debe haber ' .
            "una línea 'user_key' => '...' con la clave de Meetmaps (también vale " .
            "el nombre antiguo 'api_key'). El archivo va en la carpeta de la " .
            'cuenta, fuera de la web — ver server/config-sample.php.'
        );
    }

    return ['user_key' => $clave] + $MBB_CONF + [
        'api_url'  => 'https://apiv1.meetmaps.com/api/v1/',
        'event_id' => 15425,
    ];
}

function fetch_exhibitors(array $conf): array
{
    global $FIXTURE;
    if ($FIXTURE !== null) {
        if (!is_file($FIXTURE)) { die_with('No existe ' . $FIXTURE); }
        say('Repitiendo ' . $FIXTURE);
        $j = json_decode((string) file_get_contents($FIXTURE), true);
        if (!is_array($j)) { die_with('El fixture no es JSON válido.'); }
        return $j;
    }

    global $DEBUG;

    $campos = [
        'action'   => 'exhibitor_get_all',
        'event_id' => (int) $conf['event_id'],
        'user_key' => (string) $conf['user_key'],
    ];

    // El formulario va primero, y no por casualidad. Enviando lo mismo de las
    // dos maneras, la plataforma contesta cosas distintas:
    //
    //   JSON        → 1 Request invalid   (ni encuentra los campos)
    //   formulario  → 2 Unauthorized      (los lee, y rechaza la credencial)
    //
    // Es decir: lo que entiende es el formulario. El JSON se queda de reserva
    // por si algún día cambian de opinión, pero probándolo primero lo único
    // que se conseguía era que el registro enseñara el error inútil en vez del
    // que dice la verdad.
    $intentos = [
        ['nombre' => 'formulario', 'cuerpo' => http_build_query($campos),
         'cabeceras' => ['Content-Type: application/x-www-form-urlencoded', 'Accept: application/json']],
        ['nombre' => 'JSON', 'cuerpo' => json_encode($campos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
         'cabeceras' => ['Content-Type: application/json', 'Accept: application/json']],
    ];

    if ($DEBUG) {
        say('  URL:      ' . $conf['api_url']);
        say('  evento:   ' . (int) $conf['event_id']);
        say('  clave:    ' . mbb_pista_clave((string) $conf['user_key']));
    }

    $fallos = [];

    foreach ($intentos as $n => $intento) {
        $r = mbb_llamar($conf['api_url'], $intento['cuerpo'], $intento['cabeceras']);
        $body = $r['body'];
        $code = $r['code'];
        $err  = $r['err'];

        if ($body === false) {
            // Esto no es que la petición no guste: es que no se llega. Probar
            // el otro formato no arreglaría nada.
            die_with('No se ha podido contactar con la plataforma: ' . $err);
        }

        if ($DEBUG) {
            say('  intento ' . ($n + 1) . ' (' . $intento['nombre'] . '): HTTP ' . $code);
            say('  respuesta: ' . mbb_resumen_respuesta((string) $body));
        }

        $json = json_decode((string) $body, true);
        if (!is_array($json)) { $json = null; }

        // Buena: se devuelve y se deja dicho con qué formato, que es el dato
        // que hace falta para simplificar esto luego.
        if ($code >= 200 && $code < 300 && $json !== null && empty($json['error']['code'])) {
            if ($n > 0) {
                say('La plataforma aceptó la petición como ' . $intento['nombre'] .
                    ', no como ' . $intentos[0]['nombre'] . '.');
            }
            return $json;
        }

        // Una credencial rechazada no es un formato rechazado, y confundirlas
        // manda a buscar donde no es. Si la plataforma ha entendido la
        // petición y lo que no acepta es la clave, se para aquí: probar el
        // otro formato no va a cambiar nada y sólo enturbia el registro.
        $mensaje = ($json !== null && isset($json['error']['message']))
            ? (string) $json['error']['message'] : '';
        if ($json !== null && !empty($json['error']['code']) && mbb_es_credencial($mensaje)) {
            die_with(
                'La plataforma entendió la petición y rechazó la clave: "' . $mensaje . '". ' .
                'Así que ni el formato ni el evento (' . (int) $conf['event_id'] . ') son el ' .
                'problema. Pídele a Meetmaps una user_key habilitada para ese evento y para ' .
                'la acción exhibitor_get_all, de solo lectura.'
            );
        }

        // Se guardan los dos, no solo el primero: cuando los formatos fallan
        // por motivos distintos, el segundo suele ser el que dice la verdad,
        // y en el cron no hay nadie mirando para volver a lanzarlo con --debug.
        if ($json !== null && !empty($json['error']['code'])) {
            $fallos[] = $intento['nombre'] . ' → ' . $json['error']['code'] . ' ' .
                (isset($json['error']['message']) ? $json['error']['message'] : '');
        } elseif ($code < 200 || $code >= 300) {
            $fallos[] = $intento['nombre'] . ' → HTTP ' . $code;
        } else {
            $fallos[] = $intento['nombre'] . ' → no devolvió JSON';
        }
    }

    die_with(
        'La plataforma rechazó la petición en los dos formatos (' .
        implode('; ', $fallos) . '). No es el formato, entonces: o la clave no vale ' .
        'para este evento, o el evento no es el ' . (int) $conf['event_id'] . ', o la ' .
        'clave todavía no está activa. Ejecútalo con --debug para ver el detalle.'
    );
}

/** Una llamada a la plataforma. Devuelve ['body'=>…, 'code'=>…, 'err'=>…]. */
function mbb_llamar($url, $cuerpo, array $cabeceras)
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $cuerpo,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 60,
        CURLOPT_HTTPHEADER     => $cabeceras,
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    return ['body' => $body, 'code' => $code, 'err' => $err];
}

/**
 * Lo que se puede escribir en un registro sin cometer una imprudencia.
 *
 * Un error se imprime entero, porque no lleva datos de nadie y es justo lo que
 * hace falta leer. Una respuesta CON registros no se imprime nunca: en cuanto
 * se consulta la acción de asistentes, esos registros llevan nombres, apellidos,
 * correos y teléfonos de personas. Un archivo de registro se lee, se descarga
 * y se pega en un correo o en un chat sin pensarlo, y ahí ya no hay vuelta
 * atrás. Así que de una respuesta con datos solo sale cuántos son.
 */
function mbb_resumen_respuesta($body)
{
    $json = json_decode((string) $body, true);
    if (!is_array($json)) {
        return 'no es JSON: ' . mbb_recorta((string) $body, 200);
    }

    $n = mbb_cuantos_registros($json);
    if ($n === null) {
        return mbb_recorta((string) $body, 400);          // sin registros: es un error
    }

    return $n . ' registros (contenido omitido a propósito: puede llevar datos personales)';
}

/** Cuántos registros trae una respuesta, o null si no trae ninguna lista. */
function mbb_cuantos_registros(array $json)
{
    if (isset($json['results']) && is_array($json['results'])) {
        return count($json['results']);                    // attendee_get_all
    }
    if (isset($json['body']['exhibitors']) && is_array($json['body']['exhibitors'])) {
        return count($json['body']['exhibitors']);         // exhibitor_get_all
    }
    return null;
}

/** ¿La plataforma se está quejando de la credencial y no de la petición? */
function mbb_es_credencial($mensaje)
{
    $m = strtolower($mensaje);
    foreach (['unauthorized', 'user key', 'user_key', 'forbidden', 'permission', 'token'] as $pista) {
        if (strpos($m, $pista) !== false) { return true; }
    }
    return false;
}

/** Cuánto mide la clave y cómo acaba. Nunca la clave. */
function mbb_pista_clave($clave)
{
    $n = strlen($clave);
    if ($n === 0) { return 'vacía'; }
    $aviso = trim($clave) === $clave ? '' : '  ← OJO: lleva espacios al principio o al final';
    return $n . ' caracteres, acaba en "' . substr($clave, -4) . '"' . $aviso;
}

/** Recorta una respuesta larga para que quepa en el registro. */
function mbb_recorta($texto, $max)
{
    $texto = preg_replace('/\s+/', ' ', trim($texto));
    return strlen($texto) > $max ? substr($texto, 0, $max) . ' […]' : $texto;
}

/**
 * Deliberadamente desconfiado: esto se ejecuta solo, y una respuesta rara que
 * se interprete como "no hay expositores" vaciaría el directorio del evento.
 */
function read_response(array $payload): array
{
    if (!empty($payload['error']['code'])) {
        die_with(
            'La plataforma rechazó la petición: ' . $payload['error']['code'] . ' ' .
            ($payload['error']['message'] ?? '')
        );
    }

    $list = $payload['body']['exhibitors'] ?? null;
    if (is_array($list) && !array_is_list($list)) {
        $list = array_values($list);
    }
    if (!is_array($list)) {
        die_with('La respuesta no traía la lista de expositores (body.exhibitors).');
    }
    return $list;
}

/** El texto en inglés, o el que haya. Devuelve párrafos ya limpios de HTML. */
function description_of(array $entry): array
{
    $all = is_array($entry['description'] ?? null) ? $entry['description'] : [];

    $pick = null;
    foreach ($all as $d) {
        if (preg_match('/^en/i', (string) ($d['lang'] ?? ''))) { $pick = $d; break; }
    }
    if ($pick === null) {
        foreach ($all as $d) {
            if (trim((string) ($d['description'] ?? '')) !== '') { $pick = $d; break; }
        }
    }

    $text = $pick ? (string) ($pick['description'] ?? '') : '';
    $text = preg_replace('/<br\s*\/?>/i', "\n", $text) ?? $text;
    $text = preg_replace('/<\/p>/i', "\n", $text) ?? $text;
    $text = preg_replace('/<[^>]+>/', '', $text) ?? $text;
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

    $out = [];
    foreach (preg_split('/\n+/', $text) ?: [] as $p) {
        $p = trim($p);
        if ($p !== '') { $out[] = $p; }
    }
    return $out;
}

/* --- 2. La mitad local ------------------------------------------------------ */

function read_local(): array
{
    if (!is_file(MBB_LOCAL)) { return []; }
    $j = json_decode((string) file_get_contents(MBB_LOCAL), true);
    return is_array($j) ? $j : [];
}

/**
 * Busca la ficha local en tres pasadas:
 *   1. por el id de la plataforma, una vez fijado — inmune a que la renombren;
 *   2. por el identificador derivado del nombre, que es como encaja la mayoría;
 *   3. por el nombre guardado localmente, porque no todos los identificadores
 *      salieron de su nombre: uno arrastra una errata que está viva en una URL
 *      publicada, y esas URLs no son nuestras para romperlas.
 */
function local_for(array $local, array $entry, string $slug): array
{
    $keys = array_values(array_filter(array_keys($local), function ($k) { return $k[0] !== '_'; }));
    $id = (string) ($entry['id_exhibitor'] ?? '');

    foreach ($keys as $k) {
        if (isset($local[$k]['apiId']) && (string) $local[$k]['apiId'] === $id) {
            return ['key' => $k, 'record' => $local[$k], 'pinned' => true];
        }
    }
    if (isset($local[$slug])) {
        return ['key' => $slug, 'record' => $local[$slug], 'pinned' => false];
    }
    foreach ($keys as $k) {
        if (!empty($local[$k]['name']) && slugify($local[$k]['name']) === $slug) {
            return ['key' => $k, 'record' => $local[$k], 'pinned' => false];
        }
    }
    return ['key' => $slug, 'record' => null, 'pinned' => false];
}

/* --- 3. Logotipos ----------------------------------------------------------- */

function fetch_logo($url, $slug, $dry)
{
    if (!$url || !preg_match('#^https?://#i', $url)) { return null; }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT        => 60,
    ]);
    $data = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $type = strtolower((string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE));
    curl_close($ch);

    if ($data === false || $code < 200 || $code >= 300) {
        say('  ! logotipo ' . $slug . ': ' . $code);
        return null;
    }

    $ext = str_contains($type, 'png') ? '.png'
        : (str_contains($type, 'svg') ? '.svg'
        : (str_contains($type, 'webp') ? '.webp' : '.jpg'));

    $file = $slug . $ext;
    $full = MBB_LOGOS . '/' . $file;

    if (is_file($full) && file_get_contents($full) === $data) {
        return $file; // sin cambios
    }
    if (!$dry) {
        if (!is_dir(MBB_LOGOS)) { @mkdir(MBB_LOGOS, 0755, true); }
        file_put_contents($full, $data);
    }
    return $file;
}

/** El logotipo que ya hay para este identificador, con la extensión que sea. */
function existing_logo($slug)
{
    if (!is_dir(MBB_LOGOS)) { return null; }
    foreach (scandir(MBB_LOGOS) ?: [] as $f) {
        if (preg_replace('/\.[^.]+$/', '', $f) === $slug && $f !== $slug) {
            return $f;
        }
    }
    return null;
}

/* --- 4. Escribir exhibitors.js ---------------------------------------------- */

function render_data(array $exhibitors, array $categories): string
{
    $blocks = [];
    foreach ($exhibitors as $x) {
        $out = [
            '  {',
            '    id: ' . js_quote($x['id']) . ',',
            '    name: ' . js_quote($x['name']) . ',',
            '    category: ' . js_quote($x['category']) . ',',
            '    logo: ' . js_quote($x['logo']) . ',',
        ];
        foreach (['contactName', 'contactRole', 'email', 'phone', 'website', 'websiteLabel', 'address'] as $k) {
            $out[] = '    ' . $k . ': ' . js_quote($x[$k]) . ',';
        }
        if (!empty($x['social'])) {
            $out[] = '    social: {';
            $keys = array_keys($x['social']);
            foreach ($keys as $i => $k) {
                $out[] = '      ' . $k . ': ' . js_quote($x['social'][$k]) .
                    ($i === count($keys) - 1 ? '' : ',');
            }
            $out[] = '    },';
        }
        $out[] = '    paragraphs: [';
        $out[] = implode(",\n", array_map(function ($p) { return '      ' . js_quote($p); }, $x['paragraphs']));
        $out[] = '    ]';
        $out[] = '  }';
        $blocks[] = implode("\n", $out);
    }

    // Una categoría por línea, como en el archivo escrito a mano. Además de
    // leerse mejor, evita un problema real: escritas en varias líneas, sus
    // `id:` quedaban a la misma sangría que los de los expositores, y todo lo
    // que cuenta expositores buscando `^    id: ` contaba cuatro de más.
    $lineas = [];
    foreach ($categories as $c) {
        $lineas[] = '  { id: ' . js_quote($c['id']) . ', label: ' . js_quote($c['label']) . ' }';
    }
    $cats = "[\n" . implode(",\n", $lineas) . "\n]";

    return "/* =============================================================================\n"
        . "   EXHIBITORS\n"
        . "   -----------------------------------------------------------------------------\n"
        . "   GENERADO — no editar a mano.\n"
        . "\n"
        . "   Lo escribe server/sync.php desde la plataforma del evento. Lo que la\n"
        . "   plataforma no trae —la categoría, la persona de contacto, la dirección\n"
        . "   postal— sale de assets/js/data/exhibitors-local.json, que es el archivo\n"
        . "   que sí se edita; el sync lo pega encima y nunca lo pisa.\n"
        . "\n"
        . "   Última sincronización: " . date('Y-m-d') . "\n"
        . "   ========================================================================== */\n"
        . "\n"
        . "window.MBB = window.MBB || {};\n"
        . "\n"
        . "/* Categories as on the original site */\n"
        . "window.MBB.exhibitorCategories = " . $cats . ";\n\n"
        . "window.MBB.exhibitors = [\n"
        . implode(",\n", $blocks)
        . "\n];\n";
}

/* --- 5. Dibujar las fichas -------------------------------------------------- */

function chrome(): array
{
    if (!is_file(MBB_CHROME)) {
        die_with('Falta server/chrome.json, que lleva la cabecera y el pie.');
    }
    $c = json_decode((string) file_get_contents(MBB_CHROME), true);
    if (!is_array($c) || empty($c['header']) || empty($c['footer']) || empty($c['icons'])) {
        die_with('server/chrome.json no tiene la forma esperada.');
    }
    return $c;
}

/** Cuatro empresas más, prefiriendo la misma categoría — como en el sitio. */
function related_to(array $exhibitors, int $i): array
{
    $x = $exhibitors[$i];
    $same = []; $rest = [];
    foreach ($exhibitors as $o) {
        if ($o['id'] === $x['id']) { continue; }
        if ($o['category'] === $x['category']) { $same[] = $o; } else { $rest[] = $o; }
    }
    $pool = array_merge($same, $rest);
    if (!$pool) { return []; }

    $out = [];
    for ($k = 0; $k < 4; $k++) {
        $out[] = $pool[($i + $k) % count($pool)];
    }
    return $out;
}

/** Igual que MBB.ExhibitorTile. */
function tile(array $x, string $base): string
{
    $letters = preg_replace('/[^A-Za-z\s]/', '', $x['name']) ?? '';
    $words = array_values(array_filter(preg_split('/\s+/', $letters) ?: []));
    $initials = '';
    foreach (array_slice($words, 0, 2) as $w) {
        $initials .= strtoupper($w[0]);
    }

    $logo = $x['logo']
        ? '<img src="' . esc($base . $x['logo']) . '" alt="' . esc($x['name']) . '" loading="lazy" '
          . 'data-fallback="mark" data-initials="' . esc($initials) . '">'
        : '<span class="logo-tile__mark">' . esc($initials) . '</span>';

    $key = search_key($x['name'] . ' ' . ($x['websiteLabel'] ?: $x['website']));

    return '<a class="logo-tile" href="' . esc($base) . 'exhibitors/' . esc($x['id']) . '.html" '
        . 'data-category="' . esc($x['category']) . '" '
        . 'data-name="' . esc($key) . '" '
        . 'title="' . esc($x['name']) . '">'
        . $logo
        . '<span class="logo-tile__name">' . esc($x['name']) . '</span>'
        . '</a>';
}

/** Igual que MBB.ExhibitorPage. */
function exhibitor_body(array $x, array $categories, array $related, string $base, array $icons): string
{
    $cat = null;
    foreach ($categories as $c) {
        if ($c['id'] === $x['category']) { $cat = $c; break; }
    }

    $candidates = [
        ['icon' => 'badge',     'text' => $x['contactName'], 'href' => ''],
        ['icon' => 'briefcase', 'text' => $x['contactRole'], 'href' => ''],
        ['icon' => 'mail',      'text' => $x['email'],       'href' => $x['email'] ? 'mailto:' . $x['email'] : ''],
        ['icon' => 'phone',     'text' => $x['phone'],       'href' => $x['phone'] ? 'tel:' . preg_replace('/\s/', '', $x['phone']) : ''],
        ['icon' => 'link',      'text' => $x['websiteLabel'] ?: $x['website'], 'href' => $x['website']],
        ['icon' => 'pin',       'text' => $x['address'],     'href' => ''],
    ];

    $rows = '';
    foreach ($candidates as $r) {
        if (!$r['text']) { continue; }
        $value = $r['href']
            ? '<a href="' . esc($r['href']) . '"'
              . (preg_match('/^https?:/', $r['href']) ? ' target="_blank" rel="noopener"' : '') . '>'
              . esc($r['text']) . '</a>'
            : esc($r['text']);
        $rows .= '<li>' . $icons[$r['icon']] . '<span>' . $value . '</span></li>';
    }

    $body = '';
    foreach ($x['paragraphs'] as $p) { $body .= '<p>' . esc($p) . '</p>'; }

    $tiles = '';
    foreach ($related as $r) { $tiles .= tile($r, $base); }

    return '<div class="shell ex-page">'
        . '<h1 class="h-1 ex-page__title">' . esc($x['name']) . '</h1>'
        . '<div class="ex-head">'
        . '<div>'
        . ($x['logo']
            ? '<img class="ex-head__logo" src="' . esc($base . $x['logo']) . '" alt="' . esc($x['name']) . ' logo">'
            : '<div class="ph" style="aspect-ratio:1/1">[Insert logo]</div>')
        . '<p class="ex-head__cat">' . esc($cat ? $cat['label'] : $x['category']) . '</p>'
        . '</div>'
        . '<ul class="ex-contact">' . $rows . '</ul>'
        . '</div>'
        . '<div class="ex-body text-justify">' . $body . '</div>'
        . '<p class="ex-more"><a class="link-red" href="' . esc($base) . 'index.html#exhibitors">See more exhibitors &gt; &gt;</a></p>'
        . '</div>'
        . '<div class="shell shell--wide"><div class="ex-related">' . $tiles . '</div></div>'
        . '<div class="ex-back"><a class="btn btn--outline btn--sm" href="' . esc($base) . 'index.html#exhibitors">Back to the directory</a></div>';
}

function exhibitor_page(array $x, array $categories, array $related, array $c): string
{
    $base = $c['base'];
    $description = str_replace('"', "'", mb_substr($x['paragraphs'][0] ?? '', 0, 180, 'UTF-8'));

    return "<!DOCTYPE html>\n"
        . "<html lang=\"en\">\n"
        . "<head>\n"
        . "  <meta charset=\"utf-8\">\n"
        . "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
        . '  <title>' . esc($x['name']) . " — Match Bilbao Bizkaia 2026</title>\n"
        . '  <meta name="description" content="' . esc($description) . "\">\n"
        . "  <meta name=\"theme-color\" content=\"#ae0000\">\n"
        . '  <link rel="icon" href="' . $base . "assets/img/brand/bilbao-bizkaia.png\">\n"
        . "  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n"
        . "  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n"
        . "  <link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap\">\n"
        . '  <link rel="stylesheet" href="' . $base . "assets/css/styles.css\">\n"
        . "</head>\n"
        . "<body>\n"
        . "  <a class=\"skip-link\" href=\"#main\">Skip to content</a>\n"
        . "\n"
        . '  <header class="header" id="header" data-menu="closed">' . $c['header'] . "</header>\n"
        . "\n"
        . "  <main id=\"main\">\n"
        . '    ' . exhibitor_body($x, $categories, $related, $base, $c['icons']) . "\n"
        . "  </main>\n"
        . "\n"
        . '  <footer class="footer" id="footer">' . $c['footer'] . "</footer>\n"
        . "\n"
        . '  <script src="' . $base . "assets/js/data/site.js\"></script>\n"
        . '  <script src="' . $base . "assets/js/components.js\"></script>\n"
        . '  <script src="' . $base . "assets/js/main.js\"></script>\n"
        . "</body>\n"
        . "</html>\n";
}

/* --- 6. Sitemap ------------------------------------------------------------- */

function write_sitemap(array $exhibitors, $site)
{
    $today = date('Y-m-d');
    $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
        . "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n"
        . "  <url>\n    <loc>" . $site . "</loc>\n    <lastmod>" . $today . "</lastmod>\n"
        . "    <priority>1.0</priority>\n  </url>\n";
    foreach ($exhibitors as $x) {
        $xml .= "  <url>\n    <loc>" . $site . 'exhibitors/' . rawurlencode($x['id']) . ".html</loc>\n"
            . "    <lastmod>" . $today . "</lastmod>\n    <priority>0.7</priority>\n  </url>\n";
    }
    $xml .= "</urlset>\n";
    file_put_contents(MBB_WEB . '/sitemap.xml', $xml);
}

/* --- Sondeo ----------------------------------------------------------------- */

/**
 * Llama a varias acciones con la misma clave y cuenta qué contesta cada una.
 *
 * Es la única manera de distinguir "la clave no vale" de "la clave vale pero no
 * para esto": las dos cosas se contestan igual, con un Unauthorized, y llevan a
 * sitios distintos. Si una acción pasa y otra no, el problema son los permisos
 * de la clave y no la clave.
 *
 * De las respuestas solo sale el veredicto y CUÁNTOS registros hay. Nunca el
 * contenido: la acción de asistentes devuelve nombres, correos y teléfonos de
 * personas, y un archivo de registro acaba pegado en un correo.
 */
function probe(array $conf)
{
    $acciones = ['exhibitor_get_all', 'attendee_get_all'];

    say('Sondeo: se pregunta por cada acción y no se escribe nada.');
    say('  evento: ' . (int) $conf['event_id'] .
        ' · clave: ' . mbb_pista_clave((string) $conf['user_key']));

    $alguna = false;

    foreach ($acciones as $accion) {
        $cuerpo = http_build_query([
            'action'   => $accion,
            'event_id' => (int) $conf['event_id'],
            'user_key' => (string) $conf['user_key'],
        ]);

        $r = mbb_llamar($conf['api_url'], $cuerpo, [
            'Content-Type: application/x-www-form-urlencoded',
            'Accept: application/json',
        ]);

        if ($r['body'] === false) {
            say('  ' . $accion . ' → no se ha podido contactar: ' . $r['err']);
            continue;
        }

        $json = json_decode((string) $r['body'], true);
        if (!is_array($json)) {
            say('  ' . $accion . ' → HTTP ' . $r['code'] . ', no devolvió JSON');
            continue;
        }

        if (!empty($json['error']['code'])) {
            say('  ' . $accion . ' → RECHAZADA: ' . $json['error']['code'] . ' ' .
                (isset($json['error']['message']) ? $json['error']['message'] : ''));
            continue;
        }

        $n = mbb_cuantos_registros($json);
        $alguna = true;
        say('  ' . $accion . ' → ACEPTADA, ' .
            ($n === null ? 'sin lista de registros' : $n . ' registros'));
    }

    say($alguna
        ? 'La clave sirve. Si una acción pasa y otra no, es cuestión de permisos ' .
          'de la clave, no de la clave.'
        : 'Ninguna acción pasa: entonces es la clave, no los permisos por acción.');

    flush_log();
    exit(0);
}

/* --- Principal -------------------------------------------------------------- */

$conf = load_config();

if ($PROBE) { probe($conf); }

say($DRY ? 'Ensayo: no se escribirá nada.' : 'Sincronizando desde la plataforma.');

$raw = read_response(fetch_exhibitors($conf));

/* El turno se coge aquí: después de hablar con la plataforma, que puede tardar,
   y antes de escribir nada. Así el deploy no se queda esperando por una llamada
   de red. En ensayo no hace falta, porque no se escribe. */
require __DIR__ . '/turno.php';

$TURNO = true;
if (!$DRY) {
    $TURNO = mbb_coger_turno('sync', 'say');
    if ($TURNO === false) {
        flush_log();
        exit(0);                   // Le toca al deploy. Volvemos en la siguiente.
    }
}

$local = read_local();
$categories = $local['_categories'] ?? [
    ['id' => 'all',           'label' => 'All'],
    ['id' => 'accommodation', 'label' => 'Accommodation'],
    ['id' => 'dmc',           'label' => 'DMC'],
    ['id' => 'activities',    'label' => 'Unique Activities'],
];
$known = array_column($categories, 'id');

$visible = array_values(array_filter($raw, function ($e) { return !((int) (isset($e['hidden']) ? $e['hidden'] : 0)); }));
usort($visible, function ($a, $b) {
    $x = (int) (isset($a['sort']) ? $a['sort'] : 0);
    $y = (int) (isset($b['sort']) ? $b['sort'] : 0);
    return $x <=> $y;
});

$exhibitors = [];
$uncategorised = [];
$pinned = [];

foreach ($visible as $entry) {
    $name = trim((string) ($entry['name'] ?? ''));
    if ($name === '') { continue; }

    $slug = slugify($name);
    $found = local_for($local, $entry, $slug);
    $rec = $found['record'] ?? [];
    $id = $rec['slug'] ?? ($found['key'] ?: $slug);

    if ($found['record'] && !$found['pinned']) {
        $pinned[] = $id;
        $rec['apiId'] = $entry['id_exhibitor'] ?? null;
        $local[$found['key']] = $rec;
    }

    $logo = fetch_logo($entry['logo'] ?? null, $id, $DRY) ?? existing_logo($id);

    $category = in_array($rec['category'] ?? '', $known, true) ? $rec['category'] : '';
    if ($category === '') { $uncategorised[] = $name; }

    $web = trim((string) ($entry['web'] ?? ''));
    $social = [];
    foreach (['linkedin', 'twitter', 'facebook', 'instagram'] as $k) {
        $v = trim((string) ($entry[$k] ?? ''));
        if ($v !== '') { $social[$k] = $v; }
    }

    $exhibitors[] = [
        'id'           => $id,
        'name'         => $name,
        'category'     => $category,
        'logo'         => $logo ? 'assets/img/exhibitors/' . $logo : '',
        'contactName'  => $rec['contactName'] ?? '',
        'contactRole'  => $rec['contactRole'] ?? '',
        'email'        => trim((string) ($entry['email'] ?? '')),
        'phone'        => trim((string) ($entry['phone'] ?? '')),
        'website'      => $web,
        'websiteLabel' => preg_replace('#/$#', '', preg_replace('#^https?://#', '', $web) ?? ''),
        'address'      => $rec['address'] ?? '',
        'social'       => $social,
        'paragraphs'   => description_of($entry),
    ];
}

/* Un sync que vaciaría el directorio es un sync que ha salido mal. */
$before = 0;
if (is_file(MBB_DATA)) {
    $before = preg_match_all('/^\s{4}id: /m', (string) file_get_contents(MBB_DATA));
}
if ($before && count($exhibitors) < $before * 0.5 && !$ALLOW_SHRINK) {
    die_with(
        'La plataforma devolvió ' . count($exhibitors) . ' expositores donde la web tiene ' .
        $before . '. No se ha escrito nada. Ejecuta con --allow-shrink si esa caída es real.'
    );
}

say(count($exhibitors) . ' expositores (' . (count($raw) - count($visible)) . ' ocultos en la plataforma)');

if ($uncategorised) {
    say('  ' . count($uncategorised) . ' sin categoría, aparecen solo bajo "All":');
    foreach ($uncategorised as $n) { say('    ' . $n); }
    say('  Añádelos a assets/js/data/exhibitors-local.json.');
}

if ($DRY) {
    say('Ensayo terminado. No se ha tocado nada.');
    flush_log();
    exit(0);
}

/* Escribir */
file_put_contents(MBB_DATA, render_data($exhibitors, $categories));
if ($pinned) {
    $local['_readme'] = $local['_readme'] ?? 'Datos que la plataforma no trae. El sync los conserva.';
    file_put_contents(MBB_LOCAL, json_encode($local, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n");
    say('  ' . count($pinned) . ' fichas locales enlazadas con su id de la plataforma.');
}

$c = chrome();
if (!is_dir(MBB_PAGES)) { @mkdir(MBB_PAGES, 0755, true); }

$keep = [];
foreach ($exhibitors as $i => $x) {
    $keep[$x['id'] . '.html'] = true;
    file_put_contents(
        MBB_PAGES . '/' . $x['id'] . '.html',
        exhibitor_page($x, $categories, related_to($exhibitors, $i), $c)
    );
}

// Retirar las páginas de empresas que ya no están.
$removed = 0;
foreach (scandir(MBB_PAGES) ?: [] as $f) {
    if (str_ends_with($f, '.html') && !isset($keep[$f])) {
        @unlink(MBB_PAGES . '/' . $f);
        $removed++;
    }
}
if ($removed) { say('  ' . $removed . ' páginas retiradas.'); }

write_sitemap($exhibitors, (string) ($conf['site_url'] ?? 'https://www.matchbilbaobizkaia.eus/'));

say('Hecho: ' . count($exhibitors) . ' páginas de expositor y el sitemap.');
mbb_soltar_turno($TURNO);
flush_log();
