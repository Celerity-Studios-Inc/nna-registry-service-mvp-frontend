# Backend API Analysis for Asset Creation

## Current Understanding

Based on our tests and error messages from the backend, we've identified several key requirements for asset creation:

### Required Fields

1. **layer**: Must be a valid layer code (e.g., 'S' for Stars)
2. **category**: Must be a valid category code for the layer (e.g., 'POP' for Pop)
3. **subcategory**: Must be a valid subcategory code for the layer and category
4. **description**: Cannot be empty
5. **source**: Required field (defaults to 'ReViz')
6. **file**: At least one file must be uploaded
7. **tags**: Must be a stringified JSON array

### Validation Constraints

1. **S.POP.HPM**: The backend rejects 'HPM' as a valid subcategory for S.POP, despite it being in our taxonomy
2. **S.POP.DIV**: The backend accepts 'DIV' as a valid subcategory for S.POP
3. **description**: The backend requires the description field to be non-empty

## Our Workaround Strategy

To handle these constraints, we've implemented two key workarounds:

1. **Subcategory Substitution**: When a user selects S.POP.HPM, we:
   - Display S.POP.HPM and use MFA 2.001.007.001 in the UI
   - But substitute 'DIV' for 'HPM' when sending data to the backend

2. **Description Default**: We ensure the description field is never empty by:
   - Using the user-provided description if available
   - Or generating a default description based on the asset properties

## Next Steps for Better Understanding

To better understand the backend's validation rules for asset creation, we've created a test script (`test-backend-validation.js`) that could be used to:

1. Test various S.POP subcategories to determine which ones are valid
2. Understand the exact validation rules being applied
3. Identify any other required fields or formats

This script requires a valid authentication token and can be run directly against the backend API.

## Future Improvements

1. **Backend Alignment**: Work with the backend team to align the taxonomy between frontend and backend
2. **Validation Documentation**: Document the exact validation rules for asset creation
3. **Improved Error Handling**: Better handling of validation errors with user-friendly messages
4. **Remove Workarounds**: Once the backend is updated to accept 'HPM' as a valid subcategory for S.POP, remove the workaround