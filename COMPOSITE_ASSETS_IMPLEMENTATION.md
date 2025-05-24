# Composite Assets Implementation Guide

This document provides comprehensive guidance for the composite assets feature implementation in the NNA Registry Service MVP Frontend.

## Overview

The composite assets feature allows users to create aggregated multi-layer datasets by combining multiple component assets. This implementation follows the NNA Framework whitepaper specifications for composite asset creation, validation, and management.

## Architecture

### Components

#### 1. AssetSearch Component (`src/components/AssetSearch.tsx`)
- **Purpose**: Reusable search component for discovering component assets
- **Features**: 
  - 300ms debounced search
  - Layer filtering for compatible layers (G, S, L, M, W, B, P)
  - Material-UI interface with loading states
- **Props**:
  ```typescript
  interface AssetSearchProps {
    onAssetSelect: (asset: Asset) => void;
    searchParams: { query: string; layer: string };
    setSearchParams: (params: { query: string; layer: string }) => void;
  }
  ```

#### 2. CompositeAssetSelection Component (`src/components/CompositeAssetSelection.tsx`)
- **Purpose**: Main component for composite asset creation workflow
- **Features**:
  - Component compatibility validation
  - Composite HFN generation
  - Preview generation with performance monitoring
  - Rights verification integration
  - Registration with metadata handling

### Data Flow

```
User Search → AssetSearch → Component Selection → Validation → Registration/Preview
```

## Implementation Steps

### Step 1: Component Extraction ✅
- Extracted component selection logic into reusable `AssetSearch.tsx`
- Created `CompositeAssetSelection.tsx` using the new search component
- Added debounced search with layer filtering

### Step 2: Component Compatibility Validation ✅
- Added `validateComponents` function checking layer membership in `['G', 'S', 'L', 'M', 'W', 'B', 'P']`
- Implemented Continue button triggering validation before submission
- Added Material-UI Alert display for validation errors with error severity

### Step 3: Rights Management Integration (SKIPPED)
- Skipped due to Clearity service not being implemented yet
- Placeholder rights verification code remains for future integration

### Step 4: Composite HFN and Metadata Support ✅
- Implemented `generateCompositeHFN` function creating HFNs in format: `C.[CategoryCode].[SubCategoryCode].[Sequential]:[Component IDs]`
- Added `registerCompositeAsset` function calling `/v1/asset/register` with proper payload
- Enhanced Asset interface to include `components?: string[]` for composite assets
- Implemented HTTP 409 error handling for duplicate HFNs
- Added comprehensive metadata including component count and total size

### Step 5: Preview Generation Optimization ✅
- Optimized preview generation to meet <2s performance target (Section 6.6)
- Added comprehensive performance logging with `performance.now()`
- Implemented optimization parameters in API requests
- Enhanced error handling with timeout and service status detection

## API Integration

### Registration Endpoint
```typescript
POST /v1/asset/register
{
  layer: 'C',
  category: '001',
  subcategory: '001',
  sequential: '001',
  components: 'G.POP.TSW.001,S.POP.PNK.001', // Comma-separated
  metadata: {
    components: ['G.POP.TSW.001', 'S.POP.PNK.001'], // Array format
    componentCount: 2,
    totalSize: 1048576,
    createdFrom: 'CompositeAssetSelection'
  },
  name: 'C.001.001.001:G.POP.TSW.001+S.POP.PNK.001',
  friendlyName: 'C.001.001.001:G.POP.TSW.001+S.POP.PNK.001'
}
```

### Preview Endpoint
```typescript
POST /v1/asset/preview
{
  components: ['asset-id-1', 'asset-id-2'],
  format: 'mp4',
  quality: 'preview',
  optimization: {
    targetDuration: 2000,
    compression: 'medium',
    resolution: '720p',
    fastMode: true
  }
}
Headers: {
  'X-Performance-Target': '2000ms',
  'X-Component-Count': '2'
}
```

## Validation Rules

### Component Compatibility
- **Allowed Layers**: G, S, L, M, W, B, P only
- **Minimum Components**: At least 2 components required
- **Maximum Components**: Up to 10 components allowed
- **No Duplicates**: Same component cannot be added twice

### HFN Format
- **Pattern**: `C.[CategoryCode].[SubCategoryCode].[Sequential]:[Component IDs]`
- **Example**: `C.001.001.001:G.POP.TSW.001+S.POP.PNK.001`
- **Component Separator**: `+` character between component HFNs

## Performance Monitoring

### Preview Generation
- **Target**: <2s generation time (Section 6.6)
- **Monitoring**: `performance.now()` timing with console logging
- **Warnings**: Automatic warnings when exceeding 2s target
- **Optimizations**: 720p resolution, medium compression, fast mode

### Logging Examples
```typescript
// Success
console.log(`✅ Preview generation met performance target: 1234.56ms < 2000ms`);

// Warning
console.warn(`⚠️ Preview generation exceeded 2s target: 2345.67ms (target: <2000ms)`);
```

## Error Handling

### Registration Errors
- **HTTP 409**: "HFN conflict: A composite with this combination already exists"
- **Validation**: Component compatibility and minimum requirements
- **Network**: Timeout and service availability handling

### Preview Errors
- **Timeout**: "Preview generation timed out - please try again"
- **Service Busy**: "Preview service is busy - please wait and try again"
- **Service Down**: "Preview service is temporarily unavailable"

## Testing

### Unit Tests (`src/components/__tests__/CompositeAssetSelection.test.tsx`)
- ✅ Composite HFN generation validation
- ✅ HTTP 409 duplicate handling
- ✅ Component compatibility validation
- ✅ Minimum components requirement
- ✅ Metadata inclusion in registration
- ✅ Fast preview generation (<2s)
- ✅ Slow preview warning logging
- ✅ Performance optimization headers

### Test Commands
```bash
# Run all composite asset tests
npm test -- --testPathPattern="CompositeAssetSelection" --watchAll=false

# Run specific test
npm test CompositeAssetSelection

# Build project
npm run build
```

## Future Enhancements

### Rights Management Integration
When Clearity service becomes available:
1. Uncomment rights verification calls in `handleAddComponent`
2. Implement proper rights status handling
3. Add rights-specific error messages
4. Update UI to show rights verification status

### Performance Optimizations
- Implement client-side preview caching
- Add progressive preview loading
- Optimize component thumbnail generation
- Implement background preview generation

## Troubleshooting

### Common Issues

1. **Components Not Loading**
   - Check backend connectivity
   - Verify layer filtering is working
   - Check console for API errors

2. **Validation Errors**
   - Ensure components are from allowed layers
   - Check minimum component requirement (2+)
   - Verify no duplicate components

3. **Preview Generation Slow**
   - Check network connectivity
   - Monitor console for performance warnings
   - Verify backend optimization support

4. **Registration Failures**
   - Check for HFN conflicts (HTTP 409)
   - Verify component metadata format
   - Check backend registration endpoint

### Debug Tools
- Console logging for performance monitoring
- React DevTools for component state inspection
- Network tab for API request monitoring
- Error boundary for graceful error handling

## Contributing

When making changes to composite assets:

1. **Follow Existing Patterns**: Use established validation and error handling patterns
2. **Update Tests**: Add tests for new functionality
3. **Performance Monitoring**: Include timing and logging for new operations
4. **Documentation**: Update this guide for significant changes
5. **Error Handling**: Implement comprehensive error handling with user feedback

## References

- NNA Framework Whitepaper Section 2.3.2 (Composite HFN Format)
- NNA Framework Whitepaper Section 1.3.3 (Components Metadata)
- NNA Framework Whitepaper Section 6.6 (Performance Targets)
- Asset Types Interface: `src/types/asset.types.ts`
- Component Search: `src/components/AssetSearch.tsx`
- Main Implementation: `src/components/CompositeAssetSelection.tsx`