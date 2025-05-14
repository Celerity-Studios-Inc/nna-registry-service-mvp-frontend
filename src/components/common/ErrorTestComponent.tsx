import React from 'react';
import { Button, Grid, Typography, Card, CardContent } from '@mui/material';
import { useError } from '../../contexts/ErrorContext';
import api from '../../api/api';

/**
 * Component to test different error handling scenarios
 */
const ErrorTestComponent: React.FC = () => {
  const { setError } = useError();

  // Test local context error
  const testContextError = () => {
    setError('This is a test error from context', 'error');
  };

  // Test local context warning
  const testContextWarning = () => {
    setError('This is a test warning from context', 'warning');
  };

  // Test local context info
  const testContextInfo = () => {
    setError('This is a test info message from context', 'info');
  };

  // Test local context success
  const testContextSuccess = () => {
    setError('This is a test success message from context', 'success');
  };

  // Test API error (404)
  const testApiNotFound = async () => {
    try {
      await api.get('/non-existent-endpoint');
    } catch (error) {
      // Error will be handled by the global error handler
      console.log('API 404 error caught in component');
    }
  };

  // Test API error (401)
  const testApiUnauthorized = async () => {
    try {
      // Temporarily remove the auth token
      const token = localStorage.getItem('accessToken');
      localStorage.removeItem('accessToken');
      
      // Make API call that requires authentication
      await api.get('/assets/protected');
      
      // Restore token
      if (token) localStorage.setItem('accessToken', token);
    } catch (error) {
      console.log('API 401 error caught in component');
      // Restore token in case it was removed
      const token = localStorage.getItem('accessToken');
      if (token) localStorage.setItem('accessToken', token);
    }
  };

  // Test network error
  const testNetworkError = async () => {
    try {
      // Use a non-existent domain to trigger a network error
      await api.get('https://non-existent-domain-12345.com/api');
    } catch (error) {
      console.log('Network error caught in component');
    }
  };

  // Test object-style error
  const testObjectError = () => {
    setError({
      title: 'Custom Error Title',
      message: 'This is a custom error message with title and no auto-hide',
      severity: 'error',
      autoHide: false
    });
  };
  
  // Test validation error with field-specific messages
  const testValidationError = () => {
    setError({
      title: 'Validation Failed',
      message: 'name: Name is required; email: Invalid email format; password: Password must be at least 8 characters',
      severity: 'warning',
      autoHide: true
    });
  };

  return (
    <Card sx={{ mb: 4, mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Error Handling Test Component
        </Typography>
        <Typography variant="body1" paragraph>
          Use these buttons to test different error scenarios
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="error" 
              fullWidth
              onClick={testContextError}
            >
              Test Error
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="warning" 
              fullWidth
              onClick={testContextWarning}
            >
              Test Warning  
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="info" 
              fullWidth
              onClick={testContextInfo}
            >
              Test Info
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button 
              variant="contained" 
              color="success" 
              fullWidth
              onClick={testContextSuccess}
            >
              Test Success
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth
              onClick={testApiNotFound}
            >
              Test API 404 Error
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth
              onClick={testApiUnauthorized}
            >
              Test API 401 Error
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth
              onClick={testNetworkError}
            >
              Test Network Error
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button 
              variant="outlined" 
              color="secondary" 
              fullWidth
              onClick={testObjectError}
            >
              Test Custom Error Object (No Auto-Hide)
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button 
              variant="outlined" 
              color="secondary" 
              fullWidth
              onClick={testValidationError}
            >
              Test Validation Error
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ErrorTestComponent;