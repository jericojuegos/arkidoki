export const REACT_FILTERS = `import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const {{Module}}Filters = () => {
  return (
    <div className="{{PLUGIN_SLUG}}-filters">
      {/* Add filter controls here */}
      <Button variant="secondary">
        {__('Filter', '{{PLUGIN_SLUG}}')}
      </Button>
    </div>
  );
};
`;
