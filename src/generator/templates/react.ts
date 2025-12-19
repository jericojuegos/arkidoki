export const REACT_ENTRY_INDEX = `import { createRoot, createElement } from '@wordpress/element';
import { {{Module}}Page } from './{{Module}}Page';

const container = document.getElementById('{{PLUGIN_SLUG}}-{{module}}-root');

if (container) {
  createRoot(container).render(createElement({{Module}}Page));
}
`;

export const REACT_PAGE = `import { useState, useEffect } from '@wordpress/element';
import { {{Module}}Table } from './{{Module}}Table';
import { {{Module}}Filters } from './{{Module}}Filters';
import { {{Module}}Pagination } from './{{Module}}Pagination';
import { {{Module}}DetailsModal } from './{{Module}}DetailsModal';

export const {{Module}}Page = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    // Fetch data here
    setLoading(false);
  }, []);

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  return (
    <div className="{{PLUGIN_SLUG}}-{{module}}-page">
      <h1>{{Module}} Management</h1>
      <{{Module}}Filters />
      <{{Module}}Table data={data} isLoading={loading} onViewDetails={handleViewDetails} />
      <{{Module}}Pagination />
      {showModal && (
        <{{Module}}DetailsModal 
          item={selectedItem} 
          onClose={() => setShowModal(false)} 
        />
      )}
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

export interface {{Module}}Data {
  [key: string]: any;
}

const columnHelper = createColumnHelper<{{Module}}Data>();

export const {{Module}}Table = ({ data }) => {

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
        data,
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

export const REACT_PAGINATION = `import { Button } from '@wordpress/components';

export const {{Module}}Pagination = () => {
  return (
    <div className="{{PLUGIN_SLUG}}-pagination">
      <Button disabled>Previous</Button>
      <span> Page 1 of 10 </span>
      <Button>Next</Button>
    </div>
  );
};
`;

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
