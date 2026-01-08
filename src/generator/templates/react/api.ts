import type { PluginConfig, ModuleConfig } from '../../../types';
import { replacePlaceholders } from '../../utils';

export const buildApiTemplate = (config: PluginConfig, module: ModuleConfig): string => {
    const template = `import { apiFetch, API_BASE } from '../utils/api-client';
import type { {{Module}}Response, {{ModuleSingular}}Response, {{ModuleSingular}} } from './types';

export const {{module}}API = {
    getAll: async (): Promise<{{Module}}Response> => {
        return await apiFetch({
            path: \`\${API_BASE}/{{module}}\`,
        }) as {{Module}}Response;
    },

    getOne: async (id: string | number): Promise<{{ModuleSingular}}Response> => {
        return await apiFetch({
            path: \`\${API_BASE}/{{module}}/\${id}\`,
        }) as {{ModuleSingular}}Response;
    },

    create: async (data: Omit<{{ModuleSingular}}, 'id' | 'created' | 'modified' | 'status'>): Promise<{{ModuleSingular}}Response> => {
        return await apiFetch({
            path: \`\${API_BASE}/{{module}}\`,
            method: 'POST',
            data,
        }) as {{ModuleSingular}}Response;
    },

    update: async (id: string | number, data: Partial<{{ModuleSingular}}>): Promise<{{ModuleSingular}}Response> => {
        return await apiFetch({
            path: \`\${API_BASE}/{{module}}/\${id}\`,
            method: 'PUT',
            data,
        }) as {{ModuleSingular}}Response;
    },

    delete: async (id: string | number): Promise<void> => {
        await apiFetch({
            path: \`\${API_BASE}/{{module}}/\${id}\`,
            method: 'DELETE',
        });
    },
};
`;
    return replacePlaceholders(template, config, module);
};
