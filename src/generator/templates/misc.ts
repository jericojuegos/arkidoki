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
namespace Tangible\\{{PROJECT_NAME}}\\Admin;

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
