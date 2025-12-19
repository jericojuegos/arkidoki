import React, { useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-javascript';
import type { GeneratedFile } from '../types';
import clsx from 'clsx';

interface Props {
    files: GeneratedFile[];
}

export const PreviewSection: React.FC<Props> = ({ files }) => {
    const [activeFileIndex, setActiveFileIndex] = useState(0);

    // No useEffect needed for synchronous highlight

    const activeFile = files[activeFileIndex];

    const copyToClipboard = () => {
        if (activeFile) {
            navigator.clipboard.writeText(activeFile.content);
            // Could add toast notification here
        }
    };

    const getHighlightedCode = () => {
        if (!activeFile) return '';
        const langMap: Record<string, string> = {
            'php': 'php',
            'typescript': 'typescript',
            'javascript': 'javascript',
            'json': 'json'
        };
        const lang = langMap[activeFile.language] || 'plaintext';
        const grammar = Prism.languages[lang];

        if (grammar) {
            try {
                return Prism.highlight(activeFile.content, grammar, lang);
            } catch (e) {
                console.warn('Highlight syntax error', e);
            }
        }
        // Fallback escape
        return activeFile.content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    };

    if (!activeFile) return <div className="panel right-panel card">No files generated</div>;

    return (
        <div className="card panel right-panel">
            <h3>Preview</h3>

            <div className="tabs">
                {files.map((file, idx) => (
                    <button
                        key={idx}
                        className={clsx('tab', activeFileIndex === idx && 'active')}
                        onClick={() => setActiveFileIndex(idx)}
                    >
                        {file.name}
                    </button>
                ))}
            </div>

            <div className="code-preview">
                <button className="copy-btn" onClick={copyToClipboard}>Copy</button>
                <pre>
                    <code
                        className={`language-${activeFile.language}`}
                        dangerouslySetInnerHTML={{ __html: getHighlightedCode() }}
                    />
                </pre>
            </div>
            <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                Path: {activeFile.path}
            </div>
        </div>
    );
};

