import React, { useState } from 'react';
import { Container, Typography, Paper, Box, Button, Grid, Divider, Alert } from '@mui/material';
import SimpleTaxonomySelectionV3 from '../components/asset/SimpleTaxonomySelectionV3';
import { convertHFNtoMFA } from '../services/enhancedTaxonomyService';

const TaxonomySelectorV3Test: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('');
  const [selectedSubcategoryCode, setSelectedSubcategoryCode] = useState<string>('');
  const [hfnAddress, setHfnAddress] = useState<string>('');
  const [mfaAddress, setMfaAddress] = useState<string>('');
  
  // Handle layer selection
  const handleLayerSelect = (layer: string) => {
    console.log(`Selected layer: ${layer}`);
    setSelectedLayer(layer);
    setSelectedCategoryCode('');
    setSelectedSubcategoryCode('');
    setHfnAddress('');
    setMfaAddress('');
  };
  
  // Handle category selection
  const handleCategorySelect = (category: string) => {
    console.log(`Selected category: ${category}`);
    setSelectedCategoryCode(category);
    setSelectedSubcategoryCode('');
    setHfnAddress('');
    setMfaAddress('');
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = async (subcategory: string) => {
    console.log(`Selected subcategory: ${subcategory}`);
    setSelectedSubcategoryCode(subcategory);
    
    // Generate HFN and MFA addresses
    if (selectedLayer && selectedCategoryCode && subcategory) {
      const shortSubcategory = subcategory.includes('.') ? 
        subcategory.split('.')[1] : subcategory;
      
      const hfn = `${selectedLayer}.${selectedCategoryCode}.${shortSubcategory}.001`;
      setHfnAddress(hfn);
      
      try {
        const mfa = await convertHFNtoMFA(hfn);
        setMfaAddress(mfa);
      } catch (error) {
        console.error('Error converting HFN to MFA:', error);
        setMfaAddress('Error: Could not convert to MFA');
      }
    }
  };
  
  // Test problematic combinations
  const testProblematicCombination = (layer: string, category: string) => {
    setSelectedLayer(layer);
    setSelectedCategoryCode(category);
    setSelectedSubcategoryCode('');
    setHfnAddress('');
    setMfaAddress('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Enhanced Taxonomy Selector Test (V3)
        </Typography>
        <Typography variant="body1" paragraph>
          This page tests the enhanced taxonomy selector component (SimpleTaxonomySelectionV3) with improved error handling, fallback mechanisms, and UI features.
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Problematic Combinations:
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item>
              <Button 
                variant="outlined" 
                onClick={() => testProblematicCombination('L', 'PRF')}
              >
                Test L.PRF
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                onClick={() => testProblematicCombination('S', 'DNC')}
              >
                Test S.DNC
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                onClick={() => testProblematicCombination('S', 'POP')}
              >
                Test S.POP
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                onClick={() => testProblematicCombination('W', 'BCH')}
              >
                Test W.BCH
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        <SimpleTaxonomySelectionV3
          selectedLayer={selectedLayer}
          onLayerSelect={handleLayerSelect}
          selectedCategoryCode={selectedCategoryCode}
          onCategorySelect={handleCategorySelect}
          selectedSubcategoryCode={selectedSubcategoryCode}
          onSubcategorySelect={handleSubcategorySelect}
        />
        
        {hfnAddress && mfaAddress && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Typography variant="h6" gutterBottom>
              NNA Address Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary">
                  Human-Friendly Name (HFN):
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', my: 1 }}>
                  {hfnAddress}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="secondary">
                  Machine-Friendly Address (MFA):
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', my: 1 }}>
                  {mfaAddress}
                </Typography>
              </Grid>
            </Grid>
            
            {/* Special case alerts */}
            {selectedLayer === 'S' && selectedCategoryCode === 'POP' && selectedSubcategoryCode.includes('HPM') && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>Special Case:</strong> S.POP.HPM is mapped to 2.001.007.001 (using special case handler)
              </Alert>
            )}
            
            {selectedLayer === 'W' && selectedCategoryCode === 'BCH' && selectedSubcategoryCode.includes('SUN') && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>Special Case:</strong> W.BCH.SUN is mapped to 5.004.003.001 (using special case handler)
              </Alert>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TaxonomySelectorV3Test;