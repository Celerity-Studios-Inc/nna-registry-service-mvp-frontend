// Import types only to use in function signature
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * Test backend connectivity and return detailed diagnostic information
 * This is a dedicated endpoint for troubleshooting backend connectivity issues
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Backend test endpoint called');
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Collect diagnostic information
  const diagnostics = {
    frontend: {
      timestamp: new Date().toISOString(),
      endpoint: req.url,
      method: req.method,
      headers: {
        host: req.headers.host,
        referer: req.headers.referer || 'none',
        userAgent: req.headers['user-agent'],
      },
    },
    backend: {
      status: 'unknown',
      endpoints: {} as Record<string, any>,
      errors: [] as string[]
    },
    config: {
      backendBaseUrl: 'https://registry.reviz.dev',
      appBaseUrl: `https://${req.headers.host || 'localhost'}`,
      paths: ['/api', '/api/health', '/api/docs'],
    }
  };
  
  // Test multiple backend endpoints to diagnose the issue
  for (const path of diagnostics.config.paths) {
    const targetUrl = `${diagnostics.config.backendBaseUrl}${path}`;
    
    try {
      console.log(`Testing backend connectivity to ${targetUrl}`);
      
      // Try to reach the backend
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NNA-Registry-Frontend-Diagnostic/1.0',
        },
        timeout: 5000, // 5 second timeout
      });
      
      // Store the response details
      diagnostics.backend.endpoints[path] = {
        url: targetUrl,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()]),
      };
      
      // Try to get the response body
      try {
        const responseText = await response.text();
        const responsePreview = responseText.length > 500 
          ? responseText.substring(0, 500) + '...' 
          : responseText;
          
        diagnostics.backend.endpoints[path].responsePreview = responsePreview;
        
        // If it looks like JSON, try to parse it
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          try {
            const jsonData = JSON.parse(responseText);
            diagnostics.backend.endpoints[path].jsonData = jsonData;
          } catch (e) {
            diagnostics.backend.endpoints[path].jsonParseError = 'Failed to parse response as JSON';
          }
        }
      } catch (bodyError) {
        diagnostics.backend.endpoints[path].bodyError = 'Failed to read response body';
      }
      
      // Check if at least one endpoint is working
      if (response.status >= 200 && response.status < 300) {
        diagnostics.backend.status = 'available';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      diagnostics.backend.endpoints[path] = {
        url: targetUrl,
        error: errorMessage,
      };
      diagnostics.backend.errors.push(`Failed to connect to ${targetUrl}: ${errorMessage}`);
    }
  }
  
  // Set overall status based on results
  if (diagnostics.backend.status !== 'available') {
    diagnostics.backend.status = 'unavailable';
  }
  
  // Send the diagnostic information
  res.status(200).json({
    status: diagnostics.backend.status === 'available' ? 'ok' : 'error',
    message: diagnostics.backend.status === 'available' 
      ? 'Backend connectivity test successful' 
      : 'Backend connectivity test failed',
    diagnostics: diagnostics,
    timestamp: new Date().toISOString(),
  });
}

// Export using CommonJS syntax for Vercel
module.exports = handler;