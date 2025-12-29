export const USE_QUERY_HOOK = `import { useQuery } from '@tanstack/react-query';
import { {{module}}Api } from './api';
import type { {{Module}}Filters } from './{{Module}}Filters';
import type { SortingState } from '@tanstack/react-table';

interface Use{{Module}}QueryParams {
    page: number;
    perPage: number;
    filters: {{Module}}Filters;
    searchQuery: string;
    sorting: SortingState;
}

export const use{{Module}}Query = (params: Use{{Module}}QueryParams) => {
    const { page, perPage, filters, searchQuery, sorting } = params;

    return useQuery({
        queryKey: ['{{module}}', page, perPage, filters, searchQuery, sorting],
        queryFn: async () => {
            const apiParams: Record<string, string | number> = {
                page,
                per_page: perPage,
            };

            if (searchQuery) apiParams.search = searchQuery;
            
            // Map filters to API params
            Object.keys(filters).forEach(key => {
                 const value = filters[key as keyof {{Module}}Filters];
                 if (value) {
                     apiParams[key] = value;
                 }
            });

            // Add sorting parameters
            if (sorting.length > 0) {
                apiParams.orderby = sorting[0].id;
                apiParams.order = sorting[0].desc ? 'DESC' : 'ASC';
            }

            return await {{module}}Api.getAll(apiParams);
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching
    });
};
`;
