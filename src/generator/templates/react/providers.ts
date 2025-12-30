export const APP_PROVIDERS = `import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../queryClient';

// Add global styles or other providers here
// import '../styles/main.scss';

interface ProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: ProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export const renderWithProviders = (ui: ReactNode) => {
  return <AppProviders>{ui}</AppProviders>;
};
`;
