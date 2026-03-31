import { describe, it, expect } from 'vitest';
import { layouts, getLayoutConfig } from '../../src/utils/layout';
import type { LayoutType } from '../../src/types';

describe('layout utility', () => {
  describe('layouts', () => {
    it('should have all layout configurations', () => {
      expect(layouts.dagre).toBeDefined();
      expect(layouts.cose).toBeDefined();
      expect(layouts.grid).toBeDefined();
      expect(layouts.circle).toBeDefined();
      expect(layouts.concentric).toBeDefined();
    });

    it('should have correct dagre layout config', () => {
      expect(layouts.dagre.name).toBe('dagre');
      expect(layouts.dagre.rankDir).toBe('LR');
    });

    it('should have correct cose layout config', () => {
      expect(layouts.cose.name).toBe('cose-bilkent');
    });

    it('should have correct grid layout config', () => {
      expect(layouts.grid.name).toBe('grid');
    });

    it('should have correct circle layout config', () => {
      expect(layouts.circle.name).toBe('circle');
    });

    it('should have correct concentric layout config', () => {
      expect(layouts.concentric.name).toBe('concentric');
    });
  });

  describe('getLayoutConfig', () => {
    it('should return correct config for each layout type', () => {
      const layoutTypes: LayoutType[] = ['dagre', 'cose', 'grid', 'circle', 'concentric'];
      
      for (const layoutType of layoutTypes) {
        const config = getLayoutConfig(layoutType);
        expect(config).toBeDefined();
        expect(config.name).toBeDefined();
      }
    });
  });
});
