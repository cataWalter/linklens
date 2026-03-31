import React from 'react';
import { BarChart3, AlertTriangle, GitBranch, Network, FileWarning, Star } from 'lucide-react';
import { useGraphStore } from '../store/graphStore';

export const MetricsPanel: React.FC = () => {
  const { metrics, rootPath } = useGraphStore();

  if (!rootPath || !metrics) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No metrics available. Open a folder to analyze dependencies.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <BarChart3 size={16} />
          Metrics
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Stats */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400 uppercase">Summary</h4>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Files" value={metrics.totalFiles} icon={<Network size={14} />} />
            <StatCard label="Dependencies" value={metrics.totalDependencies} icon={<GitBranch size={14} />} />
            <StatCard label="Cycles" value={metrics.cycles.length} icon={<AlertTriangle size={14} />} color="text-yellow-500" />
            <StatCard label="Orphans" value={metrics.orphanFiles.length} icon={<FileWarning size={14} />} color="text-gray-400" />
          </div>
        </div>

        {/* Hub Files */}
        {metrics.hubFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400 uppercase flex items-center gap-1">
              <Star size={12} className="text-red-500" />
              Hub Files
            </h4>
            <div className="space-y-1">
              {metrics.hubFiles.slice(0, 10).map((hub) => (
                <div key={hub.path} className="text-xs p-2 bg-gray-800 rounded flex justify-between items-center">
                  <span className="truncate" title={hub.path}>
                    {hub.path.split('/').pop()}
                  </span>
                  <span className="text-red-400 ml-2">{hub.importCount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cycles */}
        {metrics.cycles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-400 uppercase flex items-center gap-1">
              <AlertTriangle size={12} className="text-yellow-500" />
              Dependency Cycles
            </h4>
            <div className="space-y-2">
              {metrics.cycles.slice(0, 5).map((cycle, idx) => (
                <div key={idx} className="text-xs p-2 bg-gray-800 rounded">
                  <div className="text-yellow-400 mb-1">Cycle {idx + 1}</div>
                  <div className="text-gray-400">
                    {cycle.map((f, i) => (
                      <span key={i}>
                        {f.split('/').pop()}
                        {i < cycle.length - 1 && ' → '}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Metrics Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400 uppercase">File Metrics</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-700">
                  <th className="text-left py-1">File</th>
                  <th className="text-center py-1">Ca</th>
                  <th className="text-center py-1">Ce</th>
                  <th className="text-center py-1">I</th>
                </tr>
              </thead>
              <tbody>
                {metrics.fileMetrics
                  .sort((a, b) => b.ca - a.ca)
                  .slice(0, 20)
                  .map((fm) => (
                    <tr key={fm.path} className="border-b border-gray-800">
                      <td className="py-1 truncate max-w-[120px]" title={fm.path}>
                        {fm.path.split('/').pop()}
                      </td>
                      <td className="text-center">{fm.ca}</td>
                      <td className="text-center">{fm.ce}</td>
                      <td className="text-center">{fm.instability.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}> = ({ label, value, icon, color = 'text-blue-500' }) => (
  <div className="bg-gray-800 rounded p-2 flex items-center gap-2">
    <div className={color}>{icon}</div>
    <div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  </div>
);
