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
            addFile(
                `${module.name}.php`,
                `/includes/Core/${module.name}.php`,
                replacePlaceholders(CORE_CLASS_PHP, config, module)
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

