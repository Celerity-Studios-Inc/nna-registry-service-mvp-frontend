import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle,
  Paper,
  Chip,
  Tooltip,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { CategoryOption, SubcategoryOption } from '../../types/taxonomy.types';
import taxonomyService from '../../api/taxonomyService';
import NNAAddressPreview from './NNAAddressPreview';
import { getAlphabeticCode, convertHFNToMFA } from '../../api/codeMapping';
import taxonomyMapper from '../../api/taxonomyMapper.enhanced';
import { debugLog } from '../../utils/logger';
// import api from '../../api/api'; // Commented out as we're using the mock implementation

// Import enhanced taxonomy service
import { 
  getLayers, 
  getCategories, 
  getSubcategories,
  inspectTaxonomyStructure, 
  convertHFNtoMFA
} from '../../services/enhancedTaxonomyService';

interface TaxonomySelectionProps {
  layerCode: string;
  onCategorySelect: (category: CategoryOption) => void;
  onSubcategorySelect: (
    subcategory: SubcategoryOption,
    isDoubleClick?: boolean
  ) => void;
  selectedCategoryCode?: string;
  subcategoryNumericCode?: string;
  selectedSubcategoryCode?: string;
  categoryName?: string;
  subcategoryName?: string;
  onNNAAddressChange?: (
    humanFriendlyName: string,
    machineFriendlyAddress: string,
    sequentialNumber: number,
    originalSubcategoryCode?: string // Add parameter for original subcategory code
  ) => void;
}

const TaxonomySelection: React.FC<TaxonomySelectionProps> = ({
  layerCode,
  onCategorySelect,
  onSubcategorySelect,
  selectedCategoryCode,
  categoryName,
  subcategoryName,
  selectedSubcategoryCode,
  subcategoryNumericCode,
  onNNAAddressChange,
}) => {
  debugLog('categoryName:', categoryName || 'undefined');

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sequentialNumber, setSequentialNumber] = useState<number>(1);
  const [isUnique, setIsUnique] = useState<boolean>(true);
  const [sequential, setSequential] = useState('001');
  const [checkingUniqueness, setCheckingUniqueness] = useState<boolean>(false);

  // Fetch categories when layer changes
  useEffect(() => {
    const fetchCategories = async () => {
      if (!layerCode) {
        setCategories([]);
        return;
      }

      try {
        setLoading(true);
        
        // Debug logging
        debugLog(`=== TAXONOMY DEBUG: Fetching categories for layer ${layerCode} ===`);
        
        // Use enhanced service for category loading
        const enhancedCategoryItems = await getCategories(layerCode);
        debugLog('Enhanced service result:', enhancedCategoryItems);
        
        // Map TaxonomyItem[] to CategoryOption[]
        const categoryOptions = enhancedCategoryItems.map(item => ({
          id: item.code, // Add id field for compatibility
          code: item.code,
          name: item.name,
          numericCode: item.numericCode
        }));
        
        // Also get original categories for comparison
        const originalCategoryOptions = taxonomyService.getCategories(layerCode);
        debugLog('Original service result:', originalCategoryOptions);
        
        // Enhanced debugging for category display
        categoryOptions.forEach(category => {
          // For numeric category codes, we need to make sure we display the alphabetic version
          if (/^\d+$/.test(category.code)) {
            debugLog(`Category with numeric code: ${category.code} (${category.name})`);
            debugLog(`This will display as: ${getAlphabeticCode(layerCode, category.code, category.name)}`);
          }
        });

        // Use the enhanced service results
        setCategories(categoryOptions);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load categories'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [layerCode]);

  const fetchSequential = async () => {
    try {
      debugLog(layerCode, 'layerCode');

      // For development, use the mock implementation in taxonomyService
      // instead of making the actual API call that results in 404
      // IMPORTANT: Always use the 3-letter alphabetic codes (not numeric codes)
      // for consistent mapping between HFN and MFA
      // Make sure we're using the 3-letter codes (POP, HPM) and not numeric codes (001, 007)
      const categoryCode = selectedCategoryCode || '';
      const subcategoryCode = selectedSubcategoryCode || '';

      debugLog(`Using category code: ${categoryCode}, subcategory code: ${subcategoryCode}`);

      const response = await taxonomyService.getSequentialNumber(
        layerCode,
        categoryCode,
        subcategoryCode
      );

      setSequential(response.sequential);
      
      // Original implementation - uncomment when API is ready
      /*
      const response = await api.post<{ sequential: string }>(
        '/assets/new/sequential',
        {
          layer: layerCode,
          category: categoryName,
          subcategory: subcategoryName,
        }
      );
      setSequential(response.data.sequential);
      */
    } catch (error) {
      debugLog('Error fetching taxonomy data:', error);
    }
  };

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!layerCode || !selectedCategoryCode) {
        setSubcategories([]);
        return;
      }

      try {
        setLoading(true);
        
        // Run taxonomy data debugging for problematic combinations
        if ((layerCode === 'L' && selectedCategoryCode === 'PRF') || 
            (layerCode === 'S' && selectedCategoryCode === 'DNC') ||
            (layerCode === 'S' && selectedCategoryCode === 'POP') ||
            (layerCode === 'W' && selectedCategoryCode === 'BCH')) {
          debugLog(`[DEBUG] Known problematic combination detected: ${layerCode}.${selectedCategoryCode}`);
          // Use the inspection utility from enhanced service
          const inspection = await inspectTaxonomyStructure(layerCode, selectedCategoryCode);
          debugLog('Inspection result:', inspection);
        }
        
        // Use enhanced service to get subcategories
        const enhancedSubcategoryItems = await getSubcategories(layerCode, selectedCategoryCode);
        debugLog('Enhanced service subcategory result:', enhancedSubcategoryItems);
        
        // Map TaxonomyItem[] to SubcategoryOption[]
        const enhancedSubcategoryOptions = enhancedSubcategoryItems.map(item => ({
          id: item.code, // Add id field for compatibility
          code: item.code,
          name: item.name,
          numericCode: item.numericCode
        }));
        
        // Also get original subcategories for comparison
        const originalSubcategoryOptions = taxonomyService.getSubcategories(
          layerCode,
          selectedCategoryCode
        );
        debugLog('Original service subcategory result:', originalSubcategoryOptions);
        
        // Log comprehensive debug info
        debugLog(`[DEBUG] Subcategory fetch for ${layerCode}.${selectedCategoryCode}:`, {
          enhancedResults: {
            success: Array.isArray(enhancedSubcategoryItems),
            count: enhancedSubcategoryItems.length,
            isEmpty: enhancedSubcategoryItems.length === 0
          },
          originalResults: {
            success: Array.isArray(originalSubcategoryOptions),
            count: Array.isArray(originalSubcategoryOptions) ? originalSubcategoryOptions.length : 0,
            isEmpty: Array.isArray(originalSubcategoryOptions) && originalSubcategoryOptions.length === 0
          }
        });

        // Use the enhanced service results
        setSubcategories(enhancedSubcategoryOptions);
        setError(null);
      } catch (err) {
        console.error(`[ERROR] Failed to fetch subcategories for ${layerCode}.${selectedCategoryCode}:`, err);
        setError(
          err instanceof Error ? err.message : 'Failed to load subcategories'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [layerCode, selectedCategoryCode]);

  // Check NNA address uniqueness when taxonomy selection is complete
  useEffect(() => {
    const checkAddressUniqueness = async () => {
      if (!layerCode || !selectedCategoryCode || !selectedSubcategoryCode) {
        return;
      }

      try {
        setCheckingUniqueness(true);

        await fetchSequential();

        setIsUnique(true);

        // Generate and propagate NNA address values when taxonomy is complete
        if (onNNAAddressChange) {
          // IMPORTANT: Get the proper alphabetic codes from the category/subcategory objects
          // This ensures that we're using the correct codes throughout the application
          const selectedCategory = categories.find(cat => cat.code === selectedCategoryCode);
          const selectedSubcategory = subcategories.find(sub => sub.code === selectedSubcategoryCode);

          // Use the alphabetic codes from the objects
          let categoryAlpha = selectedCategory ? selectedCategory.code : selectedCategoryCode;
          let subcategoryAlpha = selectedSubcategory ? selectedSubcategory.code : selectedSubcategoryCode;

          // Make sure we're using upper case for all codes
          categoryAlpha = categoryAlpha.toUpperCase();
          subcategoryAlpha = subcategoryAlpha.toUpperCase();

          // If we have numeric codes, convert them to alphabetic for consistency
          if (/^\d+$/.test(categoryAlpha)) {
            categoryAlpha = getAlphabeticCode(layerCode, categoryAlpha, '');
            debugLog(`Converted numeric category code to alphabetic: ${categoryAlpha}`);
          }

          // Create the properly formatted HFN with the alphabetic codes
          const hfnAddress = `${layerCode}.${categoryAlpha}.${subcategoryAlpha}.${sequential}`;

          // Generate the MFA using both the original and enhanced services for comparison
          const originalMfaAddress = convertHFNToMFA(hfnAddress);
          const enhancedMfaAddress = await convertHFNtoMFA(hfnAddress);
          
          debugLog(`MFA conversion comparison:`, {
            hfnAddress,
            originalMfaAddress,
            enhancedMfaAddress,
            match: originalMfaAddress === enhancedMfaAddress ? "MATCH ✅" : "MISMATCH ❌"
          });
          
          // Use the enhanced conversion for MFA
          const mfaAddress = enhancedMfaAddress;

          // IMPORTANT: For display in preview, we will show ".nnn" but we still need to pass
          // the real sequential number to the form for backend API to ensure correct registration
          const sequentialNum = parseInt(sequential, 10) || 1;

          debugLog(`Generated NNA addresses for form state: HFN=${hfnAddress}, MFA=${mfaAddress}, seq=${sequentialNum}`);
          debugLog(`Note: Preview will display with '.000' instead of the actual sequential number`);

          debugLog(`Generated MFA conversion for ${hfnAddress} -> ${mfaAddress}`);

          // Store the original subcategory code to preserve it after backend normalization
          // This will be used to display the correct subcategory in the success screen
          const originalSubcategoryCode = subcategoryAlpha;
          debugLog(`Storing original subcategory code: ${originalSubcategoryCode} for display override`);

          // Always pass the original 3-letter codes along with the MFA and HFN
          // This ensures consistency between steps
          onNNAAddressChange(hfnAddress, mfaAddress, sequentialNum, originalSubcategoryCode);
        }
      } catch (err) {
        console.error('Error checking address uniqueness:', err);
      } finally {
        setCheckingUniqueness(false);
      }
    };

    checkAddressUniqueness();
  }, [
    layerCode,
    selectedCategoryCode,
    selectedSubcategoryCode,
    sequentialNumber,
    sequential, // Added sequential as dependency
    onNNAAddressChange,
  ]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const categoryCode = event.target.value;

    // Find the selected category
    const selectedCategory = categories.find(cat => cat.code === categoryCode);

    if (selectedCategory) {
      // Reset sequential number when category changes
      setSequentialNumber(1);
      onCategorySelect(selectedCategory);
    }
  };

  const handleSubcategoryChange = (
    event: SelectChangeEvent<string>,
    isDoubleClick: boolean = false
  ) => {
    const subcategoryCode = event.target.value;

    // Find the selected subcategory
    const selectedSubcategory = subcategories.find(
      subcat => subcat.code === subcategoryCode
    );

    if (selectedSubcategory) {
      // Reset sequential number when subcategory changes
      setSequentialNumber(1);
      onSubcategorySelect(selectedSubcategory, isDoubleClick);
    }
  };

  if (!layerCode) {
    return <Alert severity="info">Please select a layer first</Alert>;
  }

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select Category and Subcategory
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the appropriate category and subcategory for your asset based on
        the selected layer.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Add layer name display */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          {(() => {
            // Map layer codes to full names
            const layerNames: Record<string, string> = {
              'G': 'Songs',
              'S': 'Stars',
              'L': 'Looks',
              'M': 'Moves',
              'W': 'Worlds',
              'V': 'Videos',
              'B': 'Branded Assets',
              'C': 'Composites',
              'T': 'Training Data',
              'P': 'Patterns',
            };
            return `${layerNames[layerCode] || `Layer ${layerCode}`} (${layerCode})`;
          })()}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ position: 'relative' }}>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              right: 16,
              marginTop: '-12px',
              zIndex: 1,
            }}
          />
        )}

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="category-select-label">Category</InputLabel>
          <Select
            labelId="category-select-label"
            id="category-select"
            value={selectedCategoryCode || ''}
            label="Category"
            onChange={handleCategoryChange}
            disabled={loading || categories.length === 0}
          >
            <MenuItem value="">
              <em>Select a category</em>
            </MenuItem>
            {categories.map(category => (
              <MenuItem key={category.code} value={category.code}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography>{category.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Human-Friendly Name (3-letter code)">
                      <Chip
                        label={category.code}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{
                          ml: 1,
                          mr: 1,
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                        }}
                      />
                    </Tooltip>
                    <Tooltip title="Machine-Friendly Address (3-digit code)">
                      <Chip
                        label={category.numericCode ? (typeof category.numericCode === 'string' ? category.numericCode.padStart(3, '0') : category.numericCode.toString().padStart(3, '0')) : '000'}
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          fullWidth
          disabled={!selectedCategoryCode || subcategories.length === 0}
        >
          <InputLabel id="subcategory-select-label">Subcategory</InputLabel>
          <Select
            labelId="subcategory-select-label"
            id="subcategory-select"
            value={selectedSubcategoryCode || ''}
            label="Subcategory"
            onChange={e => handleSubcategoryChange(e, false)}
            disabled={
              loading || !selectedCategoryCode || subcategories.length === 0
            }
          >
            <MenuItem value="">
              <em>Select a subcategory</em>
            </MenuItem>
            {subcategories.map(subcategory => (
              <MenuItem
                key={subcategory.code}
                value={subcategory.code}
                onDoubleClick={() => {
                  debugLog(
                    `Double clicked on subcategory: ${subcategory.name} (${subcategory.code})`
                  );
                  onSubcategorySelect(subcategory, true);
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Typography>{subcategory.name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title="Human-Friendly Name (3-letter code)">
                      <Chip
                        label={subcategory.code}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ mr: 1, fontSize: '0.7rem', fontWeight: 'bold' }}
                      />
                    </Tooltip>
                    <Tooltip title="Machine-Friendly Address (3-digit code)">
                      <Chip
                        label={subcategory.numericCode ? (typeof subcategory.numericCode === 'string' ? subcategory.numericCode.padStart(3, '0') : subcategory.numericCode.toString().padStart(3, '0')) : '000'}
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>


        {selectedCategoryCode && selectedSubcategoryCode && (
          <>
            <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Selected Taxonomy:
              </Typography>
              <Typography>
                {taxonomyService.getTaxonomyPath(
                  layerCode,
                  selectedCategoryCode,
                  subcategoryNumericCode
                ) || 'Invalid selection'}
              </Typography>
            </Box>

            {/* NNA Address Preview */}
            <NNAAddressPreview
              layerCode={layerCode}
              subcategoryNumericCode={subcategoryNumericCode}
              categoryCode={selectedCategoryCode}
              subcategoryCode={selectedSubcategoryCode}
              sequentialNumber={sequential}
              isUnique={isUnique}
              checkingUniqueness={checkingUniqueness}
              validationError={
                !selectedCategoryCode || !selectedSubcategoryCode
                  ? 'Incomplete taxonomy selection'
                  : undefined
              }
            />
          </>
        )}
      </Box>
    </Paper>
  );
};

export default TaxonomySelection;