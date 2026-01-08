import React, { useState, useMemo } from 'react';
import type { GeneratedFile } from '../types';
import clsx from 'clsx';

interface FileExplorerProps {
    files: GeneratedFile[];
    activeFile: GeneratedFile | null;
    activeSubTab: 'code' | 'scss';
    onSelect: (file: GeneratedFile, subType?: 'code' | 'scss') => void;
}

interface TreeNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: TreeNode[];
    fileData?: GeneratedFile;
    subType?: 'code' | 'scss';
}

const buildFileTree = (files: GeneratedFile[]): TreeNode[] => {
    const root: TreeNode[] = [];

    files.forEach(file => {
        // Clean path separator
        const normalizedPath = file.path.replace(/\\/g, '/');
        const parts = normalizedPath.split('/').filter(p => p);
        const fileName = parts.pop()!;
        const dirParts = parts;

        let currentLevel = root;

        // Traverse/Create directories
        dirParts.forEach((part, index) => {
            const existingDir = currentLevel.find(n => n.name === part && n.type === 'directory');
            if (existingDir) {
                currentLevel = existingDir.children!;
            } else {
                const newDir: TreeNode = {
                    name: part,
                    path: dirParts.slice(0, index + 1).join('/'),
                    type: 'directory',
                    children: []
                };
                currentLevel.push(newDir);
                currentLevel = newDir.children!;
            }
        });

        // Add File
        currentLevel.push({
            name: fileName,
            path: normalizedPath,
            type: 'file',
            fileData: file,
            subType: 'code'
        });

        // Add Style File (Virtual) if exists
        if (file.styleContent && file.stylePath) {
            const styleParts = file.stylePath.replace(/\\/g, '/').split('/').filter(p => p);
            const styleName = styleParts.pop()!;
            const styleDirParts = styleParts;

            // Traverse/Create directories for style file
            let styleLevel = root;
            styleDirParts.forEach((part, index) => {
                const existingDir = styleLevel.find(n => n.name === part && n.type === 'directory');
                if (existingDir) {
                    styleLevel = existingDir.children!;
                } else {
                    const newDir: TreeNode = {
                        name: part,
                        path: styleDirParts.slice(0, index + 1).join('/'),
                        type: 'directory',
                        children: []
                    };
                    styleLevel.push(newDir);
                    styleLevel = newDir.children!;
                }
            });

            styleLevel.push({
                name: styleName,
                path: file.stylePath,
                type: 'file',
                fileData: file, // Link to same generated file
                subType: 'scss'
            });
        }
    });

    // Recursive sort: Directories first, then alphabetical
    const sortNodes = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'directory' ? -1 : 1;
        });
        nodes.forEach(n => {
            if (n.children) sortNodes(n.children);
        });
    };

    sortNodes(root);
    return root;
};

// Icons (VSCode style SVGs)
const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M6 4L11 8L6 12V4Z" />
    </svg>
);

const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M4 6L8 11L12 6H4Z" />
    </svg>
);

const IconTS = () => <svg width="16" height="16" viewBox="0 0 16 16"><text x="1" y="11" fontSize="10" fill="#3178c6" fontWeight="bold">TS</text></svg>;
const IconPHP = () => <svg width="16" height="16" viewBox="0 0 16 16"><text x="0" y="11" fontSize="9" fill="#777bb4" fontWeight="bold">PHP</text></svg>;
const IconSCSS = () => <svg width="16" height="16" viewBox="0 0 16 16"><text x="0" y="11" fontSize="8" fill="#c6538c" fontWeight="bold">#</text></svg>;
const IconJSON = () => <svg width="16" height="16" viewBox="0 0 16 16"><text x="0" y="11" fontSize="9" fill="#cbcb41" fontWeight="bold">{ }</text></svg>;
const IconGeneric = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M3 2h7l3 3v9H3V2z" strokeWidth="1.5" /></svg>;

const IconFolder = ({ open }: { open: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={open ? "#E0E0E0" : "#808080"}>
        <path d={open ? "M2 4l1.5-2h4L9 4H2zm-1 1h14v9H1V5z" : "M2 4l1.5-2h4L9 4H2zm-1 1h14v8H1V5z"} />
    </svg>
);

const FileIconSvg = ({ name }: { name: string }) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'ts' || ext === 'tsx') return <IconTS />;
    if (ext === 'php') return <IconPHP />;
    if (ext === 'scss' || ext === 'css') return <IconSCSS />;
    if (ext === 'json') return <IconJSON />;
    return <IconGeneric />;
}

const TreeNodeItem: React.FC<{
    node: TreeNode;
    depth: number;
    activeFile: GeneratedFile | null;
    activeSubTab: 'code' | 'scss';
    expandedPaths: Set<string>;
    toggleExpand: (path: string) => void;
    onSelect: (file: GeneratedFile, subType?: 'code' | 'scss') => void;
}> = ({ node, depth, activeFile, activeSubTab, expandedPaths, toggleExpand, onSelect }) => {
    const isExpanded = expandedPaths.has(node.path);

    // Precise highlighting check
    const isFile = node.type === 'file';
    const isActive = isFile &&
        node.fileData === activeFile &&
        (node.subType ? node.subType === activeSubTab : true);

    return (
        <div className="tree-node-wrapper">
            <div
                className={clsx('tree-node-row', { 'active': isActive })}
                style={{ paddingLeft: `${depth * 10 + 10}px` }}
                onClick={() => {
                    if (node.type === 'directory') {
                        toggleExpand(node.path);
                    } else {
                        onSelect(node.fileData!, node.subType);
                    }
                }}
            >
                <span className="tree-toggle-icon">
                    {node.type === 'directory' && (
                        isExpanded ? <ChevronDown /> : <ChevronRight />
                    )}
                </span>

                <span className="tree-icon">
                    {node.type === 'directory' ?
                        <IconFolder open={isExpanded} /> :
                        <FileIconSvg name={node.name} />
                    }
                </span>

                <span className="tree-label">{node.name}</span>
            </div>

            {node.type === 'directory' && isExpanded && node.children?.map(child => (
                <TreeNodeItem
                    key={child.path}
                    node={child}
                    depth={depth + 1}
                    activeFile={activeFile}
                    activeSubTab={activeSubTab}
                    expandedPaths={expandedPaths}
                    toggleExpand={toggleExpand}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, activeFile, activeSubTab, onSelect }) => {
    const tree = useMemo(() => buildFileTree(files), [files]);

    // Default expand commonly interesting folders
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
        const rootDirs = new Set<string>();
        // Expand root keys
        tree.forEach(n => {
            if (n.type === 'directory') rootDirs.add(n.path);
            // Maybe expand one level deeper?
            if (n.children) {
                n.children.forEach(c => {
                    if (c.type === 'directory') rootDirs.add(c.path);
                });
            }
        });
        return rootDirs;
    });

    const toggleExpand = (path: string) => {
        const next = new Set(expandedPaths);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        setExpandedPaths(next);
    };

    return (
        <div className="file-explorer-container">
            <div className="explorer-header">Explorer</div>
            <div className="explorer-content">
                {tree.map(node => (
                    <TreeNodeItem
                        key={node.path}
                        node={node}
                        depth={0}
                        activeFile={activeFile}
                        activeSubTab={activeSubTab}
                        expandedPaths={expandedPaths}
                        toggleExpand={toggleExpand}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
};
