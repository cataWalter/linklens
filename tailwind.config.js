/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Language-specific colors for the graph
        javascript: '#f7df1e',
        typescript: '#3178c6',
        python: '#3776ab',
        java: '#ed8b00',
        c: '#a8b9cc',
        cpp: '#00599c',
        go: '#00add8',
        rust: '#dea584',
        php: '#777bb4',
        ruby: '#cc342d',
        // UI colors
        graph: {
          bg: 'var(--graph-bg)',
          node: 'var(--graph-node)',
          edge: 'var(--graph-edge)',
          highlight: 'var(--graph-highlight)',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
