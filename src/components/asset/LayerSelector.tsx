import React from 'react';
import '../../styles/LayerSelector.css';

interface LayerInfo {
  code: string;
  name: string;
  description: string;
  numericCode: string;
}

interface LayerSelectorProps {
  selectedLayer: string;
  onLayerSelect: (layer: string, isDoubleClick?: boolean) => void;
}

const LayerSelector: React.FC<LayerSelectorProps> = ({ selectedLayer, onLayerSelect }) => {
  const layers: LayerInfo[] = [
    { code: 'G', name: 'Song', description: 'Music tracks and audio', numericCode: '1' },
    { code: 'S', name: 'Star', description: 'Performance avatars', numericCode: '2' },
    { code: 'L', name: 'Look', description: 'Costumes & styling', numericCode: '3' },
    { code: 'M', name: 'Moves', description: 'Choreography', numericCode: '4' },
    { code: 'W', name: 'World', description: 'Environments', numericCode: '5' },
    { code: 'B', name: 'Branded', description: 'Virtual product placement', numericCode: '6' },
    { code: 'P', name: 'Personalize', description: 'User-uploaded customizations', numericCode: '7' },
    { code: 'T', name: 'Training_Data', description: 'Datasets for AI training', numericCode: '8' },
    { code: 'C', name: 'Composites', description: 'Aggregated multi-layer assets', numericCode: '9' },
    { code: 'R', name: 'Rights', description: 'Provenance and rights tracking', numericCode: '10' }
  ];

  // Enhanced click handler with explicit double-click support
  const handleLayerClick = (layerCode: string) => {
    console.log('Layer card clicked:', layerCode);
    onLayerSelect(layerCode);
  };

  // Separate double-click handler to ensure it works properly
  const handleLayerDoubleClick = (layerCode: string) => {
    console.log('Layer card DOUBLE-clicked:', layerCode);
    // Call with true flag to indicate double-click
    onLayerSelect(layerCode, true);
  };

  // Force debug logging for clicked layers
  console.log("LAYERS FOR SELECTION:", layers.map(l => l.code).join(', '));

  return (
    <div className="layer-selector">
      <h3>Select Layer</h3>
      <div className="layer-grid">
        {layers.map((layer) => (
          <div
            key={layer.code}
            className={`layer-card ${selectedLayer === layer.code ? 'selected' : ''}`}
            onClick={() => handleLayerClick(layer.code)}
            onDoubleClick={() => handleLayerDoubleClick(layer.code)}
            // Add tabIndex and role for better accessibility
            tabIndex={0}
            role="button"
            aria-pressed={selectedLayer === layer.code}
            style={{
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: selectedLayer === layer.code ? '2px solid #1976d2' : '1px solid #ddd'
            }}
          >
            <div className="layer-header">
              <span className="layer-code">{layer.code}</span>
              <span className="layer-numeric">{layer.numericCode}</span>
            </div>
            <div className="layer-content">
              <h4>{layer.name}</h4>
              <p>{layer.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerSelector;