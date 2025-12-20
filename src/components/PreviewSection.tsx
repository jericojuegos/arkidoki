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

    // Reset sub-tab when switching files
    const handleFileSwitch = (idx: number) => {
        setActiveFileIndex(idx);
        setActiveSubTab('code');
    };

    const hasStyleContent = activeFile?.styleContent && activeFile.styleContent.length > 0;

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
        // Fallback escape
        return content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    };

    if (!activeFile) return <div className="panel right-panel card">No files generated</div>;

    return (
        <div className="card panel right-panel">
            <h3>Preview</h3>

            {/* File Tabs */}
            <div className="tabs">
                {files.map((file, idx) => (
                    <button
                        key={idx}
                        className={clsx('tab', activeFileIndex === idx && 'active')}
                        onClick={() => handleFileSwitch(idx)}
                    >
                        {file.name}
                    </button>
                ))}
            </div>

            {/* Sub-tabs for TSX/SCSS */}
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

            <div className="code-preview">
                <button className="copy-btn" onClick={copyToClipboard}>Copy</button>
                <pre>
                    <code
                        className={`language-${getCurrentLanguage()}`}
                        dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
                    />
                </pre>
            </div>
            <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                Path: {getCurrentPath()}
            </div>
        </div>
    );
};
