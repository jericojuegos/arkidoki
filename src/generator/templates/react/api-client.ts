import type { PluginConfig } from '../../../types';

export const buildApiClientTemplate = (config: PluginConfig): string => {
    return `export const apiFetch = (window as any).wp.apiFetch;
export const API_BASE = window.${config.projectSlug}Data?.apiUrl || '${config.projectSlug}/v1';

`;
};
