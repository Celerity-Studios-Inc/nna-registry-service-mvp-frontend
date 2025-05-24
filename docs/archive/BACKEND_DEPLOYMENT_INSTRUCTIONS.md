# Backend Deployment Instructions

This document provides step-by-step instructions for deploying the fixed NNA Registry Service backend, which addresses the subcategory normalization issue.

## Overview of the Fix

The backend fix addresses an issue where subcategories were being normalized to "Base" (BAS) when users selected non-HPM subcategories (LGF, LGM, DIV, IDF). The fix ensures all subcategories are correctly preserved during asset registration.

### Issue Description

The backend had an issue where subcategories were being normalized to "Base" (BAS) when users selected non-HPM subcategories. Specifically:

- Only S.POP.HPM combinations were preserved correctly
- Other subcategories (LGF, LGM, DIV, IDF) were normalized to BAS
- This caused inconsistencies between the frontend display and backend storage
- NNA addresses (MFA) were not correctly reflecting the chosen subcategory

### Root Cause

The root cause was identified in the `getNnaCodes()` function in `taxonomy.service.ts`:

1. When looking up subcategories, the function was primarily using name-based lookup
2. Special handling existed for S.POP.HPM but not for other subcategories
3. The normalization between alphabetic codes (HPM) and numeric codes (007) was inconsistent
4. Missing proper code mapping tables for lookups

### Fix Components

Key components of the fix:
- Added detailed code mapping tables for subcategories in `taxonomy.service.ts`:
  ```typescript
  private subcategoryCodeMap: Record<string, Record<string, Record<string, string>>> = {
    'S': {
      'POP': {
        '007': 'HPM', // Numeric to alphabetic
        'HPM': '007', // Alphabetic to numeric
        '004': 'LGF',
        'LGF': '004',
        '005': 'LGM',
        'LGM': '005',
        '002': 'DIV',
        'DIV': '002',
        '003': 'IDF',
        'IDF': '003',
        '006': 'ICM',
        'ICM': '006',
      },
      // Also handle numeric category code...
    }
  };
  ```
- Enhanced the lookup logic to handle both alphabetic and numeric codes
- Implemented normalization functions for consistent code handling
- Fixed the validation logic to properly recognize all subcategory combinations

## Deployment Steps

Follow these steps to deploy the fixed backend:

1. **Copy Deployment Files to Main Backend Directory**

   ```bash
   # Run the copy script from the frontend repo
   cd /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend
   ./copy-to-main-backend.sh
   ```

2. **Navigate to Main Backend Directory**

   ```bash
   cd /Users/ajaymadhok/nna-registry-workspace/nna-registry-service
   ```

3. **Check Git Branch**

   Ensure you're on the `stable-backend-new-key` branch which contains the fix:

   ```bash
   git branch
   ```

   If needed, switch to the correct branch:

   ```bash
   git checkout stable-backend-new-key
   git pull origin stable-backend-new-key
   ```

4. **Deploy the Backend**

   Run the deployment script:

   ```bash
   ./deploy-updated-backend.sh
   ```

   This script will:
   - Build the application
   - Create a Docker image
   - Deploy to Google Cloud Run
   - Output the service URL

5. **Test the Deployment**

   After deployment completes, run the test script to verify the fix:

   ```bash
   ./test-subcategory-fix.sh
   ```

   The test script will:
   - Test various subcategory combinations (HPM, LGF, LGM, DIV, IDF)
   - Verify that subcategories are correctly preserved
   - Check if the NNA addresses have the correct numeric codes

6. **Clean Up Unnecessary Files**

   After successful deployment and testing, clean up the backend build files from the frontend repo:

   ```bash
   cd /Users/ajaymadhok/nna-registry-workspace/nna-registry-service-mvp-frontend
   ./cleanup-backend-build.sh
   ```

## Frontend Integration

The frontend is already configured to connect to the deployed backend API at `https://registry.reviz.dev/api`. No changes are needed on the frontend side.

## Verification

After deployment, verify the fix by:

1. Using the frontend to register assets with different subcategory combinations
2. Checking that the subcategories are preserved in both the UI and the backend
3. Verifying that the MFA displays correctly show the appropriate numeric codes
4. Testing search functionality with the new subcategory values

## Troubleshooting

If you encounter issues:

1. **API Connection Issues**
   - Check the Cloud Run logs for any backend errors
   - Verify CORS settings are correct for frontend-backend communication

2. **Subcategory Still Being Normalized**
   - Check the taxonomy service logs for validation errors
   - Verify that the updated code is being used in the deployment

3. **Missing Test Image**
   - If the test script fails due to missing test image, create a simple 1x1 pixel JPG
   - You can use any small image file and rename it to `test-image.jpg`

4. **Authentication Issues**
   - Update the credentials in the test script if needed
   - Verify that the JWT authentication is working correctly

## Rollback Plan

If serious issues are encountered:

1. Revert to the previous deployment:
   ```bash
   gcloud run services update-traffic nna-registry-service --to-revisions=PREVIOUS_REVISION_ID=100
   ```

2. Document the issues encountered for further investigation