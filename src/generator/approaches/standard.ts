import type { PluginConfig, GeneratedFile } from '../../types';
import type { GeneratorStrategy } from './interface';
import { replacePlaceholders } from '../utils';

// Simplified Standard WP Plugin Template
const STANDARD_PLUGIN_FILE = `<?php
/**
 * Plugin Name: {{PLUGIN_TITLE}}
 * Description: {{PLUGIN_DESCRIPTION}}
 * Version: 1.0.0
 * Author: {{AUTHOR_NAME}}
 * Author URI: {{AUTHOR_URI}}
 * License: GPLv2 or later
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( '{{PROJECT_CONST}}_VERSION', '1.0.0' );

class {{PROJECT_CONST}}_Plugin {
    
    public function __construct() {
        add_action( 'init', array( $this, 'init' ) );
    }

    public function init() {
        // Initialization code
    }
}

new {{PROJECT_CONST}}_Plugin();
`;

export class StandardStrategy implements GeneratorStrategy {
    generate(config: PluginConfig): GeneratedFile[] {
        const files: GeneratedFile[] = [];

        // Main Plugin File
        files.push({
            name: `${config.projectSlug}.php`,
            path: `/${config.projectSlug}.php`,
            content: replacePlaceholders(STANDARD_PLUGIN_FILE, config),
            language: 'php'
        });

        // Add more standard files here if needed...

        return files;
    }
}
