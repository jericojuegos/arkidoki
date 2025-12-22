import type { PluginConfig, GeneratedFile } from '../../../types';
import type { GeneratorStrategy } from '../interface';
import { replacePlaceholders } from '../../utils';
import { MAIN_PLUGIN_FILE, SETTINGS_PHP, TANGIBLE_CONFIG, ENQUEUE_SCRIPT_PHP } from './templates';
import {
    REACT_ENTRY_INDEX,
    buildPageTemplate,
    buildTableTemplate,
    REACT_FILTERS,
    PAGINATION_TEMPLATES,
    REACT_DETAILS_MODAL
} from '../../templates/react/index';
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

        // 1. Main Plugin File
        addFile(
            `${config.projectSlug}.php`,
            `/${config.projectSlug}.php`,
            replacePlaceholders(MAIN_PLUGIN_FILE, config)
        );

        // 2. Settings.php (includes/admin/Settings.php)
        const tabsCode = config.modules.map(m => {
            return `$this->add_tab([ 'name' => '${m.slug}', 'title' => '${m.name}' ]);`;
        }).join('\n    ');

        const settingsContent = replacePlaceholders(SETTINGS_PHP, config).replace('{{MODULE_TABS_REGISTRATION}}', tabsCode);
        addFile(
            'Settings.php',
            '/includes/admin/Settings.php',
            settingsContent
        );

        // 3. Enqueue.php
        addFile(
            'Enqueue.php',
            '/includes/admin/Enqueue.php',
            replacePlaceholders(ENQUEUE_SCRIPT_PHP, config)
        );

        // 4. Tangible Config
        const buildConfig = config.modules.map(m => {
            return `{
      src: 'assets/src/${m.slug}/index.tsx',
      dest: 'assets/build/${m.slug}.min.js',
      react: 'wp',
    }`;
        }).join(',\n    ');

        const configContent = replacePlaceholders(TANGIBLE_CONFIG, config).replace('// {{MODULE_BUILD_CONFIGS}}', buildConfig);
        addFile(
            'tangible.config.js',
            '/tangible.config.js',
            configContent,
            'javascript'
        );

        // 5. Module Files (React + SCSS)
        config.modules.forEach(module => {
            const basePath = `/assets/src/${module.slug}`;

            addFile('index.tsx', `${basePath}/index.tsx`, replacePlaceholders(REACT_ENTRY_INDEX, config, module), 'typescript');
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

