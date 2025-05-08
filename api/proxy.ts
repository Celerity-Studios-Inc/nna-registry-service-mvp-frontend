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
    
    console.log('Request headers:', headers);
    console.log('Request body:', req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : 'No body');
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    
    console.log(`Response status: ${response.status}`);
    console.log('Response headers:', [...response.headers.entries()]);

    // Forward the response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    // Add CORS headers to the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');

    try {
      const data = await response.json();
      console.log('Response body preview:', 
        JSON.stringify(data).substring(0, 200) + 
        (JSON.stringify(data).length > 200 ? '...' : '')
      );
      res.status(response.status).json(data);
      console.log('Response sent to client');
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      // If we can't parse the response as JSON, return the raw text
      const text = await response.text();
      console.log('Raw response text:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
  }
};

export default handler;