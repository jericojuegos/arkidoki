import type { PluginConfig } from '../types';

export const DEFAULT_CONFIG: PluginConfig = {
    projectName: 'SiteSync',
    projectSlug: 'sitesync',
    pluginTitle: 'Sitesync',
    projectConst: 'SITESYNC',
    projectNamespace: 'MyPlugin',
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
        paginationStyle: 'simple',
        filters: true,
        detailsModal: true, // Kept from original, not explicitly removed by edit
        search: true, // Kept from original, not explicitly removed by edit
        searchType: 'explicit', // Kept from original, not explicitly removed by edit
        tableOptions: {
            responsive: true,
            styleModifiers: ['striped', 'hover']
        },
        loadingOptions: {
            initial: 'skeleton',
            refreshOverlay: true,
            buttonLoading: false,
            emptyState: 'simple'
        },
        dataFetching: 'none'
    },
    buildApproach: 'tangible', // Default
    dependencies: {
        tangibleFields: false
    },
    runtime: {
        react: 'wp',
        ui: 'wp-components',
        outputStyle: 'createElement'
    },
    architecture: 'independent'
};
