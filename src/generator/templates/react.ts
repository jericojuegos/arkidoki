export const REACT_ENTRY_INDEX = `import { createRoot, createElement } from '@wordpress/element';
import { {{Module}}Page } from './{{Module}}Page';

const container = document.getElementById('{{PLUGIN_SLUG}}-{{module}}-root');

if (container) {
  createRoot(container).render(createElement({{Module}}Page));
}
`;

export const REACT_PAGE = `import { useState, useEffect } from 'react';
import { {{Module}}Table } from './{{Module}}Table';
import { {{Module}}Pagination } from './{{Module}}Pagination';
import { {{module}}Api } from './api';
import type { {{Module}} } from './types';

export const {{Module}}Page = () => {
  const [{{module}}, set{{Module}}] = useState<{{Module}}[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
      const fetch{{Module}} = async () => {
          try {
              const response = await {{module}}Api.getAll({ page: currentPage });
              set{{Module}}(response.data);
              // Assuming response includes meta for pagination
              if (response.meta) {
                  setTotalPages(response.meta.last_page);
                  setTotalItems(response.meta.total);
              }
          } catch (error) {
              console.error('Error fetching {{module}}:', error);
          }
      };

      fetch{{Module}}();
  }, [currentPage]);

  return (
    <div className="{{PLUGIN_SLUG}}-{{module}}-page">
      <{{Module}}Table {{module}}={{{module}}} />
      <{{Module}}Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
      />
    </div>
  );
};
`;

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

export const REACT_FILTERS = `import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const {{Module}}Filters = () => {
  return (
    <div className="{{PLUGIN_SLUG}}-filters">
      {/* Add filter controls here */}
      <Button variant="secondary">
        {__('Filter', '{{PLUGIN_SLUG}}')}
      </Button>
    </div>
  );
};
`;

export const PAGINATION_TEMPLATES = {
  simple: `import { Button } from "@wordpress/components";
import type { ComponentProps } from "react";

type WPButtonProps = ComponentProps<typeof Button>;

export interface {{Module}}PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const NavButton = (props: WPButtonProps) => (
    <Button size="small" variant="secondary" {...props} />
);

export const {{Module}}Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
}: {{Module}}PaginationProps) => {
    if (totalPages <= 1) return null;

    const goTo = (page: number) => {
        if (page < 1 || page > totalPages) return;
        onPageChange(page);
    };

    return (
        <nav className="{{PLUGIN_SLUG}}-pagination" aria-label="Pagination">
            <div className="pagination-controls">
                <NavButton onClick={() => goTo(1)} disabled={currentPage === 1} className="tf-context-wp">
                    First
                </NavButton>

                <NavButton onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </NavButton>

                <span className="page-numbers">
                    Page {currentPage} of {totalPages}
                </span>

                <NavButton
                    onClick={() => goTo(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </NavButton>

                <NavButton
                    onClick={() => goTo(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    Last
                </NavButton>
            </div>
        </nav>
    );
};
`,
  v2: `import React, { useState, useEffect } from 'react';

interface {{Module}}PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
}

export const {{Module}}Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
}: {{Module}}PaginationProps) => {
    const [inputPage, setInputPage] = useState(currentPage.toString());

    // Update input when currentPage changes externally
    useEffect(() => {
        setInputPage(currentPage.toString());
    }, [currentPage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputPage(e.target.value);
    };

    const handleInputBlur = () => {
        let page = parseInt(inputPage, 10);
        if (isNaN(page)) {
            page = currentPage;
        } else {
            if (page < 1) page = 1;
            if (page > totalPages) page = totalPages;
        }
        setInputPage(page.toString());
        if (page !== currentPage) {
            onPageChange(page);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        }
    };

    return (
        <div className="tss-pagination-v2">
            <span className="tss-pagination-v2__count">{totalItems} items</span>

            <div className="tss-pagination-v2__controls">
                <button
                    type="button"
                    className="tss-pagination-v2__button"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    aria-label="First Page"
                >
                    <span className="tss-pagination-v2__button-text">«</span>
                </button>

                <button
                    type="button"
                    className="tss-pagination-v2__button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous Page"
                >
                    <span className="tss-pagination-v2__button-text">‹</span>
                </button>

                <input
                    type="text"
                    className="tss-pagination-v2__button tss-pagination-v2__button--input"
                    value={inputPage}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    aria-label="Current Page"
                />

                <span className="tss-pagination-v2__count">of {totalPages}</span>

                <button
                    type="button"
                    className="tss-pagination-v2__button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next Page"
                >
                    <span className="tss-pagination-v2__button-text">›</span>
                </button>

                <button
                    type="button"
                    className="tss-pagination-v2__button"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Last Page"
                >
                    <span className="tss-pagination-v2__button-text">»</span>
                </button>
            </div>
        </div>
    );
};
`
};

export const REACT_DETAILS_MODAL = `import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const {{Module}}DetailsModal = ({ item, onClose }) => {
  return (
    <Modal title={__('{{Module}} Details', '{{PLUGIN_SLUG}}')} onRequestClose={onClose}>
      <pre>{JSON.stringify(item, null, 2)}</pre>
    </Modal>
  );
};
`;
