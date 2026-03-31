import React from 'react';
import { GitBranch } from 'lucide-react';
import { useGraphStore } from '../store/graphStore';

export const DependencyList: React.FC = () => {
  const { files, selectedFile, rootPath } = useGraphStore();

  if (!rootPath || !selectedFile) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Select a file to see its dependencies.
      </div>
    );
  }

  const file = files.find((f) => f.path === selectedFile);
  if (!file) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <GitBranch size={16} />
          Dependencies
        </h3>
      </div>

      <div className="p-4">
        <div className="text-xs text-gray-400 mb-2 truncate" title={file.relativePath}>
          {file.relativePath}
        </div>

        <div className="space-y-2">
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Imports</h4>
            <div className="text-sm text-gray-300">
              {/* Dependencies will be populated from store */}
              <span className="text-gray-500">No dependencies found</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Imported By</h4>
            <div className="text-sm text-gray-300">
              <span className="text-gray-500">Not imported by any file</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
