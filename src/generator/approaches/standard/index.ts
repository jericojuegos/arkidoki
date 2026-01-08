import type { PluginConfig, GeneratedFile } from '../../../types';
import type { GeneratorStrategy } from '../interface';
import { replacePlaceholders } from '../../utils';
import { STANDARD_MAIN_PLUGIN } from './templates';
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

export class StandardStrategy implements GeneratorStrategy {
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
            replacePlaceholders(STANDARD_MAIN_PLUGIN, config)
        );

        // 2.1 Query Client (Shared)
        if (useReactQuery) {
            addFile(
                'queryClient.ts',
                '/assets/src/queryClient.ts',
                QUERY_CLIENT,
                'typescript'
            );
        }

        // 2.2 Shared Providers (for Hybrid architecture)
        if (config.architecture === 'hybrid') {
            addFile(
                'providers.tsx',
                '/assets/src/app/providers.tsx',
                APP_PROVIDERS,
                'typescript'
            );
        }

        // 2. Module Files (React + SCSS)
        config.modules.forEach(module => {
            const basePath = `/assets/src/${module.slug}`;

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

            addFile(`${module.name}Table.tsx`, `${basePath}/${module.name}Table.tsx`, buildTableTemplate(config, module), 'typescript',
                buildTableScss(config, module), `${basePath}/${module.name}Table.scss`);

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
