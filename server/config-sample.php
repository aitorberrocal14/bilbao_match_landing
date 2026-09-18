<?php
/**
 * CONFIGURACIÓN DEL SYNC — plantilla
 * -----------------------------------------------------------------------------
 * Copia este archivo como `config.php` en la carpeta personal de la cuenta,
 * FUERA de la carpeta pública:
 *
 *     /home/matchbilbaobizkaia/config.php
 *
 * Ahí no llega ninguna URL, así que la clave no se puede descargar de ninguna
 * manera. (Un archivo .env dentro de la web sí se descarga: el servidor lo
 * sirve como texto y hay robots que lo buscan todo el día. Por eso esto es un
 * .php y está fuera.)
 *
 * Este archivo de ejemplo sí se versiona, así que NUNCA escribas aquí la clave
 * real — solo en `config.php`, que vive únicamente en el servidor.
 */

return [
    // La user_key que emite Meetmaps. Pedidla de SOLO LECTURA: para mostrar el
    // directorio no hace falta más, y una clave que solo lee no puede causar
    // daño si algún día se filtra.
    //
    // Si en vuestro config.php esta línea se llama 'api_key', también vale: es
    // el nombre que tenía antes y se sigue aceptando. Es la misma clave.
    'user_key' => 'PON-AQUI-LA-USER-KEY',

    // Los tres siguientes ya traen el valor correcto y normalmente no se tocan.
    'api_url'  => 'https://apiv1.meetmaps.com/api/v1/',
    'event_id' => 15425,
    'action'   => 'attendee_get_all',

    // QUIÉN SALE PUBLICADO. Sin esto no se publica a nadie, y es a propósito.
    // -------------------------------------------------------------------------
    // La plataforma devuelve a TODOS los inscritos: las empresas vascas que
    // exponen, pero también los compradores internacionales y la prensa. Los
    // primeros se inscriben para que les encuentren; los segundos, para asistir.
    // Publicar el nombre, el correo y el teléfono de los segundos sería una
    // brecha de datos personales.
    //
    // Por eso hay que decir aquí, expresamente, qué respuesta del formulario de
    // inscripción significa "soy expositor". Para ver qué campos existen y qué
    // valores tienen:
    //
    //     php .../server/sync.php --fields
    //
    // `field_ref` es el `ref` del campo; `values`, las respuestas que cuentan
    // como expositor. No distingue mayúsculas ni espacios sobrantes.
    'exhibitors_from' => [
        'field_ref' => 'PON-AQUI-EL-REF-DEL-CAMPO',
        'values'    => ['Basque Supplier'],
    ],

    // Opcional: limitar a ciertos estados de inscripción, p. ej. ['activated'].
    // Vacío, se piden todos y el filtro de arriba hace el trabajo.
    'status' => [],

    // La dirección pública del sitio, para el sitemap. Con barra final.
    'site_url' => 'https://www.matchbilbaobizkaia.eus/',
];
