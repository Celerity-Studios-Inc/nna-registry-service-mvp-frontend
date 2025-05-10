# Asset Registration Testing Guide

This guide provides step-by-step instructions for testing asset registration with real user authentication tokens.

## Prerequisites

1. A valid account on the NNA Registry Service
2. An authentication token from a successful login
3. Test files for upload (preferably image files under 2MB)

## Obtaining a Valid Authentication Token

To get a valid token for testing:

1. Log in to the application UI at [registry-service-frontend.vercel.app](https://registry-service-frontend.vercel.app)
2. After logging in, open browser developer tools (F12)
3. Go to Application tab > Local Storage 
4. Copy the value of the `accessToken` key
5. The token should look like `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1...` (NOT starting with "MOCK-")

## Testing Asset Registration Flow

### 1. Using the Web UI

1. Log in to the application
2. Navigate to "Register Asset" from the main menu
3. Follow the step-by-step wizard:
   - Select a layer (e.g., "Stars")
   - Choose category and subcategory
   - Upload a test file
   - Fill in asset details (name, description, tags)
   - Review and submit
4. Verify the success message and note the NNA address assigned to your asset
5. Navigate to Dashboard to confirm your asset appears in the list

### 2. Direct API Testing

For direct API testing without the UI, use the following script:

```bash
# Install required packages if needed
npm install node-fetch form-data

# Set your token and run the test
TOKEN="your_token_here"
node ./direct-api-test.mjs $TOKEN
```

This script will:
1. Create a test file if one doesn't exist
2. Format the request with all required fields
3. Make a direct API call to register an asset
4. Return the result with NNA address

## Verifying Success

A successful asset registration will:

1. Return a success response with status code 201
2. Include an asset ID and NNA address in the response
3. Make the asset available via the GET /assets endpoint
4. Show the asset in the UI Dashboard

## Troubleshooting

### Authentication Issues

- If you get a 401 Unauthorized error, your token may be expired or invalid
- Ensure your token doesn't start with "MOCK-" (which indicates a mock token)
- Try logging out and back in to get a fresh token

### File Upload Issues

- Ensure your file is less than 10MB
- Verify that the FormData structure includes all required fields:
  - file
  - name
  - layer
  - category
  - subcategory
  - description
  - tags[]
  - trainingData
  - rights
  - components[]

### API Endpoint Issues

- For direct API testing, use `https://registry.reviz.dev/api/assets`
- For UI or testing through the proxy, use `/api/assets`
- If you encounter CORS issues with direct API calls, use the proxy endpoint

## Expected Format for Asset Creation

```javascript
// Required structure for asset creation
const formData = new FormData();
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

## Real vs. Mock Data

The application will use:
- Real backend data when:
  1. The backend API is available
  2. You have a valid non-mock token
  3. `REACT_APP_USE_MOCK_API` is set to `false`

- Mock data when:
  1. The backend API is unavailable
  2. You have a mock token (starting with "MOCK-")
  3. `REACT_APP_USE_MOCK_API` is set to `true`
  4. API requests fail and the system falls back to mock data