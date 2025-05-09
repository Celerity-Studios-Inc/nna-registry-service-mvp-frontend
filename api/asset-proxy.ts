import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * Asset API Proxy handler for Vercel serverless function
 * This handles proxying asset-related API requests to the backend
 * 
 * @param req The Vercel request object
 * @param res The Vercel response object
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the API proxy invocation for debugging
  console.log(`ASSET API Proxy: ${req.method} request to ${req.url}`);
  
  // Extract the path correctly
  const path = req.url || '';
  
  // For debugging - log all parts of the URL and request details
  const url = new URL(req.url || '', `https://${req.headers.host || 'localhost'}`);
  console.log('URL parts:', {
    original: req.url,
    pathname: url.pathname,
    search: url.search,
    host: req.headers.host,
    method: req.method,
    query: Object.fromEntries(url.searchParams.entries())
  });
  
  // Log the request method and headers
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  
  // Set up CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
  
  // Handle CORS preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    res.status(200).end();
    console.log('CORS preflight response sent');
    return;
  }
  
  // Extract the asset-specific endpoint from the URL
  // The URL will be like /api/assets/* or /api/assets?param=value
  console.log('ASSET PROXY - Original path:', path);
  
  // Get endpoint path ensuring we strip any prefixes
  let endpoint = path;
  
  // Check for endpoint query parameter (from vercel.json)
  const queryEndpoint = url.searchParams.get('endpoint');
  if (queryEndpoint) {
    console.log('ASSET PROXY - Using endpoint from query parameter:', queryEndpoint);
    endpoint = '/' + queryEndpoint;
  } else if (endpoint.startsWith('/api/')) {
    // Strip any /api prefix that might be present
    endpoint = endpoint.substring('/api'.length);
    console.log('ASSET PROXY - Removed /api prefix');
  }
  
  // Check if we're dealing with a specific asset route format
  if (endpoint.startsWith('/assets/')) {
    // Format like: /assets/123
    console.log('ASSET PROXY - Using asset detail endpoint:', endpoint);
  } else if (endpoint === '/assets' || endpoint === '/assets/') {
    // Root assets endpoint
    console.log('ASSET PROXY - Using root assets endpoint:', endpoint);
  } else {
    // For any other paths, just use as-is but log for debugging
    console.log('ASSET PROXY - Using custom asset path:', endpoint);
  }
  
  console.log('ASSET PROXY - Final endpoint after processing:', endpoint);
  
  // Define the backend API URL - hardcode it for reliability
  const backendApiUrl = 'https://registry.reviz.dev/api';
  
  // Ensure we have the correct API endpoint format
  const targetUrl = `${backendApiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  console.log(`Proxying asset request to: ${targetUrl}`);
  console.log(`Method: ${req.method}`);
  console.log(`Auth header present: ${!!req.headers.authorization}`);
  
  try {
    // Create headers for backend request
    const headers: HeadersInit = {
      'host': 'registry.reviz.dev',
    };
    
    // Copy over safe headers from the request
    const headerKeys = ['content-type', 'authorization', 'accept', 'user-agent'];
    for (const key of headerKeys) {
      if (req.headers[key]) {
        headers[key] = req.headers[key] as string;
      }
    }
    
    console.log('Request headers to backend:', headers);
    
    // Make the request to the backend API
    console.log('Fetching from backend...');
    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      });
      
      console.log(`Asset API response status: ${response.status} ${response.statusText}`);
      
      // Forward the response headers
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      });
      
      // Always ensure CORS headers are set (already done at the top)
      
      try {
        // Try to parse the response body as JSON
        const responseText = await response.text();
        console.log('Raw response text preview:', 
          responseText.substring(0, 200) + 
          (responseText.length > 200 ? '...' : '')
        );
        
        // Only try to parse as JSON if it looks like JSON
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          const responseData = JSON.parse(responseText);
          console.log('Parsed JSON response preview:', 
            JSON.stringify(responseData).substring(0, 200) + 
            (JSON.stringify(responseData).length > 200 ? '...' : '')
          );
          
          // Send the JSON response back to the client
          res.status(response.status).json(responseData);
        } else {
          // Not JSON, send as plain text
          res.status(response.status).send(responseText);
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        // If parsing failed, send original response text if available
        res.status(response.status).send('Error parsing response from backend');
      }
      
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      throw fetchError;  // Re-throw to be handled by outer catch
    }
  } catch (error) {
    console.error('==== ASSET PROXY ERROR ====');
    console.error('Error details:', error);
    
    // Provide a more detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: errorMessage,
      path: req.url,
      method: req.method,
      target: targetUrl
    });
  }
};

// Export using both module.exports (for Node.js) and export default (for TypeScript)
module.exports = handler;
export default handler;