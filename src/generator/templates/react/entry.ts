import type { PluginConfig, ModuleConfig } from '../../../types';
import { replacePlaceholders } from '../../utils';

export const buildReactEntryTemplate = (config: PluginConfig, module: ModuleConfig): string => {
  let imports = '';
  let renderLogic = '';

  // Config Flags
  const isWp = config.runtime.react === 'wp';
  // If outputStyle is explicitly createElement, OR if we are using WP (which usually defaults to createElement usage in this project's context, though WP supports JSX if built correctly. 
  // But the user's current WP template uses createElement. Let's respect the config.)
  const useCreateElement = config.runtime.outputStyle === 'createElement';
  const useReactQuery = config.reactOptions.dataFetching === 'react-query';

  // 1. Build Imports
  if (isWp) {
    imports += `import { createRoot, createElement } from '@wordpress/element';\n`;
  } else {
    imports += `import React from 'react';
import { createRoot } from 'react-dom/client';\n`;
  }

  if (useReactQuery) {
    imports += `import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../queryClient';\n`;
  }

  imports += `import { {{Module}}Page } from './{{Module}}Page';`;

  // 2. Build Render Logic
  let appElement = '';

  if (useCreateElement) {
    // createElement style
    const pageElement = isWp ? `createElement({{Module}}Page)` : `React.createElement({{Module}}Page)`;

    if (useReactQuery) {
      const provider = isWp ? `createElement(QueryClientProvider, { client: queryClient }, ${pageElement})` : `React.createElement(QueryClientProvider, { client: queryClient }, ${pageElement})`;
      appElement = provider;
    } else {
      appElement = pageElement;
    }

    renderLogic = `root.render(${appElement});`;

  } else {
    // JSX style
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


  const template = `${imports}

// Initialize when DOM is ready
function initLogsApp() {
    const rootElement = document.getElementById('{{PLUGIN_SLUG}}-{{module}}-root');
    if (rootElement) {
        const root = createRoot(rootElement);
        ${renderLogic}
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogsApp);
} else {
    initLogsApp();
}
`;

  return replacePlaceholders(template, config, module);
};
