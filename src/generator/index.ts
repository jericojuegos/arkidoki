import type { PluginConfig, GeneratedFile } from '../types';
import { strategies } from './approaches/index';

export const generatePluginFiles = (config: PluginConfig): GeneratedFile[] => {
    const approach = config.buildApproach || 'tangible';
    const strategy = strategies[approach];

    if (!strategy) {
        throw new Error(`Unknown build approach: ${approach}`);
    }

    return strategy.generate(config);
};
