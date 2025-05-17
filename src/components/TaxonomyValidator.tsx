import React, { useState, useEffect } from 'react';
import { taxonomyService } from '../services/simpleTaxonomyService';
import { LAYER_LOOKUPS } from '../taxonomyLookup';
import '../styles/TaxonomyValidator.css';

const TaxonomyValidator: React.FC = () => {
  const [layer, setLayer] = useState<string>('W');
  const [hfn, setHfn] = useState<string>('W.BCH.SUN.001');
  const [mfa, setMfa] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<any[]>([]);

  const layers = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];

  // Get the list of available layers
  const getAvailableLayers = (): string[] => {
    return Object.keys(LAYER_LOOKUPS);
  };
  
  // Initialize with W layer data
  useEffect(() => {
    loadCategories('W');
  }, []);
  
  const loadCategories = (layer: string) => {
    try {
      const layerCategories = taxonomyService.getCategories(layer);
      setCategories(layerCategories);
      setSelectedCategory('');
      setSubcategories([]);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };
  
  const handleLayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLayer = e.target.value;
    setLayer(newLayer);
    setHfn(`${newLayer}.`);
    setMfa('');
    
    loadCategories(newLayer);
  };
  
  const handleCategorySelect = (categoryCode: string) => {
    setSelectedCategory(categoryCode);
    setHfn(`${layer}.${categoryCode}.`);
    
    // Load subcategories for this category
    try {
      const categorySubcategories = taxonomyService.getSubcategories(layer, categoryCode);
      setSubcategories(categorySubcategories);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    }
  };
  
  const handleSubcategorySelect = (subcategoryCode: string) => {
    setHfn(`${layer}.${selectedCategory}.${subcategoryCode}.001`);
  };
  
  const handleConvertHFN = () => {
    const result = taxonomyService.convertHFNtoMFA(hfn);
    setMfa(result);
  };
  
  const validateLayer = () => {
    try {
      const results = taxonomyService.generateAllMappings(layer);
      setValidationResults(results);
    } catch (error) {
      console.error('Error validating layer:', error);
      setValidationResults([]);
    }
  };
  
  return (
    <div className="taxonomy-validator">
      <h1>Taxonomy Validator</h1>
      
      <div className="validator-controls">
        <div className="control-group">
          <label>Layer:</label>
          <select value={layer} onChange={handleLayerChange}>
            {layers.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label>HFN:</label>
          <input 
            type="text" 
            value={hfn}
            onChange={e => setHfn(e.target.value)}
          />
          <button onClick={handleConvertHFN}>Convert</button>
        </div>
        
        <div className="control-group">
          <label>MFA:</label>
          <input 
            type="text" 
            value={mfa}
            readOnly
          />
        </div>
        
        <div className="control-group">
          <button onClick={validateLayer}>Validate All {layer} Layer Mappings</button>
        </div>
      </div>
      
      <div className="taxonomy-explorer">
        <div className="categories-section">
          <h2>Categories</h2>
          <div className="categories-list">
            {categories.map(category => (
              <div 
                key={category.code}
                className={`category-item ${selectedCategory === category.code ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(category.code)}
              >
                <div className="code">{category.code}</div>
                <div className="numeric-code">{category.numericCode}</div>
                <div className="name">{category.name}</div>
              </div>
            ))}
          </div>
        </div>
        
        {selectedCategory && (
          <div className="subcategories-section">
            <h2>Subcategories for {selectedCategory}</h2>
            <div className="subcategories-list">
              {subcategories.map(subcategory => (
                <div 
                  key={subcategory.code}
                  className="subcategory-item"
                  onClick={() => handleSubcategorySelect(subcategory.code)}
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
      
      {validationResults.length > 0 && (
        <div className="validation-results">
          <h2>Validation Results for {layer} Layer</h2>
          <p>Total mappings: {validationResults.length}</p>
          
          <table>
            <thead>
              <tr>
                <th>HFN</th>
                <th>MFA</th>
                <th>Category</th>
                <th>Subcategory</th>
              </tr>
            </thead>
            <tbody>
              {validationResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.hfn}</td>
                  <td>{result.mfa}</td>
                  <td>{result.category}</td>
                  <td>{result.subcategory}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="available-layers">
        <h3>Available Layers</h3>
        <div className="layer-list">
          {layers.map(layerCode => {
            const isAvailable = getAvailableLayers().includes(layerCode);
            return (
              <div
                key={layerCode}
                className={`layer-item ${isAvailable ? 'available' : 'unavailable'}`}
              >
                <span className="layer-code">{layerCode}</span>
                <span className="layer-status">{isAvailable ? '✅' : '❌'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hfn-mfa-tester">
        <h3>Special Case Test: W.BCH.SUN</h3>
        <p>Testing the specific W.BCH.SUN mapping that needed fixing</p>

        <div className="tester-output">
          <div><strong>HFN:</strong> W.BCH.SUN.001</div>
          <div><strong>MFA:</strong> {taxonomyService.convertHFNtoMFA('W.BCH.SUN.001') || 'Not available'}</div>
          <div><strong>Status:</strong> {taxonomyService.convertHFNtoMFA('W.BCH.SUN.001') === '5.004.003.001' ? '✅ Fixed correctly' : '❌ Not fixed correctly'}</div>
        </div>
      </div>

      <div className="test-cases">
        <h3>Test Cases for All Layers</h3>
        <div className="test-cases-grid">
          {[
            { hfn: 'G.POP.BAS.001', expected: '1.001.001.001' },
            { hfn: 'S.POP.BAS.001', expected: '2.001.001.001' },
            { hfn: 'S.POP.HPM.001', expected: '2.001.007.001' },
            { hfn: 'L.STG.RED.001', expected: '3.001.002.001' },
            { hfn: 'M.POP.BAS.001', expected: '4.001.001.001' },
            { hfn: 'W.BCH.SUN.001', expected: '5.004.003.001' }
          ].map((testCase, index) => {
            const actual = taxonomyService.convertHFNtoMFA(testCase.hfn);
            const isCorrect = actual === testCase.expected;
            return (
              <div key={index} className={`test-case ${isCorrect ? 'passed' : 'failed'}`}>
                <div className="test-hfn">{testCase.hfn}</div>
                <div className="test-mfa">
                  <span>Expected: {testCase.expected}</span>
                  <span>Actual: {actual || 'Error'}</span>
                </div>
                <div className="test-result">{isCorrect ? '✅' : '❌'}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaxonomyValidator;