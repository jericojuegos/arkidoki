import type { FeatureDocumentation } from '../../types/documentation';

export const tableOptionsDocs: FeatureDocumentation = {
    id: 'table-options',
    name: 'Table Styling Options',
    category: 'table-options',
    description: 'Customize the appearance of your table with predefined style modifiers like striped rows, borders, compact spacing, and dark theme. These styles are applied using BEM modifier classes.',
    affectedFiles: [
        {
            path: '{{Module}}Table.tsx',
            relativePath: 'components/{{Module}}Table.tsx',
            status: 'modified',
            changes: [
                {
                    type: 'modified',
                    startLine: 92,
                    endLine: 95,
                    label: 'Table Class Name',
                    description: 'Apply modifier classes based on selected options',
                    code: `const tableOptions = config.reactOptions.tableOptions;
const modifiers = (tableOptions.styleModifiers || [])
    .map(m => \` {{slug}}-table--\${m}\`).join('');
const tableClass = \`{{slug}}-table\${modifiers}\`;

<table className={tableClass}>`
                }
            ]
        },
        {
            path: '{{Module}}Table.scss',
            relativePath: 'components/{{Module}}Table.scss',
            status: 'modified',
            changes: [
                {
                    type: 'added',
                    startLine: 45,
                    endLine: 50,
                    label: 'Striped Modifier',
                    description: 'Alternating row background colors for better readability',
                    code: `&--striped {
    .{{slug}}-table__row--body:nth-child(even) {
        background-color: #f9fafb;
    }
}`
                },
                {
                    type: 'added',
                    startLine: 52,
                    endLine: 56,
                    label: 'Bordered Modifier',
                    description: 'Add borders to all cells',
                    code: `&--bordered {
    .{{slug}}-table__cell {
        border: 1px solid #e5e7eb;
    }
}`
                },
                {
                    type: 'added',
                    startLine: 58,
                    endLine: 62,
                    label: 'Compact Modifier',
                    description: 'Reduce padding for denser information display',
                    code: `&--compact {
    .{{slug}}-table__cell {
        padding: 0.5rem;
    }
}`
                },
                {
                    type: 'added',
                    startLine: 64,
                    endLine: 71,
                    label: 'Dark Modifier',
                    description: 'Dark theme styling',
                    code: `&--dark {
    background-color: #1f2937;
    color: #f9fafb;
    
    .{{slug}}-table__row--body:hover {
        background-color: #374151;
    }
}`
                }
            ]
        }
    ],
    steps: [
        'Select desired style modifiers (Striped, Bordered, Compact, Dark) in the UI',
        'The generator reads `config.reactOptions.tableOptions.styleModifiers` array',
        'Each selected modifier is converted to a BEM class (e.g., `--striped`)',
        'The classes are applied to the `<table>` element',
        'Corresponding SCSS rules are generated in the table stylesheet',
        'Multiple modifiers can be combined (e.g., striped + bordered)'
    ],
    dependencies: []
};
