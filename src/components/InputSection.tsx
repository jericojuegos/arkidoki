import React, { useState } from 'react';
import type { PluginConfig, ColumnConfig } from '../types';
import { FeatureInfoIcon } from './FeatureInfoIcon';
import { RuntimeStrategy } from './RuntimeStrategy';

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

        // Generate PascalCase namespace: 'My Plugin Name' -> 'MyPluginName'
        const namespace = name.replace(/[^a-zA-Z0-9 ]/g, '') // Remove special chars but keep spaces for split
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        onChange({
            ...config,
            projectName: name,
            projectSlug: slug,
            projectConst: constName,
            projectNamespace: namespace,
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
            <h2>Arkidoki</h2>

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
                <label>Project Namespace</label>
                <input
                    type="text"
                    value={config.projectNamespace}
                    onChange={(e) => handleChange('projectNamespace', e.target.value)}
                    placeholder="e.g. SiteSync"
                />
            </div>


            <div className="form-group">
                <label>Architecture Pattern</label>
                <select
                    value={config.architecture || 'independent'}
                    onChange={(e) => handleChange('architecture', e.target.value)}
                >
                    <option value="independent">Independent Modules (Multi-entry)</option>
                    <option value="hybrid">Hybrid Core (Shared Providers) - Recommended</option>
                    <option value="spa">Single Entry (SPA) - Advanced</option>
                </select>
                <p className="help-text">
                    <strong>Independent:</strong> Each module is isolated.<br />
                    <strong>Hybrid:</strong> Shared <code>app/providers.tsx</code> for context.<br />
                    <strong>SPA:</strong> Single entry point with client-side routing.
                </p>
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={config.dependencies?.tangibleFields ?? false}
                        onChange={(e) => onChange({
                            ...config,
                            dependencies: {
                                ...config.dependencies,
                                tangibleFields: e.target.checked
                            }
                        })}
                    />
                    Use Tangible Fields
                </label>
                <p className="help-text">
                    Adds <code>importToGlobal</code> for <code>tangible-fields</code> in build config.
                </p>
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
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ fontSize: '0.85rem' }}>Data Storage</label>
                                    <select
                                        value={m.storage || 'custom_table'}
                                        onChange={(e) => {
                                            const updatedModules = config.modules.map(mod =>
                                                mod.slug === m.slug ? { ...mod, storage: e.target.value as any } : mod
                                            );
                                            onChange({ ...config, modules: updatedModules });
                                        }}
                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                    >
                                        <option value="custom_table">Custom Table (Default)</option>
                                        <option value="object_cache">Object Cache (Redis/Memcached)</option>
                                        <option value="wp_options_array">wp_options (Associative Array)</option>
                                        <option value="wp_options_single">wp_options (Single Option)</option>
                                        <option value="wp_options_per_item">wp_options (Per Item / Hybrid)</option>
                                        <option value="post_meta">Post Meta</option>
                                        <option value="user_meta">User Meta</option>
                                        <option value="term_meta">Term Meta</option>
                                        <option value="transient">Transients</option>
                                        <option value="json_file">JSON Files</option>
                                    </select>
                                </div>

                                {(m.storage === 'custom_table' || !m.storage) && (
                                    <>
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
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <RuntimeStrategy config={config} onChange={onChange} />

            <h3>React Options</h3>
            <div className="form-group">
                <label>Data Fetching Strategy</label>
                <select
                    value={config.reactOptions.dataFetching || 'none'}
                    onChange={(e) => handleChange('reactOptions', { ...config.reactOptions, dataFetching: e.target.value as any })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                    <option value="none">Standard (Props & State)</option>
                    <option value="react-query">TanStack React Query</option>
                </select>
            </div>

            <div className="checkbox-group">
                <input
                    type="checkbox"
                    checked={config.reactOptions.pagination}
                    onChange={(e) => handleChange('reactOptions', { ...config.reactOptions, pagination: e.target.checked })}
                />
                <label>Pagination</label>
                <FeatureInfoIcon featureId="pagination" config={config} />
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
                        <option value="v3">V3 (Numbered)</option>
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

            {/* Table Options */}
            <h3>Table Options <FeatureInfoIcon featureId="table-options" config={config} /></h3>
            <div className="checkbox-group">
                <input
                    type="checkbox"
                    checked={config.reactOptions.tableOptions?.responsive ?? true}
                    onChange={(e) => handleChange('reactOptions', {
                        ...config.reactOptions,
                        tableOptions: {
                            ...(config.reactOptions.tableOptions || { styleModifiers: [] }),
                            responsive: e.target.checked
                        }
                    })}
                />
                <label>Responsive</label>
            </div>

            <div className="form-group">
                <label>Style Modifiers</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['striped', 'bordered', 'compact', 'dark'].map(style => (
                        <label key={style} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                            <input
                                type="checkbox"
                                checked={config.reactOptions.tableOptions?.styleModifiers?.includes(style) || false}
                                onChange={(e) => {
                                    const current = config.reactOptions.tableOptions?.styleModifiers || [];
                                    const newModifiers = e.target.checked
                                        ? [...current, style]
                                        : current.filter(s => s !== style);
                                    handleChange('reactOptions', {
                                        ...config.reactOptions,
                                        tableOptions: {
                                            ...(config.reactOptions.tableOptions || { responsive: true }),
                                            styleModifiers: newModifiers
                                        }
                                    });
                                }}
                            />
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                        </label>
                    ))}
                </div>
            </div>

            {/* Loading States */}
            <h3>Loading States <FeatureInfoIcon featureId="loading-states" config={config} /></h3>
            <div className="form-group">
                <label>Initial Loading</label>
                <select
                    value={config.reactOptions.loadingOptions?.initial || 'none'}
                    onChange={(e) => handleChange('reactOptions', {
                        ...config.reactOptions,
                        loadingOptions: {
                            ...(config.reactOptions.loadingOptions || { refreshOverlay: false, buttonLoading: false, emptyState: 'simple' }),
                            initial: e.target.value as any
                        }
                    })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                    <option value="none">None</option>
                    <option value="spinner">Spinner</option>
                    <option value="skeleton">Skeleton</option>
                </select>
            </div>

            <div className="checkbox-group">
                <input
                    type="checkbox"
                    checked={config.reactOptions.loadingOptions?.refreshOverlay ?? false}
                    onChange={(e) => handleChange('reactOptions', {
                        ...config.reactOptions,
                        loadingOptions: {
                            ...(config.reactOptions.loadingOptions || { initial: 'none', buttonLoading: false, emptyState: 'simple' }),
                            refreshOverlay: e.target.checked
                        }
                    })}
                />
                <label>Refresh Overlay</label>
            </div>

            <div className="checkbox-group">
                <input
                    type="checkbox"
                    checked={config.reactOptions.loadingOptions?.buttonLoading ?? false}
                    onChange={(e) => handleChange('reactOptions', {
                        ...config.reactOptions,
                        loadingOptions: {
                            ...(config.reactOptions.loadingOptions || { initial: 'none', refreshOverlay: false, emptyState: 'simple' }),
                            buttonLoading: e.target.checked
                        }
                    })}
                />
                <label>Button Loading</label>
            </div>

            <div className="form-group">
                <label>Empty State Style</label>
                <select
                    value={config.reactOptions.loadingOptions?.emptyState || 'simple'}
                    onChange={(e) => handleChange('reactOptions', {
                        ...config.reactOptions,
                        loadingOptions: {
                            ...(config.reactOptions.loadingOptions || { initial: 'none', refreshOverlay: false, buttonLoading: false }),
                            emptyState: e.target.value as any
                        }
                    })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                    <option value="simple">Simple Text</option>
                    <option value="illustration">Illustration</option>
                </select>
            </div>
        </div>
    );
};
