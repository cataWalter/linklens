import React from 'react';
import { Filter, X, Search } from 'lucide-react';
import { useFilters } from '../hooks/useFilters';
import type { Language } from '../types';

const LANGUAGES: { value: Language; label: string; color: string }[] = [
  { value: 'JavaScript', label: 'JS', color: '#f7df1e' },
  { value: 'TypeScript', label: 'TS', color: '#3178c6' },
  { value: 'Python', label: 'PY', color: '#3776ab' },
  { value: 'Java', label: 'Java', color: '#ed8b00' },
  { value: 'C', label: 'C', color: '#a8b9cc' },
  { value: 'Cpp', label: 'C++', color: '#00599c' },
  { value: 'Go', label: 'Go', color: '#00add8' },
  { value: 'Rust', label: 'Rust', color: '#dea584' },
  { value: 'Php', label: 'PHP', color: '#777bb4' },
  { value: 'Ruby', label: 'Ruby', color: '#cc342d' },
];

export const FilterBar: React.FC = () => {
  const {
    filters,
    toggleLanguage,
    setSearchQuery,
    toggleShowOrphans,
    toggleShowHubs,
    toggleShowCycles,
    resetFilters,
  } = useFilters();

  const hasActiveFilters =
    filters.languages.length > 0 ||
    filters.searchQuery ||
    filters.showOrphans ||
    filters.showHubs ||
    filters.showCycles;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-b border-gray-700">
      <Filter size={16} className="text-gray-400" />

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search files..."
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 pr-3 py-1 bg-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Language filters */}
      <div className="flex items-center gap-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            onClick={() => toggleLanguage(lang.value)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              filters.languages.includes(lang.value)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            style={
              !filters.languages.includes(lang.value)
                ? { borderColor: lang.color, borderWidth: 1 }
                : {}
            }
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Toggle filters */}
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={toggleShowOrphans}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            filters.showOrphans
              ? 'bg-gray-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          Orphans
        </button>
        <button
          onClick={toggleShowHubs}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            filters.showHubs
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          Hubs
        </button>
        <button
          onClick={toggleShowCycles}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            filters.showCycles
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          Cycles
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="p-1 rounded-md hover:bg-gray-600 transition-colors"
            title="Reset filters"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
