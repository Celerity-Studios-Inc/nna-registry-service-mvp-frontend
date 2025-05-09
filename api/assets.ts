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
    
    // Extract the path part to determine if we need a sub-route
    const pathParts = (req.url || '').split('?')[0].split('/').filter(Boolean);
    
    // Only use the parts after 'assets' if present
    let finalUrl = backendUrl;
    if (pathParts.length > 1) {
      // The first part should be 'assets' since the route is /api/assets/...
      const subPath = pathParts.slice(1).join('/');
      if (subPath) {
        finalUrl = `${backendUrl}/${subPath}`;
      }
    }
    
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
    
    // Make the request
    const response = await fetch(finalUrl, {
      method: req.method,
      headers: headers,
      body: req.body ? JSON.stringify(req.body) : undefined
    });
    
    // Get the response body
    const bodyText = await response.text();
    
    // Try to parse as JSON
    let bodyData;
    try {
      bodyData = JSON.parse(bodyText);
    } catch (e) {
      // If it's not valid JSON, use the raw text
      bodyData = { text: bodyText };
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