import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

/**
 * Auth-specific proxy handler for Vercel serverless function
 * This handles proxying auth requests to the backend 
 * 
 * Expected routes:
 * - /api/auth/login -> https://registry.reviz.dev/api/auth/login
 * - /api/auth/register -> https://registry.reviz.dev/api/auth/register
 * - /api/auth/profile -> https://registry.reviz.dev/api/auth/profile
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the auth proxy invocation
  console.log(`AUTH PROXY: ${req.method} request to ${req.url}`);
  
  // Configure CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Extract path and get endpoint from it - this should be /register or /login
  const url = new URL(req.url || '', `https://${req.headers.host || 'localhost'}`);
  const path = url.pathname;
  
  // Log the request details
  console.log('AUTH PROXY - URL details:', {
    original: req.url,
    path: path,
    host: req.headers.host,
    method: req.method
  });
  
  // Extract auth endpoint (like /register or /login)
  let endpoint = '';
  
  console.log('AUTH PROXY - Detailed path analysis:', {
    path,
    indexOf_auth: path.indexOf('/auth'),
    lastIndexOf_auth: path.lastIndexOf('/auth'),
    startsWith_auth: path.startsWith('/auth'),
    includes_auth: path.includes('/auth')
  });
  
  // Handle a variety of path formats
  if (path.startsWith('/auth/')) {
    // Path is in the format /auth/login or /auth/register
    endpoint = path.substring('/auth'.length);
  } else if (path === '/auth') {
    // Just /auth with no trailing slash
    endpoint = '';
  } else if (path.includes('/auth/')) {
    // Handle cases where we might have duplicated paths like /api/auth/login
    // Extract everything after the last occurrence of '/auth'
    const lastAuthIndex = path.lastIndexOf('/auth');
    if (lastAuthIndex >= 0) {
      endpoint = path.substring(lastAuthIndex + '/auth'.length);
    } else {
      endpoint = path;
    }
  } else {
    // Fallback - use the provided path directly
    console.log('AUTH PROXY - Using the whole path as endpoint:', path);
    endpoint = path;
  }
  
  // Log the extracted endpoint for debugging
  console.log('AUTH PROXY - Extracted endpoint:', endpoint);
  
  // Clean up the endpoint to remove any duplicate /api/auth prefixes
  if (endpoint.startsWith('/api/auth')) {
    endpoint = endpoint.substring('/api/auth'.length);
    console.log('AUTH PROXY - Removed duplicate /api/auth prefix from endpoint');
  }
  
  // Construct the target URL - use environment-aware backend URL
  const getBackendUrl = () => {
    const environment = process.env.REACT_APP_ENVIRONMENT || process.env.VERCEL_ENV;
    const frontendUrl = req.headers.host || '';
    
    // Check if we're in staging environment
    if (environment === 'staging' || frontendUrl.includes('stg')) {
      return process.env.REACT_APP_BACKEND_URL || 'https://registry.stg.reviz.dev';
    }
    
    return process.env.REACT_APP_BACKEND_URL || 'https://registry.reviz.dev';
  };
  
  const backendUrl = getBackendUrl();
  const targetUrl = `${backendUrl}/api/auth${endpoint}`;
  
  console.log('AUTH PROXY - Target URL constructed:', targetUrl);
  
  // Log request body for debugging
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    console.log('AUTH PROXY - Request body:', JSON.stringify(req.body));
  }
  
  console.log(`AUTH PROXY - Forwarding ${req.method} request to: ${targetUrl}`);
  
  try {
    // Prepare request body for non-GET requests
    const body = req.body ? JSON.stringify(req.body) : undefined;
    
    // Create a clean headers object to forward
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Host': 'registry.reviz.dev', // Set correct host header
    };
    
    // Copy important headers from the original request
    const headersToCopy = ['authorization', 'user-agent', 'referer', 'cookie'];
    for (const header of headersToCopy) {
      if (req.headers[header]) {
        headers[header] = req.headers[header] as string;
      }
    }
    
    console.log('AUTH PROXY - Forwarding with headers:', headers);
    
    // Forward the request to the backend
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
    });
    
    console.log(`AUTH PROXY - Backend response: ${response.status} ${response.statusText}`);
    
    // Get response body
    const responseText = await response.text();
    console.log(`AUTH PROXY - Response preview: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    
    // Set headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });
    
    // Always ensure CORS headers are set
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
    
    // Return the response
    if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
      try {
        const data = JSON.parse(responseText);
        res.status(response.status).json(data);
      } catch (e) {
        res.status(response.status).send(responseText);
      }
    } else {
      res.status(response.status).send(responseText);
    }
  } catch (error) {
    console.error('AUTH PROXY - Error:', error);
    res.status(500).json({
      error: 'Auth Proxy Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      path: req.url,
      method: req.method,
      targetUrl
    });
  }
}

// Export the handler
module.exports = handler;