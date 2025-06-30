# Taxonomy V3 Implementation Plan

## Overview

This document outlines a practical implementation plan for integrating the new SimpleTaxonomySelectionV3 component into the main application workflow. The goal is to enhance the reliability of the taxonomy selection process while minimizing disruption to users.

## Background

The current taxonomy system has several pain points:

1. Inconsistent state management during layer/category/subcategory selection
2. Special case handling scattered across multiple components
3. Limited error recovery when taxonomy loading fails
4. Inadequate fallback mechanisms for problematic combinations

The SimpleTaxonomySelectionV3 component and enhancedTaxonomyService provide solutions to these issues with a multi-tiered fallback system, improved error handling, and a more consistent approach to taxonomy data.

## Implementation Strategy

### Phase 1: Preparation (Day 1)

1. **Create Feature Toggle System**
   - Implement a simple feature toggle mechanism in `src/utils/featureToggles.ts`
   - Add localStorage persistence for user preferences
   - Add URL parameter support for testing (`?taxonomyVersion=v3`)

2. **Update RegisterAssetPage**
   - Modify RegisterAssetPage to conditionally render either SimpleTaxonomySelectionV2 or V3
   - Preserve all existing functionality for V2 path
   - Add toggle UI for developers/testers

3. **Add Necessary Adapters**
   - Create adapter functions to convert between different data formats
   - Ensure form submission works with both V2 and V3 selected data

### Phase 2: Integration (Day 2)

4. **Connect V3 Component to Form State**
   - Update RegisterAssetPage to properly handle V3 component events
   - Enhance form validation to support both formats
   - Add special handling for edge cases

5. **Enhance Error Handling**
   - Add ErrorBoundary components around taxonomy selection
   - Implement recovery mechanisms for common errors
   - Add clear error messages for users

6. **Add Telemetry**
   - Implement basic usage tracking for V3 vs V2 performance
   - Add error tracking for troubleshooting
   - Create logger enhancements for better debugging

### Phase 3: Testing & Refinement (Day 3)

7. **Comprehensive Testing**
   - Test all known problematic combinations:
     - S.POP.HPM → 2.001.007.001
     - W.BCH.SUN → 5.004.003.001
     - All Layer+Category combinations with validation script
   - Test error scenarios and recovery mechanisms
   - Verify form submission with both V2 and V3 selections

8. **Performance Optimization**
   - Implement React.memo for pure components
   - Add useMemo/useCallback for expensive operations
   - Reduce unnecessary re-renders

9. **Documentation Updates**
   - Update technical documentation
   - Create user guidance for any UI changes
   - Document known issues and workarounds

### Phase 4: Rollout (Day 4)

10. **Gradual Enablement**
    - Enable V3 by default for internal users
    - Monitor error rates and performance
    - Prepare rollback plan if issues arise

11. **Full Deployment**
    - Remove V2 component if V3 proves stable
    - Clean up adapter code and temporary fixes
    - Remove feature toggle system

## Implementation Details

### Feature Toggle Implementation

```typescript
// src/utils/featureToggles.ts
export const FEATURE_TOGGLES = {
  TAXONOMY_V3: 'taxonomy_v3',
};

export function isFeatureEnabled(feature: string): boolean {
  // Check URL parameters first
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(feature)) {
    return urlParams.get(feature) === 'true';
  }
  
  if (feature === FEATURE_TOGGLES.TAXONOMY_V3) {
    if (urlParams.has('taxonomyVersion')) {
      return urlParams.get('taxonomyVersion') === 'v3';
    }
  }
  
  // Then check localStorage
  const storedValue = localStorage.getItem(`feature_${feature}`);
  if (storedValue) {
    return storedValue === 'true';
  }
  
  // Default values
  const defaults: Record<string, boolean> = {
    [FEATURE_TOGGLES.TAXONOMY_V3]: false,
  };
  
  return defaults[feature] || false;
}

export function setFeatureEnabled(feature: string, enabled: boolean): void {
  localStorage.setItem(`feature_${feature}`, enabled ? 'true' : 'false');
}
```

### RegisterAssetPage Updates

Key changes needed in RegisterAssetPage.tsx:

1. Import new components and utilities:
```typescript
import SimpleTaxonomySelectionV3 from '../components/asset/SimpleTaxonomySelectionV3';
import { isFeatureEnabled, FEATURE_TOGGLES, setFeatureEnabled } from '../utils/featureToggles';
```

2. Add state for feature toggle:
```typescript
const [useV3Taxonomy, setUseV3Taxonomy] = useState(() => 
  isFeatureEnabled(FEATURE_TOGGLES.TAXONOMY_V3)
);

// Toggle handler
const handleToggleTaxonomyVersion = () => {
  const newValue = !useV3Taxonomy;
  setUseV3Taxonomy(newValue);
  setFeatureEnabled(FEATURE_TOGGLES.TAXONOMY_V3, newValue);
};
```

3. Conditional rendering of taxonomy component:
```typescript
{activeStep === 1 && (
  <>
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            checked={useV3Taxonomy}
            onChange={handleToggleTaxonomyVersion}
            name="taxonomyV3Toggle"
            color="primary"
          />
        }
        label="Use Taxonomy V3"
      />
    </FormGroup>
    
    {useV3Taxonomy ? (
      <SimpleTaxonomySelectionV3
        selectedLayer={watchLayer}
        onLayerSelect={(layer) => setValue('layer', layer)}
        selectedCategoryCode={watchCategoryCode}
        onCategorySelect={(category) => setValue('categoryCode', category)}
        selectedSubcategoryCode={watchSubcategoryCode}
        onSubcategorySelect={(subcategory) => setValue('subcategoryCode', subcategory)}
      />
    ) : (
      <SimpleTaxonomySelectionV2
        layer={watchLayer}
        onCategorySelect={handleCategorySelect}
        onSubcategorySelect={handleSubcategorySelect}
      />
    )}
  </>
)}
```

### Adapter Functions

For converting between different data formats:

```typescript
// src/utils/taxonomyAdapters.ts
import { TaxonomyItem } from '../types/taxonomy.types';

/**
 * Adapts subcategory code from V3 format to V2 format if needed
 */
export function adaptSubcategoryCode(subcategoryCode: string, categoryCode: string): string {
  // V3 returns just the subcategory code (e.g., "BAS")
  // V2 might expect category.subcategory (e.g., "POP.BAS")
  if (!subcategoryCode) return '';
  
  // If already in format "CATEGORY.SUBCATEGORY", return as is
  if (subcategoryCode.includes('.')) return subcategoryCode;
  
  // Otherwise, prepend the category
  return categoryCode ? `${categoryCode}.${subcategoryCode}` : subcategoryCode;
}

/**
 * Extracts just the subcategory part from a code
 */
export function extractSubcategoryCode(fullCode: string): string {
  if (!fullCode) return '';
  
  // Handle both formats: "POP.BAS" and "BAS"
  return fullCode.includes('.') ? fullCode.split('.')[1] : fullCode;
}
```

## Testing Plan

### Critical Test Cases

1. **Special Case Mapping Tests**
   - S.POP.HPM.001 → 2.001.007.001
   - W.BCH.SUN.001 → 5.004.003.001

2. **Layer Switching Tests**
   - Rapidly switch between layers to test race conditions
   - Verify correct categories load for each layer
   - Check cleanup of previous selections

3. **Form Submission Tests**
   - Complete form with various taxonomy selections
   - Verify correct HFN/MFA generation
   - Check error handling during submission

4. **Recovery Tests**
   - Intentionally trigger errors and verify recovery
   - Test network failures during taxonomy loading
   - Verify fallback mechanisms activate correctly

### Test Script

```javascript
// scripts/test-taxonomy-v3.js
const testCases = [
  { layer: 'S', category: 'POP', subcategory: 'HPM', expectedMFA: '2.001.007' },
  { layer: 'W', category: 'BCH', subcategory: 'SUN', expectedMFA: '5.004.003' },
  { layer: 'G', category: 'POP', subcategory: 'BAS', expectedMFA: '1.001.001' },
  { layer: 'L', category: 'PRF', subcategory: 'BAS', expectedMFA: '3.001.001' },
];

// Run this in the browser console after loading the Register Asset page with V3 enabled
function testTaxonomyV3() {
  console.log('Running Taxonomy V3 tests...');
  
  // Test each case manually following this procedure:
  // 1. Select layer
  // 2. Select category
  // 3. Select subcategory
  // 4. Verify MFA in NNA Address Preview
  
  console.log('Test cases to verify:');
  testCases.forEach(test => {
    console.log(`${test.layer}.${test.category}.${test.subcategory} → ${test.expectedMFA}.xxx`);
  });
}

testTaxonomyV3();
```

## Rollback Plan

If issues arise with the V3 implementation, we can quickly roll back by:

1. Setting the default value of `TAXONOMY_V3` feature toggle to `false`
2. Ensuring the V2 path remains fully functional
3. Communicating to users that we've temporarily reverted to the previous implementation

Since the V2 components and logic remain in place during the integration phases, rollback should be straightforward if needed.

## Timeline

- **Day 1**: Preparation - Feature toggle system and RegisterAssetPage updates
- **Day 2**: Integration - Connect V3 component to form state and enhance error handling
- **Day 3**: Testing & Refinement - Comprehensive testing and performance optimization
- **Day 4**: Rollout - Gradual enablement and monitoring

## Conclusion

This implementation plan provides a structured approach to integrating SimpleTaxonomySelectionV3 while minimizing risk. By using a feature toggle system and preserving the existing implementation, we can gradually transition to the improved taxonomy selection system while maintaining the ability to quickly roll back if issues arise.

The multi-phase approach allows for thorough testing at each stage, ensuring that all edge cases and problematic combinations are handled correctly before full deployment.