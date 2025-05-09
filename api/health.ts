// Import types only to use in function signature
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the handler function
function handler(req: VercelRequest, res: VercelResponse) {
  // Log useful information for debugging
  console.log(`Health check called with method: ${req.method}`);
  console.log('Request URL:', req.url);
  console.log('Request headers:', req.headers);
  
  // Return a helpful health check response
  res.status(200).json({
    status: 'ok',
    message: 'API health check endpoint working correctly',
    request: {
      method: req.method,
      path: req.url,
      headers: {
        host: req.headers.host,
        referer: req.headers.referer,
        userAgent: req.headers['user-agent'],
      }
    },
    version: '1.1.0',
    timestamp: new Date().toISOString()
  });
}

// Export using CommonJS syntax for Vercel
module.exports = handler;