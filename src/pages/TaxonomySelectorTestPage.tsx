import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Tabs, 
  Tab, 
  Divider,
  Button,
  CircularProgress 
} from '@mui/material';
import SimpleTaxonomySelectionV2 from '../components/asset/SimpleTaxonomySelectionV2';
import DropdownBasedTaxonomySelector from '../components/taxonomy/DropdownBasedTaxonomySelector';
import { CategoryOption, SubcategoryOption } from '../types/taxonomy.types';
import { logger } from '../utils/logger';

/**
 * TaxonomySelectorTestPage
 * 
 * A test page to compare different taxonomy selectors side-by-side.
 * This page allows the user to try both the card-based (SimpleTaxonomySelectionV2)
 * and dropdown-based (DropdownBasedTaxonomySelector) implementations.
 */
const TaxonomySelectorTestPage: React.FC = () => {
  // State for the test page
  const [selectorType, setSelectorType] = useState<number>(0);
  const [selectedLayer, setSelectedLayer] = useState<string>('S'); // Default to Stars layer
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [humanFriendlyName, setHumanFriendlyName] = useState<string>('');
  const [machineFriendlyAddress, setMachineFriendlyAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<{
    success: boolean;
    message: string;
    hfn: string;
    mfa: string;
  } | null>(null);

  // Handle selector type change
  const handleSelectorTypeChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setHumanFriendlyName('');
    setMachineFriendlyAddress('');
    setTestResults(null);
    setSelectorType(newValue);
  };

  // Handle layer selection for card-based selector
  const handleCardLayerSelect = (selectedLayer: string, isDoubleClick?: boolean) => {
    logger.info(`Card selector - Layer selected: ${selectedLayer}`);
    setSelectedLayer(selectedLayer);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setHumanFriendlyName('');
    setMachineFriendlyAddress('');
    setTestResults(null);
  };

  // Handle category selection for card-based selector
  const handleCardCategorySelect = (category: string, isDoubleClick?: boolean) => {
    logger.info(`Card selector - Category selected: ${category}`);
    setSelectedCategory(category);
    setSelectedSubcategory('');
    setHumanFriendlyName('');
    setMachineFriendlyAddress('');
    setTestResults(null);
  };

  // Handle subcategory selection for card-based selector
  const handleCardSubcategorySelect = (subcategory: string, isDoubleClick?: boolean) => {
    logger.info(`Card selector - Subcategory selected: ${subcategory}`);
    setSelectedSubcategory(subcategory);
    setTestResults(null);
  };

  // Handle category selection for dropdown-based selector
  const handleDropdownCategorySelect = (category: CategoryOption) => {
    logger.info(`Dropdown selector - Category selected: ${category.name} (${category.code})`);
    setSelectedCategory(category.code);
    setSelectedSubcategory('');
    setHumanFriendlyName('');
    setMachineFriendlyAddress('');
    setTestResults(null);
  };

  // Handle subcategory selection for dropdown-based selector
  const handleDropdownSubcategorySelect = (subcategory: SubcategoryOption, isDoubleClick?: boolean) => {
    logger.info(`Dropdown selector - Subcategory selected: ${subcategory.name} (${subcategory.code})`);
    setSelectedSubcategory(subcategory.code);
    setTestResults(null);
  };

  // Handle NNA address change
  const handleNNAAddressChange = (
    hfn: string,
    mfa: string,
    sequentialNumber: number,
    originalSubcategory?: string
  ) => {
    logger.info(`NNA Address change: HFN=${hfn}, MFA=${mfa}, Sequential=${sequentialNumber}`);
    
    if (originalSubcategory) {
      logger.info(`Original subcategory: ${originalSubcategory}`);
    }
    
    setHumanFriendlyName(hfn);
    setMachineFriendlyAddress(mfa);
  };

  // Test selected taxonomy
  const testSelectedTaxonomy = () => {
    if (!selectedLayer || !selectedCategory || !selectedSubcategory) {
      setTestResults({
        success: false,
        message: 'Please select layer, category, and subcategory first.',
        hfn: '',
        mfa: ''
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const success = !!humanFriendlyName && !!machineFriendlyAddress;
      
      setTestResults({
        success,
        message: success 
          ? 'Taxonomy validation successful!' 
          : 'Error: Failed to generate valid NNA addresses.',
        hfn: humanFriendlyName,
        mfa: machineFriendlyAddress
      });
      
      setLoading(false);
    }, 800);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Taxonomy Selector Test Page
      </Typography>
      <Typography variant="body1" paragraph align="center" color="text.secondary">
        Compare different taxonomy selector implementations. Test the stability of each approach
        with different layer/category/subcategory combinations.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={selectorType} 
            onChange={handleSelectorTypeChange}
            aria-label="taxonomy selector tabs"
          >
            <Tab label="Card-Based Selector" />
            <Tab label="Dropdown-Based Selector" />
          </Tabs>
        </Box>

        {/* Card-Based Selector */}
        {selectorType === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Card-Based Taxonomy Selector
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              This implementation uses cards for selection. Select a layer, category, and subcategory.
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <SimpleTaxonomySelectionV2
              layer={selectedLayer}
              onCategorySelect={handleCardCategorySelect}
              onSubcategorySelect={handleCardSubcategorySelect}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
            />
          </Box>
        )}

        {/* Dropdown-Based Selector */}
        {selectorType === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Dropdown-Based Taxonomy Selector
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              This implementation uses dropdowns for selection. Select a layer, category, and subcategory.
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <DropdownBasedTaxonomySelector
              layerCode={selectedLayer}
              onCategorySelect={handleDropdownCategorySelect}
              onSubcategorySelect={handleDropdownSubcategorySelect}
              selectedCategoryCode={selectedCategory}
              selectedSubcategoryCode={selectedSubcategory}
              onNNAAddressChange={handleNNAAddressChange}
            />
          </Box>
        )}

        {/* Layer Selection (Common to both implementations) */}
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Common Layer Selector
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Test with different layers using this control:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {['G', 'S', 'L', 'M', 'W', 'B', 'P', 'T', 'C'].map(layer => (
              <Button
                key={layer}
                variant={selectedLayer === layer ? 'contained' : 'outlined'}
                onClick={() => handleCardLayerSelect(layer)}
                sx={{ minWidth: '60px' }}
              >
                {layer}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Test Results */}
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Test Results
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={testSelectedTaxonomy}
              disabled={loading || !selectedLayer || !selectedCategory || !selectedSubcategory}
              sx={{ minWidth: '200px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Test Selection'}
            </Button>
          </Box>
          
          {testResults && (
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: testResults.success ? '#e8f5e9' : '#ffebee',
                border: `1px solid ${testResults.success ? '#81c784' : '#ef9a9a'}`,
                borderRadius: 1
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color={testResults.success ? 'success.dark' : 'error.dark'}
              >
                {testResults.success ? 'Success!' : 'Error'}
              </Typography>
              <Typography paragraph>
                {testResults.message}
              </Typography>
              
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Generated Addresses:
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  HFN: {testResults.hfn || '(none)'}
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  MFA: {testResults.mfa || '(none)'}
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Testing Instructions
        </Typography>
        <Typography variant="body2" paragraph>
          1. Switch between the selector types using the tabs above.
        </Typography>
        <Typography variant="body2" paragraph>
          2. Select a layer from the common layer selector (this will reset the selection).
        </Typography>
        <Typography variant="body2" paragraph>
          3. Select a category and subcategory using the current selector implementation.
        </Typography>
        <Typography variant="body2" paragraph>
          4. Click "Test Selection" to validate the selected taxonomy.
        </Typography>
        <Typography variant="body2" paragraph>
          5. Special cases to test:
        </Typography>
        <Box component="ul">
          <Box component="li">
            <Typography variant="body2">S.POP.HPM (Stars layer, "Pop" category, "Hipster Male" subcategory)</Typography>
          </Box>
          <Box component="li">
            <Typography variant="body2">W.BCH.SUN (Worlds layer, "Beach" category, "Sunny" subcategory)</Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TaxonomySelectorTestPage;