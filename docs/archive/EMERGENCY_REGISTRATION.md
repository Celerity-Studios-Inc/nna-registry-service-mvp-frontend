# Emergency Asset Registration

This document describes the Emergency Asset Registration feature that provides a fallback mechanism when the standard asset registration process encounters issues with the taxonomy system.

## Overview

The Emergency Asset Registration is designed to be a high-reliability fallback option for asset registration when the primary registration process fails due to taxonomy-related issues. It provides:

1. Direct access to taxonomy data through a simplified adapter
2. Manual data entry that bypasses complex UI interactions 
3. Special handling for known edge cases (S.POP.HPM and W.BCH.SUN)
4. Clearer error handling and feedback

## When to Use Emergency Registration

Use the Emergency Asset Registration ONLY when:

- The standard asset registration page fails to load taxonomy data
- Subcategories are disappearing or not displaying correctly
- You encounter errors related to "taxonomy data not found" or similar messages
- There are API errors when trying to submit an asset through the standard form
- The standard workflow doesn't allow you to complete all steps due to UI issues

## How to Access

There are two ways to access the Emergency Registration:

1. Through the left sidebar menu - look for the red "Emergency Registration" option at the bottom
2. By navigating directly to `/emergency-register` in your browser

## Key Features

The Emergency Registration provides:

### 1. Simplified Taxonomy Adapter

- Direct access to taxonomy data without complex UI states
- Flat data structure for better reliability
- Built-in handling of special cases like S.POP.HPM → 2.001.007

### 2. Streamlined UI

- One-page form with all options visible
- Clear preview of HFN and MFA codes
- Enhanced error messages and validation
- No multi-step wizards that can lose state

### 3. Error Handling

- Robust fallbacks for missing taxonomy data
- Enhanced logging for easier debugging
- Clear display of validation issues

## Important Notes

Assets registered through the Emergency Registration will:

- Be tagged with "emergency" to indicate they were registered through this process
- Have "Emergency Registration" set as the source
- Need to be verified later for complete taxonomy correctness

## Implementation Details

The Emergency Registration system consists of:

1. **EmergencyTaxonomyAdapter**: A simplified adapter that provides direct access to taxonomy lookups
2. **EmergencyTaxonomySelector**: A resilient UI component for selecting taxonomy categories
3. **EmergencyAssetRegistrationPage**: A streamlined registration form with improved error handling

## Future Improvements

Planned improvements for the Emergency Registration system:

1. Offline capability for registering assets when backend connectivity is limited
2. Better synchronization with standard registration to ensure consistency
3. Enhanced reporting for assets registered through emergency process
4. Administration tools to migrate emergency registrations to standard path

## Support

If you encounter issues with the Emergency Registration process, please:

1. Take screenshots of any error messages
2. Document the steps that led to needing the emergency registration
3. Contact support with these details to help improve the standard registration process

Remember: The Emergency Registration is a fallback solution. We aim to make the standard registration process reliable enough that this emergency option is rarely needed.