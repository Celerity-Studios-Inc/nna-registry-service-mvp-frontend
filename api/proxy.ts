import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * API Proxy handler for Vercel serverless function
 * This handles proxying API requests to the backend while dealing with CORS
 * 
 * @param req The Vercel request object
 * @param res The Vercel response object
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the API proxy invocation for debugging
  console.log(`API Proxy: ${req.method} request to ${req.url}`);
  
  // Extract the path correctly
  const path = req.url || '';
  
  // For debugging - log all parts of the URL and request details
  const url = new URL(req.url || '', `https://${req.headers.host || 'localhost'}`);
  console.log('URL parts:', {
    original: req.url,
    pathname: url.pathname,
    search: url.search,
    host: req.headers.host,
    method: req.method
  });
  
  // Log the request method and headers
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  
  // Fix to handle /api/proxy/:path* pattern correctly
  let cleanPath = path;
  if (cleanPath.startsWith('/proxy/')) {
    cleanPath = cleanPath.substring('/proxy'.length); // Remove /proxy prefix
  } else if (cleanPath === '/proxy' || cleanPath === '/proxy/') {
    cleanPath = '/'; // Root API path
  } else {
    // Keep as is - this is for direct access via /api/<path>
  }
  
  // Log the path transformation for debugging
  console.log(`Path transformation: ${path} → ${cleanPath}`);
  
  // Special handling for our health endpoint - don't proxy this, respond directly
  // NOTE: This is a fallback in case the health.ts module fails to load - we should handle
  // health checks in both places for reliability
  if (cleanPath === '/health' || cleanPath === '/health/') {
    console.log('Health check endpoint hit in proxy.ts - responding directly');
    res.status(200).json({
      status: 'ok',
      message: 'API proxy is working (direct from proxy handler)',
      timestamp: new Date().toISOString(),
      proxy: {
        version: '1.0',
        path: cleanPath,
        method: req.method,
        url: req.url,
        cleanPath: cleanPath,
        headers: {
          authorization: !!req.headers.authorization ? 'present (redacted)' : 'missing',
          host: req.headers.host,
          referer: req.headers.referer || 'none'
        }
      }
    });
    return;
  }
  
  // Define the backend API URL - hardcode it for reliability
  const backendApiUrl = 'https://registry.reviz.dev/api';
  
  // Ensure we have the correct API endpoint format
  const targetUrl = `${backendApiUrl}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  
  // Check proxy configuration
  console.log(`Proxy Configuration:`);
  console.log(`Original URL: ${req.url}`);
  console.log(`Cleaned path: ${cleanPath}`);
  console.log(`Backend API URL: ${backendApiUrl}`);
  console.log(`Proxying to: ${targetUrl}`);
  console.log(`Method: ${req.method}`);
  console.log(`Client IP: ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
  console.log(`Auth header present: ${!!req.headers.authorization}`);
  
  // For development/debugging - if no auth header is present and this isn't a preflight request,
  // we could add a test token. This would only be for testing!
  // if (!req.headers.authorization && req.method !== 'OPTIONS') {
  //   console.log('No auth header present, adding test token for development');
  //   req.headers.authorization = 'Bearer test-token-for-development';
  // }

  // Handle CORS preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
    res.status(200).end();
    console.log('CORS preflight response sent');
    return;
  }

  try {
    // Create a clean headers object to avoid TypeScript errors with incompatible headers
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
    
    console.log('=== PROXY REQUEST DETAILS ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', targetUrl);
    console.log('Request headers:', headers);
    
    // Log request body for debugging, but be careful with sensitive data
    const requestBody = req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : 'No body';
    console.log('Request body:', requestBody);
    
    // Make the request to the backend API
    console.log('Fetching from backend...');
    try {
      const response = await fetch(targetUrl, {
        method: req.method,
        headers: headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      });
      
      console.log('=== PROXY RESPONSE DETAILS ===');
      console.log(`Response status: ${response.status} ${response.statusText}`);
      console.log('Response headers:', [...response.headers.entries()]);

      // Special handling for authentication errors
      if (response.status === 401) {
        console.log('Authentication error from backend - missing or invalid token. This is expected for unauthenticated requests.');
        console.log('Request authorization header:', req.headers.authorization ? 'Present (not shown for security)' : 'Missing');
      }
      
      // Add specific diagnostic for common backend responses
      if (response.status === 404) {
        console.log('404 Not Found - Endpoint does not exist in backend API');
      } else if (response.status === 403) {
        console.log('403 Forbidden - Endpoint exists but access is denied (may need different permissions)');
      } else if (response.status >= 500) {
        console.error('Server error from backend - backend API returned an error');
      } else if (response.status >= 200 && response.status < 300) {
        console.log('✅ Backend returned success response');
      }

      // Forward the response headers
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      });
      
      // Always ensure CORS headers are set
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
      
      // Log the outgoing headers (what we're sending back to the client)
      console.log('Outgoing headers set on response:', res.getHeaders());
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      throw fetchError;  // Re-throw to be handled by outer catch
    }

    // CORS headers already set above

    try {
      // Try to parse the response body as JSON
      let responseText, responseData;
      try {
        responseText = await response.text();
        console.log('Raw response text preview:', 
          responseText.substring(0, 200) + 
          (responseText.length > 200 ? '...' : '')
        );
        
        // Only try to parse as JSON if it looks like JSON
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          responseData = JSON.parse(responseText);
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
        // If we already have the text but JSON parsing failed, send the text
        if (responseText) {
          res.status(response.status).send(responseText);
        } else {
          // Last resort, send a generic error
          res.status(response.status).send('Error parsing response from backend');
        }
      }
      
      console.log('Response sent to client with status:', response.status);
    } catch (responseError) {
      console.error('Error handling response:', responseError);
      res.status(500).send('Error handling backend response');
    }
  } catch (error) {
    console.error('==== PROXY ERROR ====');
    console.error('Error details:', error);
    
    // Provide a more detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined;
    
    console.error('Sending error response to client:', errorMessage);
    
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: errorMessage,
      stack: errorStack,
      path: req.url,
      method: req.method,
      target: targetUrl
    });
  }
};

// Export using both module.exports (for Node.js) and export default (for TypeScript)
module.exports = handler;
export default handler;