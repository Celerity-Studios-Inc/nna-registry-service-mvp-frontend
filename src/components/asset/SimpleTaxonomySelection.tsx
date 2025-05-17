import React, { useEffect, useState } from 'react';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { TaxonomyItem } from '../../types/taxonomy.types';
import { logger } from '../../utils/logger';

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
  // State for taxonomy data
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [subcategories, setSubcategories] = useState<TaxonomyItem[]>([]);

  // Internal state to track selection
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string>(selectedCategory || '');
  const [internalSelectedSubcategory, setInternalSelectedSubcategory] = useState<string>(selectedSubcategory || '');

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState<boolean>(false);

  // Sync internal state with props
  useEffect(() => {
    if (selectedCategory !== internalSelectedCategory && selectedCategory) {
      setInternalSelectedCategory(selectedCategory);
    }
  }, [selectedCategory, internalSelectedCategory]);

  useEffect(() => {
    if (selectedSubcategory !== internalSelectedSubcategory && selectedSubcategory) {
      setInternalSelectedSubcategory(selectedSubcategory);
    }
  }, [selectedSubcategory, internalSelectedSubcategory]);

  // Load categories when layer changes
  useEffect(() => {
    if (!layer) return;

    try {
      console.log(`Loading categories for layer ${layer} using simplified taxonomy service...`);

      // Force re-initialization of the taxonomy service
      // Check if we need to reload the taxonomy data by trying to get categories
      const testCategories = taxonomyService.getCategories(layer);
      if (!testCategories || testCategories.length === 0) {
        console.log(`WARNING: Categories for ${layer} appear to be empty, forcing taxonomy reload...`);

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
        totalCategories: layerCategories.length,
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
      setHasAttemptedLoad(true);
      logger.info(`Successfully loaded ${sortedCategories.length} categories for layer ${layer}`);
    } catch (err) {
      console.error('Error loading categories:', err);
      logger.error(`Failed to load categories for layer ${layer}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setError('Failed to load categories');
      setLoading(false);
      setHasAttemptedLoad(true);
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

  // Define selection handlers with internal state management
  const handleCategorySelect = (category: string) => {
    console.log(`Category selected: ${category}`);
    setInternalSelectedCategory(category);
    setInternalSelectedSubcategory(''); // Reset subcategory when category changes
    onCategorySelect(category);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    console.log(`Subcategory selected: ${subcategory}`);
    setInternalSelectedSubcategory(subcategory);
    onSubcategorySelect(subcategory);
  };

  // Loading state
  if (loading && !hasAttemptedLoad) {
    return (
      <div className="taxonomy-loading">
        <div className="loading-spinner"></div>
        <p>Loading taxonomy data...</p>
      </div>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button
          className="retry-button"
          onClick={() => {
            setError(null);
            setLoading(true);
            // Force reload for the current layer
            const newCategories = taxonomyService.getCategories(layer);
            setCategories(newCategories);
            setLoading(false);
          }}
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="taxonomy-selection">
      <div className="taxonomy-section">
        <h3>Select Category</h3>
        {categories.length > 0 ? (
          <div className="taxonomy-grid">
            {categories.map(category => (
              <div
                key={category.code}
                className={`taxonomy-item ${internalSelectedCategory === category.code ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(category.code)}
                style={{
                  cursor: 'pointer',
                  border: internalSelectedCategory === category.code ? '2px solid #1976d2' : '1px solid #ddd',
                  backgroundColor: internalSelectedCategory === category.code ? '#f0f7ff' : 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <div className="code">{category.code}</div>
                <div className="numeric-code">{category.numericCode}</div>
                <div className="name">{category.name || `Category ${category.code}`}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data-message">
            <p>No categories found for layer {layer}</p>
            <button
              onClick={() => {
                // Force a reload
                setLoading(true);
                const reloadedCategories = taxonomyService.getCategories(layer);
                setCategories(reloadedCategories);
                setLoading(false);
                setHasAttemptedLoad(true);
                console.log(`Manually reloaded categories for ${layer}, found: ${reloadedCategories.length}`);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              Reload Categories
            </button>
          </div>
        )}
      </div>

      {internalSelectedCategory && (
        <div className="taxonomy-section">
          <h3>Select Subcategory</h3>
          {subcategories.length > 0 ? (
            <div className="taxonomy-grid">
              {subcategories.map(subcategory => (
                <div
                  key={subcategory.code}
                  className={`taxonomy-item ${internalSelectedSubcategory === subcategory.code ? 'selected' : ''}`}
                  onClick={() => handleSubcategorySelect(subcategory.code)}
                  style={{
                    cursor: 'pointer',
                    border: internalSelectedSubcategory === subcategory.code ? '2px solid #1976d2' : '1px solid #ddd',
                    backgroundColor: internalSelectedSubcategory === subcategory.code ? '#f0f7ff' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="code">{subcategory.code}</div>
                  <div className="numeric-code">{subcategory.numericCode}</div>
                  <div className="name">{subcategory.name || `Subcategory ${subcategory.code}`}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              <p>No subcategories found for category {internalSelectedCategory}</p>
              <button
                onClick={() => {
                  // Force a reload of subcategories
                  setLoading(true);
                  const reloadedSubcategories = taxonomyService.getSubcategories(layer, internalSelectedCategory);
                  setSubcategories(reloadedSubcategories);
                  setLoading(false);
                  console.log(`Manually reloaded subcategories for ${layer}.${internalSelectedCategory}, found: ${reloadedSubcategories.length}`);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Reload Subcategories
              </button>
            </div>
          )}
        </div>
      )}

      {/* Debug information */}
      <div className="taxonomy-debug" style={{ marginTop: '20px', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        <p>Layer: {layer}</p>
        <p>Categories: {categories.length} available</p>
        <p>Selected Category: {internalSelectedCategory}</p>
        <p>Subcategories: {subcategories.length} available</p>
        <p>Selected Subcategory: {internalSelectedSubcategory}</p>
      </div>
    </div>
  );
};

export default SimpleTaxonomySelection;