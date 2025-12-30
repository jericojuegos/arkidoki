export interface PluginConfig {
  projectName: string;
  projectSlug: string;
  pluginTitle: string;
  projectConst: string; // SITESYNC
  projectNamespace: string; // MyProjectName
  pluginDescription: string;
  pluginVersion: string;
  authorName: string;
  authorUri: string;
  architecture: 'independent' | 'hybrid' | 'spa';
  modules: ModuleConfig[];
  reactOptions: ReactOptions;
  buildApproach: 'tangible' | 'standard'; // Added
  dependencies: DependenciesConfig;
  runtime: RuntimeStrategyConfig;
}

export interface DependenciesConfig {
  tangibleFields: boolean; // Use Tangible Fields library
}

export interface RuntimeStrategyConfig {
  react: 'wp' | 'bundled' | 'hybrid';
  ui: 'wp-components' | 'custom' | 'mantine' | 'radix';
  outputStyle: 'jsx' | 'createElement';
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
  tableOptions: TableOptions;
  loadingOptions: LoadingOptions;
  dataFetching?: 'none' | 'react-query'; // Added
}

export interface TableOptions {
  responsive: boolean;
  styleModifiers: string[]; // 'striped', 'bordered', 'compact', 'dark'
}

export interface LoadingOptions {
  initial: 'skeleton' | 'spinner' | 'none';
  refreshOverlay: boolean;
  buttonLoading: boolean;
  emptyState: 'simple' | 'illustration';
}

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: 'php' | 'typescript' | 'javascript' | 'json' | 'scss';
  styleContent?: string; // Optional SCSS content for TSX files
  stylePath?: string; // Optional SCSS file path
}
