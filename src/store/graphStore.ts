import { create } from 'zustand';
import type { AppState, FilterState, Language, LayoutType, CytoscapeElements, GraphMetrics, FileNode, CytoscapeNode } from '../types';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

interface GraphStore extends AppState {
  // Actions
  openFolder: (path: string) => Promise<void>;
  selectFile: (path: string | null) => void;
  highlightPath: (path: string[]) => void;
  setLayout: (layout: LayoutType) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setFilters: (filters: Partial<FilterState>) => void;
  startWatching: (path: string) => Promise<void>;
  stopWatching: () => Promise<void>;
  exportGraph: (format: string) => Promise<string>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshMetrics: () => Promise<void>;
}

const defaultFilters: FilterState = {
  languages: [],
  folders: [],
  searchQuery: '',
  showOrphans: false,
  showHubs: false,
  showCycles: false,
  maxDepth: null,
};

export const useGraphStore = create<GraphStore>((set, get) => ({
  // Initial state
  rootPath: null,
  files: [],
  dependencies: [],
  cytoscapeElements: { nodes: [], edges: [] },
  metrics: null,
  selectedFile: null,
  highlightedPath: [],
  filters: defaultFilters,
  layout: 'dagre',
  isLoading: false,
  error: null,
  theme: 'dark',
  isWatching: false,

  // Actions
  openFolder: async (path: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await invoke<any>('open_folder', { path });
      
      // Transform the response to match our types
      const cytoscapeElements: CytoscapeElements = {
        nodes: response.cytoscape_elements.nodes || [],
        edges: response.cytoscape_elements.edges || [],
      };
      
      // Extract files from nodes
      const files: FileNode[] = cytoscapeElements.nodes.map((node: CytoscapeNode) => ({
        path: node.data.id,
        relativePath: node.data.label,
        extension: node.data.extension,
        language: node.data.language as Language,
        size: 0,
        lineCount: 0,
      }));

      set({
        rootPath: response.root_path,
        files,
        cytoscapeElements,
        isLoading: false,
      });

      // Auto-calculate metrics
      await get().refreshMetrics();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        isLoading: false,
      });
    }
  },

  selectFile: (path: string | null) => {
    set({ selectedFile: path });
  },

  highlightPath: (path: string[]) => {
    set({ highlightedPath: path });
  },

  setLayout: (layout: LayoutType) => {
    set({ layout });
  },

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setFilters: (filters: Partial<FilterState>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  startWatching: async (path: string) => {
    try {
      await invoke('start_watcher', { path });
      set({ isWatching: true });
      
      // Listen for file changes
      await listen<string[]>('files-changed', (event) => {
        console.log('Files changed:', event.payload);
        // Re-open folder to refresh the graph
        if (get().rootPath) {
          get().openFolder(get().rootPath!);
        }
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  stopWatching: async () => {
    try {
      await invoke('stop_watcher');
      set({ isWatching: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
    }
  },

  exportGraph: async (format: string) => {
    try {
      return await invoke<string>('export_graph', { format });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error) });
      return '';
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  refreshMetrics: async () => {
    try {
      const response = await invoke<any>('calculate_metrics');
      
      const metrics: GraphMetrics = {
        totalFiles: response.total_files,
        totalDependencies: response.total_dependencies,
        orphanFiles: response.orphan_files,
        hubFiles: response.hub_files,
        cycles: response.cycles || [],
        fileMetrics: response.file_metrics,
      };

      set({ metrics });
    } catch (error) {
      console.error('Failed to calculate metrics:', error);
    }
  },
}));
