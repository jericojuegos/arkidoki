export const STANDARD_MAIN_PLUGIN = `<?php
/**
 * Plugin Name: {{PLUGIN_TITLE}}
 * Description: {{PLUGIN_DESCRIPTION}}
 * Version: {{PLUGIN_VERSION}}
 * Author: {{AUTHOR_NAME}}
 * Author URI: {{AUTHOR_URI}}
 * License: GPLv2 or later
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( '{{PROJECT_CONST}}_VERSION', '{{PLUGIN_VERSION}}' );
define( '{{PROJECT_CONST}}_PATH', plugin_dir_path( __FILE__ ) );
define( '{{PROJECT_CONST}}_URL', plugin_dir_url( __FILE__ ) );

class {{PROJECT_CONST}}_Plugin {

    private static $instance = null;

    public static function instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
    }

    public function load_textdomain() {
        load_plugin_textdomain( '{{PLUGIN_SLUG}}', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
    }

    public function enqueue_admin_assets() {
        wp_enqueue_script(
            '{{PLUGIN_SLUG}}-admin',
            {{PROJECT_CONST}}_URL . 'assets/build/admin.min.js',
            array( 'wp-element', 'wp-components', 'wp-i18n' ),
            {{PROJECT_CONST}}_VERSION,
            true
        );

        wp_enqueue_style(
            '{{PLUGIN_SLUG}}-admin',
            {{PROJECT_CONST}}_URL . 'assets/build/admin.min.css',
            array( 'wp-components' ),
            {{PROJECT_CONST}}_VERSION
        );
    }
}

// Initialize
{{PROJECT_CONST}}_Plugin::instance();
`;
