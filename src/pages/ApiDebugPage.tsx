import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, Grid, Divider, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';

/**
 * API Debug Page - A utility to test API connectivity and diagnose issues
 * This page is useful for debugging API connectivity issues in production
 */
const ApiDebugPage: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockModeEnabled, setMockModeEnabled] = useState<boolean>(
    localStorage.getItem('forceMockApi') === 'true'
  );

  // Define test endpoints
  const testEndpoints = [
    { name: 'Health Check', url: '/api/health' },
    { name: 'Backend Test', url: '/api/test-backend' }, 
    { name: 'Check Backend Directly', url: 'https://registry.reviz.dev/api/health' },
    { name: 'API Endpoint with Auth', url: '/api/assets' },
  ];

  // Test a specific endpoint
  const testEndpoint = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      
      const response = await axios.get(endpoint, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      console.log('Response:', response);
      
      setResults({
        endpoint,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error testing endpoint:', err);
      
      // Extract error details
      let errorMessage = 'Unknown error';
      let errorDetails = null;
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.message;
        
        if (err.response) {
          errorDetails = {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data,
          };
        } else if (err.request) {
          errorDetails = {
            request: 'Request was made but no response was received',
            message: 'This typically indicates a network error or CORS issue',
          };
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(`${errorMessage}${errorDetails ? ' (see console for details)' : ''}`);
      
      if (errorDetails) {
        console.log('Error details:', errorDetails);
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle mock mode
  const toggleMockMode = () => {
    const newValue = !mockModeEnabled;
    setMockModeEnabled(newValue);
    
    if (newValue) {
      localStorage.setItem('forceMockApi', 'true');
      console.log('Mock API mode enabled via localStorage');
    } else {
      localStorage.removeItem('forceMockApi');
      console.log('Mock API mode disabled');
    }
  };

  // Test all endpoints
  const testAllEndpoints = async () => {
    setResults(null);
    setError(null);
    
    // Test /api/test-backend first as it provides the most information
    await testEndpoint('/api/test-backend');
  };

  // Run initial test on component mount
  useEffect(() => {
    testAllEndpoints();
  }, []);

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        API Debug & Diagnostics
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page helps diagnose API connectivity issues. It tests various endpoints and shows detailed responses to help identify where problems might be occurring.
      </Alert>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Mock Mode Control
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography>
                Mock API Mode: <strong>{mockModeEnabled ? 'ENABLED' : 'DISABLED'}</strong>
              </Typography>
              <Button 
                variant="outlined" 
                color={mockModeEnabled ? 'error' : 'primary'}
                onClick={toggleMockMode}
                sx={{ ml: 2 }}
              >
                {mockModeEnabled ? 'Disable Mock Mode' : 'Enable Mock Mode'}
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary">
              When mock mode is enabled, the application will use fake data instead of real API calls. This can be useful for testing when the backend is unavailable.
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Endpoints
            </Typography>
            
            <Button 
              variant="contained" 
              onClick={testAllEndpoints}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Run Diagnostics'}
            </Button>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {testEndpoints.map((endpoint) => (
                <Grid item xs={12} sm={6} md={3} key={endpoint.url}>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => testEndpoint(endpoint.url)}
                    disabled={loading}
                  >
                    {endpoint.name}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {results && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Results: {results.endpoint}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Status: {results.status} {results.statusText}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Timestamp: {results.timestamp}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Response Data:
          </Typography>
          
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={JSON.stringify(results.data, null, 2)}
            InputProps={{
              readOnly: true,
              style: { fontFamily: 'monospace', fontSize: '0.875rem' }
            }}
            minRows={10}
            maxRows={20}
          />
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Response Headers:
          </Typography>
          
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={JSON.stringify(results.headers, null, 2)}
            InputProps={{
              readOnly: true,
              style: { fontFamily: 'monospace', fontSize: '0.875rem' }
            }}
            minRows={4}
            maxRows={10}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ApiDebugPage;