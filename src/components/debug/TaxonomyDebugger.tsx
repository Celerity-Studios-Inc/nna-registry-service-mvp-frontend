/**
 * TaxonomyDebugger Component
 *
 * A component for debugging taxonomy-related issues.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { logger, LogLevel, LogCategory, verboseLog } from '../../utils/logger';
import {
  LAYER_LOOKUPS,
  LAYER_SUBCATEGORIES,
} from '../../taxonomyLookup/constants';

// Create or import stylesheet
// import '../../styles/TaxonomyDebugger.css';

const TaxonomyDebugger: React.FC = () => {
  const [layer, setLayer] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [sequential, setSequential] = useState<string>('001');
  const [hfn, setHfn] = useState<string>('');
  const [mfa, setMfa] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [outputLog, setOutputLog] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isVerboseLoggingEnabled, setIsVerboseLoggingEnabled] = useState<boolean>(
    localStorage.getItem('verbose_taxonomy_logging') === 'true'
  );

  const layers = ['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C', 'R'];

  // Add message to output log
  const addToLog = useCallback((message: string) => {
    setOutputLog(prev => [...prev, message]);
    logger.taxonomy(LogLevel.DEBUG, message);
  }, []);

  // Clear output log
  const clearLog = () => {
    setOutputLog([]);
  };

  // Load debug information for current layer and category
  const loadLayerDebugInfo = useCallback(
    (selectedLayer: string, selectedCategory?: string) => {
      try {
        if (!selectedLayer) {
          return;
        }

        // Clear previous debug info
        setOutputLog([]);

        // Get all available layers
        const availableLayers = Object.keys(LAYER_LOOKUPS);
        const isValidLayer = availableLayers.includes(selectedLayer);

        if (!isValidLayer) {
          setError(`Invalid layer: ${selectedLayer}`);
          return;
        }

        // Basic layer counts
        const layerLookup = LAYER_LOOKUPS[selectedLayer] || {};
        const layerSubcats = LAYER_SUBCATEGORIES[selectedLayer] || {};

        const layerLookupCount = Object.keys(layerLookup).length;
        const layerSubcatsCount = Object.keys(layerSubcats).length;

        // Get categories
        const categories = taxonomyService.getCategories(selectedLayer);

        // Use first category if none provided
        const categoryToTest =
          selectedCategory ||
          (categories.length > 0 ? categories[0].code : null);
        let subcatCodes: string[] = [];
        let subcats: any[] = [];
        let serviceResult: any[] = [];

        if (categoryToTest) {
          // Get subcategory codes for this category
          subcatCodes = layerSubcats[categoryToTest] || [];

          // Map subcategory codes to entries
          if (subcatCodes.length > 0) {
            subcats = subcatCodes.map(fullCode => {
              try {
                const parts = fullCode.split('.');
                const subcategoryCode = parts[1]; // Get the part after the dot
                const subcategoryEntry = layerLookup[fullCode];

                if (!subcategoryEntry) {
                  return {
                    code: subcategoryCode || 'unknown',
                    error: `Entry not found for ${fullCode}`,
                  };
                }

                return {
                  code: subcategoryCode,
                  numericCode: subcategoryEntry.numericCode,
                  name: subcategoryEntry.name,
                };
              } catch (error) {
                return { error: `Error processing ${fullCode}: ${error}` };
              }
            });
          }

          // Test the service method
          serviceResult = taxonomyService.getSubcategories(
            selectedLayer,
            categoryToTest
          );
        }

        // Set debug info
        setDebugInfo({
          layer: selectedLayer,
          category: categoryToTest,
          layerLookupCount,
          layerSubcatsCount,
          categories: categories.length,
          subcatCodes,
          subcats,
          serviceResult,
        });

        // Log detailed debugging info to console
        console.log(`[DEBUG] ${selectedLayer} LAYER_LOOKUP:`, layerLookup);
        console.log(
          `[DEBUG] ${selectedLayer} LAYER_SUBCATEGORIES:`,
          layerSubcats
        );
        console.log(`[DEBUG] Categories for ${selectedLayer}:`, categories);

        if (categoryToTest) {
          console.log(
            `[DEBUG] Subcategory codes for ${selectedLayer}.${categoryToTest}:`,
            subcatCodes
          );
          console.log(`[DEBUG] Mapped subcategories:`, subcats);
          console.log(
            `[DEBUG] Service result for ${selectedLayer}.${categoryToTest}:`,
            serviceResult
          );
        }

        // Add debug info to log
        setOutputLog(prevLog => [
          ...prevLog,
          '--- Debug Information ---',
          `Layer: ${selectedLayer}`,
          ...(categoryToTest ? [`Selected Category: ${categoryToTest}`] : []),
          `LAYER_LOOKUPS[${selectedLayer}] count: ${layerLookupCount}`,
          `LAYER_SUBCATEGORIES[${selectedLayer}] count: ${layerSubcatsCount}`,
          `Categories: ${categories.length}`,
          ...(categoryToTest
            ? [
                `Subcategory codes for ${categoryToTest}: ${subcatCodes.length}`,
                `Mapped subcategories: ${subcats.length}`,
                `Service result count: ${serviceResult.length}`,
              ]
            : []),
        ]);

        setError('');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(`Error loading debug info: ${errorMessage}`);
        setDebugInfo({
          error: errorMessage,
          layer: selectedLayer,
        });
      }
    },
    []
  );

  // Load initial debug info on mount
  useEffect(() => {
    // Start with S layer and POP category as default
    loadLayerDebugInfo('S', 'POP');
  }, [loadLayerDebugInfo]);

  // Load categories for a layer
  const loadCategories = (selectedLayer: string) => {
    try {
      const categories = taxonomyService.getCategories(selectedLayer);

      addToLog(
        `Loaded ${categories.length} categories for layer ${selectedLayer}`
      );
      addToLog(JSON.stringify(categories, null, 2));

      return categories;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      addToLog(`Error loading categories: ${errorMessage}`);
      return [];
    }
  };

  // Load subcategories for a category
  const loadSubcategories = (
    selectedLayer: string,
    selectedCategory: string
  ) => {
    try {
      const subcategories = taxonomyService.getSubcategories(
        selectedLayer,
        selectedCategory
      );

      addToLog(
        `Loaded ${subcategories.length} subcategories for ${selectedLayer}.${selectedCategory}`
      );
      addToLog(JSON.stringify(subcategories, null, 2));

      return subcategories;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      setMfa('');
      addToLog(`Error converting HFN to MFA: ${errorMessage}`);
    }
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
      // Load categories and update debug info for the selected layer
      loadCategories(selectedLayer);
      loadLayerDebugInfo(selectedLayer);
    }
  };

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setSubcategory('');
    updateHfn(layer, selectedCategory, '');

    if (layer && selectedCategory) {
      // Load subcategories for selected category and update debug info
      loadSubcategories(layer, selectedCategory);
      loadLayerDebugInfo(layer, selectedCategory);
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
            const subcategories = taxonomyService.getSubcategories(
              testLayer,
              firstCategory.code
            );
            addToLog(`- Found ${subcategories.length} subcategories`);

            if (subcategories.length > 0) {
              const firstSubcategory = subcategories[0];
              addToLog(`- Testing first subcategory: ${firstSubcategory.code}`);

              const testHfn = `${testLayer}.${firstCategory.code}.${firstSubcategory.code}.001`;
              try {
                const testMfa = taxonomyService.convertHFNtoMFA(testHfn);
                addToLog(`- HFN to MFA: ${testHfn} -> ${testMfa}`);
              } catch (error) {
                const errorMessage =
                  error instanceof Error ? error.message : String(error);
                addToLog(`- Error converting HFN to MFA: ${errorMessage}`);
              }
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            addToLog(`- Error loading subcategories: ${errorMessage}`);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        addToLog(`- Error loading categories: ${errorMessage}`);
      }
    }

    // Test special cases
    addToLog('--- Testing Special Cases ---');

    const specialCases = ['W.BCH.SUN.001', 'S.POP.HPM.001'];

    for (const testCase of specialCases) {
      addToLog(`Testing special case: ${testCase}`);

      try {
        const testMfa = taxonomyService.convertHFNtoMFA(testCase);
        addToLog(`- HFN to MFA: ${testCase} -> ${testMfa}`);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        addToLog(`- Error converting HFN to MFA: ${errorMessage}`);
      }
    }

    addToLog('--- Tests Completed ---');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Taxonomy Debugger</h2>

      {/* Debug Information Panel */}
      {debugInfo && (
        <div
          style={{
            padding: '15px',
            margin: '15px 0',
            border: '1px solid #ddd',
            backgroundColor: '#f8f8f8',
            borderRadius: '4px',
          }}
        >
          <h3>Debug Information</h3>

          {debugInfo.error ? (
            <div style={{ color: 'red' }}>Error: {debugInfo.error}</div>
          ) : (
            <>
              <div style={{ marginBottom: '10px' }}>
                <strong>Layer:</strong> {debugInfo.layer || 'None'}
                <br />
                <strong>Category:</strong> {debugInfo.category || 'None'}
                <br />
                <strong>LAYER_LOOKUPS["{debugInfo.layer}"] count:</strong>{' '}
                {debugInfo.layerLookupCount}
                <br />
                <strong>
                  LAYER_SUBCATEGORIES["{debugInfo.layer}"] count:
                </strong>{' '}
                {debugInfo.layerSubcatsCount}
                <br />
                <strong>Categories count:</strong> {debugInfo.categories}
              </div>

              {debugInfo.category && (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <h4>
                      Subcategory Codes for {debugInfo.layer}.
                      {debugInfo.category} (
                      {(debugInfo.subcatCodes || []).length}):
                    </h4>
                    <pre
                      style={{
                        padding: '10px',
                        backgroundColor: '#eee',
                        overflow: 'auto',
                        borderRadius: '4px',
                        maxHeight: '100px',
                      }}
                    >
                      {JSON.stringify(debugInfo.subcatCodes || [], null, 2)}
                    </pre>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <h4>
                      Mapped Subcategories ({(debugInfo.subcats || []).length}):
                    </h4>
                    <pre
                      style={{
                        padding: '10px',
                        backgroundColor: '#eee',
                        overflow: 'auto',
                        borderRadius: '4px',
                        maxHeight: '150px',
                      }}
                    >
                      {JSON.stringify(debugInfo.subcats || [], null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4>
                      Service Method Results (
                      {(debugInfo.serviceResult || []).length}):
                    </h4>
                    <pre
                      style={{
                        padding: '10px',
                        backgroundColor: '#eee',
                        overflow: 'auto',
                        borderRadius: '4px',
                        maxHeight: '150px',
                      }}
                    >
                      {JSON.stringify(debugInfo.serviceResult || [], null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h3>Taxonomy Explorer</h3>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '15px',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Layer:
            </label>
            <select
              value={layer}
              onChange={handleLayerChange}
              style={{
                padding: '8px',
                minWidth: '150px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            >
              <option value="">Select Layer</option>
              {layers.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Category:
            </label>
            <input
              type="text"
              value={category}
              onChange={handleCategoryChange}
              placeholder="Enter category code"
              style={{
                padding: '8px',
                minWidth: '150px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Subcategory:
            </label>
            <input
              type="text"
              value={subcategory}
              onChange={handleSubcategoryChange}
              placeholder="Enter subcategory code"
              style={{
                padding: '8px',
                minWidth: '150px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Sequential:
            </label>
            <input
              type="text"
              value={sequential}
              onChange={handleSequentialChange}
              placeholder="Enter sequential number"
              style={{
                padding: '8px',
                minWidth: '150px',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              HFN:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={hfn}
                onChange={handleHfnChange}
                placeholder="Enter HFN (e.g., W.BCH.SUN.001)"
                style={{
                  padding: '8px',
                  flexGrow: 1,
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
              <button
                onClick={handleConvertHfn}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Convert
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              MFA:
            </label>
            <input
              type="text"
              value={mfa}
              readOnly
              style={{
                padding: '8px',
                width: '100%',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#f5f5f5',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px',
                margin: '10px 0',
                color: 'red',
                border: '1px solid #ffcccc',
                backgroundColor: '#fff8f8',
                borderRadius: '4px',
              }}
            >
              Error: {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>
            Verbose Logging Status: 
          </span>
          <span style={{ 
            padding: '4px 8px', 
            backgroundColor: isVerboseLoggingEnabled ? '#28a745' : '#dc3545',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            {isVerboseLoggingEnabled ? 'ENABLED' : 'DISABLED'}
          </span>
          <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
            {isVerboseLoggingEnabled 
              ? 'Detailed logs are showing in console. Disable to reduce console noise.' 
              : 'Minimal logs in console. Enable for debugging.'}
          </span>
        </div>
        
        <button
          onClick={handleRunTests}
          style={{
            padding: '8px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Run All Tests
        </button>
        <button
          onClick={clearLog}
          style={{
            padding: '8px 15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Clear Log
        </button>
        <button
          onClick={() => {
            const newValue = !isVerboseLoggingEnabled;
            setIsVerboseLoggingEnabled(newValue);
            localStorage.setItem('verbose_taxonomy_logging', newValue ? 'true' : 'false');
            addToLog(`Verbose taxonomy logging ${newValue ? 'enabled' : 'disabled'}`);
          }}
          style={{
            padding: '8px 15px',
            backgroundColor: isVerboseLoggingEnabled ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {isVerboseLoggingEnabled ? 'Disable Verbose Logging' : 'Enable Verbose Logging'}
        </button>
      </div>

      <div>
        <h3>Output Log</h3>
        <pre
          style={{
            padding: '15px',
            backgroundColor: '#222',
            color: '#fff',
            borderRadius: '4px',
            height: '300px',
            overflow: 'auto',
            fontSize: '14px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {outputLog.length ? outputLog.join('\n') : 'No output yet...'}
        </pre>
      </div>
    </div>
  );
};

export default TaxonomyDebugger;
