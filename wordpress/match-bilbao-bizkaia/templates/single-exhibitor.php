<?php
/**
 * The exhibitor screen — one page per company, as on the current site.
 *
 * The theme supplies the header, the menu and the footer, so the page sits
 * inside the site exactly like any other. Copy this file into your theme as
 * single-mbb_exhibitor.php to override it.
 *
 * @package Match_Bilbao_Bizkaia
 */

defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
	the_post();
	echo MBB_Template::exhibitor_page( get_post() ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built with escaped parts.
endwhile;

get_footer();
