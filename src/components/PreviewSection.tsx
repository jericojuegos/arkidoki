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
import { FileExplorer } from './FileExplorer';

interface Props {
    files: GeneratedFile[];
}

type SubTab = 'code' | 'scss';

export const PreviewSection: React.FC<Props> = ({ files }) => {
    const [activeFileIndex, setActiveFileIndex] = useState(0);
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('code');

    const activeFile = files[activeFileIndex];

    const handleFileSelect = (file: GeneratedFile, subType: SubTab = 'code') => {
        const idx = files.indexOf(file);
        if (idx !== -1) {
            setActiveFileIndex(idx);
            setActiveSubTab(subType);
        }
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
        return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    if (!activeFile) return <div className="panel right-panel card">No files generated</div>;

    return (
        <div className="card panel right-panel preview-container">
            <div className="preview-layout">
                {/* File Explorer Sidebar */}
                <div className="file-sidebar" style={{ padding: 0 }}>
                    <FileExplorer
                        files={files}
                        activeFile={activeFile}
                        activeSubTab={activeSubTab}
                        onSelect={handleFileSelect}
                    />
                </div>

                {/* Code Content */}
                <div className="preview-content">
                    <div className="content-header">
                        <div className="file-path">{getCurrentPath()}</div>
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
