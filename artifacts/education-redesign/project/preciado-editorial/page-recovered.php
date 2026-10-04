<?php
/**
 * Template Name: Preciado — Contenido recuperado
 * Template Post Type: page
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
?>
<main id="content" tabindex="-1">
<?php while ( have_posts() ) : the_post(); the_content(); endwhile; ?>
</main>
<?php get_footer(); ?>
