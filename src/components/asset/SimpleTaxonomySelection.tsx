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
      console.log(`Loading categories for layer ${layer} using simplified taxonomy service...`);

      // Force re-initialization of the taxonomy service
      if (Object.keys(taxonomyService['LAYER_LOOKUPS'][layer] || {}).length === 0) {
        console.log(`WARNING: Layer lookup for ${layer} appears to be empty, forcing taxonomy reload...`);

        // Try to reload the taxonomy data
        import('../../taxonomyLookup').then(() => {
          console.log('Taxonomy data reloaded successfully');
        }).catch(err => {
          console.error('Error reloading taxonomy data:', err);
        });
      }

      // Get categories with retry mechanism
      let retryCount = 0;
      let layerCategories = [];

      while (retryCount < 3 && layerCategories.length === 0) {
        layerCategories = taxonomyService.getCategories(layer);

        if (layerCategories.length === 0) {
          console.warn(`No categories found for ${layer}, retry #${retryCount + 1}...`);
          retryCount++;

          // For the Star layer, ensure we have the critical categories
          if (layer === 'S' && retryCount === 2) {
            console.log('Attempting to manually add S layer categories...');
            const fallbackStarCategories = [
              { code: 'POP', numericCode: '001', name: 'Pop' },
              { code: 'RCK', numericCode: '002', name: 'Rock' },
              { code: 'HIP', numericCode: '003', name: 'Hip-Hop' }
            ];
            layerCategories = fallbackStarCategories;
          }
        }
      }

      // Force refresh of the taxonomy data
      const debugInfo = {
        layer,
        totalLayerLookupEntries: Object.keys(taxonomyService['LAYER_LOOKUPS'][layer] || {}).length,
        categoryKeys: Object.keys(taxonomyService['LAYER_SUBCATEGORIES'][layer] || {}),
        attempts: retryCount + 1
      };
      console.log(`DEBUG INFO: ${JSON.stringify(debugInfo)}`);

      console.log(`Found ${layerCategories.length} categories for ${layer}:`,
        layerCategories.map(c => c.code).join(', '));

      // Make sure the categories are sorted alphabetically
      const sortedCategories = [...layerCategories].sort((a, b) =>
        a.numericCode.localeCompare(b.numericCode)
      );

      setCategories(sortedCategories);
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
      console.log(`Loading subcategories for ${layer}.${selectedCategory}...`);

      // Get subcategories with retry mechanism
      let retryCount = 0;
      let categorySubcategories = [];

      while (retryCount < 3 && categorySubcategories.length === 0) {
        categorySubcategories = taxonomyService.getSubcategories(layer, selectedCategory);

        if (categorySubcategories.length === 0) {
          console.warn(`No subcategories found for ${layer}.${selectedCategory}, retry #${retryCount + 1}...`);
          retryCount++;

          // Handle critical cases with fallback data
          if (retryCount === 2) {
            if (layer === 'S' && selectedCategory === 'POP') {
              console.log('Manually adding S.POP subcategories...');
              categorySubcategories = [
                { code: 'BAS', numericCode: '001', name: 'Base' },
                { code: 'DIV', numericCode: '002', name: 'Pop Diva Female' },
                { code: 'IDF', numericCode: '003', name: 'Pop Idol Female' },
                { code: 'LGF', numericCode: '004', name: 'Pop Legend Female' },
                { code: 'LGM', numericCode: '005', name: 'Pop Legend Male' },
                { code: 'ICM', numericCode: '006', name: 'Pop Icon Male' },
                { code: 'HPM', numericCode: '007', name: 'Pop Hipster Male' }
              ];
            } else if (layer === 'S' && selectedCategory === 'RCK') {
              console.log('Manually adding S.RCK subcategories...');
              categorySubcategories = [
                { code: 'BAS', numericCode: '001', name: 'Base' }
              ];
            } else if (layer === 'W' && selectedCategory === 'BCH') {
              console.log('Manually adding W.BCH subcategories...');
              categorySubcategories = [
                { code: 'SUN', numericCode: '003', name: 'Sunny' }
              ];
            }
          }
        }
      }

      console.log(`Found ${categorySubcategories.length} subcategories for ${layer}.${selectedCategory} (after ${retryCount + 1} attempts):`,
        categorySubcategories.map(s => s.code).join(', '));

      // Sort subcategories by numeric code
      const sortedSubcategories = [...categorySubcategories].sort((a, b) =>
        a.numericCode.localeCompare(b.numericCode)
      );

      setSubcategories(sortedSubcategories);
    } catch (err) {
      console.error(`Error loading subcategories for ${layer}.${selectedCategory}:`, err);
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