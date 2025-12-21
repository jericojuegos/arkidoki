import type { PluginConfig, ModuleConfig } from '../../../types';
import { replacePlaceholders } from '../../utils';
import { CodeBuilder } from './builder';

export const buildTableTemplate = (config: PluginConfig, module: ModuleConfig): string => {
    const builder = new CodeBuilder();
    const hasPagination = config.reactOptions.pagination;
    const paginationStyle = config.reactOptions.paginationStyle || 'simple';
    const needsTotalItems = hasPagination && (paginationStyle === 'v2');

    // 1. Imports
    builder.addImport(`import { CheckboxControl } from '@wordpress/components';`);
    builder.addImport(`import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';`);
    builder.addImport(`import type { {{Module}} } from './types';`);
    if (hasPagination) {
        builder.addImport(`import { {{Module}}Pagination } from './{{Module}}Pagination';`);
    }

    // 2. Props Interface
    const paginationProps = hasPagination ? `
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    ${needsTotalItems ? 'totalItems: number;' : ''}` : '';

    // 3. Component Definition
    const propsDestructuring = hasPagination ? `
    currentPage,
    totalPages,
    onPageChange,
    ${needsTotalItems ? 'totalItems,' : ''}` : '';

    // We build the body inside the component manually here for the table logic
    // because CodeBuilder is a bit simple for this complex component structure.
    // We will just return the full component string via build() but constructed carefully.

    // Actually, CodeBuilder.build() wraps content in a component. 
    // But REACT_TABLE is complex. Let's just use the builder for imports and simple setJSX?
    // OR we put the whole complex logic into setJSX or addMethod?
    // The previous pattern was: imports -> state -> methods -> effects -> jsx.
    // Here we have "columns" definition, "table" hook.

    // Let's use `addMethod` to define 'columns' and 'table' as they are inside the component.

    builder.addMethod(`    // Define columns
    const columns = [
        columnHelper.display({
            id: 'select',
            header: ({ table }) => (
                <CheckboxControl
                    checked={table.getIsAllRowsSelected()}
                    indeterminate={table.getIsSomeRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                    label=""
                />
            ),
            cell: ({ row }) => (
                <CheckboxControl
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                    label=""
                />
            ),
            size: 40,
        }),
        // {{TABLE_COLUMNS}}
    ];`);

    builder.addMethod(`    // Create table
    const table = useReactTable({
        data: {{module}},
        columns,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
    });`);

    // 4. JSX
    const paginationElement = hasPagination ? `
            <{{Module}}Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                ${needsTotalItems ? 'totalItems={totalItems}' : ''}
            />` : '';

    builder.setJSX(`    return (
        <div className="tgbl-table-container">
            <table className="tgbl-table">
                <thead className="tgbl-table__head">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="tgbl-table__row tgbl-table__row--head">
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="tgbl-table__cell tgbl-table__cell--head">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="tgbl-table__body">
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="tgbl-table__row tgbl-table__row--body">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="tgbl-table__cell tgbl-table__cell--body">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr className="tgbl-table__row tgbl-table__row--empty">
                            <td colSpan={columns.length} className="tgbl-table__cell tgbl-table__cell--body">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            ${paginationElement}
        </div>
    );`);

    // Custom build because we need to inject props into the main function signature
    // The standard builder.build() expects no props: `const Component = () => {`.
    // usage: const {{Module}}Table = ({ {{module}}, ... }) => {

    const importsList = Array.from((builder as any).imports).join('\n');
    const methodsList = (builder as any).methods.join('\n\n');
    const jsx = (builder as any).jsx;

    const content = `
${importsList}

interface {{Module}}TableProps {
    {{module}}: {{Module}}[];${paginationProps}
}

const columnHelper = createColumnHelper<{{Module}}>();

export const {{Module}}Table = ({
    {{module}},${propsDestructuring}
}: {{Module}}TableProps) => {

${methodsList}

${jsx}
};
`.trim();

    return replacePlaceholders(content, config, module);
};
