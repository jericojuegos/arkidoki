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
    {
      src: 'assets/src/index.tsx',
      dest: 'assets/build/app.min.js',
      react: 'wp',
    },
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

add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\\enqueue_assets' );
`;
