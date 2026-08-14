<?php
/**
 * Render helpers shared by the shortcodes and the exhibitor template.
 *
 * @package Match_Bilbao_Bizkaia
 */

defined( 'ABSPATH' ) || exit;

class MBB_Icons {

	public static function get( $name ) {
		$icons = array(
			'play'      => '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.5v11l9-5.5-9-5.5Z"/></svg>',
			'download'  => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v8m0 0L4.5 6.5M8 10l3.5-3.5M2.5 13h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
			'close'     => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 3 10 10M13 3 3 13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
			'badge'     => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6.6" r="1.7" stroke="currentColor" stroke-width="1.3"/><path d="M5.2 11.4c.5-1.2 1.6-1.8 2.8-1.8s2.3.6 2.8 1.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
			'briefcase' => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="5" width="12" height="8.5" rx="1.4" stroke="currentColor" stroke-width="1.3"/><path d="M6 5V3.6A1.1 1.1 0 0 1 7.1 2.5h1.8A1.1 1.1 0 0 1 10 3.6V5" stroke="currentColor" stroke-width="1.3"/></svg>',
			'mail'      => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1.4" stroke="currentColor" stroke-width="1.3"/><path d="m2.6 5 5.4 3.9L13.4 5" stroke="currentColor" stroke-width="1.3"/></svg>',
			'phone'     => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3.7c0-.6.5-1.2 1.2-1.2h1.3c.5 0 1 .4 1.1.9l.4 1.8c.1.4-.1.8-.4 1l-.9.7c.8 1.6 2 2.8 3.6 3.6l.7-.9c.2-.3.6-.5 1-.4l1.8.4c.5.1.9.6.9 1.1v1.3c0 .7-.6 1.2-1.2 1.2C7.2 13.2 3 9 3 3.7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
			'link'      => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6.7 9.3a2.6 2.6 0 0 0 3.9.3l1.8-1.8a2.6 2.6 0 0 0-3.7-3.7l-1 1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M9.3 6.7a2.6 2.6 0 0 0-3.9-.3L3.6 8.2a2.6 2.6 0 0 0 3.7 3.7l1-1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
			'pin'       => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 14s4.5-4.2 4.5-7.6A4.5 4.5 0 0 0 3.5 6.4C3.5 9.8 8 14 8 14Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="8" cy="6.4" r="1.6" stroke="currentColor" stroke-width="1.3"/></svg>',
			'support'   => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 5.5v3M8 10.6v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
			'chat'      => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.5 8.5c0 2.5-2.5 4.5-5.5 4.5-.7 0-1.4-.1-2-.3L3 13.5l.8-2.4A4.3 4.3 0 0 1 2.5 8.5C2.5 6 5 4 8 4s5.5 2 5.5 4.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
			'office'    => '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 13.5V4.2L8 2l5.5 2.2v9.3M6 13.5V9h4v4.5" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
		);

		return isset( $icons[ $name ] ) ? $icons[ $name ] : '';
	}
}

class MBB_Template {

	/** A logo tile in the exhibitor grid — the brand is the link. */
	public static function exhibitor_tile( $post ) {
		$terms = wp_get_post_terms( $post->ID, MBB_Post_Types::CATEGORY, array( 'fields' => 'slugs' ) );
		$cat   = ! is_wp_error( $terms ) && $terms ? $terms[0] : '';
		$name  = get_the_title( $post );

		if ( has_post_thumbnail( $post ) ) {
			$logo = get_the_post_thumbnail(
				$post,
				'medium',
				array( 'alt' => $name, 'loading' => 'lazy' )
			);
		} else {
			$initials = self::initials( $name );
			$logo     = '<span class="logo-tile__mark">' . esc_html( $initials ) . '</span>';
		}

		return sprintf(
			'<a class="logo-tile" href="%1$s" data-category="%2$s" title="%3$s">%4$s<span class="logo-tile__name">%3$s</span></a>',
			esc_url( get_permalink( $post ) ),
			esc_attr( $cat ),
			esc_attr( $name ),
			$logo
		);
	}

	private static function initials( $name ) {
		$words = preg_split( '/\s+/', preg_replace( '/[^A-Za-z\s]/', '', $name ) );
		$words = array_slice( array_filter( $words ), 0, 2 );
		$out   = '';
		foreach ( $words as $word ) {
			$out .= strtoupper( substr( $word, 0, 1 ) );
		}
		return $out;
	}

	/** The full exhibitor screen. */
	public static function exhibitor_page( $post ) {
		$terms = wp_get_post_terms( $post->ID, MBB_Post_Types::CATEGORY );
		$cat   = ! is_wp_error( $terms ) && $terms ? $terms[0]->name : '';

		$meta = array();
		foreach ( array( 'contact_name', 'contact_role', 'email', 'phone', 'website', 'website_label', 'address' ) as $key ) {
			$meta[ $key ] = get_post_meta( $post->ID, '_mbb_' . $key, true );
		}

		$rows = array(
			array( 'badge', $meta['contact_name'], '' ),
			array( 'briefcase', $meta['contact_role'], '' ),
			array( 'mail', $meta['email'], $meta['email'] ? 'mailto:' . $meta['email'] : '' ),
			array( 'phone', $meta['phone'], $meta['phone'] ? 'tel:' . preg_replace( '~\s~', '', $meta['phone'] ) : '' ),
			array( 'link', $meta['website_label'] ? $meta['website_label'] : $meta['website'], $meta['website'] ),
			array( 'pin', $meta['address'], '' ),
		);

		$contact = '';
		foreach ( $rows as $row ) {
			list( $icon, $text, $href ) = $row;
			if ( ! $text ) {
				continue;
			}
			$value = $href
				? '<a href="' . esc_url( $href ) . '"' .
					( 0 === strpos( $href, 'http' ) ? ' target="_blank" rel="noopener"' : '' ) .
					'>' . esc_html( $text ) . '</a>'
				: esc_html( $text );

			$contact .= '<li>' . MBB_Icons::get( $icon ) . '<span>' . $value . '</span></li>';
		}

		$logo = has_post_thumbnail( $post )
			? get_the_post_thumbnail( $post, 'large', array( 'class' => 'ex-head__logo', 'alt' => get_the_title( $post ) ) )
			: '<div class="ph" style="aspect-ratio:1/1">' . esc_html__( '[Add a logo]', 'mbb' ) . '</div>';

		$related = self::related( $post );
		$tiles   = '';
		foreach ( $related as $item ) {
			$tiles .= self::exhibitor_tile( $item );
		}

		$directory = MBB_Settings::get( 'landing_url' );
		if ( ! $directory ) {
			$directory = home_url( '/' );
		}
		$directory .= '#exhibitors';

		$html = '<div class="shell ex-page">'
			. '<h1 class="h-1 ex-page__title">' . esc_html( get_the_title( $post ) ) . '</h1>'
			. '<div class="ex-head"><div>' . $logo
			. ( $cat ? '<p class="ex-head__cat">' . esc_html( $cat ) . '</p>' : '' )
			. '</div><ul class="ex-contact">' . $contact . '</ul></div>'
			. '<div class="ex-body text-justify">' . apply_filters( 'the_content', $post->post_content ) . '</div>'
			. '<p class="ex-more"><a class="link-red" href="' . esc_url( $directory ) . '">'
			. esc_html__( 'See more exhibitors > >', 'mbb' ) . '</a></p></div>';

		if ( $tiles ) {
			$html .= '<div class="shell shell--wide"><div class="ex-related">' . $tiles . '</div></div>';
		}

		$html .= '<div class="ex-back"><a class="btn btn--outline btn--sm" href="' . esc_url( $directory ) . '">'
			. esc_html__( 'Back to the directory', 'mbb' ) . '</a></div>';

		return '<div class="mbb">' . $html . '</div>';
	}

	/** Four other exhibitors, same category first. */
	private static function related( $post, $count = 4 ) {
		$all = MBB_Post_Types::exhibitors();
		$all = array_values(
			array_filter(
				$all,
				function ( $item ) use ( $post ) {
					return $item->ID !== $post->ID;
				}
			)
		);

		if ( ! $all ) {
			return array();
		}

		$terms = wp_get_post_terms( $post->ID, MBB_Post_Types::CATEGORY, array( 'fields' => 'ids' ) );
		$same  = array();
		$other = array();

		foreach ( $all as $item ) {
			$item_terms = wp_get_post_terms( $item->ID, MBB_Post_Types::CATEGORY, array( 'fields' => 'ids' ) );
			if ( ! is_wp_error( $terms ) && ! is_wp_error( $item_terms ) && array_intersect( $terms, $item_terms ) ) {
				$same[] = $item;
			} else {
				$other[] = $item;
			}
		}

		$pool = array_merge( $same, $other );
		$out  = array();
		for ( $i = 0; $i < $count && $pool; $i++ ) {
			$out[] = $pool[ $i % count( $pool ) ];
		}
		return $out;
	}

	/** A brochure card in the Discover gallery. */
	public static function brochure_card( $post ) {
		$subtitle = get_post_meta( $post->ID, '_mbb_subtitle', true );
		$pdf      = get_post_meta( $post->ID, '_mbb_pdf_url', true );
		$issuu    = get_post_meta( $post->ID, '_mbb_issuu_url', true );
		$reader   = MBB_Settings::issuu_embed( $issuu );

		$cover = has_post_thumbnail( $post )
			? get_the_post_thumbnail( $post, 'medium_large', array( 'alt' => get_the_title( $post ), 'loading' => 'lazy' ) )
			: '<div class="ph">' . esc_html__( '[Add a cover]', 'mbb' ) . '</div>';

		$links = '';
		if ( $issuu ) {
			$links .= '<a class="brochure__dl" href="' . esc_url( $issuu ) . '" target="_blank" rel="noopener">'
				. MBB_Icons::get( 'link' ) . esc_html__( 'Read on Issuu', 'mbb' ) . '</a>';
		}
		if ( $pdf ) {
			$links .= '<a class="brochure__dl" href="' . esc_url( $pdf ) . '" target="_blank" rel="noopener" download>'
				. MBB_Icons::get( 'download' ) . esc_html__( 'Download PDF', 'mbb' ) . '</a>';
		}

		return sprintf(
			'<article class="brochure">
				<button class="brochure__cover" type="button"
					data-title="%1$s" data-subtitle="%2$s" data-reader="%3$s" data-pdf="%4$s" data-issuu="%5$s"
					aria-label="%6$s">%7$s</button>
				<div class="brochure__meta"><h3>%1$s</h3><p>%2$s</p><div class="brochure__links">%8$s</div></div>
			</article>',
			esc_attr( get_the_title( $post ) ),
			esc_attr( $subtitle ),
			esc_url( $reader ),
			esc_url( $pdf ),
			esc_url( $issuu ),
			esc_attr( sprintf( /* translators: %s: brochure title */ __( 'View brochure: %s', 'mbb' ), get_the_title( $post ) ) ),
			$cover,
			$links
		);
	}

	/** The brochure modal, printed once with the Discover section. */
	public static function modal() {
		return '<div class="modal" id="mbb-modal" data-open="false" role="dialog" aria-modal="true" aria-labelledby="mbb-modal-title">
			<div class="modal__box">
				<div class="modal__head">
					<h3 id="mbb-modal-title"></h3>
					<button class="modal__close" type="button" aria-label="' . esc_attr__( 'Close', 'mbb' ) . '">'
						. MBB_Icons::get( 'close' ) . '</button>
				</div>
				<div class="modal__body" id="mbb-modal-body"></div>
				<div class="modal__foot" id="mbb-modal-foot"></div>
			</div>
		</div>';
	}
}
