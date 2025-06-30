# Taxonomy Service Guidelines

## 🚨 CRITICAL: Always Use Correct Taxonomy Service

This document provides essential guidelines for working with taxonomy services in the NNA Registry Frontend to avoid subcategory dropdown failures and ensure consistent functionality.

## Background: The Issue

On June 15, 2025, we discovered that several components were using an old taxonomy service (`../../api/taxonomyService`) which caused:
- **Empty subcategory dropdowns** for all layer combinations
- **Inconsistent behavior** between registration and search flows  
- **Missing error handling** and fallback mechanisms

**Root Cause**: The old service used different data sources and lacked the robust error handling present in the enhanced services.

## ✅ CORRECT Services to Use

### 1. For Core Taxonomy Data Operations

**Use `enhancedTaxonomyService`** for dropdown population, layer/category/subcategory selection:

```typescript
import {
  getLayers,
  getCategories,
  getSubcategories
} from '../../services/enhancedTaxonomyService';

// Usage examples:
const layers = getLayers(); // Returns string[]
const categories = getCategories('S'); // Returns TaxonomyItem[]
const subcategories = getSubcategories('S', 'RCK'); // Returns TaxonomyItem[]
```

### 2. For Taxonomy Formatting and Conversion

**Use `simpleTaxonomyService`** for display formatting, HFN/MFA conversion:

```typescript
import { taxonomyService } from '../../services/simpleTaxonomyService';

// Usage examples:
const hfn = taxonomyService.convertMFAtoHFN('2.002.003.001');
const mfa = taxonomyService.convertHFNtoMFA('S.RCK.RSM.001');
const path = taxonomyService.getTaxonomyPath(layer, category, subcategory);
```

## ❌ INCORRECT Service (DO NOT USE)

**Never use the old taxonomy service:**

```typescript
// ❌ WRONG - Will cause dropdown failures
import taxonomyService from '../../api/taxonomyService';
```

## Required Data Transformations

The enhanced services return different data types than expected by some components. Transform as needed:

### Transform Layers (string[] → LayerOption[])

```typescript
const layerCodes = getLayers();

// Layer names mapping
const LAYER_NAMES: Record<string, string> = {
  G: 'Songs',
  S: 'Stars', 
  L: 'Looks',
  M: 'Moves',
  W: 'Worlds',
  B: 'Branded',
  P: 'Personalize',
  T: 'Training_Data',
  C: 'Composites',
  R: 'Rights'
};

// Transform to expected format
const layers = layerCodes.map(code => ({
  id: code,
  code: code,
  name: LAYER_NAMES[code] || code
}));
```

### Transform Categories/Subcategories (TaxonomyItem[] → CategoryOption[])

```typescript
const taxonomyItems = getCategories(selectedLayer);

// Transform to expected format
const categories = taxonomyItems.map(item => ({
  id: item.code,
  code: item.code,
  name: item.name,
  numericCode: item.numericCode
}));
```

## Files Already Updated ✅

- `/src/components/search/AssetSearch.tsx` - **FIXED** (commit d172939)

## Files Still Needing Updates ⚠️

### High Priority (Core Functionality)
1. **AssetCard.tsx** - Line 28
   - **Location**: `/src/components/asset/AssetCard.tsx`
   - **Usage**: Display formatting for asset cards
   - **Fix**: Replace with `simpleTaxonomyService` for formatting functions

2. **AssetDetailPage.tsx** - Line 31  
   - **Location**: `/src/pages/AssetDetailPage.tsx`
   - **Usage**: Display formatting for asset detail view
   - **Fix**: Replace with `simpleTaxonomyService` for formatting functions

3. **TaxonomySelection.tsx** - Line 19
   - **Location**: `/src/components/asset/TaxonomySelection.tsx`
   - **Usage**: Core taxonomy selection component
   - **Fix**: Replace with `enhancedTaxonomyService` for data operations

4. **LayerSelection.tsx** - Line 20
   - **Location**: `/src/components/asset/LayerSelection.tsx`
   - **Usage**: Layer selection component
   - **Fix**: Replace with `enhancedTaxonomyService` for layer data

### Lower Priority (Test Files)
- `/src/services/taxonomyConverter.test.ts` - Line 3
- `/src/pages/TaxonomyComparisonTest.tsx` - Line 12

## Testing Guidelines

When updating components:

1. **Test dropdown population** - Ensure all layer → category → subcategory combinations work
2. **Test data transformation** - Verify transformed data matches expected interfaces
3. **Test error handling** - Confirm graceful fallback behavior
4. **Test consistency** - Ensure behavior matches working components like SimpleTaxonomySelectionV3

## Validation Checklist

Before deploying taxonomy service changes:

- [ ] Import statements use correct service paths
- [ ] Data transformation applied where needed
- [ ] TypeScript compilation succeeds
- [ ] Dropdown population works for all layers
- [ ] Error handling maintains graceful degradation
- [ ] Behavior consistent with working registration flow

## Working Examples

### AssetSearch.tsx (Fixed Implementation)
See commit d172939 for complete working example of:
- Correct import statements
- Proper data transformation
- Error handling integration
- TypeScript interface compliance

### SimpleTaxonomySelectionV3.tsx (Reference Implementation)
This component uses the correct services and provides a reference for:
- Multiple fallback mechanisms
- Robust error handling  
- Consistent data loading patterns

## Success Metrics

After implementing correct taxonomy services:
- ✅ All layer combinations populate subcategories correctly
- ✅ Search and registration flows behave consistently
- ✅ Error handling provides graceful degradation
- ✅ TypeScript compilation succeeds without interface mismatches
- ✅ User experience is smooth and reliable

## Questions?

If you encounter issues with taxonomy service implementation:
1. Check this document for correct import patterns
2. Reference working components (AssetSearch, SimpleTaxonomySelectionV3)
3. Verify data transformation is applied correctly
4. Test with multiple layer combinations to ensure reliability

---

**Last Updated**: June 15, 2025  
**Related Commit**: d172939 - AssetSearch taxonomy service fix  
**Verification**: CI/CD #582 - All layer combinations working in production