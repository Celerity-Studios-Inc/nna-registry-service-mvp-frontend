# This line triggers a build
# This line triggers a build - attempt 2
# This line triggers a build - attempt 3 - May 13, 2025
# This line triggers a build - attempt 4 - May 13, 2025 - Using registry.reviz.dev/api backend
# This line triggers a build - attempt 5 - May 13, 2025 - Subcategory display fix
# This line triggers a build - attempt 6 - May 13, 2025 - Sequential number display as .000 in preview
# This line triggers a build - attempt 7 - May 13, 2025 - Force REACT_APP_REAL_BACKEND_API=true
# This line triggers a build - attempt 8 - May 13, 2025 - Remove special case handling for S.POP.HPM

This file is created to trigger a new build and deployment of the NNA Registry Service Frontend.

## Deployment Details

- The frontend will be built and deployed to Vercel
- API URL: `/api` (routes to https://registry.reviz.dev/api/)
- Mock API: Disabled (REACT_APP_USE_MOCK_API=false)
- Real Backend: Enabled (REACT_APP_REAL_BACKEND_API=true)

## Verification Steps

After deployment, verify:
1. The frontend is accessible
2. Login works correctly
3. Asset registration works, especially with different subcategories
4. Subcategory selection is preserved correctly in the display
5. NNA addresses show the correct numeric codes
6. Warning alert appears for non-HPM subcategories
7. Info icon appears next to adjusted subcategory displays
8. Sequential numbers display as `.000` in the preview step
9. Actual sequential numbers appear correctly in the success screen
10. HFN and MFA are center-aligned in the success screen

## Latest Changes
- Remove special case handling for S.POP.HPM subcategory in assetService.ts
- Update codeMapping.ts to use generic approach for all subcategories
- Fix taxonomyService.ts to remove special case handling for S.POP.HPM
- All subcategories now use the same code path for conversion and registration