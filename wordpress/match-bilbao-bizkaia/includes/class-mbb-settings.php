<?php
/**
 * Settings screen: the values that are neither exhibitors, brochures nor
 * programme sessions — event identity, hero copy, videos, links and contact.
 *
 * @package Match_Bilbao_Bizkaia
 */

defined( 'ABSPATH' ) || exit;

class MBB_Settings {

	const OPTION = 'mbb_settings';

	/** Days the programme covers: arrival and departure both carry programme. */
	const DAYS = 5;

	/** Field definition: key => [label, type, help]. */
	public static function schema() {
		return array(
			'event' => array(
				'label'  => __( 'The event', 'mbb' ),
				'fields' => array(
					'edition'     => array( __( 'Edition', 'mbb' ), 'text' ),
					'dates'       => array( __( 'Dates', 'mbb' ), 'text' ),
					'event_start' => array( __( 'First day', 'mbb' ), 'date', __( 'Not shown on the page. Search engines read these two dates to list the event with its dates; keep them in step with the line above.', 'mbb' ) ),
					'event_end'   => array( __( 'Last day', 'mbb' ), 'date' ),
					'day1_label'  => array( __( 'Day 1 — label', 'mbb' ), 'text' ),
					'day1_date'   => array( __( 'Day 1 — date', 'mbb' ), 'text' ),
					'day1_theme'  => array( __( 'Day 1 — theme', 'mbb' ), 'text' ),
					'day1_summary' => array( __( 'Day 1 — one-line summary', 'mbb' ), 'textarea', __( 'Shown in the Overview view of the programme.', 'mbb' ) ),
					'day2_label'  => array( __( 'Day 2 — label', 'mbb' ), 'text' ),
					'day2_date'   => array( __( 'Day 2 — date', 'mbb' ), 'text' ),
					'day2_theme'  => array( __( 'Day 2 — theme', 'mbb' ), 'text' ),
					'day2_summary' => array( __( 'Day 2 — one-line summary', 'mbb' ), 'textarea', '' ),
					'day3_label'  => array( __( 'Day 3 — label', 'mbb' ), 'text' ),
					'day3_date'   => array( __( 'Day 3 — date', 'mbb' ), 'text' ),
					'day3_theme'  => array( __( 'Day 3 — theme', 'mbb' ), 'text' ),
					'day3_summary' => array( __( 'Day 3 — one-line summary', 'mbb' ), 'textarea', '' ),
					'day4_label'  => array( __( 'Day 4 — label', 'mbb' ), 'text' ),
					'day4_date'   => array( __( 'Day 4 — date', 'mbb' ), 'text' ),
					'day4_theme'  => array( __( 'Day 4 — theme', 'mbb' ), 'text' ),
					'day4_summary' => array( __( 'Day 4 — one-line summary', 'mbb' ), 'textarea', '' ),
					'day5_label'  => array( __( 'Day 5 — label', 'mbb' ), 'text' ),
					'day5_date'   => array( __( 'Day 5 — date', 'mbb' ), 'text' ),
					'day5_theme'  => array( __( 'Day 5 — theme', 'mbb' ), 'text' ),
					'day5_summary' => array( __( 'Day 5 — one-line summary', 'mbb' ), 'textarea', '' ),
					'prog_intro'  => array(
						__( 'Programme introduction', 'mbb' ),
						'textarea',
						__( 'Optional. Left empty the heading stands on its own, which is how it is set up today.', 'mbb' ),
					),
					'prog_note'   => array( __( 'Programme note', 'mbb' ), 'textarea' ),
					'calendar_url' => array( __( '“Add to calendar” link', 'mbb' ), 'url' ),
				),
			),
			'hero'  => array(
				'label'  => __( 'Hero', 'mbb' ),
				'fields' => array(
					'hero_kicker'   => array( __( 'Dates line', 'mbb' ), 'text' ),
					'hero_title'    => array( __( 'Title', 'mbb' ), 'text' ),
					'hero_year'     => array( __( 'Year', 'mbb' ), 'text' ),
					'hero_subtitle' => array( __( 'Subtitle', 'mbb' ), 'textarea' ),
					'hero_lead'     => array( __( 'Introduction', 'mbb' ), 'textarea' ),
					'hero_image'    => array( __( 'Hero image', 'mbb' ), 'image' ),
					'fact1_value'   => array( __( 'Figure 1 — value', 'mbb' ), 'text' ),
					'fact1_label'   => array( __( 'Figure 1 — label', 'mbb' ), 'text' ),
					'fact2_value'   => array( __( 'Figure 2 — value', 'mbb' ), 'text' ),
					'fact2_label'   => array( __( 'Figure 2 — label', 'mbb' ), 'text' ),
					'fact3_value'   => array( __( 'Figure 3 — value', 'mbb' ), 'text' ),
					'fact3_label'   => array( __( 'Figure 3 — label', 'mbb' ), 'text' ),
					'fact4_value'   => array( __( 'Figure 4 — value', 'mbb' ), 'text' ),
					'fact4_label'   => array( __( 'Figure 4 — label', 'mbb' ), 'text' ),
				),
			),
			'links' => array(
				'label'  => __( 'Links', 'mbb' ),
				'fields' => array(
					'login_url'     => array( __( 'Login / meeting platform', 'mbb' ), 'url', __( 'Where the Login buttons point. Leave empty to hide them.', 'mbb' ) ),
					'login_label'   => array( __( 'Login button text', 'mbb' ), 'text' ),
					'issuu_profile' => array( __( 'Issuu profile', 'mbb' ), 'url', __( 'Linked under the brochure gallery.', 'mbb' ) ),
				),
			),
			// No address is collected here. The visitor says which of the two
			// they are and the mailing platform asks for the rest, so consent
			// is recorded where the data is, not on this site.
			'newsletter' => array(
				'label'  => __( 'Mailing list', 'mbb' ),
				'fields' => array(
					'nl_title'   => array( __( 'Title', 'mbb' ), 'text' ),
					'nl_text'    => array( __( 'Introduction', 'mbb' ), 'textarea' ),
					'nl1_label'  => array( __( 'Audience 1 — name', 'mbb' ), 'text' ),
					'nl1_note'   => array( __( 'Audience 1 — who they are', 'mbb' ), 'text' ),
					'nl1_url'    => array( __( 'Audience 1 — form', 'mbb' ), 'url', __( 'Empty both forms and the whole block disappears.', 'mbb' ) ),
					'nl2_label'  => array( __( 'Audience 2 — name', 'mbb' ), 'text' ),
					'nl2_note'   => array( __( 'Audience 2 — who they are', 'mbb' ), 'text' ),
					'nl2_url'    => array( __( 'Audience 2 — form', 'mbb' ), 'url' ),
					'nl_consent' => array( __( 'Note under the choice', 'mbb' ), 'textarea' ),
				),
			),
			'video' => array(
				'label'  => __( 'Latest editions (video)', 'mbb' ),
				'fields' => array(
					'video1_id'      => array( __( 'Video 1 — YouTube ID or URL', 'mbb' ), 'text' ),
					'video1_title'   => array( __( 'Video 1 — title', 'mbb' ), 'text' ),
					'video1_caption' => array( __( 'Video 1 — caption', 'mbb' ), 'textarea' ),
					'video2_id'      => array( __( 'Video 2 — YouTube ID or URL', 'mbb' ), 'text' ),
					'video2_title'   => array( __( 'Video 2 — title', 'mbb' ), 'text' ),
					'video2_caption' => array( __( 'Video 2 — caption', 'mbb' ), 'textarea' ),
				),
			),
			'contact' => array(
				'label'  => __( 'Contact', 'mbb' ),
				'fields' => array(
					'contact_intro' => array( __( 'Introduction', 'mbb' ), 'textarea' ),
					'ch1_title' => array( __( 'Channel 1 — title', 'mbb' ), 'text' ),
					'ch1_note'  => array( __( 'Channel 1 — note', 'mbb' ), 'text' ),
					'ch1_value' => array( __( 'Channel 1 — email / phone', 'mbb' ), 'text' ),
					'ch2_title' => array( __( 'Channel 2 — title', 'mbb' ), 'text' ),
					'ch2_note'  => array( __( 'Channel 2 — note', 'mbb' ), 'text' ),
					'ch2_value' => array( __( 'Channel 2 — email / phone', 'mbb' ), 'text' ),
					'ch3_title' => array( __( 'Channel 3 — title', 'mbb' ), 'text' ),
					'ch3_note'  => array( __( 'Channel 3 — note', 'mbb' ), 'text' ),
					'ch3_value' => array( __( 'Channel 3 — email / phone', 'mbb' ), 'text' ),
					'ch4_title' => array( __( 'Channel 4 — title', 'mbb' ), 'text' ),
					'ch4_note'  => array( __( 'Channel 4 — note', 'mbb' ), 'text' ),
					'ch4_value' => array( __( 'Channel 4 — email / phone', 'mbb' ), 'text' ),
				),
			),
		);
	}

	/** Values shipped with the plugin, used until the team changes them. */
	public static function defaults() {
		return array(
			'edition'      => '2026',
			'dates'        => '6 – 10 October 2026',
			'event_start'  => '2026-10-06',
			'event_end'    => '2026-10-10',
			'day1_label'   => 'Day 1',
			'day1_date'    => 'Tuesday 6 October',
			'day1_theme'   => 'Welcome',
			'day1_summary' => 'Arrival, transfer to the hotel and the welcome dinner at San Mamés stadium.',
			'day2_label'   => 'Day 2',
			'day2_date'    => 'Wednesday 7 October',
			'day2_theme'   => 'Bizkaia',
			'day2_summary' => 'A full day through Bizkaia, in two groups with different routes, ending in lunch together at Bodega Berroja and dinner on a rooftop.',
			'day3_label'   => 'Day 3',
			'day3_date'    => 'Thursday 8 October',
			'day3_theme'   => 'Donostia',
			'day3_summary' => 'Both groups travel together to San Sebastián, and return for dinner reached by boat across the estuary.',
			'day4_label'   => 'Day 4',
			'day4_date'    => 'Friday 9 October',
			'day4_theme'   => 'B2B workshop & Bilbao',
			'day4_summary' => 'The working morning at the Iberdrola Tower, pintxos in the Old Town, and a private visit to the Guggenheim before the farewell dinner.',
			'day5_label'   => 'Day 5',
			'day5_date'    => 'Saturday 10 October',
			'day5_theme'   => 'Departure',
			'day5_summary' => 'Check-out and transfers to the airport.',
			// Empty on purpose: the heading carries the section on its own.
			'prog_intro'   => '',
			'prog_note'    => 'All times are shown in Central European Time. Arrival and departure times follow each participant’s flights and are confirmed individually. The final programme is confirmed to registered participants by email.',
			'calendar_url' => '',
			'hero_kicker'   => '6 – 10 October 2026 · Bilbao, Basque Country',
			'hero_title'    => 'Match Bilbao Bizkaia',
			'hero_year'     => '2026',
			'hero_subtitle' => 'The official professional meeting point of the Bilbao Bizkaia destination.',
			'hero_lead'     => 'Four days of curated B2B meetings, destination knowledge and shared discovery, bringing international buyers together with the tourism professionals who know Bilbao Bizkaia best.',
			'hero_image'    => 0,
			'fact1_value' => '49',  'fact1_label' => 'Local exhibitors',
			'fact2_value' => '5',   'fact2_label' => 'Days of programme',
			'fact3_value' => '1:1', 'fact3_label' => 'Pre-scheduled meetings',
			// A fourth figure is optional: leave it empty and it is not shown.
			'fact4_value' => '',    'fact4_label' => '',
			'login_url'     => 'https://event.meetmaps.com/MATCHBILBAOBIZKAIA2026/en/virtual/join',
			'login_label'   => 'Login',
			'issuu_profile' => 'https://issuu.com/turismobilbao',
			'nl_title'   => 'Stay close to the destination',
			'nl_text'    => 'Receive the Match Bilbao Bizkaia 2026 programme updates, exhibitor announcements and registration reminders.',
			'nl1_label'  => 'Basque supplier',
			'nl1_note'   => 'Companies of the Bilbao Bizkaia destination',
			'nl1_url'    => 'https://bilbaoturismo.us17.list-manage.com/subscribe?u=5be092a34755c7cdec316f8cf&id=35fe8d2bdf',
			'nl2_label'  => 'International trade agent',
			'nl2_note'   => 'Buyers, tour operators and media',
			'nl2_url'    => 'https://bilbaoturismo.us17.list-manage.com/subscribe?u=5be092a34755c7cdec316f8cf&id=010b640237',
			'nl_consent' => 'Both forms open on the Bilbao Turismo mailing platform.',
			'video1_id'      => '2tI7kgSjPi8',
			'video1_title'   => 'Match Bilbao Bizkaia 2025',
			'video1_caption' => 'Highlights of the latest edition: meetings, destination visits and new business connections.',
			'video2_id'      => 'kkrUeAfrWEY',
			'video2_title'   => 'The destination in motion',
			'video2_caption' => 'A short portrait of Bilbao Bizkaia as seen by the professionals who welcome visitors every day.',
			'contact_intro' => 'Our team is here to help you prepare your participation, from registration and meeting scheduling to travel and accreditation.',
			// One address answers everything, so enquiries and platform support
			// are one channel rather than the same address printed twice.
			'ch1_title' => 'Email', 'ch1_note' => 'Programme, registration, participation and platform support', 'ch1_value' => 'welcome@matchbilbaobizkaia.eus',
			'ch2_title' => 'Telephone', 'ch2_note' => 'Monday to Friday, 9:00 – 17:00 CET', 'ch2_value' => '+34 944 205 377',
			'ch3_title' => '', 'ch3_note' => '', 'ch3_value' => '',
			// Left empty on purpose: a channel with no title and no value is
			// skipped, so the fourth slot stays available without showing.
			'ch4_title' => '', 'ch4_note' => '', 'ch4_value' => '',
		);
	}

	public static function all() {
		return wp_parse_args( (array) get_option( self::OPTION, array() ), self::defaults() );
	}

	public static function get( $key, $fallback = '' ) {
		$all = self::all();
		return isset( $all[ $key ] ) && '' !== $all[ $key ] ? $all[ $key ] : $fallback;
	}

	/** The three programme days, as used by the session editor and the front end. */
	public static function days() {
		$days = array();
		for ( $n = 1; $n <= self::DAYS; $n++ ) {
			$days[ $n ] = array(
				'label' => self::get( "day{$n}_label", "Day {$n}" ),
				'date'  => self::get( "day{$n}_date", '' ),
				'theme' => self::get( "day{$n}_theme", '' ),
			);
		}
		return $days;
	}

	/** Accepts a bare ID or any YouTube URL and returns the video ID. */
	public static function youtube_id( $value ) {
		$value = trim( (string) $value );
		if ( '' === $value ) {
			return '';
		}
		if ( preg_match( '~(?:v=|youtu\.be/|/embed/|/shorts/)([A-Za-z0-9_-]{6,})~', $value, $m ) ) {
			return $m[1];
		}
		return preg_match( '~^[A-Za-z0-9_-]{6,}$~', $value ) ? $value : '';
	}

	/**
	 * Turns the ordinary Issuu link of a document into its embeddable reader
	 * URL, so the team can paste the link straight from the browser bar.
	 * A profile link returns '' — the reader needs a document.
	 */
	public static function issuu_embed( $url ) {
		$url = trim( (string) $url );
		if ( '' === $url ) {
			return '';
		}
		if ( false !== strpos( $url, 'e.issuu.com' ) || false !== strpos( $url, 'issuu.com/embed' ) ) {
			return $url;
		}
		if ( preg_match( '~issuu\.com/([^/?#]+)/docs/([^/?#]+)~', $url, $m ) ) {
			return 'https://e.issuu.com/embed.html?u=' . rawurlencode( $m[1] ) . '&d=' . rawurlencode( $m[2] );
		}
		return '';
	}

	/* --- Admin screen -------------------------------------------------------- */

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'register' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
	}

	public static function menu() {
		add_submenu_page(
			'edit.php?post_type=' . MBB_Post_Types::EXHIBITOR,
			__( 'Match settings', 'mbb' ),
			__( 'Settings', 'mbb' ),
			'manage_options',
			'mbb-settings',
			array( __CLASS__, 'render' )
		);
	}

	public static function register() {
		register_setting(
			'mbb_settings_group',
			self::OPTION,
			array( 'sanitize_callback' => array( __CLASS__, 'sanitize' ) )
		);
	}

	public static function sanitize( $input ) {
		$clean = array();
		foreach ( self::schema() as $group ) {
			foreach ( $group['fields'] as $key => $field ) {
				$type  = $field[1];
				$value = isset( $input[ $key ] ) ? $input[ $key ] : '';

				if ( 'url' === $type ) {
					$clean[ $key ] = esc_url_raw( $value );
				} elseif ( 'image' === $type ) {
					$clean[ $key ] = (int) $value;
				} elseif ( 'textarea' === $type ) {
					$clean[ $key ] = sanitize_textarea_field( $value );
				} else {
					$clean[ $key ] = sanitize_text_field( $value );
				}
			}
		}
		return $clean;
	}

	public static function assets( $hook ) {
		if ( false === strpos( $hook, 'mbb-settings' ) ) {
			return;
		}
		wp_enqueue_media();
		wp_add_inline_script(
			'jquery',
			"jQuery(function($){
				$('.mbb-pick').on('click', function(e){
					e.preventDefault();
					var \$btn = $(this), \$in = $('#' + \$btn.data('target'));
					var frame = wp.media({ title: 'Select image', multiple: false });
					frame.on('select', function(){
						var a = frame.state().get('selection').first().toJSON();
						\$in.val(a.id);
						\$btn.siblings('.mbb-preview').html('<img src=\"' + (a.sizes && a.sizes.medium ? a.sizes.medium.url : a.url) + '\" style=\"max-width:240px;height:auto\">');
					});
					frame.open();
				});
				$('.mbb-clear').on('click', function(e){
					e.preventDefault();
					var \$btn = $(this);
					$('#' + \$btn.data('target')).val('');
					\$btn.siblings('.mbb-preview').empty();
				});
			});"
		);
	}

	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$values = self::all();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Match Bilbao Bizkaia — settings', 'mbb' ); ?></h1>
			<p class="description">
				<?php esc_html_e( 'Exhibitors, brochures and the programme are edited in their own menus. Everything else lives here.', 'mbb' ); ?>
			</p>

			<form method="post" action="options.php">
				<?php settings_fields( 'mbb_settings_group' ); ?>

				<?php foreach ( self::schema() as $group_key => $group ) : ?>
					<h2><?php echo esc_html( $group['label'] ); ?></h2>
					<table class="form-table" role="presentation"><tbody>
					<?php foreach ( $group['fields'] as $key => $field ) : ?>
						<?php
						$label = $field[0];
						$type  = $field[1];
						$help  = isset( $field[2] ) ? $field[2] : '';
						$value = isset( $values[ $key ] ) ? $values[ $key ] : '';
						$name  = self::OPTION . '[' . $key . ']';
						$id    = 'mbb-' . $key;
						?>
						<tr>
							<th scope="row"><label for="<?php echo esc_attr( $id ); ?>"><?php echo esc_html( $label ); ?></label></th>
							<td>
								<?php if ( 'textarea' === $type ) : ?>
									<textarea id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( $name ); ?>" rows="3" class="large-text"><?php echo esc_textarea( $value ); ?></textarea>
								<?php elseif ( 'image' === $type ) : ?>
									<input type="hidden" id="<?php echo esc_attr( $id ); ?>" name="<?php echo esc_attr( $name ); ?>" value="<?php echo esc_attr( $value ); ?>">
									<span class="mbb-preview"><?php
										if ( $value ) {
											echo wp_get_attachment_image( (int) $value, 'medium', false, array( 'style' => 'max-width:240px;height:auto' ) );
										}
									?></span><br>
									<button class="button mbb-pick" data-target="<?php echo esc_attr( $id ); ?>"><?php esc_html_e( 'Select image', 'mbb' ); ?></button>
									<button class="button-link mbb-clear" data-target="<?php echo esc_attr( $id ); ?>"><?php esc_html_e( 'Remove', 'mbb' ); ?></button>
								<?php else : ?>
									<input type="<?php echo esc_attr( in_array( $type, array( 'url', 'date' ), true ) ? $type : 'text' ); ?>"
										id="<?php echo esc_attr( $id ); ?>"
										name="<?php echo esc_attr( $name ); ?>"
										value="<?php echo esc_attr( $value ); ?>"
										class="regular-text">
								<?php endif; ?>
								<?php if ( $help ) : ?>
									<p class="description"><?php echo esc_html( $help ); ?></p>
								<?php endif; ?>
							</td>
						</tr>
					<?php endforeach; ?>
					</tbody></table>
				<?php endforeach; ?>

				<?php submit_button(); ?>
			</form>

			<hr>
			<h2><?php esc_html_e( 'Shortcodes', 'mbb' ); ?></h2>
			<p><?php esc_html_e( 'Create a page and paste the whole landing page:', 'mbb' ); ?>
				<code>[mbb_landing]</code></p>
			<p><?php esc_html_e( 'Or place the sections one by one:', 'mbb' ); ?></p>
			<p>
				<code>[mbb_hero]</code> <code>[mbb_event]</code> <code>[mbb_programme]</code>
				<code>[mbb_presentation]…text…[/mbb_presentation]</code>
				<code>[mbb_editions]</code>
				<code>[mbb_experts]…text…[/mbb_experts]</code>
				<code>[mbb_exhibitors]</code> <code>[mbb_discover]</code> <code>[mbb_contact]</code>
			</p>
		</div>
		<?php
	}
}
