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

## Deployment

The application is automatically deployed to Vercel when changes are pushed to the `main` branch.# Trigger workflow test
