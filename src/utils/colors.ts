import type { Language } from '../types';

/**
 * Color mapping for programming languages
 */
export const languageColors: Record<Language, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3776ab',
  Java: '#ed8b00',
  C: '#a8b9cc',
  Cpp: '#00599c',
  Go: '#00add8',
  Rust: '#dea584',
  Php: '#777bb4',
  Ruby: '#cc342d',
  Unknown: '#9ca3af',
};

/**
 * Get the color for a language
 */
export function getLanguageColor(language: Language): string {
  return languageColors[language] || languageColors.Unknown;
}

/**
 * Node styling based on metrics
 */
export const nodeStyles = {
  // Default node style
  default: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  // Hub node style (imported by many)
  hub: {
    width: 50,
    height: 50,
    borderWidth: 3,
    borderColor: '#ef4444',
  },
  // Orphan node style (not imported by anyone)
  orphan: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: '#6b7280',
    opacity: 0.6,
  },
  // Selected node style
  selected: {
    borderWidth: 4,
    borderColor: '#3b82f6',
  },
  // Cycle node style
  inCycle: {
    borderWidth: 3,
    borderColor: '#f59e0b',
  },
};

/**
 * Edge styling
 */
export const edgeStyles = {
  default: {
    width: 1.5,
    color: '#6b7280',
    opacity: 0.5,
    curveStyle: 'bezier',
  },
  highlighted: {
    width: 3,
    color: '#3b82f6',
    opacity: 1,
  },
  cycle: {
    width: 2,
    color: '#f59e0b',
    opacity: 0.8,
    lineStyle: 'dashed',
  },
};
