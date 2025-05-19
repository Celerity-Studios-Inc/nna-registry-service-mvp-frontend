import React from 'react';
import TaxonomyItem from './TaxonomyItem';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';

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

  // Get categories for selected layer
  const categories = getCategories(layer);

  // No categories available
  if (categories.length === 0) {
    return (
      <div className="taxonomy-empty">
        <div className="empty-message">No categories found for layer {layer}</div>
      </div>
    );
  }

  return (
    <div className="taxonomy-grid">
      {categories.map(category => (
        <TaxonomyItem
          key={category.code}
          item={category}
          isActive={selectedCategory === category.code}
          onClick={() => onCategorySelect(category.code)}
          dataTestId={`category-${category.code}`}
        />
      ))}
    </div>
  );
};

export default React.memo(CategoryGrid);