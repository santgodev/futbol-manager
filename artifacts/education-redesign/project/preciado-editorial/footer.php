<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }
if ( preciado_recovered_page() || ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'footer' ) ) {
    echo preciado_fragment( 'footer' );
}
wp_footer();
?>
</body>
</html>
