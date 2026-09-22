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
    // Los campos propios de este evento llegan SIN `ref` y con un `id` numérico,
    // así que casi siempre se nombran con 'field_id'. Si algún día tuvieran
    // nombre, vale 'field_ref' igual.
    //
    // Y sus valores tampoco son texto: son identificadores de opción, como
    // «210824». Para saber cuál es cuál, mira quién eligió cada uno:
    //
    //     php .../server/sync.php --field 367992
    'exhibitors_from' => [
        'field_id' => 'PON-AQUI-EL-ID-DEL-CAMPO-Buyer/Exhibitor',
        'values'   => ['PON-AQUI-EL-VALOR-QUE-SIGNIFICA-EXHIBITOR'],
    ],

    // EL LOGOTIPO: DE QUÉ CAMPO SALE, Y DE DÓNDE SE BAJA.
    // -------------------------------------------------------------------------
    // El formulario de inscripción pide DOS imágenes y no son intercambiables:
    //
    //   · «Photo» — el avatar redondo. La CARA de quien se inscribe. La
    //     plataforma la devuelve en `img`, que es el campo estándar del perfil.
    //     No se publica nunca: el directorio es de empresas, no de personas.
    //   · «Logo»  — la marca de la empresa. Es un campo propio del formulario y
    //     llega dentro de `fields`, con su `ref`.
    //
    // Por eso hay que nombrar el campo expresamente. Sin esta línea no se baja
    // ningún logotipo, y el sync lo dice en cada vuelta. Para ver los `ref` que
    // existen:  php .../server/sync.php --fields
    'logo_from' => [
        'field_id' => 'PON-AQUI-EL-ID-DEL-CAMPO-Logo',
    ],

    // LA CATEGORÍA DEL DIRECTORIO.
    // -------------------------------------------------------------------------
    // El formulario pregunta «What kind of company are you?» y sus tres
    // respuestas son las tres categorías de la web. Con este mapa la categoría
    // llega sola y los filtros funcionan sin que nadie clasifique a mano.
    //
    // A la izquierda, la respuesta tal cual la ofrece el formulario. A la
    // derecha, el id de la categoría en la web. Una respuesta que no esté aquí
    // deja a la empresa bajo «All» y se nombra en el registro.
    'categories_from' => [
        'field_id' => 'PON-AQUI-EL-ID-DE-LA-PREGUNTA',
        // A la izquierda, el identificador de cada opción; a la derecha, el id
        // de la categoría en la web. Las etiquetas que ve el visitante están en
        // assets/js/data/exhibitors-local.json, en _categories.
        'map' => [
            'ID-DE-LA-OPCION-Accommodation' => 'accommodation',
            'ID-DE-LA-OPCION-Basque-DMC'    => 'dmc',
            'ID-DE-LA-OPCION-Boutique'      => 'activities',
        ],
    ],

    // La plataforma devuelve solo el nombre del archivo —«i20260918122516.png»—,
    // no su dirección. Aquí va la parte de delante, que hay que pedirle a
    // Meetmaps. Sin esto los logotipos no se descargan, y el sync lo dice con el
    // nombre de cada empresa afectada.
    'img_base' => '',

    // Opcional: limitar a ciertos estados de inscripción, p. ej. ['activated'].
    // Vacío, se piden todos y el filtro de arriba hace el trabajo.
    'status' => [],

    // La dirección pública del sitio, para el sitemap. Con barra final.
    //
    // Ya apunta a la dirección DEFINITIVA aunque la web esté todavía en la
    // carpeta de pruebas. Es a propósito: es la dirección que se declara en el
    // enlace canónico, en la tarjeta para compartir y en el sitemap, y tiene
    // que ser la buena desde el primer día para no repartir la autoridad de la
    // web entre dos direcciones.
    'site_url' => 'https://www.matchbilbaobizkaia.eus/',

    // ¿SALE ESTA COPIA EN GOOGLE?
    // -------------------------------------------------------------------------
    // Normalmente NO HAY QUE TOCAR ESTO. Si se deja fuera, el despliegue lo
    // decide solo: publicando en la carpeta pública de la cuenta entiende que
    // es la web de verdad y la deja visible; publicando en cualquier otro sitio
    // —una subcarpeta de pruebas— la marca como «no indexar».
    //
    // Se decide solo a propósito. Puesto a mano habría que acordarse de
    // quitarlo el día del lanzamiento, y ese olvido es mucho peor que el
    // problema que evita: la web buena, invisible en Google, sin que nada avise.
    //
    // Solo hace falta escribirlo si el hosting coloca la carpeta pública en un
    // sitio que el despliegue no reconoce. Cada ejecución dice en el registro
    // cuál de las dos cosas ha entendido.
    //
    // 'noindex' => false,   // true = no indexar · false = indexar
];
