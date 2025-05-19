# Deployment Testing Guide

This guide provides instructions for testing the deployment of the NNA Registry Service MVP Frontend.

## Accessing the Deployed Application

### Development Environment
- URL: https://nna-registry-service-mvp-frontend.vercel.app/
- This is the main development deployment environment

### Production Environment (if applicable)
- URL: https://nna-registry.example.com/
- This is the production deployment environment

## Test Account Credentials

For testing purposes, you can use the following test accounts:

**Standard User**
- Username: `test@example.com`
- Password: `TestPassword123`

**Admin User** (if needed)
- Username: `admin@example.com`
- Password: `AdminPassword123`

## Testing New Features & Fixes

### 1. Subcategory Selection Fix

This fix addresses issues with subcategories disappearing during selection. To test:

1. Log in to the application
2. Navigate to "Register Asset"
3. Select a layer (e.g., "S" for Star)
4. Click "Next" to proceed to taxonomy selection
5. Select a category (e.g., "POP" for Popular)
6. Select a subcategory (e.g., "HPM" for Hipster Male)
7. Verify the subcategory remains selected
8. Navigate forward and backward through steps to ensure selection persists

### 2. Step Navigation Fix

This fix ensures that double-clicking a layer doesn't skip Step 2. To test:

1. Log in to the application
2. Navigate to "Register Asset"
3. Double-click on any layer card
4. Verify you are taken to Step 2 (Choose Taxonomy), not skipped to Step 3
5. Confirm category selection is displayed properly

### 3. Grid Layout Fix

This fix ensures subcategories display in a proper grid layout. To test:

1. Log in to the application
2. Navigate to "Register Asset" and proceed to Step 2
3. Select a category that has multiple subcategories
4. Verify subcategory cards are arranged in a grid (multiple columns)
5. Resize your browser window to test responsiveness

### 4. Form Validation

Verify improved form validation in the asset registration process:

1. Complete all steps except one required field
2. Proceed to "Review & Submit"
3. Verify clear error messages indicate what's missing
4. Fix the issue and confirm successful submission

## Browser Compatibility

Test the application in multiple browsers to ensure compatibility:
- Chrome (latest version)
- Firefox (latest version)
- Safari (if available)
- Edge (if available)

## Performance Testing

1. **Navigation Speed**: Move quickly between pages and verify responsive loading
2. **Asset Registration**: Complete the full registration process and measure time
3. **Search Functionality**: Test search performance with various queries
4. **UI Responsiveness**: Verify no lag when interacting with components

## Error Reporting

If you encounter any issues during testing:

1. Take a screenshot of the error
2. Note the exact steps to reproduce
3. Record any error messages shown in the UI
4. Check browser console for additional error details (F12 > Console)
5. Document the browser and device used

## Tracking Test Results

Use the CI_CD_278_TEST_CHECKLIST.md file to track your test results:
1. Update the status column for each test case (Pass/Fail)
2. Add detailed notes for any issues found
3. Document any edge cases or unexpected behavior

## Reporting Issues

Report any issues found during testing:
1. Create a new issue in the project repository
2. Use the title format: "[CI/CD #278] Issue description"
3. Include detailed reproduction steps
4. Attach screenshots if applicable
5. Label the issue appropriately (bug, UI, performance, etc.)