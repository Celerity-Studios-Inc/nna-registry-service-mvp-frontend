# Taxonomy Code Analysis

This document provides a comprehensive analysis of how the taxonomy system works in the codebase, specifically focusing on how the mapping between taxonomy codes works without special case handling.

## GitHub Repository

All file paths reference the GitHub repository: https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend

## Key Files

The primary files responsible for taxonomy handling are:

1. `src/api/taxonomyService.ts` - Core service for taxonomy data access and lookup  
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/src/api/taxonomyService.ts

2. `src/api/codeMapping.ts` - Handles conversion between human-friendly and machine-friendly codes  
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/src/api/codeMapping.ts

3. `src/services/taxonomyConverter.ts` - Utility for taxonomy code conversion  
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/src/services/taxonomyConverter.ts

4. `src/types/taxonomy.types.ts` - Type definitions for taxonomy structures  
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/src/types/taxonomy.types.ts

5. `src/assets/enriched_nna_layer_taxonomy_v1.3.json` - Source taxonomy data  
   https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-frontend/blob/main/src/assets/enriched_nna_layer_taxonomy_v1.3.json

## How Taxonomy Mapping Works

The current implementation uses a combination of direct lookups and fallback mechanisms:

### 1. Direct Code Lookups

In `codeMapping.ts`, there are mapping tables that directly convert between human-friendly codes and numeric codes:

```typescript
// Human-friendly to numeric (categoryAlphaToNumeric)
'POP': '001',
'ROK': '002',
'HIP': '003',
// etc.

// Numeric to human-friendly (categoryNumericToAlpha)
'001': 'POP',
'002': 'ROK',
'003': 'HIP',
// etc.
```

### 2. Taxonomy Service Code Resolution

When direct lookup fails, `taxonomyService.ts` attempts to resolve codes by:

```typescript
// In taxonomyService.ts
getSubcategoryNumericCode(layerCode, categoryCode, subcategoryCode) {
  // 1. Try direct lookup from taxonomy data
  const subcategory = this.getSubcategory(layerCode, categoryCode, subcategoryCode);
  if (subcategory && subcategory.numericCode) {
    return subcategory.numericCode;
  }
  
  // 2. Try finding in subcategories list
  const subcategories = this.getSubcategories(layerCode, categoryCode);
  const match = subcategories.find(sc => sc.code === subcategoryCode);
  if (match) {
    return match.numericCode;
  }
  
  // 3. If the code is already numeric, use it directly
  if (/^\d+$/.test(subcategoryCode)) {
    return parseInt(subcategoryCode, 10);
  }
  
  // 4. Fallback to hash-based generation
  let hashCode = 0;
  for (let i = 0; i < subcategoryCode.length; i++) {
    hashCode = ((hashCode << 5) - hashCode) + subcategoryCode.charCodeAt(i);
    hashCode = hashCode & hashCode;
  }
  const fallbackCode = (Math.abs(hashCode) % 100) + 1;
  
  return fallbackCode;
}
```

### 3. Hash-Based Fallback Generation

When a code can't be found in the mapping tables or taxonomy data, the system generates a hash-based code:

```typescript
// Generate a hash from the string code
let hashCode = 0;
for (let i = 0; i < code.length; i++) {
  hashCode = ((hashCode << 5) - hashCode) + code.charCodeAt(i);
  hashCode = hashCode & hashCode;
}
// Generate a number between 1-100
const fallbackCode = (Math.abs(hashCode) % 100) + 1;
```

This is why "SUN" sometimes gets mapped to 77 instead of 003 - the hash function generates 77 for "SUN" when it can't find the mapping.

## Current Issues

The primary issues with the taxonomy mapping:

### 1. Incomplete Mapping Tables

The mapping tables in `codeMapping.ts` don't include complete entries for all layers, particularly for the World (W) layer categories and subcategories. For example:

```typescript
// Missing mappings in categoryAlphaToNumeric
'BCH': '004', // Beach is missing
'STG': '002', // Concert_Stages is missing

// Missing mappings in categoryNumericToAlpha
'004': 'BCH', // Beach numeric code mapping is missing
'002': 'STG', // Concert_Stages numeric code mapping is missing
```

### 2. Inconsistent Fallback Strategy

The fallback strategy can produce inconsistent results:

1. If the taxonomy data has the correct mapping for W.BCH.SUN (Beach.Sunset) as 004.003, but
2. The code can't find it in the mapping tables or lookups 
3. It falls back to hash-based generation, producing 77 for "SUN"
4. Result: Inconsistent NNA address (W.BCH.SUN.001 becomes 5.004.077.001 instead of 5.004.003.001)

### 3. Data-Driven vs. Hardcoded Mappings

The codebase uses a mix of:
- Hardcoded mapping tables (limited, not maintained)
- Dynamic lookups from taxonomy data (complete, but complex lookups)

## Proposed Solution

A more robust, data-driven solution without special case handling:

1. **Complete the mapping tables** with all layer/category/subcategory codes from the taxonomy data

2. **Prioritize taxonomy data lookups** over hardcoded tables:
   - First try to find the code in the taxonomy data
   - Only fall back to mapping tables when taxonomy lookup fails

3. **Cache resolved mappings** for better performance:
   - When a code is successfully resolved, cache the result
   - Use cached results for subsequent lookups

4. **Improve fallback with fuzzy matching**:
   - Search taxonomy by code and name similarity
   - Only use hash-based fallback as absolutely last resort

## Implementation Approach

The implementation should focus on a generic, data-driven approach without special case handling:

```typescript
// Example improved lookup function (pseudocode)
function resolveCode(layerCode, categoryCode, subcategoryCode) {
  // 1. Check cache first
  const cacheKey = `${layerCode}.${categoryCode}.${subcategoryCode}`;
  if (codeCache.has(cacheKey)) {
    return codeCache.get(cacheKey);
  }
  
  // 2. Try direct lookup from taxonomy
  const result = lookupInTaxonomy(layerCode, categoryCode, subcategoryCode);
  if (result) {
    codeCache.set(cacheKey, result);
    return result;
  }
  
  // 3. Try fuzzy search in taxonomy
  const fuzzyResult = fuzzySearchTaxonomy(layerCode, categoryCode, subcategoryCode);
  if (fuzzyResult) {
    codeCache.set(cacheKey, fuzzyResult);
    return fuzzyResult;
  }
  
  // 4. Fall back to mapping tables
  const mappingResult = lookupInMappingTables(layerCode, categoryCode, subcategoryCode);
  if (mappingResult) {
    codeCache.set(cacheKey, mappingResult);
    return mappingResult;
  }
  
  // 5. Last resort: generate code
  return generateFallbackCode(subcategoryCode);
}
```

## Files to Modify

1. `src/api/codeMapping.ts` - Add complete mapping tables for all layers
2. `src/api/taxonomyService.ts` - Improve code resolution logic to prioritize taxonomy data
3. `src/services/taxonomyConverter.ts` - Update to use the improved resolution approach

This approach eliminates the need for special case handling by making the system more robust and data-driven in its code resolution.