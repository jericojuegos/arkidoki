export interface CodeChange {
    type: 'added' | 'modified' | 'removed';
    startLine: number;
    endLine: number;
    code: string;
    description?: string;
    label?: string; // e.g., "State Variables", "Props Interface"
}

export interface AffectedFile {
    path: string;
    relativePath: string; // e.g., "components/LogsPage.tsx"
    status: 'new' | 'modified';
    changes: CodeChange[];
    fullCode?: string; // Optional: full file content
}

export interface FeatureDocumentation {
    id: string; // e.g., 'pagination', 'filters'
    name: string; // Display name
    category: 'react-options' | 'table-options' | 'loading-states';
    description: string; // Brief overview
    affectedFiles: AffectedFile[];
    steps?: string[]; // Step-by-step guide
    dependencies?: string[]; // Other features this depends on
}
