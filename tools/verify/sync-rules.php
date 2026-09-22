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
    'site_url' => 'https://www.matchbilbaobizkaia.eus/',
], true) . ";\n");

register_shutdown_function(function () use ($CONFIG, $TMP) {
    @unlink($CONFIG);
    // La carpeta temporal se queda vacía: todo va en modo ensayo.
    @rmdir($TMP . '/web');
    @rmdir($TMP);
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
$sinRegla = $ROOT . '/server/config.php';
$conf = require $sinRegla;
unset($conf['exhibitors_from']);
file_put_contents($sinRegla, "<?php\nreturn " . var_export($conf, true) . ";\n");

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

echo "\n" . ($fallos ? $fallos . ' comprobaciones fallan' : 'Todas las comprobaciones pasan') . "\n";
exit($fallos ? 1 : 0);
