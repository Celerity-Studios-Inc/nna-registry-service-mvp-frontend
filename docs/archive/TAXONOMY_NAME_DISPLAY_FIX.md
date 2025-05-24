# Taxonomy Name Display Fix

## Summary

This fix addresses issues with missing layer, category, and subcategory names in the taxonomy selection UI. It also reduces excessive console logging to improve the developer experience.

## Problems Fixed

1. **Missing Layer Names**: Layer cards were not consistently displaying human-readable names
2. **Missing Category Names**: Category cards were not showing proper category names
3. **Missing Subcategory Names**: Subcategory cards had similar naming issues
4. **Excessive Console Logging**: Too many logs were cluttering the console during normal operation

## Implementation Details

### 1. Centralized Naming Standards

- Created standardized layer name and description mappings in `logger.ts`
- All components now reference these single sources of truth

```typescript
export const STANDARD_LAYER_NAMES: Record<string, string> = {
  'G': 'Song',
  'S': 'Star',
  'L': 'Look',
  'M': 'Move',
  'W': 'World',
  'B': 'Beat',
  'P': 'Prop',
  'T': 'Training',
  'C': 'Character',
  'R': 'Rights'
};
```

### 2. Enhanced Name Fallbacks

- Added name fallback logic in `TaxonomyItem` component
- Implemented fallbacks for known categories and subcategories
- Added special handling for problematic combinations (e.g., S.POP)

### 3. Improved Logging System

- Added conditional logging helpers:
  - `verboseLog`: Only logs when verbose mode is explicitly enabled
  - `debugError`: For error logging in development only
- Added logging toggle in TaxonomyDebugger component

### 4. Robust Error Handling

- Added detailed diagnostics for missing names
- Implemented multi-tiered fallback strategies
- Added visual feedback when fallbacks are used

## Files Modified

1. `src/utils/logger.ts` - Added standard layer names and logging utilities
2. `src/components/taxonomy/TaxonomyItem.tsx` - Added name fallback logic
3. `src/components/taxonomy/LayerGrid.tsx` - Updated to use standard names
4. `src/components/taxonomy/CategoryGrid.tsx` - Enhanced with diagnostic logging
5. `src/components/taxonomy/SubcategoryGrid.tsx` - Added name verification
6. `src/components/asset/LayerSelectorV2.tsx` - Updated to use standard names
7. `src/hooks/useTaxonomy.ts` - Reduced unnecessary logging
8. `src/providers/taxonomy/TaxonomyDataProvider.tsx` - Added name fallbacks
9. `src/components/debug/TaxonomyDebugger.tsx` - Added verbose logging toggle

## Testing

The fix has been tested with various layer, category, and subcategory combinations to ensure names appear correctly in all parts of the UI. The verbose logging toggle provides an easy way to troubleshoot without cluttering the console during normal operation.

## Future Improvements

- Consider adding more comprehensive name mappings for all subcategories
- Implement automated testing for UI name display
- Add a dedicated taxonomy debugging panel for production troubleshooting