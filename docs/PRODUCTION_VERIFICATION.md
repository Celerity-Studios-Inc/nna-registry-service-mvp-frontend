# Production Verification Guide

This guide provides a comprehensive approach to verifying that the NNA Registry Service frontend works correctly in production.

## Access Information

- **Production URL**: [registry-service-frontend.vercel.app](https://registry-service-frontend.vercel.app)
- **Backend API**: https://registry.reviz.dev/api
- **Required**: Modern browser with JavaScript enabled and DevTools access

## Preparation

1. Clear browser cache and cookies for the production domain
2. Open browser developer tools (F12) before accessing the site
3. Keep the Network tab open to monitor API requests
4. Prepare a small test file (preferably image under 2MB)

## 1. Verifying Core Application Loading

- [ ] Application loads without errors in console
- [ ] Main navigation elements appear
- [ ] Login/Register options are visible for unauthenticated users
- [ ] Application styling is correct (no missing CSS)

## 2. Verifying Authentication

### User Registration
- [ ] Navigate to Register page
- [ ] Complete registration form with valid information
- [ ] Submit form and confirm successful registration
- [ ] Observe network requests to confirm `/api/auth/register` endpoint is called
- [ ] Verify you are redirected to Dashboard after registration

### User Login
- [ ] Navigate to Login page
- [ ] Enter valid credentials
- [ ] Submit form and confirm successful login
- [ ] Observe network requests to confirm `/api/auth/login` endpoint is called
- [ ] Verify JWT token is stored in localStorage
- [ ] Verify you are redirected to Dashboard after login

## 3. Verifying Backend Connectivity

- [ ] After login, check the console log for backend availability messages
- [ ] Verify network requests to `/api/test-real-backend` are successful
- [ ] Confirm console message "✅ Real backend API is available and responding!"
- [ ] Verify that `isBackendAvailable` is set to `true` in the console logs

## 4. Verifying Asset Registration

### Wizard Navigation
- [ ] Access "Register Asset" from the main navigation
- [ ] Verify the stepper shows all required steps
- [ ] Navigate through the wizard using Next/Back buttons
- [ ] Confirm each step validates input before proceeding

### Step 1: Layer Selection
- [ ] All layer options are displayed correctly
- [ ] Selecting a layer updates the UI
- [ ] Next button becomes active after selection

### Step 2: Taxonomy Selection
- [ ] Categories populate based on selected layer
- [ ] Subcategories populate based on selected category
- [ ] NNA address is generated and displayed
- [ ] Next button becomes active after selections

### Step 3: File Upload
- [ ] Dropzone accepts file uploads
- [ ] File preview is displayed after upload
- [ ] Form fields for name, description, and tags work correctly
- [ ] Upload progress indicators work

### Step 4: Review & Submit
- [ ] All entered information is displayed correctly
- [ ] Submit button initiates asset creation
- [ ] Loading indicator appears during submission

### Success Screen
- [ ] Success message appears after successful creation
- [ ] Asset details are displayed correctly
- [ ] NNA address is shown properly
- [ ] Options to create another asset or view dashboard are presented

## 5. Verifying Network Requests

During asset registration, verify these network requests:
- [ ] File upload request to `/api/assets/upload` or direct backend
- [ ] Asset creation request to `/api/assets`
- [ ] Request includes all required fields in FormData
- [ ] Authorization header is present with valid token
- [ ] Successful response with asset ID and NNA address

## 6. Verifying Mock vs. Real Mode

To verify the application correctly distinguishes between mock and real mode:

1. With real token (from login):
   - [ ] Check console logs for "Using real API implementation for createAsset"
   - [ ] Verify network requests to real backend endpoints
   - [ ] Confirm assets persist after page reload

2. With mock token (if testing mock mode):
   - [ ] Create a mock token by setting one in localStorage: `localStorage.setItem('accessToken', 'MOCK-test-token')`
   - [ ] Check console logs for "Using mock implementation"
   - [ ] Verify no network requests to real backend endpoints
   - [ ] Assets should still appear but won't persist after clearing storage

## 7. Verifying Asset Retrieval

After creating assets:
- [ ] Navigate to Dashboard to see created assets
- [ ] Click on an asset to view details
- [ ] Verify all asset information is displayed correctly
- [ ] Confirm file preview/download works
- [ ] Check network requests to `/api/assets` endpoint

## 8. Verifying Error Handling

Test these error scenarios:
- [ ] Submit without required fields
- [ ] Upload an oversized file
- [ ] Use an expired/invalid token
- [ ] Try to create asset with invalid data

Verify that:
- [ ] Appropriate error messages are displayed
- [ ] Application doesn't crash
- [ ] User can recover from errors

## Technical Verification

For developers, verify these technical aspects:

1. **API Proxy**:
   - [ ] Check network requests to see if they go through `/api/*` proxy endpoints
   - [ ] Verify proper headers are set (Authorization, Content-Type)
   - [ ] Confirm CORS issues are handled correctly

2. **FormData Handling**:
   - [ ] Inspect network requests to verify FormData is properly constructed
   - [ ] Check that file uploads maintain content-type headers
   - [ ] Verify array fields (tags[], components[]) are formatted correctly

3. **Authentication Flow**:
   - [ ] Verify token is stored in localStorage
   - [ ] Confirm token is included in API requests
   - [ ] Check token refresh mechanism if implemented

## Troubleshooting Common Issues

If verification fails, check these common issues:

1. **Auth Issues**:
   - Check token validity and expiration
   - Clear localStorage and re-authenticate
   - Verify backend auth services are operational

2. **API Connectivity**:
   - Check network connectivity to backend
   - Verify API endpoints are correct
   - Check for CORS configuration issues
   - Confirm proxy functions are properly deployed

3. **File Upload Issues**:
   - Reduce file size if upload fails
   - Check Content-Type and multipart/form-data formatting
   - Verify temporary URL creation for file previews

4. **Console Errors**:
   - Look for JavaScript errors in console
   - Check for failed network requests
   - Verify environment variables are correctly set