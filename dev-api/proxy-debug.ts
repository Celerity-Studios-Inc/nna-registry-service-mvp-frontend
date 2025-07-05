import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * API endpoint that provides detailed information about how the proxy is configured
 * This can help debug API connection issues
 */
function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Get backend API URL from environment
  const backendApiUrl = process.env.BACKEND_API_URL || 'https://registry.reviz.dev/api';
  
  // Collect proxy configuration information
  const proxyInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      VERCEL_ENV: process.env.VERCEL_ENV || 'unknown',
      VERCEL_URL: process.env.VERCEL_URL || 'unknown',
      VERCEL_REGION: process.env.VERCEL_REGION || 'unknown'
    },
    apiConfig: {
      backendApiUrl,
      reactAppApiUrl: process.env.REACT_APP_API_URL || '/api',
      useMockApi: process.env.REACT_APP_USE_MOCK_API === 'true'
    },
    request: {
      url: req.url,
      method: req.method,
      headers: {
        host: req.headers.host,
        referer: req.headers.referer || 'none',
        userAgent: req.headers['user-agent']
      }
    },
    proxyRoutes: {
      '/api/health': 'Local health endpoint (doesn\'t proxy to backend)',
      '/api/test-real-backend': 'Tests connectivity to the real backend',
      '/api/test-backend': 'Combined backend diagnostics',
      '/api/backend-url': 'Returns backend URL configuration',
      '/api/proxy-debug': 'This endpoint (proxy configuration info)',
      '/api/{path}': `Proxied to ${backendApiUrl}/{path}`
    },
    howToConnect: {
      backendUrl: backendApiUrl,
      loginEndpoint: `${backendApiUrl}/auth/login`,
      assetsEndpoint: `${backendApiUrl}/assets`,
      docsEndpoint: `${backendApiUrl}/docs`
    },
    recommendations: [
      "To use the real backend API, you need valid credentials",
      "If you don't have credentials, you can use mock mode by enabling the toggle on the Dashboard",
      "API requests are correctly proxied, but the backend requires authentication"
    ]
  };
  
  // Send the proxy information
  res.status(200).json(proxyInfo);
}

// Export using CommonJS syntax for Vercel
module.exports = handler;