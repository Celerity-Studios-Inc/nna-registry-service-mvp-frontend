import React, { useMemo, useCallback } from 'react';
import TaxonomyItem from './TaxonomyItem';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
import { debugLog, logger, LogLevel } from '../../utils/logger';

interface CategoryGridProps {
  layer: string;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

/**
 * Component for rendering a grid of categories for a selected layer
 * This is a pure presentational component that uses the TaxonomyDataProvider
 */
const CategoryGrid: React.FC<CategoryGridProps> = ({
  layer,
  selectedCategory,
  onCategorySelect
}) => {
  // Get taxonomy data from context
  const { getCategories } = useTaxonomyData();

  // Get categories for selected layer - memoized to prevent recalculation
  const categories = useMemo(() => {
    debugLog(`[CategoryGrid] Getting categories for layer ${layer}`);
    return getCategories(layer);
  }, [layer, getCategories]);

  // No categories available
  if (categories.length === 0) {
    return (
      <div className="taxonomy-empty">
        <div className="empty-message">No categories found for layer {layer}</div>
      </div>
    );
  }

  // Memoize the category selection handler to maintain reference stability
  const handleCategorySelect = useCallback((categoryCode: string) => {
    debugLog(`[CategoryGrid] Category selected: ${categoryCode}`);
    logger.taxonomy(LogLevel.DEBUG, `Category selected: ${layer}.${categoryCode}`);
    onCategorySelect(categoryCode);
  }, [layer, onCategorySelect]);

  return (
    <div className="taxonomy-grid">
      {categories.map(category => (
        <TaxonomyItem
          key={category.code}
          item={category}
          isActive={selectedCategory === category.code}
          onClick={() => handleCategorySelect(category.code)}
          dataTestId={`category-${category.code}`}
        />
      ))}
    </div>
  );
};

// Add custom comparison function for memoization
const arePropsEqual = (prevProps: CategoryGridProps, nextProps: CategoryGridProps) => {
  return (
    prevProps.layer === nextProps.layer &&
    prevProps.selectedCategory === nextProps.selectedCategory
    // onCategorySelect is intentionally excluded as it should be wrapped in useCallback by parent
  );
};

// Add displayName for debugging in React DevTools
CategoryGrid.displayName = 'CategoryGrid';

export default React.memo(CategoryGrid, arePropsEqual);