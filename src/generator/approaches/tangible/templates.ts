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
    include_once __DIR__ . '/includes/Admin/Settings.php';
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

defined('ABSPATH') or die();

use Tangible\\{{PROJECT_NAMESPACE}}\\Plugin;

class Settings {
    // {{MODULE_PROPERTIES}}

    public function __construct() {
        // {{MODULE_INSTANTIATIONS}}

        add_action( 'rest_api_init', [ $this, 'register_settings_endpoints' ] );
    }

    /**
     * Register endpoints.
     */
    public function register_settings_endpoints() : void {
        // require_once __DIR__ . '/endpoints/index.php'; // Example
    }

    /**
     * @see https://docs.tangible.one/modules/plugin-framework/plugin-settings/
     */
    public function register_settings_pages() : void {
        \\tangible\\framework\\register_plugin_settings(
            Plugin::$plugin, 
            [
                'title_callback' => function() {
                    ?>
                    <img class="plugin-logo"
                        src="<?= Plugin::$plugin->assets_url ?>/images/tangible-logo.png"
                        alt="Logo"
                        width="40"
                    >
                    <?= Plugin::$plugin->title ?>
                    <?php
                },
                'css'  => Plugin::$plugin->assets_url . '/build/admin.min.css',
                'js'   => Plugin::$plugin->assets_url . '/build/admin.min.js',
                'tabs' => [
                    // {{MODULE_TABS}}
                ]
            ] 
        );
    }

    public function get_current_page_key( string $context ) {
        $items = get_option( '{{PLUGIN_SLUG}}_' . $context, false );
        if( ! $items || count($items) === 0 ) return false;
        return array_keys($items)[0];
    }

    public function display_notice( array $notice ) : void {
        ?><div class="notice notice-<?= esc_attr( $notice['status'] ) ?> is-dismissible">
            <p>
                <strong><?= esc_html( $notice['title'] ) ?></strong><br />
                <?= wp_kses_post( $notice['content'] ?? '' ) ?>
            </p>
        </div><?php
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

export const CORE_CLASS_PHP = `<?php
/**
 * {{Module}} domain class.
 *
 * @package Tangible\\{{PROJECT_NAMESPACE}}
 */

namespace Tangible\\{{PROJECT_NAMESPACE}}\\Core;

use Tangible\\{{PROJECT_NAMESPACE}}\\Admin\\{{Module}} as Admin{{Module}};
use WP_Error;

/**
 * {{Module}} class - manages {{module}} items.
 */
class {{Module}} {

    // {{CONSTANTS}}

	/**
	 * Singleton instance.
	 *
	 * @var {{Module}}
	 */
	private static $instance = null;

	/**
	 * Get singleton instance.
	 *
	 * @return {{Module}}
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
     * Modified to allow instantiation for Admin UI form handling.
	 */
	public function __construct( string $key = null ) {
        if ( $key ) {
            $this->key = $key;
        }
        $this->register_fields();
    }

    // {{METHODS}}

    // Tangible Fields Integration

    private string $key = '{{module}}'; // Default key
    private array $fields_config = [];

    private function register_fields() : void {
        $fields = tangible_fields();
        // Assuming fields are located here for the module
        $fields_file = __DIR__ . '/../fields/{{module}}/fields.php';
        $elements_file = __DIR__ . '/../fields/{{module}}/elements.php';

        if (file_exists($fields_file) && file_exists($elements_file)) {
            $this->fields_config = [
                'fields'   => require $fields_file,
                'elements' => require $elements_file
            ];
    
            foreach( $this->fields_config['fields'] as $name => $args ) {
                $fields->register_field( 
                    $name, 
                    $args + $this->get_field_callbacks( $args ) 
                );
            }
    
            foreach( $this->fields_config['elements'] as $name => $args ) {
                $fields->register_element( $name, $args );
            }
        }
    }

    private function get_field_callbacks( array $args ) : array {
        $instance = $this;
        $fields = tangible_fields();
        return [
            'store_callback' => function( $name, $value ) use( $instance ) {
                $name = str_replace( '{{module}}_', '', $name ); 
                return $instance->set_value( $name, $value );
            },
            'fetch_callback' => function( $name ) use( $args, $instance ) {
                $name = str_replace( '{{module}}_', '', $name );
                $value = $instance->get_value( $name ); 
                if ( $name === 'key' ) return $this->key;
                
                if ($name === 'repeater_tab' && is_array($value)) {
                     return json_encode(array_values($value)); 
                }

                return $args['type'] === 'repeater' 
                    ? stripslashes( (string) $value ) 
                    : $value;
            }
        ] 
        + $fields->_permission_callbacks([
            'store' => ['user_can', 'manage_options'],
            'fetch' => ['user_can', 'manage_options']
        ]);
    }

    public function maybe_save_fields() : array {
        if( empty($_POST) ) return [];

        $fields = tangible_fields();
        $updated = [];
        
        if (empty($this->fields_config['fields'])) return [];

        foreach( $this->fields_config['fields'] as $name => $args ) {
            $short_name = str_replace( '{{module}}_', '', $name );

            if( ! isset($_POST[ $name ]) ) continue;

            $updated[ $short_name ] = $_POST[ $name ]; 
            $fields->store_value( $name, $_POST[ $name ] );
        }

        if( empty($updated) ) { 
            return [
                'status' => 'info',
                'title'  => __( 'No changes detected.', '{{PLUGIN_SLUG}}' )
            ];
        }

        return [
            'status' => 'success',
            'title'  => __( 'Saved.', '{{PLUGIN_SLUG}}' )
        ];
    }
    
    // {{ADDITIONAL_HELPERS}}
}
`;

export const DATABASE_CLASS_PHP = `<?php declare( strict_types=1 );
/**
 * Database management class.
 *
 * @package Tangible\\{{PROJECT_NAMESPACE}}
 */

namespace Tangible\\{{PROJECT_NAMESPACE}}\\Core;

use Tangible\\{{PROJECT_NAMESPACE}}\\Plugin;

/**
 * Database class.
 */
class Database {

	/**
	 * Instance.
	 *
	 * @var Database
	 */
	private static $instance = null;

	/**
	 * Get instance.
	 *
	 * @return Database
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		// Constructor logic if needed.
	}

    // {{DATABASE_TABLE_GETTERS}}

    /**
	 * Create database tables.
	 */
	public function create_tables() {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        // {{DATABASE_CREATE_TABLES}}

		// Update database version.
		update_option( '{{PLUGIN_SLUG}}_db_version', {{PROJECT_CONST}}_VERSION );
	}

    /**
	 * Drop database tables.
	 */
	public function drop_tables() {
		global $wpdb;

        // {{DATABASE_DROP_TABLES}}

		delete_option( '{{PLUGIN_SLUG}}_db_version' );
	}
}
`;

