import React from 'react';
import TaxonomyItem from './TaxonomyItem';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
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

  // No taxonomy data available
  if (!taxonomyData) {
    return (
      <div className="taxonomy-empty">
        <div className="empty-message">No taxonomy data available</div>
      </div>
    );
  }

  // Create layer items from taxonomy data
  const layers = Object.keys(taxonomyData.layers).map(layer => {
    // Create a simple item representation for each layer
    return {
      code: layer,
      name: getLayerName(layer),
      numericCode: getLayerNumericCode(layer)
    };
  });

  // Helper function to get layer name
  function getLayerName(layer: string): string {
    const nameMap: Record<string, string> = {
      'S': 'Star',
      'W': 'World',
      'G': 'GGC',
      'L': 'Look',
      'M': 'Move',
      'B': 'Bio',
      'P': 'Prop',
      'T': 'Theme',
      'C': 'Character',
      'R': 'Rights'
    };
    return nameMap[layer] || layer;
  }

  // Helper function to get layer numeric code
  function getLayerNumericCode(layer: string): string {
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
    return codeMap[layer] || '';
  }

  return (
    <div className="taxonomy-grid">
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

export default React.memo(LayerGrid);