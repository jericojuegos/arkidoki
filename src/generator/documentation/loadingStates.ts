import type { FeatureDocumentation } from '../../types/documentation';

export const loadingStatesDocs: FeatureDocumentation = {
    id: 'loading-states',
    name: 'Loading States',
    category: 'loading-states',
    description: 'Provide visual feedback during data fetching with skeleton loaders, spinners, and refresh overlays. Improve user experience by showing loading indicators and customizable empty states.',
    affectedFiles: [
        {
            path: '{{Module}}Page.tsx',
            relativePath: 'components/{{Module}}Page.tsx',
            status: 'modified',
            changes: [
                {
                    type: 'added',
                    startLine: 18,
                    endLine: 18,
                    label: 'Loading State',
                    description: 'Track loading status during data fetching',
                    code: `const [isLoading, setIsLoading] = useState(false);`
                },
                {
                    type: 'modified',
                    startLine: 33,
                    endLine: 45,
                    label: 'Fetch with Loading',
                    description: 'Wrap API calls with loading state management',
                    code: `const fetch{{Module}} = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
        const response = await {{module}}Api.getAll({ page });
        set{{Module}}(response.data || []);
        setTotalPages(response.pages || 1);
    } catch (error) {
        console.error('Error fetching {{module}}:', error);
    } finally {
        setIsLoading(false);
    }
}, []);`
                },
                {
                    type: 'modified',
                    startLine: 75,
                    endLine: 76,
                    label: 'Pass Loading Prop',
                    description: 'Pass loading state to Table component',
                    code: `<{{Module}}Table
    {{module}}={{{module}}}
    isLoading={isLoading}
    ...
/>`
                }
            ]
        },
        {
            path: '{{Module}}Table.tsx',
            relativePath: 'components/{{Module}}Table.tsx',
            status: 'modified',
            changes: [
                {
                    type: 'added',
                    startLine: 47,
                    endLine: 73,
                    label: 'Skeleton Loading',
                    description: 'Show skeleton rows when initially loading data',
                    code: `if (isLoading && {{module}}.length === 0) {
    return (
        <div className="{{slug}}-table-container">
            <table className="{{slug}}-table">
                <thead className="{{slug}}-table__head">
                    <tr className="{{slug}}-table__row">
                        {columns.map((col, i) => (
                            <th key={i} className="{{slug}}-table__cell">
                                <div className="skeleton-box"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="{{slug}}-table__body">
                    {[...Array(5)].map((_, i) => (
                        <tr key={i} className="{{slug}}-table__row">
                            {columns.map((col, j) => (
                                <td key={j} className="{{slug}}-table__cell">
                                    <div className="skeleton-box"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}`
                },
                {
                    type: 'added',
                    startLine: 99,
                    endLine: 103,
                    label: 'Refresh Overlay',
                    description: 'Show subtle overlay when refreshing existing data',
                    code: `{isLoading && {{module}}.length > 0 && (
    <div className="loading-overlay">
        <div className="spinner-small"></div>
    </div>
)}`
                },
                {
                    type: 'modified',
                    startLine: 130,
                    endLine: 132,
                    label: 'Empty State',
                    description: 'Customizable message when no data is available',
                    code: `<td colSpan={columns.length} className="{{slug}}-table__cell">
    No data available
</td>`
                }
            ]
        }
    ],
    steps: [
        'Add `isLoading` state variable in the Page component',
        'Set `isLoading` to `true` before API calls and `false` in the `finally` block',
        'Pass `isLoading` prop to the Table component',
        'In the Table, check if `isLoading && data.length === 0` for initial loading',
        'Render skeleton rows (5 placeholder rows with animated boxes) during initial load',
        'For refresh overlay, check if `isLoading && data.length > 0`',
        'Show a semi-transparent overlay with spinner over existing data',
        'Customize the empty state message based on configuration'
    ],
    dependencies: []
};
