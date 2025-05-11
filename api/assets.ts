import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import getRawBody from 'raw-body';

/**
 * Improved assets endpoint handler for proper FormData handling
 * Special focus on maintaining multipart/form-data structure when proxying
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
  
  try {
    // Hard-code the backend URL
    const backendUrl = 'https://registry.reviz.dev/api/assets';
    console.log('ASSETS HANDLER - Using direct backend URL:', backendUrl);
    
    // For debugging: log all parts of URL
    const url = req.url || '';
    console.log('URL parts analysis:', {
      url: url,
      path: (url || '').split('?')[0],
      parts: (url || '').split('?')[0].split('/').filter(Boolean)
    });
    
    // Determine final URL based on path
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
    
    // Determine content type
    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');
    
    console.log(`Request content type: ${contentType}`);
    console.log(`Is multipart/form-data: ${isMultipart}`);
    
    // Create headers object to forward
    const headers: Record<string, string> = {};
    
    // Copy relevant headers, but be careful to preserve Content-Type exactly as is
    Object.entries(req.headers).forEach(([key, value]) => {
      // Skip host header which will be set by fetch
      if (key.toLowerCase() !== 'host' && typeof value === 'string') {
        headers[key] = value;
      }
    });
    
    // Set a specific Host header for the backend
    headers['host'] = 'registry.reviz.dev';
    
    console.log('Forwarding with headers:', {
      contentType: headers['content-type'],
      contentLength: headers['content-length'],
      authorization: headers['authorization'] ? 'Present' : 'Missing',
    });
    
    let body;
    
    // Handle multipart/form-data specially - we need to forward the raw body
    if (isMultipart && req.method === 'POST') {
      console.log('ASSETS HANDLER - Processing multipart/form-data request');

      try {
        // Get the raw body as a Buffer to preserve binary data
        // This is critical for multipart/form-data with file uploads
        if (!req.body && req.readable) {
          console.log('ASSETS HANDLER - Request is readable, getting raw body');
          body = await getRawBody(req);
          console.log('ASSETS HANDLER - Successfully retrieved raw body from request stream');
        } else {
          console.log('ASSETS HANDLER - Using existing body:', typeof req.body);
          body = req.body;
        }

        // Make sure the Content-Type header is preserved exactly as it came in
        // This is critical for multipart/form-data to work properly
        console.log('ASSETS HANDLER - Using content type:', headers['content-type']);

        // Log CORS headers
        console.log('ASSETS HANDLER - CORS headers:', {
          origin: headers['origin'] || 'not set',
          'access-control-request-method': headers['access-control-request-method'] || 'not set',
          'access-control-request-headers': headers['access-control-request-headers'] || 'not set'
        });

        // Log more details about the FormData
        // Do not log the binary data itself
        if (typeof req.body === 'object' && req.body !== null) {
          console.log('ASSETS HANDLER - FormData summary:', {
            source: req.body.source ? 'Present' : 'Missing',
            layer: req.body.layer ? 'Present' : 'Missing',
            category: req.body.category ? 'Present' : 'Missing',
            subcategory: req.body.subcategory ? 'Present' : 'Missing',
            description: req.body.description ? 'Present' : 'Missing',
            friendlyName: req.body.friendlyName ? 'Present' : 'Missing',
            file: req.body.file ? 'Present' : 'Missing',
            name: req.body.name ? 'Present (should be removed)' : 'Not present (good)',
            contentTypeHeader: headers['content-type']
          });
        }

      } catch (error) {
        console.error('ASSETS HANDLER - Error processing multipart/form-data:', error);
        throw error;
      }
    } else {
      // For JSON requests, ensure the body is properly formatted
      if (req.body) {
        if (typeof req.body === 'string') {
          body = req.body;
        } else {
          body = JSON.stringify(req.body);
        }
      }
    }
    
    console.log('ASSETS HANDLER - Making fetch request to backend');
    
    // Forward the request to the backend
    const response = await fetch(finalUrl, {
      method: req.method,
      headers: headers,
      body: body,
    });
    
    // Get the response body
    const responseBody = await response.text();
    
    // Log response details
    console.log(`ASSETS HANDLER - Backend response: ${response.status} ${response.statusText}`);
    
    // For debugging: Log detailed error information for non-success responses
    if (response.status >= 400) {
      console.error(`ASSETS HANDLER - Backend returned error status: ${response.status}`);
      console.error(`ASSETS HANDLER - Error response body: ${responseBody.substring(0, 1000)}`);
      
      // Add more detailed error logging with highlighted formatting
      console.error(`
====================== ASSET CREATION ERROR ======================
Status: ${response.status} ${response.statusText}
URL: ${finalUrl}
Method: ${req.method}
Content-Type: ${contentType}
Authorization: ${headers['authorization'] ? 'Present' : 'Missing'}
FormData: ${isMultipart ? 'Yes (multipart/form-data)' : 'No'}

Error Response:
${responseBody.substring(0, 1000)}

Request Headers:
${JSON.stringify(headers, null, 2)}
====================== END ERROR DETAILS ======================
`);
    }
    
    // Try to parse response as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseBody);

      // Add more helpful information to errors
      if (response.status === 400) {
        parsedResponse = {
          ...parsedResponse,
          _debug: {
            message: "The server returned a 400 Bad Request error. This typically indicates missing required fields or validation errors.",
            possibleSolutions: [
              "Check that all required fields are provided",
              "Verify the data formats match what the backend expects",
              "Ensure files are properly uploaded",
              "Make sure 'source' field is included and has a valid value",
              "Check that 'name' field is not included (use 'friendlyName' instead)"
            ],
            timestamp: new Date().toISOString()
          }
        };
      } else if (response.status === 500) {
        // Add debug information for Internal Server Errors
        parsedResponse = {
          ...parsedResponse,
          _debug: {
            message: "The server returned a 500 Internal Server Error. This could be due to server-side issues processing the request.",
            possibleSolutions: [
              "Check that authentication token is valid",
              "Verify that the FormData is properly formatted",
              "Examine backend logs for specific error details",
              "Ensure all required fields are correctly named and formatted",
              "Verify file format and size restrictions"
            ],
            requestDetails: {
              hasFile: isMultipart && headers['content-length'] && parseInt(headers['content-length']) > 1000,
              isAuthenticated: !!headers['authorization'],
              method: req.method,
              contentType: contentType
            },
            timestamp: new Date().toISOString()
          }
        };
      }
    } catch (e) {
      // If not valid JSON, return the raw text
      parsedResponse = {
        text: responseBody,
        error: "Response couldn't be parsed as JSON",
        status: response.status,
        message: response.statusText,
        timestamp: new Date().toISOString()
      };
    }
    
    // Copy response headers
    for (const [key, value] of Object.entries(response.headers.raw())) {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    }
    
    // Return the response
    return res.status(response.status).json(parsedResponse);
    
  } catch (error) {
    console.error('ASSETS HANDLER ERROR:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

module.exports = handler;