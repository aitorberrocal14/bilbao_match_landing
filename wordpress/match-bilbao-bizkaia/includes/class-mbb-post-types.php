<?php
/**
 * Content types: exhibitors, brochures and programme sessions.
 *
 * Everything the team edits regularly lives here, so it is managed from the
 * WordPress admin like any other content — no code, no FTP.
 *
 * @package Match_Bilbao_Bizkaia
 */

defined( 'ABSPATH' ) || exit;

class MBB_Post_Types {

	const EXHIBITOR = 'mbb_exhibitor';
	const BROCHURE  = 'mbb_brochure';
	const SESSION   = 'mbb_session';
	const CATEGORY  = 'mbb_exhibitor_cat';

	/** Meta fields per post type: key => [label, type]. */
	public static function fields( $post_type ) {
		$map = array(
			self::EXHIBITOR => array(
				'contact_name'  => array( __( 'Contact person', 'mbb' ), 'text' ),
				'contact_role'  => array( __( 'Role', 'mbb' ), 'text' ),
				'email'         => array( __( 'Email', 'mbb' ), 'email' ),
				'phone'         => array( __( 'Phone', 'mbb' ), 'text' ),
				'website'       => array( __( 'Website (full URL)', 'mbb' ), 'url' ),
				'website_label' => array( __( 'Website (shown as)', 'mbb' ), 'text' ),
				'address'       => array( __( 'Address', 'mbb' ), 'textarea' ),
			),
			self::BROCHURE  => array(
				'subtitle' => array( __( 'Subtitle', 'mbb' ), 'text' ),
				'pdf_url'  => array( __( 'PDF link', 'mbb' ), 'url' ),
				'issuu_url' => array(
					__( 'Issuu link', 'mbb' ),
					'url',
					__( 'Paste the normal link of the document, e.g. https://issuu.com/turismobilbao/docs/city_experience_en — it is turned into the embedded reader automatically.', 'mbb' ),
				),
			),
			self::SESSION   => array(
				'day'     => array( __( 'Day', 'mbb' ), 'day' ),
				'time'    => array( __( 'Start (CET)', 'mbb' ), 'text', __( '24-hour, e.g. 19:30. Leave empty for something that follows a flight rather than the programme.', 'mbb' ) ),
				'end'     => array( __( 'End (CET)', 'mbb' ), 'text', __( 'Optional. Without it the session runs until the next one, which is what the calendar file assumes.', 'mbb' ) ),
				'text'    => array( __( 'Description', 'mbb' ), 'textarea' ),
				'venue'   => array( __( 'Venue', 'mbb' ), 'text' ),
				'group'   => array( __( 'Itinerary', 'mbb' ), 'group', __( 'Only for a day that splits into two groups. Leave as "Everyone" otherwise.', 'mbb' ) ),
				'feature' => array( __( 'Highlight this session', 'mbb' ), 'checkbox' ),
			),
		);

		return isset( $map[ $post_type ] ) ? $map[ $post_type ] : array();
	}

	public static function init() {
		add_action( 'init', array( __CLASS__, 'register' ) );
		add_action( 'add_meta_boxes', array( __CLASS__, 'add_meta_boxes' ) );
		add_action( 'save_post', array( __CLASS__, 'save' ), 10, 2 );

		// Exhibitors are listed and sorted by hand, like the current site.
		add_filter( 'manage_' . self::EXHIBITOR . '_posts_columns', array( __CLASS__, 'columns' ) );
		add_action( 'manage_' . self::EXHIBITOR . '_posts_custom_column', array( __CLASS__, 'column' ), 10, 2 );
		add_filter( 'manage_' . self::SESSION . '_posts_columns', array( __CLASS__, 'session_columns' ) );
		add_action( 'manage_' . self::SESSION . '_posts_custom_column', array( __CLASS__, 'session_column' ), 10, 2 );
	}

	public static function register() {
		register_post_type(
			self::EXHIBITOR,
			array(
				'labels'        => array(
					'name'          => __( 'Exhibitors', 'mbb' ),
					'singular_name' => __( 'Exhibitor', 'mbb' ),
					'add_new_item'  => __( 'Add exhibitor', 'mbb' ),
					'edit_item'     => __( 'Edit exhibitor', 'mbb' ),
					'search_items'  => __( 'Search exhibitors', 'mbb' ),
					'menu_name'     => __( 'Match Bilbao Bizkaia', 'mbb' ),
				),
				'public'        => true,
				'has_archive'   => false,
				'menu_icon'     => 'dashicons-groups',
				'menu_position' => 26,
				// The logo is the featured image; the profile text is the editor.
				'supports'      => array( 'title', 'editor', 'thumbnail', 'page-attributes', 'revisions' ),
				'rewrite'       => array( 'slug' => 'exhibitors', 'with_front' => false ),
				'show_in_rest'  => true,
			)
		);

		register_taxonomy(
			self::CATEGORY,
			self::EXHIBITOR,
			array(
				'labels'            => array(
					'name'          => __( 'Categories', 'mbb' ),
					'singular_name' => __( 'Category', 'mbb' ),
					'add_new_item'  => __( 'Add category', 'mbb' ),
				),
				'hierarchical'      => true,
				'public'            => true,
				'show_admin_column' => true,
				'show_in_rest'      => true,
				'rewrite'           => array( 'slug' => 'exhibitor-category', 'with_front' => false ),
			)
		);

		register_post_type(
			self::BROCHURE,
			array(
				'labels'       => array(
					'name'          => __( 'Brochures', 'mbb' ),
					'singular_name' => __( 'Brochure', 'mbb' ),
					'add_new_item'  => __( 'Add brochure', 'mbb' ),
					'edit_item'     => __( 'Edit brochure', 'mbb' ),
				),
				'public'       => false,
				'show_ui'      => true,
				'show_in_menu' => 'edit.php?post_type=' . self::EXHIBITOR,
				// The cover is the featured image.
				'supports'     => array( 'title', 'thumbnail', 'page-attributes' ),
			)
		);

		register_post_type(
			self::SESSION,
			array(
				'labels'       => array(
					'name'          => __( 'Programme', 'mbb' ),
					'singular_name' => __( 'Session', 'mbb' ),
					'add_new_item'  => __( 'Add session', 'mbb' ),
					'edit_item'     => __( 'Edit session', 'mbb' ),
				),
				'public'       => false,
				'show_ui'      => true,
				'show_in_menu' => 'edit.php?post_type=' . self::EXHIBITOR,
				'supports'     => array( 'title', 'page-attributes' ),
			)
		);
	}

	/* --- Meta boxes -------------------------------------------------------- */

	public static function add_meta_boxes() {
		foreach ( array( self::EXHIBITOR, self::BROCHURE, self::SESSION ) as $type ) {
			add_meta_box(
				'mbb_details',
				__( 'Details', 'mbb' ),
				array( __CLASS__, 'render_meta_box' ),
				$type,
				'normal',
				'high'
			);
		}
	}

	public static function render_meta_box( $post ) {
		wp_nonce_field( 'mbb_save_' . $post->ID, 'mbb_nonce' );
		$fields = self::fields( $post->post_type );

		echo '<table class="form-table"><tbody>';
		foreach ( $fields as $key => $field ) {
			$label = $field[0];
			$type  = $field[1];
			$help  = isset( $field[2] ) ? $field[2] : '';
			$value = get_post_meta( $post->ID, '_mbb_' . $key, true );
			$id    = 'mbb_' . $key;

			echo '<tr><th scope="row"><label for="' . esc_attr( $id ) . '">' .
				esc_html( $label ) . '</label></th><td>';

			if ( 'textarea' === $type ) {
				printf(
					'<textarea id="%1$s" name="%1$s" rows="3" class="large-text">%2$s</textarea>',
					esc_attr( $id ),
					esc_textarea( $value )
				);
			} elseif ( 'checkbox' === $type ) {
				printf(
					'<label><input type="checkbox" id="%1$s" name="%1$s" value="1" %2$s> %3$s</label>',
					esc_attr( $id ),
					checked( $value, '1', false ),
					esc_html__( 'Yes', 'mbb' )
				);
			} elseif ( 'day' === $type ) {
				$days = MBB_Settings::days();
				printf( '<select id="%1$s" name="%1$s">', esc_attr( $id ) );
				foreach ( $days as $n => $day ) {
					printf(
						'<option value="%1$s" %2$s>%3$s</option>',
						esc_attr( $n ),
						selected( (string) $value, (string) $n, false ),
						esc_html( sprintf( '%s — %s', $day['label'], $day['date'] ) )
					);
				}
				echo '</select>';
			} elseif ( 'group' === $type ) {
				// Only the day that splits uses this; everything else is shared.
				$choices = array(
					''   => __( 'Everyone', 'mbb' ),
					'g1' => __( 'Group 1', 'mbb' ),
					'g2' => __( 'Group 2', 'mbb' ),
				);
				printf( '<select id="%1$s" name="%1$s">', esc_attr( $id ) );
				foreach ( $choices as $slug => $name ) {
					printf(
						'<option value="%1$s" %2$s>%3$s</option>',
						esc_attr( $slug ),
						selected( (string) $value, (string) $slug, false ),
						esc_html( $name )
					);
				}
				echo '</select>';
			} else {
				printf(
					'<input type="%1$s" id="%2$s" name="%2$s" value="%3$s" class="regular-text">',
					esc_attr( $type ),
					esc_attr( $id ),
					esc_attr( $value )
				);
			}

			if ( $help ) {
				echo '<p class="description">' . esc_html( $help ) . '</p>';
			}
			echo '</td></tr>';
		}
		echo '</tbody></table>';

		if ( self::EXHIBITOR === $post->post_type ) {
			echo '<p class="description">' .
				esc_html__( 'The logo is the featured image and the profile text is the main editor. Use “Order” under Page Attributes to place the exhibitor in the grid.', 'mbb' ) .
				'</p>';
		}
		if ( self::BROCHURE === $post->post_type ) {
			echo '<p class="description">' .
				esc_html__( 'The cover is the featured image (800×1024 works best).', 'mbb' ) .
				'</p>';
		}
	}

	public static function save( $post_id, $post ) {
		$fields = self::fields( $post->post_type );
		if ( ! $fields ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( ! isset( $_POST['mbb_nonce'] ) ||
			! wp_verify_nonce( sanitize_key( $_POST['mbb_nonce'] ), 'mbb_save_' . $post_id ) ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		foreach ( $fields as $key => $field ) {
			$type  = $field[1];
			$name  = 'mbb_' . $key;
			$value = isset( $_POST[ $name ] ) ? wp_unslash( $_POST[ $name ] ) : '';

			if ( 'checkbox' === $type ) {
				$value = $value ? '1' : '';
			} elseif ( 'url' === $type ) {
				$value = esc_url_raw( $value );
			} elseif ( 'email' === $type ) {
				$value = sanitize_email( $value );
			} elseif ( 'textarea' === $type ) {
				$value = sanitize_textarea_field( $value );
			} else {
				$value = sanitize_text_field( $value );
			}

			update_post_meta( $post_id, '_mbb_' . $key, $value );
		}
	}

	/* --- Admin columns ------------------------------------------------------ */

	public static function columns( $columns ) {
		$new = array();
		foreach ( $columns as $key => $label ) {
			if ( 'title' === $key ) {
				$new['mbb_logo'] = __( 'Logo', 'mbb' );
			}
			$new[ $key ] = $label;
		}
		return $new;
	}

	public static function column( $column, $post_id ) {
		if ( 'mbb_logo' !== $column ) {
			return;
		}
		if ( has_post_thumbnail( $post_id ) ) {
			echo get_the_post_thumbnail( $post_id, array( 60, 60 ), array( 'style' => 'object-fit:contain' ) );
		} else {
			echo '<span style="color:#a00">' . esc_html__( 'No logo', 'mbb' ) . '</span>';
		}
	}

	public static function session_columns( $columns ) {
		$new = array( 'cb' => $columns['cb'] );
		$new['mbb_day']  = __( 'Day', 'mbb' );
		$new['mbb_time'] = __( 'Time', 'mbb' );
		$new['title']    = __( 'Session', 'mbb' );
		$new['date']     = $columns['date'];
		return $new;
	}

	public static function session_column( $column, $post_id ) {
		if ( 'mbb_day' === $column ) {
			$days = MBB_Settings::days();
			$day  = get_post_meta( $post_id, '_mbb_day', true );
			echo isset( $days[ $day ] ) ? esc_html( $days[ $day ]['date'] ) : '—';
		}
		if ( 'mbb_time' === $column ) {
			echo esc_html( get_post_meta( $post_id, '_mbb_time', true ) );
		}
	}

	/* --- Queries ------------------------------------------------------------ */

	/** All exhibitors, in the order set with Page Attributes then by title. */
	public static function exhibitors() {
		return get_posts(
			array(
				'post_type'      => self::EXHIBITOR,
				'posts_per_page' => -1,
				'orderby'        => array( 'menu_order' => 'ASC', 'title' => 'ASC' ),
				'order'          => 'ASC',
			)
		);
	}

	public static function brochures() {
		return get_posts(
			array(
				'post_type'      => self::BROCHURE,
				'posts_per_page' => -1,
				'orderby'        => array( 'menu_order' => 'ASC', 'title' => 'ASC' ),
				'order'          => 'ASC',
			)
		);
	}

	/** Sessions grouped by day, sorted by time within each day. */
	public static function sessions_by_day() {
		$posts = get_posts(
			array(
				'post_type'      => self::SESSION,
				'posts_per_page' => -1,
				'orderby'        => array( 'menu_order' => 'ASC' ),
				'order'          => 'ASC',
			)
		);

		$days = array();
		foreach ( $posts as $post ) {
			$day = get_post_meta( $post->ID, '_mbb_day', true );
			$day = $day ? (int) $day : 1;
			$days[ $day ][] = $post;
		}

		foreach ( $days as &$list ) {
			usort(
				$list,
				function ( $a, $b ) {
					return strcmp(
						(string) get_post_meta( $a->ID, '_mbb_time', true ),
						(string) get_post_meta( $b->ID, '_mbb_time', true )
					);
				}
			);
		}
		unset( $list );

		ksort( $days );
		return $days;
	}
}
