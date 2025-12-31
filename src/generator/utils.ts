import type { PluginConfig, ModuleConfig } from '../types';

export const replacePlaceholders = (template: string, config: PluginConfig, module?: ModuleConfig): string => {
    let content = template;

    // Global replacements
    content = content.replace(/{{PROJECT_NAME}}/g, config.projectName);
    content = content.replace(/{{PLUGIN_SLUG}}/g, config.projectSlug);
    content = content.replace(/{{PLUGIN_TITLE}}/g, config.pluginTitle);
    content = content.replace(/{{PROJECT_CONST}}/g, config.projectConst);
    content = content.replace(/{{PLUGIN_VERSION}}/g, config.pluginVersion);
    content = content.replace(/{{PLUGIN_DESCRIPTION}}/g, config.pluginDescription);
    content = content.replace(/{{AUTHOR_NAME}}/g, config.authorName);
    content = content.replace(/{{AUTHOR_URI}}/g, config.authorUri);
    content = content.replace(/{{PROJECT_NAMESPACE}}/g, config.projectNamespace || config.projectName.replace(/[^a-zA-Z0-9]/g, ''));

    // Module replacements
    if (module) {
        const singularName = module.name.endsWith('s') ? module.name.slice(0, -1) : module.name;
        const singularSlug = module.slug.endsWith('s') ? module.slug.slice(0, -1) : module.slug;

        content = content.replace(/{{Module}}/g, module.name);
        content = content.replace(/{{module}}/g, module.slug);
        content = content.replace(/{{ModuleSingular}}/g, singularName);
        content = content.replace(/{{moduleSingular}}/g, singularSlug);
        content = content.replace(/{{MODULE_CONST}}/g, module.slug.toUpperCase());

        if (module.columns) {
            const columnsDef = module.columns.map(col => {
                let def = `
        columnHelper.accessor('${col.accessorKey}', {
            header: '${col.header}',
            size: ${col.width || 150},`;

                if (col.type === 'date') {
                    def += `
            cell: (info) => new Date(info.getValue()).toLocaleString(),`;
                } else if (col.type === 'status') {
                    def += `
            cell: (info) => {
                const status = info.getValue();
                return (
                    <span className={\`status-badge status-\${status}\`}>
                        {status.toUpperCase()}
                    </span>
                );
            },`;
                }

                def += `
        }),`;
                return def;
            }).join('');
            content = content.replace('// {{TABLE_COLUMNS}}', columnsDef);
        }
    }

    return content;
};
