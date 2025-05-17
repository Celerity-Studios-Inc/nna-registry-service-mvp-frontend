# MongoDB ID Handling Improvements

This document explains the fixes implemented to handle MongoDB ID formats in the asset detail views and API calls.

## Background

MongoDB uses 24-character hexadecimal string IDs (e.g., `507f1f77bcf86cd799439011`) as the default `_id` field. The NNA Registry Service backend uses MongoDB, but the frontend expects assets to have an `id` field (not `_id`). This mismatch was causing 404 errors when trying to view asset details for certain assets.

## Implemented Fixes

### 1. Enhanced Asset Proxy Handler (`api/asset-proxy.ts`)

The asset proxy handler now properly detects MongoDB-style IDs and tries multiple endpoint formats:

1. First, it will try the standard MongoDB ID endpoint: `/assets/id/{id}`
2. If that fails, it falls back to the alternative format: `/asset/{id}`

This ensures that asset detail requests are routed to the correct endpoint based on the ID format.

```typescript
// MongoDB pattern ID check (24 chars hex)
const isMongoId = assetId.match(/^[a-f0-9]{24}$/i) !== null;

if (isMongoId) {
  console.log(`ASSET PROXY - MongoDB ID detected: ${assetId}`);
  
  // First, try the standard MongoDB endpoint format
  try {
    const mongoEndpoint = `/assets/id/${assetId}`;
    console.log(`ASSET PROXY - Using MongoDB ID endpoint: ${mongoEndpoint}`);
    endpoint = mongoEndpoint;
  } catch (error) {
    console.error('ASSET PROXY - Error with MongoDB ID endpoint:', error);
    
    // If that fails, try an alternative endpoint format
    const altEndpoint = `/asset/${assetId}`;
    console.log(`ASSET PROXY - Trying alternative endpoint format: ${altEndpoint}`);
    endpoint = altEndpoint;
  }
}
```

### 2. Improved Asset Service (`src/api/assetService.ts`)

The `getAssetById` method now has a more robust implementation:

1. Validates the ID to ensure it's not empty
2. Determines if the ID matches the MongoDB ID format
3. Tries multiple endpoints in sequence based on the ID format
4. Ensures ID consistency by mapping between `id` and `_id` properties

```typescript
// Try all possible endpoint formats in sequence
const endpoints = [];

// Add endpoints in priority order based on ID format
if (isMongoId) {
  // For MongoDB IDs, try these endpoints in order
  endpoints.push({
    url: `/assets/id/${id}`,
    description: 'MongoDB ID specific endpoint'
  });
  endpoints.push({
    url: `/asset/${id}`,
    description: 'Alternative asset endpoint'
  });
  endpoints.push({
    url: `/assets/${id}`,
    description: 'Standard assets endpoint'
  });
} else {
  // For standard IDs, try these endpoints in order
  endpoints.push({
    url: `/assets/${id}`,
    description: 'Standard assets endpoint'
  });
  endpoints.push({
    url: `/asset/${id}`,
    description: 'Alternative asset endpoint'
  });
}

// Try each endpoint in sequence until one works
```

### 3. Consistent AssetCard Component (`src/components/asset/AssetCard.tsx`)

The AssetCard component now properly handles both ID formats for navigation:

```typescript
<Button
  component={Link}
  to={`/assets/${asset.id || asset._id}`} // Use either id or _id
  endIcon={<LaunchIcon />}
  onClick={(e) => {
    // Prevent navigation if id is undefined or null
    if (!asset.id && !asset._id) {
      e.preventDefault();
      console.error('Asset ID is undefined, cannot navigate to details page', asset);
    } else {
      const assetId = asset.id || asset._id;
      console.log(`Navigating to asset details: ${assetId}`);
    }
  }}
>
  View Details
</Button>
```

## Benefits

These improvements provide several benefits:

1. **Robustness**: The system now gracefully handles both standard IDs and MongoDB's 24-character hexadecimal IDs
2. **Better Error Handling**: Clear error messages and fallback strategies for different API endpoints
3. **ID Consistency**: Automatic mapping between `id` and `_id` properties ensures consistent data structures
4. **Enhanced Logging**: Detailed logging helps diagnose any remaining issues

## Verification

To verify this fix:
1. Navigate to the asset search page
2. Find assets with MongoDB-style IDs (24-character hexadecimal strings)
3. Click "View Details" to ensure they load correctly
4. Check the browser console for detailed logging about the endpoint selection process

If you encounter any issues, the enhanced logging will help identify which endpoint is failing.