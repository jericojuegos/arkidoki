import type { PluginConfig, ModuleConfig } from '../../../types';
import { replacePlaceholders } from '../../utils';

export const buildReactEntryTemplate = (config: PluginConfig, module: ModuleConfig): string => {
  let imports = '';
  let renderLogic = '';

  // Config Flags
  const isWp = config.runtime.react === 'wp';
  const useCreateElement = config.runtime.outputStyle === 'createElement';
  const useReactQuery = config.reactOptions.dataFetching === 'react-query';
  const isHybrid = config.architecture === 'hybrid';

  // 1. Build Imports
  if (isWp) {
    imports += `import { createRoot, createElement } from '@wordpress/element';\n`;
  } else {
    imports += `import React from 'react';
import { createRoot } from 'react-dom/client';\n`;
  }

  if (isHybrid) {
    // Hybrid mode: Use shared providers from app/ folder
    imports += `import { renderWithProviders } from '../app/providers';\n`;
  } else if (useReactQuery) {
    // Independent mode with React Query: Import providers inline
    imports += `import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../queryClient';\n`;
  }

  imports += `import { {{Module}}Page } from './{{Module}}Page';`;

  // 2. Build Render Logic
  let appElement = '';

  if (isHybrid) {
    // Hybrid mode: Wrap with renderWithProviders
    if (useCreateElement) {
      const pageElement = isWp ? `createElement({{Module}}Page)` : `React.createElement({{Module}}Page)`;
      appElement = `renderWithProviders(${pageElement})`;
    } else {
      appElement = `renderWithProviders(<{{Module}}Page />)`;
    }
    renderLogic = `root.render(${appElement});`;
  } else {
    // Independent mode: Inline providers
    if (useCreateElement) {
      const pageElement = isWp ? `createElement({{Module}}Page)` : `React.createElement({{Module}}Page)`;
      if (useReactQuery) {
        const provider = isWp
          ? `createElement(QueryClientProvider, { client: queryClient }, ${pageElement})`
          : `React.createElement(QueryClientProvider, { client: queryClient }, ${pageElement})`;
        appElement = provider;
      } else {
        appElement = pageElement;
      }
      renderLogic = `root.render(${appElement});`;
    } else {
      const pageElement = `<{{Module}}Page />`;
      if (useReactQuery) {
        appElement = `<QueryClientProvider client={queryClient}>
            ${pageElement}
        </QueryClientProvider>`;
      } else {
        appElement = pageElement;
      }
      renderLogic = `root.render(${appElement});`;
    }
  }

  const template = `${imports}

// Initialize when DOM is ready
function init{{Module}}App() {
    const rootElement = document.getElementById('{{PLUGIN_SLUG}}-{{module}}-root');
    if (rootElement) {
        const root = createRoot(rootElement);
        ${renderLogic}
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init{{Module}}App);
} else {
    init{{Module}}App();
}
`;

  return replacePlaceholders(template, config, module);
};
