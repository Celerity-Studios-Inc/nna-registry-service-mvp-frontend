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

## API Configuration

All API requests are proxied to the backend service using Vercel's rewrites configuration (see `vercel.json`).

### CORS Handling

The application uses a serverless TypeScript proxy function in `api/proxy.ts` to handle Cross-Origin Resource Sharing (CORS) issues when deployed to Vercel. This proxy:

- Properly handles preflight (OPTIONS) requests
- Adds necessary CORS headers to responses
- Forwards requests to the backend API with appropriate headers

## Deployment

The application is automatically deployed to Vercel when changes are pushed to the `main` branch. GitHub Actions workflow in `.github/workflows/main-deploy.yml` handles the CI/CD process.