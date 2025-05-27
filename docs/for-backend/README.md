# Backend Team Resources - NNA Registry Service

## Overview
This directory contains all frontend artifacts, code examples, and documentation needed by the backend team to implement proper NNA Registry Service backend support, specifically focusing on composite asset functionality.

## Directory Structure

```
/docs/for-backend/
├── README.md                           # This file
├── taxonomy/                           # Taxonomy data and lookup files
│   ├── enriched_nna_layer_taxonomy_v1.3.json  # Main taxonomy definition
│   ├── B_layer.ts                     # Branded layer lookups
│   ├── C_layer.ts                     # Composites layer lookups  
│   ├── G_layer.ts                     # Songs layer lookups
│   ├── L_layer.ts                     # Looks layer lookups
│   ├── M_layer.ts                     # Moves layer lookups
│   ├── P_layer.ts                     # Personalize layer lookups
│   ├── R_layer.ts                     # Rights layer lookups
│   ├── S_layer.ts                     # Stars layer lookups
│   ├── T_layer.ts                     # Training Data layer lookups
│   ├── W_layer.ts                     # Worlds layer lookups
│   └── constants.ts                   # Shared constants and utilities
├── code-artifacts/                    # Frontend code for reference
│   ├── assetService.ts                # Frontend asset API integration
│   ├── codeMapping.ts                 # HFN/MFA mapping utilities
│   ├── taxonomyService.ts             # Taxonomy service implementation
│   ├── taxonomyConverter.ts           # Taxonomy conversion utilities
│   ├── taxonomy.types.ts              # TypeScript interfaces for taxonomy
│   └── asset.types.ts                 # TypeScript interfaces for assets
├── api-examples/                      # API payload and response examples
│   ├── asset-creation-payloads.json   # Request/response examples
│   └── taxonomy-validation-examples.json # Validation requirements
└── documentation/                     # Implementation guides
    ├── COMPOSITE_ADDRESS_FORMAT_FIX.md
    ├── COMPOSITE_ASSETS_COMPLETE_IMPLEMENTATION.md
    ├── DUAL_ADDRESSING_IMPLEMENTATION.md
    └── NNA Implementation Plan Ver 1.0.3 - Slab.md
```

## CRITICAL ISSUE: Composite Asset Components

### Problem Summary
**Status**: BLOCKING - Composite asset registration workflow incomplete  
**Issue**: Component selection data not reaching backend API payload  
**Impact**: Success page shows `C.RMX.POP.005:` instead of `C.RMX.POP.005:S.FAN.BAS.001+L.VIN.BAS.001+M.BOL.FUS.001+W.FUT.BAS.001`

### Current API Behavior

#### What Frontend Sends (Incorrect)
```json
POST /api/assets
{
  "layer": "C",
  "category": "Music_Video_ReMixes",
  "subcategory": "Pop_ReMixes", 
  "components": []  // ← EMPTY ARRAY (PROBLEM)
}
```

#### What Backend Returns (Incorrect)
```json
{
  "success": true,
  "data": {
    "name": "C.RMX.POP.005:",  // ← Missing component addresses
    "components": [""]         // ← Empty array with empty string
  }
}
```

#### What Should Happen (Expected)
```json
// Expected Frontend Payload:
{
  "layer": "C",
  "category": "Music_Video_ReMixes", 
  "subcategory": "Pop_ReMixes",
  "components": [
    "S.FAN.BAS.001",
    "L.VIN.BAS.001",
    "M.BOL.FUS.001", 
    "W.FUT.BAS.001"
  ],
  "metadata": {
    "components": ["S.FAN.BAS.001", "L.VIN.BAS.001", "M.BOL.FUS.001", "W.FUT.BAS.001"],
    "componentCount": 4
  }
}

// Expected Backend Response:
{
  "success": true,
  "data": {
    "name": "C.RMX.POP.005:S.FAN.BAS.001+L.VIN.BAS.001+M.BOL.FUS.001+W.FUT.BAS.001",
    "components": ["S.FAN.BAS.001", "L.VIN.BAS.001", "M.BOL.FUS.001", "W.FUT.BAS.001"],
    "metadata": {
      "components": ["S.FAN.BAS.001", "L.VIN.BAS.001", "M.BOL.FUS.001", "W.FUT.BAS.001"],
      "componentCount": 4
    }
  }
}
```

## Backend Implementation Requirements

### 1. Composite Asset API Endpoint Enhancement

#### Required Changes to `POST /api/assets`
1. **Accept Components Array**: Handle `components` field in request payload
2. **Store Component References**: Save component HFNs/IDs in database
3. **Generate Composite Name**: Format as `C.XXX.XXX.001:component1+component2+component3`
4. **Return Component Data**: Include components in response for frontend display

#### Database Schema Requirements
```typescript
// Asset Model Enhancement
interface Asset {
  // ... existing fields
  components?: string[];  // Array of component HFNs (for C layer only)
  metadata?: {
    components?: string[];       // Backup component storage
    componentCount?: number;     // Number of components
    createdFrom?: string;        // "CompositeAssetSelection"
    // ... other metadata
  };
}
```

### 2. Taxonomy Validation Fix

#### Current Issue
Backend overrides user-selected subcategories with "Base" even when valid subcategories are provided.

#### Example Problem
```
Frontend sends: subcategory = "POP" 
Backend stores: subcategory = "Pop_ReMixes" ✅ (correct)

Frontend sends: subcategory = "EXP"
Backend stores: subcategory = "Base" ❌ (incorrect override)
```

#### Required Fix
Expand subcategory mapping tables to include all valid subcategories instead of defaulting to "Base". Reference `/taxonomy/` files for complete subcategory definitions.

### 3. HFN/MFA Address Generation

#### Composite Address Format
- **HFN Format**: `C.RMX.POP.001:S.FAN.BAS.001+L.VIN.BAS.001+M.BOL.FUS.001`
- **MFA Format**: `9.001.001.001:2.016.001.001+3.007.001.001+4.008.004.001`
- **Separator**: `:` between base and components, `+` between components
- **NO Brackets**: Do not use `[` `]` brackets in addresses

#### Implementation Logic
```typescript
// Pseudo-code for composite name generation
function generateCompositeAssetName(layer: string, category: string, subcategory: string, sequential: string, components: string[]): string {
  const baseAddress = `${layer}.${category}.${subcategory}.${sequential}`;
  if (components && components.length > 0) {
    return `${baseAddress}:${components.join('+')}`;
  }
  return baseAddress;
}
```

## Code References

### Frontend Implementation Files
- **Main Registration**: `/src/pages/RegisterAssetPage.tsx` (form handling)
- **Component Selection**: `/src/components/CompositeAssetSelection.tsx` (UI logic)
- **API Integration**: `/src/api/assetService.ts` (API calls)
- **Taxonomy Service**: `/src/services/taxonomyConverter.ts` (HFN/MFA conversion)

### Taxonomy Data Files
- **Primary**: `/taxonomy/enriched_nna_layer_taxonomy_v1.3.json`
- **Layer Lookups**: `/taxonomy/*_layer.ts` files (TypeScript implementations)
- **Constants**: `/taxonomy/constants.ts` (shared utilities)

### API Examples
- **Payloads**: `/api-examples/asset-creation-payloads.json`
- **Validation**: `/api-examples/taxonomy-validation-examples.json`

## Testing Scenarios

### Composite Asset Creation Test
1. **Frontend**: Select Layer C → RMX category → POP subcategory
2. **Components**: Select 4 components (S.FAN.BAS.001, L.VIN.BAS.001, M.BOL.FUS.001, W.FUT.BAS.001)
3. **Submit**: Click "Create Composite Asset"
4. **Expected Result**: Success page shows complete composite address

### Taxonomy Validation Test
```json
// Test cases to verify:
[
  {"layer": "S", "category": "POP", "subcategory": "HPM", "expected": "should NOT default to Base"},
  {"layer": "C", "category": "RMX", "subcategory": "POP", "expected": "should accept and store correctly"},
  {"layer": "L", "category": "VIN", "subcategory": "BAS", "expected": "should validate successfully"}
]
```

## Current Frontend Status

### Working Features ✅
- Layer selection and taxonomy navigation
- File upload and metadata handling  
- Component search and selection UI
- Success page composite address formatting (logic ready)

### Blocked Features ❌
- Component data reaching API payload
- Complete composite address display
- Proper component storage and retrieval

### Debugging in Progress 🔄
Frontend team has added comprehensive debugging (commit fdaf328) to identify why selected components aren't reaching the API payload. This is a frontend issue being actively investigated.

## Integration Points

### Required Backend API Endpoints
1. **`POST /api/assets`** - Enhanced for composite asset creation
2. **`GET /api/assets/search`** - Component search (working)
3. **`GET /api/assets/{id}`** - Asset retrieval with component data

### Expected Response Format
```typescript
interface AssetResponse {
  success: boolean;
  data: {
    _id: string;
    layer: string;
    category: string;
    subcategory: string;
    name: string;           // Composite format: "C.RMX.POP.001:comp1+comp2"
    nna_address: string;    // MFA format
    components?: string[];  // Component HFNs array
    metadata: {
      components?: string[];
      componentCount?: number;
      // ... other metadata
    };
    // ... other asset fields
  };
}
```

## Contact and Collaboration

### Frontend Team Status
- **Investigation**: Active debugging of component data flow
- **Commits**: Latest debug enhancements in commit fdaf328
- **Blocking Issue**: Component selection not reaching form submission

### Backend Team Action Items
1. **Review API Examples**: Check `/api-examples/` for expected payload formats
2. **Implement Component Storage**: Enhance asset model and API endpoints
3. **Fix Subcategory Mapping**: Expand taxonomy validation beyond "Base" default
4. **Test Integration**: Use provided test scenarios for validation

### Documentation References
- **Architecture**: `/documentation/NNA Implementation Plan Ver 1.0.3 - Slab.md`
- **Addressing System**: `/documentation/DUAL_ADDRESSING_IMPLEMENTATION.md`  
- **Composite Specification**: `/documentation/COMPOSITE_ASSETS_COMPLETE_IMPLEMENTATION.md`

This directory provides everything the backend team needs to implement proper composite asset support and resolve the current blocking issues.