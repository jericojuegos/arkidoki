import React from 'react';
import type { PluginConfig } from '../types';

interface Props {
    config: PluginConfig;
    onChange: (config: PluginConfig) => void;
}

export const InputSection: React.FC<Props> = ({ config, onChange }) => {

    const handleChange = (field: keyof PluginConfig, value: any) => {
        onChange({ ...config, [field]: value });
    };

    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        // Auto-generate slug and const
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const constName = name.toUpperCase().replace(/[^A-Z0-9]+/g, '_');

        onChange({
            ...config,
            projectName: name,
            projectSlug: slug,
            projectConst: constName,
            pluginTitle: name
        });
    };

    const toggleModule = (name: string, slug: string) => {
        const exists = config.modules.find(m => m.slug === slug);
        if (exists) {
            onChange({
                ...config,
                modules: config.modules.filter(m => m.slug !== slug)
            });
        } else {
            onChange({
                ...config,
                modules: [...config.modules, { name, slug }]
            });
        }
    };

    const popularModules = [
        { name: 'Logger', slug: 'logs' },
        { name: 'Sync', slug: 'sync' },
        { name: 'Connections', slug: 'connections' },
        { name: 'Users', slug: 'users' },
        { name: 'Courses', slug: 'courses' }
    ];

    return (
        <div className="card panel left-panel">
            <h2>Plugin Generator</h2>

            <div className="form-group">
                <label>Project Name</label>
                <input
                    type="text"
                    value={config.projectName}
                    onChange={handleProjectNameChange}
                    placeholder="e.g. SiteSync"
                />
            </div>

            <div className="form-group">
                <label>Description</label>
                <input
                    type="text"
                    value={config.pluginDescription}
                    onChange={(e) => handleChange('pluginDescription', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Version</label>
                <input
                    type="text"
                    value={config.pluginVersion}
                    onChange={(e) => handleChange('pluginVersion', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Author</label>
                <input
                    type="text"
                    value={config.authorName}
                    onChange={(e) => handleChange('authorName', e.target.value)}
                />
            </div>

            <h3>Modules</h3>
            <div className="modules-list">
                {popularModules.map(m => (
                    <div key={m.slug} className="checkbox-group">
                        <input
                            type="checkbox"
                            id={`mod-${m.slug}`}
                            checked={!!config.modules.find(mod => mod.slug === m.slug)}
                            onChange={() => toggleModule(m.name, m.slug)}
                        />
                        <label htmlFor={`mod-${m.slug}`}>{m.name}</label>
                    </div>
                ))}
            </div>

            <h3>React Options</h3>
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    checked={config.reactOptions.pagination}
                    onChange={(e) => handleChange('reactOptions', { ...config.reactOptions, pagination: e.target.checked })}
                />
                <label>Pagination</label>
            </div>
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    checked={config.reactOptions.filters}
                    onChange={(e) => handleChange('reactOptions', { ...config.reactOptions, filters: e.target.checked })}
                />
                <label>Filters</label>
            </div>
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    checked={config.reactOptions.detailsModal}
                    onChange={(e) => handleChange('reactOptions', { ...config.reactOptions, detailsModal: e.target.checked })}
                />
                <label>Details Modal</label>
            </div>
        </div>
    );
};
