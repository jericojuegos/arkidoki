import React, { useState } from 'react';
import type { PluginConfig } from '../types';

interface Props {
    config: PluginConfig;
    onChange: (config: PluginConfig) => void;
}

export const InputSection: React.FC<Props> = ({ config, onChange }) => {
    const [newModule, setNewModule] = useState('');

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

    const handleAddModule = () => {
        if (!newModule.trim()) return;
        const slug = newModule.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Check for duplicates
        if (config.modules.some(m => m.slug === slug)) {
            // Ideally show an error, for now just ignore
            return;
        }

        onChange({
            ...config,
            modules: [...config.modules, { name: newModule, slug }]
        });
        setNewModule('');
    };

    const handleRemoveModule = (slug: string) => {
        onChange({
            ...config,
            modules: config.modules.filter(m => m.slug !== slug)
        });
    };

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
            <div className="form-group module-input-group">
                <input
                    type="text"
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                    placeholder="Add Module (e.g. Logger)"
                />
                <button onClick={handleAddModule} className="btn-add">Add</button>
            </div>

            <div className="modules-list">
                {config.modules.length === 0 && <p className="no-modules">No modules added.</p>}
                {config.modules.map(m => (
                    <div key={m.slug} className="module-item">
                        <span>{m.name}</span>
                        <button
                            onClick={() => handleRemoveModule(m.slug)}
                            className="btn-remove"
                            title="Remove Module"
                        >×</button>
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
