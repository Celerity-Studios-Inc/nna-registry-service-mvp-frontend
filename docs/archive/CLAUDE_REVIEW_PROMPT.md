# Claude Review Prompt - Register Asset Functionality

## Introduction

I'd like you to perform a thorough review of the NNA Registry Service MVP frontend codebase, focusing specifically on ensuring the Register Asset functionality works correctly for all layer types. So far, we have primarily tested the component with the Stars (S) layer, and we need to verify that it works properly for all other layers, especially composite layers like Training Data (T), Rights (R), Personalize (P), and most importantly Composite (C) layer.

## Repository Details

- Repository: https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend
- Main implementation branch: main
- Latest commit with taxonomy UI improvements: e1a5c66 (May 22, 2025)
- Comprehensive documentation: [TAXONOMY_UI_IMPROVEMENTS_SUMMARY.md](https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/TAXONOMY_UI_IMPROVEMENTS_SUMMARY.md)

## Context

We've recently implemented significant improvements to the taxonomy selection UI components:

1. Fixed text formatting in taxonomy cards with tooltips and proper truncation
2. Made debug panel only visible in development environment or with URL parameter
3. Enhanced taxonomy context displays to show full category names
4. Removed redundant layer information from the file upload section
5. Removed "Simplified Asset Registration" button from Dashboard

During testing, we discovered a critical issue where the backend always overrides the selected subcategory with "Base" regardless of what is selected by the user. We've documented this in [BACKEND_SUBCATEGORY_OVERRIDE_ISSUE.md](https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/BACKEND_SUBCATEGORY_OVERRIDE_ISSUE.md).

## Specific Review Areas

1. **Layer-Specific Logic Review**:
   - Review how the RegisterAssetPage handles different layer types
   - Identify any special cases for composite layers (T, R, P, C)
   - Check that proper file types are allowed for each layer
   - Verify that layer-specific forms appear when needed (e.g., TrainingDataCollection for T layer)

2. **Flow Validation**:
   - Analyze the complete registration flow for each layer type
   - Ensure steps are appropriate for each layer (e.g., T layer has Training Data step)
   - Verify proper state management throughout the flow
   - Check that FormData structure is appropriate for each layer

3. **Error Handling**:
   - Review error handling for layer-specific issues
   - Check for proper validation of layer-specific fields
   - Ensure feedback to users is clear and helpful

4. **Backend Integration**:
   - Review how layer-specific data is sent to the backend
   - Check that layer-specific metadata is properly structured
   - Verify handling of backend responses for different layers
   - Identify any issues with backend API integration

## Requested Analysis

Please provide:

1. **Layer-by-Layer Analysis**:
   - For each layer type (G, S, L, M, W, B, T, P, R, C), analyze the registration flow
   - Identify any issues or potential problems specific to each layer
   - Highlight differences in implementation between layers

2. **Focus on Composite Layer (C)**:
   - Special attention to the Composite layer functionality
   - Review the component selection step
   - Verify component validation and data structure
   - Check for any composite-specific UI or API issues

3. **Training Data Layer (T) Review**:
   - Analyze the training data collection step
   - Verify proper handling of prompts, images, and videos
   - Check data structure for training data submissions

4. **Implementation Recommendations**:
   - Suggest improvements to make layer handling more consistent
   - Identify any refactoring opportunities for better maintainability
   - Propose solutions for any identified issues

## Additional Context

We've also implemented Browse Assets and Search Assets functionality, which should be reviewed to ensure they properly display assets of all layer types. The search functionality should support filtering by layer, category, and subcategory.

We've identified a critical issue where the backend normalizes most subcategories to "Base" (BAS) in responses, regardless of what is selected by the user. Our detailed analysis found:

1. The backend's `subcategoryCodeMap` in `taxonomy.service.ts` only contains explicit mappings for special cases like HPM (Hipster Male)
2. Other subcategories don't have entries and fall back to a default value
3. The S.POP.HPM combination is explicitly mapped and works correctly, confirming the system can handle subcategories properly when mapped

We've implemented a frontend workaround using the SubcategoryDiscrepancyAlert component, but a proper backend fix will be required. This issue affects all layers, and should be considered when reviewing the codebase, especially for composite layers where subcategory selection is crucial for proper asset organization.

## Timeline

Please provide your analysis within the next 48 hours. If you need access to any additional files or have questions about specific components, please let me know.

Thank you for your help with this review!