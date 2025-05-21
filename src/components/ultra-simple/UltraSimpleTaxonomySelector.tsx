/**
 * UltraSimpleTaxonomySelector
 * 
 * An ultra-simplified taxonomy selector that uses native HTML select elements
 * instead of custom cards to ensure maximum reliability and eliminate the
 * card disappearance issues.
 */

import React, { useState, useEffect } from 'react';
import { 
  SIMPLE_LAYERS, 
  SIMPLE_CATEGORIES, 
  SIMPLE_SUBCATEGORIES, 
  getSimpleMFAFromHFN,
  SimpleTaxonomyItem
} from '../../data/UltraSimpleTaxonomyData';
import './UltraSimpleTaxonomySelector.css';

interface UltraSimpleTaxonomySelectorProps {
  onSelectionComplete: (selection: { 
    layer: string; 
    category: string; 
    subcategory: string; 
    hfn: string;
    mfa: string;
  }) => void;
  initialValues?: {
    layer?: string;
    category?: string;
    subcategory?: string;
  };
}

export const UltraSimpleTaxonomySelector: React.FC<UltraSimpleTaxonomySelectorProps> = ({
  onSelectionComplete,
  initialValues = {}
}) => {
  // Simple local state
  const [layer, setLayer] = useState(initialValues.layer || '');
  const [category, setCategory] = useState(initialValues.category || '');
  const [subcategory, setSubcategory] = useState(initialValues.subcategory || '');
  const [sequential, setSequential] = useState('001');
  
  // Console logging for debugging
  console.log('[UltraSimpleTaxonomySelector] Render with state:', { layer, category, subcategory });
  
  // Derived values based on selections
  const categories = layer ? SIMPLE_CATEGORIES[layer] || [] : [];
  const subcategories = (layer && category) ? SIMPLE_SUBCATEGORIES[`${layer}.${category}`] || [] : [];
  
  const hfn = (layer && category && subcategory) 
    ? `${layer}.${category}.${subcategory}.${sequential}`
    : '';
    
  const mfa = hfn 
    ? getSimpleMFAFromHFN(hfn)
    : '';
  
  // Notify parent when selection is complete
  useEffect(() => {
    if (layer && category && subcategory) {
      console.log('[UltraSimpleTaxonomySelector] Selection complete:', { layer, category, subcategory, hfn, mfa });
      onSelectionComplete({
        layer,
        category,
        subcategory,
        hfn,
        mfa
      });
    }
  }, [layer, category, subcategory, sequential, hfn, mfa, onSelectionComplete]);
  
  // Reset dependent fields when parent selection changes
  const handleLayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLayer = e.target.value;
    console.log('[UltraSimpleTaxonomySelector] Layer changed:', newLayer);
    setLayer(newLayer);
    setCategory('');
    setSubcategory('');
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    console.log('[UltraSimpleTaxonomySelector] Category changed:', newCategory);
    setCategory(newCategory);
    setSubcategory('');
  };
  
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubcategory = e.target.value;
    console.log('[UltraSimpleTaxonomySelector] Subcategory changed:', newSubcategory);
    setSubcategory(newSubcategory);
  };
  
  return (
    <div className="ultra-simple-taxonomy">
      <div className="selection-group">
        <label htmlFor="layer-select">
          Layer:
          <select
            id="layer-select"
            value={layer}
            onChange={handleLayerChange}
            className="selection-dropdown"
          >
            <option value="">-- Select Layer --</option>
            {SIMPLE_LAYERS.map(l => (
              <option key={l.code} value={l.code}>
                {l.code} - {l.name} ({l.numericCode})
              </option>
            ))}
          </select>
        </label>
      </div>
      
      {layer && (
        <div className="selection-group">
          <label htmlFor="category-select">
            Category:
            <select
              id="category-select"
              value={category}
              onChange={handleCategoryChange}
              className="selection-dropdown"
            >
              <option value="">-- Select Category --</option>
              {categories.map(c => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name} ({c.numericCode})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      
      {layer && category && (
        <div className="selection-group">
          <label htmlFor="subcategory-select">
            Subcategory:
            <select
              id="subcategory-select"
              value={subcategory}
              onChange={handleSubcategoryChange}
              className="selection-dropdown"
            >
              <option value="">-- Select Subcategory --</option>
              {subcategories.map(s => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.name} ({s.numericCode})
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      
      {layer && category && subcategory && (
        <div className="selection-group">
          <label htmlFor="sequential-input">
            Sequential Number:
            <input
              id="sequential-input"
              type="text"
              value={sequential}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setSequential(value.padStart(3, '0').substring(0, 3));
              }}
              maxLength={3}
              pattern="[0-9]{3}"
              className="sequential-input"
            />
          </label>
        </div>
      )}
      
      {layer && category && subcategory && (
        <div className="preview-box">
          <div className="preview-item">
            <strong>Human-Friendly Name (HFN):</strong> 
            <span className="preview-value">{hfn}</span>
          </div>
          <div className="preview-item">
            <strong>Machine-Friendly Address (MFA):</strong> 
            <span className="preview-value">{mfa}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UltraSimpleTaxonomySelector;