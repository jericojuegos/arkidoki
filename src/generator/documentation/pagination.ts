import type { FeatureDocumentation } from '../../types/documentation';

export const paginationDocs: FeatureDocumentation = {
    id: 'pagination',
    name: 'Pagination',
    category: 'react-options',
    description: 'Adds pagination controls to your table, allowing users to navigate through large datasets page by page. The page component manages the current page state and fetches data accordingly.',
    affectedFiles: [
        {
            path: '{{Module}}Page.tsx',
            relativePath: 'components/{{Module}}Page.tsx',
            status: 'modified',
            changes: [
                {
                    type: 'added',
                    startLine: 20,
                    endLine: 22,
                    label: 'State Variables',
                    description: 'Track current page and total pages returned from API',
                    code: `const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);`
                },
                {
                    type: 'modified',
                    startLine: 33,
                    endLine: 42,
                    label: 'Fetch Function',
                    description: 'Updated to accept page parameter and update pagination state',
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
                    type: 'added',
                    startLine: 49,
                    endLine: 51,
                    label: 'Page Change Handler',
                    description: 'Callback to update current page when user navigates',
                    code: `const onPageChange = (page: number) => {
    setCurrentPage(page);
};`
                },
                {
                    type: 'modified',
                    startLine: 72,
                    endLine: 77,
                    label: 'Table Props',
                    description: 'Pass pagination props to Table component',
                    code: `<{{Module}}Table
    {{module}}={{{module}}}
    isLoading={isLoading}
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={onPageChange}
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
                    startLine: 1,
                    endLine: 1,
                    label: 'Import',
                    description: 'Import Pagination component',
                    code: `import { Pagination } from '../components/Pagination';`
                },
                {
                    type: 'added',
                    startLine: 12,
                    endLine: 16,
                    label: 'Props Interface',
                    description: 'Accept pagination props in table interface',
                    code: `interface {{Module}}TableProps {
    {{module}}: {{Module}}[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}`
                },
                {
                    type: 'added',
                    startLine: 137,
                    endLine: 142,
                    label: 'Pagination Component',
                    description: 'Render pagination controls below the table',
                    code: `<Pagination 
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={onPageChange}
/>`
                }
            ]
        },
        {
            path: 'Pagination.tsx',
            relativePath: 'components/Pagination.tsx',
            status: 'new',
            changes: [
                {
                    type: 'added',
                    startLine: 1,
                    endLine: 30,
                    label: 'Full Component',
                    description: 'New reusable Pagination component with Previous/Next buttons',
                    code: `interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    return (
        <div className="pagination">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </div>
    );
};`
                }
            ]
        }
    ],
    steps: [
        'Add state variables for `currentPage` and `totalPages` in the Page component',
        'Update the fetch function to accept a `page` parameter and call the API with it',
        'Create an `onPageChange` handler that updates the `currentPage` state',
        'Pass `currentPage`, `totalPages`, and `onPageChange` as props to the Table component',
        'Import and render the `<Pagination>` component inside the Table, below the table element',
        'The Pagination component handles Previous/Next button clicks and displays current page info'
    ],
    dependencies: []
};
