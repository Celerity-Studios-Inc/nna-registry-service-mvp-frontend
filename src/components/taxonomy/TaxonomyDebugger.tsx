import React, { useState } from 'react';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
import './TaxonomyDebugger.css';

/**
 * A debug component to test and visualize the TaxonomyDataProvider
 */
const TaxonomyDebugger: React.FC = () => {
  const {
    taxonomyData,
    loadingState,
    error,
    lastUpdated,
    getCategories,
    getSubcategories,
    refreshTaxonomyData
  } = useTaxonomyData();

  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  // Derived data based on selections
  const categories = selectedLayer ? getCategories(selectedLayer) : [];
  const subcategories = selectedLayer && selectedCategory 
    ? getSubcategories(selectedLayer, selectedCategory) 
    : [];

  // Handle layer selection
  const handleLayerSelect = (layer: string) => {
    setSelectedLayer(layer);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
  };

  // Format a date from timestamp
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  // Test load state rendering
  if (loadingState === 'loading') {
    return (
      <div className="taxonomy-debugger loading">
        <h2>Taxonomy Debugger</h2>
        <div className="loading-indicator">
          Loading taxonomy data...
        </div>
      </div>
    );
  }

  // Test error state rendering
  if (loadingState === 'error' || error) {
    return (
      <div className="taxonomy-debugger error">
        <h2>Taxonomy Debugger</h2>
        <div className="error-message">
          Error loading taxonomy data: {error?.message || 'Unknown error'}
        </div>
        <button onClick={() => refreshTaxonomyData()}>
          Retry Loading
        </button>
      </div>
    );
  }

  // Main debugger UI
  return (
    <div className="taxonomy-debugger">
      <h2>Taxonomy Debugger</h2>
      
      <div className="status-info">
        <div>
          <strong>Loading State:</strong> {loadingState}
        </div>
        <div>
          <strong>Last Updated:</strong> {formatDate(lastUpdated)}
        </div>
        <div>
          <strong>Available Layers:</strong> {taxonomyData 
            ? Object.keys(taxonomyData.layers).join(', ') 
            : 'None'
          }
        </div>
        <button onClick={() => refreshTaxonomyData()}>
          Refresh Taxonomy Data
        </button>
      </div>

      <div className="selection-container">
        <div className="layer-selection">
          <h3>Select Layer</h3>
          <div className="layer-buttons">
            {taxonomyData && Object.keys(taxonomyData.layers).map(layer => (
              <button 
                key={layer}
                onClick={() => handleLayerSelect(layer)}
                className={selectedLayer === layer ? 'active' : ''}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        {selectedLayer && (
          <div className="category-selection">
            <h3>Categories for Layer: {selectedLayer}</h3>
            <div className="category-list">
              {categories.length === 0 ? (
                <div className="empty-message">No categories found</div>
              ) : (
                <div className="category-grid">
                  {categories.map(category => (
                    <div 
                      key={category.code}
                      className={`category-item ${selectedCategory === category.code ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(category.code)}
                    >
                      <div className="code">{category.code}</div>
                      <div className="name">{category.name}</div>
                      <div className="numeric-code">{category.numericCode}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedLayer && selectedCategory && (
          <div className="subcategory-selection">
            <h3>
              Subcategories for {selectedLayer}.{selectedCategory}
            </h3>
            <div className="subcategory-list">
              {subcategories.length === 0 ? (
                <div className="empty-message">No subcategories found</div>
              ) : (
                <div className="subcategory-grid">
                  {subcategories.map(subcategory => (
                    <div 
                      key={subcategory.code}
                      className={`subcategory-item ${selectedSubcategory === subcategory.code ? 'active' : ''}`}
                      onClick={() => handleSubcategorySelect(subcategory.code)}
                    >
                      <div className="code">{subcategory.code}</div>
                      <div className="name">{subcategory.name}</div>
                      <div className="numeric-code">{subcategory.numericCode}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedLayer && selectedCategory && selectedSubcategory && (
          <div className="selection-result">
            <h3>Selected Path</h3>
            <div className="path">
              <code>{selectedLayer}.{selectedCategory}.{selectedSubcategory}.001</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxonomyDebugger;