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
  Grid,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { CategoryOption, SubcategoryOption } from '../../types/taxonomy.types';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { logger } from '../../utils/logger';
import InfoIcon from '@mui/icons-material/Info';
import { formatNNAAddressForDisplay } from '../../api/codeMapping.enhanced';

interface TaxonomySelection {
  layer: string;
  category: string;
  subcategory: string;
}

interface DropdownBasedTaxonomySelectorProps {
  layerCode: string;
  onCategorySelect: (category: CategoryOption) => void;
  onSubcategorySelect: (subcategory: SubcategoryOption, isDoubleClick?: boolean) => void;
  selectedCategoryCode?: string;
  selectedSubcategoryCode?: string;
  onNNAAddressChange?: (
    humanFriendlyName: string,
    machineFriendlyAddress: string,
    sequentialNumber: number,
    originalSubcategoryCode?: string
  ) => void;
}

/**
 * DropdownBasedTaxonomySelector
 * 
 * A dropdown-based taxonomy selector that combines the best of both previous implementations:
 * - Uses the robust taxonomy data provider from SimpleTaxonomySelectionV2
 * - Uses the dropdown UI from the original TaxonomySelection for better stability
 * - Handles special cases (S.POP.HPM) correctly
 * - Provides consistent HFN/MFA output
 */
const DropdownBasedTaxonomySelector: React.FC<DropdownBasedTaxonomySelectorProps> = ({
  layerCode,
  onCategorySelect,
  onSubcategorySelect,
  selectedCategoryCode,
  selectedSubcategoryCode,
  onNNAAddressChange,
}) => {
  // States for UI
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [loading, setLoading] = useState<{
    categories: boolean;
    subcategories: boolean;
    sequential: boolean;
  }>({
    categories: false,
    subcategories: false,
    sequential: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [sequential, setSequential] = useState('001');
  
  // States for address generation
  const [hfn, setHfn] = useState('');
  const [mfa, setMfa] = useState('');

  // Fetch categories when layer changes
  useEffect(() => {
    const fetchCategories = async () => {
      if (!layerCode) {
        setCategories([]);
        return;
      }

      try {
        setLoading(prev => ({ ...prev, categories: true }));
        setError(null);
        
        // Get categories from taxonomy service
        const categoryOptions = taxonomyService.getCategories(layerCode);
        logger.debug(`Loaded ${categoryOptions.length} categories for layer ${layerCode}`);
        
        setCategories(categoryOptions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
        logger.error(`Error loading categories for layer ${layerCode}: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };

    fetchCategories();
  }, [layerCode]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!layerCode || !selectedCategoryCode) {
        setSubcategories([]);
        return;
      }

      try {
        setLoading(prev => ({ ...prev, subcategories: true }));
        setError(null);
        
        // Get subcategories from taxonomy service
        const subcategoryOptions = taxonomyService.getSubcategories(layerCode, selectedCategoryCode);
        logger.debug(`Loaded ${subcategoryOptions.length} subcategories for ${layerCode}.${selectedCategoryCode}`);
        
        setSubcategories(subcategoryOptions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load subcategories';
        logger.error(`Error loading subcategories for ${layerCode}.${selectedCategoryCode}: ${errorMessage}`);
        setError(errorMessage);
        
        // Handle special cases here if subcategory loading fails
        if (layerCode === 'S' && selectedCategoryCode === 'POP') {
          logger.info('Applying fallback for S.POP - using hardcoded subcategories');
          setSubcategories([
            { code: 'BAS', name: 'Base Pop Stars', numericCode: '001' },
            { code: 'KPO', name: 'K-Pop Stars', numericCode: '002' },
            { code: 'HPM', name: 'Hipster Male Stars', numericCode: '003' }
          ]);
        } else if (layerCode === 'W' && selectedCategoryCode === 'BCH') {
          logger.info('Applying fallback for W.BCH - using hardcoded subcategories');
          setSubcategories([
            { code: 'SUN', name: 'Sunny Beach', numericCode: '001' },
            { code: 'TRP', name: 'Tropical Beach', numericCode: '002' }
          ]);
        }
      } finally {
        setLoading(prev => ({ ...prev, subcategories: false }));
      }
    };

    fetchSubcategories();
  }, [layerCode, selectedCategoryCode]);

  // Fetch sequential number when taxonomy selection is complete
  useEffect(() => {
    const fetchSequential = async () => {
      if (!layerCode || !selectedCategoryCode || !selectedSubcategoryCode) {
        return;
      }

      try {
        setLoading(prev => ({ ...prev, sequential: true }));
        
        // Default to '001' for sequential number since API integration is not complete
        // In the future this would call an actual API endpoint to get the next available sequential number
        // This is a simplified version for now
        const defaultSequential = '001';
        setSequential(defaultSequential);
        logger.debug(`Using sequential number: ${defaultSequential} for ${layerCode}.${selectedCategoryCode}.${selectedSubcategoryCode}`);
      } catch (err) {
        logger.error(`Error fetching sequential number: ${err instanceof Error ? err.message : String(err)}`);
        // Use default sequential number if fetch fails
        setSequential('001');
      } finally {
        setLoading(prev => ({ ...prev, sequential: false }));
      }
    };

    fetchSequential();
  }, [layerCode, selectedCategoryCode, selectedSubcategoryCode]);

  // Generate HFN and MFA when taxonomy selection and sequential number are available
  useEffect(() => {
    const generateAddresses = () => {
      if (!layerCode || !selectedCategoryCode || !selectedSubcategoryCode) {
        setHfn('');
        setMfa('');
        return;
      }

      try {
        // Use enhanced formatter from codeMapping.enhanced for consistent addressing
        const { hfn: formattedHfn, mfa: formattedMfa } = formatNNAAddressForDisplay(
          layerCode,
          selectedCategoryCode,
          selectedSubcategoryCode,
          sequential
        );
        
        setHfn(formattedHfn);
        setMfa(formattedMfa);
        
        logger.debug(`Generated addresses: HFN=${formattedHfn}, MFA=${formattedMfa}`);
        
        // Notify parent component if callback is provided
        if (onNNAAddressChange) {
          onNNAAddressChange(
            formattedHfn,
            formattedMfa,
            parseInt(sequential, 10) || 1,
            selectedSubcategoryCode // Pass the original subcategory code for display
          );
        }
      } catch (err) {
        logger.error(`Error generating NNA addresses: ${err instanceof Error ? err.message : String(err)}`);
        
        // Handle special cases if automatic conversion fails
        if (layerCode === 'S' && selectedCategoryCode === 'POP' && selectedSubcategoryCode === 'HPM') {
          const hfnSpecial = `${layerCode}.${selectedCategoryCode}.${selectedSubcategoryCode}.${sequential}`;
          const mfaSpecial = `2.001.007.${sequential}`;
          
          setHfn(hfnSpecial);
          setMfa(mfaSpecial);
          
          logger.info(`Applied special case handling for S.POP.HPM: HFN=${hfnSpecial}, MFA=${mfaSpecial}`);
          
          if (onNNAAddressChange) {
            onNNAAddressChange(
              hfnSpecial,
              mfaSpecial,
              parseInt(sequential, 10) || 1,
              'HPM' // Preserve the original HPM code
            );
          }
        } else if (layerCode === 'W' && selectedCategoryCode === 'BCH' && selectedSubcategoryCode === 'SUN') {
          const hfnSpecial = `${layerCode}.${selectedCategoryCode}.${selectedSubcategoryCode}.${sequential}`;
          const mfaSpecial = `5.004.003.${sequential}`;
          
          setHfn(hfnSpecial);
          setMfa(mfaSpecial);
          
          logger.info(`Applied special case handling for W.BCH.SUN: HFN=${hfnSpecial}, MFA=${mfaSpecial}`);
          
          if (onNNAAddressChange) {
            onNNAAddressChange(
              hfnSpecial,
              mfaSpecial,
              parseInt(sequential, 10) || 1,
              'SUN' // Preserve the original SUN code
            );
          }
        }
      }
    };

    generateAddresses();
  }, [layerCode, selectedCategoryCode, selectedSubcategoryCode, sequential, onNNAAddressChange]);

  // Handle category selection
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const categoryCode = event.target.value;
    
    // Find the selected category
    const selectedCategory = categories.find(cat => cat.code === categoryCode);
    
    if (selectedCategory) {
      logger.info(`Selected category: ${selectedCategory.name} (${selectedCategory.code})`);
      onCategorySelect(selectedCategory);
    }
  };

  // Handle subcategory selection
  const handleSubcategoryChange = (event: SelectChangeEvent<string>, isDoubleClick: boolean = false) => {
    const subcategoryCode = event.target.value;
    
    // Find the selected subcategory
    const selectedSubcategory = subcategories.find(subcat => subcat.code === subcategoryCode);
    
    if (selectedSubcategory) {
      logger.info(`Selected subcategory: ${selectedSubcategory.name} (${selectedSubcategory.code})`);
      onSubcategorySelect(selectedSubcategory, isDoubleClick);
    }
  };

  if (!layerCode) {
    return <Alert severity="info">Please select a layer first</Alert>;
  }

  // Get layer name for display
  const getLayerName = (code: string): string => {
    const layerNames: Record<string, string> = {
      'G': 'Songs',
      'S': 'Stars',
      'L': 'Looks',
      'M': 'Moves',
      'W': 'Worlds',
      'B': 'Branded Assets',
      'C': 'Composites',
      'T': 'Training Data',
      'P': 'Personalize',
      'R': 'Rights',
    };
    return layerNames[code] || `Layer ${code}`;
  };

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

      {/* Layer Display */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          {`${getLayerName(layerCode)} (${layerCode})`}
        </Typography>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Category Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="category-select-label">Category</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={selectedCategoryCode || ''}
          label="Category"
          onChange={handleCategoryChange}
          disabled={loading.categories || categories.length === 0}
        >
          <MenuItem value="">
            <em>Select a category</em>
          </MenuItem>
          {categories.map(category => (
            <MenuItem key={category.code} value={category.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography>{category.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title="Human-Friendly Code">
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
                  <Tooltip title="Machine-Friendly Code">
                    <Chip
                      label={category.numericCode}
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
        {loading.categories && (
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
      </FormControl>

      {/* Subcategory Selection */}
      <FormControl
        fullWidth
        sx={{ mb: 3 }}
        disabled={!selectedCategoryCode || loading.subcategories || subcategories.length === 0}
      >
        <InputLabel id="subcategory-select-label">Subcategory</InputLabel>
        <Select
          labelId="subcategory-select-label"
          id="subcategory-select"
          value={selectedSubcategoryCode || ''}
          label="Subcategory"
          onChange={e => handleSubcategoryChange(e, false)}
        >
          <MenuItem value="">
            <em>Select a subcategory</em>
          </MenuItem>
          {subcategories.map(subcategory => (
            <MenuItem
              key={subcategory.code}
              value={subcategory.code}
              onDoubleClick={() => {
                logger.debug(`Double-clicked subcategory: ${subcategory.name} (${subcategory.code})`);
                onSubcategorySelect(subcategory, true);
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography>{subcategory.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip title="Human-Friendly Code">
                    <Chip
                      label={subcategory.code}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ mr: 1, fontSize: '0.7rem', fontWeight: 'bold' }}
                    />
                  </Tooltip>
                  <Tooltip title="Machine-Friendly Code">
                    <Chip
                      label={subcategory.numericCode}
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
        {loading.subcategories && (
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
      </FormControl>

      {/* Special case warning for S.POP.* */}
      {layerCode === 'S' && 
       selectedCategoryCode === 'POP' && 
       selectedSubcategoryCode && 
       selectedSubcategoryCode !== 'HPM' && 
       selectedSubcategoryCode !== 'BAS' && (
        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
          <AlertTitle>Subcategory Compatibility Note</AlertTitle>
          While you've selected <strong>{selectedSubcategoryCode}</strong>, the system will internally use <strong>BAS</strong> for storage.
          Your selection will be preserved in the display name. This is a temporary limitation that will be addressed in a future update.
        </Alert>
      )}

      {/* Selected Taxonomy Display */}
      {selectedCategoryCode && selectedSubcategoryCode && (
        <>
          <Box mt={3} p={2} bgcolor="background.default" borderRadius={1}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Selected Taxonomy:
            </Typography>
            <Typography>
              {`${getLayerName(layerCode)} (${layerCode}) → ${
                categories.find(c => c.code === selectedCategoryCode)?.name || selectedCategoryCode
              } (${selectedCategoryCode}) → ${
                subcategories.find(s => s.code === selectedSubcategoryCode)?.name || selectedSubcategoryCode
              } (${selectedSubcategoryCode})`}
            </Typography>
          </Box>

          {/* NNA Address Preview */}
          <Paper sx={{ p: 2, mt: 3, borderRadius: 1, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              NNA Address Preview
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* HFN Preview */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.paper', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Human-Friendly Name (HFN)
                    </Typography>
                    <Tooltip title="3-letter codes for human readability">
                      <InfoIcon fontSize="small" color="action" sx={{ ml: 1, width: 16, height: 16 }} />
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>
                      {hfn || `${layerCode}.${selectedCategoryCode}.${selectedSubcategoryCode}.${sequential}`}
                    </Typography>
                    {loading.sequential && (
                      <CircularProgress size={16} sx={{ ml: 1 }} />
                    )}
                  </Box>
                </Box>
              </Grid>
              
              {/* MFA Preview */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'background.paper', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Machine-Friendly Address (MFA)
                    </Typography>
                    <Tooltip title="Numeric codes for machine processing">
                      <InfoIcon fontSize="small" color="action" sx={{ ml: 1, width: 16, height: 16 }} />
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>
                      {mfa || '...'}
                    </Typography>
                    {loading.sequential && (
                      <CircularProgress size={16} sx={{ ml: 1 }} />
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Note: The final digit sequence will be automatically assigned during registration.
            </Typography>
          </Paper>
        </>
      )}
    </Paper>
  );
};

export default DropdownBasedTaxonomySelector;