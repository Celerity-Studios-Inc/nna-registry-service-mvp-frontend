## Overview

This guide provides step-by-step prompts for implementing the **NNA Registry Service Frontend** using AI-assisted development with Cursor (components) and Claude (validation). It aligns with the **NNA Registry Service Frontend Implementation Plan v1.2.2**, targeting a 2-day MVP (March 3-4, 2025) for core UI functionality (registration, browsing, curation) with React, TypeScript, and Material-UI.

## Step 1: Development Environment Setup (1 hour)

### 1.1 Install Required Software

**Prompt for Cursor**:

```
Generate terminal commands to set up the frontend development environment on a MacBook Pro. Include:
- Installing Node.js and npm via Homebrew.
- Installing Visual Studio Code.
- Verification commands for each installation.
```

### 1.2 Create GitHub Repository

**Prompt for Cursor**:

```
Generate step-by-step instructions for creating a GitHub repository for the NNA Registry Service frontend. Include:
- Commands to create and clone the repository.
- A folder structure for a React project: src/api, src/components, src/pages, src/types, src/utils.
- A `.gitignore` file excluding node_modules, .env, and build.
```

## Step 2: Project Setup (3 hours)

### 2.1 Initialize React Project

**Prompt for Cursor**:

```
Generate a React project structure for the NNA Registry Service frontend, aligning with v1.2.2. Include:
- TypeScript configuration with strict mode.
- Dependencies: react, react-dom, react-router-dom, axios, @mui/material, react-hook-form, @hookform/resolvers/yup, jwt-decode, notistack.
- Folder structure: src/api, src/components/common, src/components/asset, src/pages, src/types, src/utils.
- Environment variables in .env.example for REACT_APP_API_URL.
- Package.json scripts for start, build, test.
```

### 2.2 Configure Authentication

**Prompt for Cursor**:

```
Generate an authentication setup in src/api/authService.ts and src/contexts/AuthContext.tsx. Include:
- authService.ts: Functions for register, login, getProfile, logout using Axios with JWT.
- AuthContext.tsx: Context provider with login, register, logout, isAuthenticated, isAdmin methods.
- Types in src/types/auth.ts: User, LoginRequest, RegisterRequest, AuthResponse.
```

**Prompt for Claude**:

```
Validate the authentication setup. Ensure:
- JWT tokens are stored in localStorage and validated with jwt-decode.
- Login redirects to dashboard on success.
- Error handling for 401 (unauthorized) and 400 (invalid credentials).
Write Jest tests for AuthContext, covering login and logout scenarios.
```

## Step 3: Implement Core UI (8 hours)

### 3.1 Asset Registration UI

**Prompt for Cursor**:

```
Generate React components for asset registration in src/components/asset and src/pages/assets/RegisterAssetPage.tsx. Include:
- LayerSelection.tsx: Card-based layer selection (G, S, L, M, W, B, P, T, R, C).
- TaxonomySelection.tsx: Dropdowns for category/subcategory with real-time HFN/MFA previews.
- FileUpload.tsx: Drag-and-drop file upload with type/size validation.
- TrainingDataCollection.tsx: Inputs for text prompts, image uploads, video URLs.
- ReviewSubmit.tsx: Summary view with HFN/MFA and training data.
- RegisterAssetPage.tsx: Multi-step form integrating all components, submitting to /v1/asset/register.
Use Material-UI and React Hook Form with Yup validation.
```

**Prompt for Claude**:

```
Validate the asset registration components. Ensure:
- HFN (e.g., G.POP.KPO.001) and MFA (e.g., G.001.013.001) previews update in real-time.
- Training data inputs (prompts, images, URLs) are validated.
- UI matches mockups in v1.2.2, Section 3.1.
Write Jest tests for TaxonomySelection and TrainingDataCollection, covering validation and submission.
```

### 3.2 Asset Search UI

**Prompt for Cursor**:

```
Generate React components for asset search in src/components/search and src/pages/assets/SearchAssetsPage.tsx. Include:
- AssetSearch.tsx: Search bar, taxonomy dropdowns, pagination controls.
- AssetCard.tsx: Card displaying asset thumbnail, HFN, and metadata.
- SearchAssetsPage.tsx: Page layout with AssetSearch component.
Use Material-UI, react-query for API calls, and debounced search (300ms).
```

**Prompt for Claude**:

```
Validate the asset search components. Ensure:
- Search filters align with Taxonomy v1.3.
- Pagination handles large datasets efficiently.
- Error handling for 404 (no results) and 401 (unauthorized).
Write Jest tests for AssetSearch, covering filter application and pagination.
```

## Step 4: Implement Management and Testing (8 hours)

### 4.1 Management UI

**Prompt for Cursor**:

```
Generate React components for asset management in src/pages/assets/AssetDetailPage.tsx. Include:
- Display of asset details (HFN, MFA, metadata, training data).
- Edit form for updating metadata and taxonomy.
- Delete button with admin-only access.
- Rights status display from /v1/rights/verify/{asset_id}.
Use Material-UI and React Hook Form.
```

### 4.2 Testing

**Prompt for Claude**:

```
Generate Jest integration tests for the frontend using React Testing Library and Mock Service Worker. Include:
- Tests for asset registration, search, and management UI flows.
- Edge cases: invalid inputs, unauthorized access, API failures.
- Validation of training data and HFN/MFA displays.
Provide a setup guide for running tests with MSW.
```

## Step 5: Deployment and Documentation (4 hours)

### 5.1 Deployment

**Prompt for Cursor**:

```
Generate deployment configurations for the NNA Registry Service frontend. Include:
- Dockerfile for containerizing the React app.
- Netlify configuration for static hosting.
- GitHub Actions workflow for CI/CD.
- Instructions for setting up environment variables in production.
```

### 5.2 Documentation

**Prompt for Claude**:

```
Generate a README.md for the NNA Registry Service frontend. Include:
- Project overview and features.
- Installation, setup, and environment variable instructions.
- UI workflow descriptions with screenshots from v1.2.2.
- Testing and deployment guides.
- Troubleshooting tips for API connectivity and JWT issues.
```

## Verification Checklist

- UI renders without errors.
- All tests pass (80%+ coverage).
- Registration form submits assets with training data to /v1/asset/register.
- Search UI displays results with correct HFN/MFA.
- Application deploys to Netlify with responsive design.

## Final Notes

Run `npm start` to start the application. Access at `http://localhost:3000`. Test API integration with `REACT_APP_API_URL=http://localhost:3000`.
