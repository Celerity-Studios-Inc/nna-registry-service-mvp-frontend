// api/proxy.js - Serverless function to proxy requests to the backend API
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create proxy instance outside of handler to reuse
const apiProxy = createProxyMiddleware({
  target: 'https://registry.reviz.dev',
  changeOrigin: true,
  pathRewrite: {
    '^/api/': '/api/'  // keep the /api prefix
  },
  onProxyRes: function(proxyRes, req, res) {
    // Add CORS headers to the proxied response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
});

// Export the request handler function
module.exports = (req, res) => {
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  
  // Forward the request to the target API
  return apiProxy(req, res);
};