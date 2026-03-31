// Types for the LinkLens application

export type Language =
  | 'JavaScript'
  | 'TypeScript'
  | 'Python'
  | 'Java'
  | 'C'
  | 'Cpp'
  | 'Go'
  | 'Rust'
  | 'Php'
  | 'Ruby'
  | 'Unknown';

export interface FileNode {
  path: string;
  relativePath: string;
  extension: string;
  language: Language;
  size: number;
  lineCount: number;
}

export interface Dependency {
  source: string;
  target: string;
  depType: string;
  line: number;
}

export interface FileMetrics {
  path: string;
  ca: number; // Afferent Coupling
  ce: number; // Efferent Coupling
  instability: number;
  isHub: boolean;
  isOrphan: boolean;
  inCycle: boolean;
}

export interface HubFile {
  path: string;
  importCount: number;
  importers: string[];
}

export interface GraphMetrics {
  totalFiles: number;
  totalDependencies: number;
  orphanFiles: string[];
  hubFiles: HubFile[];
  cycles: string[][];
  fileMetrics: FileMetrics[];
}

export interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    language: string;
    extension: string;
  };
}

export interface CytoscapeEdge {
  data: {
    source: string;
    target: string;
    weight: string;
  };
}

export interface CytoscapeElements {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
}

export interface OpenFolderResponse {
  rootPath: string;
  fileCount: number;
  dependencyCount: number;
  cytoscapeElements: CytoscapeElements;
  summary: Record<string, unknown>;
}

export interface MetricsResponse {
  totalFiles: number;
  totalDependencies: number;
  orphanFiles: string[];
  hubFiles: HubFile[];
  fileMetrics: FileMetrics[];
  summary: Record<string, unknown>;
}

export interface CyclesResponse {
  cycles: string[][];
  count: number;
}

export type LayoutType = 'dagre' | 'cose' | 'grid' | 'circle' | 'concentric';

export interface FilterState {
  languages: Language[];
  folders: string[];
  searchQuery: string;
  showOrphans: boolean;
  showHubs: boolean;
  showCycles: boolean;
  maxDepth: number | null;
}

export interface AppState {
  rootPath: string | null;
  files: FileNode[];
  dependencies: Dependency[];
  cytoscapeElements: CytoscapeElements;
  metrics: GraphMetrics | null;
  selectedFile: string | null;
  highlightedPath: string[];
  filters: FilterState;
  layout: LayoutType;
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  isWatching: boolean;
}
