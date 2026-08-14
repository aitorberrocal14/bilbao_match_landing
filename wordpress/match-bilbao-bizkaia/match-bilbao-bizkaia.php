<?php
/**
 * Plugin Name:       Match Bilbao Bizkaia
 * Plugin URI:        https://www.matchbilbaobizkaia.eus/
 * Description:       The Match Bilbao Bizkaia landing page as WordPress content: exhibitors, brochures and programme are edited in the admin, and each section is available as a shortcode. Exhibitors keep their own page.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Bilbao Bizkaia
 * Text Domain:       mbb
 *
 * @package Match_Bilbao_Bizkaia
 */

defined( 'ABSPATH' ) || exit;

define( 'MBB_VERSION', '1.0.0' );
define( 'MBB_FILE', __FILE__ );
define( 'MBB_PATH', plugin_dir_path( __FILE__ ) );
define( 'MBB_URL', plugin_dir_url( __FILE__ ) );

require_once MBB_PATH . 'includes/class-mbb-post-types.php';
require_once MBB_PATH . 'includes/class-mbb-settings.php';
require_once MBB_PATH . 'includes/class-mbb-template.php';
require_once MBB_PATH . 'includes/class-mbb-shortcodes.php';
require_once MBB_PATH . 'includes/class-mbb-importer.php';

class MBB_Plugin {

	/** Set when a shortcode or template runs, so assets load only where needed. */
	private static $needed = false;

	public static function init() {
		MBB_Post_Types::init();
		MBB_Settings::init();
		MBB_Shortcodes::init();
		MBB_Importer::init();

		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_assets' ) );
		add_action( 'wp_footer', array( __CLASS__, 'print_assets' ) );
		add_filter( 'template_include', array( __CLASS__, 'exhibitor_template' ) );

		add_filter(
			'plugin_action_links_' . plugin_basename( MBB_FILE ),
			array( __CLASS__, 'action_links' )
		);
	}

	public static function action_links( $links ) {
		array_unshift(
			$links,
			sprintf(
				'<a href="%s">%s</a>',
				esc_url( admin_url( 'edit.php?post_type=' . MBB_Post_Types::EXHIBITOR . '&page=mbb-settings' ) ),
				esc_html__( 'Settings', 'mbb' )
			)
		);
		return $links;
	}

	public static function register_assets() {
		// Bariol and the helper classes load everywhere, so sections built in
		// Elementor can use them without a shortcode being present.
		wp_enqueue_style( 'mbb-fonts', MBB_URL . 'assets/css/mbb-fonts.css', array(), MBB_VERSION );

		wp_register_style( 'mbb', MBB_URL . 'assets/css/mbb.css', array( 'mbb-fonts' ), MBB_VERSION );
		wp_register_script( 'mbb', MBB_URL . 'assets/js/mbb.js', array(), MBB_VERSION, true );

		// Roboto, as on the current site. Bariol is bundled with the plugin.
		wp_register_style(
			'mbb-roboto',
			'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
			array(),
			null
		);
	}

	/** Called by every shortcode; enqueues the assets once. */
	public static function need_assets() {
		if ( self::$needed ) {
			return;
		}
		self::$needed = true;
		wp_enqueue_style( 'mbb-roboto' );
		wp_enqueue_style( 'mbb' );
		wp_enqueue_script( 'mbb' );
	}

	public static function print_assets() {
		// Nothing to do: WordPress prints what need_assets() enqueued. The hook
		// stays so late shortcodes (in widgets, for instance) still work.
	}

	/** Exhibitors get the plugin's own single template. */
	public static function exhibitor_template( $template ) {
		if ( is_singular( MBB_Post_Types::EXHIBITOR ) ) {
			self::need_assets();
			$custom = MBB_PATH . 'templates/single-exhibitor.php';
			if ( file_exists( $custom ) ) {
				return $custom;
			}
		}
		return $template;
	}

	public static function activate() {
		MBB_Post_Types::register();
		MBB_Importer::seed_categories();
		flush_rewrite_rules();
	}

	public static function deactivate() {
		flush_rewrite_rules();
	}
}

register_activation_hook( MBB_FILE, array( 'MBB_Plugin', 'activate' ) );
register_deactivation_hook( MBB_FILE, array( 'MBB_Plugin', 'deactivate' ) );

MBB_Plugin::init();
