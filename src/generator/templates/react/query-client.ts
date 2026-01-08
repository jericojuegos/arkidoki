export const QUERY_CLIENT = `import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000, // 30 seconds - data is fresh for 30s
            gcTime: 5 * 60 * 1000, // 5 minutes - cache garbage collection time
            retry: 1, // Retry failed requests once
            refetchOnWindowFocus: true, // Refetch when window regains focus (for multi-tab sync)
        },
    },
});
`;
