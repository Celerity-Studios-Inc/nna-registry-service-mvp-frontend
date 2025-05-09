import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * API endpoint that directly tests the real backend connectivity
 * This is distinct from our local health check - it specifically tests
 * the connection to the actual backend API server
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for browser access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Get the real backend URL from environment or use default
  const backendUrl = process.env.BACKEND_API_URL || 'https://registry.reviz.dev/api';
  
  // Create a diagnostics object for debugging
  const diagnostics = {
    localService: {
      status: 'ok',
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    },
    realBackend: {
      status: 'unknown',
      url: backendUrl,
      endpoints: {} as Record<string, any>,
      error: null as string | null
    },
    config: {
      backendUrl,
      environment: process.env.NODE_ENV || 'production'
    }
  };
  
  try {
    // Test endpoints directly on the real backend
    const testPaths = ['/health', '/docs', '/assets'];
    
    // Track if any endpoint worked
    let anyEndpointWorked = false;
    
    // Try each test path
    for (const path of testPaths) {
      try {
        const fullUrl = `${backendUrl}${path}`;
        console.log(`Testing real backend at: ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'NNA-Registry-Frontend-Diagnostic/1.0'
          },
          timeout: 3000 // 3 second timeout
        });
        
        // Store response details
        diagnostics.realBackend.endpoints[path] = {
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()])
        };
        
        // If we get something other than a 404, the backend is likely working
        // Even a 401 (Unauthorized) means the backend is there but needs auth
        if (response.status !== 404) {
          anyEndpointWorked = true;
        }
        
        // Try to get response body for more details
        try {
          const text = await response.text();
          diagnostics.realBackend.endpoints[path].responseBody = text.substring(0, 500);
          
          // If it looks like JSON, try to parse it
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            try {
              diagnostics.realBackend.endpoints[path].json = JSON.parse(text);
            } catch (e) {
              // Not valid JSON, that's okay
            }
          }
        } catch (bodyError) {
          diagnostics.realBackend.endpoints[path].bodyError = 'Could not read response body';
        }
      } catch (pathError: any) {
        diagnostics.realBackend.endpoints[path] = {
          error: pathError.message || 'Unknown error',
          stack: pathError.stack
        };
      }
    }
    
    // Set overall status based on results
    if (anyEndpointWorked) {
      diagnostics.realBackend.status = 'available';
    } else {
      diagnostics.realBackend.status = 'unavailable';
      diagnostics.realBackend.error = 'No backend endpoints responded successfully';
    }
  } catch (error: any) {
    diagnostics.realBackend.status = 'error';
    diagnostics.realBackend.error = error.message || 'Unknown error testing backend';
  }
  
  // Send the complete diagnostic report
  res.status(200).json({
    timestamp: new Date().toISOString(),
    realBackendAvailable: diagnostics.realBackend.status === 'available',
    diagnostics
  });
}

// Export using CommonJS syntax for Vercel
module.exports = handler;