import type { PluginConfig, GeneratedFile } from '../../../types';
import type { GeneratorStrategy } from '../interface';
import { replacePlaceholders } from '../../utils';
import {
    MAIN_PLUGIN_FILE,
    SETTINGS_PHP,
    TANGIBLE_CONFIG,
    ENQUEUE_SCRIPT_PHP,
    MODULE_ADMIN_CLASS,
    CORE_CLASS_PHP,
    DATABASE_CLASS_PHP,
    ABSTRACT_ENDPOINT_PHP,
    SETTINGS_ENDPOINT_PHP,
    MODULE_ENDPOINT_PHP,
    REST_API_PHP
} from './templates';
import {
    buildReactEntryTemplate,
    buildPageTemplate,
    buildTableTemplate,
    buildTypesTemplate,
    REACT_FILTERS,
    PAGINATION_TEMPLATES,
    REACT_DETAILS_MODAL
} from '../../templates/react/index';
import { QUERY_CLIENT } from '../../templates/react/query-client';
import { USE_QUERY_HOOK } from '../../templates/react/use-query';
import { APP_PROVIDERS } from '../../templates/react/providers';
import { PAGINATION_SCSS_TEMPLATES, buildTableScss } from '../../templates/scss/index';

export class TangibleStrategy implements GeneratorStrategy {
    generate(config: PluginConfig): GeneratedFile[] {
        const files: GeneratedFile[] = [];

        // Helper to push files
        const addFile = (
            name: string,
            path: string,
            content: string,
            language: 'php' | 'typescript' | 'javascript' | 'json' | 'scss' = 'php',
            styleContent?: string,
            stylePath?: string
        ) => {
            files.push({ name, path, content, language, styleContent, stylePath });
        };

        const useReactQuery = config.reactOptions.dataFetching === 'react-query';

        // 1. Main Plugin File
        addFile(
            `${config.projectSlug}.php`,
            `/${config.projectSlug}.php`,
            replacePlaceholders(MAIN_PLUGIN_FILE, config)
        );

        // 2. Settings.php (includes/admin/Settings.php)
        const tabsCode = config.modules.map(m => {
            const className = m.name.charAt(0).toUpperCase() + m.name.slice(1);
            return `'${m.slug}' => [
                'title' => '${m.name}',
                'callback' => function() {
                    $module = new \\Tangible\\${config.projectNamespace}\\Admin\\${className}();
                    $module->render();
                }
            ],`;
        }).join('\n            ');

        const settingsContent = replacePlaceholders(SETTINGS_PHP, config).replace('// {{MODULE_TABS_REGISTRATION}}', tabsCode);
        addFile(
            'Settings.php',
            '/includes/admin/Settings.php',
            settingsContent
        );

        const isIndependent = config.architecture === 'independent';

        // 3. Enqueue.php (Skips if Multi-entry/Independent)
        if (!isIndependent) {
            addFile(
                'Enqueue.php',
                '/includes/admin/Enqueue.php',
                replacePlaceholders(ENQUEUE_SCRIPT_PHP, config)
            );
        }

        // 4. API (includes/API)
        addFile(
            'AbstractEndpoint.php',
            '/includes/API/Endpoints/AbstractEndpoint.php',
            replacePlaceholders(ABSTRACT_ENDPOINT_PHP, config)
        );

        addFile(
            'SettingsEndpoint.php',
            '/includes/API/Endpoints/SettingsEndpoint.php',
            replacePlaceholders(SETTINGS_ENDPOINT_PHP, config)
        );

        const endpointImports = [
            `use Tangible\\${config.projectNamespace}\\API\\Endpoints\\SettingsEndpoint;`,
            ...config.modules.map(m => {
                const className = m.name.charAt(0).toUpperCase() + m.name.slice(1);
                return `use Tangible\\${config.projectNamespace}\\API\\Endpoints\\${className}Endpoint;`;
            })
        ].join('\n');

        const endpointRegistration = [
            `(new SettingsEndpoint())->register_routes();`,
            ...config.modules.map(m => {
                const className = m.name.charAt(0).toUpperCase() + m.name.slice(1);
                return `(new ${className}Endpoint())->register_routes();`;
            })
        ].join('\n        ');

        addFile(
            'RestAPI.php',
            '/includes/API/RestAPI.php',
            replacePlaceholders(REST_API_PHP, config)
                .replace('// {{ENDPOINT_IMPORTS}}', endpointImports)
                .replace('// {{ENDPOINT_REGISTRATION}}', endpointRegistration)
        );

        // 4. Tangible Config
        const useTangibleFields = config.dependencies?.tangibleFields ?? false;
        const isSpa = config.architecture === 'spa';

        let buildConfig = '';

        if (isSpa) {
            // SPA mode: Single entry point for admin
            const importToGlobal = useTangibleFields
                ? `\n      importToGlobal: {\n        "tangible-fields": "window.tangibleFields",\n      },`
                : '';

            buildConfig = `// Admin SPA
    {
      src: 'assets/src/admin.scss',
      dest: 'assets/build/admin.min.css',
    },
    {
      src: 'assets/src/admin.tsx',
      dest: 'assets/build/admin.min.js',
      react: 'wp',${importToGlobal}
    }`;
        } else {
            // Multi-entry mode (independent or hybrid)
            buildConfig = config.modules.map(m => {
                const importToGlobal = useTangibleFields
                    ? `\n      importToGlobal: {\n        "tangible-fields": "window.tangibleFields",\n      },`
                    : '';

                return `// ${m.name} Module
    {
      src: 'assets/src/${m.slug}/index.scss',
      dest: 'assets/build/${m.slug}.min.css',
    },
    {
      src: 'assets/src/${m.slug}/index.tsx',
      dest: 'assets/build/${m.slug}.min.js',
      react: 'wp',${importToGlobal}
    }`;
            }).join(',\n');
        }

        const configContent = replacePlaceholders(TANGIBLE_CONFIG, config).replace('// {{MODULE_BUILD_CONFIGS}}', buildConfig);
        addFile(
            'tangible.config.js',
            '/tangible.config.js',
            configContent,
            'javascript'
        );

        // 4.1 Query Client (Shared)
        if (useReactQuery) {
            addFile(
                'queryClient.ts',
                '/assets/src/queryClient.ts',
                QUERY_CLIENT,
                'typescript'
            );
        }

        // 4.2 Shared Providers (for Hybrid architecture)
        if (config.architecture === 'hybrid') {
            addFile(
                'providers.tsx',
                '/assets/src/app/providers.tsx',
                APP_PROVIDERS,
                'typescript'
            );
        }

        // 4.3 Database Class (for custom tables)
        const customTableModules = config.modules.filter(m => !m.storage || m.storage === 'custom_table');

        if (customTableModules.length > 0) {
            const tableGetters = customTableModules.map(m => {
                const tableName = `${config.projectSlug.replace(/-/g, '_')}_${m.slug.replace(/-/g, '_')}`;
                return `/**
	 * Get ${m.name.toLowerCase()} table name.
	 *
	 * @return string
	 */
	public function get_${m.slug.replace(/-/g, '_')}_table() {
		global $wpdb;
		return $wpdb->prefix . '${tableName}';
	}`;
            }).join('\n\n    ');

            const createTablesSql = customTableModules.map(m => {
                const tableName = `${config.projectSlug.replace(/-/g, '_')}_${m.slug.replace(/-/g, '_')}`;

                // Dynamic columns
                const columnsSql = m.columns.map(col => {
                    let type = 'VARCHAR(255)';
                    if (col.type === 'date') type = 'DATETIME';
                    if (col.type === 'boolean') type = 'TINYINT(1)';
                    if (col.accessorKey === 'id') return 'id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY';
                    return `${col.accessorKey} ${type}`;
                }).join(',\n            ');

                return `// ${m.name} table.
		$${m.slug.replace(/-/g, '_')}_table = $wpdb->prefix . '${tableName}';
	    $${m.slug.replace(/-/g, '_')}_sql = "CREATE TABLE IF NOT EXISTS {$${m.slug.replace(/-/g, '_')}_table} (
            ${columnsSql},
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) {$charset_collate};";

		dbDelta( $${m.slug.replace(/-/g, '_')}_sql );`;
            }).join('\n\n        ');

            const dropTablesSql = customTableModules.map(m => {
                const tableName = `${config.projectSlug.replace(/-/g, '_')}_${m.slug.replace(/-/g, '_')}`;
                return `// ${m.name} table.
		$${m.slug.replace(/-/g, '_')}_table = $wpdb->prefix . '${tableName}';
		$wpdb->query( "DROP TABLE IF EXISTS {$${m.slug.replace(/-/g, '_')}_table}" );`;
            }).join('\n\n        ');

            addFile(
                'Database.php',
                '/includes/Core/Database.php',
                replacePlaceholders(DATABASE_CLASS_PHP, config)
                    .replace('// {{DATABASE_TABLE_GETTERS}}', tableGetters)
                    .replace('// {{DATABASE_CREATE_TABLES}}', createTablesSql)
                    .replace('// {{DATABASE_DROP_TABLES}}', dropTablesSql)
            );
        }

        // 5. Module Files (React + SCSS + PHP Module Class)
        config.modules.forEach(module => {
            const basePath = `/assets/src/${module.slug}`;

            // Add Module PHP Class
            addFile(
                `${module.name}.php`,
                `/includes/Admin/${module.name}.php`,
                replacePlaceholders(MODULE_ADMIN_CLASS, config, module)
            );

            // Add Module Core Class
            let coreConstants = '';
            let coreMethods = '';
            let coreAdditionalHelpers = '';
            const storage = module.storage || 'custom_table';

            if (storage === 'wp_options') {
                coreConstants = `\t/**
	 * Option name for storing {{module}} items.
	 */
	const OPTION_NAME = '{{PLUGIN_SLUG}}_{{module}}';`;

                coreMethods = `
    /**
	 * Create a new {{module}} item.
	 *
	 * @param array $args Arguments.
	 * @return string|WP_Error Item ID or error.
	 */
	public function create( array $args ) {
		$defaults = [
			'name'      => '',
            // Add defaults based on columns
			'status'    => 'draft',
		];

		$args = wp_parse_args( $args, $defaults );

		// Generate unique ID.
		$id = $this->generate_id();

		$items = $this->get_all_raw();

		$item = array_merge( [ 'id' => $id, 'created' => current_time('mysql') ], $args );
		$items[ $id ] = $item;

		update_option( self::OPTION_NAME, $items, false );
		do_action( '{{PLUGIN_SLUG}}_{{module}}_created', $id, $item );

		return $id;
	}

    /**
	 * Get all items.
	 * @return array
	 */
	public function get_all(): array {
		return array_values( $this->get_all_raw() );
	}

    private function get_all_raw(): array {
		$items = get_option( self::OPTION_NAME, [] );
		return is_array( $items ) ? $items : [];
	}

    private function generate_id(): string {
		return uniqid( '{{module}}_' );
	}`;

                coreAdditionalHelpers = `
    public function set_value( string $name, $value ) : void {
        if ($name === 'repeater_tab') {
            $data = is_string($value) ? json_decode(stripslashes($value), true) : $value;
            if (is_array($data)) {
                 $formatted = [];
                 foreach ($data as $item_data) {
                     if (empty($item_data['id'])) $item_data['id'] = $this->generate_id();
                     $formatted[ $item_data['id'] ] = $item_data;
                 }
                 update_option( self::OPTION_NAME, $formatted, false );
             }
        }
    }

    public function get_value( string $name ) {
        if ($name === 'repeater_tab') return $this->get_all_raw();
        return '';
    }`;

            } else if (storage === 'custom_table') {
                // Custom Table Logic (Using Database class)
                coreConstants = '';
                coreMethods = `
	/**
	 * Create/Log a {{module}} item.
	 *
	 * @param array $args Arguments.
	 * @return int|false ID or false.
	 */
	public function create( $args ) {
		global $wpdb;

		$defaults = array(
			'created_at'    => current_time( 'mysql' ),
            // Defaults from columns
		);

		$args = wp_parse_args( $args, $defaults );

		$table = Database::instance()->get_{{module}}_table();
		$result = $wpdb->insert( $table, $args );

		if ( $result ) {
			do_action( '{{PLUGIN_SLUG}}_{{module}}_created', $wpdb->insert_id, $args );
			return $wpdb->insert_id;
		}

		return false;
	}

    /**
     * Get all items.
     */
    public function get_all() {
        global $wpdb;
        $table = Database::instance()->get_{{module}}_table();
        return $wpdb->get_results( "SELECT * FROM {$table} ORDER BY created_at DESC", ARRAY_A );
    }`;

                coreAdditionalHelpers = `
    public function set_value( string $name, $value ) : void {
        // Custom Table generic setter if needed for fields integration
    }

    public function get_value( string $name ) {
        return '';
    }`;

            } else if (storage === 'post_meta') {
                coreConstants = `\tconst POST_TYPE = '{{PLUGIN_SLUG}}_{{module}}';\n\tconst META_PREFIX = '_{{PLUGIN_SLUG}}_';`;
                coreMethods = `
    /**
     * Create item (Post).
     */
    public function create( array $args ) {
        $defaults = [
			'name'      => '',
            'status'    => 'publish'
		];
		$args = wp_parse_args( $args, $defaults );

		$post_id = wp_insert_post( [
			'post_type'   => self::POST_TYPE,
			'post_title'  => sanitize_text_field( $args['name'] ),
			'post_status' => $args['status'],
		] );

		if ( is_wp_error( $post_id ) ) return $post_id;

        foreach($args as $key => $value) {
            if ($key === 'name' || $key === 'status') continue;
            update_post_meta( $post_id, self::META_PREFIX . $key, $value );
        }

		do_action( '{{PLUGIN_SLUG}}_{{module}}_created', $post_id );
		return $post_id;
    }
    
    public function get_all() {
        $posts = get_posts([
            'post_type' => self::POST_TYPE,
            'numberposts' => -1,
            'post_status' => 'any'
        ]);
        
        return array_map(function($post) {
            $meta = get_post_meta($post->ID);
            // Flatten meta
            $data = ['id' => $post->ID, 'name' => $post->post_title];
            foreach($meta as $k => $v) {
                if (strpos($k, self::META_PREFIX) === 0) {
                    $key = str_replace(self::META_PREFIX, '', $k);
                    $data[$key] = $v[0];
                }
            }
            return $data;
        }, $posts);
    }
    `;
                coreAdditionalHelpers = `
    public function set_value( string $name, $value ) : void {
        // Post Meta setter logic
    }
    public function get_value( string $name ) {
        return '';
    }`;
            }

            let coreContent = replacePlaceholders(CORE_CLASS_PHP, config, module);
            coreContent = coreContent.replace('// {{CONSTANTS}}', replacePlaceholders(coreConstants, config, module));
            coreContent = coreContent.replace('// {{METHODS}}', replacePlaceholders(coreMethods, config, module));
            coreContent = coreContent.replace('// {{ADDITIONAL_HELPERS}}', replacePlaceholders(coreAdditionalHelpers, config, module));

            addFile(
                `${module.name}.php`,
                `/includes/Core/${module.name}.php`,
                coreContent
            );

            addFile('index.tsx', `${basePath}/index.tsx`, buildReactEntryTemplate(config, module), 'typescript');
            addFile('types.ts', `${basePath}/types.ts`, buildTypesTemplate(config, module), 'typescript');

            // Add Module API Endpoint
            addFile(
                `${module.name}Endpoint.php`,
                `/includes/API/Endpoints/${module.name}Endpoint.php`,
                replacePlaceholders(MODULE_ENDPOINT_PHP, config, module)
            );

            // React Query Hook
            if (useReactQuery) {
                addFile(
                    `use${module.name}Query.ts`,
                    `${basePath}/use${module.name}Query.ts`,
                    replacePlaceholders(USE_QUERY_HOOK, config, module),
                    'typescript'
                );
            }

            addFile(`${module.name}Page.tsx`, `${basePath}/${module.name}Page.tsx`, buildPageTemplate(config, module), 'typescript');

            // Table with SCSS
            addFile(
                `${module.name}Table.tsx`,
                `${basePath}/${module.name}Table.tsx`,
                buildTableTemplate(config, module),
                'typescript',
                buildTableScss(config, module),
                `${basePath}/${module.name}Table.scss`
            );

            addFile(`${module.name}Filters.tsx`, `${basePath}/${module.name}Filters.tsx`, replacePlaceholders(REACT_FILTERS, config, module), 'typescript');

            // Pagination with SCSS
            const paginationStyle = config.reactOptions.paginationStyle || 'simple';
            const paginationTemplate = PAGINATION_TEMPLATES[paginationStyle];
            const paginationScss = PAGINATION_SCSS_TEMPLATES[paginationStyle];
            addFile(
                `${module.name}Pagination.tsx`,
                `${basePath}/${module.name}Pagination.tsx`,
                replacePlaceholders(paginationTemplate, config, module),
                'typescript',
                replacePlaceholders(paginationScss, config, module),
                `${basePath}/${module.name}Pagination.scss`
            );

            addFile(`${module.name}DetailsModal.tsx`, `${basePath}/${module.name}DetailsModal.tsx`, replacePlaceholders(REACT_DETAILS_MODAL, config, module), 'typescript');
        });

        return files;
    }
}


