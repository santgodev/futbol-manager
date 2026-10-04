<?php if ( ! defined( 'ABSPATH' ) ) { exit; } ?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php if ( ! has_site_icon() ) : ?><link rel="icon" type="image/webp" href="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/favicon.webp' ); ?>"><?php endif; ?>
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php
wp_body_open();
// Existing Elementor Theme Builder locations remain active on restored pages.
if ( ! preciado_recovered_page() && function_exists( 'elementor_theme_do_location' ) && elementor_theme_do_location( 'header' ) ) {
    echo '<a class="skip-link" href="#content">Saltar al contenido</a>';
} elseif ( ! preciado_recovered_page() && has_nav_menu( 'preciado_primary' ) ) {
    ?>
    <a class="skip-link" href="#content">Saltar al contenido</a>
    <header class="site-header">
        <a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>"><span class="brand-name">Preciado.</span><span class="brand-sub">FORMACIÓN Y SOLUCIONES</span></a>
        <button class="menu-toggle" aria-controls="main-nav" aria-expanded="false">Menú <span aria-hidden="true">☰</span></button>
        <nav id="main-nav" class="main-nav" aria-label="Navegación principal">
            <?php wp_nav_menu( array( 'theme_location' => 'preciado_primary', 'container' => false, 'menu_class' => 'wp-menu', 'fallback_cb' => false, 'depth' => 2 ) ); ?>
        </nav>
    </header>
    <?php
} else {
    echo preciado_fragment( 'header' ); // Trusted local markup; dynamic URLs escaped by renderer.
}
?>
