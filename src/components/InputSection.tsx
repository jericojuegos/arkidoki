import React, { useState } from 'react';
import type { PluginConfig, ColumnConfig } from '../types';

interface Props {
    config: PluginConfig;
    onChange: (config: PluginConfig) => void;
}

export const InputSection: React.FC<Props> = ({ config, onChange }) => {
    const [newModule, setNewModule] = useState('');
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    // New Column State
    const [newColHeader, setNewColHeader] = useState('');
    const [newColAccessor, setNewColAccessor] = useState('');
    const [newColType, setNewColType] = useState<ColumnConfig['type']>('text');


    const handleChange = (field: keyof PluginConfig, value: any) => {
        onChange({ ...config, [field]: value });
    };

    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
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

        if (config.modules.some(m => m.slug === slug)) return;

        onChange({
            ...config,
            modules: [...config.modules, {
                name: newModule,
                slug,
                columns: [
                    { header: 'ID', accessorKey: 'id', width: 60, type: 'text' },
                    { header: 'Date', accessorKey: 'date', width: 150, type: 'date' },
                    { header: 'Status', accessorKey: 'status', width: 100, type: 'status' }
                ]
            }]
        });
        setNewModule('');
    };

    const handleRemoveModule = (slug: string) => {
        onChange({
            ...config,
            modules: config.modules.filter(m => m.slug !== slug)
        });
        if (expandedModule === slug) setExpandedModule(null);
    };

    const handleAddColumn = (moduleSlug: string) => {
        if (!newColHeader || !newColAccessor) return;

        const updatedModules = config.modules.map(mod => {
            if (mod.slug === moduleSlug) {
                return {
                    ...mod,
                    columns: [...mod.columns, {
                        header: newColHeader,
                        accessorKey: newColAccessor,
                        type: newColType,
                        width: 150
                    }]
                };
            }
            return mod;
        });

        onChange({ ...config, modules: updatedModules });
        setNewColHeader('');
        setNewColAccessor('');
    };

    const handleRemoveColumn = (moduleSlug: string, accessor: string) => {
        const updatedModules = config.modules.map(mod => {
            if (mod.slug === moduleSlug) {
                return {
                    ...mod,
                    columns: mod.columns.filter(c => c.accessorKey !== accessor)
                };
            }
            return mod;
        });
        onChange({ ...config, modules: updatedModules });
    };

    return (
        <div className="card panel left-panel">
            <h2>Plugin Generator</h2>

            <div className="form-group">
                <label>Build Approach</label>
                <select
                    value={config.buildApproach}
                    onChange={(e) => handleChange('buildApproach', e.target.value as any)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                    <option value="tangible">Tangible Framework</option>
                    <option value="standard">Standard WordPress</option>
                </select>
            </div>

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
                    placeholder="Add Module (e.g. Courses)"
                />
                <button onClick={handleAddModule} className="btn-add">Add</button>
            </div>

            <div className="modules-list">
                {config.modules.length === 0 && <p className="no-modules">No modules added.</p>}
                {config.modules.map(m => (
                    <div key={m.slug} className="module-container">
                        <div className="module-header">
                            <span onClick={() => setExpandedModule(expandedModule === m.slug ? null : m.slug)} className="module-name-trigger">
                                {expandedModule === m.slug ? '▼' : '▶'} {m.name}
                            </span>
                            <button
                                onClick={() => handleRemoveModule(m.slug)}
                                className="btn-remove"
                            >×</button>
                        </div>

                        {expandedModule === m.slug && (
                            <div className="module-schema-editor">
                                <h4>Table Schema</h4>
                                <ul className="schema-list">
                                    {m.columns.map(col => (
                                        <li key={col.accessorKey}>
                                            <span>{col.header} <span className="pill">{col.accessorKey}</span> <span className="pill-type">{col.type}</span></span>
                                            <button onClick={() => handleRemoveColumn(m.slug, col.accessorKey)}>×</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="add-col-form">
                                    <input
                                        placeholder="Header"
                                        value={newColHeader}
                                        onChange={e => setNewColHeader(e.target.value)}
                                        style={{ width: '30%' }}
                                    />
                                    <input
                                        placeholder="Accessor"
                                        value={newColAccessor}
                                        onChange={e => setNewColAccessor(e.target.value)}
                                        style={{ width: '30%' }}
                                    />
                                    <select
                                        value={newColType}
                                        onChange={e => setNewColType(e.target.value as any)}
                                        style={{ width: '25%' }}
                                    >
                                        <option value="text">Text</option>
                                        <option value="date">Date</option>
                                        <option value="status">Status</option>
                                        <option value="boolean">Boolean</option>
                                    </select>
                                    <button onClick={() => handleAddColumn(m.slug)}>+</button>
                                </div>
                            </div>
                        )}
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
            {config.reactOptions.pagination && (
                <div className="sub-options" style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Style:</label>
                    <select
                        value={config.reactOptions.paginationStyle}
                        onChange={(e) => handleChange('reactOptions', { ...config.reactOptions, paginationStyle: e.target.value as any })}
                        style={{ padding: '0.25rem', borderRadius: '3px', border: '1px solid var(--border-color)' }}
                    >
                        <option value="simple">Simple (Buttons)</option>
                        <option value="v2">V2 (Input + Arrows)</option>
                    </select>
                </div>
            )}
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    checked={config.reactOptions.filters}
                    onChange={(e) => handleChange('reactOptions', { ...config.reactOptions, filters: e.target.checked })}
                />
                <label>Filters</label>
            </div>
        </div>
    );
};
