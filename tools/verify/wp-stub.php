<?php
/**
 * Just enough WordPress to run the plugin's rendering code outside WordPress,
 * so the new dashboard, search and structured data can be exercised rather
 * than only linted. Content comes from the plugin's own seed.json.
 */

define( 'ABSPATH', true );
define( 'JSON_UNESCAPED_SLASHES_X', JSON_UNESCAPED_SLASHES );

$GLOBALS['mbb_actions'] = array();
$GLOBALS['mbb_menu']    = array();

function add_action( $h, $cb, $p = 10, $a = 1 ) { $GLOBALS['mbb_actions'][ $h ][] = $cb; }
function add_filter( $h, $cb, $p = 10, $a = 1 ) {}
function add_shortcode( $t, $cb ) {}
function do_shortcode( $s ) { return $s; }
function register_setting() {}
function register_post_type() {}
function register_taxonomy() {}
function add_meta_box() {}
function wp_enqueue_media() {}
function wp_add_inline_script() {}
function plugin_dir_path( $f ) { return dirname( $f ) . '/'; }
function plugin_dir_url( $f ) { return '/'; }
function plugin_basename( $f ) { return basename( $f ); }
function register_activation_hook() {}
function register_deactivation_hook() {}
function flush_rewrite_rules() {}

function add_submenu_page( $parent, $page, $menu, $cap, $slug, $cb ) {
	$GLOBALS['mbb_menu'][ $slug ] = array( 'title' => $menu, 'cb' => $cb );
}

function __( $s, $d = '' ) { return $s; }
function _e( $s, $d = '' ) { echo $s; }
function esc_html__( $s, $d = '' ) { return htmlspecialchars( $s, ENT_QUOTES ); }
function esc_attr__( $s, $d = '' ) { return htmlspecialchars( $s, ENT_QUOTES ); }
function esc_html_e( $s, $d = '' ) { echo htmlspecialchars( $s, ENT_QUOTES ); }
function esc_html( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); }
function esc_attr( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); }
function esc_textarea( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES ); }
function esc_url( $s ) { return (string) $s; }
function esc_url_raw( $s ) { return (string) $s; }
function wp_kses_post( $s ) { return $s; }
function sanitize_text_field( $s ) { return trim( strip_tags( (string) $s ) ); }
function sanitize_textarea_field( $s ) { return trim( strip_tags( (string) $s ) ); }
function _n( $one, $many, $n, $d = '' ) { return 1 === (int) $n ? $one : $many; }
function number_format_i18n( $n ) { return number_format( $n ); }
function admin_url( $p = '' ) { return 'https://example.test/wp-admin/' . $p; }
function home_url( $p = '' ) { return 'https://example.test' . $p; }
function is_wp_error( $t ) { return false; }
function wp_json_encode( $d, $f = 0 ) { return json_encode( $d, $f ); }
function remove_accents( $s ) {
	$out = iconv( 'UTF-8', 'ASCII//TRANSLIT//IGNORE', (string) $s );
	return false === $out ? (string) $s : $out;
}
function get_option( $k, $d = array() ) { return $GLOBALS['mbb_option']; }
function update_option( $k, $v ) { $GLOBALS['mbb_option'] = $v; }
function wp_parse_args( $a, $d ) { return array_merge( $d, (array) $a ); }
function shortcode_atts( $pairs, $atts, $tag = '' ) { return array_merge( $pairs, (array) $atts ); }
function get_terms( $args ) { return $GLOBALS['mbb_terms']; }
function wp_get_post_terms( $id, $tax, $args = array() ) {
	$slug = $GLOBALS['mbb_posts'][ $id ]->category;
	return isset( $args['fields'] ) && 'slugs' === $args['fields']
		? array( $slug )
		: array( (object) array( 'name' => $slug, 'slug' => $slug ) );
}
function get_the_title( $p ) { return is_object( $p ) ? $p->post_title : $GLOBALS['mbb_posts'][ $p ]->post_title; }
function get_permalink( $p ) { return 'https://example.test/exhibitor/' . ( is_object( $p ) ? $p->slug : $p ); }
function has_post_thumbnail( $p ) { return true; }
function get_the_post_thumbnail( $p, $size = '', $attr = array() ) { return '<img src="logo.jpg" alt="">'; }
function wp_get_attachment_image( $id, $s = '', $i = false, $a = array() ) { return '<img src="x.jpg" alt="">'; }
function wp_get_attachment_image_src( $id, $s = '' ) { return array( 'https://example.test/hero.jpg', 1600, 1200 ); }
function wp_get_attachment_caption( $id ) { return ''; }
function get_post_meta( $id, $key, $single = false ) {
	$p = $GLOBALS['mbb_posts'][ $id ];
	$k = preg_replace( '/^_mbb_/', '', $key );
	return isset( $p->meta[ $k ] ) ? $p->meta[ $k ] : '';
}
function wp_count_posts( $type ) {
	$n = 0;
	foreach ( $GLOBALS['mbb_posts'] as $p ) { if ( $p->post_type === $type ) { $n++; } }
	return (object) array( 'publish' => $n );
}
function get_posts( $args ) {
	$out = array();
	foreach ( $GLOBALS['mbb_posts'] as $p ) {
		if ( $p->post_type === $args['post_type'] ) {
			$out[] = isset( $args['fields'] ) && 'ids' === $args['fields'] ? $p->ID : $p;
		}
	}
	return $out;
}
