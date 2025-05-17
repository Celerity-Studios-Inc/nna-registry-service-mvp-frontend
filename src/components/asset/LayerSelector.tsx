import React, { useState, useEffect } from 'react';
import { taxonomyService } from '../../services/simpleTaxonomyService';
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
  onLayerDoubleClick?: (layer: string) => void;
}

const LayerSelector: React.FC<LayerSelectorProps> = ({ selectedLayer, onLayerSelect, onLayerDoubleClick }) => {
  // Add internal state to track selection
  const [internalSelectedLayer, setSelectedLayer] = useState<string>(selectedLayer);
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

  // Enhanced click handler with local state update
  const handleLayerClick = (layerCode: string) => {
    console.log('Layer card clicked:', layerCode);
    setSelectedLayer(layerCode);
    onLayerSelect(layerCode);
  };

  // Separate double-click handler to ensure it works properly
  const handleLayerDoubleClick = (layerCode: string) => {
    console.log('Layer card double-clicked:', layerCode);
    setSelectedLayer(layerCode);
    onLayerSelect(layerCode, true);
    onLayerDoubleClick && onLayerDoubleClick(layerCode);
  };

  // Function to get layer icon or emoji fallback
  const getLayerIcon = (layerCode: string) => {
    // Since we don't have the actual icon files, we'll use emoji fallbacks
    // In a production app, you'd use actual icon files
    const layerEmojis: {[key: string]: string} = {
      'G': '🎵', // Song
      'S': '🌟', // Star
      'L': '👚', // Look
      'M': '💃', // Moves
      'W': '🌍', // World
      'B': '🏷️', // Branded
      'P': '🔧', // Personalize
      'T': '🧠', // Training Data
      'C': '🧩', // Composites
      'R': '📜'  // Rights
    };

    // Return the emoji fallback
    return layerEmojis[layerCode] || '🎮';
  };

  // Add useEffect hooks for debugging and syncing with props

  // Sync internal state with external selectedLayer prop
  useEffect(() => {
    if (selectedLayer !== internalSelectedLayer) {
      setSelectedLayer(selectedLayer);
    }
  }, [selectedLayer, internalSelectedLayer]);

  // Debug on component mount
  useEffect(() => {
    console.log('LayerSelector mounted with layers:', layers.map(l => l.code).join(', '));
    console.log('Initial selected layer:', selectedLayer);

    // Verify taxonomy service is available
    const serviceAvailable = !!taxonomyService;
    console.log('Taxonomy service available:', serviceAvailable);

    // Log available layer emojis
    layers.forEach(layer => {
      const emoji = getLayerIcon(layer.code);
      console.log(`Layer ${layer.code} emoji: ${emoji}`);
    });
  }, []);

  // Log when selection changes
  useEffect(() => {
    console.log('Selected layer changed to:', internalSelectedLayer);
  }, [internalSelectedLayer]);

  // Force debug logging for clicked layers
  console.log("LAYERS FOR SELECTION:", layers.map(l => l.code).join(', '));

  return (
    <div className="layer-selector">
      <h3>Select Layer</h3>
      <div className="layer-grid">
        {layers.map((layer) => {
          // Get icon if available
          const iconPath = getLayerIcon(layer.code);

          return (
            <div
              key={layer.code}
              className={`layer-card ${internalSelectedLayer === layer.code ? 'selected' : ''}`}
              onClick={() => handleLayerClick(layer.code)}
              onDoubleClick={() => handleLayerDoubleClick(layer.code)}
              // Add tabIndex and role for better accessibility
              tabIndex={0}
              role="button"
              aria-pressed={internalSelectedLayer === layer.code}
              style={{
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: internalSelectedLayer === layer.code ? '3px solid #1976d2' : '1px solid #ddd',
                backgroundColor: internalSelectedLayer === layer.code ? '#f0f7ff' : 'white',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Visual indicator for clickability */}
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  fontSize: '12px',
                  color: '#666',
                  fontStyle: 'italic'
                }}
              >
                Click to select
              </div>

              <div className="layer-header">
                <span className="layer-code">{layer.code}</span>
                <span className="layer-numeric">{layer.numericCode}</span>
                <span className="layer-icon" style={{ fontSize: '24px', marginLeft: '8px' }}>
                  {iconPath} {/* Now using emoji fallbacks */}
                </span>
              </div>

              <div className="layer-content">
                <h4>{layer.name}</h4>
                <p>{layer.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LayerSelector;