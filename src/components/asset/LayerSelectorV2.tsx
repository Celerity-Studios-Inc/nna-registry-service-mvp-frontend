/**
 * LayerSelectorV2 Component
 *
 * An improved version of the Layer Selector component
 * that uses the useTaxonomy hook for more reliable layer selection.
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { logger, LogLevel, debugLog } from '../../utils/logger';
import LayerIcon from '../common/LayerIcon';
import '../../styles/LayerSelector.css';

interface LayerSelectorV2Props {
  onLayerSelect: (layer: string, isDoubleClick?: boolean) => void;
  onLayerDoubleClick?: (layer: string) => void;
  selectedLayer: string;
}

const LayerSelectorV2: React.FC<LayerSelectorV2Props> = React.memo(({
  onLayerSelect,
  onLayerDoubleClick,
  selectedLayer: initialLayer,
}) => {
  const { layers, selectedLayer, selectLayer } = useTaxonomy({
    autoLoad: false,
  });
  const [activeLayer, setActiveLayer] = useState<string | null>(
    initialLayer || null
  );

  // When initialLayer changes, update the active layer
  useEffect(() => {
    if (initialLayer && initialLayer !== activeLayer) {
      setActiveLayer(initialLayer);
      selectLayer(initialLayer);
    }
  }, [initialLayer, activeLayer, selectLayer]);

  // Handle layer selection
  const handleLayerSelect = useCallback(
    (layer: string) => {
      logger.info(`Layer selected: ${layer}`);
      setActiveLayer(layer);
      selectLayer(layer);

      // Make sure to pass isDoubleClick=false explicitly
      debugLog(
        `[LayerSelectorV2] Sending layer selection to parent: ${layer}, isDoubleClick=false`
      );
      onLayerSelect(layer, false);
    },
    [selectLayer, onLayerSelect]
  );

  // Handle layer double-click
  const handleLayerDoubleClick = useCallback(
    (layer: string) => {
      logger.info(`Layer double-clicked: ${layer}`);
      setActiveLayer(layer);
      selectLayer(layer);

      // IMPORTANT: Call the parent's onLayerSelect with isDoubleClick=true
      // This handles the selection but doesn't auto-advance steps
      debugLog(
        `[LayerSelectorV2] Sending layer double-click to parent: ${layer}, isDoubleClick=true`
      );
      onLayerSelect(layer, true);

      // FIXED: Larger delay before calling onLayerDoubleClick to ensure state updates first
      // Increased from 50ms to 100ms to ensure there's enough time for state propagation
      setTimeout(() => {
        // Also call the optional onLayerDoubleClick callback if provided
        if (onLayerDoubleClick) {
          debugLog(`[LayerSelectorV2] Calling onLayerDoubleClick for ${layer}`);
          // Call the double-click handler which should now navigate to the next step
          onLayerDoubleClick(layer);
        } else {
          debugLog(`[LayerSelectorV2] No onLayerDoubleClick provided for ${layer}`);
        }
      }, 100);
    },
    [selectLayer, onLayerSelect, onLayerDoubleClick]
  );

  // Get layer name - memoized since layer names are static
  const getLayerName = useMemo(() => {
    const layerNames: Record<string, string> = {
      'G': 'Song',
      'S': 'Star',
      'L': 'Look',
      'M': 'Moves',
      'W': 'World',
      'B': 'Branded',
      'P': 'Personalize',
      'T': 'Training Data',
      'C': 'Composites',
      'R': 'Rights'
    };
    
    return (layer: string) => layerNames[layer] || layer;
  }, []);

  // Get layer description - memoized since descriptions are static
  const getLayerDescription = useMemo(() => {
    const layerDescriptions: Record<string, string> = {
      'G': 'Music tracks and audio',
      'S': 'Performance avatars',
      'L': 'Costumes & styling',
      'M': 'Choreography',
      'W': 'Environments',
      'B': 'Virtual product placement',
      'P': 'User-uploaded customizations',
      'T': 'Datasets for AI training',
      'C': 'Aggregated multi-layer assets',
      'R': 'Provenance and rights tracking'
    };
    
    return (layer: string) => layerDescriptions[layer] || '';
  }, []);

  // Get layer icon - memoized since icons are static
  const getLayerIcon = useMemo(() => {
    // Emoji fallbacks if icons are not available
    const layerEmojis: Record<string, string> = {
      'G': '🎵', // Song
      'S': '🌟', // Star
      'L': '👚', // Look
      'M': '💃', // Moves
      'W': '🌍', // World
      'B': '🏷️', // Branded
      'P': '🔧', // Personalize
      'T': '🧠', // Training Data
      'C': '🧩', // Composites
      'R': '📜', // Rights
    };
    
    return (layer: string) => layerEmojis[layer] || '🎮';
  }, []);

  // Log when layers changes
  useEffect(() => {
    logger.info(`Available layers for selection: ${layers.join(', ')}`);
  }, [layers]);

  return (
    <div className="layer-selector">
      <h3>Select Layer</h3>
      <div className="layer-grid">
        {layers.map(layer => {
          const isActive = activeLayer === layer;
          const layerEmoji = getLayerIcon(layer);
          const layerName = getLayerName(layer);
          const layerDescription = getLayerDescription(layer);

          return (
            <div
              key={layer}
              className={`layer-card ${isActive ? 'selected' : ''}`}
              onClick={() => handleLayerSelect(layer)}
              onDoubleClick={e => {
                // Prevent event bubbling to avoid triggering click right after double-click
                e.preventDefault();
                e.stopPropagation();
                handleLayerDoubleClick(layer);
              }}
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
              <div className="layer-clickable-hint">Click to select</div>
            </div>
          );
        })}
      </div>

      {activeLayer && (
        <div className="layer-selection-info">
          <p>
            Selected Layer: <strong>{activeLayer}</strong> (
            {getLayerName(activeLayer)})
          </p>
          <p className="layer-selection-hint">
            {onLayerDoubleClick
              ? 'Double-click to proceed to the next step'
              : 'Click on a different layer to change selection'}
          </p>
        </div>
      )}
    </div>
  );
});

// Use a displayName for easier debugging
LayerSelectorV2.displayName = 'LayerSelectorV2';

export default LayerSelectorV2;
