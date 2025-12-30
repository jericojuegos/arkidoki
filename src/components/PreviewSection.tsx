import React, { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-scss';
import type { GeneratedFile } from '../types';
import clsx from 'clsx';

interface Props {
    files: GeneratedFile[];
}

type SubTab = 'code' | 'scss';

export const PreviewSection: React.FC<Props> = ({ files }) => {
    const [activeFileIndex, setActiveFileIndex] = useState(0);
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('code');

    const activeFile = files[activeFileIndex];

    // Group files by type/module
    const mainFiles: { index: number; file: GeneratedFile }[] = [];
    const mainAdminFiles: { index: number; file: GeneratedFile }[] = [];
    const mainApiFiles: { index: number; file: GeneratedFile }[] = [];
    const modules: Record<string, { index: number; file: GeneratedFile }[]> = {};

    files.forEach((file, idx) => {
        const path = file.path;
        const parts = path.split('/');

        // 1. Module Files (React/SCSS - usually in assets/src/)
        if (parts.includes('src') && parts.length >= 4 && parts[parts.indexOf('src') + 1] !== 'app') {
            const moduleName = parts[parts.indexOf('src') + 1];
            if (!modules[moduleName]) modules[moduleName] = [];
            modules[moduleName].push({ index: idx, file });
        }
        // 2. API Files (All files in includes/API)
        else if (path.toLowerCase().includes('/api/')) {
            mainApiFiles.push({ index: idx, file });
        }
        // 3. Admin PHP Classes (All files in includes/Admin)
        else if (path.toLowerCase().includes('/admin/')) {
            mainAdminFiles.push({ index: idx, file });
        }
        // 4. Core Plugin Files (Main root files)
        else {
            mainFiles.push({ index: idx, file });
        }
    });

    // Reset sub-tab when switching files
    const handleFileSwitch = (idx: number) => {
        setActiveFileIndex(idx);
        setActiveSubTab('code');
    };

    const hasStyleContent = activeFile?.styleContent && activeFile.styleContent.length > 0;
    // ... (rest of helper functions same as before)
    const getCurrentContent = () => {
        if (!activeFile) return '';
        if (activeSubTab === 'scss' && hasStyleContent) {
            return activeFile.styleContent || '';
        }
        return activeFile.content;
    };

    const getCurrentLanguage = () => {
        if (!activeFile) return 'plaintext';
        if (activeSubTab === 'scss') return 'scss';
        return activeFile.language;
    };

    const getCurrentPath = () => {
        if (!activeFile) return '';
        if (activeSubTab === 'scss' && activeFile.stylePath) {
            return activeFile.stylePath;
        }
        return activeFile.path;
    };

    const copyToClipboard = () => {
        const content = getCurrentContent();
        if (content) {
            navigator.clipboard.writeText(content);
        }
    };

    const getHighlightedCode = () => {
        const content = getCurrentContent();
        if (!content) return '';

        const langMap: Record<string, string> = {
            'php': 'php',
            'typescript': 'typescript',
            'javascript': 'javascript',
            'json': 'json',
            'scss': 'scss'
        };
        const lang = langMap[getCurrentLanguage()] || 'plaintext';
        const grammar = Prism.languages[lang];

        if (grammar) {
            try {
                return Prism.highlight(content, grammar, lang);
            } catch (e) {
                console.warn('Highlight syntax error', e);
            }
        }
        return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    if (!activeFile) return <div className="panel right-panel card">No files generated</div>;

    return (
        <div className="card panel right-panel preview-container">
            <h3>Preview</h3>

            <div className="preview-layout">
                {/* File Sidebar */}
                <div className="file-sidebar">
                    <div className="sidebar-group">
                        <div className="group-label">Main</div>
                        {mainFiles.map(({ index, file }) => (
                            <button
                                key={index}
                                className={clsx('file-item', activeFileIndex === index && 'active')}
                                onClick={() => handleFileSwitch(index)}
                            >
                                <span className="file-icon">{file.language === 'php' ? '🐘' : '📜'}</span>
                                {file.name}
                            </button>
                        ))}
                    </div>

                    {mainAdminFiles.length > 0 && (
                        <div className="sidebar-group">
                            <div className="group-label">Main - Admin</div>
                            {mainAdminFiles.map(({ index, file }) => (
                                <button
                                    key={index}
                                    className={clsx('file-item', activeFileIndex === index && 'active')}
                                    onClick={() => handleFileSwitch(index)}
                                >
                                    <span className="file-icon">🐘</span>
                                    {file.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {mainApiFiles.length > 0 && (
                        <div className="sidebar-group">
                            <div className="group-label">Main - API</div>
                            {mainApiFiles.map(({ index, file }) => (
                                <button
                                    key={index}
                                    className={clsx('file-item', activeFileIndex === index && 'active')}
                                    onClick={() => handleFileSwitch(index)}
                                >
                                    <span className="file-icon">⚡</span>
                                    {file.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {Object.entries(modules).map(([moduleName, moduleFiles]) => (
                        <div key={moduleName} className="sidebar-group">
                            <div className="group-label">{moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}</div>
                            {moduleFiles.map(({ index, file }) => (
                                <button
                                    key={index}
                                    className={clsx('file-item', activeFileIndex === index && 'active')}
                                    onClick={() => handleFileSwitch(index)}
                                >
                                    <span className="file-icon">
                                        {file.path.endsWith('Endpoint.php') ? '⚡' :
                                            file.language === 'php' ? '🐘' : '⚛️'}
                                    </span>
                                    {file.name}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Code Content */}
                <div className="preview-content">
                    <div className="content-header">
                        <div className="file-path">{getCurrentPath()}</div>

                        {hasStyleContent && (
                            <div className="sub-tabs">
                                <button
                                    className={clsx('sub-tab', activeSubTab === 'code' && 'active')}
                                    onClick={() => setActiveSubTab('code')}
                                >
                                    TSX
                                </button>
                                <button
                                    className={clsx('sub-tab', activeSubTab === 'scss' && 'active')}
                                    onClick={() => setActiveSubTab('scss')}
                                >
                                    SCSS
                                </button>
                            </div>
                        )}

                        <button className="copy-btn-inline" onClick={copyToClipboard}>Copy</button>
                    </div>

                    <div className="code-preview-scroll">
                        <pre>
                            <code
                                className={`language-${getCurrentLanguage()}`}
                                dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
                            />
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};
