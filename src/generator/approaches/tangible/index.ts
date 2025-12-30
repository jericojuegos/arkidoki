import type { PluginConfig, GeneratedFile } from '../../../types';
import type { GeneratorStrategy } from '../interface';
import { replacePlaceholders } from '../../utils';
import { MAIN_PLUGIN_FILE, SETTINGS_PHP, TANGIBLE_CONFIG, ENQUEUE_SCRIPT_PHP, MODULE_ADMIN_CLASS } from './templates';
import {
    buildReactEntryTemplate,
    buildPageTemplate,
    buildTableTemplate,
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

        // 5. Module Files (React + SCSS + PHP Module Class)
        config.modules.forEach(module => {
            const basePath = `/assets/src/${module.slug}`;

            // Add Module PHP Class
            addFile(
                `${module.name}.php`,
                `/includes/Admin/${module.name}.php`,
                replacePlaceholders(MODULE_ADMIN_CLASS, config, module)
            );

            addFile('index.tsx', `${basePath}/index.tsx`, buildReactEntryTemplate(config, module), 'typescript');

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

