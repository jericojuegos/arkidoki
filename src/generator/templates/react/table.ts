import type { PluginConfig, ModuleConfig } from '../../../types';
import { replacePlaceholders } from '../../utils';
import { CodeBuilder } from './builder';

export const buildTableTemplate = (config: PluginConfig, module: ModuleConfig): string => {
    const builder = new CodeBuilder();
    const hasPagination = config.reactOptions.pagination;
    const paginationStyle = config.reactOptions.paginationStyle || 'simple';
    const needsTotalItems = hasPagination && (paginationStyle === 'v2');

    // 1. Imports
    builder.addImport(`import { useMemo } from 'react';`);
    builder.addImport(`import { CheckboxControl } from '@wordpress/components';`);
    builder.addImport(`import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    ColumnDef,
} from '@tanstack/react-table';`);
    builder.addImport(`import type { {{Module}} } from './types';`);
    if (hasPagination) {
        builder.addImport(`import { Pagination } from '../components/Pagination';`);
    }

    // 2. Column Generation logic moved inside the template to use useMemo
    const columnDefinitions = module.columns.map(col => {
        let cellContent = '';
        if (col.type === 'date') {
            cellContent = `\n      cell: (info) => new Date(info.getValue()).toLocaleString(),`;
        } else if (col.type === 'status') {
            cellContent = `
      cell: (info) => {
        const status = info.getValue() || '';
        return (
          <span className={\`{{PLUGIN_SLUG}}-status {{PLUGIN_SLUG}}-status--\${status}\`}>
            {status.replace('_', ' ').toUpperCase()}
          </span>
        );
      },`;
        } else if (col.accessorKey === 'source_data' || col.accessorKey === 'destination_data') {
            cellContent = `\n      cell: (info) => <div>{info.getValue()}</div>,`;
        }

        return `    columnHelper.accessor('${col.accessorKey}', {
      header: '${col.header}',${cellContent}
      size: ${col.width || 150},
    }),`;
    }).join('\n');

    const columnSelection = `    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <CheckboxControl
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={(isChecked) => table.toggleAllRowsSelected(!!isChecked)}
          label=""
        />
      ),
      cell: ({ row }) => (
        <CheckboxControl
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={(isChecked) => row.toggleSelected(!!isChecked)}
          label=""
        />
      ),
      size: 40,
    }),`;

    // 3. Props
    const paginationProps = hasPagination ? `
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    ${needsTotalItems ? 'totalItems: number;' : ''}` : '';

    const propsDestructuring = hasPagination ? `
    currentPage,
    totalPages,
    onPageChange,
    ${needsTotalItems ? 'totalItems,' : ''}` : '';

    // 4. Methods / Logic
    builder.addMethod(`  // Define columns
  const columns = useMemo<ColumnDef<{{Module}}, any>[]>(() => [
${columnSelection}
${columnDefinitions}
  ], []);

  // Create table
  const table = useReactTable({
    data: {{module}},
    columns,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
  });`);

    // 5. JSX
    const tableOptions = config.reactOptions.tableOptions || { responsive: true, styleModifiers: [] };
    const modifiers = (tableOptions.styleModifiers || []).map(m => ` {{PLUGIN_SLUG}}-table--${m}`).join('');
    const tableClass = `{{PLUGIN_SLUG}}-table${modifiers}`;

    const paginationElement = hasPagination ? `
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        ${needsTotalItems ? 'totalItems={totalItems}' : ''}
      />` : '';

    builder.setJSX(`return (
    <>
      <div className="{{PLUGIN_SLUG}}-table-container">
        <table className="${tableClass}">
          <thead className="{{PLUGIN_SLUG}}-table__head">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="{{PLUGIN_SLUG}}-table__row">
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="{{PLUGIN_SLUG}}-table__cell">
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
          <tbody className={\`{{PLUGIN_SLUG}}-table__body \${refreshing ? '{{PLUGIN_SLUG}}-table__body--refreshing' : ''}\`}>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="{{PLUGIN_SLUG}}-table__row">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="{{PLUGIN_SLUG}}-table__cell">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="{{PLUGIN_SLUG}}-table__row {{PLUGIN_SLUG}}-table__row--empty">
                <td colSpan={columns.length} className="{{PLUGIN_SLUG}}-table__cell {{PLUGIN_SLUG}}-table__cell--empty">
                  <div className="{{PLUGIN_SLUG}}-empty-state">
                    No data available
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      ${paginationElement}
    </>
  );`);

    const importsList = Array.from((builder as any).imports).join('\n');
    const methodsList = (builder as any).methods.join('\n\n');
    const jsx = (builder as any).jsx;

    const content = `
${importsList}

interface {{Module}}TableProps {
    {{module}}: {{Module}}[];
    refreshing: boolean;${paginationProps}
}

const columnHelper = createColumnHelper<{{Module}}>();

export const {{Module}}Table = ({
    {{module}},
    refreshing,${propsDestructuring}
}: {{Module}}TableProps) => {

${methodsList}

${jsx}
};
`.trim();

    return replacePlaceholders(content, config, module);
};

