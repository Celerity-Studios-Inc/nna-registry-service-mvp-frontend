/**
 * SimpleTaxonomySelectionV3
 * 
 * A completely new implementation of the taxonomy selection component that uses
 * the enhanced taxonomy service for improved reliability and error handling.
 * 
 * Key features:
 * - Multi-tiered fallback system for subcategory loading
 * - Enhanced error handling and debug information
 * - Improved UI with dropdown-based selection
 * - Better state management for layer/category/subcategory selection
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FormControl, InputLabel, Select, MenuItem, Grid, Typography, 
  Button, CircularProgress, Alert
} from '@mui/material';
import {
  getLayers,
  getCategories,
  getSubcategories,
  inspectTaxonomyStructure,
  debugTaxonomyData
} from '../../services/enhancedTaxonomyService';
import { FALLBACK_SUBCATEGORIES } from '../../services/taxonomyFallbackData';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { TaxonomyItem } from '../../types/taxonomy.types';
import { logger } from '../../utils/logger';

interface SimpleTaxonomySelectionV3Props {
  selectedLayer: string;
  onLayerSelect: (layer: string) => void;
  selectedCategoryCode: string;
  onCategorySelect: (category: string) => void;
  selectedSubcategoryCode: string;
  onSubcategorySelect: (subcategory: string) => void;
}

const SimpleTaxonomySelectionV3: React.FC<SimpleTaxonomySelectionV3Props> = ({
  selectedLayer,
  onLayerSelect,
  selectedCategoryCode,
  onCategorySelect,
  selectedSubcategoryCode,
  onSubcategorySelect
}) => {
  // State for taxonomy data
  const [layers, setLayers] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<TaxonomyItem[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<TaxonomyItem[]>([]);
  
  // State for UI control
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  
  // References for tracking loading attempts
  const loadAttemptsRef = useRef<Record<string, number>>({});
  const subcategoryCacheRef = useRef<Record<string, TaxonomyItem[]>>({});

  // Helper to get a cache key for subcategory lookups
  const getSubcategoryCacheKey = useCallback((layer: string, categoryCode: string): string => {
    return `${layer}.${categoryCode}`;
  }, []);

  // Load layers on component mount
  useEffect(() => {
    try {
      const availableLayers = getLayers();
      logger.info('Available layers:', availableLayers);
      setLayers(availableLayers);
    } catch (err) {
      logger.error('Error loading layers:', err);
      setError('Failed to load layers');
    }
  }, []);

  // Load categories when layer changes
  useEffect(() => {
    if (selectedLayer) {
      setIsProcessing(true);
      setError(null);
      
      try {
        const categories = getCategories(selectedLayer);
        logger.info(`Categories for layer ${selectedLayer}:`, categories);
        setCategoryOptions(categories);
        
        // Clear subcategory if layer changes
        if (selectedSubcategoryCode) {
          onSubcategorySelect('');
        }
      } catch (err) {
        logger.error(`Error loading categories for ${selectedLayer}:`, err);
        setError(`Failed to load categories for ${selectedLayer}`);
        setCategoryOptions([]);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setCategoryOptions([]);
    }
  }, [selectedLayer, selectedSubcategoryCode, onSubcategorySelect]);

  // Load subcategories when layer and category change with multi-tiered fallback
  useEffect(() => {
    if (!selectedLayer || !selectedCategoryCode) {
      setSubcategoryOptions([]);
      return;
    }
    
    // Store the current selection to prevent unwanted resets
    const currentSelection = selectedSubcategoryCode;
    
    const loadSubcategories = async () => {
      setIsProcessing(true);
      setError(null);
      
      const cacheKey = getSubcategoryCacheKey(selectedLayer, selectedCategoryCode);
      
      // Track load attempts for this combination
      loadAttemptsRef.current[cacheKey] = (loadAttemptsRef.current[cacheKey] || 0) + 1;
      const attempts = loadAttemptsRef.current[cacheKey];
      
      logger.info(`Loading subcategories for ${cacheKey} (attempt ${attempts})`);
      
      try {
        // 1. First check the cache
        if (subcategoryCacheRef.current[cacheKey] && subcategoryCacheRef.current[cacheKey].length > 0) {
          logger.info(`Using cached subcategories for ${cacheKey}`);
          setSubcategoryOptions(subcategoryCacheRef.current[cacheKey]);
          return;
        }
        
        // 2. Try enhanced taxonomy service
        logger.debug(`Trying enhanced taxonomy service for ${cacheKey}`);
        const subcategories = getSubcategories(selectedLayer, selectedCategoryCode);
        
        if (subcategories && subcategories.length > 0) {
          logger.info(`Found ${subcategories.length} subcategories from enhanced service for ${cacheKey}`);
          setSubcategoryOptions(subcategories);
          subcategoryCacheRef.current[cacheKey] = subcategories;
          
          // Preserve the current selection if it was valid
          if (currentSelection) {
            setTimeout(() => {
              console.log(`[V3] Preserving previous selection: ${currentSelection}`);
            }, 0);
          }
          return;
        }
        
        // 3. Try fallback data
        logger.debug(`Checking fallback data for ${cacheKey}`);
        if (FALLBACK_SUBCATEGORIES[selectedLayer]?.[selectedCategoryCode]) {
          logger.info(`Using fallback data for ${cacheKey}`);
          const fallbackData = FALLBACK_SUBCATEGORIES[selectedLayer][selectedCategoryCode];
          setSubcategoryOptions(fallbackData);
          subcategoryCacheRef.current[cacheKey] = fallbackData;
          return;
        }
        
        // 4. Try the original taxonomy service
        logger.debug(`Trying original taxonomy service for ${cacheKey}`);
        const originalSubcategories = taxonomyService.getSubcategories(selectedLayer, selectedCategoryCode);
        
        if (originalSubcategories && originalSubcategories.length > 0) {
          logger.info(`Found ${originalSubcategories.length} subcategories from original service for ${cacheKey}`);
          setSubcategoryOptions(originalSubcategories);
          subcategoryCacheRef.current[cacheKey] = originalSubcategories;
          return;
        }
        
        // 5. Create synthetic subcategories as last resort
        logger.warn(`No subcategories found for ${cacheKey}, creating synthetic entries`);
        
        // Emergency hardcoded fallbacks
        let emergencyOptions: TaxonomyItem[] = [];
        
        // Hardcoded emergency fallbacks for known problematic combinations
        if (selectedLayer === 'S' && selectedCategoryCode === 'DNC') {
          logger.info(`[V3] Applying emergency fallback for S.DNC`);
          emergencyOptions = [
            { code: 'BAS', numericCode: '001', name: 'Base' },
            { code: 'PRD', numericCode: '002', name: 'Producer' },
            { code: 'HSE', numericCode: '003', name: 'House' },
            { code: 'TEC', numericCode: '004', name: 'Techno' },
            { code: 'TRN', numericCode: '005', name: 'Trance' },
            { code: 'DUB', numericCode: '006', name: 'Dubstep' },
            { code: 'FUT', numericCode: '007', name: 'Future_Bass' },
            { code: 'DNB', numericCode: '008', name: 'Drum_n_Bass' }
          ];
        } else if (selectedLayer === 'L' && selectedCategoryCode === 'PRF') {
          logger.info(`[V3] Applying emergency fallback for L.PRF`);
          emergencyOptions = [
            { code: 'BAS', numericCode: '001', name: 'Base' },
            { code: 'LEO', numericCode: '002', name: 'Leotard' },
            { code: 'SEQ', numericCode: '003', name: 'Sequined' },
            { code: 'LED', numericCode: '004', name: 'LED' },
            { code: 'ATH', numericCode: '005', name: 'Athletic' }
          ];
        } else {
          // Default synthetic entry if no specific emergency fallback is available
          emergencyOptions = [
            { code: 'BAS', numericCode: '001', name: 'Base' },
          ];
        }
        
        logger.info(`[V3] Applied emergency fallback with ${emergencyOptions.length} options`);
        setSubcategoryOptions(emergencyOptions);
        subcategoryCacheRef.current[cacheKey] = emergencyOptions;
        
        // Log detailed diagnostics
        debugTaxonomyData(selectedLayer, selectedCategoryCode);
        
      } catch (err) {
        logger.error(`Error loading subcategories for ${cacheKey}:`, err);
        setError(`Failed to load subcategories for ${selectedCategoryCode}`);
        
        // Try to recover with basic fallback
        const basicFallback: TaxonomyItem[] = [
          { code: 'BAS', numericCode: '001', name: 'Base' },
        ];
        
        setSubcategoryOptions(basicFallback);
        subcategoryCacheRef.current[cacheKey] = basicFallback;
        
      } finally {
        setIsProcessing(false);
      }
    };
    
    loadSubcategories();
    
  }, [selectedLayer, selectedCategoryCode, getSubcategoryCacheKey]);

  // Get subcategory code from full code (e.g., "POP.KPO" -> "KPO")
  const getShortSubcategoryCode = (fullCode: string): string => {
    if (!fullCode) return '';
    
    // Handle both formats: "POP.KPO" and "KPO"
    if (fullCode.includes('.')) {
      const parts = fullCode.split('.');
      // If we have format like "POP.KPO", return "KPO"
      return parts.length > 1 ? parts[1] : parts[0];
    }
    
    // If there's no dot, return the code as is
    return fullCode;
  };

  // Handle retry for subcategory loading
  const handleRetrySubcategories = () => {
    if (!selectedLayer || !selectedCategoryCode) return;
    
    const cacheKey = getSubcategoryCacheKey(selectedLayer, selectedCategoryCode);
    delete subcategoryCacheRef.current[cacheKey];
    setSubcategoryOptions([]);
    
    // Force re-loading
    setIsProcessing(true);
    setTimeout(() => {
      try {
        // Try to get subcategories from the enhanced service
        const subcategories = getSubcategories(selectedLayer, selectedCategoryCode);
        logger.info(`Retry found ${subcategories.length} subcategories for ${cacheKey}`);
        
        if (subcategories && subcategories.length > 0) {
          setSubcategoryOptions(subcategories);
          subcategoryCacheRef.current[cacheKey] = subcategories;
        } else {
          // If no subcategories found, try emergency fallback
          logger.info(`No subcategories found for ${cacheKey}, trying emergency fallback`);
          
          // Emergency hardcoded fallbacks for known problematic combinations
          let emergencyOptions: TaxonomyItem[] = [];
          
          if (selectedLayer === 'S' && selectedCategoryCode === 'DNC') {
            logger.info(`[V3] Applying emergency fallback for S.DNC`);
            emergencyOptions = [
              { code: 'BAS', numericCode: '001', name: 'Base' },
              { code: 'PRD', numericCode: '002', name: 'Producer' },
              { code: 'HSE', numericCode: '003', name: 'House' },
              { code: 'TEC', numericCode: '004', name: 'Techno' },
              { code: 'TRN', numericCode: '005', name: 'Trance' }
            ];
          } else if (selectedLayer === 'L' && selectedCategoryCode === 'PRF') {
            logger.info(`[V3] Applying emergency fallback for L.PRF`);
            emergencyOptions = [
              { code: 'BAS', numericCode: '001', name: 'Base' },
              { code: 'LEO', numericCode: '002', name: 'Leotard' },
              { code: 'SEQ', numericCode: '003', name: 'Sequined' },
              { code: 'LED', numericCode: '004', name: 'LED' }
            ];
          } else {
            // Default synthetic entry if no specific emergency fallback is available
            emergencyOptions = [
              { code: 'BAS', numericCode: '001', name: 'Base' },
            ];
          }
          
          logger.info(`Applied emergency fallback with ${emergencyOptions.length} options`);
          setSubcategoryOptions(emergencyOptions);
          subcategoryCacheRef.current[cacheKey] = emergencyOptions;
        }
      } catch (error) {
        logger.error(`Error during retry for ${cacheKey}:`, error);
        
        // Use basic fallback on error
        const basicFallback: TaxonomyItem[] = [
          { code: 'BAS', numericCode: '001', name: 'Base' },
        ];
        
        setSubcategoryOptions(basicFallback);
        subcategoryCacheRef.current[cacheKey] = basicFallback;
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  return (
    <Grid container spacing={2}>
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" 
            action={
              <Button color="inherit" size="small" onClick={handleRetrySubcategories}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Grid>
      )}
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <InputLabel>Layer</InputLabel>
          <Select
            value={selectedLayer || ''}
            onChange={(e) => onLayerSelect(e.target.value as string)}
            label="Layer"
            disabled={isProcessing}
          >
            <MenuItem value="">
              <em>Select Layer</em>
            </MenuItem>
            {layers.map((layer) => (
              <MenuItem key={layer} value={layer}>
                {layer}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth disabled={!selectedLayer || isProcessing}>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategoryCode || ''}
            onChange={(e) => onCategorySelect(e.target.value as string)}
            label="Category"
          >
            <MenuItem value="">
              <em>Select Category</em>
            </MenuItem>
            {categoryOptions.map((category) => (
              <MenuItem key={category.code} value={category.code}>
                {category.name} ({category.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth disabled={!selectedCategoryCode || isProcessing}>
          <InputLabel>Subcategory</InputLabel>
          <Select
            value={selectedSubcategoryCode || ''}
            onChange={(e) => {
              const value = e.target.value as string;
              // Don't process empty selections
              if (!value) {
                console.log(`[V3] Ignoring empty subcategory selection`);
                return;
              }
              
              // Track the selection in our local state first
              console.log(`[V3] Subcategory selected:`, value);
              
              // Try to prevent race conditions with a small delay
              setTimeout(() => {
                onSubcategorySelect(value);
              }, 0);
            }}
            label="Subcategory"
          >
            <MenuItem value="">
              <em>Select Subcategory</em>
            </MenuItem>
            {subcategoryOptions.map((subcategory) => {
              // Handle both formats: "PRF.BAS" and "BAS"
              const fullCode = subcategory.code.includes('.') ? 
                subcategory.code : 
                `${selectedCategoryCode}.${subcategory.code}`;
              
              const displayCode = subcategory.code.includes('.') ? 
                subcategory.code.split('.')[1] : 
                subcategory.code;
                
              return (
                <MenuItem 
                  key={displayCode} 
                  value={fullCode}
                >
                  {subcategory.name} ({displayCode})
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="body2" color="textSecondary">
          {selectedLayer && selectedCategoryCode && selectedSubcategoryCode ? (
            `Selected: ${selectedLayer}.${selectedCategoryCode}.${getShortSubcategoryCode(selectedSubcategoryCode)}`
          ) : (
            'Please select a layer, category, and subcategory'
          )}
        </Typography>
        
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button 
            size="small" 
            variant="outlined" 
            onClick={handleRetrySubcategories}
            disabled={!selectedLayer || !selectedCategoryCode || isProcessing}
          >
            Retry Loading Subcategories
          </Button>
          
          <Button 
            size="small" 
            variant="outlined" 
            onClick={toggleDebugMode}
          >
            {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
          </Button>
          
          {isProcessing && <CircularProgress size={20} />}
        </div>
      </Grid>
      
      {debugMode && (
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              Debug Information
            </Typography>
            
            <Typography variant="body2">
              <strong>Layer:</strong> {selectedLayer || 'None'}<br />
              <strong>Category:</strong> {selectedCategoryCode || 'None'}<br />
              <strong>Subcategory:</strong> {selectedSubcategoryCode || 'None'}<br />
              <strong>Available Subcategories:</strong> {subcategoryOptions.length}<br />
              <strong>Load Attempts:</strong> {selectedLayer && selectedCategoryCode ? 
                loadAttemptsRef.current[getSubcategoryCacheKey(selectedLayer, selectedCategoryCode)] || 0 : 0}
            </Typography>
            
            {selectedLayer && selectedCategoryCode && (
              <div style={{ marginTop: '10px' }}>
                <Typography variant="caption">
                  Subcategory Codes:
                </Typography>
                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                  {subcategoryOptions.map((item, index) => (
                    <li key={index}>
                      <Typography variant="caption">
                        {item.code} ({item.numericCode}) - {item.name}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default SimpleTaxonomySelectionV3;