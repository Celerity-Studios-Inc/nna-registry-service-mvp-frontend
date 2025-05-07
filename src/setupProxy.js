const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://registry.reviz.dev',
      changeOrigin: true,
      pathRewrite: { '^/api': '/api' },
      onProxyRes: function(proxyRes, req, res) {
        // Add CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      },
    })
  );
};