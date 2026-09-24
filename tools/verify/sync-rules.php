<?php
/**
 * LAS REGLAS DEL SYNC, COMPROBADAS CON DATOS DE MENTIRA
 * -----------------------------------------------------------------------------
 * `render-parity.php` comprueba cómo se DIBUJA una ficha. Esto comprueba QUIÉN
 * llega a dibujarse, que es la decisión con consecuencias:
 *
 *   · publicar a un comprador o a un periodista sería una brecha de datos;
 *   · dejar fuera a un expositor sin decirlo es una empresa que pagó por estar
 *     y no aparece, y nadie se entera hasta que llama enfadada.
 *
 * Las dos cosas se deciden en `sync.php` a partir de lo que devuelve Meetmaps,
 * así que se prueban como se prueba de verdad: dándole respuestas inventadas y
 * mirando qué dice que va a hacer.
 *
 *     php tools/verify/sync-rules.php
 *
 * Todo se ejecuta en modo ensayo: no escribe en ninguna web ni llama a la
 * plataforma.
 */

declare(strict_types=1);

$ROOT = dirname(__DIR__, 2);
$TMP  = sys_get_temp_dir() . '/mbb-sync-' . getmypid();
@mkdir($TMP, 0777, true);

/* El config de prueba va donde sync.php lo busca. Si ya hubiera uno de verdad
   ahí, esto no se ejecuta: no se toca la configuración de nadie. */
$CONFIG = $ROOT . '/server/config.php';
if (is_file($CONFIG)) {
    fwrite(STDERR, "Hay un server/config.php de verdad. No se toca; prueba en otro sitio.\n");
    exit(1);
}

file_put_contents($CONFIG, "<?php\nreturn " . var_export([
    'web_dir'  => $TMP . '/web',
    'api_key'  => 'PRUEBA-SIN-VALOR',
    'event_id' => 1,
    'exhibitors_from' => ['field_id' => '367992', 'values' => ['210824']],
    'logo_from'       => ['field_id' => '372389'],
    'categories_from' => ['field_id' => '372592', 'map' => [
        '213999' => 'accommodation', '214000' => 'dmc', '214001' => 'activities',
    ]],
    'status'   => [],
    'site_url' => 'https://matchbilbaobizkaia.eus/',
], true) . ";\n");

register_shutdown_function(function () use ($CONFIG, $TMP) {
    @unlink($CONFIG);

    // Se recoge TODO lo que haya quedado. Uno de los casos escribe de verdad
    // —es la única forma de leer el archivo que acaba en el navegador— y una
    // prueba que deja restos en /tmp acaba siendo una prueba que nadie ejecuta.
    $limpiar = function ($dir) use (&$limpiar) {
        foreach (glob($dir . '/{,.}*', GLOB_BRACE) ?: [] as $x) {
            if (basename($x) === '.' || basename($x) === '..') { continue; }
            is_dir($x) ? $limpiar($x) : @unlink($x);
        }
        @rmdir($dir);
    };
    $limpiar($TMP);
});

/** Un inscrito de mentira. $perfil: 210824 expositor · 210823 comprador. */
function inscrito(int $id, string $empresa, string $perfil, string $categoria = ''): array
{
    $campos = [['id' => '367992', 'value' => $perfil]];
    if ($categoria !== '') { $campos[] = ['id' => '372592', 'value' => $categoria]; }

    return [
        'id' => $id,
        'name' => 'Nombre' . $id, 'last_name' => 'Apellido' . $id,
        'company' => $empresa,
        'email' => 'persona' . $id . '@example.com',
        'hidden' => 0,
        'fields' => $campos,
    ];
}

$fallos = 0;

function caso(string $titulo, array $inscritos, array $espera): void
{
    global $ROOT, $TMP, $fallos;

    $f = $TMP . '/fixture.json';
    file_put_contents($f, json_encode(['results' => $inscritos], JSON_UNESCAPED_UNICODE));

    $salida = (string) shell_exec(
        'php ' . escapeshellarg($ROOT . '/server/sync.php') .
        ' --dry-run --fixture ' . escapeshellarg($f) . ' 2>&1'
    );

    echo "\n· " . $titulo . "\n";
    foreach ($espera as $debe => $texto) {
        $hay = strpos($salida, (string) $texto) !== false;
        $bien = is_int($debe) ? $hay : ($debe === 'no' ? !$hay : $hay);
        echo '  ' . ($bien ? 'OK   ' : 'FALLA') . '  ' .
            (is_int($debe) ? 'dice' : ($debe === 'no' ? 'NO dice' : 'dice')) .
            ' "' . $texto . '"' . "\n";
        if (!$bien) { $fallos++; }
    }
    if ($fallos && getenv('MBB_VERBOSE')) { echo $salida; }
}

echo "COMPROBANDO LAS REGLAS DEL SYNC\n===============================";

/* 1. La regla que evita una brecha de datos. La plataforma devuelve a TODOS los
      inscritos; solo pueden publicarse los expositores. */
caso(
    'Los compradores no se publican nunca',
    [
        inscrito(1, 'Hotel Uno', '210824', '213999'),
        inscrito(2, 'Nordic Travel', '210823'),
        inscrito(3, 'Atlantic Tours', '210823'),
    ],
    [
        '1 de 3 inscritos son expositores.',
        '1 expositores',
        'no' => 'Nordic Travel',
    ]
);

/* 2. Un expositor sin nombre de empresa no se puede publicar —el directorio es
      de empresas— pero tiene que DECIRSE. Antes desaparecía en silencio: el
      registro decía "3 son expositores" y luego "2 expositores", sin explicar
      la resta. */
caso(
    'Un expositor sin nombre de empresa se nombra, no se pierde',
    [
        inscrito(1, 'Hotel Uno', '210824', '213999'),
        inscrito(2, 'DMC Dos', '210824', '214000'),
        inscrito(3, '', '210824', '214001'),
    ],
    [
        '3 de 3 inscritos son expositores.',
        '2 expositores',
        'NO se publican: les falta el nombre de la empresa.',
        'id en la plataforma: 3',
    ]
);

/* 3. Una categoría que no está en el mapa deja a la empresa bajo "All" y se
      nombra, con la respuesta literal: es la única forma de averiguar el
      número que falta sin acceso a la plataforma. */
caso(
    'Una categoría desconocida se nombra, con su número',
    [
        inscrito(1, 'Hotel Uno', '210824', '999999'),
    ],
    [
        'Respuestas del formulario sin categoría en config.php:',
        '"999999"',
        'sin categoría, aparecen solo bajo "All":',
        'Hotel Uno',
    ]
);

/* 4. Sin regla de expositor no se publica a NADIE. Fallar del lado seguro es
      lo que impide que un descuido de configuración saque a la web los datos
      de todos los inscritos. */
$entero = require $CONFIG;                 // se guarda para devolverlo después
$conf = $entero;
unset($conf['exhibitors_from']);
file_put_contents($CONFIG, "<?php\nreturn " . var_export($conf, true) . ";\n");

caso(
    'Sin regla de expositor no se publica a nadie',
    [
        inscrito(1, 'Hotel Uno', '210824', '213999'),
        inscrito(2, 'Nordic Travel', '210823'),
    ],
    [
        'No hay regla que diga quién es expositor',
        'no' => 'Hotel Uno',
    ]
);

// Se devuelve la regla: los casos que vienen después necesitan publicar algo,
// y un caso que estropea el terreno para el siguiente da fallos que no son.
file_put_contents($CONFIG, "<?php\nreturn " . var_export($entero, true) . ";\n");

/* 5. La dirección web de una empresa tiene que quedar ABSOLUTA.
      Una empresa escribió «www.bilbaoturismo.net» sin https:// y el enlace de
      su ficha llevaba a …/exhibitors/www.bilbaoturismo.net, una ruta dentro de
      la propia web. Esta vez se escribe de verdad —sin --dry-run— y se lee el
      archivo que queda, que es lo que acaba en el navegador. */
echo "\n· La web de una empresa se guarda absoluta, con su esquema\n";

$destino = $TMP . '/web';
@mkdir($destino . '/assets/js/data', 0777, true);
@mkdir($destino . '/exhibitors', 0777, true);

$f = $TMP . '/fixture-web.json';
$conWeb = inscrito(1, 'Turismo Uno', '210824', '213999');
$conWeb['web'] = 'www.bilbaoturismo.net';          // tal cual lo escribió ella
$conEsquema = inscrito(2, 'Turismo Dos', '210824', '214000');
$conEsquema['web'] = 'https://www.visitbiscay.eus/';
file_put_contents($f, json_encode(['results' => [$conWeb, $conEsquema]], JSON_UNESCAPED_UNICODE));

shell_exec(
    'php ' . escapeshellarg($ROOT . '/server/sync.php') .
    ' --fixture ' . escapeshellarg($f) . ' 2>&1'
);

$datos = @file_get_contents($destino . '/assets/js/data/exhibitors.js');
foreach ([
    "website: 'https://www.bilbaoturismo.net'" => 'le pone el esquema que faltaba',
    "website: 'https://www.visitbiscay.eus/'"  => 'respeta el que ya lo traía',
    "websiteLabel: 'www.bilbaoturismo.net'"    => 'y lo enseña sin el esquema',
] as $texto => $titulo) {
    $bien = $datos !== false && strpos($datos, $texto) !== false;
    echo '  ' . ($bien ? 'OK   ' : 'FALLA') . '  ' . $titulo . "\n";
    if (!$bien) { $fallos++; }
}

// La ficha dibujada es donde se vio el fallo: el enlace llevaba a una ruta
// dentro de la propia web en vez de salir fuera.
$ficha = @file_get_contents($destino . '/exhibitors/turismo-uno.html');
$bienFicha = $ficha !== false &&
    strpos($ficha, 'href="https://www.bilbaoturismo.net"') !== false &&
    strpos($ficha, 'href="www.bilbaoturismo.net"') === false;
echo '  ' . ($bienFicha ? 'OK   ' : 'FALLA') . "  y en la ficha el enlace sale fuera\n";
if (!$bienFicha) { $fallos++; }

// Y que no quede ninguna dirección relativa, que es el fallo original.
$relativa = $datos !== false && preg_match("/website: '(?!https?:)(?!')/", $datos);
echo '  ' . ($relativa ? 'FALLA' : 'OK   ') . "  ninguna dirección queda relativa\n";
if ($relativa) { $fallos++; }

/* 5 bis. UNA DIRECCIÓN QUE NO SEA http NI https NO ES UNA WEB, Y NO ENTRA.
      Este campo lo escribe la empresa en su ficha de Meetmaps y termina dentro
      de un href de esta web. Se aceptaba cualquier esquema: `javascript:` a
      secas no colaba —sin «//» no casaba con nada—, pero `javascript://x%0A…`
      sí, y en un enlace eso se ejecuta al pulsarlo.

      Para explotarlo hay que ser una empresa dada de alta, y en una web sin
      sesiones no hay nada que robar. Pero es código corriendo en el dominio
      oficial, que es suficiente para desfigurar la página o para montar encima
      un formulario que parezca nuestro. Ahora solo pasan http y https. */
echo "\n· Una web que no sea http ni https no se publica\n";

$g = $TMP . '/fixture-esquemas.json';
$malas = [
    'javascript://x%0Aalert(1)',
    'javascript:alert(1)',
    'data://text/html;base64,PHNjcmlwdD4=',
    'vbscript://x',
];
$fichas = [];
foreach ($malas as $i => $mala) {
    $e = inscrito($i + 1, 'Empresa ' . ($i + 1), '210824', '21400' . $i);
    $e['web'] = $mala;
    $fichas[] = $e;
}
file_put_contents($g, json_encode(['results' => $fichas], JSON_UNESCAPED_UNICODE));

array_map('unlink', glob($destino . '/exhibitors/*') ?: []);
shell_exec(
    'php ' . escapeshellarg($ROOT . '/server/sync.php') .
    ' --fixture ' . escapeshellarg($g) . ' --allow-shrink 2>&1'
);

$datosMal = (string) @file_get_contents($destino . '/assets/js/data/exhibitors.js');
$paginas = '';
foreach (glob($destino . '/exhibitors/*.html') ?: [] as $pg) {
    $paginas .= (string) file_get_contents($pg);
}

foreach (['javascript:', 'data:text/html', 'data://', 'vbscript:'] as $veneno) {
    $bien = stripos($datosMal, $veneno) === false && stripos($paginas, $veneno) === false;
    echo '  ' . ($bien ? 'OK   ' : 'FALLA') . '  ni rastro de ' . $veneno . "\n";
    if (!$bien) { $fallos++; }
}

/* 6. La cabecera de la ficha tiene que cambiar sola el día que abre la
      plataforma. Estas páginas llevan la cabecera escrita, no dibujada por el
      JavaScript, así que sin esto se quedarían con el Login apuntando al
      cartel de aviso y con los colores del día en que se generaron: el 29 por
      la mañana la portada diría una cosa y las 39 fichas otra.

      Se corre dos veces la misma web de mentira, con el reloj a un lado y a
      otro del día de apertura, y se mira el archivo que queda. */
echo "\n· El día que abre la plataforma, la cabecera de la ficha cambia sola\n";

$chrome = json_decode((string) file_get_contents($ROOT . '/server/chrome.json'), true);
$abre = strtotime((string) ($chrome['opensAt'] ?? ''));

if (!$abre) {
    echo "  FALLA  server/chrome.json no dice cuándo abre la plataforma\n";
    $fallos++;
} else {
    foreach ([
        ['la víspera lleva al cartel de aviso', $abre - 3600, '../platform.html', 'virtual/join'],
        ['abierta lleva a la plataforma',       $abre + 3600, 'virtual/join', '../platform.html'],
    ] as [$titulo, $cuando, $debe, $noDebe]) {
        array_map('unlink', glob($destino . '/exhibitors/*') ?: []);
        shell_exec(
            'php ' . escapeshellarg($ROOT . '/server/sync.php') .
            ' --fixture ' . escapeshellarg($f) .
            ' --now ' . escapeshellarg(date('c', $cuando)) . ' 2>&1'
        );
        $p = (string) @file_get_contents($destino . '/exhibitors/turismo-uno.html');
        // Solo se mira la cabecera: el pie lleva los mismos enlaces y cualquiera
        // de los dos textos aparecería allí por su cuenta.
        preg_match('~<header\b.*?</header>~s', $p, $m);
        $cab = $m[0] ?? '';
        $bien = $cab !== '' &&
            strpos($cab, $debe) !== false && strpos($cab, $noDebe) === false;
        echo '  ' . ($bien ? 'OK   ' : 'FALLA') . '  ' . $titulo . "\n";
        if (!$bien) { $fallos++; }
    }

    // Y el botón, que es UNO y no cambia. Aquí se miraba que el Login pasara a
    // botón rojo y el alta a blanco con borde, porque la cabecera llevaba dos
    // y se cambiaban los papeles ese día. Ahora lleva uno, el Login, igual los
    // dos días: lo que se comprueba es que siga siendo el mismo botón y que el
    // alta no haya vuelto a colarse en la cabecera de las fichas.
    $cab = (string) @file_get_contents($destino . '/exhibitors/turismo-uno.html');
    preg_match('~<header\b.*?</header>~s', $cab, $m);
    $soloCab = $m[0] ?? '';
    $bien = $soloCab !== '' &&
        strpos($soloCab, 'class="header__enter btn btn--sm"') !== false &&
        strpos($soloCab, 'data-register') === false;
    echo '  ' . ($bien ? 'OK   ' : 'FALLA') . "  y el Login sigue siendo el único botón\n";
    if (!$bien) { $fallos++; }
}

/* 7. QUITAR EL LOGOTIPO EN LA PLATAFORMA TIENE QUE QUITARLO DE LA WEB, y un
      fallo de red NO. Son dos situaciones que desde el servidor se parecen y
      que hay que separar, porque durante un tiempo se trataron igual: se
      conservaba siempre el logotipo viejo, así que una empresa podía borrar el
      suyo y seguir publicado indefinidamente.

      Se prueban las dos, con un logotipo puesto a mano en el sitio donde el
      sync los guarda. */
echo "\n· Quitar el logotipo en la plataforma lo quita de la web\n";

$logos = $destino . '/assets/img/exhibitors';
@mkdir($logos, 0777, true);
$fl = $TMP . '/fixture-logo.json';

$correr = function (array $inscritos) use ($ROOT, $fl) {
    file_put_contents($fl, json_encode(['results' => $inscritos], JSON_UNESCAPED_UNICODE));
    shell_exec(
        'php ' . escapeshellarg($ROOT . '/server/sync.php') .
        ' --fixture ' . escapeshellarg($fl) . ' 2>&1'
    );
};

// A. La plataforma ya no trae logotipo: la empresa lo ha borrado.
file_put_contents($logos . '/turismo-uno.png', 'PNG-DE-MENTIRA');
$correr([inscrito(1, 'Turismo Uno', '210824', '213999')]);
$datos = (string) @file_get_contents($destino . '/assets/js/data/exhibitors.js');
$bien = strpos($datos, "logo: ''") !== false && !is_file($logos . '/turismo-uno.png');
echo '  ' . ($bien ? 'OK   ' : 'FALLA') . "  borrado en la plataforma, desaparece de la web\n";
if (!$bien) { $fallos++; }

// B. La plataforma SÍ trae logotipo pero no se puede bajar —aquí porque falta
//    `img_base` en el config, que es el caso real de una dirección que no se
//    puede componer—. El que ya estaba se conserva: un fallo de red no puede
//    dejar el directorio sin logotipos.
file_put_contents($logos . '/turismo-uno.png', 'PNG-DE-MENTIRA');
$conLogo = inscrito(1, 'Turismo Uno', '210824', '213999');
$conLogo['fields'][] = ['id' => '372389', 'value' => 'turismo-uno.png'];
$correr([$conLogo]);
$datos = (string) @file_get_contents($destino . '/assets/js/data/exhibitors.js');
$bien = is_file($logos . '/turismo-uno.png') &&
    strpos($datos, "logo: 'assets/img/exhibitors/turismo-uno.png'") !== false;
echo '  ' . ($bien ? 'OK   ' : 'FALLA') . "  pero un fallo al bajarlo no lo borra\n";
if (!$bien) { $fallos++; }

// Lo escrito se borra: esta prueba no deja web montada en ningún sitio.
foreach (['/assets/js/data/exhibitors.js', '/assets/js/data/exhibitors-local.json',
          '/sitemap.xml'] as $x) { @unlink($destino . $x); }
array_map('unlink', glob($destino . '/exhibitors/*') ?: []);
array_map('unlink', glob($logos . '/*') ?: []);

echo "\n" . ($fallos ? $fallos . ' comprobaciones fallan' : 'Todas las comprobaciones pasan') . "\n";
exit($fallos ? 1 : 0);
