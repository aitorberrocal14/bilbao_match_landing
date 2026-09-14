<?php
/**
 * One-click import of the starting content: the 39 exhibitors with their
 * logos and profile texts, the English brochures with their covers, and a
 * sample three-day programme.
 *
 * It is safe to run more than once: existing entries are matched by slug and
 * left untouched, so nothing the team has edited is overwritten.
 *
 * @package Match_Bilbao_Bizkaia
 */

defined( 'ABSPATH' ) || exit;

class MBB_Importer {

	const DONE_OPTION = 'mbb_imported';

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_post_mbb_import', array( __CLASS__, 'handle' ) );
		add_action( 'admin_notices', array( __CLASS__, 'notice' ) );
	}

	public static function menu() {
		add_submenu_page(
			'edit.php?post_type=' . MBB_Post_Types::EXHIBITOR,
			__( 'Import starting content', 'mbb' ),
			__( 'Import content', 'mbb' ),
			'manage_options',
			'mbb-import',
			array( __CLASS__, 'render' )
		);
	}

	/** Categories exist from activation so the filter works straight away. */
	public static function seed_categories() {
		$categories = array(
			'accommodation' => __( 'Accommodation', 'mbb' ),
			'dmc'           => __( 'DMC', 'mbb' ),
			'activities'    => __( 'Unique Activities', 'mbb' ),
		);

		foreach ( $categories as $slug => $name ) {
			if ( ! term_exists( $slug, MBB_Post_Types::CATEGORY ) ) {
				wp_insert_term( $name, MBB_Post_Types::CATEGORY, array( 'slug' => $slug ) );
			}
		}
	}

	private static function seed() {
		$file = MBB_PATH . 'data/seed.json';
		if ( ! file_exists( $file ) ) {
			return array();
		}
		$json = json_decode( file_get_contents( $file ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		return is_array( $json ) ? $json : array();
	}

	public static function notice() {
		$screen = get_current_screen();
		if ( ! $screen || false === strpos( $screen->id, MBB_Post_Types::EXHIBITOR ) ) {
			return;
		}
		if ( get_option( self::DONE_OPTION ) ) {
			return;
		}
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		printf(
			'<div class="notice notice-info"><p>%s <a href="%s">%s</a></p></div>',
			esc_html__( 'Match Bilbao Bizkaia is ready. You can import the 39 exhibitors, the brochures and a sample programme in one step.', 'mbb' ),
			esc_url( admin_url( 'edit.php?post_type=' . MBB_Post_Types::EXHIBITOR . '&page=mbb-import' ) ),
			esc_html__( 'Import the starting content', 'mbb' )
		);
	}

	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$seed = self::seed();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Import starting content', 'mbb' ); ?></h1>

			<p>
				<?php
				printf(
					/* translators: 1: exhibitors, 2: brochures, 3: sessions */
					esc_html__( 'This imports %1$d exhibitors with their logos and profile texts, %2$d brochures with their covers, and %3$d programme sessions.', 'mbb' ),
					count( isset( $seed['exhibitors'] ) ? $seed['exhibitors'] : array() ),
					count( isset( $seed['brochures'] ) ? $seed['brochures'] : array() ),
					count( isset( $seed['sessions'] ) ? $seed['sessions'] : array() )
				);
				?>
			</p>
			<p class="description">
				<?php esc_html_e( 'It can be run more than once: anything already imported is skipped, so your edits are never overwritten.', 'mbb' ); ?>
			</p>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="mbb_import">
				<?php wp_nonce_field( 'mbb_import' ); ?>
				<?php submit_button( __( 'Import now', 'mbb' ) ); ?>
			</form>
		</div>
		<?php
	}

	public static function handle() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do this.', 'mbb' ) );
		}
		check_admin_referer( 'mbb_import' );

		$seed = self::seed();
		self::seed_categories();

		$counts = array(
			'exhibitors' => self::import_exhibitors( isset( $seed['exhibitors'] ) ? $seed['exhibitors'] : array() ),
			'brochures'  => self::import_brochures( isset( $seed['brochures'] ) ? $seed['brochures'] : array() ),
			'sessions'   => self::import_sessions( isset( $seed['sessions'] ) ? $seed['sessions'] : array() ),
		);

		update_option( self::DONE_OPTION, time() );
		flush_rewrite_rules();

		wp_safe_redirect(
			add_query_arg(
				array(
					'post_type' => MBB_Post_Types::EXHIBITOR,
					'page'      => 'mbb-import',
					'imported'  => implode( '-', $counts ),
				),
				admin_url( 'edit.php' )
			)
		);
		exit;
	}

	/* --- Importers ---------------------------------------------------------- */

	private static function find( $post_type, $slug ) {
		$existing = get_posts(
			array(
				'post_type'      => $post_type,
				'name'           => $slug,
				'post_status'    => 'any',
				'posts_per_page' => 1,
				'fields'         => 'ids',
			)
		);
		return $existing ? $existing[0] : 0;
	}

	private static function import_exhibitors( $items ) {
		$done  = 0;
		$order = 0;

		foreach ( $items as $item ) {
			$order++;
			if ( self::find( MBB_Post_Types::EXHIBITOR, $item['slug'] ) ) {
				continue;
			}

			$content = '';
			foreach ( (array) $item['paragraphs'] as $paragraph ) {
				$content .= "\n\n" . $paragraph;
			}

			$post_id = wp_insert_post(
				array(
					'post_type'    => MBB_Post_Types::EXHIBITOR,
					'post_status'  => 'publish',
					'post_title'   => $item['name'],
					'post_name'    => $item['slug'],
					'post_content' => trim( $content ),
					'menu_order'   => $order,
				)
			);

			if ( ! $post_id || is_wp_error( $post_id ) ) {
				continue;
			}

			foreach ( array( 'contact_name', 'contact_role', 'email', 'phone', 'website', 'website_label', 'address' ) as $key ) {
				if ( ! empty( $item[ $key ] ) ) {
					update_post_meta( $post_id, '_mbb_' . $key, $item[ $key ] );
				}
			}

			wp_set_object_terms( $post_id, $item['category'], MBB_Post_Types::CATEGORY );

			if ( ! empty( $item['logo'] ) ) {
				self::attach_image( $post_id, 'img/exhibitors/' . $item['logo'], $item['name'] . ' logo' );
			}

			$done++;
		}

		return $done;
	}

	private static function import_brochures( $items ) {
		$done  = 0;
		$order = 0;

		foreach ( $items as $item ) {
			$order++;
			if ( self::find( MBB_Post_Types::BROCHURE, $item['slug'] ) ) {
				continue;
			}

			$post_id = wp_insert_post(
				array(
					'post_type'   => MBB_Post_Types::BROCHURE,
					'post_status' => 'publish',
					'post_title'  => $item['title'],
					'post_name'   => $item['slug'],
					'menu_order'  => $order,
				)
			);

			if ( ! $post_id || is_wp_error( $post_id ) ) {
				continue;
			}

			update_post_meta( $post_id, '_mbb_subtitle', $item['subtitle'] );
			update_post_meta( $post_id, '_mbb_pdf_url', $item['pdf'] );
			update_post_meta( $post_id, '_mbb_issuu_url', isset( $item['issuu'] ) ? $item['issuu'] : '' );

			if ( ! empty( $item['cover'] ) ) {
				self::attach_image( $post_id, 'img/brochures/' . $item['cover'], $item['title'] . ' cover' );
			}

			$done++;
		}

		return $done;
	}

	private static function import_sessions( $items ) {
		$done  = 0;
		$order = 0;

		foreach ( $items as $item ) {
			$order++;
			// The group belongs in the slug: on the day that splits, the two
			// itineraries share hours and titles, and would collide without it.
			$slug = sanitize_title(
				$item['day'] . '-' . ( isset( $item['group'] ) ? $item['group'] . '-' : '' ) .
				$item['time'] . '-' . $item['title']
			);

			if ( self::find( MBB_Post_Types::SESSION, $slug ) ) {
				continue;
			}

			$post_id = wp_insert_post(
				array(
					'post_type'   => MBB_Post_Types::SESSION,
					'post_status' => 'publish',
					'post_title'  => $item['title'],
					'post_name'   => $slug,
					'menu_order'  => $order,
				)
			);

			if ( ! $post_id || is_wp_error( $post_id ) ) {
				continue;
			}

			update_post_meta( $post_id, '_mbb_day', (int) $item['day'] );
			update_post_meta( $post_id, '_mbb_time', $item['time'] );
			update_post_meta( $post_id, '_mbb_text', isset( $item['text'] ) ? $item['text'] : '' );
			update_post_meta( $post_id, '_mbb_venue', isset( $item['venue'] ) ? $item['venue'] : '' );
			update_post_meta( $post_id, '_mbb_end', isset( $item['end'] ) ? $item['end'] : '' );
			update_post_meta( $post_id, '_mbb_group', isset( $item['group'] ) ? $item['group'] : '' );
			update_post_meta( $post_id, '_mbb_open', ! empty( $item['open'] ) ? '1' : '' );
			update_post_meta( $post_id, '_mbb_feature', ! empty( $item['feature'] ) ? '1' : '' );

			$done++;
		}

		return $done;
	}

	/**
	 * Copies an image shipped with the plugin into the media library and sets
	 * it as the featured image.
	 */
	private static function attach_image( $post_id, $relative, $alt ) {
		$source = MBB_PATH . 'assets/' . $relative;
		if ( ! file_exists( $source ) ) {
			return;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$uploads = wp_upload_dir();
		if ( ! empty( $uploads['error'] ) ) {
			return;
		}

		$filename = wp_unique_filename( $uploads['path'], basename( $source ) );
		$target   = trailingslashit( $uploads['path'] ) . $filename;

		if ( ! copy( $source, $target ) ) {
			return;
		}

		$filetype = wp_check_filetype( $target, null );

		$attachment_id = wp_insert_attachment(
			array(
				'post_mime_type' => $filetype['type'],
				'post_title'     => sanitize_text_field( $alt ),
				'post_status'    => 'inherit',
			),
			$target,
			$post_id
		);

		if ( ! $attachment_id || is_wp_error( $attachment_id ) ) {
			return;
		}

		wp_update_attachment_metadata(
			$attachment_id,
			wp_generate_attachment_metadata( $attachment_id, $target )
		);
		update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt ) );
		set_post_thumbnail( $post_id, $attachment_id );
	}
}
