import React, { useMemo } from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { AccountTree as TaxonomyIcon } from '@mui/icons-material';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { STANDARD_LAYER_NAMES } from '../../utils/logger';

// Helper function to handle display name from taxonomy data
const formatDisplayName = (name?: string): string => {
  if (!name) return '';
  
  // Clean up formatting - replace underscores with spaces
  return name.replace(/_/g, ' ');
};

// Helper function to get layer name from layer code
const getLayerName = (layer: string): string => {
  return STANDARD_LAYER_NAMES[layer] || layer;
};

// Generic helper function to get display name for category and subcategory codes
// This version uses the taxonomy service to look up names dynamically
const getCategoryDisplayName = (code: string, name?: string, layer?: string, isCategory: boolean = true): string => {
  // Priority 1: If we have a name directly provided in props, use it
  if (name && name.trim() !== '') {
    return formatDisplayName(name);
  }
  
  // If we don't have a layer, try to get it from session storage
  const currentLayer = layer || sessionStorage.getItem('selected_layer');
  
  // Priority 2: Try to get the name from the taxonomy service if we have a layer
  if (currentLayer) {
    try {
      if (isCategory) {
        // For categories, get all categories for the layer and find the matching one
        const categories = taxonomyService.getCategories(currentLayer);
        const matchingCategory = categories.find(cat => cat.code === code);
        if (matchingCategory && matchingCategory.name) {
          return formatDisplayName(matchingCategory.name);
        }
      } else {
        // For subcategories, we need to get the parent category first
        const currentCategory = sessionStorage.getItem('selected_category');
        if (currentCategory) {
          // Get subcategories for the current layer/category and find the matching one
          const subcategories = taxonomyService.getSubcategories(currentLayer, currentCategory);
          const matchingSubcategory = subcategories.find(subcat => subcat.code === code);
          if (matchingSubcategory && matchingSubcategory.name) {
            return formatDisplayName(matchingSubcategory.name);
          }
        }
      }
    } catch (error) {
      console.warn(`Error looking up display name from taxonomy service: ${error}`);
    }
  }
  
  // Priority 3: Try to generate a human-readable name from the code
  if (code && code.length <= 4) {
    // For short codes like "BOL", make it Title Case (e.g., "Bol")
    return code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
  }
  
  // Last resort: Just return the code itself
  return code;
};

interface TaxonomyContextProps {
  layer: string;
  layerName?: string;
  categoryCode: string;
  categoryName?: string;
  subcategoryCode: string;
  subcategoryName?: string;
  hfn?: string;
  mfa?: string;
}

/**
 * TaxonomyContext Component
 * 
 * Displays the currently selected taxonomy context (Layer, Category, Subcategory)
 * for reference on subsequent steps of the asset registration process.
 */
const TaxonomyContext: React.FC<TaxonomyContextProps> = ({
  layer,
  layerName,
  categoryCode,
  categoryName,
  subcategoryCode,
  subcategoryName,
  hfn,
  mfa
}) => {
  // Store the selected layer and category in session storage for reuse
  useMemo(() => {
    if (layer) {
      sessionStorage.setItem('selected_layer', layer);
    }
    if (categoryCode) {
      sessionStorage.setItem('selected_category', categoryCode);
    }
  }, [layer, categoryCode]);

  // Only render if we have the minimum required data
  if (!layer || !categoryCode || !subcategoryCode) {
    return null;
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3, 
        border: '1px solid #e0e0e0',
        borderLeft: '4px solid #1976d2',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <TaxonomyIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight="medium">
          Selected Taxonomy
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                Layer:
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label={layer}
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {layerName || getLayerName(layer)}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                Category:
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label={categoryCode}
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {getCategoryDisplayName(categoryCode, categoryName, layer, true)}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                Subcategory:
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label={subcategoryCode}
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {getCategoryDisplayName(subcategoryCode, subcategoryName, layer, false)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
        
        {(hfn || mfa) && (
          <Grid item xs={12} sm={6}>
            <Box display="flex" flexDirection="column" gap={1}>
              {hfn && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                    HFN:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" bgcolor="#f5f5f5" px={1} py={0.5} borderRadius={1}>
                    {hfn}
                  </Typography>
                </Box>
              )}
              
              {mfa && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                    MFA:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" bgcolor="#f5f5f5" px={1} py={0.5} borderRadius={1}>
                    {mfa}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default TaxonomyContext;