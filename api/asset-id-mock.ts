import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Asset ID Mock handler for Vercel serverless function
 * This handles mocking asset details for better UI functioning
 * 
 * @param req The Vercel request object
 * @param res The Vercel response object
 */
async function handler(req: VercelRequest, res: VercelResponse) {
  // Log the request
  console.log(`MOCK ASSET Detail: ${req.method} request for asset ID`);
  
  // Extract the asset ID from the URL
  const url = new URL(req.url || '', `https://${req.headers.host || 'localhost'}`);
  const pathParts = url.pathname.split('/');
  const assetId = pathParts[pathParts.length - 1];

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Create a mock asset with the requested ID
  const mockAsset = {
    _id: assetId,
    id: assetId,
    name: `Asset ${assetId.substring(0, 6)}`,
    friendlyName: `Asset ${assetId.substring(0, 6)}`,
    nnaAddress: `2.001.001.${assetId.substring(0, 3)}`,
    type: 'standard',
    layer: 'S',
    categoryCode: 'POP',
    subcategoryCode: 'DIV',
    category: 'Pop',
    subcategory: 'Diva',
    description: `This is a demonstration asset with various tags including anxiety, sunset, and coachella. This mock asset ensures the UI remains functional.`,
    tags: ['mock', 'demo', 'test', 'anxiety', 'sunset', 'coachella'],
    gcpStorageUrl: 'https://via.placeholder.com/800x600',
    files: [
      {
        id: `file-${Date.now()}-${assetId.substring(0, 6)}`,
        filename: 'mock-asset.png',
        contentType: 'image/png',
        size: 12345,
        url: 'https://via.placeholder.com/800x600',
        uploadedAt: new Date().toISOString(),
        thumbnailUrl: 'https://via.placeholder.com/400x300'
      }
    ],
    metadata: {
      humanFriendlyName: `S.POP.DIV.001`,
      machineFriendlyAddress: `2.001.004.001`,
      hfn: `S.POP.DIV.001`,
      mfa: `2.001.004.001`,
      layerName: 'Stars',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "user@example.com"
  };

  // Wrap in API response format
  const responseData = {
    success: true,
    data: mockAsset
  };

  // Return the mock asset data
  res.status(200).json(responseData);
}

// Export using both module.exports (for Node.js) and export default (for TypeScript)
module.exports = handler;
export default handler;