# Debugging and Deployment Guide

## Overview
This document outlines the process for debugging and deploying the NNA Registry Service frontend application, including common issues and their solutions. 

## Backend Connectivity Issues

### Problem
The frontend application was failing to connect to the backend API, resulting in several issues:
- Inability to authenticate using real API credentials
- Browse functionality showing no data
- API calls returning 404 or 500 errors
- Backend health checks failing

### Root Causes
1. **CORS Issues**: Cross-Origin Resource Sharing restrictions prevented direct API calls from the browser
2. **API Proxy Configuration**: The proxy in Vercel wasn't handling all HTTP methods correctly
3. **ES Module vs CommonJS Syntax**: The serverless functions used incompatible syntax
4. **Path Handling**: Path parameters weren't being properly extracted and forwarded
5. **Error Handling**: Inadequate error handling when the backend was unavailable
6. **Authentication Logic**: Not properly detecting and handling mock authentication

### Solutions Implemented

#### 1. API Proxy Improvements
- Fixed path handling in the proxy to correctly extract and forward path parameters
- Added explicit handling for different HTTP methods
- Added robust error handling for network issues and server errors
- Added detailed logging for debugging
- Updated syntax from ES modules to CommonJS for compatibility

#### 2. Backend Availability Detection
- Implemented a more comprehensive backend availability check
- Added a health endpoint that doesn't require proxying to the real backend
- Added better logic to determine when to use mock data vs real API
- Added ability to force mock mode via localStorage for testing

#### 3. Mock Data Implementation
- Enhanced mock data to better match the expected API response format
- Added fallback to mock data when API requests fail
- Made mock login work with any valid email/password for easier testing

#### 4. Authentication Logic
- Improved token handling to properly identify mock tokens
- Added better token validation on application startup
- Added route protection to redirect unauthenticated users

## Deployment Issues

### Problem
The application deployment process had several issues:
- GitHub Actions workflows failing due to missing secrets
- Vercel authentication wall preventing access to the application
- TypeScript errors in serverless functions
- Some environment variables not being properly passed to the build

### Root Causes
1. **Missing Secrets**: The GitHub Actions workflow requires Vercel secrets that weren't configured
2. **Vercel Project Privacy**: The Vercel project was private, causing an authentication wall
3. **TypeScript Configuration**: Incompatible TypeScript configuration for serverless functions
4. **Environment Variables**: Some variables weren't properly defined in the Vercel configuration

### Solutions Implemented

#### 1. Vercel Configuration
- Added `public: true` to vercel.json to make the deployment publicly accessible
- Updated routes configuration to properly handle all HTTP methods
- Fixed module syntax in serverless functions to use CommonJS

#### 2. Manual Deployment Process
- Implemented direct deployment using Vercel CLI as a more reliable alternative to GitHub Actions
- Added detailed deployment instructions for future reference

## Debugging Tools

### API Test Utility
We created a dedicated API test utility at `/api-test` to help diagnose API connectivity issues:
- Tests different HTTP methods (GET, POST, PUT, DELETE)
- Shows detailed response information
- Helps identify which parts of the API pipeline are failing

### Backend Availability Detection
We improved the backend availability detection with:
- More detailed logging about availability status
- Better error handling for different failure modes
- The ability to force mock data via localStorage

## GitHub Actions Issues

### Problem
GitHub Actions has both successful and failed workflows for the same commit. This happens because:
1. The repository has multiple workflow files that trigger on the same events
2. Some workflows require Vercel authentication tokens that aren't configured

### Solutions

#### Option 1: Configure Vercel Secrets
To fix the failing workflows, add the following secrets to the GitHub repository:
- `VERCEL_TOKEN`: A personal access token from Vercel
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: The ID of your Vercel project

These values can be obtained from the Vercel dashboard or CLI.

#### Option 2: Disable Unused Workflows
If you prefer to use direct Vercel deployments, you can disable the failing workflows:
1. Delete or rename the failing workflow files in `.github/workflows/`
2. Create a new workflow that only performs build and test without deployment

## Rollback Procedure
If you need to roll back to a previous state:

1. Identify the commit hash to roll back to (e.g., for the last stable version)
2. Create a new branch from that commit: `git checkout -b rollback-branch <commit-hash>`
3. Make any necessary fixes on that branch
4. Deploy directly from that branch using Vercel CLI: `vercel --prod`

## Next Steps

1. **Fix GitHub Actions**: Either configure the required secrets or disable the failing workflows
2. **Improve Error Handling**: Continue enhancing error handling in the application
3. **Enhance Mock Data**: Make mock data more comprehensive for better testing
4. **Test with Real Backend**: Once the backend is available, test the application with it
5. **Document API Endpoints**: Create comprehensive documentation of all API endpoints