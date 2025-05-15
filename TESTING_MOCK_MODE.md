# Testing with Mock Mode

This document explains how to use the Mock Mode feature to test the Browse Assets functionality with pagination.

## Background

The connection to the backend API is currently resulting in 500 errors when attempting to fetch assets. To facilitate testing and development of the frontend, we've implemented a Mock Mode that provides realistic test data with full pagination support.

## How to Enable Mock Mode

You can enable Mock Mode in any of the following ways:

1. **URL Parameter**: Add `?mock=true` to the URL
   ```
   https://nna-registry-service-mvp-frontend.vercel.app/search-assets?mock=true
   ```

2. **UI Toggle**: Click the "Enable Mock Mode" button in the Browse Assets page

3. **LocalStorage**: Set the following value in browser's LocalStorage:
   ```javascript
   localStorage.setItem('useMockFallback', 'true');
   ```

## Features of Mock Mode

When Mock Mode is enabled:

1. **Mock Data Generation**: 100 mock assets with realistic data are generated
2. **Search Support**: You can search by keyword (e.g., "sunset")
3. **Taxonomy Filtering**: Layer, Category, and Subcategory filters work
4. **Full Pagination**: Navigate between pages and change items per page
5. **Visual Indicator**: A "MOCK MODE" chip appears in the UI to indicate you're using mock data

## Implementation Details

The Mock Mode implementation includes:

1. **Mock Service**: A dedicated mock implementation in `assetService.mock.ts`
2. **Dynamic Loading**: The mock service is only loaded when needed (lazy loading)
3. **UI Indicator**: Clear visibility of when mock mode is active
4. **Toggle Control**: Easy switching between real and mock data
5. **Consistent API**: The mock service implements the same interface as the real service

## Testing Steps

To properly test the pagination with mock data:

1. **Enable Mock Mode** using one of the methods above

2. **Browse Assets**:
   - Navigate to the Browse Assets page
   - Verify you see the "MOCK MODE" indicator
   - Check that mock assets are displayed

3. **Test Pagination**:
   - Navigate between pages using the pagination controls
   - Change items per page (12, 24, 48, 96)
   - Verify correct number of items are shown
   - Verify pagination info ("Showing X-Y of Z") is accurate

4. **Test Search**:
   - Search for "sunset" (several mock items have this tag)
   - Verify search results are paginated correctly
   - Verify filtering by taxonomy works with pagination

## API Configuration

The current backend settings in the environment:

1. In `.env.production`: `REACT_APP_USE_MOCK_API=false`
2. In `vercel.json`: Backend API URL is set to `https://registry.reviz.dev/api`
3. In `api/backend-url.ts`: Points to the production backend

The Mock Mode implementation works as an override on top of these settings.

## Troubleshooting

If you encounter issues with Mock Mode:

1. Check the browser console for any errors
2. Verify that the `useMockFallback` value is set correctly in localStorage
3. Try clearing your browser cache and reloading
4. If all else fails, use the URL parameter method (`?mock=true`)

## Next Steps

While Mock Mode allows testing of the frontend functionality, the following steps should be taken to resolve the backend issues:

1. Investigate the 500 errors coming from the backend API
2. Verify the API endpoint configuration in the serverless functions
3. Ensure authentication is properly configured for asset retrieval
4. Update the API endpoints to match the expected backend formats

Refer to `BACKEND_API_FIX.md` for a detailed analysis of the backend API issues and proposed solutions.