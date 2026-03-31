import type { LayoutType } from '../types';

/**
 * Cytoscape.js layout configurations
 */
export const layouts: Record<LayoutType, any> = {
  dagre: {
    name: 'dagre',
    rankDir: 'LR',
    rankSep: 100,
    nodeSep: 50,
    edgeSep: 10,
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 30,
  },
  cose: {
    name: 'cose-bilkent',
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 30,
    nodeDimensionsIncludeLabels: true,
    idealEdgeLength: 100,
    edgeElasticity: 0.45,
    nestingFactor: 0.1,
    gravity: 0.25,
    numIter: 2500,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0,
  },
  grid: {
    name: 'grid',
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 30,
    avoidOverlap: true,
  },
  circle: {
    name: 'circle',
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 30,
  },
  concentric: {
    name: 'concentric',
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 30,
    minNodeSpacing: 50,
  },
};

/**
 * Get layout configuration by name
 */
export function getLayoutConfig(name: LayoutType): any {
  return layouts[name];
}
