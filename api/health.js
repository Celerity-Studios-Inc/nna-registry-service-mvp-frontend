/**
 * Simple health check endpoint that accepts all HTTP methods
 * Use this to verify our proxy is handling HTTP methods correctly
 */
module.exports = function(req, res) {
  console.log(`Health check JS version called with method: ${req.method}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  
  // Return info about the request
  res.status(200).json({
    status: 'ok',
    message: 'API proxy is working (JS version)',
    method: req.method,
    path: req.url,
    body: req.body || null,
    headers: {
      contentType: req.headers['content-type'],
      host: req.headers.host,
      userAgent: req.headers['user-agent'],
    },
    timestamp: new Date().toISOString()
  });
};