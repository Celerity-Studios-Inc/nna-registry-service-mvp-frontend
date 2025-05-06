# NNA Registry Service Frontend

Frontend application for the Neural Network Architecture (NNA) Registry Service.

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

This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deployment

### Automatic Deployments

The application is automatically deployed when changes are pushed to the `main` branch. The GitHub Actions workflow will:

1. Checkout the `feature/dashboard-and-integration` branch code
2. Build the application
3. Deploy it to Vercel

### Manual Deployments

For manual deployments, use:

```bash
# Deploy to production
npm run deploy:prod

# Create a preview deployment
npm run preview
```

## API Proxy

In production, API requests are proxied through Vercel to avoid CORS issues. The proxy configuration is in `vercel.json`.

## Documentation

Additional documentation:
- [Vercel Setup](/docs/VERCEL_SETUP.md)
