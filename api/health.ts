// Import types only to use in function signature
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Health check endpoint that provides detailed information about the environment
 * and verifies if the API routing is working properly
 */
function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Log useful information for debugging
  console.log(`Health check called with method: ${req.method}`);
  console.log('Request URL:', req.url);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));

  try {
    // Add specific content-type header to help detect if the response is correctly formed
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-API-Response-Type', 'json');
    
    // Return a helpful health check response with more debugging information
    res.status(200).json({
      status: 'ok',
      message: 'API health check endpoint working correctly',
      request: {
        method: req.method,
        path: req.url,
        headers: {
          host: req.headers.host,
          referer: req.headers.referer,
          userAgent: req.headers['user-agent']?.substring(0, 100),
          accept: req.headers.accept
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL,
        isLocal: !process.env.VERCEL,
        apiBaseUrl: process.env.REACT_APP_API_BASE_URL || '/api'
      },
      routing: {
        message: "If you're seeing this JSON response, API routing is configured correctly",
        note: "If you see HTML instead, check your serve.json config or Vercel routes"
      },
      diagnostics: {
        contentType: "application/json",
        responseMarker: "JSON_RESPONSE_MARKER",
        timestamp: new Date().toISOString()
      },
      version: '1.2.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// Export using CommonJS syntax for Vercel
module.exports = handler;