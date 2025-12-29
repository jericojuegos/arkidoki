import type { PluginConfig, ModuleConfig } from '../../../types';
import { replacePlaceholders } from '../../utils';

export const buildReactEntryTemplate = (config: PluginConfig, module: ModuleConfig): string => {
  let imports = '';
  let renderLogic = '';

  const isWp = config.runtime.react === 'wp';
  // If outputStyle is explicitly createElement, OR if we are using WP (which usually defaults to createElement usage in this project's context, though WP supports JSX if built correctly. 
  // But the user's current WP template uses createElement. Let's respect the config.)
  const useCreateElement = config.runtime.outputStyle === 'createElement';

  if (isWp) {
    imports = `import { createRoot, createElement } from '@wordpress/element';`;
    // WP usually uses createElement directly if no JSX transform, but with @wordpress/scripts it supports JSX.
    // However, sticking to the existing pattern for WP which was createElement.
    // If user selects JSX for WP, we should output JSX.
    if (useCreateElement) {
      renderLogic = `root.render(createElement({{Module}}Page));`;
    } else {
      renderLogic = `root.render(<{{Module}}Page />);`;
    }
  } else {
    // Bundled or Hybrid
    imports = `import React from 'react';
import { createRoot } from 'react-dom/client';`;

    if (useCreateElement) {
      renderLogic = `root.render(React.createElement({{Module}}Page));`;
    } else {
      renderLogic = `root.render(<{{Module}}Page />);`;
    }
  }

  const template = `${imports}
import { {{Module}}Page } from './{{Module}}Page';

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
