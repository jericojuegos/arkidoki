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
namespace Tangible\\{{PROJECT_NAME}};

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
    $this->settings = new \\Tangible\\{{PROJECT_NAME}}\\Admin\\Settings(self::$plugin);
  }
}

// Instantiate the plugin
new Plugin();
`;

export const SETTINGS_PHP = `<?php
namespace Tangible\\{{PROJECT_NAME}}\\Admin;

class Settings {
  public $plugin;

  public function __construct( $plugin ) {
    $this->plugin = $plugin;
    $this->register_settings();
  }

  public function register_settings() {
    // Add tabs for each module
    // {{MODULE_TABS_REGISTRATION}}
  }
}
`;
