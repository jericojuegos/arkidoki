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
} from '@tanstack/react-table';`);
    builder.addImport(`import type { {{Module}} } from './types';`);
    if (hasPagination) {
        builder.addImport(`import { Pagination } from '../components/Pagination';`);
    }

    // 2. Props Interface
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

    // Loading & Empty Config
    const loadingOptions = config.reactOptions.loadingOptions || { initial: 'none', refreshOverlay: false, buttonLoading: false, emptyState: 'simple' };
    const { initial, refreshOverlay, emptyState } = loadingOptions;

    // 4. JSX
    const paginationElement = hasPagination ? `
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                ${needsTotalItems ? 'totalItems={totalItems}' : ''}
            />` : '';

    const tableOptions = config.reactOptions.tableOptions || { responsive: true, styleModifiers: [] };
    const modifiers = (tableOptions.styleModifiers || []).map(m => ` {{PLUGIN_SLUG}}-table--${m}`).join('');
    const tableClass = `{{PLUGIN_SLUG}}-table${modifiers}`; // Restored

    // Build Loading UI

    // Build Loading UI
    let loadingLogic = '';

    // Initial Loading (Skeleton / Spinner)
    if (initial === 'skeleton') {
        loadingLogic = `
        if (isLoading && {{module}}.length === 0) {
            return (
                 <div className="{{PLUGIN_SLUG}}-table-container">
                    <table className="${tableClass}">
                        <thead className="{{PLUGIN_SLUG}}-table__head">
                            <tr className="{{PLUGIN_SLUG}}-table__row {{PLUGIN_SLUG}}-table__row--head">
                                {columns.map((col, i) => (
                                    <th key={i} className="{{PLUGIN_SLUG}}-table__cell {{PLUGIN_SLUG}}-table__cell--head">
                                        <div className="skeleton-box" style={{ width: '80px', height: '16px' }}></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="{{PLUGIN_SLUG}}-table__body">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="{{PLUGIN_SLUG}}-table__row {{PLUGIN_SLUG}}-table__row--body">
                                    {columns.map((col, j) => (
                                        <td key={j} className="{{PLUGIN_SLUG}}-table__cell {{PLUGIN_SLUG}}-table__cell--body">
                                            <div className="skeleton-box" style={{ width: '100%', height: '16px' }}></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            );
        }`;
    } else if (initial === 'spinner') {
        loadingLogic = `
        if (isLoading && {{module}}.length === 0) {
           return <div className="loading-spinner">Loading...</div>; 
        }`;
    }

    // Refresh Overlay
    const overlayElement = refreshOverlay ? `
            {isLoading && {{module}}.length > 0 && (
                <div className="loading-overlay">
                    <div className="spinner-small"></div>
                </div>
            )}` : '';

    // Empty State
    const emptyStateContent = emptyState === 'illustration'
        ? `<div className="empty-state-illustration">Requires illustration asset</div><div>No {{module}} found</div>`
        : `No data available`;

    builder.setJSX(`${loadingLogic}

    return (
        <div className="{{PLUGIN_SLUG}}-table-container" style={{ position: 'relative' }}>
            ${overlayElement}
            <table className="${tableClass}">
                <thead className="{{PLUGIN_SLUG}}-table__head">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="{{PLUGIN_SLUG}}-table__row {{PLUGIN_SLUG}}-table__row--head">
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="{{PLUGIN_SLUG}}-table__cell {{PLUGIN_SLUG}}-table__cell--head">
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
                <tbody className="{{PLUGIN_SLUG}}-table__body">
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="{{PLUGIN_SLUG}}-table__row {{PLUGIN_SLUG}}-table__row--body">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="{{PLUGIN_SLUG}}-table__cell {{PLUGIN_SLUG}}-table__cell--body">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr className="{{PLUGIN_SLUG}}-table__row {{PLUGIN_SLUG}}-table__row--empty">
                            <td colSpan={columns.length} className="{{PLUGIN_SLUG}}-table__cell {{PLUGIN_SLUG}}-table__cell--body">
                                ${emptyStateContent}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
            ${paginationElement}
        </div>
    );`);

    // ... (rest of the file construction)

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
