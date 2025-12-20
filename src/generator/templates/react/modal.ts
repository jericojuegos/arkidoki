export const REACT_DETAILS_MODAL = `import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export const {{Module}}DetailsModal = ({ item, onClose }) => {
  return (
    <Modal title={__('{{Module}} Details', '{{PLUGIN_SLUG}}')} onRequestClose={onClose}>
      <pre>{JSON.stringify(item, null, 2)}</pre>
    </Modal>
  );
};
`;
