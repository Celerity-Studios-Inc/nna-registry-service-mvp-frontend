const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  // Add CORS middleware for all requests
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-Requested-With,content-type,Authorization'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle OPTIONS method
    if (req.method === 'OPTIONS') {
      return res.status(204).send();
    }

    next();
  });

  // Proxy API requests
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://registry.reviz.dev',
      changeOrigin: true,
      pathRewrite: { '^/api': '/api' },
      onProxyRes: function (proxyRes) {
        // Add CORS headers to API responses
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] =
          'GET,POST,OPTIONS,PUT,DELETE';
        proxyRes.headers['Access-Control-Allow-Headers'] =
          'X-Requested-With,content-type,Authorization';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
      },
    })
  );

  // Proxy v1 API requests for asset search and registration
  app.use(
    '/v1',
    createProxyMiddleware({
      target: 'https://registry.reviz.dev',
      changeOrigin: true,
      pathRewrite: { '^/v1': '/v1' },
      onProxyRes: function (proxyRes) {
        // Add CORS headers to API responses
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] =
          'GET,POST,OPTIONS,PUT,DELETE';
        proxyRes.headers['Access-Control-Allow-Headers'] =
          'X-Requested-With,content-type,Authorization';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      },
      onError: (err, req, res) => {
        console.error('V1 API Proxy error:', err);
        res.status(500).send('V1 API Proxy error');
      },
    })
  );
};
