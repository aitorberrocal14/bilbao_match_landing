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

// Build the post store from the seed.
$GLOBALS['mbb_posts'] = array();
$id = 1;
foreach ( $seed['exhibitors'] as $x ) {
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
		'slug' => '', 'category' => '', 'meta' => array(),
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
check( 'directorio: 39 tarjetas', substr_count( $dir, 'class="logo-tile"' ) === 39,
	substr_count( $dir, 'class="logo-tile"' ) );

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
check( 'panel: cuenta 39 expositores', false !== strpos( $dash, '>39<' ) );
check( 'panel: cuenta 16 folletos', false !== strpos( $dash, '>16<' ) );
check( 'panel: avisa de folletos sin enlace', false !== strpos( $dash, 'brochures have no link' ) );
check( 'panel: avisa de que falta el login', false !== strpos( $dash, 'Login button has no address' ) );
check( 'panel: enlaza a añadir expositor',
	false !== strpos( $dash, 'post-new.php?post_type=mbb_exhibitor' ) );
check( 'panel: sin PHP sin escapar', false === strpos( $dash, '<?php' ) );

echo "\n" . ( $fail ? "$fail comprobaciones fallan\n" : "Todas las comprobaciones pasan\n" );
exit( $fail ? 1 : 0 );
