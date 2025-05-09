import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Test endpoint to check if the proxy is returning HTML instead of JSON responses
 * This is useful for debugging issues where the server is returning index.html for API requests
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Return diagnostic information
    res.status(200).json({
      success: true,
      message: 'This is a proper JSON response. If you see this, proxying is working correctly.',
      diagnostics: {
        method: req.method,
        url: req.url,
        headers: {
          // Filter out sensitive headers
          userAgent: req.headers['user-agent'],
          contentType: req.headers['content-type'],
          host: req.headers.host,
          referer: req.headers.referer || 'none'
        },
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV
        }
      },
      serverInfo: {
        version: '1.0',
        name: 'test-proxy-html',
        description: 'Test endpoint for proxy HTML debugging'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// Export the handler
module.exports = handler;