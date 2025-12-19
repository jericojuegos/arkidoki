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
        {
            name: 'Logger',
            slug: 'logs',
            columns: [
                { header: 'ID', accessorKey: 'id', width: 60, type: 'text' },
                { header: 'Date', accessorKey: 'date', width: 180, type: 'date' },
                { header: 'Status', accessorKey: 'status', width: 100, type: 'status' }
            ]
        }
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
