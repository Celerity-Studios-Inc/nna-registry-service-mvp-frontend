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
      target: 'https://nna-registry-service-5jm4duk5oa-uc.a.run.app',
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
};
