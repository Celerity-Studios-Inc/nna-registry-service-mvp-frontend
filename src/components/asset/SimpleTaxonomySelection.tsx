import React, { useEffect, useState } from 'react';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { TaxonomyItem } from '../../types/taxonomy.types';

interface SimpleTaxonomySelectionProps {
  layer: string;
  onCategorySelect: (category: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
  selectedCategory?: string;
  selectedSubcategory?: string;
}

const SimpleTaxonomySelection: React.FC<SimpleTaxonomySelectionProps> = ({
  layer,
  onCategorySelect,
  onSubcategorySelect,
  selectedCategory,
  selectedSubcategory
}) => {
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [subcategories, setSubcategories] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load categories when layer changes
  useEffect(() => {
    if (!layer) return;
    
    try {
      const layerCategories = taxonomyService.getCategories(layer);
      setCategories(layerCategories);
      setLoading(false);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Failed to load categories');
      setLoading(false);
    }
  }, [layer]);

  // Load subcategories when category changes
  useEffect(() => {
    if (!layer || !selectedCategory) {
      setSubcategories([]);
      return;
    }
    
    try {
      const categorySubcategories = taxonomyService.getSubcategories(layer, selectedCategory);
      setSubcategories(categorySubcategories);
    } catch (err) {
      console.error('Error loading subcategories:', err);
      setError('Failed to load subcategories');
    }
  }, [layer, selectedCategory]);

  if (loading) {
    return <div>Loading taxonomy data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="taxonomy-selection">
      <div className="taxonomy-section">
        <h3>Select Category</h3>
        <div className="taxonomy-grid">
          {categories.map(category => (
            <div
              key={category.code}
              className={`taxonomy-item ${selectedCategory === category.code ? 'selected' : ''}`}
              onClick={() => onCategorySelect(category.code)}
            >
              <div className="code">{category.code}</div>
              <div className="numeric-code">{category.numericCode}</div>
              <div className="name">{category.name}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedCategory && (
        <div className="taxonomy-section">
          <h3>Select Subcategory</h3>
          <div className="taxonomy-grid">
            {subcategories.map(subcategory => (
              <div
                key={subcategory.code}
                className={`taxonomy-item ${selectedSubcategory === subcategory.code ? 'selected' : ''}`}
                onClick={() => onSubcategorySelect(subcategory.code)}
              >
                <div className="code">{subcategory.code}</div>
                <div className="numeric-code">{subcategory.numericCode}</div>
                <div className="name">{subcategory.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleTaxonomySelection;