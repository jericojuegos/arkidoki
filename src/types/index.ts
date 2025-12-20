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
  buildApproach: 'tangible' | 'standard'; // Added
  dependencies: string[];
}

export interface ModuleConfig {
  name: string; // "Logger", "Sync"
  slug: string; // "logger", "sync"
  columns: ColumnConfig[];
}

export interface ColumnConfig {
  header: string;
  accessorKey: string;
  width?: number;
  type?: 'text' | 'date' | 'status' | 'boolean';
}

export interface ReactOptions {
  pagination: boolean;
  paginationStyle: 'simple' | 'v2' | 'v3';
  filters: boolean;
  detailsModal: boolean;
  search: boolean;
  searchType: 'explicit' | 'live';
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: 'php' | 'typescript' | 'javascript' | 'json' | 'scss';
  styleContent?: string; // Optional SCSS content for TSX files
  stylePath?: string; // Optional SCSS file path
}
