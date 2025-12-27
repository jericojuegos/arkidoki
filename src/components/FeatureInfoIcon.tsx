import React, { useState } from 'react';
import { getFeatureDocs } from '../generator/documentation';
import { FeatureDocModal } from './FeatureDocModal';
import type { PluginConfig } from '../types';

interface Props {
    featureId: string;
    config: PluginConfig;
    tooltip?: string;
}

export const FeatureInfoIcon: React.FC<Props> = ({ featureId, config, tooltip }) => {
    const [isOpen, setIsOpen] = useState(false);
    const docs = getFeatureDocs(featureId);

    if (!docs) return null;

    return (
        <>
            <button
                className="feature-info-icon"
                onClick={() => setIsOpen(true)}
                title={tooltip || `Learn about ${docs.name}`}
                type="button"
            >
                ℹ️
            </button>
            {isOpen && (
                <FeatureDocModal
                    docs={docs}
                    config={config}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
};
