# NNA Registry Service Frontend

Frontend application for the Neural Network Architecture (NNA) Registry Service.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://registry-service-frontend.vercel.app)

## Production Deployment

The production site is deployed at: [registry-service-frontend.vercel.app](https://registry-service-frontend.vercel.app)

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