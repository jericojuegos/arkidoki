export interface PluginConfig {
  projectName: string;
  projectSlug: string;
  pluginTitle: string;
  projectConst: string; // SITESYNC
  pluginDescription: string;
  pluginVersion: string;
  authorName: string;
  authorUri: string;
  modules: ModuleConfig[];
  reactOptions: ReactOptions;
  dependencies: string[];
}

export interface ModuleConfig {
  name: string; // "Logger", "Sync"
  slug: string; // "logger", "sync"
  // potentially, we could override options per module later
}

export interface ReactOptions {
  pagination: boolean;
  filters: boolean;
  detailsModal: boolean;
  search: boolean;
  searchType: 'explicit' | 'live';
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: 'php' | 'typescript' | 'javascript' | 'json';
}
