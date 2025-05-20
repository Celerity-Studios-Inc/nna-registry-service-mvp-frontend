import React, { useMemo, useCallback } from 'react';
import TaxonomyItem from './TaxonomyItem';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
import { debugLog, logger, LogLevel } from '../../utils/logger';

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

  // Get subcategories for the selected layer and category - memoized to prevent recalculation
  const subcategories = useMemo(() => {
    debugLog(`[SubcategoryGrid] Getting subcategories for ${layer}.${category}`);
    return getSubcategories(layer, category);
  }, [layer, category, getSubcategories]);

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
  // Memoized to maintain reference stability between renders
  const handleSubcategorySelect = useCallback((subcategory: string, isDoubleClick?: boolean) => {
    // Special log for Star+POP selections for debugging
    const isStarPop = layer === 'S' && category === 'POP';
    if (isStarPop) {
      debugLog(
        `[SUBCATEGORY SELECT] Selecting S.POP.${subcategory} (double-click: ${Boolean(isDoubleClick)})`
      );
      logger.taxonomy(LogLevel.DEBUG, `Star Pop subcategory selected: ${subcategory}`);
    }
    
    // Call the parent handler
    onSubcategorySelect(subcategory, isDoubleClick);
  }, [layer, category, onSubcategorySelect]);

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

// Add custom comparison function for memoization that compares props deeply
const arePropsEqual = (prevProps: SubcategoryGridProps, nextProps: SubcategoryGridProps) => {
  return (
    prevProps.layer === nextProps.layer &&
    prevProps.category === nextProps.category &&
    prevProps.selectedSubcategory === nextProps.selectedSubcategory
    // onSubcategorySelect is intentionally excluded to avoid over-optimization
    // as function reference changes are handled by useCallback in parent components
  );
};

// Add displayName for debugging in React DevTools
SubcategoryGrid.displayName = 'SubcategoryGrid';

export default React.memo(SubcategoryGrid, arePropsEqual);