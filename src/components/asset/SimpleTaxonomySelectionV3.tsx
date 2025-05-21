/**
 * SimpleTaxonomySelectionV3
 * 
 * A completely new implementation of the taxonomy selection component that uses
 * the enhanced taxonomy service for improved reliability and error handling.
 */
import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Grid, Typography } from '@mui/material';
import {
  getLayers,
  getCategories,
  getSubcategories,
  inspectTaxonomyStructure
} from '../../services/enhancedTaxonomyService';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { TaxonomyItem } from '../../types/taxonomy.types';

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
  const [layers, setLayers] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<TaxonomyItem[]>([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<TaxonomyItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load layers on component mount
  useEffect(() => {
    try {
      const availableLayers = getLayers();
      console.log('Available layers:', availableLayers);
      setLayers(availableLayers);
    } catch (err) {
      console.error('Error loading layers:', err);
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
        console.log(`Categories for layer ${selectedLayer}:`, categories);
        setCategoryOptions(categories);
        
        // Clear subcategory if layer changes
        if (selectedSubcategoryCode) {
          onSubcategorySelect('');
        }
      } catch (err) {
        console.error(`Error loading categories for ${selectedLayer}:`, err);
        setError(`Failed to load categories for ${selectedLayer}`);
        setCategoryOptions([]);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setCategoryOptions([]);
    }
  }, [selectedLayer, selectedSubcategoryCode, onSubcategorySelect]);

  // Load subcategories when layer and category change
  useEffect(() => {
    if (selectedLayer && selectedCategoryCode) {
      setIsProcessing(true);
      setError(null);
      
      try {
        // Debug the taxonomy structure
        const structureInfo = inspectTaxonomyStructure(selectedLayer, selectedCategoryCode);
        console.log('Taxonomy structure:', structureInfo);
        
        // Get subcategories
        const subcategories = getSubcategories(selectedLayer, selectedCategoryCode);
        console.log(`Subcategories for ${selectedLayer}.${selectedCategoryCode}:`, subcategories);
        
        setSubcategoryOptions(subcategories);
        
        // Clear subcategory if category changes and current selection is no longer valid
        if (selectedSubcategoryCode) {
          const isValid = subcategories.some(s => s.code === getShortSubcategoryCode(selectedSubcategoryCode));
          if (!isValid) {
            onSubcategorySelect('');
          }
        }
      } catch (err) {
        console.error(`Error loading subcategories for ${selectedLayer}.${selectedCategoryCode}:`, err);
        setError(`Failed to load subcategories for ${selectedCategoryCode}`);
        setSubcategoryOptions([]);
      } finally {
        setIsProcessing(false);
      }
    } else {
      setSubcategoryOptions([]);
    }
  }, [selectedLayer, selectedCategoryCode, selectedSubcategoryCode, onSubcategorySelect]);

  // Get subcategory code from full code (e.g., "POP.KPO" -> "KPO")
  const getShortSubcategoryCode = (fullCode: string): string => {
    return fullCode ? fullCode.split('.')[1] || fullCode : '';
  };

  return (
    <Grid container spacing={2}>
      {error && (
        <Grid item xs={12}>
          <Typography color="error">{error}</Typography>
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
            onChange={(e) => onSubcategorySelect(e.target.value as string)}
            label="Subcategory"
          >
            <MenuItem value="">
              <em>Select Subcategory</em>
            </MenuItem>
            {subcategoryOptions.map((subcategory) => (
              <MenuItem 
                key={subcategory.code} 
                value={`${selectedCategoryCode}.${subcategory.code}`}
              >
                {subcategory.name} ({subcategory.code})
              </MenuItem>
            ))}
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
      </Grid>
    </Grid>
  );
};

export default SimpleTaxonomySelectionV3;