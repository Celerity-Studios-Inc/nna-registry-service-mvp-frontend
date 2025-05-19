import React, { useState } from 'react';
import { TaxonomyDataProvider } from '../providers/taxonomy/TaxonomyDataProvider';
import { TaxonomySelector, TaxonomySelectorMUI } from '../components/taxonomy';
import { Box, Container, Typography, Divider, Tab, Tabs, Paper } from '@mui/material';

/**
 * Test page for the new stateless TaxonomySelector component
 */
const TaxonomySelectorTestPage: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle layer selection
  const handleLayerSelect = (layer: string) => {
    console.log(`Selected layer: ${layer}`);
    setSelectedLayer(layer);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    console.log(`Selected category: ${category}`);
    setSelectedCategory(category);
    setSelectedSubcategory('');
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: string, isDoubleClick?: boolean) => {
    console.log(`Selected subcategory: ${subcategory} (double-click: ${Boolean(isDoubleClick)})`);
    setSelectedSubcategory(subcategory);
    
    if (isDoubleClick) {
      console.log('Double-click detected! Would normally advance to next step');
    }
  };

  // Reset all selections
  const resetSelections = () => {
    setSelectedLayer('');
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  // Test the Star+POP selection specifically
  const testStarPopSelection = () => {
    console.log('Testing Star+POP selection...');
    resetSelections();
    
    // Use setTimeout to simulate the user interaction sequence
    setTimeout(() => {
      console.log('Selecting Star layer...');
      handleLayerSelect('S');
      
      setTimeout(() => {
        console.log('Selecting POP category...');
        handleCategorySelect('POP');
      }, 500);
    }, 100);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Taxonomy Selector Test
        </Typography>
        
        <Typography variant="body1" paragraph>
          This page tests the new stateless TaxonomySelector component that uses the 
          TaxonomyDataProvider as its single source of truth.
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Selected Values:</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography>
                Layer: <Box component="span" fontWeight="bold">{selectedLayer || 'None'}</Box>
              </Typography>
              <Typography>
                Category: <Box component="span" fontWeight="bold">{selectedCategory || 'None'}</Box>
              </Typography>
              <Typography>
                Subcategory: <Box component="span" fontWeight="bold">{selectedSubcategory || 'None'}</Box>
              </Typography>
            </Box>
          </Paper>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <button onClick={resetSelections}>Reset Selections</button>
            <button onClick={testStarPopSelection}>Test Star+POP Selection</button>
          </Box>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Standard Component" />
            <Tab label="Material UI Component" />
          </Tabs>
        </Box>
        
        {/* Wrap both versions in the TaxonomyDataProvider */}
        <TaxonomyDataProvider>
          {activeTab === 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>Standard Taxonomy Selector</Typography>
              <Box>
                <TaxonomySelector
                  selectedLayer={selectedLayer}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  onLayerSelect={handleLayerSelect}
                  onCategorySelect={handleCategorySelect}
                  onSubcategorySelect={handleSubcategorySelect}
                />
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>Material UI Taxonomy Selector</Typography>
              <Box>
                <TaxonomySelectorMUI
                  selectedLayer={selectedLayer}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  onLayerSelect={handleLayerSelect}
                  onCategorySelect={handleCategorySelect}
                  onSubcategorySelect={handleSubcategorySelect}
                />
              </Box>
            </Box>
          )}
        </TaxonomyDataProvider>
      </Box>
    </Container>
  );
};

export default TaxonomySelectorTestPage;