import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Grid } from '@mui/material';
import ErrorBoundary from '../common/ErrorBoundary';
import TaxonomyErrorBoundary from '../taxonomy/TaxonomyErrorBoundary';

// A component that will throw an error on demand
const BuggyCounter: React.FC<{ throwError?: boolean }> = ({ throwError = false }) => {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setCount(prev => prev + 1);
  };
  
  if (throwError && count >= 3) {
    throw new Error('Counter reached 3! (This is a demonstration error)');
  }
  
  return (
    <Box>
      <Typography variant="h6">Count: {count}</Typography>
      <Button onClick={handleClick} variant="contained" color="primary">
        Increment
      </Button>
      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
        {throwError ? 'This will error at count 3' : 'This counter works normally'}
      </Typography>
    </Box>
  );
};

// A taxonomy component that will throw an error on demand
const TaxonomyComponent: React.FC<{ throwError?: boolean }> = ({ throwError = false }) => {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  
  const layers = ['G', 'S', 'L', 'M', 'W'];
  
  const handleLayerSelect = (layer: string) => {
    if (throwError && layer === 'S') {
      throw new Error('Error selecting Star layer! (This is a demonstration error)');
    }
    setSelectedLayer(layer);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Taxonomy Demo
      </Typography>
      
      <Typography variant="subtitle2" gutterBottom>
        Selected Layer: {selectedLayer || 'None'}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
        {layers.map(layer => (
          <Button
            key={layer}
            variant={selectedLayer === layer ? 'contained' : 'outlined'}
            onClick={() => handleLayerSelect(layer)}
          >
            {layer}
          </Button>
        ))}
      </Box>
      
      {throwError && (
        <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'error.main' }}>
          Clicking on 'S' will trigger an error
        </Typography>
      )}
    </Box>
  );
};

/**
 * Example component demonstrating error boundaries
 */
const ErrorBoundaryExample: React.FC = () => {
  const [resetCount, setResetCount] = useState(0);
  
  const handleTaxonomyReset = () => {
    console.log('Taxonomy reset handler called');
    setResetCount(prev => prev + 1);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Error Boundary Examples
      </Typography>
      
      <Typography variant="body1" paragraph>
        These examples demonstrate how error boundaries catch JavaScript errors
        in the component tree and display fallback UIs instead of crashing the
        whole application.
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Basic Error Boundary Example */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Standard Error Boundary
            </Typography>
            
            <ErrorBoundary>
              <BuggyCounter throwError />
            </ErrorBoundary>
          </Paper>
        </Grid>
        
        {/* Taxonomy Error Boundary Example */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Taxonomy Error Boundary
            </Typography>
            
            <TaxonomyErrorBoundary
              onReset={handleTaxonomyReset}
              attemptReload={() => {
                console.log('Reload taxonomy data attempted');
                setResetCount(prev => prev + 1);
              }}
            >
              {/* Key prop forces recreation of component when resetCount changes */}
              <TaxonomyComponent key={resetCount} throwError />
            </TaxonomyErrorBoundary>
          </Paper>
        </Grid>
        
        {/* Additional information */}
        <Grid item xs={12}>
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              How Error Boundaries Work:
            </Typography>
            
            <Typography variant="body2" paragraph>
              Error boundaries are React components that catch JavaScript errors in their
              child component tree, log those errors, and display a fallback UI. They are
              similar to try-catch blocks but for component trees.
            </Typography>
            
            <Typography variant="body2">
              In the examples above:
            </Typography>
            
            <ul>
              <li>
                <Typography variant="body2">
                  The counter will throw an error when it reaches 3
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  The taxonomy component will throw an error when you select the 'S' layer
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  The error boundaries will catch these errors and show fallback UIs
                </Typography>
              </li>
            </ul>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ErrorBoundaryExample;