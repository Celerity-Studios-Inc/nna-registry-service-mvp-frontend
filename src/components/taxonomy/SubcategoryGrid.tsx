import React from 'react';
import TaxonomyItem from './TaxonomyItem';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';

interface SubcategoryGridProps {
  layer: string;
  category: string;
  selectedSubcategory: string;
  onSubcategorySelect: (subcategory: string, isDoubleClick?: boolean) => void;
}

/**
 * Component for rendering a grid of subcategories for a selected layer and category
 * This is a pure presentational component that uses the TaxonomyDataProvider
 */
const SubcategoryGrid: React.FC<SubcategoryGridProps> = ({
  layer,
  category,
  selectedSubcategory,
  onSubcategorySelect
}) => {
  // Get taxonomy data from context
  const { getSubcategories } = useTaxonomyData();

  // Get subcategories for the selected layer and category
  const subcategories = getSubcategories(layer, category);

  // No subcategories available
  if (subcategories.length === 0) {
    return (
      <div className="taxonomy-empty">
        <div className="empty-message">
          No subcategories found for {layer}.{category}
        </div>
      </div>
    );
  }

  // Handle subcategory selection with check for Star+POP combination
  const handleSubcategorySelect = (subcategory: string, isDoubleClick?: boolean) => {
    // Special log for Star+POP selections for debugging
    if (layer === 'S' && category === 'POP') {
      console.log(
        `[SUBCATEGORY SELECT] Selecting S.POP.${subcategory} (double-click: ${Boolean(isDoubleClick)})`
      );
    }
    
    // Call the parent handler
    onSubcategorySelect(subcategory, isDoubleClick);
  };

  return (
    <>
      <div className="taxonomy-grid">
        {subcategories.map(subcategory => (
          <TaxonomyItem
            key={subcategory.code}
            item={subcategory}
            isActive={selectedSubcategory === subcategory.code}
            onClick={() => handleSubcategorySelect(subcategory.code)}
            onDoubleClick={() => handleSubcategorySelect(subcategory.code, true)}
            dataTestId={`subcategory-${subcategory.code}`}
          />
        ))}
      </div>
      
      {/* Show hint about double-click when no selection is made yet */}
      {!selectedSubcategory && (
        <div className="subcategory-hint">
          Tip: Double-click a subcategory to select and continue to the next step
        </div>
      )}
    </>
  );
};

export default React.memo(SubcategoryGrid);