# Testing Mock Mode Configuration

This document explains how to properly test the fix for the mock API mode issue.

## The Issue

The application was using mock implementation for asset creation even though `.env` has `REACT_APP_USE_MOCK_API=false`. This was causing assets to be created as mock assets instead of real assets in the backend.

## The Fix

The fix adds localStorage override capability to ensure the app respects the mock API setting:

1. Added `apiConfig.useMockApi` in `api.ts`
2. Added localStorage reading with key `forceMockApi`
3. Updated `assetService.ts` to use this configuration
4. Added explicit logging about the asset creation mode

## Testing Steps

To properly test this fix:

1. **Check Current Settings**:
   ```bash
   node scripts/check-mock-mode.js
   ```
   This will show current settings in `.env` file

2. **Override in Browser**:
   - Open your browser's developer console (F12)
   - Set localStorage to force non-mock mode:
   ```javascript
   localStorage.setItem('forceMockApi', 'false');
   ```

3. **Verify Setting**:
   ```javascript
   localStorage.getItem('forceMockApi'); // Should show "false"
   ```

4. **Reload and Test**:
   - Reload the page
   - Look in the console for:
   ```
   Asset creation mode: Real API
   ```
   - Create an asset and verify it's using the real API implementation

## Reverting to Mock Mode (if needed)

If you need to switch back to mock mode for testing:

```javascript
localStorage.setItem('forceMockApi', 'true');
```

Then reload the page and check for "Asset creation mode: Mock".

## Expected Behavior

- When `forceMockApi` is 'false' in localStorage, the app should use the real API implementation
- When `forceMockApi` is 'true' or not set, the app will use the mock implementation based on .env settings

The console should clearly indicate which mode is being used during asset creation.