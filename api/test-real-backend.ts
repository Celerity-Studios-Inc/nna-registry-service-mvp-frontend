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
    // Test specific endpoints that we know should exist or are common in NestJS backends
    const testPaths = ['/docs', '/auth/login', '/assets'];
    
    // Track if any endpoint worked - consider 200, 401, and 403 as working
    // (401/403 mean the API exists but needs auth, which is fine)
    let anyEndpointWorked = false;
    
    // Try each test path
    for (const path of testPaths) {
      try {
        const fullUrl = `${backendUrl}${path}`;
        console.log(`Testing real backend at: ${fullUrl}`);
        
        // For login endpoint, use POST with empty body as it's likely a POST endpoint
        const method = path === '/auth/login' ? 'POST' : 'GET';
        const body = path === '/auth/login' ? JSON.stringify({email: 'test@example.com', password: 'test'}) : undefined;
        const contentType = path === '/auth/login' ? 'application/json' : 'application/json';
        
        const response = await fetch(fullUrl, {
          method,
          body,
          headers: {
            'Accept': 'application/json',
            'Content-Type': contentType,
            'User-Agent': 'NNA-Registry-Frontend-Diagnostic/1.0'
          },
          timeout: 3000 // 3 second timeout
        });
        
        // Store response details
        diagnostics.realBackend.endpoints[path] = {
          url: fullUrl,
          method,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()])
        };
        
        // Consider 2xx (success), 3xx (redirect), 401 (unauthorized), or 403 (forbidden) as working
        // These mean the API responded, even if it needs auth
        if (
          (response.status >= 200 && response.status < 400) || // 2xx or 3xx (success or redirect)
          response.status === 401 || // Unauthorized (API exists but needs auth)
          response.status === 403    // Forbidden (API exists but user can't access)
        ) {
          anyEndpointWorked = true;
          diagnostics.realBackend.endpoints[path].working = true;
        } else {
          diagnostics.realBackend.endpoints[path].working = false;
        }
        
        // Try to get response body for more details
        try {
          const text = await response.text();
          // Only store a preview to avoid huge responses
          diagnostics.realBackend.endpoints[path].responsePreview = text.substring(0, 500);
          
          // If it looks like JSON, try to parse it
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            try {
              const jsonData = JSON.parse(text);
              // Look for common NestJS error patterns to provide better diagnostics
              if (jsonData.success === false && jsonData.error) {
                diagnostics.realBackend.endpoints[path].errorType = jsonData.error.code;
                diagnostics.realBackend.endpoints[path].errorMessage = jsonData.error.message;
              }
              diagnostics.realBackend.endpoints[path].json = jsonData;
            } catch (e) {
              // Not valid JSON, that's okay
            }
          }
        } catch (bodyError) {
          diagnostics.realBackend.endpoints[path].bodyError = 'Could not read response body';
        }
      } catch (pathError: any) {
        diagnostics.realBackend.endpoints[path] = {
          url: `${backendUrl}${path}`,
          error: pathError.message || 'Unknown error',
          stack: pathError.stack ? pathError.stack.split('\n').slice(0, 3).join('\n') : undefined
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