<?php
/**
 * WP-CLI: wp eval-file /absolute/path/import-recovery.php [apply] [main|psychology|all]
 * Dry run by default. Creates DRAFTS only; never overwrites existing posts or permalinks.
 * Install and activate the child theme first. Use on a staging WordPress installation.
 */
if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) { exit; }
if ( ! function_exists( 'preciado_manifest' ) ) { WP_CLI::error( 'Activa primero Preciado Editorial.' ); }
$apply = isset( $args[0] ) && 'apply' === $args[0];
$scope = isset( $args[1] ) ? $args[1] : 'main';
if ( ! in_array( $scope, array( 'main', 'psychology', 'all' ), true ) ) { WP_CLI::error( 'Scope: main, psychology o all.' ); }
$map = get_option( 'preciado_recovery_pages', array() );
$records = preciado_manifest();
usort( $records, function ( $a, $b ) { return substr_count( $a['slug'], '/' ) <=> substr_count( $b['slug'], '/' ); } );
foreach ( $records as $page ) {
    $key = $page['slug'];
    $psych = 'psicologia' === $key || 0 === strpos( $key, 'psicologia/' );
    if ( ( 'main' === $scope && $psych ) || ( 'psychology' === $scope && ! $psych ) ) { continue; }
    if ( isset( $map[ $key ] ) && get_post( $map[ $key ] ) ) { WP_CLI::log( 'Ya importada: ' . $key ); continue; }
    $local_path = 'psychology' === $scope ? preg_replace( '~^psicologia/?~', '', $key ) : $key;
    $local_path = $local_path ?: 'inicio-recuperado';
    $existing = get_page_by_path( $local_path );
    if ( $existing ) {
        WP_CLI::warning( 'Ruta existente sin cambios: /' . $local_path . '. Asigna su ID manualmente después de revisar.' );
        continue;
    }
    if ( ! $apply ) { WP_CLI::log( 'Borrador propuesto: /' . $local_path . ' — ' . $page['title'] ); continue; }
    $segments = explode( '/', $local_path );
    $slug = array_pop( $segments );
    $parent_key = implode( '/', $segments );
    if ( 'psychology' === $scope && $parent_key ) { $parent_key = 'psicologia/' . $parent_key; }
    if ( 'psychology' === $scope && ! $parent_key && $psych && 'psicologia' !== $key ) { $parent_key = 'psicologia'; }
    $parent = $parent_key && isset( $map[ $parent_key ] ) ? (int) $map[ $parent_key ] : 0;
    // Root page in a separate /psicologia/ install is not a URL segment parent.
    if ( 'psychology' === $scope && 'psicologia' === $parent_key ) { $parent = 0; }
    $id = wp_insert_post( array(
        'post_type' => 'page', 'post_status' => 'draft', 'post_title' => $page['title'],
        'post_name' => $slug, 'post_parent' => $parent,
        'post_content' => '<!-- Contenido mantenido en content.json y fragments del tema Preciado Editorial. -->',
        'page_template' => 'page-recovered.php',
        'meta_input' => array( '_preciado_recovery_key' => $key ),
    ), true );
    if ( is_wp_error( $id ) ) { WP_CLI::error( $id->get_error_message() ); }
    $map[ $key ] = $id;
    update_option( 'preciado_recovery_pages', $map, false );
    WP_CLI::log( 'Borrador creado: ' . $id . ' / ' . $key );
}
WP_CLI::success( $apply ? 'Borradores creados. No se publicó contenido ni se cambió la portada.' : 'Simulación: ningún cambio. Añade apply para crear borradores.' );
