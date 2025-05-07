# NNA Registry Service Frontend

This is the frontend application for the NNA (Naming, Numbering, and Addressing) Registry Service. It provides a user-friendly interface for registering and managing NNA assets with proper human-friendly naming formats.

## Project Overview

The NNA Registry Service Frontend provides a user interface for registering, managing, and searching assets in the NNA framework. It implements the 10-layer NNA taxonomy (G, S, L, M, W, B, P, T, C, R) and allows for asset registration with appropriate metadata.

## Technology Stack

- React (with TypeScript)
- Material UI for components
- React Router for navigation
- Axios for API communication
- React Hook Form for form handling

## Development

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend.git
   cd nna-registry-service-mvp-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000.

### Building

To build the application for production:

```bash
npm run build
```

To serve the built application with the Express server (which includes CORS handling):

```bash
npm run serve
```

## Deployment

### Vercel Deployment

This project is configured for automatic deployment to Vercel using GitHub Actions.

To set up deployment:

1. Follow the instructions in `.github/MANUAL_DEPLOYMENT_SETUP.md` to set up the required GitHub secrets.
2. Push to the `main` branch or the `feature/dashboard-and-integration` branch to trigger a deployment.
3. You can also manually trigger a deployment from the GitHub Actions tab.

### Project Structure

```
src/
├── api/             # API service layer
├── assets/          # Static assets and resources
├── components/      # Reusable UI components
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # Core service functions
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Features

- Layer selection for asset registration
- Taxonomy browsing (categories and subcategories)
- File uploads
- Asset metadata management
- NNA address generation with proper alphabetic codes
- Human-Friendly Name (HFN) and Machine-Friendly Address (MFA) support
- Training data collection for assets
- Composite asset management
- Asset search

## Environment Variables

- `REACT_APP_API_BASE_URL`: API endpoint URL (e.g., "https://registry.reviz.dev/api")
- `REACT_APP_USE_MOCK_API`: Set to "true" to use mock API responses (default: "false")

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run serve`: Serves the built application with Express server
- `npm run format`: Formats code with Prettier

## License

Proprietary - Copyright (c) 2025