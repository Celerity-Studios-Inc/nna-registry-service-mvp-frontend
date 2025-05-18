# Taxonomy Context Fix

## Problem Description

The asset registration functionality was experiencing an infinite rendering loop when selecting a layer. After investigating the code, three main issues were identified:

1. **Multiple Taxonomy Instances**: Each component (AssetRegistrationWrapper, RegisterAssetPage, SimpleTaxonomySelectionV2) was creating its own instance of the `useTaxonomy` hook, resulting in multiple sources of truth.

2. **Circular State Updates**: When SimpleTaxonomySelectionV2 received a layer prop from its parent and called `selectLayer` on its own taxonomy instance, it updated its state, triggering a re-render of the parent, creating a loop.

3. **Inefficient Session Storage**: RegisterAssetPage was checking and setting session storage on every render, causing additional unnecessary re-renders.

## Solution

The solution implemented introduces a React Context to ensure a single source of truth for taxonomy data across components. This approach follows the React Context API pattern for sharing state between components without prop drilling.

### Implementation Details

1. **Created TaxonomyContext Provider**:
   - Implemented a `TaxonomyContext` to share a single instance of `useTaxonomy` across components
   - The provider wraps the RegisterAssetPage component, ensuring all child components access the same taxonomy state

2. **Modified Component Integration**:
   - Updated AssetRegistrationWrapper to provide the taxonomy context
   - Modified SimpleTaxonomySelectionV2 to consume the shared context instead of creating its own instance
   - Updated RegisterAssetPage to access the shared taxonomy state

3. **Added Diagnostic Tools**:
   - Implemented logging functions to track taxonomy state changes
   - Added configurable logging to help debug state issues
   - Created components with debugging capabilities that can be enabled in development

### Benefits

1. **Prevents Multiple Instances**: Only one instance of `useTaxonomy` is created and shared
2. **Eliminates Circular Updates**: State changes are coordinated through a single source
3. **Improves Performance**: Reduces unnecessary re-renders
4. **Enhances Maintainability**: Follows React best practices for state management
5. **Simplifies Debugging**: Added logging capabilities help troubleshoot state issues

## Files Modified

- `/src/contexts/TaxonomyContext.tsx` (new file)
- `/src/components/AssetRegistrationWrapper.tsx`
- `/src/components/asset/SimpleTaxonomySelectionV2.tsx`
- `/src/pages/RegisterAssetPage.tsx`

## Special Cases

The implementation maintains special case handling for critical taxonomy mappings:

- `W.BCH.SUN.001` → `5.004.003.001` (Beach World)
- `S.POP.HPM.001` → `2.001.007.001` (Pop Hipster Male Star)

These mappings work correctly through the context-based approach, ensuring consistent code conversion across the application.

## Testing Notes

The implementation includes diagnostic tools that can be enabled in development mode:

```typescript
const taxonomyContext = useTaxonomyContext({
  componentName: 'ComponentName',
  enableLogging: process.env.NODE_ENV === 'development'
});
```

This will log all taxonomy state changes to help identify any remaining issues.

## Future Improvements

1. Add comprehensive unit tests for the TaxonomyContext
2. Implement performance optimizations with React.memo and useMemo
3. Consider adding error boundaries specific to taxonomy operations
4. Add more detailed logging for critical operations