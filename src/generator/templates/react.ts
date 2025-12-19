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

export const REACT_TABLE = `import { __ } from '@wordpress/i18n';

export const {{Module}}Table = ({ data, isLoading, onViewDetails }) => {
  if (isLoading) {
    return <div>{__('Loading...', '{{PLUGIN_SLUG}}')}</div>;
  }

  return (
    <table className="wp-list-table widefat fixed striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{item.name}</td>
            <td>
              <button 
                className="button button-secondary"
                onClick={() => onViewDetails(item)}
              >
                {__('View', '{{PLUGIN_SLUG}}')}
              </button>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={3}>{__('No items found.', '{{PLUGIN_SLUG}}')}</td>
          </tr>
        )}
      </tbody>
    </table>
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
