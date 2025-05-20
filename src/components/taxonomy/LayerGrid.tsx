import React, { useMemo, useCallback } from 'react';
import TaxonomyItem from './TaxonomyItem';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
import { logger, LogLevel, debugLog, STANDARD_LAYER_NAMES, getStandardLayerName } from '../../utils/logger';
import { TaxonomyItem as TaxonomyItemType } from '../../providers/taxonomy/types';

interface LayerGridProps {
  selectedLayer: string;
  onLayerSelect: (layer: string) => void;
}

/**
 * Component for rendering a grid of layers
 * This is a pure presentational component that uses the TaxonomyDataProvider
 */
const LayerGrid: React.FC<LayerGridProps> = ({
  selectedLayer,
  onLayerSelect
}) => {
  // Get taxonomy data from context
  const { taxonomyData } = useTaxonomyData();
  
  // Use the standard layer name mapping from logger.ts
  const getLayerName = useMemo(() => {
    return (layer: string): string => {
      const name = STANDARD_LAYER_NAMES[layer];
      if (!name) {
        debugLog(`[LayerGrid] Missing name for layer ${layer}, using code as fallback`);
        return layer;
      }
      return name;
    };
  }, []);

  // Helper function to get layer numeric code - memoized to prevent recalculation
  const getLayerNumericCode = useMemo(() => {
    const codeMap: Record<string, string> = {
      'G': '1',
      'S': '2',
      'L': '3',
      'M': '4',
      'W': '5',
      'B': '6',
      'P': '7',
      'T': '8',
      'C': '9',
      'R': '10'
    };
    return (layer: string): string => codeMap[layer] || '';
  }, []);

  // Create layer items from taxonomy data - memoized to prevent recreation on rerenders
  const layers = useMemo(() => {
    if (!taxonomyData) {
      return [];
    }
    
    debugLog(`[LayerGrid] Creating layer items from taxonomy data`);
    // Define the required layers in a specific order
    const orderedLayers = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];
    
    // Filter to only include layers that exist in taxonomyData
    const layerItems = orderedLayers
      .filter(layer => taxonomyData.layers[layer])
      .map(layer => {
        // Create a simple item representation for each layer
        const layerName = getLayerName(layer);
        
        // Debug log to see what's happening
        console.log(`[LayerGrid] Creating layer: code=${layer}, name=${layerName}, numericCode=${getLayerNumericCode(layer)}`);
        
        return {
          code: layer,
          name: layerName,
          numericCode: getLayerNumericCode(layer)
        };
      });
      
    console.log('[LayerGrid] Final layer items:', layerItems);
    return layerItems;
  }, [taxonomyData, getLayerName, getLayerNumericCode]);

  // No taxonomy data available
  if (!taxonomyData) {
    return (
      <div className="taxonomy-empty">
        <div className="empty-message">No taxonomy data available</div>
      </div>
    );
  }

  return (
    <div className="taxonomy-grid" style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '12px',
      padding: '15px'
    }}>
      {layers.map((layer: TaxonomyItemType) => (
        <TaxonomyItem
          key={layer.code}
          item={layer}
          isActive={selectedLayer === layer.code}
          onClick={() => onLayerSelect(layer.code)}
          dataTestId={`layer-${layer.code}`}
        />
      ))}
    </div>
  );
};

// Create custom comparison function for memoization
const arePropsEqual = (prevProps: LayerGridProps, nextProps: LayerGridProps) => {
  return prevProps.selectedLayer === nextProps.selectedLayer;
};

// Add displayName for debugging
LayerGrid.displayName = 'LayerGrid';

export default React.memo(LayerGrid, arePropsEqual);