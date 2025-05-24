# NNA Registry Service Verification Guide

This guide provides step-by-step instructions for verifying that core functionality works correctly in the production environment.

## Prerequisites

1. Access to the production site at [nna-registry-service-mvp-frontend.vercel.app](https://nna-registry-service-mvp-frontend.vercel.app)
2. A test account (create one if you don't have it)
3. Sample test files for upload (preferably small images)

## Recent Fixes to Verify (2025-05-13)

1. **Backend URL Update**: The frontend should now connect to the production backend at registry.reviz.dev/api
2. **Subcategory Normalization Fix**: The backend should now preserve selected subcategories instead of normalizing to "Base"
3. **Sequential Numbering Fix**: NNA addresses should show the correct sequential numbers for each taxonomy path

## 1. Verifying Authentication

### User Registration

1. Visit [registry-service-frontend.vercel.app](https://registry-service-frontend.vercel.app)
2. Click "Register" or "Sign Up"
3. Enter required information:
   - Email: Use a unique email address
   - Username: Choose a unique username
   - Password: Enter a secure password
4. Click "Register" button
5. Verify that registration completes successfully and you are redirected to the dashboard

### User Login

1. Visit [registry-service-frontend.vercel.app](https://registry-service-frontend.vercel.app)
2. Click "Login"
3. Enter your credentials:
   - Email: Your registered email
   - Password: Your password
4. Click "Login" button
5. Verify that login completes successfully and you are redirected to the dashboard

## 2. Verifying Asset Registration

### Full Asset Registration Flow

1. Login to your account
2. From the dashboard, click "Register New Asset"
3. **Step 1: Layer Selection**
   - Select a layer (e.g., "Stars")
   - Click "Next"
4. **Step 2: Taxonomy Selection**
   - Select a category (e.g., "Pop")
   - Select a subcategory (e.g., "Base")
   - Verify that an NNA address is generated
   - Click "Next"
5. **Step 3: File Upload**
   - Upload a test file (preferably an image under 1MB)
   - Verify the file appears in the list
   - Enter asset name and description
   - Add at least one tag
   - Click "Next"
6. **Step 4: Review & Submit**
   - Review all information
   - Click "Submit" button
7. **Verification**
   - Verify you see a success message
   - Note the asset ID and NNA address
   - Verify the asset preview shows the file you uploaded

### Verifying Asset Retrieval

1. Go to the dashboard
2. Find your newly created asset in the list
3. Click on the asset to view details
4. Verify all information is correct:
   - Name matches what you entered
   - NNA address is displayed correctly
   - File preview works
   - Description and tags are accurate

## 3. Testing API Connectivity

To verify that API calls are working correctly:

1. Open browser developer tools (F12)
2. Go to Network tab
3. Perform actions in the UI (e.g., register asset, search assets)
4. Look for API calls to `/api/assets` and other endpoints
5. Verify successful responses (status 200 or 201)

### Backend Health Check

To verify backend connectivity:

1. While logged in, check the backend status indicator (if available in the UI)
2. In browser console, run:
   ```javascript
   fetch('/api/health').then(r => r.json()).then(console.log)
   ```
3. You should see a successful response with `status: "ok"`

## 4. Troubleshooting Common Issues

### Authentication Failures

If you can't log in or register:
- Check that you're using the correct credentials
- Clear browser cookies and local storage, then try again
- Verify the backend API is operational

### Asset Creation Failures

If asset creation fails:
- Check network requests in browser dev tools
- Look for error messages in the console
- Verify you've provided all required fields
- Try with a smaller file if upload seems to stall

### API Connectivity Issues

If API calls are failing:
- Check if you're properly authenticated
- Verify your token hasn't expired (check console)
- Check for CORS errors in the console
- Test the health endpoint

## 5. Verifying Recent Fixes

### 5.1 Subcategory Normalization Fix

To verify that the backend is now preserving subcategories:

1. Login to your account
2. Navigate to "Register Asset"
3. In the Taxonomy Selection:
   - Select "Stars" (S) as the layer
   - Select "Pop" (POP) as the category
   - Test each of these subcategories in separate asset registrations:
     - "Human Pop Master" (HPM)
     - "Legend Female" (LGF)
     - "Legend Male" (LGM)
     - "Diversity" (DIV)
4. Complete the registration process
5. **Expected Behavior**: The success screen should show the exact subcategory you selected
   - Example: If you selected LGF, you should see "S.POP.LGF.xxx" in the MFA, not "S.POP.BAS.xxx"

### 5.2 Sequential Numbering Fix

To verify that sequential numbering is working correctly:

1. Register multiple assets using the same taxonomy path (e.g., Stars/Pop/HPM)
2. **Expected Behavior**:
   - Sequential numbers should increment correctly (e.g., 001, 002, 003)
   - The full MFA should follow this pattern: S.001.001.001.xxx (for Stars/Pop/HPM)
3. Try a different taxonomy path
   - The counter should start fresh for new combinations
   - Example: S.POP.DIV.001 should start at 001 if it's the first asset with this combination

### 5.3 Backend URL Verification

To verify the frontend is connecting to the correct backend:

1. Open browser developer tools (F12)
2. Go to Network tab
3. Refresh the page and look for API calls
4. Verify they are pointing to https://registry.reviz.dev/api/

## 6. Mock vs. Real Backend

The application can run with either mock data or real backend data:

- **Mock Mode**: Local data simulation, files aren't persisted
- **Real Mode**: Connected to actual backend, changes are persisted

To verify you're using the real backend:
1. Create an asset
2. Log out and log back in
3. Verify your asset is still visible
4. Different browser sessions should see the same data

## Getting Help

If you encounter issues during verification:
- Check the console for detailed error messages
- Review the `API_TESTING.md` guide for API-specific issues
- Use the browser's network tab to identify failing requests
- Contact the development team with detailed information about the issue