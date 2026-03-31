import React from 'react';
import { X, Github, Heart, Code, Zap, Shield } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="6" cy="6" r="3" stroke="white" strokeWidth="2" />
                <circle cx="18" cy="6" r="3" stroke="white" strokeWidth="2" />
                <circle cx="12" cy="18" r="3" stroke="white" strokeWidth="2" />
                <line x1="8" y1="7" x2="16" y2="7" stroke="white" strokeWidth="2" />
                <line x1="7" y1="8" x2="11" y2="16" stroke="white" strokeWidth="2" />
                <line x1="17" y1="8" x2="13" y2="16" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">LinkLens</h2>
              <p className="text-blue-200 text-sm">v1.0.0</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-300">
            A powerful desktop application that maps relationships between files in a project and visualizes the dependency graph interactively.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3">
            <Feature icon={<Code size={16} />} text="10+ Languages" />
            <Feature icon={<Zap size={16} />} text="Real-time Watch" />
            <Feature icon={<Shield size={16} />} text="Cycle Detection" />
            <Feature icon={<Heart size={16} />} text="Open Source" />
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 uppercase">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {['Rust', 'Tauri', 'React', 'TypeScript', 'Cytoscape.js', 'TailwindCSS'].map((tech) => (
                <span key={tech} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-3 pt-2">
            <a
              href="https://github.com/cataWalter/linklens"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
            >
              <Github size={16} />
              GitHub
            </a>
          </div>

          <p className="text-center text-xs text-gray-500">
            Made with ❤️ by cataWalter
          </p>
        </div>
      </div>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-lg">
    <div className="text-blue-400">{icon}</div>
    <span className="text-sm text-gray-300">{text}</span>
  </div>
);
