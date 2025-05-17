import React from 'react';
import { useTaxonomy } from '../../hooks/useTaxonomy';

const TaxonomyExample: React.FC = () => {
  const {
    layers,
    selectedLayer,
    selectLayer,
    
    categories,
    isLoadingCategories,
    categoryError,
    selectedCategory,
    selectCategory,
    reloadCategories,
    
    subcategories,
    isLoadingSubcategories,
    subcategoryError,
    selectedSubcategory,
    selectSubcategory,
    reloadSubcategories,
    
    hfn,
    mfa,
    
    reset
  } = useTaxonomy();

  return (
    <div className="taxonomy-example">
      <h2>Taxonomy Selection Example</h2>
      
      <div className="section">
        <h3>Layer Selection</h3>
        <div className="buttons">
          {layers.map(layer => (
            <button
              key={layer}
              className={selectedLayer === layer ? 'selected' : ''}
              onClick={() => selectLayer(layer)}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>
      
      {selectedLayer && (
        <div className="section">
          <h3>Categories for {selectedLayer}</h3>
          
          {isLoadingCategories ? (
            <div className="loading">Loading categories...</div>
          ) : categoryError ? (
            <div className="error">
              <p>Error loading categories: {categoryError.message}</p>
              <button onClick={reloadCategories}>Retry</button>
            </div>
          ) : categories.length === 0 ? (
            <div className="empty">No categories found</div>
          ) : (
            <div className="buttons">
              {categories.map(category => (
                <button
                  key={category.code}
                  className={selectedCategory === category.code ? 'selected' : ''}
                  onClick={() => selectCategory(category.code)}
                >
                  {category.name} ({category.code})
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {selectedCategory && (
        <div className="section">
          <h3>Subcategories for {selectedLayer}.{selectedCategory}</h3>
          
          {isLoadingSubcategories ? (
            <div className="loading">Loading subcategories...</div>
          ) : subcategoryError ? (
            <div className="error">
              <p>Error loading subcategories: {subcategoryError.message}</p>
              <button onClick={reloadSubcategories}>Retry</button>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="empty">No subcategories found</div>
          ) : (
            <div className="buttons">
              {subcategories.map(subcategory => (
                <button
                  key={subcategory.code}
                  className={selectedSubcategory === subcategory.code ? 'selected' : ''}
                  onClick={() => selectSubcategory(subcategory.code)}
                >
                  {subcategory.name} ({subcategory.code})
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {selectedLayer && selectedCategory && selectedSubcategory && (
        <div className="section">
          <h3>Result</h3>
          <div className="result">
            <div><strong>HFN:</strong> {hfn}</div>
            <div><strong>MFA:</strong> {mfa}</div>
          </div>
        </div>
      )}
      
      <div className="section">
        <button className="reset-button" onClick={reset}>Reset</button>
      </div>
    </div>
  );
};

export default TaxonomyExample;