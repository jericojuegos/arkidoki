export const REACT_DETAILS_MODAL = `import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { {{ModuleSingular}} } from './types';

interface {{Module}}DetailsModalProps {
  item: {{ModuleSingular}};
  onClose: () => void;
}

export const {{Module}}DetailsModal = ({ item, onClose }: {{Module}}DetailsModalProps) => {
  return (
    <Modal title={__('{{Module}} Details', '{{PLUGIN_SLUG}}')} onRequestClose={onClose}>
      <pre>{JSON.stringify(item, null, 2)}</pre>
    </Modal>
  );
};
`;
