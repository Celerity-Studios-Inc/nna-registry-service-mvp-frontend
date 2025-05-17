import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import TaxonomyDebug from '../components/TaxonomyDebug';
import LayerSelector from '../components/asset/LayerSelector';
import SimpleTaxonomySelection from '../components/asset/SimpleTaxonomySelection';

const TaxonomyDebugPage: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = React.useState<string>('S');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = React.useState<string>('');

  const handleLayerSelect = (layer: string) => {
    console.log('Layer selected in debug page:', layer);
    setSelectedLayer(layer);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleCategorySelect = (category: string) => {
    console.log('Category selected in debug page:', category);
    setSelectedCategory(category);
    setSelectedSubcategory('');
  };

  const handleSubcategorySelect = (subcategory: string) => {
    console.log('Subcategory selected in debug page:', subcategory);
    setSelectedSubcategory(subcategory);
  };

  return (
    <MainLayout>
      <Container>
        <Typography variant="h4" sx={{ my: 4 }}>Taxonomy Debug Page</Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Test Layer Selector</Typography>
          <LayerSelector
            selectedLayer={selectedLayer}
            onLayerSelect={handleLayerSelect}
          />
        </Paper>
        
        <Divider sx={{ my: 4 }} />
        
        {selectedLayer && (
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>Test Taxonomy Selection</Typography>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1">
                Selected Layer: {selectedLayer} | 
                Selected Category: {selectedCategory || 'None'} | 
                Selected Subcategory: {selectedSubcategory || 'None'}
              </Typography>
            </Box>
            <SimpleTaxonomySelection
              layer={selectedLayer}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
            />
          </Paper>
        )}
        
        <TaxonomyDebug />
      </Container>
    </MainLayout>
  );
};

export default TaxonomyDebugPage;