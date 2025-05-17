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
  onLayerSelect: (layer: string) => void;
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

  return (
    <div className="layer-selector">
      <h3>Select Layer</h3>
      <div className="layer-grid">
        {layers.map((layer) => (
          <div
            key={layer.code}
            className={`layer-card ${selectedLayer === layer.code ? 'selected' : ''}`}
            onClick={() => onLayerSelect(layer.code)}
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