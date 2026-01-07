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
    REACT_DETAILS_MODAL,
    buildApiTemplate,
    buildApiClientTemplate
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
        // 2. Settings.php
        let moduleProperties = '';
        let moduleInstantiations = '';
        let moduleTabs = '';

        config.modules.forEach(module => {
            const classProp = module.slug.replace(/-/g, '_'); // my_module
            const className = module.name; // MyModule

            moduleProperties += `    public ${className} $${classProp};\n`;
            moduleInstantiations += `        $this->${classProp} = new ${className}();\n`;

            moduleTabs += `                    '${module.slug}' => [
                        'title' => '${className}',
                        'title_section' => [
                            'title'         => __( '${className}', '{{PLUGIN_SLUG}}' ),
                            'description'   => __( 'Manage ${module.slug}.', '{{PLUGIN_SLUG}}' ),
                        ],
                        'callback' => [ $this->${classProp}, 'render' ],
                    ],\n`;
        });

        addFile(
            'Settings.php',
            '/includes/Admin/Settings.php',
            replacePlaceholders(SETTINGS_PHP, config)
                .replace('// {{MODULE_PROPERTIES}}', moduleProperties)
                .replace('// {{MODULE_INSTANTIATIONS}}', moduleInstantiations)
                .replace('// {{MODULE_TABS}}', moduleTabs)
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

        // 4.1.1 API Client Shared Utility
        addFile(
            'api-client.ts',
            '/assets/src/utils/api-client.ts',
            buildApiClientTemplate(config),
            'typescript'
        );

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

            if (storage === 'wp_options' || storage === 'wp_options_array') {
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
	 * Update an existing item.
	 *
	 * @param string $id   Item ID.
	 * @param array  $args Fields to update.
	 * @return bool|WP_Error True on success, error on failure.
	 */
	public function update( string $id, array $args ) {
		$items = $this->get_all_raw();

		if ( ! isset( $items[ $id ] ) ) {
			return new WP_Error( 'not_found', __( 'Item not found.', '{{PLUGIN_SLUG}}' ) );
		}

        $item = array_merge( $items[ $id ], $args );
		$item['modified'] = current_time( 'mysql' );

		$items[ $id ] = $item;

		update_option( self::OPTION_NAME, $items, false );
		do_action( '{{PLUGIN_SLUG}}_{{module}}_updated', $id, $item );

		return true;
	}

	/**
	 * Delete an item.
	 *
	 * @param string $id Item ID.
	 * @return bool True on success, false if not found.
	 */
	public function delete( string $id ): bool {
		$items = $this->get_all_raw();

		if ( ! isset( $items[ $id ] ) ) {
			return false;
		}

		$item = $items[ $id ];
		unset( $items[ $id ] );

		update_option( self::OPTION_NAME, $items, false );
		do_action( '{{PLUGIN_SLUG}}_{{module}}_deleted', $id, $item );

		return true;
	}

	/**
	 * Get a single item by ID.
	 *
	 * @param string $id Item ID.
	 * @return array|null Item data or null if not found.
	 */
	public function get( string $id ) {
		$items = $this->get_all_raw();
		return $items[ $id ] ?? null;
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

            } else if (storage === 'wp_options_single') {
                coreConstants = `\t/**
	 * Option name for storing {{module}} data.
	 */
	const OPTION_NAME = '{{PLUGIN_SLUG}}_{{module}}_data';`;

                coreMethods = `/**
     * Update data.
     */
    public function update( array $args ) {
        $current = $this->get_all_raw();
        $updated = wp_parse_args( $args, $current );
        update_option( self::OPTION_NAME, $updated, false );
        return true;
    }

    public function get_all() {
        return [ $this->get_all_raw() ]; 
    }
    
    public function get_all_raw() {
        return get_option( self::OPTION_NAME, [] );
    }

    public function create( array $args ) {
        return $this->update( $args );
    }
    
    public function get( string $id ) {
        return $this->get_all_raw();
    }
    
    public function delete( string $id ): bool {
        return delete_option( self::OPTION_NAME );
    }`;
                coreAdditionalHelpers = `
    public function set_value( string $name, $value ) {}
    public function get_value( string $name ) { return ''; }`;

            } else if (storage === 'wp_options_per_item') {
                coreConstants = `\t/**
	 * Option name for storing {{module}} index.
	 */
	const INDEX_OPTION = '{{PLUGIN_SLUG}}_{{module}}_index';
    const ITEM_PREFIX = '{{PLUGIN_SLUG}}_{{module}}_item_';`;

                coreMethods = `
    public function create( array $args ) {
        $id = uniqid( '{{module}}_' );
        $item = array_merge( [ 'id' => $id, 'created' => current_time('mysql') ], $args );
        update_option( self::ITEM_PREFIX . $id, $item, false );
        
        $index = get_option( self::INDEX_OPTION, [] );
        $index[] = $id;
        update_option( self::INDEX_OPTION, $index, false ); 
        
        do_action( '{{PLUGIN_SLUG}}_{{module}}_created', $id, $item );
        return $id;
    }

    public function update( string $id, array $args ) {
        $item = $this->get( $id );
        if ( ! $item ) return new WP_Error( 'not_found', 'Item not found' );

        $item = array_merge( $item, $args );
        $item['modified'] = current_time('mysql');
        
        update_option( self::ITEM_PREFIX . $id, $item, false );
        do_action( '{{PLUGIN_SLUG}}_{{module}}_updated', $id, $item );
        return true;
    }

    public function delete( string $id ): bool {
        $item = $this->get( $id );
        if ( ! $item ) return false;

        delete_option( self::ITEM_PREFIX . $id );
        
        $index = get_option( self::INDEX_OPTION, [] );
        $index = array_diff( $index, [ $id ] );
        update_option( self::INDEX_OPTION, $index, false );

        do_action( '{{PLUGIN_SLUG}}_{{module}}_deleted', $id, $item );
        return true;
    }

    public function get( string $id ) {
        $item = get_option( self::ITEM_PREFIX . $id );
        return $item ?: null;
    }

    public function get_all() {
        $index = get_option( self::INDEX_OPTION, [] );
        $items = [];
        foreach( $index as $id ) {
            $item = $this->get( $id );
            if ($item) $items[] = $item;
        }
        return $items;
    }`;

                coreAdditionalHelpers = `
    public function set_value( string $name, $value ) {}
    public function get_value( string $name ) { return ''; }`;

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

    public function update( $id, $args ) {
        global $wpdb;
        $table = Database::instance()->get_{{module}}_table();
        
        $args['updated_at'] = current_time( 'mysql' ); 

        $result = $wpdb->update( $table, $args, [ 'id' => $id ] );
        
        if ( $result !== false ) {
            do_action( '{{PLUGIN_SLUG}}_{{module}}_updated', $id, $args );
            return true;
        }
        return false;
    }

    public function delete( $id ) {
        global $wpdb;
        $table = Database::instance()->get_{{module}}_table();
        
        $result = $wpdb->delete( $table, [ 'id' => $id ] );
        
        if ( $result ) {
            do_action( '{{PLUGIN_SLUG}}_{{module}}_deleted', $id );
            return true;
        }
        return false;
    }

    public function get( $id ) {
        global $wpdb;
        $table = Database::instance()->get_{{module}}_table();
        return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table} WHERE id = %d", $id ), ARRAY_A );
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

    public function update( $id, $args ) {
        $post_args = [];
        if (isset($args['name'])) $post_args['post_title'] = $args['name'];
        if (isset($args['status'])) $post_args['post_status'] = $args['status'];
        
        if (!empty($post_args)) {
            $post_args['ID'] = $id;
            wp_update_post($post_args);
        }

        foreach($args as $key => $value) {
            if ($key === 'name' || $key === 'status') continue;
            update_post_meta( $id, self::META_PREFIX . $key, $value );
        }
        
        do_action( '{{PLUGIN_SLUG}}_{{module}}_updated', $id, $args );
        return true;
    }

    public function delete( $id ) {
        $result = wp_delete_post( $id, true );
        if ($result) {
             do_action( '{{PLUGIN_SLUG}}_{{module}}_deleted', $id );
             return true;
        }
        return false;
    }

    public function get( $id ) {
        $post = get_post($id);
        if (!$post || $post->post_type !== self::POST_TYPE) return null;
        
        $meta = get_post_meta($id);
        $data = ['id' => $post->ID, 'name' => $post->post_title, 'status' => $post->post_status];
        
        foreach($meta as $k => $v) {
            if (strpos($k, self::META_PREFIX) === 0) {
                $key = str_replace(self::META_PREFIX, '', $k);
                $data[$key] = $v[0];
            }
        }
        return $data;
    }
    
    public function get_all() {
        $posts = get_posts([
            'post_type' => self::POST_TYPE,
            'numberposts' => -1,
            'post_status' => 'any'
        ]);
        
        return array_map(function($post) {
            return $this->get($post->ID);
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
            addFile('api.ts', `${basePath}/api.ts`, buildApiTemplate(config, module), 'typescript');

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


