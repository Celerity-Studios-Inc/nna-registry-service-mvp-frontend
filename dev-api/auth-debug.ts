import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Debug endpoint for auth proxy
 * This helps diagnose how requests are being handled by the auth proxy
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  // Configure CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Extract URL details
  const url = new URL(req.url || '', `https://${req.headers.host || 'localhost'}`);
  const path = url.pathname;
  
  // Expected auth paths that this proxy would handle
  const expectedAuthPaths = [
    '/auth',
    '/auth/',
    '/auth/login',
    '/auth/register',
    '/auth/profile'
  ];
  
  // Generate diagnostic information
  const diagnostic = {
    timestamp: new Date().toISOString(),
    requestInfo: {
      method: req.method,
      url: req.url,
      path: path,
      headers: {
        // Filter headers for security
        authorization: req.headers.authorization ? 'present (redacted)' : 'missing',
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
        host: req.headers.host,
        referer: req.headers.referer || 'none'
      },
      body: req.method !== 'GET' ? 'present (redacted)' : 'no body',
      query: url.search ? url.search : 'none'
    },
    analysis: {
      isAuthPath: expectedAuthPaths.includes(path),
      suggestedTransformation: path.startsWith('/auth/') ? 
        {
          extracted: path.substring('/auth'.length),
          targetUrl: `https://registry.reviz.dev/api/auth${path.substring('/auth'.length)}`
        } : 
        {
          extracted: path,
          targetUrl: `https://registry.reviz.dev/api/auth${path}`
        }
    },
    howToFix: {
      vercelConfig: "Ensure vercel.json has routes for both '/api/auth' and '/api/auth/(.*)' pointing to auth-proxy",
      authProxy: "Check auth-proxy.ts for correct request forwarding and handling",
      frontend: "Verify that frontend API calls use '/auth/login' and '/auth/register' paths (without duplicating /api prefix)"
    }
  };
  
  // Return the diagnostic information
  res.status(200).json({
    status: 'ok',
    message: 'Auth debug endpoint',
    diagnostic
  });
}

// Export the handler
module.exports = handler;