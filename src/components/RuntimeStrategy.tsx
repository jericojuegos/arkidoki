import React from 'react';
import type { PluginConfig, RuntimeStrategyConfig } from '../types';
import { FeatureInfoIcon } from './FeatureInfoIcon';

interface Props {
    config: PluginConfig;
    onChange: (config: PluginConfig) => void;
}

export const RuntimeStrategy: React.FC<Props> = ({ config, onChange }) => {
    const handleChange = (field: keyof RuntimeStrategyConfig, value: any) => {
        onChange({
            ...config,
            runtime: {
                ...config.runtime,
                [field]: value
            }
        });
    };

    return (
        <>
            <h3>Runtime Strategy <FeatureInfoIcon featureId="runtime-strategy" config={config} /></h3>

            <div className="form-group">
                <label>React Runtime</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="react-runtime"
                            checked={config.runtime.react === 'wp'}
                            onChange={() => handleChange('react', 'wp')}
                        />
                        <span>
                            <strong>WordPress Bundled React</strong>
                            <small style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Default. Best for Admin & Gutenberg.</small>
                        </span>
                    </label>

                    <label className="radio-option">
                        <input
                            type="radio"
                            name="react-runtime"
                            checked={config.runtime.react === 'bundled'}
                            onChange={() => handleChange('react', 'bundled')}
                        />
                        <span>
                            <strong>Bundled React (Standalone)</strong>
                            <small style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Full React 18+. Best for complex apps.</small>
                        </span>
                    </label>

                    <label className="radio-option">
                        <input
                            type="radio"
                            name="react-runtime"
                            checked={config.runtime.react === 'hybrid'}
                            onChange={() => handleChange('react', 'hybrid')}
                        />
                        <span>
                            <strong>Hybrid (Externalized)</strong>
                            <small style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Advanced. Use WP React via standard imports.</small>
                        </span>
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label>UI Component Library</label>
                <select
                    value={config.runtime.ui}
                    onChange={(e) => handleChange('ui', e.target.value as any)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                    <option value="wp-components">WordPress Components (@wordpress/components)</option>
                    <option value="custom">Custom Components (Headless)</option>
                    <option value="mantine">Mantine UI</option>
                    <option value="radix">Radix UI</option>
                </select>
            </div>

            <div className="form-group">
                <label>Code Output Style</label>
                <select
                    value={config.runtime.outputStyle}
                    onChange={(e) => handleChange('outputStyle', e.target.value as any)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                >
                    <option value="jsx">JSX</option>
                    <option value="createElement">createElement (Classic)</option>
                </select>
            </div>

            <style>{`
        .radio-option {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px;
          border: 1px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .radio-option:hover {
          background-color: var(--hover-bg);
        }
        .radio-option input {
          margin-top: 4px;
        }
      `}</style>
        </>
    );
};
