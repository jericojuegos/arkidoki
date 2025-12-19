import type { PluginConfig } from '../types';

export const DEFAULT_CONFIG: PluginConfig = {
    projectName: 'SiteSync',
    projectSlug: 'sitesync',
    pluginTitle: 'Sitesync',
    projectConst: 'SITESYNC',
    pluginDescription: 'Synchronize sites easily',
    pluginVersion: '0.0.1',
    authorName: 'Team Tangible',
    authorUri: 'https://teamtangible.com',
    modules: [
        { name: 'Logger', slug: 'logs' }
    ],
    reactOptions: {
        pagination: true,
        filters: true,
        detailsModal: true,
        search: true,
        searchType: 'explicit'
    },
    dependencies: []
};
