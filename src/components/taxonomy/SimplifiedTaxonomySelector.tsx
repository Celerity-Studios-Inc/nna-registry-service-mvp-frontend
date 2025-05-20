import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { logger } from '../../utils/logger';

// Define interfaces for taxonomy data
interface Layer {
  code: string;
  name: string;
  numericCode: string;
}

interface Category {
  layer: string;
  code: string;
  name: string;
  numericCode: string;
}

interface Subcategory {
  layer: string;
  categoryCode: string;
  code: string;
  name: string;
  numericCode: string;
}

interface TaxonomyData {
  layers: Layer[];
  categories: Category[];
  subcategories: Subcategory[];
}

interface TaxonomySelection {
  layer: string;
  category: string;
  subcategory: string;
}

interface SimplifiedTaxonomySelectorProps {
  taxonomyData: TaxonomyData | null;
  onSelectionComplete: (selection: TaxonomySelection) => void;
  initialSelection?: TaxonomySelection;
}

// Styled components for visual consistency
const SelectionCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid #ccc',
  backgroundColor: selected ? theme.palette.primary.light : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
  }
}));

// Main component
export const SimplifiedTaxonomySelector: React.FC<SimplifiedTaxonomySelectorProps> = ({ 
  taxonomyData, 
  onSelectionComplete,
  initialSelection = { layer: '', category: '', subcategory: '' }
}) => {
  // State for selections
  const [selectedLayer, setSelectedLayer] = useState(initialSelection.layer || '');
  const [selectedCategory, setSelectedCategory] = useState(initialSelection.category || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSelection.subcategory || '');
  
  // Extract distinct layers
  const layers = React.useMemo(() => {
    if (!taxonomyData || !taxonomyData.layers) return [];
    return taxonomyData.layers;
  }, [taxonomyData]);
  
  // Get categories for selected layer
  const categories = React.useMemo(() => {
    if (!taxonomyData || !selectedLayer) return [];
    return taxonomyData.categories.filter(cat => cat.layer === selectedLayer);
  }, [taxonomyData, selectedLayer]);
  
  // Get subcategories for selected category
  const subcategories = React.useMemo(() => {
    if (!taxonomyData || !selectedLayer || !selectedCategory) return [];
    return taxonomyData.subcategories.filter(
      subcat => subcat.layer === selectedLayer && subcat.categoryCode === selectedCategory
    );
  }, [taxonomyData, selectedLayer, selectedCategory]);
  
  // Layer selection handler
  const handleLayerSelect = (layerCode: string) => {
    if (layerCode === selectedLayer) return; // Prevent unnecessary re-renders
    setSelectedLayer(layerCode);
    setSelectedCategory(''); // Reset dependent selections
    setSelectedSubcategory('');
  };
  
  // Category selection handler
  const handleCategorySelect = (categoryCode: string) => {
    if (categoryCode === selectedCategory) return; // Prevent unnecessary re-renders
    setSelectedCategory(categoryCode);
    setSelectedSubcategory(''); // Reset dependent selection
  };
  
  // Subcategory selection handler
  const handleSubcategorySelect = (subcategoryCode: string) => {
    if (subcategoryCode === selectedSubcategory) return; // Prevent unnecessary re-renders
    setSelectedSubcategory(subcategoryCode);
  };
  
  // Notify parent component when selection is complete
  useEffect(() => {
    if (selectedLayer && selectedCategory && selectedSubcategory) {
      onSelectionComplete({
        layer: selectedLayer,
        category: selectedCategory,
        subcategory: selectedSubcategory
      });
    }
  }, [selectedLayer, selectedCategory, selectedSubcategory, onSelectionComplete]);
  
  return (
    <Box sx={{ my: 3 }}>
      {/* Layer Selection */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select Layer
        </Typography>
        <Grid container spacing={2}>
          {layers.map((layer) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={layer.code}>
              <SelectionCard 
                selected={layer.code === selectedLayer}
                onClick={() => handleLayerSelect(layer.code)}
                elevation={layer.code === selectedLayer ? 3 : 1}
              >
                <Typography variant="h5" component="div">
                  {layer.code}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {layer.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {layer.numericCode}
                </Typography>
              </SelectionCard>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Category Selection - only show if layer is selected */}
      {selectedLayer && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select Category
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={category.code}>
                <SelectionCard 
                  selected={category.code === selectedCategory}
                  onClick={() => handleCategorySelect(category.code)}
                  elevation={category.code === selectedCategory ? 3 : 1}
                >
                  <Typography variant="h6" component="div">
                    {category.code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.numericCode}
                  </Typography>
                </SelectionCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Subcategory Selection - only show if category is selected */}
      {selectedLayer && selectedCategory && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select Subcategory
          </Typography>
          <Grid container spacing={2}>
            {subcategories.map((subcategory) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={subcategory.code}>
                <SelectionCard 
                  selected={subcategory.code === selectedSubcategory}
                  onClick={() => handleSubcategorySelect(subcategory.code)}
                  elevation={subcategory.code === selectedSubcategory ? 3 : 1}
                >
                  <Typography variant="h6" component="div">
                    {subcategory.code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {subcategory.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {subcategory.numericCode}
                  </Typography>
                </SelectionCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {/* Current Selection Summary */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          Current Selection
        </Typography>
        <Typography variant="body1">
          Layer: <strong>{selectedLayer || 'None'}</strong> •
          Category: <strong>{selectedCategory || 'None'}</strong> •
          Subcategory: <strong>{selectedSubcategory || 'None'}</strong>
        </Typography>
        
        {selectedLayer && selectedCategory && selectedSubcategory && (
          <Box sx={{ mt: 2 }}>
            {/* Display HFN */}
            <Typography variant="subtitle2">
              Human-Friendly Name (HFN): <strong>{selectedLayer}.{selectedCategory}.{selectedSubcategory}.001</strong>
            </Typography>
            
            {/* Compute MFA using taxonomyService */}
            {(() => {
              try {
                const hfn = `${selectedLayer}.${selectedCategory}.${selectedSubcategory}.001`;
                const mfa = taxonomyService.convertHFNtoMFA(hfn);
                
                logger.debug(`HFN to MFA conversion successful: ${hfn} → ${mfa}`);
                
                return (
                  <Typography variant="subtitle2">
                    Machine-Friendly Address (MFA): <strong>{mfa}</strong>
                  </Typography>
                );
              } catch (error) {
                logger.error(`Error converting HFN to MFA: ${error instanceof Error ? error.message : String(error)}`);
                
                // Fallback to manual computation
                return (
                  <Typography variant="subtitle2">
                    Machine-Friendly Address (MFA) (computed manually): 
                    <strong>
                      {layers.find(l => l.code === selectedLayer)?.numericCode || '000'}.
                      {categories.find(c => c.layer === selectedLayer && c.code === selectedCategory)?.numericCode || '000'}.
                      {subcategories.find(s => s.layer === selectedLayer && s.categoryCode === selectedCategory && s.code === selectedSubcategory)?.numericCode || '000'}.001
                    </strong>
                  </Typography>
                );
              }
            })()}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SimplifiedTaxonomySelector;