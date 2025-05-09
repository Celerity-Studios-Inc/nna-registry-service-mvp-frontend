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
    
    // Extract and prepare headers from the original request
    // We need to be careful not to overwrite critical headers like Content-Type
    const headers: { [key: string]: string } = {
      'Accept': 'application/json',
      'Host': 'registry.reviz.dev'
    };
    
    // Copy all relevant headers from the original request
    // But be careful to preserve the original Content-Type which is critical for FormData
    const requestHeaders: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        requestHeaders[key] = value;
      }
    }
    
    // Only set the Authorization header if it exists in the original request
    if (req.headers.authorization) {
      requestHeaders['Authorization'] = req.headers.authorization as string;
    }
    
    // Determine if this is a FormData (multipart/form-data) request
    const contentType = req.headers['content-type'] || '';
    const isFormData = contentType.includes('multipart/form-data');
    
    // Get the raw body type for debugging
    const bodyType = req.body ? typeof req.body : 'undefined';
    const isBufferOrStream = bodyType === 'object' && (
      req.body instanceof Buffer || 
      req.body.constructor.name === 'ReadableStream' ||
      req.body.constructor.name === 'IncomingMessage'
    );
    
    // Log what we're doing
    console.log({
      method: req.method,
      url: finalUrl,
      contentType: contentType,
      isFormData: isFormData,
      bodyType: bodyType,
      isBufferOrStream: isBufferOrStream,
      bodyPresent: !!req.body,
      headersProvided: Object.keys(requestHeaders).length
    });
    
    if (isFormData) {
      console.log('ASSETS HANDLER - Detected FormData request with multipart/form-data');
      
      // More detailed logging about the request body for FormData
      if (bodyType === 'string') {
        console.log('ASSETS HANDLER - FormData received as string. Preview:', req.body.substring(0, 200));
      } else if (isBufferOrStream) {
        console.log('ASSETS HANDLER - FormData received as buffer or stream, which is correct format');
      } else if (bodyType === 'object') {
        console.log('ASSETS HANDLER - FormData received as object, which may need special handling');
        console.log('Object constructor:', req.body.constructor ? req.body.constructor.name : 'unknown');
      } else {
        console.log('ASSETS HANDLER - Unexpected FormData format:', bodyType);
      }
    } else {
      // Only for non-FormData requests, log the body preview
      console.log('ASSETS HANDLER - Request body preview:', 
        req.body ? (typeof req.body === 'string' ? req.body.substring(0, 200) : JSON.stringify(req.body).substring(0, 200)) : 'no body');
    }
    
    // Make the request to backend with proper handling of different content types
    // We need special handling for FormData vs. JSON
    let requestOptions: any = {
      method: req.method,
      headers: requestHeaders
    };
    
    // For FormData, we must pass the raw body without modification
    // For regular JSON requests, we need to stringify the body
    if (isFormData) {
      // For FormData, pass the raw body without JSON.stringify
      // This is CRITICAL for multipart/form-data to work correctly
      requestOptions.body = req.body;
      
      // For multipart/form-data requests, we need to make sure we don't override the content-type header
      // The content-type header must include the boundary which is automatically generated
      if (contentType.includes('multipart/form-data')) {
        // Remove content-type if present, to ensure boundary is preserved
        if (requestHeaders['content-type']) {
          console.log('ASSETS HANDLER - Preserving original multipart/form-data content-type with boundary');
          // Keep the original content-type with boundary
        } else {
          console.warn('ASSETS HANDLER - FormData without proper content-type header. This may cause issues.');
        }
      }
      
      console.log('ASSETS HANDLER - Forwarding FormData with original Content-Type:', requestHeaders['content-type'] || contentType);
    } else {
      // For JSON and other formats, stringify the body if needed
      if (req.body) {
        requestOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }
      console.log('ASSETS HANDLER - Forwarding JSON data with Content-Type:', contentType);
    }
    
    console.log('Final request options:', {
      method: requestOptions.method,
      url: finalUrl,
      headersCount: Object.keys(requestOptions.headers).length,
      bodyPresent: !!requestOptions.body
    });
    
    // Make the actual request to the backend
    const response = await fetch(finalUrl, requestOptions);
    
    // Get the response body
    const bodyText = await response.text();
    
    // For debugging: Log detailed error information for non-success responses
    if (response.status >= 400) {
      console.error(`ASSETS HANDLER - Backend returned error status: ${response.status}`);
      console.error(`ASSETS HANDLER - Error response body: ${bodyText}`);
      
      // Add more detailed error logging with highlighted formatting
      console.error(`
====================== ASSET CREATION ERROR ======================
Status: ${response.status} ${response.statusText}
URL: ${finalUrl}
Method: ${req.method}
Content-Type: ${req.headers['content-type'] || 'not specified'}
Authorization: ${req.headers.authorization ? 'Present' : 'Missing'}
FormData: ${isFormData ? 'Yes (multipart/form-data)' : 'No'}

Error Response:
${bodyText}

Request Headers:
${JSON.stringify(requestHeaders, null, 2)}

Request Details:
- Body Type: ${bodyType}
- Is Buffer/Stream: ${isBufferOrStream}
- Body Present: ${!!req.body}
====================== END ERROR DETAILS ======================
`);
      
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