/**
 * LayerSelectorV2 Component
 * 
 * An improved version of the Layer Selector component
 * that uses the useTaxonomy hook for more reliable layer selection.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { logger } from '../../utils/logger';
import LayerIcon from '../common/LayerIcon';
import '../../styles/LayerSelector.css';

interface LayerSelectorV2Props {
  onLayerSelect: (layer: string, isDoubleClick?: boolean) => void;
  onLayerDoubleClick?: (layer: string) => void;
  selectedLayer: string;
}

const LayerSelectorV2: React.FC<LayerSelectorV2Props> = ({
  onLayerSelect,
  onLayerDoubleClick,
  selectedLayer: initialLayer
}) => {
  const { layers, selectedLayer, selectLayer } = useTaxonomy({ autoLoad: false });
  const [activeLayer, setActiveLayer] = useState<string | null>(initialLayer || null);
  
  // When initialLayer changes, update the active layer
  useEffect(() => {
    if (initialLayer && initialLayer !== activeLayer) {
      setActiveLayer(initialLayer);
      selectLayer(initialLayer);
    }
  }, [initialLayer, activeLayer, selectLayer]);
  
  // Handle layer selection
  const handleLayerSelect = useCallback((layer: string) => {
    logger.info(`Layer selected: ${layer}`);
    setActiveLayer(layer);
    selectLayer(layer);
    onLayerSelect(layer, false);
  }, [selectLayer, onLayerSelect]);

  // Handle layer double-click
  const handleLayerDoubleClick = useCallback((layer: string) => {
    logger.info(`Layer double-clicked: ${layer}`);
    setActiveLayer(layer);
    selectLayer(layer);
    onLayerSelect(layer, true);

    if (onLayerDoubleClick) {
      onLayerDoubleClick(layer);
    }
  }, [selectLayer, onLayerSelect, onLayerDoubleClick]);
  
  // Get layer name
  const getLayerName = useCallback((layer: string) => {
    switch (layer) {
      case 'G': return 'Song';
      case 'S': return 'Star';
      case 'L': return 'Look';
      case 'M': return 'Moves';
      case 'W': return 'World';
      case 'B': return 'Branded';
      case 'P': return 'Personalize';
      case 'T': return 'Training Data';
      case 'C': return 'Composites';
      case 'R': return 'Rights';
      default: return layer;
    }
  }, []);
  
  // Get layer description
  const getLayerDescription = useCallback((layer: string) => {
    switch (layer) {
      case 'G': return 'Music tracks and audio';
      case 'S': return 'Performance avatars';
      case 'L': return 'Costumes & styling';
      case 'M': return 'Choreography';
      case 'W': return 'Environments';
      case 'B': return 'Virtual product placement';
      case 'P': return 'User-uploaded customizations';
      case 'T': return 'Datasets for AI training';
      case 'C': return 'Aggregated multi-layer assets';
      case 'R': return 'Provenance and rights tracking';
      default: return '';
    }
  }, []);
  
  // Get layer icon
  const getLayerIcon = useCallback((layer: string) => {
    // Emoji fallbacks if icons are not available
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
    
    return layerEmojis[layer] || '🎮';
  }, []);
  
  // Log when layers changes
  useEffect(() => {
    logger.info('Available layers for selection:', layers.join(', '));
  }, [layers]);
  
  return (
    <div className="layer-selector">
      <h3>Select Layer</h3>
      <div className="layer-grid">
        {layers.map((layer) => {
          const isActive = activeLayer === layer;
          const layerEmoji = getLayerIcon(layer);
          const layerName = getLayerName(layer);
          const layerDescription = getLayerDescription(layer);
          
          return (
            <div
              key={layer}
              className={`layer-card ${isActive ? 'selected' : ''}`}
              onClick={() => handleLayerSelect(layer)}
              onDoubleClick={() => handleLayerDoubleClick(layer)}
              tabIndex={0}
              role="button"
              aria-pressed={isActive}
              data-testid={`layer-card-${layer}`}
            >
              <div className="layer-header">
                <span className="layer-code">{layer}</span>
                <div className="layer-card-icon">
                  <LayerIcon layer={layer} size="large" />
                </div>
              </div>
              <div className="layer-content">
                <h4>{layerName}</h4>
                <p>{layerDescription}</p>
              </div>
              {/* Visual indicator for clickability */}
              <div className="layer-clickable-hint">
                Click to select
              </div>
            </div>
          );
        })}
      </div>
      
      {activeLayer && (
        <div className="layer-selection-info">
          <p>Selected Layer: <strong>{activeLayer}</strong> ({getLayerName(activeLayer)})</p>
          <p className="layer-selection-hint">
            {onLayerDoubleClick ? 'Double-click to proceed to the next step' : 'Click on a different layer to change selection'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LayerSelectorV2;