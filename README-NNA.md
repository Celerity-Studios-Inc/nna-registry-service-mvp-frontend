# NNA Registry Service Frontend

A React frontend application for the Neural Network Assets (NNA) Registry Service, allowing users to register, categorize, search, and manage neural network assets with a dual addressing system.

## Features

- **Asset Registration**: Register new neural network assets with proper taxonomy classification
- **Dual Addressing System**: Support for both human-friendly (HFN) and machine-friendly (MFA) NNA addresses
- **Taxonomy System**: Hierarchical classification with layers, categories, and subcategories
- **Asset Search**: Advanced search and filtering capabilities
- **File Management**: Upload, preview, and manage asset files
- **User Authentication**: Login, registration, and profile management
- **Dashboard**: Overview of registered assets and pending tasks
- **Responsive Design**: Mobile-friendly interface with Material UI

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nna-registry-service-mvp-frontend.git
   cd nna-registry-service-mvp-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   ```
   or
   ```
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

## Development Mode

The application currently runs in development mode with mock API responses. In the `api` directory, service files contain both mock implementations and commented-out real API implementations that can be uncommented when the backend is ready.

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about the project structure, components, and design patterns.

## Key Components

- **TaxonomySelection**: Layer, category, and subcategory selection
- **AssetSearch**: Search functionality with filtering
- **FileUpload**: File uploading with progress and preview
- **AssetCard**: Display of asset information
- **NNAAddressPreview**: Preview of generated NNA addresses
- **ReviewSubmit**: Final review and submission step

## TypeScript Types

The application uses TypeScript with comprehensive type definitions in the `types` directory:

- **asset.types.ts**: Asset-related interfaces
- **taxonomy.types.ts**: Taxonomy-related interfaces
- **api.types.ts**: API response and request interfaces

## Environments

The application is configured to work with different environments:

- **Development**: Local development with mock API
- **Production**: Connects to the real API endpoints

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Troubleshooting

If you encounter errors related to Material UI theming or context, make sure:

1. The App.tsx file includes proper ThemeProvider and CssBaseline components
2. All necessary contexts (AuthContext, NotificationsContext) are properly initialized

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).