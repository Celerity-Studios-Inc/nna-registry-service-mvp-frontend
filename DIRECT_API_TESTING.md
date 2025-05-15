# Direct API Testing Scripts

This document describes how to use the direct API testing scripts to interact with the backend API without going through the frontend proxy.

## Overview

The scripts provided allow you to:

1. Authenticate directly with the backend API and obtain a token
2. Fetch recent assets directly from the backend API
3. Search for assets by keyword
4. Get detailed information about a specific asset

These scripts are useful for diagnosing issues with the backend API and testing API functionality directly.

## Prerequisites

- Node.js installed (v14 or higher)
- Backend API running at https://registry.reviz.dev/api
- Valid user credentials for the backend API

## Scripts

### 1. Authentication Script (`auth-api.mjs`)

This script authenticates with the backend API and saves the token for use with other scripts.

```bash
# Run with credentials as command line arguments
node scripts/auth-api.mjs <email> <password>

# Or run without arguments to be prompted for credentials
node scripts/auth-api.mjs
```

The script will:
- Authenticate with the backend API
- Save the token to a local file in your home directory
- Display the token for reference

### 2. API Testing Script (`test-direct-api.mjs`)

This script demonstrates interacting with the backend API using the token obtained from the authentication script.

```bash
# Run using the saved token
node scripts/test-direct-api.mjs

# Or run with a specific token
node scripts/test-direct-api.mjs <token>
```

The script will:
- Fetch the 10 most recent assets from the backend API
- Display detailed information about each asset
- Fetch detailed information about the first asset (if available)
- Search for assets containing the keyword "sunset"

## Example Usage

```bash
# Step 1: Authenticate
node scripts/auth-api.mjs neouser19@neo.com password123

# Step 2: Test the API
node scripts/test-direct-api.mjs
```

## Troubleshooting

If you encounter issues:

1. **Authentication Fails**: 
   - Verify the backend API is running at the specified URL
   - Check that your credentials are correct
   - Check network connectivity

2. **API Requests Fail**:
   - Verify the token is valid
   - Check the API endpoint is correct
   - Ensure the backend is running and accessible
   - Look for detailed error messages in the console output

3. **No Assets Returned**:
   - There may not be any assets in the database
   - The user account may not have permission to view assets
   - Try creating assets first using the frontend

## How It Works

The scripts use `node-fetch` to make HTTP requests directly to the backend API. This bypasses any frontend proxy configuration issues and allows direct testing of the API.

The token is stored in a local file (`~/.nna-registry-ls-backup.json`) which is read by the test script if no token is provided as a command line argument.

## Next Steps

These scripts can be expanded to test other API endpoints or to automate testing of the backend API. Some ideas:

- Add support for creating assets directly via the API
- Add support for updating assets
- Add support for deleting assets
- Create a full test suite for the API