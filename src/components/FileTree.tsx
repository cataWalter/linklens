import React, { useMemo } from 'react';
import { FileCode, ChevronRight, ChevronDown } from 'lucide-react';
import { useGraphStore } from '../store/graphStore';
import { getLanguageColor } from '../utils/colors';
import type { Language } from '../types';

interface TreeNodeProps {
  name: string;
  path: string;
  children?: TreeNodeProps[];
  isFile: boolean;
  language?: Language;
}

const TreeNode: React.FC<{ node: TreeNodeProps; depth: number }> = ({ node, depth }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const { selectedFile, selectFile } = useGraphStore();
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (node.isFile) {
      selectFile(node.path);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-700 ${
          isSelected ? 'bg-blue-900/50' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.isFile ? (
          <FileCode size={14} style={{ color: getLanguageColor(node.language || 'Unknown') }} />
        ) : isOpen ? (
          <ChevronDown size={14} />
        ) : (
          <ChevronRight size={14} />
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>
      {node.children && isOpen && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC = () => {
  const { files, rootPath } = useGraphStore();

  const treeData = useMemo(() => {
    if (!rootPath || files.length === 0) return [];

    const root: TreeNodeProps = { name: 'root', path: rootPath, children: [], isFile: false };

    for (const file of files) {
      const relativePath = file.relativePath;
      const parts = relativePath.split('/');
      
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        const childPath = parts.slice(0, i + 1).join('/');
        
        let child = current.children?.find((c) => c.name === part);
        if (!child) {
          child = {
            name: part,
            path: `${rootPath}/${childPath}`,
            children: isFile ? undefined : [],
            isFile,
            language: isFile ? file.language : undefined,
          };
          current.children?.push(child);
        }
        current = child;
      }
    }

    return root.children || [];
  }, [files, rootPath]);

  if (!rootPath || files.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No files loaded. Open a folder to see the file tree.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">Files</h3>
        <p className="text-xs text-gray-500">{files.length} files</p>
      </div>
      <div className="py-1">
        {treeData.map((node) => (
          <TreeNode key={node.path} node={node} depth={0} />
        ))}
      </div>
    </div>
  );
};
