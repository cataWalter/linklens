import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportOptions, exportToPNG, exportToSVG } from '../../src/utils/export';

// Mock cytoscape instance
const mockPng = vi.fn(() => 'data:image/png;base64,mock');
const mockSvg = vi.fn(() => 'data:image/svg+xml,mock');
const mockCy = {
  png: mockPng,
  svg: mockSvg,
};

describe('export utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportOptions', () => {
    it('should have three export options', () => {
      expect(exportOptions).toHaveLength(3);
    });

    it('should have PNG option', () => {
      const png = exportOptions.find((o) => o.value === 'png');
      expect(png).toBeDefined();
      expect(png?.label).toBe('PNG Image');
    });

    it('should have SVG option', () => {
      const svg = exportOptions.find((o) => o.value === 'svg');
      expect(svg).toBeDefined();
      expect(svg?.label).toBe('SVG Image');
    });

    it('should have JSON option', () => {
      const json = exportOptions.find((o) => o.value === 'json');
      expect(json).toBeDefined();
      expect(json?.label).toBe('JSON Data');
    });
  });

  describe('exportToPNG', () => {
    it('should call cy.png with correct options', async () => {
      await exportToPNG(mockCy as any, 'test');
      expect(mockPng).toHaveBeenCalledWith({ full: true, bg: '#1f2937', scale: 2 });
    });
  });

  describe('exportToSVG', () => {
    it('should call cy.svg with correct options', async () => {
      await exportToSVG(mockCy as any, 'test');
      expect(mockSvg).toHaveBeenCalledWith({ full: true, bg: '#1f2937', scale: 2 });
    });
  });
});
