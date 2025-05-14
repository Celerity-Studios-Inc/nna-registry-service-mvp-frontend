# Asset Detail View Fix

## Issue
When clicking on "View Details" for an asset, the app would display a 404 error. This was happening because the backend API uses MongoDB IDs (24 character hexadecimal strings), and the frontend was not properly handling this ID format when making requests to the API.

## Solution
1. Updated `api/asset-proxy.ts` to properly rewrite MongoDB ID routes
2. Enhanced `assetService.getAssetById()` method to handle both regular and MongoDB ID formats
3. Updated `AssetCard.tsx` to better detect and handle MongoDB ID formats

## Technical Details

### MongoDB ID Route Rewriting
In `asset-proxy.ts`, we've implemented a pattern detection for MongoDB IDs (24 character hexadecimal string) and rewrite the endpoint from `/assets/{id}` to `/assets/id/{id}` which is what the backend expects for MongoDB IDs.

```typescript
// Special handling for MongoDB ID access
if (endpoint.match(/\/assets\/[a-f0-9]{24}$/i)) {
  // This looks like a MongoDB ID - rewrite to the alternative format
  const assetId = endpoint.split('/').pop();
  console.log(`ASSET PROXY - MongoDB ID detected: ${assetId}`);

  // CRITICAL FIX: Rewrite the endpoint to the format the backend expects
  // Some backends expect /assets/id/<mongodb-id> format
  const newEndpoint = `/assets/id/${assetId}`;
  console.log(`ASSET PROXY - Rewriting MongoDB ID path from ${endpoint} to ${newEndpoint}`);
  endpoint = newEndpoint;
}
```

### Enhanced Asset Service 
The `getAssetById()` method in `assetService.ts` now has improved logic to handle both ID formats:

1. Detect if an ID is in MongoDB format (24 character hexadecimal string)
2. Try the appropriate endpoint first based on ID format
3. Fall back to the alternative endpoint if the first attempt fails
4. Better error handling and logging
5. Improved mock implementation to simulate both ID formats

### Asset Card Component
Updated the `AssetCard` component to detect MongoDB IDs and provide more detailed logging when navigating to asset details.

## Testing
To test this fix:
1. Navigate to the asset search page
2. Search for any assets (try "Coachella" or similar term)
3. Click "View Details" on any asset card
4. The asset detail page should load successfully, even for assets with MongoDB IDs

## Notes
- This fix maintains backward compatibility with both ID formats
- Added extensive logging to help diagnose any future issues
- The mock implementation now provides more realistic asset data
EOF < /dev/null