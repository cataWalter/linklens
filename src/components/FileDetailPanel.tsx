import React from 'react';
import { FileCode, GitBranch, ArrowLeft, AlertTriangle, Star, Network } from 'lucide-react';
import { useGraphStore } from '../store/graphStore';
import { getLanguageColor } from '../utils/colors';
import type { Language } from '../types';

export const FileDetailPanel: React.FC = () => {
  const { files, selectedFile, metrics } = useGraphStore();

  if (!selectedFile) {
    return (
      <div className="p-4 text-gray-500 text-sm text-center">
        <Network size={32} className="mx-auto mb-2 opacity-50" />
        <p>Select a file to see details</p>
      </div>
    );
  }

  const file = files.find((f) => f.path === selectedFile);
  if (!file) return null;

  const fileMetrics = metrics?.fileMetrics.find((fm) => fm.path === selectedFile);
  const hubInfo = metrics?.hubFiles.find((h) => h.path === selectedFile);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <FileCode size={16} />
          File Details
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* File Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getLanguageColor(file.language as Language) }}
            />
            <span className="text-xs text-gray-400 uppercase">{file.language}</span>
          </div>
          <p className="text-sm font-mono break-all" title={file.relativePath}>
            {file.relativePath}
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>{file.size > 0 ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A'}</span>
            <span>{file.lineCount > 0 ? `${file.lineCount} lines` : 'N/A'}</span>
          </div>
        </div>

        {/* Metrics */}
        {fileMetrics && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400 uppercase">Metrics</h4>
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label={`Ca: ${fileMetrics.ca}`} description="Afferent Coupling" />
              <MetricCard label={`Ce: ${fileMetrics.ce}`} description="Efferent Coupling" />
              <MetricCard
                label={`I: ${fileMetrics.instability.toFixed(2)}`}
                description="Instability"
              />
              <MetricCard
                label={fileMetrics.inCycle ? 'In Cycle' : 'No Cycle'}
                description="Cycle Status"
                color={fileMetrics.inCycle ? 'text-yellow-500' : 'text-green-500'}
              />
            </div>
          </div>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {fileMetrics?.isHub && (
            <span className="px-2 py-1 text-xs bg-red-900/50 text-red-400 rounded-full flex items-center gap-1">
              <Star size={10} />
              Hub
            </span>
          )}
          {fileMetrics?.isOrphan && (
            <span className="px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded-full flex items-center gap-1">
              <AlertTriangle size={10} />
              Orphan
            </span>
          )}
          {fileMetrics?.inCycle && (
            <span className="px-2 py-1 text-xs bg-yellow-900/50 text-yellow-400 rounded-full flex items-center gap-1">
              <GitBranch size={10} />
              Cycle
            </span>
          )}
        </div>

        {/* Hub Info */}
        {hubInfo && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400 uppercase flex items-center gap-1">
              <Star size={12} className="text-red-500" />
              Imported By ({hubInfo.importCount})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {hubInfo.importers.slice(0, 10).map((importer) => (
                <div key={importer} className="text-xs text-gray-400 truncate" title={importer}>
                  <ArrowLeft size={10} className="inline mr-1" />
                  {importer.split('/').pop()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  description: string;
  color?: string;
}> = ({ label, description, color = 'text-blue-500' }) => (
  <div className="bg-gray-800 rounded p-2">
    <div className={`text-lg font-bold ${color}`}>{label}</div>
    <div className="text-xs text-gray-500">{description}</div>
  </div>
);
