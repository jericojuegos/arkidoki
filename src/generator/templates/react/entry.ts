export const REACT_ENTRY_INDEX = `import { createRoot, createElement } from '@wordpress/element';
import { {{Module}}Page } from './{{Module}}Page';

// Initialize when DOM is ready
function initLogsApp() {
    const rootElement = document.getElementById('{{PLUGIN_SLUG}}-{{module}}-root');
    if (rootElement) {
        const root = createRoot(rootElement);
        root.render(createElement({{Module}}Page));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogsApp);
} else {
    initLogsApp();
}
`;
