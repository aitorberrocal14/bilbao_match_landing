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
    if ($FIXTURE === null && empty($MBB_CONF['api_key'])) {
        die_with(
            'No hay configuración, o le falta api_key. Crea config.php en la ' .
            'carpeta de la cuenta (fuera de la web) — ver server/config-sample.php.'
        );
    }
    return $MBB_CONF + [
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

    $payload = json_encode([
        'action'   => 'exhibitor_get_all',
        'event_id' => (int) $conf['event_id'],
        'user_key' => (string) $conf['api_key'],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $ch = curl_init($conf['api_url']);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 60,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        die_with('No se ha podido contactar con la plataforma: ' . $err);
    }
    if ($code < 200 || $code >= 300) {
        die_with('La plataforma respondió ' . $code . '.');
    }

    $json = json_decode((string) $body, true);
    if (!is_array($json)) {
        die_with('La plataforma no devolvió JSON.');
    }
    return $json;
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

/* --- Principal -------------------------------------------------------------- */

$conf = load_config();
say($DRY ? 'Ensayo: no se escribirá nada.' : 'Sincronizando desde la plataforma.');

$raw = read_response(fetch_exhibitors($conf));

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
flush_log();
