import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import coseBilkent from 'cytoscape-cose-bilkent';
import { useGraphStore } from '../store/graphStore';
import { useFilters } from '../hooks/useFilters';
import { getLayoutConfig } from '../utils/layout';
import { getLanguageColor } from '../utils/colors';
import type { CytoscapeNode, CytoscapeEdge, LayoutType } from '../types';

// Register extensions
cytoscape.use(dagre);
cytoscape.use(coseBilkent);

export const GraphView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const { selectedFile, layout, setLayout, selectFile, isLoading, rootPath } = useGraphStore();
  const { filteredElements, filters } = useFilters();

  // Initialize graph
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: cytoscape.NodeSingular) => {
              const lang = ele.data('language');
              return getLanguageColor(lang as any);
            },
            'width': 30,
            'height': 30,
            'border-width': 2,
            'border-color': '#4b5563',
            'label': 'data(label)',
            'font-size': '10px',
            'color': '#e5e7eb',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 8,
            'text-wrap': 'wrap',
            'text-max-width': '80px',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#6b7280',
            'target-arrow-color': '#6b7280',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.5,
          },
        },
        {
          selector: '.selected',
          style: {
            'border-width': 4,
            'border-color': '#3b82f6',
          },
        },
        {
          selector: '.highlighted',
          style: {
            'opacity': 1,
          },
        },
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.2,
          },
        },
        {
          selector: '.hub',
          style: {
            'width': 40,
            'height': 40,
            'border-width': 3,
            'border-color': '#ef4444',
          },
        },
        {
          selector: '.orphan',
          style: {
            'width': 20,
            'height': 20,
            'opacity': 0.5,
          },
        },
        {
          selector: '.in-cycle',
          style: {
            'border-width': 3,
            'border-color': '#f59e0b',
          },
        },
      ],
      layout: { name: 'grid' },
    });

    cy.on('tap', 'node', (event) => {
      const nodeId = event.target.id();
      selectFile(nodeId);
    });

    cy.on('tap', (event) => {
      if (event.target === cy) {
        selectFile(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [selectFile]);

  // Update graph when elements change
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    const { nodes, edges } = filteredElements;

    cy.elements().remove();
    cy.add(nodes.map((n: CytoscapeNode) => ({
      group: 'nodes',
      data: n.data,
    })));
    cy.add(edges.map((e: CytoscapeEdge) => ({
      group: 'edges',
      data: e.data,
    })));

    // Apply layout
    const layoutConfig = getLayoutConfig(layout);
    cy.layout(layoutConfig).run();
  }, [filteredElements, layout]);

  // Update selection and highlighting
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    cy.elements().removeClass('selected highlighted dimmed');

    if (selectedFile) {
      const node = cy.getElementById(selectedFile);
      if (node.length) {
        node.addClass('selected');
        
        // Highlight connected
        const connected = node.connectedEdges();
        connected.addClass('highlighted');
        connected.connectedNodes().addClass('highlighted');
        
        // Dim others
        cy.elements().not('.selected, .highlighted').addClass('dimmed');
      }
    }
  }, [selectedFile]);

  // Apply hub/orphan/cycle classes
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    if (filters.showHubs) {
      cy.nodes().forEach((node: cytoscape.NodeSingular) => {
        if (node.data('isHub')) {
          node.addClass('hub');
        }
      });
    }

    if (filters.showOrphans) {
      cy.nodes().forEach((node: cytoscape.NodeSingular) => {
        if (node.data('isOrphan')) {
          node.addClass('orphan');
        }
      });
    }
  }, [filters.showHubs, filters.showOrphans]);

  if (!rootPath) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto text-gray-600 mb-4">
            <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="2" />
            <line x1="7" y1="8" x2="11" y2="16" stroke="currentColor" strokeWidth="2" />
            <line x1="17" y1="8" x2="13" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
          <p className="text-gray-400 text-lg">Open a folder to visualize dependencies</p>
          <p className="text-gray-500 text-sm mt-2">Click "Open Folder" in the toolbar above</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} id="graph-container" />
      
      {/* Layout selector */}
      <div className="absolute top-4 right-4 flex gap-2 bg-gray-800 rounded-lg p-2">
        {(['dagre', 'cose', 'grid', 'circle', 'concentric'] as LayoutType[]).map((l) => (
          <button
            key={l}
            onClick={() => setLayout(l)}
            className={`px-2 py-1 text-xs rounded ${
              layout === l ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
};
