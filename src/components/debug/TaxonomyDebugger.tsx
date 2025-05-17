/**
 * TaxonomyDebugger Component
 * 
 * A component for debugging taxonomy-related issues.
 */
import React, { useState } from 'react';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { logger, LogLevel, LogCategory } from '../../utils/logger';
import '../../styles/TaxonomyDebugger.css';

const TaxonomyDebugger: React.FC = () => {
  const [layer, setLayer] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [sequential, setSequential] = useState<string>('001');
  const [hfn, setHfn] = useState<string>('');
  const [mfa, setMfa] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [outputLog, setOutputLog] = useState<string[]>([]);
  
  const layers = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];
  
  // Load categories for a layer
  const loadCategories = (selectedLayer: string) => {
    try {
      const categories = taxonomyService.getCategories(selectedLayer);
      
      addToLog(`Loaded ${categories.length} categories for layer ${selectedLayer}`);
      addToLog(JSON.stringify(categories, null, 2));
      
      return categories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      addToLog(`Error loading categories: ${errorMessage}`);
      return [];
    }
  };
  
  // Load subcategories for a category
  const loadSubcategories = (selectedLayer: string, selectedCategory: string) => {
    try {
      const subcategories = taxonomyService.getSubcategories(selectedLayer, selectedCategory);
      
      addToLog(`Loaded ${subcategories.length} subcategories for ${selectedLayer}.${selectedCategory}`);
      addToLog(JSON.stringify(subcategories, null, 2));
      
      return subcategories;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      addToLog(`Error loading subcategories: ${errorMessage}`);
      return [];
    }
  };
  
  // Convert HFN to MFA
  const convertHfnToMfa = (hfn: string) => {
    try {
      const result = taxonomyService.convertHFNtoMFA(hfn);
      setMfa(result);
      addToLog(`Converted ${hfn} to ${result}`);
      setError('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      setMfa('');
      addToLog(`Error converting HFN to MFA: ${errorMessage}`);
    }
  };
  
  // Add message to output log
  const addToLog = (message: string) => {
    setOutputLog(prev => [...prev, message]);
    logger.taxonomy(LogLevel.DEBUG, message);
  };
  
  // Clear output log
  const clearLog = () => {
    setOutputLog([]);
  };
  
  // Handle layer change
  const handleLayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLayer = e.target.value;
    setLayer(selectedLayer);
    setCategory('');
    setSubcategory('');
    setHfn('');
    setMfa('');
    setError('');
    
    if (selectedLayer) {
      loadCategories(selectedLayer);
    }
  };
  
  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setSubcategory('');
    updateHfn(layer, selectedCategory, '');
    
    if (layer && selectedCategory) {
      loadSubcategories(layer, selectedCategory);
    }
  };
  
  // Handle subcategory change
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedSubcategory = e.target.value;
    setSubcategory(selectedSubcategory);
    updateHfn(layer, category, selectedSubcategory);
  };
  
  // Handle sequential change
  const handleSequentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedSequential = e.target.value;
    setSequential(selectedSequential);
    updateHfn(layer, category, subcategory, selectedSequential);
  };
  
  // Update HFN
  const updateHfn = (
    selectedLayer: string, 
    selectedCategory: string, 
    selectedSubcategory: string,
    selectedSequential: string = sequential
  ) => {
    if (selectedLayer && selectedCategory && selectedSubcategory) {
      const newHfn = `${selectedLayer}.${selectedCategory}.${selectedSubcategory}.${selectedSequential}`;
      setHfn(newHfn);
      convertHfnToMfa(newHfn);
    } else {
      setHfn('');
      setMfa('');
    }
  };
  
  // Handle direct HFN input
  const handleHfnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputHfn = e.target.value;
    setHfn(inputHfn);
    
    // Parse HFN components
    const parts = inputHfn.split('.');
    if (parts.length >= 4) {
      setLayer(parts[0]);
      setCategory(parts[1]);
      setSubcategory(parts[2]);
      setSequential(parts[3]);
    }
  };
  
  // Convert HFN to MFA
  const handleConvertHfn = () => {
    if (hfn) {
      convertHfnToMfa(hfn);
    }
  };
  
  // Test all taxonomy functionality
  const handleRunTests = () => {
    clearLog();
    addToLog('--- Running Taxonomy Tests ---');
    
    // Test layers
    for (const testLayer of layers) {
      addToLog(`Testing layer: ${testLayer}`);
      
      try {
        const categories = taxonomyService.getCategories(testLayer);
        addToLog(`- Found ${categories.length} categories`);
        
        if (categories.length > 0) {
          const firstCategory = categories[0];
          addToLog(`- Testing first category: ${firstCategory.code}`);
          
          try {
            const subcategories = taxonomyService.getSubcategories(testLayer, firstCategory.code);
            addToLog(`- Found ${subcategories.length} subcategories`);
            
            if (subcategories.length > 0) {
              const firstSubcategory = subcategories[0];
              addToLog(`- Testing first subcategory: ${firstSubcategory.code}`);
              
              const testHfn = `${testLayer}.${firstCategory.code}.${firstSubcategory.code}.001`;
              try {
                const testMfa = taxonomyService.convertHFNtoMFA(testHfn);
                addToLog(`- HFN to MFA: ${testHfn} -> ${testMfa}`);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addToLog(`- Error converting HFN to MFA: ${errorMessage}`);
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addToLog(`- Error loading subcategories: ${errorMessage}`);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addToLog(`- Error loading categories: ${errorMessage}`);
      }
    }
    
    // Test special cases
    addToLog('--- Testing Special Cases ---');
    
    const specialCases = [
      'W.BCH.SUN.001',
      'S.POP.HPM.001'
    ];
    
    for (const testCase of specialCases) {
      addToLog(`Testing special case: ${testCase}`);
      
      try {
        const testMfa = taxonomyService.convertHFNtoMFA(testCase);
        addToLog(`- HFN to MFA: ${testCase} -> ${testMfa}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addToLog(`- Error converting HFN to MFA: ${errorMessage}`);
      }
    }
    
    addToLog('--- Tests Completed ---');
  };
  
  return (
    <div className="taxonomy-debugger">
      <h2>Taxonomy Debugger</h2>
      
      <div className="taxonomy-debugger-controls">
        <div className="control-group">
          <label>Layer:</label>
          <select value={layer} onChange={handleLayerChange}>
            <option value="">Select Layer</option>
            {layers.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <label>Category:</label>
          <input
            type="text"
            value={category}
            onChange={handleCategoryChange}
            placeholder="Enter category code"
          />
        </div>
        
        <div className="control-group">
          <label>Subcategory:</label>
          <input
            type="text"
            value={subcategory}
            onChange={handleSubcategoryChange}
            placeholder="Enter subcategory code"
          />
        </div>
        
        <div className="control-group">
          <label>Sequential:</label>
          <input
            type="text"
            value={sequential}
            onChange={handleSequentialChange}
            placeholder="Enter sequential number"
          />
        </div>
      </div>
      
      <div className="hfn-mfa-converter">
        <div className="control-group">
          <label>HFN:</label>
          <input
            type="text"
            value={hfn}
            onChange={handleHfnChange}
            placeholder="Enter HFN (e.g., W.BCH.SUN.001)"
          />
          <button onClick={handleConvertHfn}>Convert</button>
        </div>
        
        <div className="control-group">
          <label>MFA:</label>
          <input
            type="text"
            value={mfa}
            readOnly
            className="mfa-output"
          />
        </div>
        
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
      </div>
      
      <div className="taxonomy-test-controls">
        <button onClick={handleRunTests} className="run-tests-button">
          Run All Tests
        </button>
        <button onClick={clearLog} className="clear-log-button">
          Clear Log
        </button>
      </div>
      
      <div className="output-log">
        <h3>Output Log</h3>
        <pre>
          {outputLog.join('\n')}
        </pre>
      </div>
    </div>
  );
};

export default TaxonomyDebugger;