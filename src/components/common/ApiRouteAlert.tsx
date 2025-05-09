import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, Box, Link, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * Component that shows an alert when API routing is not working correctly
 * This is especially useful for detecting when serve -s build is used without proper configuration
 */
const ApiRouteAlert = () => {
  const [isHtmlResponse, setIsHtmlResponse] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Check if we have a flag in localStorage indicating an API routing error
    const hasRoutingError = localStorage.getItem('apiRoutingError') === 'true';
    
    // Set state based on localStorage flag
    setIsHtmlResponse(hasRoutingError);
    
    // Also attempt to detect the issue directly by calling our health endpoint
    // and checking if we get HTML instead of JSON
    const checkApiRouting = async () => {
      try {
        const healthResponse = await fetch('/api/health');
        
        // Check if the content type header indicates HTML
        const contentType = healthResponse.headers.get('content-type');
        const isHtml = contentType?.includes('text/html');
        
        if (isHtml) {
          console.error('API routing error detected: /api/health endpoint returned HTML');
          setIsHtmlResponse(true);
          // Store in localStorage to persist the warning
          localStorage.setItem('apiRoutingError', 'true');
          return;
        }
        
        // Try to parse the response as JSON
        const responseText = await healthResponse.text();
        
        // Check if the response looks like HTML
        if (responseText.trim().startsWith('<!doctype html>') || responseText.includes('<html')) {
          console.error('API routing error detected: /api/health endpoint returned HTML content');
          setIsHtmlResponse(true);
          // Store in localStorage to persist the warning
          localStorage.setItem('apiRoutingError', 'true');
          return;
        }
        
        // Try to parse as JSON to confirm it's properly formatted
        try {
          JSON.parse(responseText);
          // If we get here, the API is working correctly
          setIsHtmlResponse(false);
          // Clear the error flag
          localStorage.removeItem('apiRoutingError');
        } catch (e) {
          // If we can't parse as JSON, the response is invalid
          console.error('API routing warning: /api/health endpoint returned invalid JSON');
          setIsHtmlResponse(true);
          // Store in localStorage to persist the warning
          localStorage.setItem('apiRoutingError', 'true');
        }
      } catch (error) {
        // Network error or other issue - don't set an error state as it could be transient
        console.error('API health check error:', error);
      }
    };
    
    // Only run the check if we're in a browser environment and not already detected an error
    if (!hasRoutingError && typeof window !== 'undefined') {
      checkApiRouting();
    }
  }, []);

  // Don't render anything if no error or already dismissed
  if (!isHtmlResponse || dismissed) {
    return null;
  }

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16, 
      maxWidth: '400px',
      zIndex: 9999
    }}>
      <Alert 
        severity="error"
        variant="filled"
        icon={<ErrorOutlineIcon />}
        onClose={() => setDismissed(true)}
        sx={{ boxShadow: 3 }}
      >
        <AlertTitle>API Routing Error</AlertTitle>
        <p>
          The server is returning HTML instead of JSON for API endpoints.
          This happens when the local production server is misconfigured.
        </p>
        <p>
          <strong>Solution:</strong> Use this command to serve the app:
        </p>
        <pre style={{ 
          backgroundColor: 'rgba(0,0,0,0.2)', 
          padding: '8px', 
          overflowX: 'auto',
          borderRadius: '4px'
        }}>
          serve -s build -l 3000 --config serve.json
        </pre>
        <p>
          Or use the provided script:
        </p>
        <pre style={{ 
          backgroundColor: 'rgba(0,0,0,0.2)', 
          padding: '8px', 
          overflowX: 'auto',
          borderRadius: '4px'
        }}>
          ./serve-local.sh
        </pre>
        <Button 
          variant="outlined" 
          color="inherit" 
          size="small"
          onClick={() => {
            localStorage.removeItem('apiRoutingError');
            setIsHtmlResponse(false);
          }}
          sx={{ mt: 1, mr: 1 }}
        >
          Clear Alert
        </Button>
        <Link 
          href="https://github.com/vercel/serve#api-routing-with-serve"
          target="_blank"
          color="inherit"
          sx={{ color: 'white', textDecoration: 'underline', fontSize: '0.875rem' }}
        >
          Learn More
        </Link>
      </Alert>
    </Box>
  );
};

export default ApiRouteAlert;