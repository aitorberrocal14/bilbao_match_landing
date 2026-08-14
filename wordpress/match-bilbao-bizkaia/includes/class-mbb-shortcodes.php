<?php
/**
 * Shortcodes — one per section of the landing page.
 *
 * The markup mirrors assets/js/components.js of the static site, so both
 * versions render the same HTML and share the same stylesheet.
 *
 * @package Match_Bilbao_Bizkaia
 */

defined( 'ABSPATH' ) || exit;

class MBB_Shortcodes {

	public static function init() {
		$tags = array(
			'mbb_landing'      => 'landing',
			'mbb_hero'         => 'hero',
			'mbb_event'        => 'event',
			'mbb_programme'    => 'programme',
			'mbb_presentation' => 'presentation',
			'mbb_editions'     => 'editions',
			'mbb_experts'      => 'experts',
			'mbb_exhibitors'   => 'exhibitors',
			'mbb_discover'     => 'discover',
			'mbb_contact'      => 'contact',
		);

		foreach ( $tags as $tag => $method ) {
			add_shortcode( $tag, array( __CLASS__, $method ) );
		}
	}

	/** Wrap a section so the scoped stylesheet applies. */
	private static function wrap( $html, $id = '', $classes = 'section' ) {
		MBB_Plugin::need_assets();

		return sprintf(
			'<div class="mbb"><section class="%1$s"%2$s><div class="shell">%3$s</div></section></div>',
			esc_attr( $classes ),
			$id ? ' id="' . esc_attr( $id ) . '"' : '',
			$html
		);
	}

	private static function login_button( $classes = 'btn' ) {
		$url = MBB_Settings::get( 'login_url' );
		if ( ! $url ) {
			return '';
		}
		return sprintf(
			'<a class="%1$s" href="%2$s">%3$s</a>',
			esc_attr( $classes ),
			esc_url( $url ),
			esc_html( MBB_Settings::get( 'login_label', 'Login' ) )
		);
	}

	/* --- Whole page --------------------------------------------------------- */

	public static function landing() {
		return self::hero()
			. self::event()
			. self::programme()
			. self::presentation()
			. self::editions()
			. self::experts()
			. self::exhibitors()
			. self::discover()
			. self::contact();
	}

	/* --- Hero --------------------------------------------------------------- */

	public static function hero() {
		$image_id = (int) MBB_Settings::get( 'hero_image', 0 );
		$media    = $image_id
			? wp_get_attachment_image( $image_id, 'large', false, array( 'alt' => '' ) )
			: '<div class="ph">' . esc_html__( '[Add a hero image in Match settings]', 'mbb' ) . '</div>';

		$facts = '';
		for ( $n = 1; $n <= 4; $n++ ) {
			$value = MBB_Settings::get( "fact{$n}_value" );
			$label = MBB_Settings::get( "fact{$n}_label" );
			if ( ! $value && ! $label ) {
				continue;
			}
			$facts .= sprintf(
				'<div class="hero__fact"><span class="v">%s</span><span class="l">%s</span></div>',
				esc_html( $value ),
				esc_html( $label )
			);
		}

		$html = sprintf(
			'<div class="hero__inner">
				<div>
					<p class="hero__dates">%1$s</p>
					<h1 class="h-hero hero__title">%2$s <span class="yr">%3$s</span></h1>
					<p class="hero__subtitle">%4$s</p>
					<p class="hero__lead lead">%5$s</p>
					<div class="hero__ctas">
						<a class="btn btn--lg" href="#event">%6$s</a>
						<a class="btn btn--lg btn--outline" href="#experts">%7$s</a>
						%8$s
					</div>
				</div>
				<div class="hero__media">%9$s</div>
			</div>',
			esc_html( MBB_Settings::get( 'hero_kicker' ) ),
			esc_html( MBB_Settings::get( 'hero_title' ) ),
			esc_html( MBB_Settings::get( 'hero_year' ) ),
			esc_html( MBB_Settings::get( 'hero_subtitle' ) ),
			esc_html( MBB_Settings::get( 'hero_lead' ) ),
			esc_html__( 'Explore the event', 'mbb' ),
			esc_html__( "Meet BB's Experts", 'mbb' ),
			self::login_button( 'btn btn--lg btn--outline' ),
			$media
		);

		if ( $facts ) {
			$html .= '<div class="hero__facts">' . $facts . '</div>';
		}

		MBB_Plugin::need_assets();
		return '<div class="mbb"><section class="hero" id="home"><div class="shell">' . $html . '</div></section></div>';
	}

	/* --- Event introduction -------------------------------------------------- */

	public static function event( $atts = array(), $content = '' ) {
		$calendar = MBB_Settings::get( 'calendar_url' );

		$html = '<div class="section-head">'
			. '<h2 class="h-1">' . esc_html__( 'Match Bilbao Bizkaia', 'mbb' ) . ' '
			. esc_html( MBB_Settings::get( 'edition' ) ) . '</h2>';

		if ( $content ) {
			$html .= '<div class="lead measure">' . wp_kses_post( do_shortcode( $content ) ) . '</div>';
		}

		if ( $calendar ) {
			$html .= '<p style="margin-top:1.5rem"><a class="btn" href="' . esc_url( $calendar ) .
				'" target="_blank" rel="noopener">' . esc_html__( 'Add to calendar', 'mbb' ) . '</a></p>';
		}

		$html .= '</div>';

		return self::wrap( $html, 'event' );
	}

	/* --- Programme ----------------------------------------------------------- */

	public static function programme() {
		$days     = MBB_Settings::days();
		$sessions = MBB_Post_Types::sessions_by_day();

		if ( ! $sessions ) {
			return '';
		}

		$tabs   = '';
		$panels = '';
		$first  = true;

		foreach ( $days as $n => $day ) {
			if ( empty( $sessions[ $n ] ) ) {
				continue;
			}

			$tabs .= sprintf(
				'<button class="prog__tab" type="button" role="tab" id="tab-day-%1$d"
					aria-controls="panel-day-%1$d" aria-selected="%2$s" tabindex="%3$s">%4$s<span class="d">%5$s</span></button>',
				$n,
				$first ? 'true' : 'false',
				$first ? '0' : '-1',
				esc_html( $day['date'] ),
				esc_html( $day['label'] )
			);

			$items = '';
			foreach ( $sessions[ $n ] as $post ) {
				$text    = get_post_meta( $post->ID, '_mbb_text', true );
				$venue   = get_post_meta( $post->ID, '_mbb_venue', true );
				$feature = get_post_meta( $post->ID, '_mbb_feature', true );

				$items .= sprintf(
					'<li class="tl-item%1$s">
						<span class="tl-item__time">%2$s</span>
						<div class="tl-item__body"><h4>%3$s</h4>%4$s%5$s</div>
					</li>',
					$feature ? ' tl-item--feature' : '',
					esc_html( get_post_meta( $post->ID, '_mbb_time', true ) ),
					esc_html( get_the_title( $post ) ),
					$text ? '<p>' . esc_html( $text ) . '</p>' : '',
					$venue ? '<span class="tl-item__venue">' . esc_html( $venue ) . '</span>' : ''
				);
			}

			$panels .= sprintf(
				'<div class="prog__panel" role="tabpanel" id="panel-day-%1$d" aria-labelledby="tab-day-%1$d"%2$s>
					<p class="prog__theme">%3$s</p><ol class="timeline">%4$s</ol>
				</div>',
				$n,
				$first ? '' : ' hidden',
				esc_html( $day['theme'] ),
				$items
			);

			$first = false;
		}

		// The programme is the heart of the page, so it gets a raised card of
		// its own rather than reading as one more quiet block.
		$intro = MBB_Settings::get( 'prog_intro' );

		$html = '<h2 class="h-prog">' . esc_html__( 'Event Programme', 'mbb' ) . '</h2>'
			. ( $intro
				? '<div class="section-head section-head--center"><p>' . esc_html( $intro ) . '</p></div>'
				: '' )
			. '<div class="prog__tabs" role="tablist" aria-label="' . esc_attr__( 'Programme days', 'mbb' ) . '">'
			. $tabs . '</div>' . $panels;

		$note = MBB_Settings::get( 'prog_note' );
		if ( $note ) {
			$html .= '<p class="prog__note">' . esc_html( $note ) . '</p>';
		}

		MBB_Plugin::need_assets();
		return '<div class="mbb"><section class="section section--soft" id="programme">'
			. '<div class="shell"><div class="prog-card">' . $html . '</div></div>'
			. '</section></div>';
	}

	/* --- Presentation of Bilbao ---------------------------------------------- */

	public static function presentation( $atts = array(), $content = '' ) {
		$atts = shortcode_atts(
			array(
				'title'  => __( 'Presentation of Bilbao', 'mbb' ),
				'images' => '', // comma-separated attachment IDs
			),
			$atts,
			'mbb_presentation'
		);

		$media = '';
		foreach ( array_filter( array_map( 'intval', explode( ',', $atts['images'] ) ) ) as $id ) {
			$media .= '<figure>' . wp_get_attachment_image( $id, 'large', false, array( 'alt' => '' ) );
			$caption = wp_get_attachment_caption( $id );
			if ( $caption ) {
				$media .= '<figcaption class="present__cap">' . esc_html( $caption ) . '</figcaption>';
			}
			$media .= '</figure>';
		}

		$html = '<div class="present"><div>'
			. '<h2 class="h-1">' . esc_html( $atts['title'] ) . '</h2>'
			. '<div class="text-justify">' . wp_kses_post( do_shortcode( $content ) ) . '</div>'
			. '</div>';

		if ( $media ) {
			$html .= '<div class="present__media">' . $media . '</div>';
		}
		$html .= '</div>';

		return self::wrap( $html, 'presentation' );
	}

	/* --- Latest editions ------------------------------------------------------ */

	public static function editions() {
		$cards = '';

		for ( $n = 1; $n <= 2; $n++ ) {
			$id      = MBB_Settings::youtube_id( MBB_Settings::get( "video{$n}_id" ) );
			$title   = MBB_Settings::get( "video{$n}_title" );
			$caption = MBB_Settings::get( "video{$n}_caption" );

			if ( ! $id && ! $title ) {
				continue;
			}

			if ( $id ) {
				$frame = sprintf(
					'<img src="https://i.ytimg.com/vi/%1$s/maxresdefault.jpg" alt="" loading="lazy"
						data-fallback="src" data-src-alt="https://i.ytimg.com/vi/%1$s/hqdefault.jpg">
					<button class="video__play" type="button" data-yt="%1$s" aria-label="%2$s">%3$s</button>',
					esc_attr( $id ),
					esc_attr( sprintf( /* translators: %s: video title */ __( 'Play: %s', 'mbb' ), $title ) ),
					MBB_Icons::get( 'play' )
				);
			} else {
				$frame = '<button class="video__play" type="button" disabled>' . MBB_Icons::get( 'play' ) . '</button>'
					. '<span class="video__ph">' . esc_html__( '[Add the video in Match settings]', 'mbb' ) . '</span>';
			}

			$cards .= sprintf(
				'<article><div class="video__frame">%1$s</div>
					<div class="video__meta"><h3>%2$s</h3><p>%3$s</p></div></article>',
				$frame,
				esc_html( $title ),
				esc_html( $caption )
			);
		}

		if ( ! $cards ) {
			return '';
		}

		$html = '<div class="section-head section-head--center">'
			. '<h2 class="h-1">' . esc_html__( 'Match Bilbao Bizkaia Latest Editions', 'mbb' ) . '</h2></div>'
			. '<div class="videos">' . $cards . '</div>';

		return self::wrap( $html, 'editions', 'section section--soft' );
	}

	/* --- Meet BB's Experts ----------------------------------------------------- */

	public static function experts( $atts = array(), $content = '' ) {
		$atts = shortcode_atts(
			array(
				'title'       => __( "Meet BB's Experts", 'mbb' ),
				'panel_title' => __( 'Already registered?', 'mbb' ),
				'panel_text'  => __( 'Access your profile, your availability and your confirmed meeting agenda on the Match Bilbao Bizkaia platform.', 'mbb' ),
			),
			$atts,
			'mbb_experts'
		);

		$html = '<div class="section-head section-head--center">'
			. '<h2 class="h-1">' . esc_html( $atts['title'] ) . '</h2>'
			. wp_kses_post( do_shortcode( $content ) ) . '</div>';

		$login = self::login_button( 'btn btn--lg btn--light' );
		if ( $login ) {
			$html .= sprintf(
				'<div class="login-band"><div><h3>%1$s</h3><p>%2$s</p></div>%3$s</div>',
				esc_html( $atts['panel_title'] ),
				esc_html( $atts['panel_text'] ),
				$login
			);
		}

		return self::wrap( $html, 'experts' );
	}

	/* --- Exhibitors ------------------------------------------------------------ */

	public static function exhibitors( $atts = array() ) {
		$atts = shortcode_atts(
			array(
				'title' => __( 'Exhibitors', 'mbb' ),
				'text'  => __( 'The professionals of the Bilbao Bizkaia destination taking part in the event.', 'mbb' ),
			),
			$atts,
			'mbb_exhibitors'
		);

		$posts = MBB_Post_Types::exhibitors();
		if ( ! $posts ) {
			return '';
		}

		// Only categories that actually have exhibitors get a filter.
		$terms = get_terms(
			array(
				'taxonomy'   => MBB_Post_Types::CATEGORY,
				'hide_empty' => true,
			)
		);

		$filters = '<button class="filter" type="button" data-filter="all" aria-pressed="true">'
			. esc_html__( 'All', 'mbb' ) . '</button>';

		if ( ! is_wp_error( $terms ) ) {
			foreach ( $terms as $term ) {
				$filters .= sprintf(
					'<button class="filter" type="button" data-filter="%1$s" aria-pressed="false">%2$s</button>',
					esc_attr( $term->slug ),
					esc_html( $term->name )
				);
			}
		}

		$tiles = '';
		foreach ( $posts as $post ) {
			$tiles .= MBB_Template::exhibitor_tile( $post );
		}

		$html = '<div class="section-head section-head--center">'
			. '<h2 class="h-1">' . esc_html( $atts['title'] ) . '</h2>'
			. '<p>' . esc_html( $atts['text'] ) . '</p></div>'
			. '<div class="filters" role="group" aria-label="' . esc_attr__( 'Filter exhibitors by category', 'mbb' ) . '">'
			. $filters . '</div>'
			. '<div class="logo-grid" id="ex-grid">' . $tiles . '</div>'
			. '<p class="directory__empty" id="ex-empty" hidden>' . esc_html__( 'No exhibitors in this category.', 'mbb' ) . '</p>';

		MBB_Plugin::need_assets();
		return '<div class="mbb"><section class="section" id="exhibitors"><div class="shell shell--wide">'
			. $html . '</div></section></div>';
	}

	/* --- Discover -------------------------------------------------------------- */

	public static function discover( $atts = array() ) {
		$atts = shortcode_atts(
			array(
				'title' => __( 'Discover Bilbao Bizkaia', 'mbb' ),
				'text'  => __( 'Our official guides to Bilbao Bizkaia, in English. Browse them online or download them to prepare your programmes, itineraries and client proposals.', 'mbb' ),
			),
			$atts,
			'mbb_discover'
		);

		$posts = MBB_Post_Types::brochures();
		if ( ! $posts ) {
			return '';
		}

		$cards = '';
		foreach ( $posts as $post ) {
			$cards .= MBB_Template::brochure_card( $post );
		}

		$html = '<div class="section-head section-head--center">'
			. '<h2 class="h-1">' . esc_html( $atts['title'] ) . '</h2>'
			. '<p>' . esc_html( $atts['text'] ) . '</p></div>'
			. '<div class="brochures">' . $cards . '</div>';

		$profile = MBB_Settings::get( 'issuu_profile' );
		if ( $profile ) {
			$html .= '<p class="brochures__all"><a class="link-red" href="' . esc_url( $profile ) .
				'" target="_blank" rel="noopener">' .
				esc_html__( 'See all our publications on Issuu > >', 'mbb' ) . '</a></p>';
		}

		$html .= MBB_Template::modal();

		return self::wrap( $html, 'discover', 'section section--soft' );
	}

	/* --- Contact ---------------------------------------------------------------- */

	public static function contact() {
		$icons = array( 'mail', 'support', 'chat', 'office' );
		$items = '';

		for ( $n = 1; $n <= 4; $n++ ) {
			$title = MBB_Settings::get( "ch{$n}_title" );
			$value = MBB_Settings::get( "ch{$n}_value" );
			if ( ! $title && ! $value ) {
				continue;
			}

			// An address becomes a mailto:, a phone number a WhatsApp link.
			if ( is_email( $value ) ) {
				$href = 'mailto:' . $value;
			} elseif ( preg_match( '~^\+?[\d\s]{6,}$~', $value ) ) {
				$href = 'https://wa.me/' . preg_replace( '~\D~', '', $value );
			} else {
				$href = '';
			}

			$items .= sprintf(
				'<div class="channel"><span class="channel__icon">%1$s</span>
					<h3>%2$s</h3><p class="note">%3$s</p>%4$s</div>',
				MBB_Icons::get( $icons[ $n - 1 ] ),
				esc_html( $title ),
				esc_html( MBB_Settings::get( "ch{$n}_note" ) ),
				$href
					? '<a href="' . esc_url( $href ) . '"' .
						( 0 === strpos( $href, 'http' ) ? ' target="_blank" rel="noopener"' : '' ) .
						'>' . esc_html( $value ) . '</a>'
					: '<span>' . esc_html( $value ) . '</span>'
			);
		}

		$html = '<div class="section-head section-head--center">'
			. '<h2 class="h-1">' . esc_html__( 'Contact', 'mbb' ) . '</h2>'
			. '<p>' . esc_html( MBB_Settings::get( 'contact_intro' ) ) . '</p></div>'
			. '<div class="channels">' . $items . '</div>';

		return self::wrap( $html, 'contact' );
	}
}
