import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const targetUrl = `https://registry.reviz.dev${req.url || ''}`;

  // Handle CORS preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
    res.status(200).end();
    return;
  }

  try {
    // Create a clean headers object to avoid TypeScript errors with incompatible headers
    const headers: HeadersInit = {
      'host': 'registry.reviz.dev',
    };
    
    // Copy over safe headers from the request
    const headerKeys = ['content-type', 'authorization', 'accept', 'user-agent'];
    for (const key of headerKeys) {
      if (req.headers[key]) {
        headers[key] = req.headers[key] as string;
      }
    }
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Forward the response headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    // Add CORS headers to the response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;