export const REACT_ENTRY_INDEX = `import { createRoot, createElement } from '@wordpress/element';
import { {{Module}}Page } from './{{Module}}Page';

const container = document.getElementById('{{PLUGIN_SLUG}}-{{module}}-root');

if (container) {
  createRoot(container).render(createElement({{Module}}Page));
}
`;
