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
  Paper,
  Chip,
  Tooltip,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { CategoryOption, SubcategoryOption } from '../../types/taxonomy.types';
import taxonomyService from '../../api/taxonomyService';
import NNAAddressPreview from './NNAAddressPreview';
import { getAlphabeticCode } from '../../api/codeMapping';
import api from '../../services/api/api';

interface TaxonomySelectionProps {
  layerCode: string;
  onCategorySelect: (category: CategoryOption) => void;
  onSubcategorySelect: (subcategory: SubcategoryOption, isDoubleClick?: boolean) => void;
  selectedCategoryCode?: string;
  subcategoryNumericCode?: string;
  selectedSubcategoryCode?: string;
  categoryName?: string;
  subcategoryName?: string;
  onNNAAddressChange?: (
    humanFriendlyName: string,
    machineFriendlyAddress: string,
    sequentialNumber: number
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
  console.log(categoryName, 'categoryName');

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
        const categoryOptions = taxonomyService.getCategories(layerCode);

        setCategories(categoryOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [layerCode]);

  const fetchSequential = async () => {
    try {
      console.log(layerCode, 'layerCode');

      const response = await api.post<{ sequential: string }>('/assets/new/sequential', {
        layer: layerCode,
        category: categoryName,
        subcategory: subcategoryName,
      });

      setSequential(response.data.sequential);
    } catch (error) {
      console.log(error);
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
        console.log(subcategoryOptions, 'subcategoryOptions');

        setSubcategories(subcategoryOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subcategories');
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
    const selectedSubcategory = subcategories.find(subcat => subcat.code === subcategoryCode);

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
        Choose the appropriate category and subcategory for your asset based on the selected layer.
      </Typography>
      <Divider sx={{ mb: 3 }} />

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
                        label={category.categoryCodeName}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ ml: 1, mr: 1, fontSize: '0.7rem', fontWeight: 'bold' }}
                      />
                    </Tooltip>
                    <Tooltip title="Machine-Friendly Address (3-digit code)">
                      <Chip
                        label={category.code}
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

        <FormControl fullWidth disabled={!selectedCategoryCode || subcategories.length === 0}>
          <InputLabel id="subcategory-select-label">Subcategory</InputLabel>
          <Select
            labelId="subcategory-select-label"
            id="subcategory-select"
            value={selectedSubcategoryCode || ''}
            label="Subcategory"
            onChange={e => handleSubcategoryChange(e, false)}
            disabled={loading || !selectedCategoryCode || subcategories.length === 0}
          >
            <MenuItem value="">
              <em>Select a subcategory</em>
            </MenuItem>
            {subcategories.map(subcategory => (
              <MenuItem
                key={subcategory.code}
                value={subcategory.code}
                onDoubleClick={() => {
                  console.log(
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
                        label={getAlphabeticCode(layerCode, subcategory.code)}
                        size="small"
                        color="secondary"
                        variant="outlined"
                        sx={{ mr: 1, fontSize: '0.7rem', fontWeight: 'bold' }}
                      />
                    </Tooltip>
                    <Tooltip title="Machine-Friendly Address (3-digit code)">
                      <Chip
                        label={subcategory.subcategoryCode}
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
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
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
