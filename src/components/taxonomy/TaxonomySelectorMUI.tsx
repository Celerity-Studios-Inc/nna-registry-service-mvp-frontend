import React from 'react';
import { useTaxonomyData } from '../../providers/taxonomy/TaxonomyDataProvider';
import { TaxonomyItem as TaxonomyItemType } from '../../providers/taxonomy/types';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert, 
  AlertTitle, 
  Button,
  Card,
  CardContent
} from '@mui/material';

export interface TaxonomySelectorMUIProps {
  selectedLayer: string;
  selectedCategory: string;
  selectedSubcategory: string;
  onLayerSelect: (layer: string) => void;
  onCategorySelect: (category: string) => void;
  onSubcategorySelect: (subcategory: string, isDoubleClick?: boolean) => void;
}

/**
 * Material UI implementation of the taxonomy selector component
 * This is a stateless component that uses the TaxonomyDataProvider
 */
const TaxonomySelectorMUI: React.FC<TaxonomySelectorMUIProps> = ({
  selectedLayer,
  selectedCategory,
  selectedSubcategory,
  onLayerSelect,
  onCategorySelect,
  onSubcategorySelect
}) => {
  // Get taxonomy data state
  const { 
    taxonomyData, 
    loadingState, 
    error, 
    refreshTaxonomyData,
    getCategories,
    getSubcategories
  } = useTaxonomyData();

  // Handle loading state
  if (loadingState === 'loading') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" my={4} p={3}>
        <CircularProgress size={40} color="primary" sx={{ mb: 2 }} />
        <Typography color="textSecondary">Loading taxonomy data...</Typography>
      </Box>
    );
  }

  // Handle error state
  if (loadingState === 'error' || error) {
    return (
      <Box my={4} p={2}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => refreshTaxonomyData()}>
              Retry
            </Button>
          }
        >
          <AlertTitle>Error loading taxonomy data</AlertTitle>
          {error?.message || 'Unknown error occurred while loading taxonomy data'}
        </Alert>
      </Box>
    );
  }

  // Handle case where taxonomy data is not available
  if (!taxonomyData) {
    return (
      <Box my={4} p={2}>
        <Alert 
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => refreshTaxonomyData()}>
              Retry
            </Button>
          }
        >
          <AlertTitle>No taxonomy data available</AlertTitle>
          The taxonomy data could not be loaded. Please try again.
        </Alert>
      </Box>
    );
  }

  // Get layer name helper
  const getLayerName = (layer: string): string => {
    const nameMap: Record<string, string> = {
      'S': 'Star',
      'W': 'World',
      'G': 'GGC',
      'L': 'Look',
      'M': 'Move',
      'B': 'Bio',
      'P': 'Prop',
      'T': 'Theme',
      'C': 'Character',
      'R': 'Rights'
    };
    return nameMap[layer] || layer;
  };

  // Get layer numeric code helper
  const getLayerNumericCode = (layer: string): string => {
    const codeMap: Record<string, string> = {
      'G': '1',
      'S': '2',
      'L': '3',
      'M': '4',
      'W': '5',
      'B': '6',
      'P': '7',
      'T': '8',
      'C': '9',
      'R': '10'
    };
    return codeMap[layer] || '';
  };

  // Create layers list
  const layers = Object.keys(taxonomyData.layers).map(layer => ({
    code: layer,
    name: getLayerName(layer),
    numericCode: getLayerNumericCode(layer)
  }));

  // Get categories for selected layer
  const categories = selectedLayer ? getCategories(selectedLayer) : [];

  // Get subcategories for selected category
  const subcategories = (selectedLayer && selectedCategory) 
    ? getSubcategories(selectedLayer, selectedCategory) 
    : [];

  // Handle subcategory selection with check for Star+POP combination
  const handleSubcategorySelect = (subcategory: string, isDoubleClick?: boolean) => {
    // Special log for Star+POP selections for debugging
    if (selectedLayer === 'S' && selectedCategory === 'POP') {
      console.log(
        `[SUBCATEGORY SELECT] Selecting S.POP.${subcategory} (double-click: ${Boolean(isDoubleClick)})`
      );
    }
    
    // Call the parent handler
    onSubcategorySelect(subcategory, isDoubleClick);
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Layer selection section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
          Select Layer
        </Typography>
        
        <Grid container spacing={2}>
          {layers.map((layer: TaxonomyItemType) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={layer.code}>
              <Card 
                variant="outlined"
                sx={{ 
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.2s ease',
                  bgcolor: selectedLayer === layer.code ? 'primary.light' : 'background.paper',
                  borderColor: selectedLayer === layer.code ? 'primary.main' : 'divider',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 1,
                    borderColor: selectedLayer === layer.code ? 'primary.main' : 'action.hover'
                  }
                }}
                onClick={() => onLayerSelect(layer.code)}
                data-testid={`layer-${layer.code}`}
              >
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {layer.code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {layer.numericCode}
                  </Typography>
                  <Typography variant="body1">
                    {layer.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Category selection section */}
      {selectedLayer && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              Select Category
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Layer: {selectedLayer}
            </Typography>
          </Box>

          {categories.length === 0 ? (
            <Alert severity="info">No categories found for layer {selectedLayer}</Alert>
          ) : (
            <Grid container spacing={2}>
              {categories.map((category) => (
                <Grid item xs={6} sm={4} md={3} key={category.code}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      cursor: 'pointer',
                      height: '100%',
                      transition: 'all 0.2s ease',
                      bgcolor: selectedCategory === category.code ? 'primary.light' : 'background.paper',
                      borderColor: selectedCategory === category.code ? 'primary.main' : 'divider',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 1,
                        borderColor: selectedCategory === category.code ? 'primary.main' : 'action.hover'
                      }
                    }}
                    onClick={() => onCategorySelect(category.code)}
                    data-testid={`category-${category.code}`}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {category.code}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {category.numericCode}
                      </Typography>
                      <Typography variant="body1">
                        {category.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Subcategory selection section */}
      {selectedLayer && selectedCategory && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              Select Subcategory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Category: {selectedCategory}
            </Typography>
          </Box>

          {subcategories.length === 0 ? (
            <Alert severity="info">
              No subcategories found for {selectedLayer}.{selectedCategory}
            </Alert>
          ) : (
            <>
              <Grid container spacing={2}>
                {subcategories.map((subcategory) => (
                  <Grid item xs={6} sm={4} md={3} key={subcategory.code}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        cursor: 'pointer',
                        height: '100%',
                        transition: 'all 0.2s ease',
                        bgcolor: selectedSubcategory === subcategory.code ? 'primary.light' : 'background.paper',
                        borderColor: selectedSubcategory === subcategory.code ? 'primary.main' : 'divider',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 1,
                          borderColor: selectedSubcategory === subcategory.code ? 'primary.main' : 'action.hover'
                        }
                      }}
                      onClick={() => handleSubcategorySelect(subcategory.code)}
                      onDoubleClick={() => handleSubcategorySelect(subcategory.code, true)}
                      data-testid={`subcategory-${subcategory.code}`}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {subcategory.code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {subcategory.numericCode}
                        </Typography>
                        <Typography variant="body1">
                          {subcategory.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* Show hint about double-click when no selection is made yet */}
              {!selectedSubcategory && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Tip: Double-click a subcategory to select and continue to the next step
                </Alert>
              )}
            </>
          )}
        </Box>
      )}

      {/* Selection summary */}
      {selectedLayer && selectedCategory && selectedSubcategory && (
        <Paper sx={{ 
          p: 2, 
          mt: 3, 
          bgcolor: 'primary.light', 
          borderLeft: '4px solid', 
          borderColor: 'primary.main' 
        }}>
          <Typography>
            Selected: <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
              {selectedLayer}.{selectedCategory}.{selectedSubcategory}
            </Box>
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default React.memo(TaxonomySelectorMUI);