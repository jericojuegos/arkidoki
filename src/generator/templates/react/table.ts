export const REACT_TABLE = `import { CheckboxControl } from '@wordpress/components';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import type { {{Module}} } from './types';


interface {{Module}}TableProps {
    {{module}}: {{Module}}[];
}

const columnHelper = createColumnHelper<{{Module}}>();

export const {{Module}}Table = ({
    {{module}},
}: {{Module}}TableProps) => {

    // Define columns
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
    ];

    // Create table
    const table = useReactTable({
        data: {{module}},
        columns,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
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
        </div>
    );
};
`;
