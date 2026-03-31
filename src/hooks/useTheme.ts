import { useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';

/**
 * Hook to initialize and sync theme
 */
export function useTheme() {
  const { theme, setTheme } = useGraphStore();

  useEffect(() => {
    // Apply initial theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return { theme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') };
}
