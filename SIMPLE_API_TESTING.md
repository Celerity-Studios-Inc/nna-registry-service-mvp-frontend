# Simple API Testing Instructions

This guide explains how to use the simplified scripts to test the backend API.

## Step 1: Authenticate First

Run this command in Terminal:
```
node scripts/auth-api.mjs
```

When prompted:
- Enter your email (e.g., neouser18@neo.com)
- Enter your password

You'll see a message that the token has been saved.

## Step 2: Fetch Recent Assets

Run this command to see the 10 most recent assets:
```
node scripts/fetch-assets.mjs
```

This will show you the most recent assets in the system.

## Step 3: Search for Assets

Run this command to search for assets with a specific term:
```
node scripts/search-assets.mjs sunset
```

Replace "sunset" with any search term you want to use.

## Troubleshooting

If you encounter problems:

1. Make sure you ran the authentication script first
2. Check that you have an internet connection
3. Verify the backend API is running at https://registry.reviz.dev/api
4. Try authenticating again if your token might have expired

## What's Going On

These scripts:
1. Get your authentication token from a saved file
2. Connect directly to the backend API
3. Fetch or search for assets
4. Display the results in an easy-to-read format

The simplified scripts avoid using parameters that the backend doesn't support.