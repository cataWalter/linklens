import { describe, it, expect } from 'vitest';
import { languageColors, getLanguageColor, nodeStyles, edgeStyles } from '../../src/utils/colors';

describe('colors utility', () => {
  describe('languageColors', () => {
    it('should have colors for all supported languages', () => {
      expect(languageColors.JavaScript).toBe('#f7df1e');
      expect(languageColors.TypeScript).toBe('#3178c6');
      expect(languageColors.Python).toBe('#3776ab');
      expect(languageColors.Java).toBe('#ed8b00');
      expect(languageColors.C).toBe('#a8b9cc');
      expect(languageColors.Cpp).toBe('#00599c');
      expect(languageColors.Go).toBe('#00add8');
      expect(languageColors.Rust).toBe('#dea584');
      expect(languageColors.Php).toBe('#777bb4');
      expect(languageColors.Ruby).toBe('#cc342d');
      expect(languageColors.Unknown).toBe('#9ca3af');
    });
  });

  describe('getLanguageColor', () => {
    it('should return correct color for a language', () => {
      expect(getLanguageColor('JavaScript')).toBe('#f7df1e');
      expect(getLanguageColor('TypeScript')).toBe('#3178c6');
      expect(getLanguageColor('Unknown')).toBe('#9ca3af');
    });
  });

  describe('nodeStyles', () => {
    it('should have default node style', () => {
      expect(nodeStyles.default.width).toBe(40);
      expect(nodeStyles.default.height).toBe(40);
      expect(nodeStyles.default.borderWidth).toBe(2);
    });

    it('should have hub node style', () => {
      expect(nodeStyles.hub.width).toBe(50);
      expect(nodeStyles.hub.borderColor).toBe('#ef4444');
    });

    it('should have orphan node style', () => {
      expect(nodeStyles.orphan.opacity).toBe(0.6);
    });

    it('should have selected node style', () => {
      expect(nodeStyles.selected.borderColor).toBe('#3b82f6');
    });

    it('should have cycle node style', () => {
      expect(nodeStyles.inCycle.borderColor).toBe('#f59e0b');
    });
  });

  describe('edgeStyles', () => {
    it('should have default edge style', () => {
      expect(edgeStyles.default.width).toBe(1.5);
      expect(edgeStyles.default.curveStyle).toBe('bezier');
    });

    it('should have highlighted edge style', () => {
      expect(edgeStyles.highlighted.width).toBe(3);
      expect(edgeStyles.highlighted.opacity).toBe(1);
    });

    it('should have cycle edge style', () => {
      expect(edgeStyles.cycle.lineStyle).toBe('dashed');
    });
  });
});
