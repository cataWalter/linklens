import { useCallback } from 'react';
import { useGraphStore } from '../store/graphStore';

/**
 * Hook to handle graph interactions and state
 */
export function useGraph() {
  const {
    cytoscapeElements,
    selectedFile,
    highlightedPath,
    layout,
    isLoading,
    selectFile,
    highlightPath,
    setLayout,
  } = useGraphStore();

  const handleNodeClick = useCallback((nodeId: string) => {
    selectFile(nodeId);
  }, [selectFile]);

  const handleNodeHover = useCallback((nodeId: string | null) => {
    if (nodeId) {
      // Highlight path to and from this node
      highlightPath([nodeId]);
    } else {
      highlightPath([]);
    }
  }, [highlightPath]);

  return {
    cytoscapeElements,
    selectedFile,
    highlightedPath,
    layout,
    isLoading,
    handleNodeClick,
    handleNodeHover,
    setLayout,
  };
}
