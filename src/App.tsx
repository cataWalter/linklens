import React from 'react';
import { Toolbar } from './components/Toolbar';
import { GraphView } from './components/GraphView';
import { FileTree } from './components/FileTree';
import { MetricsPanel } from './components/MetricsPanel';
import { FilterBar } from './components/FilterBar';
import { useGraphStore } from './store/graphStore';
import { useTheme } from './hooks/useTheme';

const App: React.FC = () => {
  const { theme } = useGraphStore();
  useTheme();
  
  return (
    <div className={`h-screen w-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Top Toolbar */}
      <Toolbar />
      
      {/* Filter Bar */}
      <FilterBar />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Tree */}
        <div className="w-64 border-r border-gray-700 overflow-y-auto">
          <FileTree />
        </div>
        
        {/* Center - Graph View */}
        <div className="flex-1 relative">
          <GraphView />
        </div>
        
        {/* Right Sidebar - Metrics Panel */}
        <div className="w-80 border-l border-gray-700 overflow-y-auto">
          <MetricsPanel />
        </div>
      </div>
    </div>
  );
};

export default App;
