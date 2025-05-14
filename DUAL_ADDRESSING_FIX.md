# Dual Addressing System Fix

## Overview

This update implements a comprehensive solution for the NNA Registry Service's dual addressing system. The key improvement is switching from special-case handling to a generic, data-driven approach for converting between Human-Friendly Names (HFN) and Machine-Friendly Addresses (MFA).

## Problem

The system was experiencing several issues with its dual addressing system:

1. Urban category (003) wasn't correctly showing as "HIP" in HFN format
2. MFA for Worlds layer with Urban category showed as 5.001.001.000 instead of the correct 5.003.001.000
3. Special case S.POP.HPM required hardcoded handling in multiple places
4. Full category names (e.g., "Natural", "Modern_Performance") weren't being properly converted to 3-letter codes
5. Inconsistent display across preview, review, and success screens

## Solution

The solution comprises:

1. Enhanced Code Mapping Module (`codeMapping.enhanced.ts`):
   - Uses the taxonomy service for data-driven conversion between formats
   - Eliminates special case handling in favor of a generic approach
   - Provides consistent bidirectional conversion between HFN and MFA
   - Handles all input formats: full names, 3-letter codes, and numeric codes

2. Key Components Updates:
   - NNAAddressPreview: Uses enhanced formatter for consistent preview
   - ReviewSubmit: Uses enhanced formatter and removes special case warnings
   - RegisterAssetPage: Uses enhanced formatter for asset registration and success display

3. Testing & Deployment Utilities:
   - test-dual-addressing.js: Test script to verify all problem cases are resolved
   - install-enhanced-mapping.js: Script to install the enhanced solution
   - revert-code-mapping.js: Provides rollback capability if needed

## Implementation Details

The enhanced solution implements these key functions:

- `getCategoryAlphabeticCode`: Converts any category format to 3-letter code
- `getSubcategoryAlphabeticCode`: Converts any subcategory format to 3-letter code
- `getCategoryNumericCode`: Converts to numeric category code
- `getSubcategoryNumericCode`: Converts to numeric subcategory code
- `convertHFNToMFA`: Converts HFN address to MFA format
- `convertMFAToHFN`: Converts MFA address to HFN format
- `formatNNAAddressForDisplay`: Unified formatter for consistent display

## Benefits

- **Consistency**: Ensures consistent display of HFN and MFA across all components
- **Maintainability**: Eliminates special case handling in multiple components
- **Extensibility**: Makes it easier to add new layers, categories, and subcategories
- **Robustness**: Uses the taxonomy service as the single source of truth

## Testing

The solution has been tested with various problematic cases:

1. Standard Star cases (S.POP.BAS)
2. Previously problematic S.POP.HPM
3. Numeric representations (S.001.007)
4. Full name representations (S.Pop.Pop_Hipster_Male_Stars)
5. Worlds with HIP/Urban category
6. Worlds with Natural category
7. Looks with Modern_Performance category

All tests pass, demonstrating the comprehensive nature of the solution.

## Deployment

The changes are deployed to production and can be tested by:

1. Creating an asset with layer S, category POP, subcategory HPM
2. Creating an asset with layer W, category HIP (Urban)
3. Creating an asset with layer W, category NAT (Natural)
4. Creating an asset with layer L, category Modern_Performance

The changes ensure that all these cases display correctly in both HFN and MFA formats across all screens (preview, review, success).