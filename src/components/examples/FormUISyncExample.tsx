import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useFormUISync } from '../../hooks/useFormUISync';
import { Box, Typography, TextField, Button, Paper, Grid } from '@mui/material';
import { debugLog } from '../../utils/logger';

/**
 * Example component demonstrating the useFormUISync hook
 * This shows how to use the hook to synchronize form state with UI state
 */
const FormUISyncExample: React.FC = () => {
  // Set up React Hook Form
  const methods = useForm({
    defaultValues: {
      layer: '',
      category: '',
      subcategory: '',
    }
  });
  
  // Use our custom hook for UI/form state synchronization
  const { 
    uiState, 
    syncUpdate, 
    syncUpdateMultiple,
    refreshFromForm
  } = useFormUISync(methods, {
    layer: '',
    category: '',
    subcategory: '',
  });
  
  // Log changes to uiState
  useEffect(() => {
    debugLog('[FormUISyncExample] uiState updated:', uiState);
  }, [uiState]);
  
  // Handle form submission
  const onSubmit = methods.handleSubmit(data => {
    console.log('Form submitted with data:', data);
    console.log('UI state at submission:', uiState);
  });
  
  // Example handlers
  const handleLayerSelect = (layer: string) => {
    // Update layer and reset category/subcategory
    syncUpdateMultiple({
      layer,
      category: '',
      subcategory: '',
    });
  };
  
  const handleCategorySelect = (category: string) => {
    // Update category and reset subcategory
    syncUpdateMultiple({
      category,
      subcategory: '',
    });
  };
  
  const handleSubcategorySelect = (subcategory: string) => {
    // Update subcategory
    syncUpdate('subcategory', subcategory);
  };
  
  const handleDirectFormChange = () => {
    // Directly update the form (bypassing syncUpdate)
    methods.setValue('layer', 'S');
    methods.setValue('category', 'POP');
    
    // UI state won't update automatically, so we need to refresh
    refreshFromForm();
  };
  
  // Demo options
  const layerOptions = ['G', 'S', 'L', 'W'];
  const categoryOptions = ['POP', 'ROCK', 'JAZZ'];
  const subcategoryOptions = ['TOP', 'ALT', 'CLASSIC'];
  
  return (
    <FormProvider {...methods}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Form UI Sync Example
        </Typography>
        
        <form onSubmit={onSubmit}>
          <Grid container spacing={3}>
            {/* Layer selection */}
            <Grid item xs={12}>
              <Typography variant="h6">Step 1: Select Layer</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {layerOptions.map(layer => (
                  <Button 
                    key={layer}
                    variant={uiState.layer === layer ? "contained" : "outlined"}
                    onClick={() => handleLayerSelect(layer)}
                  >
                    {layer}
                  </Button>
                ))}
              </Box>
            </Grid>
            
            {/* Category selection - only shown when layer is selected */}
            {uiState.layer && (
              <Grid item xs={12}>
                <Typography variant="h6">Step 2: Select Category</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {categoryOptions.map(category => (
                    <Button 
                      key={category}
                      variant={uiState.category === category ? "contained" : "outlined"}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </Box>
              </Grid>
            )}
            
            {/* Subcategory selection - only shown when category is selected */}
            {uiState.layer && uiState.category && (
              <Grid item xs={12}>
                <Typography variant="h6">Step 3: Select Subcategory</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {subcategoryOptions.map(subcategory => (
                    <Button 
                      key={subcategory}
                      variant={uiState.subcategory === subcategory ? "contained" : "outlined"}
                      onClick={() => handleSubcategorySelect(subcategory)}
                    >
                      {subcategory}
                    </Button>
                  ))}
                </Box>
              </Grid>
            )}
            
            {/* Current selection summary */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Selection (UI State):
                </Typography>
                <Typography>
                  Layer: {uiState.layer || 'None'}, 
                  Category: {uiState.category || 'None'}, 
                  Subcategory: {uiState.subcategory || 'None'}
                </Typography>
              </Paper>
            </Grid>
            
            {/* Form state display */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Form State (getValues):
                </Typography>
                <Typography>
                  Layer: {methods.getValues('layer') || 'None'}, 
                  Category: {methods.getValues('category') || 'None'}, 
                  Subcategory: {methods.getValues('subcategory') || 'None'}
                </Typography>
              </Paper>
            </Grid>
            
            {/* Actions */}
            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Box>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={handleDirectFormChange}
                >
                  Update Form Directly
                </Button>
              </Box>
              
              <Box>
                <Button type="submit" variant="contained" color="primary">
                  Submit
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </FormProvider>
  );
};

export default FormUISyncExample;