/**
 * SimpleTaxonomySelectionV3
 * 
 * A completely new implementation of the taxonomy selection component that uses
 * the enhanced taxonomy service for improved reliability and error handling.
 * 
 * Key features:
 * - Multi-tiered fallback system for subcategory loading
 * - Enhanced error handling and debug information
 * - Card-based grid layout for better visual representation
 * - Better state management for layer/category/subcategory selection
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Grid, Typography, Button, CircularProgress, Alert, Box, Card,
  CardContent, CardActionArea, Chip, Tooltip
} from '@mui/material';
import { isProduction, isDevelopment, environmentSafeLog } from '../../utils/environment';
import {
  getLayers,
  getCategories,
  getSubcategories,
  debugTaxonomyData
} from '../../services/enhancedTaxonomyService';
import { FALLBACK_SUBCATEGORIES } from '../../services/taxonomyFallbackData';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { TaxonomyItem } from '../../types/taxonomy.types';
import { logger } from '../../utils/logger';
import '../../styles/SimpleTaxonomySelection.css';

// Layer display names for better UX
const LAYER_NAMES: Record<string, string> = {
  G: 'Generics',
  S: 'Stars',
  L: 'Looks',
  M: 'Moves',
  W: 'Worlds',
  B: 'Beats',
  P: 'Places',
  T: 'Things',
  C: 'Concepts',
  R: 'Realms'
};

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
  const isMounted = useRef(true);

  // Helper to get a cache key for subcategory lookups
  const getSubcategoryCacheKey = useCallback((layer: string, categoryCode: string): string => {
    return `${layer}.${categoryCode}`;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
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
        
        if (isMounted.current) {
          setCategoryOptions(categories);
          
          // Clear subcategory if layer changes
          if (selectedSubcategoryCode) {
            onSubcategorySelect('');
          }
        }
      } catch (err) {
        logger.error(`Error loading categories for ${selectedLayer}:`, err);
        if (isMounted.current) {
          setError(`Failed to load categories for ${selectedLayer}`);
          setCategoryOptions([]);
        }
      } finally {
        if (isMounted.current) {
          setIsProcessing(false);
        }
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
      
      try {
        // 1. First check the cache
        if (subcategoryCacheRef.current[cacheKey] && subcategoryCacheRef.current[cacheKey].length > 0) {
          logger.info(`Using cached subcategories for ${cacheKey}`);
          if (isMounted.current) {
            setSubcategoryOptions(subcategoryCacheRef.current[cacheKey]);
          }
          return;
        }
        
        // 2. Try enhanced taxonomy service
        logger.debug(`Trying enhanced taxonomy service for ${cacheKey}`);
        const subcategories = getSubcategories(selectedLayer, selectedCategoryCode);
        
        if (subcategories && subcategories.length > 0) {
          logger.info(`Found ${subcategories.length} subcategories from enhanced service for ${cacheKey}`);
          if (isMounted.current) {
            setSubcategoryOptions(subcategories);
            subcategoryCacheRef.current[cacheKey] = subcategories;
          }
          return;
        }
        
        // 3. Try fallback data
        logger.debug(`Checking fallback data for ${cacheKey}`);
        if (FALLBACK_SUBCATEGORIES[selectedLayer]?.[selectedCategoryCode]) {
          logger.info(`Using fallback data for ${cacheKey}`);
          const fallbackData = FALLBACK_SUBCATEGORIES[selectedLayer][selectedCategoryCode];
          if (isMounted.current) {
            setSubcategoryOptions(fallbackData);
            subcategoryCacheRef.current[cacheKey] = fallbackData;
          }
          return;
        }
        
        // 4. Try the original taxonomy service
        logger.debug(`Trying original taxonomy service for ${cacheKey}`);
        const originalSubcategories = taxonomyService.getSubcategories(selectedLayer, selectedCategoryCode);
        
        if (originalSubcategories && originalSubcategories.length > 0) {
          logger.info(`Found ${originalSubcategories.length} subcategories from original service for ${cacheKey}`);
          if (isMounted.current) {
            setSubcategoryOptions(originalSubcategories);
            subcategoryCacheRef.current[cacheKey] = originalSubcategories;
          }
          return;
        }
        
        // 5. Create synthetic subcategories as last resort
        logger.warn(`No subcategories found for ${cacheKey}, creating synthetic entries`);
        
        // Emergency hardcoded fallbacks
        let emergencyOptions: TaxonomyItem[] = [];
        
        // Hardcoded emergency fallbacks for known problematic combinations
        if (selectedLayer === 'S' && selectedCategoryCode === 'DNC') {
          logger.info(`Applying emergency fallback for S.DNC`);
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
          logger.info(`Applying emergency fallback for L.PRF`);
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
        
        logger.info(`Applied emergency fallback with ${emergencyOptions.length} options`);
        if (isMounted.current) {
          setSubcategoryOptions(emergencyOptions);
          subcategoryCacheRef.current[cacheKey] = emergencyOptions;
        }
        
        // Log detailed diagnostics
        debugTaxonomyData(selectedLayer, selectedCategoryCode);
        
      } catch (err) {
        logger.error(`Error loading subcategories for ${cacheKey}:`, err);
        if (isMounted.current) {
          setError(`Failed to load subcategories for ${selectedCategoryCode}`);
          
          // Try to recover with basic fallback
          const basicFallback: TaxonomyItem[] = [
            { code: 'BAS', numericCode: '001', name: 'Base' },
          ];
          
          setSubcategoryOptions(basicFallback);
          subcategoryCacheRef.current[cacheKey] = basicFallback;
        }
      } finally {
        if (isMounted.current) {
          setIsProcessing(false);
        }
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
        
        if (subcategories && subcategories.length > 0 && isMounted.current) {
          setSubcategoryOptions(subcategories);
          subcategoryCacheRef.current[cacheKey] = subcategories;
        } else {
          // If no subcategories found, try emergency fallback
          logger.info(`No subcategories found for ${cacheKey}, trying emergency fallback`);
          
          if (!isMounted.current) return;
          
          // Emergency hardcoded fallbacks for known problematic combinations
          let emergencyOptions: TaxonomyItem[] = [];
          
          if (selectedLayer === 'S' && selectedCategoryCode === 'DNC') {
            logger.info(`Applying emergency fallback for S.DNC`);
            emergencyOptions = [
              { code: 'BAS', numericCode: '001', name: 'Base' },
              { code: 'PRD', numericCode: '002', name: 'Producer' },
              { code: 'HSE', numericCode: '003', name: 'House' },
              { code: 'TEC', numericCode: '004', name: 'Techno' },
              { code: 'TRN', numericCode: '005', name: 'Trance' }
            ];
          } else if (selectedLayer === 'L' && selectedCategoryCode === 'PRF') {
            logger.info(`Applying emergency fallback for L.PRF`);
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
        
        if (!isMounted.current) return;
        
        // Use basic fallback on error
        const basicFallback: TaxonomyItem[] = [
          { code: 'BAS', numericCode: '001', name: 'Base' },
        ];
        
        setSubcategoryOptions(basicFallback);
        subcategoryCacheRef.current[cacheKey] = basicFallback;
      } finally {
        if (isMounted.current) {
          setIsProcessing(false);
        }
      }
    }, 100);
  };

  // Toggle debug mode - only functional in development environment
  const toggleDebugMode = () => {
    // Don't allow toggling in production
    if (isProduction()) {
      return;
    }
    
    const newMode = !debugMode;
    setDebugMode(newMode);
    
    // Store debug mode preference in sessionStorage
    try {
      if (typeof window !== 'undefined' && sessionStorage) {
        sessionStorage.setItem('taxonomyDebugMode', newMode.toString());
      }
    } catch (e) {
      environmentSafeLog('Could not store debug mode preference in sessionStorage');
    }
  };
  
  // Initialize debug mode from query params or sessionStorage
  useEffect(() => {
    try {
      // Always disable debug mode in production environment
      if (isProduction()) {
        setDebugMode(false);
        // Clear any stored debug mode preference in production
        if (typeof window !== 'undefined' && sessionStorage) {
          sessionStorage.removeItem('taxonomyDebugMode');
        }
        return;
      }
      
      // In development, check for debug parameters
      const hasDebugParam = typeof window !== 'undefined' && 
        (window.location.search.includes('debug=true') || 
         window.location.search.includes('debug_mode=true'));
      
      // Check for stored debug mode preference
      let storedDebugMode = false;
      try {
        if (typeof window !== 'undefined' && sessionStorage) {
          storedDebugMode = sessionStorage.getItem('taxonomyDebugMode') === 'true';
        }
      } catch (e) {
        // Silently fail if sessionStorage is not available
      }
      
      // Log the debug mode conditions for troubleshooting (only in development)
      environmentSafeLog('[DEBUG PANEL] Environment checks:', {
        isDevelopment: isDevelopment(),
        hasDebugParam,
        storedDebugMode,
        'process.env.NODE_ENV': process.env.NODE_ENV,
        'window.location.search': window.location.search
      });
      
      // Only enable debug mode in development and if explicitly requested
      if (isDevelopment() && (hasDebugParam || storedDebugMode)) {
        setDebugMode(true);
        environmentSafeLog('[DEBUG PANEL] Debug mode enabled');
      } else {
        setDebugMode(false);
        environmentSafeLog('[DEBUG PANEL] Debug mode disabled');
      }
    } catch (error) {
      environmentSafeLog('[DEBUG PANEL] Error initializing debug mode:', error);
      setDebugMode(false);
    }
  }, []);

  // Format and display a TaxonomyItem
  const renderTaxonomyCard = (
    item: TaxonomyItem | string, 
    isActive: boolean,
    onClick: () => void,
    type: 'layer' | 'category' | 'subcategory'
  ) => {
    // For layer type, item is a string
    if (type === 'layer') {
      const layerCode = item as string;
      const layerName = LAYER_NAMES[layerCode] || layerCode;
      
      return (
        <Card 
          className={`taxonomy-item ${isActive ? 'active' : ''}`}
          elevation={isActive ? 3 : 1}
          onClick={onClick}
          sx={{
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            bgcolor: isActive ? '#e8f4ff' : '#fff',
            borderColor: isActive ? '#007bff' : '#ddd',
            border: isActive ? '2px solid #007bff' : '1px solid #ddd',
            height: '100%',
            minHeight: '110px',
            maxHeight: '110px',
            display: 'flex',
            flexDirection: 'column',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3,
              borderColor: '#aaa',
              bgcolor: isActive ? '#e8f4ff' : '#f8f9fa',
            }
          }}
        >
          <CardActionArea>
            <CardContent>
              <Typography variant="h6" component="div" align="center" sx={{ fontWeight: 'bold' }}>
                {layerCode}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
                {layerName}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      );
    }
    
    // For category and subcategory types, item is a TaxonomyItem
    const taxonomyItem = item as TaxonomyItem;
    const displayName = taxonomyItem.name || taxonomyItem.code;
    
    return (
      <Card 
        className={`taxonomy-item ${isActive ? 'active' : ''}`}
        elevation={isActive ? 3 : 1}
        onClick={onClick}
        sx={{
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          bgcolor: isActive ? '#e8f4ff' : '#fff',
          borderColor: isActive ? '#007bff' : '#ddd',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3,
            borderColor: '#aaa',
            bgcolor: isActive ? '#e8f4ff' : '#f8f9fa',
          }
        }}
      >
        <CardActionArea>
          <CardContent>
            <Typography variant="body1" component="div" fontWeight="bold" noWrap sx={{ mb: 0.5, fontSize: '0.95rem' }}>
              {taxonomyItem.code}
            </Typography>
            <Tooltip title={displayName.replace(/_/g, ' ')} placement="top" arrow enterDelay={300} enterNextDelay={300}>
              <Typography variant="body2" color="text.secondary" sx={{ 
                height: '40px', 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.2,
                fontSize: '0.875rem',
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                paddingLeft: '2px',
                paddingRight: '2px'
              }}>
                {displayName.replace(/_/g, ' ')}
              </Typography>
            </Tooltip>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {taxonomyItem.numericCode}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  return (
    <div className="simple-taxonomy-selection">
      {error && (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRetrySubcategories}>
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* We're keeping the layer selection in RegisterAssetPage, so we no longer need it here */}

      <Box mb={3} sx={{ opacity: selectedLayer ? 1 : 0.5 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Step 2.1: Select Category
        </Typography>
        <div className="taxonomy-section">
          <div className="taxonomy-section-title">
            <span>Category</span>
            {selectedCategoryCode && (
              <span className="category-indicator">{selectedCategoryCode}</span>
            )}
          </div>
          <div className={`taxonomy-items fixed-grid ${isProcessing ? 'loading' : ''}`}>
            {isProcessing && categoryOptions.length === 0 ? (
              <div className="taxonomy-loading">Loading categories...</div>
            ) : categoryOptions.length > 0 ? (
              categoryOptions.map((category) => (
                <div key={category.code} className="taxonomy-item-wrapper">
                  {renderTaxonomyCard(
                    category,
                    category.code === selectedCategoryCode,
                    () => onCategorySelect(category.code),
                    'category'
                  )}
                </div>
              ))
            ) : selectedLayer ? (
              <div className="taxonomy-empty">
                No categories found
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setCategoryOptions([]);
                    setTimeout(() => {
                      const categories = getCategories(selectedLayer);
                      setCategoryOptions(categories);
                    }, 100);
                  }}
                  sx={{ mt: 1 }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="taxonomy-empty">Please select a layer first</div>
            )}
          </div>
        </div>
      </Box>

      <Box mb={3} sx={{ opacity: selectedCategoryCode ? 1 : 0.5 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
          Step 2.2: Select Subcategory
        </Typography>
        <div className="taxonomy-section">
          <div className="taxonomy-section-title">
            <span>Subcategory</span>
            {selectedSubcategoryCode && (
              <span className="category-indicator">{selectedSubcategoryCode}</span>
            )}
          </div>
          <div className={`taxonomy-items fixed-grid ${isProcessing ? 'loading' : ''}`}>
            {isProcessing && subcategoryOptions.length === 0 ? (
              <div className="taxonomy-loading">Loading subcategories...</div>
            ) : subcategoryOptions.length > 0 ? (
              subcategoryOptions.map((subcategory) => {
                // Handle both formats: "PRF.BAS" and "BAS"
                const displayCode = subcategory.code.includes('.') ? 
                  subcategory.code.split('.')[1] : 
                  subcategory.code;
                
                return (
                  <div key={displayCode} className="taxonomy-item-wrapper">
                    {renderTaxonomyCard(
                      subcategory,
                      displayCode === selectedSubcategoryCode,
                      () => {
                        setTimeout(() => {
                          onSubcategorySelect(displayCode);
                        }, 0);
                      },
                      'subcategory'
                    )}
                  </div>
                );
              })
            ) : selectedCategoryCode ? (
              <div className="taxonomy-empty">
                No subcategories found
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleRetrySubcategories}
                  sx={{ mt: 1 }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="taxonomy-empty">Please select a category first</div>
            )}
          </div>
        </div>
      </Box>

      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="textSecondary">
          {selectedLayer && selectedCategoryCode && selectedSubcategoryCode ? (
            <Chip 
              label={`Selected: ${selectedLayer}.${selectedCategoryCode}.${getShortSubcategoryCode(selectedSubcategoryCode)}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}
            />
          ) : (
            'Please select a layer, category, and subcategory'
          )}
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1}>
          {/* Debug button completely hidden in production */}
          {process.env.NODE_ENV !== 'production' && window.location.search.includes('debug=true') && (
            <Button 
              size="small" 
              variant="outlined" 
              onClick={toggleDebugMode}
            >
              {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
            </Button>
          )}
          
          {isProcessing && <CircularProgress size={20} />}
        </Box>
      </Box>
      
      {/* Debug info completely hidden in production */}
      {debugMode && process.env.NODE_ENV !== 'production' && window.location.search.includes('debug=true') && (
        <Alert severity="info" sx={{ mt: 2 }}>
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
        </Alert>
      )}
    </div>
  );
};

export default SimpleTaxonomySelectionV3;