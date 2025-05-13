import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * API endpoint that returns the current backend URL configuration
 * This allows the frontend to dynamically determine where the backend is located
 * without hardcoding it in multiple places
 */
function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers to allow frontend to fetch this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Get backend URL from environment variable, or use default
  const backendApiUrl = process.env.BACKEND_API_URL || 'https://registry.reviz.dev/api';
  
  // Return the configuration
  res.status(200).json({
    backendUrl: backendApiUrl,
    mockEnabled: process.env.REACT_APP_USE_MOCK_API === 'true',
    version: '1.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
}

// Export using CommonJS syntax for Vercel
module.exports = handler;