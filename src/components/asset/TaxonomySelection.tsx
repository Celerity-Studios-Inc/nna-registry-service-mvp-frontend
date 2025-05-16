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
import taxonomyService from '../../services/taxonomyService';
import { CategoryOption, SubcategoryOption } from '../../types/taxonomy.types';
import NNAAddressPreview from './NNAAddressPreview';
import { logger } from '../../utils/logger';

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
    originalSubcategoryCode?: string
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
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sequential, setSequential] = useState('001');
  const [isUnique, setIsUnique] = useState<boolean>(true);
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
        const categoryOptions = taxonomyService.getCategories(layerCode);
        setCategories(categoryOptions);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load categories'
        );
        logger.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [layerCode]);

  const fetchSequential = async () => {
    try {
      logger.debug(`Fetching sequential number for ${layerCode}.${selectedCategoryCode}.${selectedSubcategoryCode}`);
      
      // For now, use a hard-coded sequential number
      // In a real implementation, this would be fetched from the backend
      setSequential('001');
    } catch (error) {
      logger.error('Error fetching sequential number:', error);
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
        const subcategoryOptions = taxonomyService.getSubcategories(
          layerCode,
          selectedCategoryCode
        );
        setSubcategories(subcategoryOptions);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load subcategories'
        );
        logger.error('Error loading subcategories:', err);
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
          // Make sure we're using the correct codes from the taxonomy service
          const categoryAlpha = selectedCategoryCode.toUpperCase();
          const subcategoryAlpha = selectedSubcategoryCode.toUpperCase();

          // Create the properly formatted HFN with the alphabetic codes
          const hfnAddress = `${layerCode}.${categoryAlpha}.${subcategoryAlpha}.${sequential}`;

          // Generate the MFA using our taxonomy service
          const mfaAddress = taxonomyService.convertHFNtoMFA(hfnAddress);

          // Parse the sequential number
          const sequentialNum = parseInt(sequential, 10) || 1;

          logger.debug(`Generated NNA addresses: HFN=${hfnAddress}, MFA=${mfaAddress}, seq=${sequentialNum}`);

          // Store the original subcategory code
          const originalSubcategoryCode = subcategoryAlpha;
          
          // Pass the generated addresses to the parent component
          onNNAAddressChange(hfnAddress, mfaAddress, sequentialNum, originalSubcategoryCode);
        }
      } catch (err) {
        logger.error('Error checking address uniqueness:', err);
      } finally {
        setCheckingUniqueness(false);
      }
    };

    checkAddressUniqueness();
  }, [
    layerCode,
    selectedCategoryCode,
    selectedSubcategoryCode,
    sequential,
    onNNAAddressChange,
  ]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const categoryCode = event.target.value;

    // Find the selected category
    const selectedCategory = categories.find(cat => cat.code === categoryCode);

    if (selectedCategory) {
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

      {/* Layer name display */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          {(() => {
            // Get layer name from taxonomy service
            const layer = taxonomyService.getLayer(layerCode);
            return layer ? `${layer.name} (${layerCode})` : `Layer ${layerCode}`;
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
                        label={category.numericCode.padStart(3, '0')}
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
                  logger.debug(`Double clicked on subcategory: ${subcategory.name} (${subcategory.code})`);
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
                        label={subcategory.numericCode.padStart(3, '0')}
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

        {/* Warning for special cases */}
        {layerCode === 'W' && selectedCategoryCode === 'BCH' && selectedSubcategoryCode === 'SUN' && (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            <AlertTitle>Special Case: W.BCH.SUN</AlertTitle>
            W.BCH.SUN will map to MFA 5.004.003 (fixed mapping for Sunset under Beach in Worlds layer).
          </Alert>
        )}

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
                  selectedSubcategoryCode
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