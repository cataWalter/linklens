import React, { useCallback, useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { GraphView } from './components/GraphView';
import { FileTree } from './components/FileTree';
import { MetricsPanel } from './components/MetricsPanel';
import { FileDetailPanel } from './components/FileDetailPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FilterBar } from './components/FilterBar';
import { useGraphStore } from './store/graphStore';
import { useTheme } from './hooks/useTheme';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { open } from '@tauri-apps/api/dialog';

const App: React.FC = () => {
  const { theme } = useGraphStore();
  useTheme();
  useKeyboardShortcuts();
  const [showDetail, setShowDetail] = useState(false);
  const openFolder = useGraphStore((s) => s.openFolder);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select a folder to analyze',
    });
    if (selected && typeof selected === 'string') {
      await openFolder(selected);
    }
  }, [openFolder]);

  return (
    <ErrorBoundary>
      <div
        className={`h-screen w-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Top Toolbar */}
        <Toolbar />
        
        {/* Filter Bar */}
        <FilterBar />
        
        {/* Keyboard shortcuts hint */}
        <div className="px-4 py-1 bg-gray-800/50 text-xs text-gray-500 flex items-center gap-4">
          <span><kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl+O</kbd> Open</span>
          <span><kbd className="px-1 py-0.5 bg-gray-700 rounded">Esc</kbd> Deselect</span>
          <span><kbd className="px-1 py-0.5 bg-gray-700 rounded">1-5</kbd> Layout</span>
          <span><kbd className="px-1 py-0.5 bg-gray-700 rounded">F</kbd> Fit</span>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - File Tree */}
          <div className="w-64 border-r border-gray-700 overflow-y-auto flex flex-col">
            <FileTree />
          </div>
          
          {/* Center - Graph View */}
          <div className="flex-1 relative">
            <GraphView />
            
            {/* Toggle detail panel button */}
            <button
              onClick={() => setShowDetail(!showDetail)}
              className={`absolute top-4 right-4 z-10 p-2 rounded-lg transition-all ${
                showDetail ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
              title="Toggle File Details"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </button>
          </div>
          
          {/* Right Sidebar - Metrics or Detail Panel */}
          <div className="w-80 border-l border-gray-700 overflow-y-auto">
            {showDetail ? <FileDetailPanel /> : <MetricsPanel />}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
