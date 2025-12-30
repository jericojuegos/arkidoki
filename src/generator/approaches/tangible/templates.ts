export const MAIN_PLUGIN_FILE = `<?php
/**
 * Plugin Name: {{PLUGIN_TITLE}}
 * Plugin URI: {{AUTHOR_URI}}
 * Description: {{PLUGIN_DESCRIPTION}}
 * Version: {{PLUGIN_VERSION}}
 * Author: {{AUTHOR_NAME}}
 * Author URI: {{AUTHOR_URI}}
 * License: GPLv2 or later
 */
namespace Tangible\\{{PROJECT_NAMESPACE}};

use tangible\\framework;
use tangible\\updater;

define( '{{PROJECT_CONST}}_VERSION', '{{PLUGIN_VERSION}}' );

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/vendor/tangible/framework/index.php';
require __DIR__ . '/vendor/tangible/updater/index.php';

class Plugin {
  public static $plugin;
  public $settings;

  public function __construct() {
    add_action( 'plugins_loaded', [ $this, 'init_framework' ] );
    add_action( 'plugins_loaded', [ $this, 'init_updater' ], 11 );
    add_action( 'init', [ $this, 'load_includes' ] );
  }

  public function init_framework() {
    if ( defined( 'WP_SANDBOX_SCRAPING' ) ) return;

    self::$plugin = framework\\register_plugin([
      'name' => '{{PLUGIN_SLUG}}',
      'title' => '{{PLUGIN_TITLE}}',
      'setting_prefix' => '{{PLUGIN_SLUG}}',
      'version' => {{PROJECT_CONST}}_VERSION,
      'file_path' => __FILE__,
      'base_path' => plugin_basename( __FILE__ ),
      'dir_path' => plugin_dir_path( __FILE__ ),
      'url' => plugins_url( '/', __FILE__ ),
      'assets_url' => plugins_url( '/assets', __FILE__ ),
    ]);
  }

  public function init_updater() {
    updater\\register_plugin([
      'name' => self::$plugin->name ?? '{{PLUGIN_SLUG}}',
      'file' => __FILE__,
    ]);
  }

  public function load_includes() {
    include_once __DIR__ . '/includes/admin/Settings.php';
    $this->settings = new \\Tangible\\{{PROJECT_NAMESPACE}}\\Admin\\Settings(self::$plugin);

    // REST API
    add_action('rest_api_init', function() {
        $api = new \\Tangible\\{{PROJECT_NAMESPACE}}\\API\\RestAPI();
        $api->register_endpoints();
    });
  }
}

// Instantiate the plugin
new Plugin();
`;

export const SETTINGS_PHP = `<?php declare(strict_types=1);

namespace Tangible\\{{PROJECT_NAMESPACE}}\\Admin;

if ( ! defined( 'ABSPATH' ) ) exit;

use Tangible\\{{PROJECT_NAMESPACE}}\\Plugin;
use tangible\\framework;

class Settings {
    
    public function __construct() {
      $this->register_settings();
    }
    
    public function register_settings() {
      \\tangible\\framework\\register_plugin_settings(Plugin::$plugin, [
        'css' => Plugin::$plugin->assets_url . '/build/admin.min.css',
        'title_callback' => function() {
            ?>
            <img class="plugin-logo"
                src="<?= Plugin::$plugin->assets_url ?>/images/tangible-logo.png"
                alt="Test Logo"
                width="40"
            >
            <?= Plugin::$plugin->title ?>
            <?php
        },
        'tabs' => [
            'welcome' => [
                'title' => 'Welcome',
                'callback' => function() {
                  ?>
                    Hello, world.

                    <ul>
                      <li>Plugin: <?php echo Plugin::$plugin->title; ?></li>
                      <li>Version: <?php echo Plugin::$plugin->version; ?></li>
                      <li>Assets URL: <?php echo Plugin::$plugin->assets_url; ?></li>                  
                    </ul>

                  <?php
                }
            ],
            'features' => [
                'title' => 'Features',
                'callback' => function() {
                    framework\\render_features_settings_page( Plugin::$plugin );
                }
            ],
            // {{MODULE_TABS_REGISTRATION}}
        ],
        'features' => [
            [
                'name' => 'example',
                'title' => 'First feature',
                'entry_file' => __DIR__ . '/../features/example.php'
            ],
            [
                'name' => 'example_2',
                'title' => 'Second feature',
                'entry_file' => __DIR__ . '/../features/example-2.php',
            ],
        ],
      ]);
    }
    
    public function register_admin_notice() {
        $welcome_notice_key = Plugin::$plugin->setting_prefix . '_welcome_notice';

        if (framework\\is_admin_notice_dismissed($welcome_notice_key)) {
            return;
        }

        if (isset($_GET['dismiss_admin_notice'])) {
            framework\\dismiss_admin_notice( $welcome_notice_key );
            return;
        }

        ?>
        <div class="notice notice-info is-dismissible"
            data-tangible-admin-notice="<?php echo $welcome_notice_key; ?>"
        >
            <p>Welcome to <b><?php echo Plugin::$plugin->title; ?></b>. Please see the <a href="<?php
                $url = (is_multisite() ? 'settings.php' : 'options-general.php') . "?page=" . Plugin::$plugin->name . "-settings&dismiss_admin_notice=true";
                echo esc_attr($url);
            ?>">plugin settings page</a> to get started.</p>
        </div>
        <?php
    }
    
}
`;

export const TANGIBLE_CONFIG = `module.exports = {
  build: [
    // {{MODULE_BUILD_CONFIGS}}
  ],
  format: 'assets/src/**/*.{php,ts,tsx,scss}',
};
`;

export const ENQUEUE_SCRIPT_PHP = `<?php
namespace Tangible\\{{PROJECT_NAMESPACE}}\\Admin;

function enqueue_assets() {
  wp_enqueue_script(
    '{{PLUGIN_SLUG}}-app',
    plugins_url( '/assets/build/app.min.js', __FILE__ ),
    [ 'wp-element', 'wp-components', 'wp-i18n' ],
    {{PROJECT_CONST}}_VERSION,
    true
  );

  wp_enqueue_style(
    '{{PLUGIN_SLUG}}-app',
    plugins_url( '/assets/build/app.min.css', __FILE__ ),
    [ 'wp-components' ],
    {{PROJECT_CONST}}_VERSION
  );
}

add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\\\\enqueue_assets' );
`;

export const MODULE_ADMIN_CLASS = `<?php

namespace Tangible\\{{PROJECT_NAMESPACE}}\\Admin;

defined('ABSPATH') or die();

use Tangible\\{{PROJECT_NAMESPACE}}\\Plugin;

class {{Module}} {

    public function enqueue_scripts() {
        wp_enqueue_style(
            '{{PLUGIN_SLUG}}-{{module}}',
            Plugin::$plugin->assets_url . '/build/{{module}}.min.css',
            [],
            Plugin::$plugin->version
        );
        
        wp_enqueue_script(
            '{{PLUGIN_SLUG}}-{{module}}',
            Plugin::$plugin->assets_url . '/build/{{module}}.min.js',
            [ 'wp-element', 'wp-i18n', 'wp-api-fetch' ],
            Plugin::$plugin->version,
            true
        );

        wp_localize_script(
            '{{PLUGIN_SLUG}}-{{module}}',
            '{{projectSlug}}Data',
            array(
                'apiUrl'    => '{{PLUGIN_SLUG}}/v1', 
                'nonce'     => wp_create_nonce( 'wp_rest' ),
                'apiKey'    => get_option( '{{PLUGIN_SLUG}}_api_key' ),
                'siteUrl'   => get_site_url(),
            )
        );
    }

    public function render() : void {
        $this->enqueue_scripts();
        ?>
        <div class="{{PLUGIN_SLUG}}-{{module}}-wrap">
            <!-- React will mount here -->
            <div id="{{PLUGIN_SLUG}}-{{module}}-root"></div>
        </div>
        <?php
    }
	
}
`;

export const ABSTRACT_ENDPOINT_PHP = `<?php

namespace Tangible\\{{PROJECT_NAMESPACE}}\\API\\Endpoints;

use WP_REST_Request;
use WP_Error;

abstract class AbstractEndpoint {

    /**
     * REST namespace.
     */
    protected string $namespace = '{{PLUGIN_SLUG}}/v1';

    /**
     * Each endpoint MUST register its routes.
     */
    abstract public function register_routes(): void;

    /**
     * Final authorization entry point.
     *
     * @param WP_REST_Request $request
     * @return true|WP_Error
     */
    final public function authorize( WP_REST_Request $request ) {

        // 1. API key auth (global)
        $result = $this->authorize_api_key( $request );
        if ( $result !== true ) {
            return $result;
        }

        // 2. Endpoint-specific auth (optional)
        return $this->additional_authorization( $request );
    }

    /**
     * API key validation (shared logic).
     */
    protected function authorize_api_key( WP_REST_Request $request ) {

        $auth_header = $request->get_header( 'authorization' );

        if ( empty( $auth_header ) ) {
            return new WP_Error(
                'missing_auth_header',
                'Authorization header is required',
                [ 'status' => 401 ]
            );
        }

        if ( ! preg_match( '/^Bearer\\s+([A-Za-z0-9+\\/=_-]+)$/i', $auth_header, $matches ) ) {
            return new WP_Error(
                'invalid_auth_format',
                'Invalid authorization header format',
                [ 'status' => 401 ]
            );
        }

        $provided_key = trim( $matches[1] );
        $stored_key = get_option( '{{PLUGIN_SLUG}}_api_key', '' );

        if ( empty( $stored_key ) ) {
            return new WP_Error(
                'api_key_not_configured',
                'API key not configured on site',
                [ 'status' => 500 ]
            );
        }

        if ( ! hash_equals( $stored_key, $provided_key ) ) {
            return new WP_Error(
                'invalid_api_key',
                'Invalid API key',
                [ 'status' => 403 ]
            );
        }

        return true;
    }

    /**
     * Optional per-endpoint authorization hook.
     */
    protected function additional_authorization( WP_REST_Request $request ) {
        return true;
    }

    /**
     * Standard success response helper.
     */
    protected function success( $data = [], int $status = 200 ) {
        return rest_ensure_response( [
            'success' => true,
            'data'    => $data,
        ] )->set_status( $status );
    }

    /**
     * Standard error response helper.
     */
    protected function error( string $message, int $status = 400 ) {
        return new WP_Error(
            'endpoint_error',
            $message,
            [ 'status' => $status ]
        );
    }
}
`;

export const SETTINGS_ENDPOINT_PHP = `<?php

namespace Tangible\\{{PROJECT_NAMESPACE}}\\API\\Endpoints;

use WP_REST_Request;

class SettingsEndpoint extends AbstractEndpoint {

    public function register_routes(): void {
        register_rest_route( $this->namespace, '/settings', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_settings' ],
                'permission_callback' => [ $this, 'authorize' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'update_settings' ],
                'permission_callback' => [ $this, 'authorize' ],
            ]
        ] );
    }

    public function get_settings( WP_REST_Request $request ) {
        return $this->success( [
            'site_url' => get_site_url(),
            'version'  => '{{PLUGIN_VERSION}}',
        ] );
    }

    public function update_settings( WP_REST_Request $request ) {
        return $this->success( [ 'message' => 'Settings updated' ] );
    }
}
`;

export const MODULE_ENDPOINT_PHP = `<?php

namespace Tangible\\{{PROJECT_NAMESPACE}}\\API\\Endpoints;

use WP_REST_Request;

class {{Module}}Endpoint extends AbstractEndpoint {

    public function register_routes(): void {
        register_rest_route( $this->namespace, '/{{module}}', [
            'methods'             => 'GET',
            'callback'            => [ $this, 'get_items' ],
            'permission_callback' => [ $this, 'authorize' ],
        ] );
    }

    public function get_items( WP_REST_Request $request ) {
        // Sample data for {{Module}}
        $items = [
            [
                'id'      => 1,
                'name'    => 'Example {{Module}}',
                'status'  => 'active',
                'date'    => current_time( 'mysql' ),
            ],
        ];

        return $this->success( [
            'items' => $items,
        ] );
    }
}
`;

export const REST_API_PHP = `<?php

namespace Tangible\\{{PROJECT_NAMESPACE}}\\API;

// {{ENDPOINT_IMPORTS}}

if ( ! defined( 'ABSPATH' ) ) exit;

class RestAPI {

   public function register_endpoints(): void {
        // {{ENDPOINT_REGISTRATION}}
   }
}
`;
