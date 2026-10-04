<?php
/** Existing content and Elementor forms/shortcodes are rendered through WordPress. */
if ( ! defined( 'ABSPATH' ) ) { exit; }
get_header();
if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'single' ) ) :
    while ( have_posts() ) : the_post();
        $elementor = 'builder' === get_post_meta( get_the_ID(), '_elementor_edit_mode', true );
        ?>
        <main id="content" class="<?php echo $elementor ? 'wp-elementor-content' : 'wp-content-shell'; ?>" tabindex="-1">
            <?php if ( ! $elementor ) : ?><h1><?php the_title(); ?></h1><?php endif; ?>
            <?php the_content(); wp_link_pages(); ?>
        </main>
        <?php
    endwhile;
endif;
get_footer();
