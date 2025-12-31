import type { PluginConfig, ModuleConfig } from '../../../types';
import { replacePlaceholders } from '../../utils';

export const buildTypesTemplate = (config: PluginConfig, module: ModuleConfig): string => {
    const template = `export type {{ModuleSingular}} = {
    id: number;
    ${module.columns.map(col => `${col.accessorKey}: any;`).join('\n    ')}
}
`;

    return replacePlaceholders(template, config, module);
};
