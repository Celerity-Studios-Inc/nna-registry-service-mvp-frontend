import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Simple test endpoint that just returns a status message
 * Use this to verify if we can reach the assets endpoint pattern
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

  // Return a diagnostic response with request information
  res.status(200).json({
    status: 'success',
    message: 'Assets test endpoint reached successfully',
    request: {
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        accept: req.headers.accept,
        userAgent: req.headers['user-agent']?.substring(0, 100),
        authorization: req.headers.authorization ? 'present (redacted)' : 'not present'
      }
    },
    timestamp: new Date().toISOString()
  });
}

module.exports = handler;