import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, CircularProgress, Card, CardContent 
} from '@mui/material';

interface TaxonomyItem {
  code: string;
  name: string;
  numericCode: string;
}

interface TaxonomySelection {
  layer: string;
  category: string;
  subcategory: string;
}

interface EmergencyTaxonomySelectorProps {
  onSelectionComplete: (selection: TaxonomySelection) => void;
  taxonomyData: {
    layers: TaxonomyItem[];
    categories: {[layerCode: string]: TaxonomyItem[]};
    subcategories: {[layerAndCategoryCode: string]: TaxonomyItem[]};
  } | null;
  loading?: boolean;
}

export const EmergencyTaxonomySelector: React.FC<EmergencyTaxonomySelectorProps> = ({
  onSelectionComplete,
  taxonomyData,
  loading = false
}) => {
  // Use simple, direct state management - no complex interactions
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  // Simple effect to notify parent when full selection is made
  useEffect(() => {
    if (selectedLayer && selectedCategory && selectedSubcategory) {
      onSelectionComplete({
        layer: selectedLayer,
        category: selectedCategory,
        subcategory: selectedSubcategory
      });
    }
  }, [selectedLayer, selectedCategory, selectedSubcategory, onSelectionComplete]);
  
  // Reset dependent selections when parent selection changes
  useEffect(() => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  }, [selectedLayer]);
  
  useEffect(() => {
    setSelectedSubcategory(null);
  }, [selectedCategory]);
  
  if (loading || !taxonomyData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Get current visible categories based on layer selection
  const visibleCategories = selectedLayer 
    ? taxonomyData.categories[selectedLayer] || []
    : [];
  
  // Get current visible subcategories based on layer and category selection
  const visibleSubcategories = (selectedLayer && selectedCategory)
    ? taxonomyData.subcategories[`${selectedLayer}.${selectedCategory}`] || []
    : [];
  
  return (
    <Box sx={{ my: 3 }}>
      {/* Layer Selection */}
      <Typography variant="h6" gutterBottom>
        Select Layer
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {taxonomyData.layers.map((layer) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={layer.code}>
            <Card 
              onClick={() => setSelectedLayer(layer.code)}
              sx={{
                cursor: 'pointer',
                bgcolor: layer.code === selectedLayer ? 'primary.light' : 'background.paper',
                border: layer.code === selectedLayer ? '2px solid' : '1px solid',
                borderColor: layer.code === selectedLayer ? 'primary.main' : 'grey.300',
              }}
            >
              <CardContent>
                <Typography variant="h5" component="div" align="center">
                  {layer.code}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {layer.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                  {layer.numericCode}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Category Selection - only show if layer is selected */}
      {selectedLayer && (
        <>
          <Typography variant="h6" gutterBottom>
            Select Category
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {visibleCategories.map((category) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={category.code}>
                <Card 
                  onClick={() => setSelectedCategory(category.code)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: category.code === selectedCategory ? 'primary.light' : 'background.paper',
                    border: category.code === selectedCategory ? '2px solid' : '1px solid',
                    borderColor: category.code === selectedCategory ? 'primary.main' : 'grey.300',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="div" align="center">
                      {category.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {category.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" align="center" display="block">
                      {category.numericCode}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Subcategory Selection - only show if category is selected */}
      {selectedLayer && selectedCategory && (
        <>
          <Typography variant="h6" gutterBottom>
            Select Subcategory
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {visibleSubcategories.map((subcategory) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={subcategory.code}>
                <Card 
                  onClick={() => setSelectedSubcategory(subcategory.code)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: subcategory.code === selectedSubcategory ? 'primary.light' : 'background.paper',
                    border: subcategory.code === selectedSubcategory ? '2px solid' : '1px solid',
                    borderColor: subcategory.code === selectedSubcategory ? 'primary.main' : 'grey.300',
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" component="div" align="center">
                      {subcategory.code}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      {subcategory.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" align="center" display="block">
                      {subcategory.numericCode}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Current Selection Summary */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
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
            <Typography variant="subtitle2">
              Human-Friendly Name (HFN): <strong>{selectedLayer}.{selectedCategory}.{selectedSubcategory}.xxx</strong>
            </Typography>
            
            <Typography variant="subtitle2">
              Machine-Friendly Address (MFA): <strong>
                {taxonomyData.layers.find(l => l.code === selectedLayer)?.numericCode || '000'}.
                {visibleCategories.find(c => c.code === selectedCategory)?.numericCode || '000'}.
                {visibleSubcategories.find(s => s.code === selectedSubcategory)?.numericCode || '000'}.xxx
              </strong>
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EmergencyTaxonomySelector;