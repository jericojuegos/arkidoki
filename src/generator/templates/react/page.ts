import type { PluginConfig, ModuleConfig } from '../../../types';
import { replacePlaceholders } from '../../utils';
import { CodeBuilder } from './builder';

export const buildPageTemplate = (config: PluginConfig, module: ModuleConfig): string => {
  const builder = new CodeBuilder();
  const hasPagination = config.reactOptions.pagination;
  const paginationStyle = config.reactOptions.paginationStyle || 'simple';
  const needsTotalItems = hasPagination && (paginationStyle === 'v2');

  // 1. Imports
  builder.addImport(`import { useState, useEffect, useCallback } from 'react';`);
  builder.addImport(`import { {{Module}}Table } from './{{Module}}Table';`);
  builder.addImport(`import { {{module}}Api } from './api';`);
  builder.addImport(`import type { {{Module}} } from './types';`);

  // 2. State
  builder.addState('{{module}}', '[]', `{{Module}}[]`, 'set{{Module}}');

  if (hasPagination) {
    builder.addState('currentPage', 1);
    builder.addState('totalPages', 1);
    if (needsTotalItems) {
      builder.addState('totalItems', 0);
    }
  }

  // 3. Fetch Logic
  if (hasPagination) {
    const totalItemsLogic = needsTotalItems ? `            setTotalItems(response.total || 0);` : '';

    builder.addMethod(`    // Fetch {{module}} function with page parameter
    const fetch{{Module}} = useCallback(async (page: number = 1) => {
        try {
            const response = await {{module}}Api.getAll({ page });
            set{{Module}}(response.data || []);
            setTotalPages(response.pages || 1);
${totalItemsLogic}
        } catch (error) {
            console.error('Error fetching {{module}}:', error);
        }
    }, []);`);

    builder.addEffect(`    // Fetch {{module}} when currentPage changes
    useEffect(() => {
        fetch{{Module}}(currentPage);
    }, [currentPage, fetch{{Module}}]);`);

    builder.addMethod(`    const onPageChange = (page: number) => {
        setCurrentPage(page);
    };`);

  } else {
    builder.addMethod(`    // Fetch all {{module}} (no pagination)
    const fetch{{Module}} = useCallback(async () => {
        try {
            const response = await {{module}}Api.getAll();
            set{{Module}}(response.data || []);
        } catch (error) {
            console.error('Error fetching {{module}}:', error);
        }
    }, []);`);

    builder.addEffect(`    // Fetch {{module}} once on mount
    useEffect(() => {
        fetch{{Module}}();
    }, [fetch{{Module}}]);`);
  }

  // 4. JSX
  const tableProps = hasPagination ? `
                {{module}}={{{module}}}
                currentPage={currentPage}
                totalPages={totalPages}
                ${needsTotalItems ? 'totalItems={totalItems}' : ''}
                onPageChange={onPageChange}` : `{{module}}={{{module}}}`;

  // Note: Pagination component is now rendered inside the Table component.
  builder.setJSX(`    return (
        <div className="{{PLUGIN_SLUG}}-{{module}}-page">
            {/* TODO: Add Search and Filter */}
            {/* TODO: Add Per Page Selector */}
            <{{Module}}Table ${tableProps.trim()} />
            {/* TODO: Add Details Modal */}
        </div>
    );`);

  const content = builder.build('{{Module}}Page');
  return replacePlaceholders(content, config, module);
};

