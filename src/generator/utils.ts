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

    // Module replacements
    if (module) {
        content = content.replace(/{{Module}}/g, module.name);
        content = content.replace(/{{module}}/g, module.slug);
        content = content.replace(/{{MODULE_CONST}}/g, module.slug.toUpperCase());
    }

    return content;
};
