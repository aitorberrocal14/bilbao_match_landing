<?php
/**
 * Runs the WordPress plugin's rendering code without WordPress.
 *
 * A throwaway WordPress needs Docker, which is not always to hand, and a lint
 * only proves the files parse. This loads the plugin against a small stub of
 * the WordPress functions it uses, feeds it the seed content, renders the
 * directory, the structured data and the dashboard, and checks the output.
 *
 *   php tools/verify/wordpress.php
 *
 * Exits non-zero if any check fails, so it can gate a change.
 */

require __DIR__ . '/wp-stub.php';

$ROOT   = dirname( dirname( __DIR__ ) );
$PLUGIN = $ROOT . '/wordpress/match-bilbao-bizkaia';

$seed = json_decode( file_get_contents( $PLUGIN . '/data/seed.json' ), true );

/* Los expositores de muestra.
   -----------------------------------------------------------------------------
   El directorio publicado está vacío a propósito: las empresas de 2026 llegan
   desde Meetmaps según se registran. Pero el filtro, el buscador y el plegado
   de acentos siguen existiendo y siguen teniendo que funcionar el día que
   lleguen — y sin datos no hay nada que comprobar.

   Así que estas comprobaciones traen sus propios expositores. Dos de ellos son
   los casos que de verdad rompen un buscador: un nombre con acento, y una
   empresa cuya marca en el logotipo no es la de su ficha. */
$muestra = array(
	array( 'name' => 'Meliá Bilbao Hotel 5*', 'slug' => 'melia-bilbao-hotel-5', 'category' => 'accommodation', 'website_label' => 'melia.com' ),
	array( 'name' => 'Hotel Carlton & Hotel Abando', 'slug' => 'aranzazu-hoteles', 'category' => 'accommodation', 'website_label' => 'aranzazu-hoteles.com' ),
	array( 'name' => 'Basque Experiences', 'slug' => 'basque-experiences', 'category' => 'dmc', 'website_label' => 'basqueexperiences.com' ),
	array( 'name' => 'Bodega Crusoe Treasure', 'slug' => 'bodega-crusoe-treasure', 'category' => 'activities', 'website_label' => 'underwaterwine.com' ),
);

$exhibitors_para_probar = $seed['exhibitors'] ? $seed['exhibitors'] : $muestra;
define( 'MBB_USANDO_MUESTRA', ! $seed['exhibitors'] );

// Build the post store from the seed.
$GLOBALS['mbb_posts'] = array();
$id = 1;
foreach ( $exhibitors_para_probar as $x ) {
	$GLOBALS['mbb_posts'][ $id ] = (object) array(
		'ID' => $id, 'post_type' => 'mbb_exhibitor', 'post_title' => $x['name'],
		'slug' => $x['slug'], 'category' => $x['category'],
		'meta' => array( 'website_label' => isset( $x['website_label'] ) ? $x['website_label'] : '' ),
	);
	$id++;
}
foreach ( $seed['brochures'] as $b ) {
	$GLOBALS['mbb_posts'][ $id ] = (object) array(
		'ID' => $id, 'post_type' => 'mbb_brochure', 'post_title' => $b['title'],
		'slug' => $b['slug'], 'category' => '',
		'meta' => array(
			'issuu_url' => isset( $b['issuu'] ) ? $b['issuu'] : '',
			'pdf_url'   => isset( $b['pdf'] ) ? $b['pdf'] : '',
		),
	);
	$id++;
}
foreach ( $seed['sessions'] as $s ) {
	$GLOBALS['mbb_posts'][ $id ] = (object) array(
		'ID' => $id, 'post_type' => 'mbb_session', 'post_title' => $s['title'],
		'slug' => '', 'category' => '',
		'meta' => array(
			'day'     => $s['day'],
			'time'    => $s['time'],
			'end'     => $s['end'],
			'text'    => $s['text'],
			'venue'   => $s['venue'],
			'group'   => $s['group'],
			'open'    => $s['open'] ? '1' : '',
			'feature' => $s['feature'] ? '1' : '',
		),
	);
	$id++;
}

$GLOBALS['mbb_terms'] = array(
	(object) array( 'slug' => 'accommodation', 'name' => 'Accommodation' ),
	(object) array( 'slug' => 'dmc', 'name' => 'DMC' ),
	(object) array( 'slug' => 'activities', 'name' => 'Unique Activities' ),
);

define( 'MBB_FILE', $PLUGIN . '/match-bilbao-bizkaia.php' );
define( 'MBB_PATH', $PLUGIN . '/' );
define( 'MBB_URL', '/' );

require $PLUGIN . '/includes/class-mbb-post-types.php';
require $PLUGIN . '/includes/class-mbb-settings.php';
require $PLUGIN . '/includes/class-mbb-template.php';
require $PLUGIN . '/includes/class-mbb-shortcodes.php';
require $PLUGIN . '/includes/class-mbb-schema.php';
require $PLUGIN . '/includes/class-mbb-dashboard.php';

class MBB_Plugin { public static function need_assets() {} }

$GLOBALS['mbb_option'] = MBB_Settings::defaults();

// MBB_Post_Types::exhibitors() queries WordPress; feed it from the store.
function mbb_exhibitor_posts() {
	return array_values( array_filter(
		$GLOBALS['mbb_posts'],
		function ( $p ) { return 'mbb_exhibitor' === $p->post_type; }
	) );
}

$fail = 0;
function check( $label, $ok, $detail = '' ) {
	global $fail;
	if ( ! $ok ) { $fail++; }
	printf( "%-58s %s%s\n", $label, $ok ? 'OK' : 'FALLA', $detail ? '  (' . $detail . ')' : '' );
}

/* --- 1. The exhibitor tiles carry a searchable key ----------------------- */
$tiles = '';
foreach ( mbb_exhibitor_posts() as $p ) { $tiles .= MBB_Template::exhibitor_tile( $p ); }

preg_match_all( '/data-name="([^"]*)"/', $tiles, $m );
check( 'tiles: todos llevan data-name', count( $m[1] ) === count( mbb_exhibitor_posts() ),
	count( $m[1] ) . ' de ' . count( mbb_exhibitor_posts() ) );
// The attribute is HTML-escaped in the markup; compare what the browser will
// actually read back out of it.
$decoded = array_map( function ( $s ) { return html_entity_decode( $s, ENT_QUOTES, 'UTF-8' ); }, $m[1] );
check( 'tiles: data-name sin mayúsculas ni acentos',
	! preg_match( '/[A-ZÁÉÍÓÚÜÑ]/u', implode( ' ', $decoded ) ) );

$keys = implode( ' | ', $m[1] );
check( 'buscar "melia" encuentra Meliá', false !== strpos( $keys, 'melia' ) );
check( 'buscar "aranzazu" encuentra el grupo', false !== strpos( $keys, 'aranzazu' ) );

// PHP and JavaScript have to fold identically or the search misses.
$php_key = MBB_Template::search_key( 'Meliá Bilbao Hotel 5*' );
check( 'PHP y JS pliegan igual', 'melia bilbao hotel 5*' === $php_key, $php_key );

/* --- 2. The directory markup has the search field ------------------------ */
$dir = MBB_Shortcodes::exhibitors();
check( 'directorio: campo de búsqueda presente', false !== strpos( $dir, 'id="ex-search"' ) );
check( 'directorio: contador presente', false !== strpos( $dir, 'id="ex-count"' ) );
check( 'directorio: etiqueta accesible', false !== strpos( $dir, 'for="ex-search"' ) );
check( 'directorio: filtros intactos', substr_count( $dir, 'class="filter"' ) === 4,
	substr_count( $dir, 'class="filter"' ) . ' filtros' );
// Una tarjeta por empresa, sean las de la plataforma o las de la muestra. Un
// número fijo aquí solo acertaría el día que hubiera exactamente ese número.
$esperadas = count( mbb_exhibitor_posts() );
check( 'directorio: una tarjeta por empresa', substr_count( $dir, 'class="logo-tile"' ) === $esperadas,
	substr_count( $dir, 'class="logo-tile"' ) . ' de ' . $esperadas );

/* --- 3. Structured data -------------------------------------------------- */
MBB_Schema::want();
ob_start(); MBB_Schema::render(); $ld = ob_get_clean();
preg_match( '~<script type="application/ld\+json">(.*?)</script>~s', $ld, $j );
$data = $j ? json_decode( $j[1], true ) : null;
check( 'schema: JSON válido', is_array( $data ) );
check( 'schema: es un BusinessEvent', $data && 'BusinessEvent' === $data['@type'] );
check( 'schema: fechas ISO', $data && '2026-10-06' === $data['startDate'] && '2026-10-10' === $data['endDate'],
	$data ? $data['startDate'] . ' → ' . $data['endDate'] : '' );
check( 'schema: lugar Bilbao', $data && 'Bilbao' === $data['location']['address']['addressLocality'] );

// Without dates it must stay silent rather than publish a half event.
$GLOBALS['mbb_option']['event_start'] = '';
ob_start(); MBB_Schema::render(); $none = ob_get_clean();
check( 'schema: se calla sin fechas', '' === trim( $none ) );
$GLOBALS['mbb_option'] = MBB_Settings::defaults();

/* --- 4. The dashboard ---------------------------------------------------- */
ob_start(); MBB_Dashboard::render(); $dash = ob_get_clean();
check( 'panel: se renderiza', strlen( $dash ) > 500 );
// El panel cuenta lo que haya, no una cifra concreta: hoy son cero porque el
// directorio se llena desde la plataforma.
$n_exp = count( mbb_exhibitor_posts() );
check( 'panel: cuenta bien los expositores', false !== strpos( $dash, '>' . $n_exp . '<' ), $n_exp );
check( 'panel: cuenta 16 folletos', false !== strpos( $dash, '>16<' ) );
// The warning has to match the seed: present when brochures really are
// unlinked, absent when they are all linked. Asserting it is always there
// would fail the day the content is finished, which is the wrong signal.
$unlinked = 0;
foreach ( $seed['brochures'] as $b ) {
	if ( empty( $b['issuu'] ) && empty( $b['pdf'] ) ) {
		$unlinked++;
	}
}
$warns = false !== strpos( $dash, 'brochure has no link' )
	|| false !== strpos( $dash, 'brochures have no link' );
check(
	'panel: el aviso de folletos coincide con el contenido',
	$warns === ( $unlinked > 0 ),
	$unlinked ? $unlinked . ' sin enlace, avisa: ' . ( $warns ? 'sí' : 'no' ) : 'todos enlazados, no avisa'
);
// El aviso debe seguir al dato, no a un momento concreto: con la dirección
// puesta el panel tiene que callarse, y sin ella tiene que avisar.
$sin_login = '' === (string) MBB_Settings::get( 'login_url' );
check(
	'panel: el aviso del login coincide con el contenido',
	( false !== strpos( $dash, 'Login button has no address' ) ) === $sin_login,
	$sin_login ? 'sin dirección, avisa' : 'con dirección, no avisa'
);
check( 'panel: enlaza a añadir expositor',
	false !== strpos( $dash, 'post-new.php?post_type=mbb_exhibitor' ) );
check( 'panel: sin PHP sin escapar', false === strpos( $dash, '<?php' ) );

/* --- 5. The programme ---------------------------------------------------- */
$prog = MBB_Shortcodes::programme();

check( 'programa: cinco pestañas de día', 5 === substr_count( $prog, 'class="prog__tab"' ),
	substr_count( $prog, 'class="prog__tab"' ) );
check( 'programa: dos vistas', false !== strpos( $prog, 'data-view="detail"' )
	&& false !== strpos( $prog, 'data-view="overview"' ) );
check( 'programa: resumen con cinco días', 5 === substr_count( $prog, 'class="ov-day"' ),
	substr_count( $prog, 'class="ov-day"' ) );
check( 'programa: selector de itinerario sólo un día',
	1 === substr_count( $prog, 'class="prog__groups"' ),
	substr_count( $prog, 'class="prog__groups"' ) . ' días con selector' );
check( 'programa: botón de calendario por día y total',
	5 === substr_count( $prog, 'data-ics="day-' ) && false !== strpos( $prog, 'data-ics="all"' ) );

// The JSON the browser turns into the calendar file.
preg_match( '~<script type="application/json" id="mbb-programme">(.*?)</script>~s', $prog, $pj );
$pdata = $pj ? json_decode( $pj[1], true ) : null;
check( 'programa: JSON de calendario válido', is_array( $pdata ) && isset( $pdata['days'] ) );
check( 'programa: cinco días exportables', $pdata && 5 === count( $pdata['days'] ),
	$pdata ? count( $pdata['days'] ) : 0 );

$allSlots = 0;
$dated    = true;
foreach ( (array) ( $pdata['days'] ?? array() ) as $d ) {
	$allSlots += count( $d['slots'] );
	if ( ! preg_match( '~^\d{4}-\d{2}-\d{2}$~', (string) $d['dateISO'] ) ) {
		$dated = false;
	}
}
check( 'programa: cada día con fecha real', $dated,
	$pdata ? implode( ' ', array_column( $pdata['days'], 'dateISO' ) ) : '' );
check( 'programa: todas las sesiones exportadas', $allSlots === count( $seed['sessions'] ),
	$allSlots . ' de ' . count( $seed['sessions'] ) );

$split = 0;
foreach ( (array) ( $pdata['days'] ?? array() ) as $d ) {
	foreach ( $d['slots'] as $sl ) {
		if ( $sl['group'] ) { $split++; }
	}
}
check( 'programa: el miércoles lleva sus dos itinerarios', $split > 0, $split . ' sesiones con grupo' );

// The day is cut into its parts, and the two itineraries are separate
// timelines rather than rows hidden inside one.
check( 'programa: franjas del día presentes',
	substr_count( $prog, 'class="tl-band__label"' ) >= 10,
	substr_count( $prog, 'class="tl-band__label"' ) . ' franjas en total' );
check( 'programa: una línea de tiempo por itinerario el día partido',
	2 === substr_count( $prog, '<div class="tl" data-group=' ),
	substr_count( $prog, '<div class="tl" data-group=' ) );
check( 'programa: el día partido no mezcla grupos en una lista',
	false === strpos( $prog, '<li class="tl-item" data-group' ) );
check( 'programa: se muestra la duración', substr_count( $prog, 'tl-item__to' ) > 0,
	substr_count( $prog, 'tl-item__to' ) . ' sesiones con hora de fin' );
check( 'programa: ningún destacado en color', false === strpos( $prog, 'tl-item__time--open' ) );

// PHP and JavaScript build the same markup, or the shared stylesheet breaks.
preg_match_all( '/class="tl-band__label">([^<]+)</', $prog, $bm );
$bands = array_values( array_unique( $bm[1] ) );
sort( $bands );
check( 'programa: nombres de franja esperados',
	$bands === array( 'Afternoon', 'Evening', 'Morning', 'Times follow your flight' ),
	implode( ' · ', $bands ) );

/* --- 7. Contact and the mailing list -------------------------------------- */
$cont = MBB_Shortcodes::contact();

check( 'contacto: un bloque por canal con contenido', 2 === substr_count( $cont, 'class="channel"' ),
	substr_count( $cont, 'class="channel"' ) );
check( 'contacto: la dirección es un mailto', false !== strpos( $cont, 'mailto:welcome@matchbilbaobizkaia.eus' ) );
check( 'contacto: el teléfono se puede marcar', false !== strpos( $cont, 'href="tel:+34944205377"' ) );

// El boletín no pide nada: dos enlaces y ningún campo donde escribir.
check( 'boletín: dos públicos', 2 === substr_count( $cont, 'class="nl-opt"' ),
	substr_count( $cont, 'class="nl-opt"' ) );
check( 'boletín: no se pide ningún dato', false === strpos( $cont, '<input' )
	&& false === strpos( $cont, '<form' ) );
check( 'boletín: los dos formularios abren fuera',
	2 === substr_count( $cont, 'class="nl-opt" href="https://bilbaoturismo.us17.list-manage.com' )
	&& 2 === substr_count( $cont, 'target="_blank" rel="noopener"' ) );
check( 'boletín: cada público lleva a una lista distinta',
	false !== strpos( $cont, 'id=35fe8d2bdf' ) && false !== strpos( $cont, 'id=010b640237' ) );

// Vaciar las dos direcciones tiene que quitar el bloque entero, no dejar un
// título prometiendo algo que no lleva a ninguna parte.
$titulo_boletin = MBB_Settings::get( 'nl_title' );
$guardado = $GLOBALS['mbb_option'];
$GLOBALS['mbb_option']['nl1_url'] = '';
$GLOBALS['mbb_option']['nl2_url'] = '';
$vacio = MBB_Shortcodes::contact();
check( 'boletín: sin direcciones desaparece entero',
	false === strpos( $vacio, 'class="newsletter"' )
	&& false === strpos( $vacio, $titulo_boletin ) );
check( 'boletín: quitarlo no se lleva los canales por delante',
	2 === substr_count( $vacio, 'class="channel"' ) );
$GLOBALS['mbb_option'] = $guardado;

// El vídeo 2 ya tiene identificador, así que las dos ediciones se ven.
check( 'ediciones: los dos vídeos tienen identificador',
	'' !== (string) MBB_Settings::get( 'video1_id' ) && '' !== (string) MBB_Settings::get( 'video2_id' ) );

echo "\n" . ( $fail ? "$fail comprobaciones fallan\n" : "Todas las comprobaciones pasan\n" );
exit( $fail ? 1 : 0 );
