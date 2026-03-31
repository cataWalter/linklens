import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  cyRef: React.MutableRefObject<any>;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ cyRef }) => {
  const zoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom({ level: cyRef.current.zoom() * 1.2, renderedPosition: cyRef.current.center() });
    }
  };

  const zoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom({ level: cyRef.current.zoom() * 0.8, renderedPosition: cyRef.current.center() });
    }
  };

  const fit = () => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  };

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-1 bg-gray-800 rounded-lg p-1 shadow-lg">
      <button
        onClick={zoomIn}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Zoom In"
      >
        <ZoomIn size={18} />
      </button>
      <button
        onClick={zoomOut}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Zoom Out"
      >
        <ZoomOut size={18} />
      </button>
      <button
        onClick={fit}
        className="p-2 hover:bg-gray-700 rounded transition-colors"
        title="Fit to Screen"
      >
        <Maximize2 size={18} />
      </button>
    </div>
  );
};
