import type { CytoscapeElements } from '../types';

/**
 * Export graph to PNG
 */
export async function exportToPNG(cy: any, filename: string = 'linklens-graph'): Promise<void> {
  const png64 = cy.png({
    full: true,
    bg: '#1f2937',
    scale: 2,
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = png64;
  link.click();
}

/**
 * Export graph to SVG
 */
export async function exportToSVG(cy: any, filename: string = 'linklens-graph'): Promise<void> {
  const svg64 = cy.svg({
    full: true,
    bg: '#1f2937',
    scale: 2,
  });

  const link = document.createElement('a');
  link.download = `${filename}.svg`;
  link.href = svg64;
  link.click();
}

/**
 * Export graph to JSON
 */
export async function exportToJSON(
  elements: CytoscapeElements,
  filename: string = 'linklens-graph'
): Promise<void> {
  const json = JSON.stringify(elements, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = `${filename}.json`;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Export options
 */
export const exportOptions = [
  { label: 'PNG Image', value: 'png', icon: 'Image' },
  { label: 'SVG Image', value: 'svg', icon: 'FileImage' },
  { label: 'JSON Data', value: 'json', icon: 'FileJson' },
] as const;
