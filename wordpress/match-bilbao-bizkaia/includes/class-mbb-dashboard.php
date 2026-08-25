<?php
/**
 * The Match dashboard — one screen that answers "where do I go, and what is
 * still missing?".
 *
 * The plugin already scatters its pieces across the WordPress menu: exhibitors,
 * brochures, programme sessions and settings each live in their own place. That
 * is right for editing, but it makes the first hour of preparing a new edition
 * an exercise in hunting. This screen sits at the top of that menu and shows
 * how much of each there is, what has not been filled in yet, and a way in to
 * every part.
 *
 * It only reads and links: nothing is edited here, so there is no way to break
 * the site from this page.
 *
 * @package Match_Bilbao_Bizkaia
 */

defined( 'ABSPATH' ) || exit;

class MBB_Dashboard {

	const SLUG = 'mbb-dashboard';

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ), 5 );
	}

	public static function menu() {
		add_submenu_page(
			'edit.php?post_type=' . MBB_Post_Types::EXHIBITOR,
			__( 'Match Bilbao Bizkaia', 'mbb' ),
			__( 'Dashboard', 'mbb' ),
			'edit_posts',
			self::SLUG,
			array( __CLASS__, 'render' )
		);
	}

	/* --- Counting ------------------------------------------------------------ */

	private static function count_posts( $type ) {
		$counts = wp_count_posts( $type );
		return isset( $counts->publish ) ? (int) $counts->publish : 0;
	}

	private static function admin_link( $path ) {
		return admin_url( $path );
	}

	private static function url( $args ) {
		return self::admin_link(
			'edit.php?' . http_build_query( array_merge( array( 'post_type' => MBB_Post_Types::EXHIBITOR ), $args ) )
		);
	}

	/**
	 * Everything the page still needs before it is finished. Each entry is a
	 * plain sentence and a link to the screen where it is fixed, so the list
	 * doubles as the to-do for a new edition.
	 */
	private static function outstanding() {
		$todo     = array();
		$settings = self::url( array( 'page' => 'mbb-settings' ) );

		if ( ! self::count_posts( MBB_Post_Types::EXHIBITOR ) ) {
			$todo[] = array(
				__( 'No exhibitors yet — run the importer or add the first one.', 'mbb' ),
				self::url( array( 'page' => 'mbb-import' ) ),
			);
		}

		if ( ! self::count_posts( MBB_Post_Types::SESSION ) ) {
			$todo[] = array(
				__( 'The programme is empty, so that section will not appear.', 'mbb' ),
				self::url( array( 'post_type' => MBB_Post_Types::SESSION ) ),
			);
		}

		// Brochures with neither an Issuu link nor a PDF have nothing to open.
		$orphans = get_posts(
			array(
				'post_type'      => MBB_Post_Types::BROCHURE,
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'post_status'    => 'publish',
			)
		);
		$unlinked = 0;
		foreach ( $orphans as $id ) {
			if ( ! get_post_meta( $id, '_mbb_issuu_url', true ) && ! get_post_meta( $id, '_mbb_pdf_url', true ) ) {
				$unlinked++;
			}
		}
		if ( $unlinked ) {
			$todo[] = array(
				sprintf(
					/* translators: %d: number of brochures. */
					_n(
						'%d brochure has no link yet, so its cover opens nothing.',
						'%d brochures have no link yet, so their covers open nothing.',
						$unlinked,
						'mbb'
					),
					$unlinked
				),
				self::url( array( 'post_type' => MBB_Post_Types::BROCHURE ) ),
			);
		}

		if ( ! MBB_Settings::get( 'hero_image' ) ) {
			$todo[] = array( __( 'The hero has no image.', 'mbb' ), $settings );
		}
		if ( ! MBB_Settings::get( 'login_url' ) ) {
			$todo[] = array( __( 'The Login button has no address, so it is hidden.', 'mbb' ), $settings );
		}
		if ( ! MBB_Settings::get( 'video1_id' ) && ! MBB_Settings::get( 'video2_id' ) ) {
			$todo[] = array( __( 'No videos are set for Latest Editions.', 'mbb' ), $settings );
		}
		if ( ! MBB_Settings::get( 'event_start' ) ) {
			$todo[] = array(
				__( 'The event dates are not set, so search engines cannot list it as an event.', 'mbb' ),
				$settings,
			);
		}

		return $todo;
	}

	/* --- The screen ----------------------------------------------------------- */

	public static function render() {
		$exhibitors = self::count_posts( MBB_Post_Types::EXHIBITOR );
		$brochures  = self::count_posts( MBB_Post_Types::BROCHURE );
		$sessions   = self::count_posts( MBB_Post_Types::SESSION );
		$days       = count( MBB_Settings::days() );
		$todo       = self::outstanding();

		$cards = array(
			array(
				'n'     => $exhibitors,
				'label' => _n( 'Exhibitor', 'Exhibitors', $exhibitors, 'mbb' ),
				'list'  => self::url( array() ),
				'add'   => self::admin_link( 'post-new.php?post_type=' . MBB_Post_Types::EXHIBITOR ),
			),
			array(
				'n'     => $brochures,
				'label' => _n( 'Brochure', 'Brochures', $brochures, 'mbb' ),
				'list'  => self::url( array( 'post_type' => MBB_Post_Types::BROCHURE ) ),
				'add'   => self::admin_link( 'post-new.php?post_type=' . MBB_Post_Types::BROCHURE ),
			),
			array(
				'n'     => $sessions,
				'label' => _n( 'Programme session', 'Programme sessions', $sessions, 'mbb' ),
				'list'  => self::url( array( 'post_type' => MBB_Post_Types::SESSION ) ),
				'add'   => self::admin_link( 'post-new.php?post_type=' . MBB_Post_Types::SESSION ),
			),
			array(
				'n'     => $days,
				'label' => _n( 'Day of programme', 'Days of programme', $days, 'mbb' ),
				'list'  => self::url( array( 'page' => 'mbb-settings' ) ),
				'add'   => '',
			),
		);
		?>
		<div class="wrap mbb-dash">
			<h1><?php esc_html_e( 'Match Bilbao Bizkaia', 'mbb' ); ?></h1>
			<p class="mbb-dash__lead">
				<?php esc_html_e( 'Everything the landing page is built from. Counts are of published items only.', 'mbb' ); ?>
			</p>

			<div class="mbb-dash__cards">
				<?php foreach ( $cards as $card ) : ?>
					<div class="mbb-dash__card">
						<span class="mbb-dash__n"><?php echo esc_html( number_format_i18n( $card['n'] ) ); ?></span>
						<span class="mbb-dash__label"><?php echo esc_html( $card['label'] ); ?></span>
						<p class="mbb-dash__actions">
							<a href="<?php echo esc_url( $card['list'] ); ?>"><?php esc_html_e( 'Manage', 'mbb' ); ?></a>
							<?php if ( $card['add'] ) : ?>
								· <a href="<?php echo esc_url( $card['add'] ); ?>"><?php esc_html_e( 'Add new', 'mbb' ); ?></a>
							<?php endif; ?>
						</p>
					</div>
				<?php endforeach; ?>
			</div>

			<h2><?php esc_html_e( 'Still to do', 'mbb' ); ?></h2>
			<?php if ( $todo ) : ?>
				<ul class="mbb-dash__todo">
					<?php foreach ( $todo as $item ) : ?>
						<li>
							<span class="dashicons dashicons-warning" aria-hidden="true"></span>
							<?php echo esc_html( $item[0] ); ?>
							<a href="<?php echo esc_url( $item[1] ); ?>"><?php esc_html_e( 'Fix this', 'mbb' ); ?></a>
						</li>
					<?php endforeach; ?>
				</ul>
			<?php else : ?>
				<p class="mbb-dash__done">
					<span class="dashicons dashicons-yes-alt" aria-hidden="true"></span>
					<?php esc_html_e( 'Nothing outstanding — every section has what it needs.', 'mbb' ); ?>
				</p>
			<?php endif; ?>

			<h2><?php esc_html_e( 'Building the page', 'mbb' ); ?></h2>
			<p><?php esc_html_e( 'Put the whole landing page on any page with one shortcode:', 'mbb' ); ?></p>
			<p><code>[mbb_landing]</code></p>
			<p><?php esc_html_e( 'Or place the sections one by one, so each can be moved or styled on its own:', 'mbb' ); ?></p>
			<p>
				<code>[mbb_hero]</code> <code>[mbb_event]</code> <code>[mbb_programme]</code>
				<code>[mbb_presentation]</code> <code>[mbb_editions]</code> <code>[mbb_experts]</code>
				<code>[mbb_exhibitors]</code> <code>[mbb_discover]</code> <code>[mbb_contact]</code>
			</p>

			<p class="mbb-dash__links">
				<a class="button button-primary" href="<?php echo esc_url( self::url( array( 'page' => 'mbb-settings' ) ) ); ?>">
					<?php esc_html_e( 'Settings', 'mbb' ); ?>
				</a>
				<a class="button" href="<?php echo esc_url( self::url( array( 'page' => 'mbb-import' ) ) ); ?>">
					<?php esc_html_e( 'Import starting content', 'mbb' ); ?>
				</a>
				<a class="button" href="<?php echo esc_url( home_url( '/' ) ); ?>" target="_blank" rel="noopener">
					<?php esc_html_e( 'View the site', 'mbb' ); ?>
				</a>
			</p>
		</div>

		<style>
			.mbb-dash__lead { max-width: 60ch; color: #50575e; }
			.mbb-dash__cards {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
				gap: 16px;
				margin: 20px 0 32px;
				max-width: 900px;
			}
			.mbb-dash__card {
				background: #fff;
				border: 1px solid #dcdcde;
				border-top: 3px solid #ae0000;
				padding: 18px 20px;
			}
			.mbb-dash__n { display: block; font-size: 2.2rem; line-height: 1.1; font-weight: 700; color: #ae0000; }
			.mbb-dash__label { display: block; margin-top: 2px; color: #50575e; }
			.mbb-dash__actions { margin: 10px 0 0; }
			.mbb-dash__todo { max-width: 780px; margin: 0 0 8px; }
			.mbb-dash__todo li { margin: 0 0 8px; }
			.mbb-dash__todo .dashicons-warning { color: #dba617; }
			.mbb-dash__done .dashicons-yes-alt { color: #00a32a; }
			.mbb-dash__links { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 8px; }
		</style>
		<?php
	}
}
