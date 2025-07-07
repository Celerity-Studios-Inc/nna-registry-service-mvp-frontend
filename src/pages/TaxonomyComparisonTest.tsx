import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import taxonomyService from '../api/taxonomyService';
import { 
  getLayers as getLayersEnhanced,
  getCategories as getCategoriesEnhanced,
  getSubcategories as getSubcategoriesEnhanced,
  inspectTaxonomyStructure,
  convertHFNtoMFA
} from '../services/enhancedTaxonomyService';
import { convertHFNToMFA } from '../api/codeMapping';

const TaxonomyComparisonTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test cases - focusing on the problematic combinations
  const testCases = [
    { layer: 'L', category: 'PRF', description: 'Looks - Modern Performance' },
    { layer: 'S', category: 'DNC', description: 'Stars - Dance Electronic' },
    { layer: 'G', category: 'POP', description: 'Songs - Pop' },
    { layer: 'G', category: 'RCK', description: 'Songs - Rock' },
    { layer: 'S', category: 'POP', description: 'Stars - Pop' },
    { layer: 'W', category: 'BCH', description: 'Worlds - Beach' }
  ];

  // HFN test cases for MFA conversion
  const hfnTestCases = [
    { hfn: 'S.POP.HPM.001', description: 'Stars - Pop - Hipster Male' },
    { hfn: 'W.BCH.SUN.001', description: 'Worlds - Beach - Sunset' },
    { hfn: 'G.POP.BAS.001', description: 'Songs - Pop - Base' },
    { hfn: 'L.PRF.BAS.001', description: 'Looks - Performance - Base' }
  ];

  const runComparison = async () => {
    setIsRunning(true);
    const results: any[] = [];

    // Test subcategory loading
    for (const testCase of testCases) {
      const { layer, category, description } = testCase;
      
      try {
        // Test original service
        let originalResult;
        try {
          originalResult = taxonomyService.getSubcategories(layer, category);
        } catch (err) {
          originalResult = { error: err instanceof Error ? err.message : String(err) };
        }
        
        // Test enhanced service  
        let enhancedResult;
        let inspection;
        try {
          enhancedResult = await getSubcategoriesEnhanced(layer, category);
          inspection = await inspectTaxonomyStructure(layer, category);
        } catch (err) {
          enhancedResult = { error: err instanceof Error ? err.message : String(err) };
          inspection = { error: err instanceof Error ? err.message : String(err) };
        }
        
        results.push({
          testCase: `${layer}.${category}`,
          description,
          type: 'subcategory',
          original: {
            count: Array.isArray(originalResult) ? originalResult.length : 0,
            data: Array.isArray(originalResult) ? originalResult : [],
            success: Array.isArray(originalResult) && originalResult.length > 0,
            error: !Array.isArray(originalResult) ? originalResult.error : null
          },
          enhanced: {
            count: Array.isArray(enhancedResult) ? enhancedResult.length : 0,
            data: Array.isArray(enhancedResult) ? enhancedResult : [],
            success: Array.isArray(enhancedResult) && enhancedResult.length > 0,
            error: !Array.isArray(enhancedResult) ? enhancedResult.error : null
          },
          inspection,
          status: (
            Array.isArray(enhancedResult) && 
            enhancedResult.length > 0 && 
            (!Array.isArray(originalResult) || originalResult.length === 0)
          ) ? 'FIXED' : (
            Array.isArray(enhancedResult) && 
            enhancedResult.length > 0 && 
            Array.isArray(originalResult) && 
            originalResult.length > 0
          ) ? 'BOTH_WORKING' : 'STILL_BROKEN'
        });
        
      } catch (error) {
        results.push({
          testCase: `${layer}.${category}`,
          description,
          type: 'subcategory',
          error: error instanceof Error ? error.message : String(error),
          status: 'ERROR'
        });
      }
    }

    // Test HFN to MFA conversion
    for (const testCase of hfnTestCases) {
      const { hfn, description } = testCase;
      
      try {
        // Test original conversion
        let originalMfa;
        try {
          originalMfa = convertHFNToMFA(hfn);
        } catch (err) {
          originalMfa = { error: err instanceof Error ? err.message : String(err) };
        }
        
        // Test enhanced conversion
        let enhancedMfa;
        try {
          enhancedMfa = await convertHFNtoMFA(hfn);
        } catch (err) {
          enhancedMfa = { error: err instanceof Error ? err.message : String(err) };
        }
        
        // Determine expected MFA based on known mapping
        const expectedMfa = (() => {
          if (hfn === 'S.POP.HPM.001') return '2.001.007.001';
          if (hfn === 'W.BCH.SUN.001') return '5.004.003.001';
          if (hfn === 'G.POP.BAS.001') return '1.001.001.001';
          if (hfn === 'L.PRF.BAS.001') return '3.001.001.001';
          return null;
        })();
        
        results.push({
          testCase: hfn,
          description,
          type: 'conversion',
          original: {
            result: typeof originalMfa === 'string' ? originalMfa : null,
            success: typeof originalMfa === 'string',
            error: typeof originalMfa !== 'string' ? originalMfa.error : null,
            correct: typeof originalMfa === 'string' && expectedMfa === originalMfa
          },
          enhanced: {
            result: typeof enhancedMfa === 'string' ? enhancedMfa : null,
            success: typeof enhancedMfa === 'string',
            error: typeof enhancedMfa !== 'string' ? enhancedMfa.error : null,
            correct: typeof enhancedMfa === 'string' && expectedMfa === enhancedMfa
          },
          expected: expectedMfa,
          status: typeof enhancedMfa === 'string' && expectedMfa === enhancedMfa ? 'CORRECT' : 'INCORRECT'
        });
        
      } catch (error) {
        results.push({
          testCase: hfn,
          description,
          type: 'conversion',
          error: error instanceof Error ? error.message : String(error),
          status: 'ERROR'
        });
      }
    }
    
    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FIXED': return 'success';
      case 'BOTH_WORKING': return 'success';
      case 'STILL_BROKEN': return 'error';
      case 'CORRECT': return 'success';
      case 'INCORRECT': return 'error';
      case 'ERROR': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Taxonomy Service Comparison Test
      </Typography>
      
      <Typography variant="body1" paragraph>
        This page compares the original taxonomy service with the enhanced version
        to verify that the subcategory loading issues have been resolved.
      </Typography>

      <Button 
        variant="contained" 
        onClick={runComparison}
        disabled={isRunning}
        sx={{ mb: 3 }}
      >
        {isRunning ? 'Running Tests...' : 'Run Comparison Test'}
      </Button>

      {isRunning && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Running tests...</Typography>
        </Box>
      )}

      {testResults.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Subcategory Loading Tests
          </Typography>
          <Grid container spacing={3}>
            {testResults
              .filter(result => result.type === 'subcategory')
              .map((result, index) => (
                <Grid item xs={12} key={`subcategory-${index}`}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {result.testCase} - {result.description}
                      </Typography>
                      <Alert severity={getStatusColor(result.status)} sx={{ ml: 2 }}>
                        {result.status}
                      </Alert>
                    </Box>

                    {result.error ? (
                      <Alert severity="error">
                        Error: {result.error}
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Original Service Result
                          </Typography>
                          {result.original.error ? (
                            <Alert severity="error" sx={{ mb: 2 }}>
                              Error: {result.original.error}
                            </Alert>
                          ) : (
                            <>
                              <Typography color={result.original.success ? 'success.main' : 'error.main'}>
                                Count: {result.original.count}
                              </Typography>
                              {result.original.data.length > 0 && (
                                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                  <Typography variant="caption">
                                    {result.original.data.slice(0, 3).map((item: any) => item.code).join(', ')}
                                    {result.original.data.length > 3 && '...'}
                                  </Typography>
                                </Box>
                              )}
                            </>
                          )}
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Enhanced Service Result
                          </Typography>
                          {result.enhanced.error ? (
                            <Alert severity="error" sx={{ mb: 2 }}>
                              Error: {result.enhanced.error}
                            </Alert>
                          ) : (
                            <>
                              <Typography color={result.enhanced.success ? 'success.main' : 'error.main'}>
                                Count: {result.enhanced.count}
                              </Typography>
                              {result.enhanced.data.length > 0 && (
                                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                                  <Typography variant="caption">
                                    {result.enhanced.data.slice(0, 3).map((item: any) => item.code).join(', ')}
                                    {result.enhanced.data.length > 3 && '...'}
                                  </Typography>
                                </Box>
                              )}
                            </>
                          )}
                        </Grid>
                      </Grid>
                    )}
                  </Paper>
                </Grid>
              ))}
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            HFN to MFA Conversion Tests
          </Typography>
          <Grid container spacing={3}>
            {testResults
              .filter(result => result.type === 'conversion')
              .map((result, index) => (
                <Grid item xs={12} key={`conversion-${index}`}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {result.testCase} - {result.description}
                      </Typography>
                      <Alert severity={getStatusColor(result.status)} sx={{ ml: 2 }}>
                        {result.status}
                      </Alert>
                    </Box>

                    {result.error ? (
                      <Alert severity="error">
                        Error: {result.error}
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            Expected MFA: {result.expected}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Original Conversion
                          </Typography>
                          {result.original.error ? (
                            <Alert severity="error" sx={{ mb: 2 }}>
                              Error: {result.original.error}
                            </Alert>
                          ) : (
                            <Typography 
                              color={result.original.correct ? 'success.main' : 'error.main'}
                              sx={{ fontWeight: 'bold' }}
                            >
                              {result.original.result}
                              {result.original.correct ? ' ✅' : ' ❌'}
                            </Typography>
                          )}
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Enhanced Conversion
                          </Typography>
                          {result.enhanced.error ? (
                            <Alert severity="error" sx={{ mb: 2 }}>
                              Error: {result.enhanced.error}
                            </Alert>
                          ) : (
                            <Typography 
                              color={result.enhanced.correct ? 'success.main' : 'error.main'}
                              sx={{ fontWeight: 'bold' }}
                            >
                              {result.enhanced.result}
                              {result.enhanced.correct ? ' ✅' : ' ❌'}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    )}
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default TaxonomyComparisonTest;