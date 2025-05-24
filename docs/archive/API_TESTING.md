# NNA Registry Service API Testing Guide

This document provides instructions for testing the NNA Registry Service backend API integration.

## Prerequisites

- Node.js v18.0.0 or later (v22.14.0 recommended)
- `node-fetch` and `form-data` packages installed
- A valid authentication token from the backend API

## Obtaining a Valid Token

To get a valid token for testing:

1. Log in to the application UI at [registry-service-frontend.vercel.app](https://registry-service-frontend.vercel.app)
2. Create an account if you don't have one yet
3. After logging in, open browser developer tools (F12)
4. Go to Application tab > Local Storage
5. Look for the key `accessToken` and copy its value
6. **Important**: The token should NOT start with "MOCK-" which indicates a mock token
7. The token should look like `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1...` (a JWT token)

**Note**: Tokens expire after a certain period (typically 24 hours). If your tests fail with 401 Unauthorized errors, you may need to log in again and get a fresh token.

## Test Scripts

We provide several test scripts to verify API functionality:

### Complete API Test Suite

Tests all API endpoints in one run:

```bash
# Run with a valid token
node complete-api-test.mjs YOUR_TOKEN_HERE
```

This comprehensive test will check:
- GET assets endpoint (direct and via proxy)
- File upload endpoint (direct and via proxy) 
- Asset creation endpoint (direct and via proxy)

### Individual Test Scripts

#### Direct API Test

Tests direct API access to the backend:

```bash
# Run with a valid token
node direct-api-test.mjs YOUR_TOKEN_HERE
```

#### Proxy API Test

Tests API access through the local development proxy:

```bash
# First start the local development server
npm start

# In another terminal, run:
node test-asset-creation.js
```

## Testing Asset Creation

### Required Fields for Asset Creation

When creating an asset, the backend API requires these fields:

- `file`: The file to upload
- `name`: Asset name
- `layer`: Layer code (e.g., "S" for Stars)
- `category`: Category code (e.g., "POP")
- `subcategory`: Subcategory code (e.g., "BAS")
- `tags[]`: At least one tag
- `trainingData`: JSON object for training data
- `rights`: JSON object with source and rights_split
- `components[]`: Empty array or list of component references

### FormData Structure Example

```javascript
// Example FormData structure
formData.append('file', fileObject);
formData.append('name', 'Asset Name');
formData.append('layer', 'S');
formData.append('category', 'POP');
formData.append('subcategory', 'BAS');
formData.append('description', 'Asset description');
formData.append('tags[]', 'tag1');
formData.append('trainingData', JSON.stringify({
  prompts: [],
  images: [],
  videos: []
}));
formData.append('rights', JSON.stringify({
  source: 'Original',
  rights_split: '100%'
}));
formData.append('components[]', '');
```

## Troubleshooting

### 401 Unauthorized

If you see a 401 error:
- Make sure you're using a valid authentication token
- Check that the token hasn't expired
- Verify the token is from the correct environment
- Ensure the token doesn't start with "MOCK-"

### CORS Issues

If you encounter CORS errors with direct API calls:
- This is expected behavior when calling the API directly from browser
- Use the proxy API implementation (`/api/proxy` or `/api/assets`) instead
- Test from a Node.js script (which doesn't enforce CORS)

### HTML Response Instead of JSON

If you receive HTML responses instead of JSON:
- The server is returning the React app instead of API responses
- Make sure your routes are correctly configured in `vercel.json`
- Check proper API proxy configuration in `package.json` ("proxy" field)
- When testing locally, ensure the API proxy is working (`npm start` should provide this)

### FormData Issues

If asset creation fails with file uploads:
- Check that the FormData structure is correct
- Ensure the `file` field is provided first in the FormData
- Verify that the Content-Type header is not being manually set (let the browser set it)
- Log the FormData contents before sending to verify all fields are included

## API Authentication Flow

```
┌─────────────┐     ┌─────────────┐      ┌────────────┐
│    Login    │     │  Get Token  │      │ Use Token  │
│ Credentials ├────►│  from API   ├─────►│ for Access │
└─────────────┘     └─────────────┘      └────────────┘
```

1. User logs in with credentials
2. Backend issues a JWT token
3. Token is stored in localStorage
4. Token is included in Authorization header for API requests

## Testing Against Different Environments

### Local Backend (Optional)

```bash
# Set environment variable for local backend
export API_URL=http://localhost:3001/api
```

### Development Backend

```bash
# Default backend URL is the development environment
export API_URL=https://registry.reviz.dev/api
```

### Production Backend

```bash
# For production testing
export API_URL=https://prod-registry.reviz.dev/api
```