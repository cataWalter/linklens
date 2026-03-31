import React from 'react';
import { FolderOpen, Moon, Sun, Download, Eye, EyeOff } from 'lucide-react';
import { useGraphStore } from '../store/graphStore';
import { open } from '@tauri-apps/api/dialog';
import { useTheme } from '../hooks/useTheme';

export const Toolbar: React.FC = () => {
  const { rootPath, openFolder, startWatching, stopWatching, isWatching, isLoading, exportGraph } = useGraphStore();
  const { theme, toggleTheme } = useTheme();

  const handleOpenFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select a folder to analyze',
    });
    
    if (selected && typeof selected === 'string') {
      await openFolder(selected);
      await startWatching(selected);
    }
  };

  const handleExport = async () => {
    const json = await exportGraph('json');
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'linklens-graph.json';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
      {/* Left section */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-500">
            <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="2" />
            <line x1="7" y1="8" x2="11" y2="16" stroke="currentColor" strokeWidth="2" />
            <line x1="17" y1="8" x2="13" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="font-semibold text-lg">LinkLens</span>
        </div>
        
        <button
          onClick={handleOpenFolder}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-sm transition-colors disabled:opacity-50"
        >
          <FolderOpen size={16} />
          Open Folder
        </button>
      </div>

      {/* Center section - current path */}
      <div className="flex-1 mx-4">
        {rootPath && (
          <div className="text-sm text-gray-400 truncate" title={rootPath}>
            {rootPath}
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {rootPath && (
          <>
            <button
              onClick={() => isWatching ? stopWatching() : startWatching(rootPath!)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                isWatching 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isWatching ? <Eye size={16} /> : <EyeOff size={16} />}
              {isWatching ? 'Watching' : 'Watch'}
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};
