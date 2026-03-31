import { useCallback } from 'react';
import { useGraphStore } from '../store/graphStore';
import type { FilterState } from '../types';

/**
 * Hook to handle filtering logic
 */
export function useFilters() {
  const { filters, setFilters, cytoscapeElements } = useGraphStore();

  const toggleLanguage = useCallback((language: FilterState['languages'][number]) => {
    const currentLanguages = filters.languages;
    if (currentLanguages.includes(language)) {
      setFilters({ languages: currentLanguages.filter((l) => l !== language) });
    } else {
      setFilters({ languages: [...currentLanguages, language] });
    }
  }, [filters.languages, setFilters]);

  const setSearchQuery = useCallback((query: string) => {
    setFilters({ searchQuery: query });
  }, [setFilters]);

  const toggleShowOrphans = useCallback(() => {
    setFilters({ showOrphans: !filters.showOrphans });
  }, [filters.showOrphans, setFilters]);

  const toggleShowHubs = useCallback(() => {
    setFilters({ showHubs: !filters.showHubs });
  }, [filters.showHubs, setFilters]);

  const toggleShowCycles = useCallback(() => {
    setFilters({ showCycles: !filters.showCycles });
  }, [filters.showCycles, setFilters]);

  const resetFilters = useCallback(() => {
    setFilters({
      languages: [],
      folders: [],
      searchQuery: '',
      showOrphans: false,
      showHubs: false,
      showCycles: false,
      maxDepth: null,
    });
  }, [setFilters]);

  // Apply filters to cytoscape elements
  const filteredElements = useCallback(() => {
    let { nodes, edges } = cytoscapeElements;

    // Filter by language
    if (filters.languages.length > 0) {
      nodes = nodes.filter((node) => filters.languages.includes(node.data.language as any));
      const nodeIds = new Set(nodes.map((n) => n.data.id));
      edges = edges.filter((edge) => nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target));
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      nodes = nodes.filter((node) => node.data.label.toLowerCase().includes(query));
      const nodeIds = new Set(nodes.map((n) => n.data.id));
      edges = edges.filter((edge) => nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target));
    }

    return { nodes, edges };
  }, [cytoscapeElements, filters]);

  return {
    filters,
    filteredElements: filteredElements(),
    toggleLanguage,
    setSearchQuery,
    toggleShowOrphans,
    toggleShowHubs,
    toggleShowCycles,
    resetFilters,
  };
}
