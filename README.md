# NNA Registry Service Frontend

Frontend application for the Neural Network Architecture (NNA) Registry Service.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://nna-registry-service-mvp-frontend.vercel.app)

## Latest Update (2025-05-13)
- Updated backend URL to use production API at registry.reviz.dev
- Fixed subcategory normalization issues 
- Improved sequential numbering for MFA display

## Production Deployment

The production site is deployed at: [nna-registry-service-mvp-frontend.vercel.app](https://nna-registry-service-mvp-frontend.vercel.app)

## Development Setup

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
# Start the development server
npm start
```

## Testing API Integration

We've provided scripts to test the backend API integration for asset registration:

```bash
# Install test script dependencies
npm install node-fetch form-data

# Test with a valid token
node complete-api-test.mjs YOUR_TOKEN_HERE
```

See [API_TESTING.md](./API_TESTING.md) for detailed testing instructions, including:

- How to obtain a valid authentication token
- Testing asset creation endpoints
- Troubleshooting common issues

### Mock vs. Real Backend

The application can work with both mock data and the real backend API:

- Set `REACT_APP_USE_MOCK_API=true` in `.env` to use mock data
- Set `REACT_APP_USE_MOCK_API=false` to use the real backend API

## Local Production Testing

If you need to test the production build locally, there are two ways to do this:

### Option 1: Using the serve-local.sh script (Recommended)

We've provided a convenient script that automates the build and serve process with proper API routing:

```bash
# Make sure the script is executable
chmod +x serve-local.sh

# Run the script
./serve-local.sh
```

The script will build the application, make sure `serve` is installed, and launch the server with the correct configuration.

### Option 2: Manual setup

If you prefer to run the commands manually:

```bash
# Build the production version
npm run build

# Install serve if you don't have it
npm install -g serve

# Serve the production build with API routing
# IMPORTANT: Use the -s flag for SPA routing AND the config file for API routing
serve -s build -l 3000 --config serve.json
```

### Troubleshooting API Routing Issues

If you encounter issues where API requests return HTML instead of JSON (a common issue when serving production builds locally), check the following:

1. Make sure you're using the `--config serve.json` parameter with the serve command
2. Visit the diagnostic endpoint at `http://localhost:3000/api/serve-local` to check if API routing is working
3. Check your browser console for detailed error messages and solutions

The `serve.json` file contains special routing rules that handle API requests properly. **Without this configuration, API requests will incorrectly return the index.html file instead of proper API responses**, which will cause errors like:

- "Cannot destructure property 'user' of '(intermediate value)' as it is undefined"
- "SyntaxError: Unexpected token '<', '<!doctype '... is not valid JSON"

## API Configuration

All API requests are proxied to the backend service using Vercel's rewrites configuration (see `vercel.json`).

### CORS Handling

The application uses a serverless TypeScript proxy function in `api/proxy.ts` to handle Cross-Origin Resource Sharing (CORS) issues when deployed to Vercel. This proxy:

- Properly handles preflight (OPTIONS) requests
- Adds necessary CORS headers to responses
- Forwards requests to the backend API with appropriate headers
- Includes detailed logging for troubleshooting

### File Upload and Asset Creation

For asset creation with file uploads, a special API handler in `api/assets.ts` ensures that multipart/form-data requests are properly forwarded to the backend with:

- Correct content-type headers preserved
- Binary file data properly handled
- FormData structure maintained

#### FormData Handling Fix

The asset creation implementation has been updated to use native `fetch` instead of axios for FormData handling:

```javascript
// Using native fetch which handles FormData correctly
const fetchResponse = await fetch('/api/assets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    // No Content-Type header - let browser set it with boundary
  },
  body: formData
});
```

This solution addresses an issue where axios was incorrectly setting the Content-Type header for FormData requests, causing file uploads to fail. See [FORM_DATA_FIX_SUMMARY.md](./docs/FORM_DATA_FIX_SUMMARY.md) for details.

### Environment Configuration

- Development environment: Uses mock data by default (configured in `.env`)
- Production environment: Uses real API at `registry.reviz.dev` (configured in `.env.production`)
- Production domain check: Forces real API usage on production domains regardless of environment variables

### Troubleshooting API Connection

If you encounter issues with the API proxy or mock data being used in production, see `API_PROXY_DEBUG.md` for detailed debugging information and potential solutions.

## Deployment

The application is automatically deployed to Vercel when changes are pushed to the `main` branch. GitHub Actions workflow in `.github/workflows/main-deploy.yml` handles the CI/CD process.

## Authentication

Authentication is handled through the `/api/auth/` endpoints, which are specifically routed through a dedicated auth-proxy service. The auth endpoints are:

- `/api/auth/register` - Register a new user
- `/api/auth/login` - Login with existing credentials
- `/api/auth/profile` - Get the current user's profile

The app will fallback to mock authentication if the backend is unavailable.

## Testing Tools

To help test and debug API interactions, we've provided these utility tools:

- `/public/test-asset-upload.html` - Browser-based UI for testing asset uploads
- `/scripts/test-asset-creation.js` - Node.js script for testing asset creation
- `/scripts/verify-formdata-handling.js` - Tool to verify FormData handling differences between fetch and axios

These tools can be used to validate API connectivity, test asset registration, and debug FormData issues.