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
    console.log(`[CategoryGrid] Getting categories for layer ${layer}`);
    const cats = getCategories(layer);
    
    // Enhanced logging to help debug missing names
    console.log(`[CategoryGrid] Retrieved ${cats.length} categories for layer ${layer}`, cats);
    
    if (cats.length > 0) {
      for (const cat of cats) {
        console.log(`[CategoryGrid] Category: code=${cat.code}, name=${JSON.stringify(cat.name)}, numericCode=${cat.numericCode}`);
      }
    }
    
    return cats;
  }, [layer, getCategories]);

  // Memoize the category selection handler to maintain reference stability
  const handleCategorySelect = useCallback((categoryCode: string) => {
    debugLog(`[CategoryGrid] Category selected: ${categoryCode}`);
    logger.taxonomy(LogLevel.DEBUG, `Category selected: ${layer}.${categoryCode}`);
    onCategorySelect(categoryCode);
  }, [layer, onCategorySelect]);

  // No categories available
  if (categories.length === 0) {
    return (
      <div className="taxonomy-empty">
        <div className="empty-message">No categories found for layer {layer}</div>
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