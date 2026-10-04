<?php
/** Preciado Editorial. No database changes are made on theme activation. */
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'after_setup_theme', function () {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'gallery', 'caption', 'style', 'script' ) );
    register_nav_menus( array( 'preciado_primary' => 'Preciado — Navegación principal' ) );
} );

add_action( 'wp_enqueue_scripts', function () {
    $base = get_stylesheet_directory_uri();
    $file = get_stylesheet_directory() . '/assets/design.css';
    wp_enqueue_style( 'preciado-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap', array(), null );
    wp_enqueue_style( 'preciado-design', $base . '/assets/design.css', array(), filemtime( $file ) );
    wp_enqueue_script( 'preciado-site', $base . '/assets/site.js', array(), '1.0.0', array( 'strategy' => 'defer', 'in_footer' => true ) );
}, 100 );

function preciado_manifest() {
    static $pages = null;
    if ( null === $pages ) {
        $pages = json_decode( file_get_contents( get_stylesheet_directory() . '/pages.json' ), true ) ?: array();
    }
    return $pages;
}

function preciado_recovered_page() {
    if ( ! is_singular() || ! is_page_template( 'page-recovered.php' ) ) { return null; }
    if ( ! metadata_exists( 'post', get_queried_object_id(), '_preciado_recovery_key' ) ) { return null; }
    $key = get_post_meta( get_queried_object_id(), '_preciado_recovery_key', true );
    foreach ( preciado_manifest() as $page ) {
        if ( $key === $page['slug'] ) { return $page; }
    }
    return null;
}

add_filter( 'body_class', function ( $classes ) {
    $classes[] = 'preciado-site';
    $page = preciado_recovered_page();
    if ( $page && 'psychology' === $page['area'] ) { $classes[] = 'area-psychology'; }
    return $classes;
} );

/** The two original sites are separate WP installations. URLs can be mapped explicitly. */
function preciado_root_url() {
    $configured = get_option( 'preciado_main_url', '' );
    if ( $configured ) { return untrailingslashit( esc_url_raw( $configured ) ); }
    return preg_replace( '~/psicologia/?$~', '', untrailingslashit( home_url() ) );
}

function preciado_route_url( $key ) {
    $parts = explode( '#', $key, 2 );
    $route = $parts[0];
    $hash = isset( $parts[1] ) ? '#' . rawurlencode( $parts[1] ) : '';
    $overrides = get_option( 'preciado_route_urls', array() );
    if ( ! empty( $overrides[ $route ] ) ) { return esc_url( $overrides[ $route ] . $hash ); }
    $map = get_option( 'preciado_recovery_pages', array() );
    if ( isset( $map[ $route ] ) && get_post( (int) $map[ $route ] ) ) {
        $id = (int) $map[ $route ];
        $url = ( 'publish' !== get_post_status( $id ) && current_user_can( 'edit_post', $id ) ) ? get_preview_post_link( $id ) : get_permalink( $id );
        return esc_url( $url . $hash );
    }
    return esc_url( preciado_root_url() . '/' . ( $route ? trailingslashit( $route ) : '' ) . $hash );
}

/** Only local, build-generated fragments can be rendered; no user-provided file paths. */
function preciado_fragment( $key ) {
    $allowed = array( 'header', 'footer' );
    foreach ( preciado_manifest() as $page ) { $allowed[] = $page['slug'] ?: 'inicio'; }
    if ( ! in_array( $key, $allowed, true ) ) { return ''; }
    $filename = str_replace( '/', '--', $key );
    $file = get_stylesheet_directory() . '/fragments/' . $filename . '.html';
    if ( ! is_readable( $file ) ) { return ''; }
    $html = str_replace( '{{ASSET}}', esc_url( get_stylesheet_directory_uri() . '/assets' ), file_get_contents( $file ) );
    return preg_replace_callback( '/\{\{PAGE:([^}]*)\}\}/', function ( $m ) { return preciado_route_url( $m[1] ); }, $html );
}

/** SEO fallback for recovered pages only. Let established SEO plugins own their tags. */
function preciado_has_seo_plugin() {
    return defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'AIOSEO_VERSION' ) || defined( 'SEOPRESS_VERSION' ) || defined( 'THE_SEO_FRAMEWORK_VERSION' );
}
add_action( 'wp_head', function () {
    $page = preciado_recovered_page();
    if ( ! $page || preciado_has_seo_plugin() ) { return; }
    echo '<meta name="description" content="' . esc_attr( $page['description'] ) . '">' . "\n";
    // WordPress rel_canonical() remains the single canonical source.
    echo '<meta property="og:title" content="' . esc_attr( get_the_title() ) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr( $page['description'] ) . '">' . "\n";
    echo '<meta property="og:type" content="website">' . "\n";
    echo '<meta property="og:url" content="' . esc_url( get_permalink() ) . '">' . "\n";
    if ( 'publish' === get_post_status() ) {
        $schema = array( '@context' => 'https://schema.org', '@type' => 'WebPage', 'name' => get_the_title(), 'description' => $page['description'], 'url' => get_permalink(), 'inLanguage' => 'es-CO' );
        echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ) . '</script>' . "\n";
    }
}, 5 );

add_filter( 'document_title_parts', function ( $parts ) {
    if ( preciado_recovered_page() && ! preciado_has_seo_plugin() ) { $parts['site'] = 'Preciado'; }
    return $parts;
} );

/** Keep generated recovery markup intact; standard pages still use all normal content filters. */
add_filter( 'the_content', function ( $content ) {
    if ( ! is_main_query() || ! in_the_loop() || ! preciado_recovered_page() ) { return $content; }
    $page = preciado_recovered_page();
    return preciado_fragment( $page['slug'] ?: 'inicio' );
}, 99 );
