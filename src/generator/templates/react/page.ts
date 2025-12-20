export const REACT_PAGE = `import { useState, useEffect, useCallback } from 'react';
import { {{Module}}Table } from './{{Module}}Table';
import { {{module}}Api } from './api';
import type { {{Module}} } from './types';

export const {{Module}}Page = () => {
  const [{{module}}, set{{Module}}] = useState<{{Module}}[]>([]);

  // Fetch all logs (no pagination)
    const fetch{{Module}} = useCallback(async () => {
        try {
            const response = await {{module}}Api.getAll();
            set{{Module}}(response.data || []);
        } catch (error) {
            console.error('Error fetching {{module}}:', error);
        }
    }, []);

    // Fetch logs once on mount
    useEffect(() => {
        fetch{{Module}}();
    }, [fetch{{Module}}]);

  return (
        <div className="{{PLUGIN_SLUG}}-{{module}}-page">
            {/* TODO: Add Search and Filter */}
            {/* TODO: Add Per Page Selector */}
            <{{Module}}Table {{module}}={{{module}}} />
            {/* TODO: Add Details Modal */}
        </div>
    );
};
`;