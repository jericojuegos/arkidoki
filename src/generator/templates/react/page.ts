import type { PluginConfig, ModuleConfig } from '../../../types';
import { replacePlaceholders } from '../../utils';
import { CodeBuilder } from './builder';

export const buildPageTemplate = (config: PluginConfig, module: ModuleConfig): string => {
    const builder = new CodeBuilder();
    const hasPagination = config.reactOptions.pagination;
    const paginationStyle = config.reactOptions.paginationStyle || 'simple';
    const needsTotalItems = hasPagination && (paginationStyle === 'v2');
    const useReactQuery = config.reactOptions.dataFetching === 'react-query';

    // 1. Imports
    if (useReactQuery) {
        builder.addImport(`import { useState } from 'react';`);
        builder.addImport(`import { useQueryClient } from '@tanstack/react-query';`);
        builder.addImport(`import { use{{Module}}Query } from './use{{Module}}Query';`);
        builder.addImport(`import { {{module}}Api } from './api';`); // For mutations
    } else {
        builder.addImport(`import { useState, useEffect, useCallback } from 'react';`);
        builder.addImport(`import { {{module}}Api } from './api';`);
    }

    builder.addImport(`import { {{Module}}Table } from './{{Module}}Table';`);
    builder.addImport(`import type { {{Module}} } from './types';`);

    // 2. State & Hooks
    if (useReactQuery) {
        builder.addMethod(`    const queryClient = useQueryClient();`);

        builder.addState('searchQuery', `''`);
        builder.addState('sorting', `[{ id: 'id', desc: true }]`);
        builder.addState('filters', `{}`);

        if (hasPagination) {
            builder.addState('currentPage', 1);
            builder.addState('itemsPerPage', 10);
        }

        const pageParam = hasPagination ? 'currentPage' : '1';
        const perPageParam = hasPagination ? 'itemsPerPage' : '-1'; // -1 usually implies all in WP APIs or handling it gracefully

        builder.addMethod(`
    // Fetch {{module}} using React Query
    const { data, isLoading, isFetching } = use{{Module}}Query({
        page: ${pageParam},
        perPage: ${perPageParam},
        filters,
        searchQuery,
        sorting,
    });

    const {{module}} = data?.data || [];
    const totalPages = data?.pages || 1;
    ${needsTotalItems ? 'const totalItems = data?.total || 0;' : ''}
    `);

        if (hasPagination) {
            builder.addMethod(`    const onPageChange = (page: number) => setCurrentPage(page);`);
        }

    } else {
        // Standard Fetch Logic
        builder.addState('{{module}}', '[]', `{{Module}}[]`, 'set{{Module}}');
        builder.addState('isLoading', 'false', 'boolean');

        if (hasPagination) {
            builder.addState('currentPage', 1);
            builder.addState('totalPages', 1);
            if (needsTotalItems) {
                builder.addState('totalItems', 0);
            }
        }

        // Fetch Implementation
        if (hasPagination) {
            const totalItemsLogic = needsTotalItems ? `            setTotalItems(response.total || 0);` : '';
            builder.addMethod(`    const fetch{{Module}} = useCallback(async (page: number = 1) => {
            setIsLoading(true);
            try {
                const response = await {{module}}Api.getAll({ page });
                set{{Module}}(response.data || []);
                setTotalPages(response.pages || 1);
                ${totalItemsLogic}
            } catch (error) {
                console.error('Error fetching {{module}}:', error);
            } finally {
                setIsLoading(false);
            }
        }, []);`);

            builder.addEffect(`    useEffect(() => {
            fetch{{Module}}(currentPage);
        }, [currentPage, fetch{{Module}}]);`);

            builder.addMethod(`    const onPageChange = (page: number) => setCurrentPage(page);`);
        } else {
            builder.addMethod(`    const fetch{{Module}} = useCallback(async () => {
            setIsLoading(true);
            try {
                const response = await {{module}}Api.getAll();
                set{{Module}}(response.data || []);
            } catch (error) {
                console.error('Error fetching {{module}}:', error);
            } finally {
                setIsLoading(false);
            }
        }, []);`);

            builder.addEffect(`    useEffect(() => {
            fetch{{Module}}();
        }, [fetch{{Module}}]);`);
        }
    }

    // 4. JSX
    let tableProps = '';

    if (useReactQuery) {
        if (hasPagination) {
            tableProps = `
                {{module}}={{{module}}}
                isLoading={isLoading || isFetching}
                currentPage={currentPage}
                totalPages={totalPages}
                ${needsTotalItems ? 'totalItems={totalItems}' : ''}
                onPageChange={onPageChange}`;
        } else {
            tableProps = `
                {{module}}={{{module}}}
                isLoading={isLoading || isFetching}`;
        }
    } else {
        tableProps = hasPagination ? `
                {{module}}={{{module}}}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                ${needsTotalItems ? 'totalItems={totalItems}' : ''}
                onPageChange={onPageChange}` : `{{module}}={{{module}}} isLoading={isLoading}`;
    }

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

