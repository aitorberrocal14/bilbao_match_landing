<?php
/**
 * Structured data for the event.
 *
 * Search engines read this to show Match Bilbao Bizkaia as an event — with its
 * dates and its location — rather than as an ordinary page. The values come
 * from the plugin settings, so editing the dates in the admin keeps the markup
 * in step without anybody having to remember it exists.
 *
 * It is printed on the page carrying the [mbb_hero] shortcode, and nowhere
 * else: one page, one event description.
 *
 * @package Match_Bilbao_Bizkaia
 */

defined( 'ABSPATH' ) || exit;

class MBB_Schema {

	/** Set by the hero shortcode; without it nothing is printed. */
	private static $wanted = false;

	public static function init() {
		add_action( 'wp_footer', array( __CLASS__, 'render' ), 5 );
	}

	/** Called by the hero shortcode: this page is the event page. */
	public static function want() {
		self::$wanted = true;
	}

	public static function render() {
		if ( ! self::$wanted ) {
			return;
		}

		$start = self::date( MBB_Settings::get( 'event_start' ) );
		$end   = self::date( MBB_Settings::get( 'event_end' ) );

		// Dates are what makes this worth publishing; without them, skip it
		// rather than emit an event nobody can place in time.
		if ( ! $start ) {
			return;
		}

		$title = trim(
			MBB_Settings::get( 'hero_title' ) . ' ' . MBB_Settings::get( 'hero_year' )
		);

		$data = array(
			'@context'            => 'https://schema.org',
			'@type'               => 'BusinessEvent',
			'name'                => $title,
			'description'         => MBB_Settings::get( 'hero_lead' ),
			'startDate'           => $start,
			'eventStatus'         => 'https://schema.org/EventScheduled',
			'eventAttendanceMode' => 'https://schema.org/OfflineEventAttendanceMode',
			'inLanguage'          => 'en',
			'url'                 => home_url( '/' ),
			'location'            => array(
				'@type'   => 'Place',
				'name'    => 'Bilbao, Bizkaia',
				'address' => array(
					'@type'           => 'PostalAddress',
					'addressLocality' => 'Bilbao',
					'addressRegion'   => 'Bizkaia',
					'addressCountry'  => 'ES',
				),
			),
			'organizer'           => array(
				'@type' => 'Organization',
				'name'  => 'Bilbao Bizkaia',
				'url'   => home_url( '/' ),
				'email' => MBB_Settings::get( 'ch1_value' ),
			),
		);

		if ( $end ) {
			$data['endDate'] = $end;
		}

		$image = self::hero_image_url();
		if ( $image ) {
			$data['image'] = $image;
		}

		printf(
			'<script type="application/ld+json">%s</script>' . "\n",
			wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE )
		);
	}

	/** Normalises whatever the editor typed into the ISO date schema.org wants. */
	private static function date( $value ) {
		$value = trim( (string) $value );
		if ( '' === $value ) {
			return '';
		}
		$time = strtotime( $value );
		return $time ? gmdate( 'Y-m-d', $time ) : '';
	}

	private static function hero_image_url() {
		$id = (int) MBB_Settings::get( 'hero_image' );
		if ( ! $id ) {
			return '';
		}
		$src = wp_get_attachment_image_src( $id, 'full' );
		return $src ? $src[0] : '';
	}
}
