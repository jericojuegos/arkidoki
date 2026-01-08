import React, { useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import type { FeatureDocumentation, AffectedFile, CodeChange } from '../types/documentation';
import type { ModuleConfig, PluginConfig } from '../types';

interface Props {
    docs: FeatureDocumentation;
    config: PluginConfig;
    onClose: () => void;
}

// Helper to replace placeholders with actual values
const replacePlaceholders = (text: string, module: ModuleConfig, config: PluginConfig): string => {
    return text
        .replace(/\{\{Module\}\}/g, module.name)
        .replace(/\{\{module\}\}/g, module.name.toLowerCase())
        .replace(/\{\{slug\}\}/g, config.projectSlug)
        .replace(/\{\{PLUGIN_SLUG\}\}/g, config.projectSlug);
};

// Deep clone and replace placeholders in documentation
const processDocsForModule = (
    docs: FeatureDocumentation,
    module: ModuleConfig,
    config: PluginConfig
): FeatureDocumentation => {
    return {
        ...docs,
        affectedFiles: docs.affectedFiles.map(file => ({
            ...file,
            path: replacePlaceholders(file.path, module, config),
            relativePath: replacePlaceholders(file.relativePath, module, config),
            fullCode: file.fullCode ? replacePlaceholders(file.fullCode, module, config) : undefined,
            changes: file.changes.map(change => ({
                ...change,
                code: replacePlaceholders(change.code, module, config),
                description: change.description ? replacePlaceholders(change.description, module, config) : undefined,
                label: change.label ? replacePlaceholders(change.label, module, config) : undefined,
            }))
        }))
    };
};

export const FeatureDocModal: React.FC<Props> = ({ docs, config, onClose }) => {
    const modules = config.modules;
    const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
    const selectedModule = modules[selectedModuleIndex] || modules[0];

    // Process docs with actual module names
    const processedDocs = useMemo(() =>
        processDocsForModule(docs, selectedModule, config),
        [docs, selectedModule, config]
    );

    const [selectedFile, setSelectedFile] = useState<AffectedFile>(processedDocs.affectedFiles[0]);
    const [showFullCode, setShowFullCode] = useState(false);

    // Update selected file when module changes
    React.useEffect(() => {
        setSelectedFile(processedDocs.affectedFiles[0]);
    }, [processedDocs]);

    // Close modal on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Close on Escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const renderCodeChange = (change: CodeChange) => {
        const changeTypeClass = `code-change--${change.type}`;
        const changeTypeIcon = {
            added: '✨',
            modified: '✏️',
            removed: '🗑️'
        }[change.type];

        // Highlight code with Prism - use typescript as fallback
        const language = Prism.languages.typescript || Prism.languages.javascript;
        const highlightedCode = Prism.highlight(
            change.code,
            language,
            'typescript'
        );

        return (
            <div key={`${change.startLine}-${change.label}`} className={`code-change ${changeTypeClass}`}>
                <div className="code-change__header">
                    <span className="code-change__icon">{changeTypeIcon}</span>
                    <span className="code-change__label">{change.label}</span>
                    <span className="code-change__lines">Lines {change.startLine}-{change.endLine}</span>
                </div>
                {change.description && (
                    <p className="code-change__description">{change.description}</p>
                )}
                <pre className="code-change__code">
                    <code
                        className="language-typescript"
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                </pre>
            </div>
        );
    };

    return (
        <div className="feature-doc-modal-backdrop" onClick={handleBackdropClick}>
            <div className="feature-doc-modal">
                {/* Header */}
                <div className="feature-doc-modal__header">
                    <h2>{docs.name}</h2>
                    <button
                        className="feature-doc-modal__close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="feature-doc-modal__content">
                    {/* Module Selector (if multiple modules) */}
                    {modules.length > 1 && (
                        <section className="feature-doc-section">
                            <h3>🎯 Select Module</h3>
                            <div className="module-selector">
                                {modules.map((mod, index) => (
                                    <button
                                        key={mod.slug}
                                        className={`module-btn ${selectedModuleIndex === index ? 'module-btn--active' : ''}`}
                                        onClick={() => setSelectedModuleIndex(index)}
                                    >
                                        {mod.name}
                                    </button>
                                ))}
                            </div>
                            <p className="module-note">
                                <em>Note: This feature applies to all modules. Select one to see example code.</em>
                            </p>
                        </section>
                    )}

                    {/* Overview */}
                    <section className="feature-doc-section">
                        <h3>📝 Overview</h3>
                        <p>{docs.description}</p>
                    </section>

                    {/* Affected Files */}
                    <section className="feature-doc-section">
                        <h3>📂 Files Modified ({processedDocs.affectedFiles.length})</h3>
                        <div className="file-badges">
                            {processedDocs.affectedFiles.map(file => (
                                <button
                                    key={file.path}
                                    className={`file-badge ${selectedFile.path === file.path ? 'file-badge--active' : ''}`}
                                    onClick={() => setSelectedFile(file)}
                                >
                                    <span className="file-badge__name">{file.path}</span>
                                    <span className={`file-badge__status file-badge__status--${file.status}`}>
                                        {file.status === 'new' ? 'NEW' : 'MODIFIED'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Code Changes */}
                    <section className="feature-doc-section">
                        <div className="feature-doc-section__header">
                            <h3>🔍 Changes in {selectedFile.path}</h3>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={showFullCode}
                                    onChange={(e) => setShowFullCode(e.target.checked)}
                                />
                                <span>Show Full Code</span>
                            </label>
                        </div>

                        <div className="code-changes">
                            {showFullCode && selectedFile.fullCode ? (
                                <pre className="code-change__code">
                                    <code
                                        className="language-typescript"
                                        dangerouslySetInnerHTML={{
                                            __html: Prism.highlight(
                                                selectedFile.fullCode,
                                                Prism.languages.typescript || Prism.languages.javascript,
                                                'typescript'
                                            )
                                        }}
                                    />
                                </pre>
                            ) : (
                                selectedFile.changes.map(renderCodeChange)
                            )}
                        </div>
                    </section>

                    {/* Step-by-Step Guide */}
                    {docs.steps && docs.steps.length > 0 && (
                        <section className="feature-doc-section">
                            <h3>📋 Step-by-Step Guide</h3>
                            <ol className="steps-list">
                                {docs.steps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                        </section>
                    )}

                    {/* Dependencies */}
                    {docs.dependencies && docs.dependencies.length > 0 && (
                        <section className="feature-doc-section">
                            <h3>🔗 Dependencies</h3>
                            <p>This feature requires: {docs.dependencies.join(', ')}</p>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
