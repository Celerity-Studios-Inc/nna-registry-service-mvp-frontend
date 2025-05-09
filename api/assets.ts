import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * DIRECT ASSETS API HANDLER
 * This is a specialized proxy ONLY for /api/assets routes
 * 
 * @param req The Vercel request object
 * @param res The Vercel response object
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the API proxy invocation for debugging
  console.log(`🔷 ASSETS API DIRECT HANDLER: ${req.method} request to ${req.url}`);
  
  // Extract the path correctly
  const path = req.url || '';
  
  // For debugging - log all parts of the URL and request details
  const url = new URL(req.url || '', `https://${req.headers.host || 'localhost'}`);
  console.log('🔷 ASSETS HANDLER - URL parts:', {
    original: req.url,
    pathname: url.pathname,
    search: url.search,
    host: req.headers.host,
    method: req.method,
    query: Object.fromEntries(url.searchParams.entries())
  });
  
  // Log the request method and headers
  console.log('🔷 ASSETS HANDLER - Request method:', req.method);
  console.log('🔷 ASSETS HANDLER - Request headers:', req.headers);
  
  // This handler ONLY deals with assets routes - hard-code it
  // It will either be the root /assets endpoint or a specific asset
  let cleanPath = '/assets';
  
  // If we have a specific asset ID or route, extract it from path
  const pathParts = path.split('/');
  if (pathParts.length > 2) {
    // Extract asset ID or sub-path (everything after /assets/)
    cleanPath = '/assets/' + pathParts.slice(2).join('/');
  }
  
  // Log the final assets endpoint for debugging
  console.log('🔷 ASSETS HANDLER - Using assets endpoint:', cleanPath);
  
  // Set up CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
  
  // Handle CORS preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    console.log('🔷 ASSETS HANDLER - Handling CORS preflight request');
    res.status(200).end();
    console.log('🔷 ASSETS HANDLER - CORS preflight response sent');
    return;
  }

  // Define the backend API URL - hardcode it for reliability
  const backendApiUrl = 'https://registry.reviz.dev/api';
  
  // Ensure we have the correct API endpoint format
  const targetUrl = `${backendApiUrl}${cleanPath}`;
  
  // Check proxy configuration
  console.log(`🔷 ASSETS HANDLER - Proxy Configuration:`);
  console.log(`Original URL: ${req.url}`);
  console.log(`Cleaned path: ${cleanPath}`);
  console.log(`Backend API URL: ${backendApiUrl}`);
  console.log(`Proxying to: ${targetUrl}`);
  console.log(`Method: ${req.method}`);
  console.log(`Client IP: ${req.headers['x-forwarded-for'] || 'unknown'}`);
  console.log(`Auth header present: ${!!req.headers.authorization}`);

  try {
    // Create headers for backend request
    const headers: HeadersInit = {
      'host': 'registry.reviz.dev',
      'x-forwarded-from': 'assets-direct-handler'
    };
    
    // Copy over safe headers from the request
    const headerKeys = ['content-type', 'authorization', 'accept', 'user-agent'];
    for (const key of headerKeys) {
      if (req.headers[key]) {
        headers[key] = req.headers[key] as string;
      }
    }
    
    console.log('🔷 ASSETS HANDLER - Request headers to backend:', headers);
    
    // Make the request to the backend API
    console.log('🔷 ASSETS HANDLER - Fetching from backend...');
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    console.log(`🔷 ASSETS HANDLER - Response status: ${response.status} ${response.statusText}`);
    
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
      console.log('🔷 ASSETS HANDLER - Raw response text preview:', 
        responseText.substring(0, 200) + 
        (responseText.length > 200 ? '...' : '')
      );
      
      // Only try to parse as JSON if it looks like JSON
      if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
        const responseData = JSON.parse(responseText);
        console.log('🔷 ASSETS HANDLER - Parsed JSON response preview:', 
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
      console.error('🔷 ASSETS HANDLER - Error parsing response:', parseError);
      // If parsing failed, send original response text if available
      res.status(response.status).send('Error parsing response from backend');
    }
    
  } catch (error) {
    console.error('🔷 ASSETS HANDLER - ERROR DETAILS:', error);
    
    // Provide a more detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).json({ 
      error: 'Internal Server Error in assets handler', 
      message: errorMessage,
      path: req.url,
      method: req.method,
      target: targetUrl
    });
  }
}

// Export using both module.exports (for Node.js) and export default (for TypeScript)
module.exports = handler;
export default handler;