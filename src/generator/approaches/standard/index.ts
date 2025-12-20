import type { PluginConfig, GeneratedFile } from '../../../types';
import type { GeneratorStrategy } from '../interface';
import { replacePlaceholders } from '../../utils';
import { STANDARD_MAIN_PLUGIN } from './templates';
import {
    REACT_ENTRY_INDEX,
    REACT_PAGE,
    REACT_TABLE,
    REACT_FILTERS,
    PAGINATION_TEMPLATES,
    REACT_DETAILS_MODAL
} from '../../templates/react/index';

export class StandardStrategy implements GeneratorStrategy {
    generate(config: PluginConfig): GeneratedFile[] {
        const files: GeneratedFile[] = [];

        // Helper to push files
        const addFile = (name: string, path: string, content: string, language: 'php' | 'typescript' | 'javascript' | 'json' = 'php') => {
            files.push({ name, path, content, language });
        };

        // 1. Main Plugin File
        addFile(
            `${config.projectSlug}.php`,
            `/${config.projectSlug}.php`,
            replacePlaceholders(STANDARD_MAIN_PLUGIN, config)
        );

        // 2. Module Files (React) - Shared
        config.modules.forEach(module => {
            const basePath = `/assets/src/${module.slug}`;

            addFile('index.tsx', `${basePath}/index.tsx`, replacePlaceholders(REACT_ENTRY_INDEX, config, module), 'typescript');
            addFile(`${module.name}Page.tsx`, `${basePath}/${module.name}Page.tsx`, replacePlaceholders(REACT_PAGE, config, module), 'typescript');
            addFile(`${module.name}Table.tsx`, `${basePath}/${module.name}Table.tsx`, replacePlaceholders(REACT_TABLE, config, module), 'typescript');
            addFile(`${module.name}Filters.tsx`, `${basePath}/${module.name}Filters.tsx`, replacePlaceholders(REACT_FILTERS, config, module), 'typescript');

            const style = config.reactOptions.paginationStyle || 'simple';
            const paginationTemplate = PAGINATION_TEMPLATES[style];
            addFile(`${module.name}Pagination.tsx`, `${basePath}/${module.name}Pagination.tsx`, replacePlaceholders(paginationTemplate, config, module), 'typescript');

            addFile(`${module.name}DetailsModal.tsx`, `${basePath}/${module.name}DetailsModal.tsx`, replacePlaceholders(REACT_DETAILS_MODAL, config, module), 'typescript');
        });

        return files;
    }
}
