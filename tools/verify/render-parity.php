<?php
/**
 * Comprueba que server/sync.php dibuja las páginas de expositor exactamente
 * igual que el motor JavaScript del sitio.
 *
 *     node tools/build-exhibitors.js          # las genera con JavaScript
 *     php tools/verify/render-parity.php      # las vuelve a generar con PHP y compara
 *
 * Por qué existe
 * --------------
 * Hay dos programas que dibujan la misma página: el de JavaScript, que se usa
 * al desarrollar, y el de PHP, que se ejecuta en el servidor. Dos programas que
 * hacen lo mismo se separan: alguien arregla uno y olvida el otro, y la web
 * empieza a contradecirse sin que nadie se entere.
 *
 * Esto lo convierte en algo que se nota al instante. Compara byte a byte, no
 * "más o menos": si una coma cambia de sitio, falla.
 */

declare(strict_types=1);

$ROOT = dirname(__DIR__, 2);

/* Cargar el renderizador de sync.php sin ejecutar la sincronización. */
define('MBB_VERIFY', true);
$src = file_get_contents($ROOT . '/server/sync.php');
// Quedarse con todo lo anterior a "Principal": las funciones, no el programa.
$cut = strpos($src, '/* --- Principal ---');
if ($cut === false) {
    fwrite(STDERR, "No se encuentra la marca de inicio del programa en sync.php\n");
    exit(1);
}

// `declare(strict_types=1)` tiene que ser la primera instrucción de un archivo,
// así que no sobrevive a un eval. Se quita aquí y se comprueba que estaba: es
// una diferencia de cómo se carga el código, no de lo que hace.
$funciones = substr($src, 0, $cut);
if (!str_contains($funciones, 'declare(strict_types=1);')) {
    fwrite(STDERR, "sync.php ha perdido declare(strict_types=1).\n");
    exit(1);
}
$funciones = str_replace('declare(strict_types=1);', '', $funciones);

eval('?>' . $funciones);

/* --- Leer los mismos datos que usa el sitio -------------------------------- */

/**
 * exhibitors.js es JavaScript, no JSON. Se lee con el mismo Node que genera el
 * sitio, que es la única forma honesta de comparar: si lo interpretara aquí a
 * mi manera, estaría comparando mi lectura contra la suya en lugar de comparar
 * los dos dibujos.
 */
$json = shell_exec(
    'cd ' . escapeshellarg($ROOT) . ' && node -e ' . escapeshellarg(
        'const fs=require("fs"),vm=require("vm");' .
        'const s={window:{},Date};s.globalThis=s;vm.createContext(s);' .
        '["assets/js/data/site.js","assets/js/data/exhibitors.js"].forEach(f=>' .
        'vm.runInContext(fs.readFileSync(f,"utf8"),s,{filename:f}));' .
        'process.stdout.write(JSON.stringify({' .
        'exhibitors:s.window.MBB.exhibitors,categories:s.window.MBB.exhibitorCategories}));'
    )
);

$data = json_decode((string) $json, true);
if (!is_array($data) || !isset($data['exhibitors'])) {
    fwrite(STDERR, "No se han podido leer los datos de expositores.\n");
    exit(1);
}

$chrome = json_decode((string) file_get_contents($ROOT . '/server/chrome.json'), true);
if (!is_array($chrome) || empty($chrome['icons'])) {
    fwrite(STDERR, "No se ha podido leer server/chrome.json.\n");
    exit(1);
}

/* --- La muestra difícil ----------------------------------------------------
   Se compara siempre, haya expositores publicados o no. Un directorio vacío es
   un estado legítimo —lo está hasta la primera alta— y sin esto la prueba se
   quedaría sin nada que comprobar justo cuando más falta hace, mientras se
   escribe el motor de PHP.

   Los casos están elegidos por donde dos motores se separan de verdad: acentos,
   un ampersand, comillas de los dos tipos, un apóstrofo tipográfico, HTML en el
   texto, campos vacíos, y una empresa sin logotipo ni categoría.

   Y uno con `logoDark`, que es el único campo que no se escribe como texto sino
   como un atributo que está o no está. Un booleano es justo donde dos lenguajes
   se separan sin avisar —lo que PHP y JavaScript consideran "vacío" no es lo
   mismo—, y aquí se nota el doble: si un motor lo pone y el otro no, la tarjeta
   se ve bien recién cargada y mal después de sincronizar, o al revés. */

$muestra = [
    [
        'id' => 'prueba-acentos',
        'name' => 'Hotel Aránzazu & Cía. "El Puente"',
        'category' => 'accommodation',
        'logo' => 'assets/img/exhibitors/prueba.jpg',
        'contactName' => "Iñaki O'Donnell",
        'contactRole' => 'Director <comercial>',
        'email' => 'test@example.org',
        'phone' => '+34 944 20 53 77',
        'website' => 'https://example.org/',
        'websiteLabel' => 'example.org',
        'address' => 'C/ Uribitarte 6, 2ª planta — 48001 Bilbao',
        'paragraphs' => ['Primero, con "comillas" y & ampersand.', 'Segundo, con apóstrofo tipográfico: l’Hôtel.'],
    ],
    [
        'id' => 'prueba-logo-blanco',
        'name' => 'Logotipo Para Fondo Oscuro SA',
        'category' => 'accommodation',
        'logo' => 'assets/img/exhibitors/prueba.png',
        'logoDark' => true,
        'contactName' => 'Ane Zabala', 'contactRole' => 'Marketing',
        'email' => 'ane@example.org', 'phone' => '',
        'website' => '', 'websiteLabel' => '', 'address' => '',
        'paragraphs' => ['Una línea cualquiera.'],
    ],
    [
        'id' => 'prueba-minima',
        'name' => 'Sin Nada SL',
        'category' => '',
        'logo' => '',
        'contactName' => '', 'contactRole' => '', 'email' => '', 'phone' => '',
        'website' => '', 'websiteLabel' => '', 'address' => '',
        'paragraphs' => [],
    ],
];

$js = shell_exec(
    'cd ' . escapeshellarg($ROOT) . ' && node -e ' . escapeshellarg(
        'const fs=require("fs"),vm=require("vm");' .
        'const s={window:{},Date};s.globalThis=s;vm.createContext(s);' .
        '["assets/js/data/site.js","assets/js/components.js"].forEach(f=>' .
        'vm.runInContext(fs.readFileSync(f,"utf8"),s,{filename:f}));' .
        'const m=s.window.MBB, d=JSON.parse(process.argv[1]);' .
        'process.stdout.write(JSON.stringify(d.map((x,i)=>' .
        'm.ExhibitorPage(x, d.cats||' . json_encode($chromeCats = [
            ['id' => 'all', 'label' => 'All'],
            ['id' => 'accommodation', 'label' => 'Accommodation'],
        ]) . ', d.filter((o,j)=>j!==i), "../"))));'
    ) . ' ' . escapeshellarg(json_encode($muestra, JSON_UNESCAPED_UNICODE))
);

$jsBodies = json_decode((string) $js, true);
if (!is_array($jsBodies)) {
    fwrite(STDERR, "No se ha podido renderizar la muestra con JavaScript.\n");
    exit(1);
}

$fallosMuestra = [];
foreach ($muestra as $i => $x) {
    $otros = array_values(array_filter($muestra, fn($o, $j) => $j !== $i, ARRAY_FILTER_USE_BOTH));
    $php = exhibitor_body($x, $chromeCats, $otros, '../', $chrome['icons']);
    if ($php !== $jsBodies[$i]) {
        $n = min(strlen($jsBodies[$i]), strlen($php));
        $p = 0;
        while ($p < $n && $jsBodies[$i][$p] === $php[$p]) { $p++; }
        $fallosMuestra[] = [
            $x['id'],
            'difieren en el byte ' . $p . "\n      JS : …" . substr($jsBodies[$i], max(0, $p - 40), 90) .
            "\n      PHP: …" . substr($php, max(0, $p - 40), 90),
        ];
    }
}

printf("muestra difícil: %d de %d idénticas\n", count($muestra) - count($fallosMuestra), count($muestra));
foreach ($fallosMuestra as [$id, $por]) {
    echo '  ✗ ' . $id . ': ' . $por . "\n";
}

if (!$data['exhibitors']) {
    echo "No hay expositores publicados, así que no hay páginas completas que comparar.\n";
    exit($fallosMuestra ? 1 : 0);
}

$exhibitors = $data['exhibitors'];
$categories = $data['categories'];

/* --- Comparar -------------------------------------------------------------- */

$total = count($exhibitors);
$iguales = 0;
$fallos = [];

foreach ($exhibitors as $i => $x) {
    $file = $ROOT . '/exhibitors/' . $x['id'] . '.html';
    if (!is_file($file)) {
        $fallos[] = [$x['id'], 'la página generada por JavaScript no existe'];
        continue;
    }

    $esperado = file_get_contents($file);
    $obtenido = exhibitor_page($x, $categories, related_to($exhibitors, $i), $chrome);

    if ($esperado === $obtenido) {
        $iguales++;
        continue;
    }

    // Dónde empiezan a diferir, que es lo único que ayuda a arreglarlo.
    $n = min(strlen($esperado), strlen($obtenido));
    $p = 0;
    while ($p < $n && $esperado[$p] === $obtenido[$p]) { $p++; }
    $fallos[] = [
        $x['id'],
        'difieren en el byte ' . $p . "\n      JS : …" . substr($esperado, max(0, $p - 40), 90) .
        "\n      PHP: …" . substr($obtenido, max(0, $p - 40), 90),
    ];
}

/* --- Resultado ------------------------------------------------------------- */

printf("%d de %d páginas idénticas byte a byte\n", $iguales, $total);

if ($fallos) {
    echo "\n";
    foreach ($fallos as [$id, $por]) {
        echo '  ✗ ' . $id . ': ' . $por . "\n";
    }
    echo "\nLos dos motores se han separado. Arregla el que esté mal antes de publicar.\n";
    exit(1);
}

echo "Los dos motores coinciden.\n";
