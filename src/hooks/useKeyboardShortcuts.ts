import { useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';

/**
 * Hook to handle keyboard shortcuts
 */
export function useKeyboardShortcuts() {
  const { selectFile, setLayout, layout, rootPath, openFolder } = useGraphStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + O: Open folder
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        // Trigger open folder dialog
        const event = new CustomEvent('open-folder');
        window.dispatchEvent(event);
      }

      // Escape: Deselect file
      if (e.key === 'Escape') {
        selectFile(null);
      }

      // 1-5: Switch layouts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const layouts = ['dagre', 'cose', 'grid', 'circle', 'concentric'] as const;
        const num = parseInt(e.key);
        if (num >= 1 && num <= 5) {
          setLayout(layouts[num - 1]);
        }
      }

      // F: Fit to screen
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        const event = new CustomEvent('fit-graph');
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectFile, setLayout, layout, rootPath, openFolder]);
}
