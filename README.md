# NNA Registry Service - AI-Enhanced Production System

Frontend application for the Naming, Numbering, and Addressing (NNA) Registry Service. A comprehensive platform for managing digital assets with AI-powered metadata generation and dual addressing systems.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://nna-registry-service-mvp-frontend.vercel.app)
[![AI Integration](https://img.shields.io/badge/AI%20Integration-OpenAI%20GPT--4o-success?style=for-the-badge&logo=openai)](https://nna-registry-service-mvp-frontend.vercel.app)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](https://nna-registry-service-mvp-frontend.vercel.app)

## 🚀 **System Status: ENHANCED AI INTEGRATION FULLY OPERATIONAL** (July 15, 2025)

### **🎯 Current Status: Phase 2B Complete - All Layer Processing Operational**
- ✅ **Enhanced AI Integration**: All layers (G, S, L, M, W, C) fully operational with layer-specific processing
- ✅ **Backend Integration Complete**: Phase 2B fields (creatorDescription, albumArt, aiMetadata) working
- ✅ **Video Processing Fixed**: M/W layer timing issues resolved, 400 errors eliminated
- ✅ **Songs Layer Enhanced**: Pattern matching + album art integration operational
- ✅ **Composite Intelligence**: Smart tag aggregation from component assets
- 🚀 **System Status**: All major AI processing issues resolved, comprehensive testing recommended

### **📊 Production-Ready Features**
- ✅ **Enhanced AI Integration**: All layers (G, S, L, M, W, C) with layer-specific processing strategies
- ✅ **Smart File Upload System**: 4MB threshold with 32MB capacity and automatic routing
- ✅ **Video Thumbnail Generation**: 100% success rate with timing optimizations and memory management
- ✅ **Songs Layer Enhancement**: Pattern matching + iTunes album art integration
- ✅ **Composite Intelligence**: Frequency-based tag aggregation from component assets
- ✅ **Complete Search & Sort**: All functionality working with enhanced performance
- ✅ **Settings System**: Date filtering with real-time updates and persistent storage
- ✅ **Security Hardening**: Input validation, error boundaries, CORS resolution
- ✅ **Environment-Aware Logging**: 80% reduction in production console noise

### **🎯 Key Achievements**
- **AI-powered metadata generation** fully operational across all layers (G, S, L, M, W, C)
- **Layer-specific processing strategies** with optimized performance for each asset type
- **Video processing timing fixes** eliminating OpenAI 400 errors for M/W layers
- **Songs layer pattern matching** with robust song/artist/album extraction
- **Composite intelligence** with smart tag aggregation from component assets
- **Professional user experience** with polished Material UI interface
- **Comprehensive documentation** for users, developers, and AI integration
- **Patent-complementing technology** enhancing USPTO Patents 12,056,328 and 11,416,128

## Project Overview

The NNA Registry Service is a platform for managing digital assets within a Naming, Numbering, and Addressing (NNA) Framework. It implements a dual addressing system (Human-Friendly Names and NNA Addresses) for digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, etc.).

Key features include:
- **🤖 Enhanced AI Integration** - Layer-specific processing with OpenAI GPT-4o for all asset types (G, S, L, M, W, C)
- **Songs Layer Enhancement** - Pattern matching + iTunes album art integration
- **Video Processing Optimization** - Timing fixes for M/W layers eliminating OpenAI 400 errors
- **Composite Intelligence** - Smart tag aggregation from component assets with frequency analysis
- **Asset Registration** - Complete workflow with file uploads and taxonomy-based categorization
- **Dual Addressing System** - HFN and MFA formats with automatic conversion
- **Advanced Search & Discovery** - Performance-optimized search with sorting and filtering
- **Professional UI/UX** - Responsive Material UI interface with comprehensive error handling
- **3-Tier Deployment** - Proper development → staging → production workflow

## 📚 **Documentation**

### **🎯 Master Documentation**
- [**PRODUCTION_READY_SYSTEM_GUIDE.md**](./PRODUCTION_READY_SYSTEM_GUIDE.md) - **Complete system overview and production guide**

### **🤖 Enhanced AI Integration Documentation**
- [**BACKEND_TEAM_UPDATE_REQUEST.md**](./BACKEND_TEAM_UPDATE_REQUEST.md) - **URGENT: Backend changes needed for Enhanced AI Integration**
- [**BACKEND_REQUIREMENTS_ENHANCED_AI.md**](./BACKEND_REQUIREMENTS_ENHANCED_AI.md) - **Technical requirements for backend team**
- [**PHASE_2B_IMPLEMENTATION_PLAN.md**](./PHASE_2B_IMPLEMENTATION_PLAN.md) - **MusicBrainz integration and advanced features**

### **🤖 AI Integration Documentation**
- [**AI_INTEGRATION_RELEASE_NOTES.md**](./AI_INTEGRATION_RELEASE_NOTES.md) - Complete AI integration implementation details
- [**OpenAI Service Implementation**](./src/services/openaiService.ts) - Technical implementation of GPT-4o Vision API

### **🔧 Technical Documentation**
- [**SMART_ROUTING_FINAL_IMPLEMENTATION.md**](./SMART_ROUTING_FINAL_IMPLEMENTATION.md) - File upload system details
- [**TAXONOMY_SERVICE_GUIDELINES.md**](./TAXONOMY_SERVICE_GUIDELINES.md) - Critical taxonomy service usage
- [**SETTINGS_IMPLEMENTATION_COMPLETE.md**](./SETTINGS_IMPLEMENTATION_COMPLETE.md) - Settings system implementation
- [**SEARCH_SORT_FILTER_FIXES.md**](./SEARCH_SORT_FILTER_FIXES.md) - Search functionality details
- [**MVP_RELEASE_1_0_1.md**](./MVP_RELEASE_1_0_1.md) - Production readiness assessment

### Component Documentation

- [**Taxonomy System Overview**](docs/taxonomy/README.md) - Overview of the taxonomy classification system
- [**Developer Guide**](docs/taxonomy/DEVELOPER_GUIDE.md) - Guide for developers working with the taxonomy system
- [**UI Components Guide**](docs/taxonomy/UI_COMPONENTS.md) - Documentation for taxonomy UI components
- [**Troubleshooting Guide**](docs/taxonomy/TROUBLESHOOTING.md) - Solutions for common taxonomy issues

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

### Running Tests

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run a specific test file
npm test -- --testPathPattern="path/to/test"
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

## Performance Optimizations

The application implements several performance optimization techniques:

1. **React.memo**: Components are memoized to prevent unnecessary re-renders
2. **useMemo/useCallback**: Computations and handlers are memoized for stability
3. **Custom comparison functions**: Components only re-render when relevant props change
4. **Environment-aware logging**: Debug logs are disabled in production
5. **Optimized data structures**: Using lookup tables instead of switch statements

See [PHASE_8_STEP_3_OPTIMIZATION_SUMMARY.md](./PHASE_8_STEP_3_OPTIMIZATION_SUMMARY.md) for details.

## Testing Tools

To help test and debug API interactions, we've provided these utility tools:

- `/public/test-asset-upload.html` - Browser-based UI for testing asset uploads
- `/scripts/test-asset-creation.js` - Node.js script for testing asset creation
- `/scripts/verify-formdata-handling.js` - Tool to verify FormData handling differences between fetch and axios

These tools can be used to validate API connectivity, test asset registration, and debug FormData issues.

## Maintenance Guidelines

When maintaining this codebase:

1. **Adhere to code style**: Follow TypeScript conventions and React best practices
2. **Preserve performance optimizations**: Maintain React.memo, useMemo, and useCallback patterns
3. **Keep documentation updated**: Update technical docs when making significant changes
4. **Add tests for new features**: Maintain test coverage for critical functionality
5. **Use structured logging**: Follow the established logging patterns for debugging

## License

Proprietary - All rights reserved. This code is intended for the specific use case of the NNA Registry Service.