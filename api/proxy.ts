import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Log the API proxy invocation for debugging
  console.log(`API Proxy: ${req.method} request to ${req.url}`);
  
  // Extract the path correctly
  const path = req.url || '';
  
  // Remove the '/proxy' part from the path if it exists
  const cleanPath = path.replace('/proxy', '');
  
  // Ensure we have the correct API endpoint format
  const targetUrl = `https://registry.reviz.dev/api${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  
  console.log(`Original URL: ${req.url}`);
  console.log(`Cleaned path: ${cleanPath}`);
  console.log(`Proxying to: ${targetUrl}`);

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

      // Forward the response headers
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'transfer-encoding') {
          res.setHeader(key, value);
        }
      });
      
      // Log the outgoing headers (what we're sending back to the client)
      console.log('Outgoing headers set on response:', res.getHeaders());
    } catch (fetchError) {
      console.error('Fetch error details:', fetchError);
      throw fetchError;  // Re-throw to be handled by outer catch
    }

    // Add CORS headers to the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');

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

export default handler;