import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const targetUrl = `https://registry.reviz.dev${req.url?.replace(/^\/api\/proxy/, '') || ''}`;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
    res.status(200).end();
    return;
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        host: 'registry.reviz.dev',
      } as HeadersInit,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler; 