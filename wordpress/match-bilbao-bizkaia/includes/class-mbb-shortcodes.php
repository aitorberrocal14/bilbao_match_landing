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
		// The page carrying the hero is the event page, so it is the one that
		// gets the structured data.
		MBB_Schema::want();

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

		$groups = array(
			'g1' => __( 'Group 1', 'mbb' ),
			'g2' => __( 'Group 2', 'mbb' ),
		);

		$tabs     = '';
		$panels   = '';
		$overview = '';
		$export   = array();   // handed to the browser to build the calendar file
		$first    = true;

		foreach ( $days as $n => $day ) {
			if ( empty( $sessions[ $n ] ) ) {
				continue;
			}

			$id = 'day-' . $n;

			$tabs .= sprintf(
				'<button class="prog__tab" type="button" role="tab" id="tab-%1$s"
					aria-controls="panel-%1$s" aria-selected="%2$s" tabindex="%3$s">%4$s<span class="d">%5$s</span></button>',
				esc_attr( $id ),
				$first ? 'true' : 'false',
				$first ? '0' : '-1',
				esc_html( $day['date'] ),
				esc_html( $day['label'] )
			);

			// A day splits when its sessions carry a group; nothing else has to
			// be configured for the selector to appear.
			$split = false;
			foreach ( $sessions[ $n ] as $post ) {
				if ( get_post_meta( $post->ID, '_mbb_group', true ) ) {
					$split = true;
					break;
				}
			}

			$slots    = array();   // rendered below, once the parts of the day are known
			$exDay    = array();
			$features = array();
			$timed    = array();

			foreach ( $sessions[ $n ] as $post ) {
				$time    = (string) get_post_meta( $post->ID, '_mbb_time', true );
				$end     = (string) get_post_meta( $post->ID, '_mbb_end', true );
				$text    = (string) get_post_meta( $post->ID, '_mbb_text', true );
				$venue   = (string) get_post_meta( $post->ID, '_mbb_venue', true );
				$group   = (string) get_post_meta( $post->ID, '_mbb_group', true );
				$open    = (string) get_post_meta( $post->ID, '_mbb_open', true );
				$feature = (string) get_post_meta( $post->ID, '_mbb_feature', true );
				$title   = get_the_title( $post );

				$slots[] = array(
					'time'    => $time,
					'end'     => $end,
					'text'    => $text,
					'venue'   => $venue,
					'group'   => $group,
					'open'    => (bool) $open,
					'feature' => (bool) $feature,
					'title'   => $title,
				);

				$exDay[] = array(
					'time'  => $open ? '' : $time,
					'end'   => $end,
					'open'  => (bool) $open,
					'group' => $group,
					'title' => $title,
					'text'  => $text,
					'venue' => $venue,
				);

				$entry = array( 'time' => $open ? '' : $time, 'title' => $title, 'open' => (bool) $open );
				if ( $feature ) {
					$features[] = $entry;
				} elseif ( ! $open ) {
					$timed[] = $entry;
				}
			}

			$export[] = array(
				'id'      => $id,
				'label'   => $day['label'],
				'dateISO' => self::day_iso( $n ),
				'slots'   => $exDay,
			);

			// One timeline per itinerary on a day that splits: the parts of the
			// day have to be worked out over the slots actually on screen.
			if ( $split ) {
				$timelines = self::timeline( $slots, 'g1' ) . self::timeline( $slots, 'g2' );
			} else {
				$timelines = self::timeline( $slots );
			}

			$groupBar = '';
			if ( $split ) {
				$buttons = '';
				$i       = 0;
				foreach ( $groups as $slug => $name ) {
					$buttons .= sprintf(
						'<button class="prog__group" type="button" data-group="%1$s" aria-pressed="%2$s">%3$s</button>',
						esc_attr( $slug ),
						0 === $i++ ? 'true' : 'false',
						esc_html( $name )
					);
				}
				$groupBar = '<div class="prog__groups" role="group" aria-label="' . esc_attr__( 'Itinerary', 'mbb' ) . '">'
					. $buttons
					. '<span class="prog__groups__note">'
					. esc_html__( 'Two itineraries run in parallel on this day.', 'mbb' )
					. '</span></div>';
			}

			$panels .= sprintf(
				'<div class="prog__panel" role="tabpanel" id="panel-%1$s" aria-labelledby="tab-%1$s"%2$s%3$s>
					<p class="prog__theme">%4$s</p>%5$s%6$s
					<p class="prog__day-cal"><button class="btn btn--outline btn--sm" type="button" data-ics="%1$s">%7$s%8$s</button></p>
				</div>',
				esc_attr( $id ),
				$first ? '' : ' hidden',
				$split ? ' data-split="true"' : '',
				esc_html( $day['theme'] ),
				$groupBar,
				$timelines,
				MBB_Icons::get( 'calendar' ),
				esc_html( sprintf( /* translators: %s: day label. */ __( 'Add %s to my calendar', 'mbb' ), strtolower( $day['label'] ) ) )
			);

			/* --- overview ---------------------------------------------------- */
			// The highlights first, topped up with the earliest timed sessions.
			$picks = array_slice( array_merge( $features, $timed ), 0, 3 );
			if ( ! $picks ) {
				$picks = array_slice( $exDay, 0, 3 );
			}
			usort(
				$picks,
				function ( $a, $b ) {
					return strcmp( (string) $a['time'], (string) $b['time'] );
				}
			);

			$lines = '';
			foreach ( $picks as $pick ) {
				$lines .= '<li>'
					. ( empty( $pick['time'] ) ? '' : '<span class="ov__t">' . esc_html( $pick['time'] ) . '</span>' )
					. esc_html( $pick['title'] ) . '</li>';
			}

			$overview .= sprintf(
				'<li class="ov-day">
					<p class="ov-day__date">%1$s</p>
					<h3 class="ov-day__theme">%2$s</h3>
					%3$s
					<ul class="ov-day__list">%4$s</ul>
					%5$s
				</li>',
				esc_html( $day['date'] ),
				esc_html( $day['theme'] ),
				MBB_Settings::get( "day{$n}_summary" )
					? '<p class="ov-day__text">' . esc_html( MBB_Settings::get( "day{$n}_summary" ) ) . '</p>'
					: '',
				$lines,
				$split ? '<p class="ov-day__split">' . esc_html__( 'Two itineraries', 'mbb' ) . '</p>' : ''
			);

			$first = false;
		}

		$intro = MBB_Settings::get( 'prog_intro' );

		$html = '<h2 class="h-prog">' . esc_html__( 'Event Programme', 'mbb' ) . '</h2>'
			. ( $intro
				? '<div class="section-head section-head--center"><p>' . esc_html( $intro ) . '</p></div>'
				: '' )
			. '<div class="prog__bar">'
			. '<div class="prog__views" role="group" aria-label="' . esc_attr__( 'Programme view', 'mbb' ) . '">'
			. '<button class="prog__view" type="button" data-view="overview" aria-pressed="true">' . esc_html__( 'Overview', 'mbb' ) . '</button>'
			. '<button class="prog__view" type="button" data-view="detail" aria-pressed="false">' . esc_html__( 'Day by day', 'mbb' ) . '</button>'
			. '</div>'
			. '<button class="btn btn--sm" type="button" data-ics="all">' . MBB_Icons::get( 'calendar' )
			. esc_html__( 'Add the full programme', 'mbb' ) . '</button>'
			. '</div>'
			. '<div class="prog__pane" data-pane="detail" hidden>'
			. '<div class="prog__tabs" role="tablist" aria-label="' . esc_attr__( 'Programme days', 'mbb' ) . '">'
			. $tabs . '</div>' . $panels . '</div>'
			. '<div class="prog__pane" data-pane="overview">'
			. '<ol class="prog__overview">' . $overview . '</ol></div>';

		$note = MBB_Settings::get( 'prog_note' );
		if ( $note ) {
			$html .= '<p class="prog__note">' . esc_html( $note ) . '</p>';
		}

		// The calendar file is written in the browser from this, by the same
		// code the static site uses, so the two produce identical files.
		$html .= '<script type="application/json" id="mbb-programme">'
			. wp_json_encode(
				array(
					'timezone' => 'Europe/Madrid',
					'groups'   => array(
						array( 'id' => 'g1', 'label' => $groups['g1'] ),
						array( 'id' => 'g2', 'label' => $groups['g2'] ),
					),
					'days'     => $export,
				)
			)
			. '</script>';

		MBB_Plugin::need_assets();
		return '<div class="mbb"><section class="section section--soft" id="programme">'
			. '<div class="shell"><div class="prog-card">' . $html . '</div></div>'
			. '</section></div>';
	}

	/**
	 * One day's slots, cut into the parts of the day. Mirrors timeline() in
	 * assets/js/components.js: the two have to produce the same markup, because
	 * they share a stylesheet.
	 *
	 * @param array  $slots The day's sessions.
	 * @param string $group Render only this itinerary, when the day splits.
	 */
	private static function timeline( $slots, $group = '' ) {
		$labels = array(
			'open'      => __( 'Times follow your flight', 'mbb' ),
			'morning'   => __( 'Morning', 'mbb' ),
			'afternoon' => __( 'Afternoon', 'mbb' ),
			'evening'   => __( 'Evening', 'mbb' ),
		);

		$bands = array();
		foreach ( $slots as $slot ) {
			if ( $group && $slot['group'] !== $group ) {
				continue;
			}

			if ( $slot['open'] || '' === $slot['time'] ) {
				$band = 'open';
			} else {
				$hour = (int) substr( $slot['time'], 0, 2 );
				$band = $hour < 12 ? 'morning' : ( $hour < 18 ? 'afternoon' : 'evening' );
			}
			$bands[ $band ][] = $slot;
		}

		$html = '';
		foreach ( array_keys( $labels ) as $band ) {
			if ( empty( $bands[ $band ] ) ) {
				continue;
			}

			$items = '';
			foreach ( $bands[ $band ] as $slot ) {
				// A line with nothing but a time and a title is a transfer or a
				// meeting point; it does not need the room a described one needs.
				$brief = ( '' === $slot['text'] && '' === $slot['venue'] );

				// The end time is what separates a four-hour workshop from a
				// fifteen minute transfer, so it is shown wherever it is known.
				$time = $slot['open']
					? ''
					: esc_html( $slot['time'] ) .
						( $slot['end'] ? '<span class="tl-item__to">' . esc_html( $slot['end'] ) . '</span>' : '' );

				$items .= sprintf(
					'<li class="tl-item%1$s">
						<span class="tl-item__time">%2$s</span>
						<div class="tl-item__body"><h4>%3$s</h4>%4$s%5$s</div>
					</li>',
					( $slot['feature'] ? ' tl-item--feature' : '' ) . ( $brief ? ' tl-item--brief' : '' ),
					$time,
					esc_html( $slot['title'] ),
					$slot['text'] ? '<p>' . esc_html( $slot['text'] ) . '</p>' : '',
					$slot['venue'] ? '<span class="tl-item__venue">' . esc_html( $slot['venue'] ) . '</span>' : ''
				);
			}

			$html .= '<section class="tl-band"><p class="tl-band__label">'
				. esc_html( $labels[ $band ] ) . '</p>'
				. '<ol class="timeline">' . $items . '</ol></section>';
		}

		return '<div class="tl"' . ( $group ? ' data-group="' . esc_attr( $group ) . '"' : '' ) . '>'
			. $html . '</div>';
	}

	/**
	 * The calendar date of a programme day. The dates the editor types are
	 * prose ("Tuesday 6 October"), so they are read against the event's first
	 * day, which is a real date.
	 */
	private static function day_iso( $n ) {
		$start = strtotime( (string) MBB_Settings::get( 'event_start' ) );
		if ( ! $start ) {
			return '';
		}
		$guess = strtotime( (string) MBB_Settings::get( "day{$n}_date" ) . ' ' . gmdate( 'Y', $start ) );
		if ( $guess ) {
			return gmdate( 'Y-m-d', $guess );
		}
		// Nothing parseable: fall back to counting from the first day.
		return gmdate( 'Y-m-d', strtotime( '+' . ( $n - 1 ) . ' days', $start ) );
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
			. '<div class="dir-tools">'
			. '<div class="filters" role="group" aria-label="' . esc_attr__( 'Filter exhibitors by category', 'mbb' ) . '">'
			. $filters . '</div>'
			. '<div class="dir-search">'
			. '<label class="sr-only" for="ex-search">' . esc_html__( 'Search exhibitors by name', 'mbb' ) . '</label>'
			. '<span class="dir-search__ico" aria-hidden="true">' . MBB_Icons::get( 'searchGlass' ) . '</span>'
			. '<input type="search" id="ex-search" autocomplete="off" spellcheck="false" placeholder="'
			. esc_attr__( 'Search by name', 'mbb' ) . '">'
			. '</div></div>'
			. '<p class="dir-count" id="ex-count" role="status" aria-live="polite"></p>'
			. '<div class="logo-grid" id="ex-grid">' . $tiles . '</div>'
			. '<p class="directory__empty" id="ex-empty" hidden>' . esc_html__( 'No exhibitors match your search.', 'mbb' ) . '</p>';

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
		$items = '';

		for ( $n = 1; $n <= 4; $n++ ) {
			$title = MBB_Settings::get( "ch{$n}_title" );
			$value = MBB_Settings::get( "ch{$n}_value" );
			if ( ! $title && ! $value ) {
				continue;
			}

			// An address becomes a mailto:, a phone number a dialling link.
			if ( is_email( $value ) ) {
				$href = 'mailto:' . $value;
			} elseif ( preg_match( '~^\+?[\d\s]{6,}$~', $value ) ) {
				$href = 'tel:' . preg_replace( '~[^\d+]~', '', $value );
			} else {
				$href = '';
			}

			// The icon follows what the channel actually is, so reordering or
			// emptying a channel cannot leave a telephone wearing an envelope.
			$icon = is_email( $value ) ? 'mail' : ( $href ? 'phone' : 'office' );

			$items .= sprintf(
				'<div class="channel"><span class="channel__icon">%1$s</span>
					<h3>%2$s</h3><p class="note">%3$s</p>%4$s</div>',
				MBB_Icons::get( $icon ),
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
			. '<div class="channels">' . $items . '</div>'
			. self::newsletter();

		return self::wrap( $html, 'contact' );
	}

	/**
	 * The mailing list: a choice between two audiences, each linking to its own
	 * form. Nothing is typed here and nothing is stored here — emptying both
	 * addresses removes the block rather than leaving a dead offer on the page.
	 */
	private static function newsletter() {
		$options = '';

		for ( $n = 1; $n <= 2; $n++ ) {
			$url = MBB_Settings::get( "nl{$n}_url" );
			if ( ! $url ) {
				continue;
			}

			$note = MBB_Settings::get( "nl{$n}_note" );

			$options .= '<a class="nl-opt" href="' . esc_url( $url ) . '" target="_blank" rel="noopener">'
				. '<span class="nl-opt__label">' . esc_html( MBB_Settings::get( "nl{$n}_label" ) ) . '</span>'
				. ( $note ? '<span class="nl-opt__note">' . esc_html( $note ) . '</span>' : '' )
				. '</a>';
		}

		if ( ! $options ) {
			return '';
		}

		$consent = MBB_Settings::get( 'nl_consent' );
		$texto   = MBB_Settings::get( 'nl_text' );

		return '<div class="newsletter">'
			. '<div><h3 class="h-2">' . esc_html( MBB_Settings::get( 'nl_title' ) ) . '</h3>'
			. ( $texto ? '<p>' . esc_html( $texto ) . '</p>' : '' ) . '</div>'
			. '<div><div class="nl-choice">' . $options . '</div>'
			. ( $consent ? '<p class="nl-consent">' . esc_html( $consent ) . '</p>' : '' )
			. '</div></div>';
	}
}
