import type { PluginConfig, GeneratedFile } from '../../types';

export interface GeneratorStrategy {
    generate(config: PluginConfig): GeneratedFile[];
}
