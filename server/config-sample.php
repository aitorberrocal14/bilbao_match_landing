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

    // Los dos siguientes ya traen el valor correcto y normalmente no se tocan.
    'api_url'  => 'https://apiv1.meetmaps.com/api/v1/',
    'event_id' => 15425,

    // La dirección pública del sitio, para el sitemap. Con barra final.
    'site_url' => 'https://www.matchbilbaobizkaia.eus/',
];
