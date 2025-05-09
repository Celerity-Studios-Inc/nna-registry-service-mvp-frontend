import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * Simplified assets endpoint handler that directly forwards to backend
 * This is the minimal implementation to handle /api/assets routes
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers upfront
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`ASSETS HANDLER: ${req.method} ${req.url}`);
  
  // Simple direct forwarding to backend
  try {
    // Hard-code the backend URL - this is the key simplification
    const backendUrl = 'https://registry.reviz.dev/api/assets';
    
    // For debugging: log all parts of URL
    const url = req.url || '';
    console.log('URL parts analysis:', {
      url: url,
      path: (url || '').split('?')[0],
      parts: (url || '').split('?')[0].split('/').filter(Boolean)
    });
    
    // In Vercel serverless functions, the URL typically doesn't include /api prefix
    // The URL is often something like /assets or / for root endpoint
    // so we need to be careful about path construction
    
    // Don't add any path components - just use the raw backend URL for POST to /assets
    let finalUrl = backendUrl;
    
    // Only add path components for specific asset routes (GET one asset, etc.)
    // But NOT for the main /assets endpoint which is what we use for POST
    if (url && url !== '/' && url !== '/assets' && url !== '/assets/') {
      // Extract path after assets/ if it exists
      const match = url.match(/\/assets\/(.+)/);
      if (match && match[1]) {
        finalUrl = `${backendUrl}/${match[1]}`;
        console.log(`Found sub-path: ${match[1]}`);
      }
    }
    
    console.log(`Final URL decision:
    - Original URL: ${url}
    - Backend root: ${backendUrl}
    - Final URL: ${finalUrl}`);
    
    console.log(`Forwarding to backend: ${finalUrl}`);
    
    // Create headers with authorization if present
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Host': 'registry.reviz.dev'
    };
    
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization as string;
    }
    
    // Log what we're doing
    console.log({
      method: req.method,
      url: finalUrl,
      headers: headers,
      bodyLength: req.body ? JSON.stringify(req.body).length : 0
    });
    
    // Log the incoming request body for debugging
    console.log('ASSETS HANDLER - Request body preview:', req.body ? JSON.stringify(req.body).substring(0, 500) : 'no body');
    
    // According to Swagger docs, the API expects multipart/form-data
    console.log('ASSETS HANDLER - Content-Type:', headers['Content-Type']);
    
    // Make the request - using the exact same headers and body as the client sent us
    // This ensures we don't lose authentication or content-type settings
    const response = await fetch(finalUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body ? JSON.stringify(req.body) : undefined
    });
    
    // Get the response body
    const bodyText = await response.text();
    
    // For debugging: Log detailed error information for non-success responses
    if (response.status >= 400) {
      console.error(`ASSETS HANDLER - Backend returned error status: ${response.status}`);
      console.error(`ASSETS HANDLER - Error response body: ${bodyText}`);
      console.error(`ASSETS HANDLER - Request details:`, {
        method: req.method,
        url: finalUrl,
        hasAuth: !!req.headers.authorization,
        bodyLength: req.body ? JSON.stringify(req.body).length : 0,
        bodyPreview: req.body ? JSON.stringify(req.body).substring(0, 200) : 'no body'
      });
    }
    
    // Try to parse as JSON
    let bodyData;
    try {
      bodyData = JSON.parse(bodyText);
      
      // Add more helpful information to 400 errors
      if (response.status === 400) {
        bodyData = {
          ...bodyData,
          _debug: {
            message: "The server returned a 400 Bad Request error. This typically indicates missing required fields or validation errors.",
            possibleSolutions: [
              "Check that all required fields are provided",
              "Verify the data formats match what the backend expects",
              "Try submitting with mock data to see the expected format"
            ],
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (e) {
      // If it's not valid JSON, use the raw text
      bodyData = { 
        text: bodyText,
        error: "Response couldn't be parsed as JSON"
      };
    }
    
    // Return the response
    return res.status(response.status).json(bodyData);
  } catch (error) {
    console.error('ASSETS HANDLER ERROR:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

module.exports = handler;