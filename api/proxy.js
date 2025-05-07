// api/proxy.js - Serverless function to proxy requests to the backend API
const { createProxyMiddleware } = require('http-proxy-middleware');

// Export the request handler function
module.exports = async (req, res) => {
  // Handle OPTIONS requests for CORS preflight explicitly
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(204).end();
  }

  // For Vercel serverless functions, we need to manually handle the proxy
  try {
    // First, extract the path from the request
    const targetPath = req.url.replace(/^\/api/, '/api');
    const targetUrl = `https://registry.reviz.dev${targetPath}`;
    
    console.log(`Proxying ${req.method} request to: ${targetUrl}`);
    
    // Build the request options
    const fetchOptions = {
      method: req.method,
      headers: {
        ...req.headers,
        host: 'registry.reviz.dev',
      },
    };
    
    // Copy body for POST, PUT, PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      // Get the raw body
      const bodyChunks = [];
      for await (const chunk of req) {
        bodyChunks.push(chunk);
      }
      const body = Buffer.concat(bodyChunks).toString();
      
      if (body) {
        fetchOptions.body = body;
        // Make sure we have the right content type
        fetchOptions.headers['content-type'] = req.headers['content-type'] || 'application/json';
      }
    }
    
    // Remove problematic headers
    delete fetchOptions.headers['host'];
    delete fetchOptions.headers['connection'];
    
    // Make the fetch request to the target API
    const response = await fetch(targetUrl, fetchOptions);
    
    // Get the response status and headers
    const statusCode = response.status;
    const headers = Object.fromEntries(response.headers.entries());
    
    // Add CORS headers to the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Copy all other response headers
    Object.entries(headers).forEach(([key, value]) => {
      // Skip setting content-length as it will be set automatically
      if (key.toLowerCase() !== 'content-length') {
        res.setHeader(key, value);
      }
    });
    
    // Set the status code
    res.status(statusCode);
    
    // Send the response body
    const responseData = await response.arrayBuffer();
    res.end(Buffer.from(responseData));
    
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy Error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};