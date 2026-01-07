import type { PluginConfig, ModuleConfig } from '../../../types';
import { replacePlaceholders } from '../../utils';

export const buildTypesTemplate = (config: PluginConfig, module: ModuleConfig): string => {
    const template = `export type {{ModuleSingular}} = {
    id: number;
    ${module.columns.map(col => `${col.accessorKey}: any;`).join('\n    ')}
}

export type {{Module}}Response = {
    success: boolean;
    data: {{ModuleSingular}}[];
    total: number;
    pages: number;
};

export type {{ModuleSingular}}Response = {
    success: boolean;
    data: {{ModuleSingular}};
};

`;

    return replacePlaceholders(template, config, module);
};
