import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Test endpoint to help debug local serving environment when using `serve -s build`
 * This provides detailed diagnostic information about the request and routing
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
    // Extract important information for debugging
    const parsedUrl = new URL(
      req.url || '', 
      `http://${req.headers.host || 'localhost'}`
    );
    
    // Return detailed diagnostic information
    res.status(200).json({
      success: true,
      message: 'Local diagnostic endpoint is working correctly',
      diagnostics: {
        request: {
          method: req.method,
          url: req.url,
          path: parsedUrl.pathname,
          query: Object.fromEntries(parsedUrl.searchParams.entries()),
          headers: {
            // Filter out sensitive headers
            userAgent: req.headers['user-agent'],
            contentType: req.headers['content-type'],
            host: req.headers.host,
            referer: req.headers.referer || 'none',
            accept: req.headers.accept
          },
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          reactAppEnv: process.env.REACT_APP_ENV,
          reactAppApiUrl: process.env.REACT_APP_API_URL,
          reactAppBackendUrl: process.env.REACT_APP_BACKEND_URL,
          isVercel: !!process.env.VERCEL
        },
        serverInfo: {
          timestamp: new Date().toISOString(),
          version: '1.0',
          type: 'serve-local diagnostic endpoint',
          baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}`
        },
        routing: {
          expectedApiEndpoint: '/api',
          expectedAuthEndpoint: '/api/auth',
          expectedIndexFile: '/index.html',
          note: "If routing is working correctly, requests to /api/* should hit API handlers, not return index.html"
        }
      },
      usage: {
        endpoints: [
          {
            path: "/api/serve-local",
            description: "This endpoint - provides diagnostics for local environment"
          },
          {
            path: "/api/test-proxy-html",
            description: "Test if API endpoints are returning proper JSON (not HTML)"
          },
          {
            path: "/api/health",
            description: "Basic health check endpoint"
          }
        ],
        tips: [
          "When using serve -s build, you must use the --config serve.json option",
          "The serve.json file should have proper rewrites for /api/* paths",
          "Test API routing by comparing responses from /api/* endpoints (should be JSON) vs / (should be HTML)"
        ]
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