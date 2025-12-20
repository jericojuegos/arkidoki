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
