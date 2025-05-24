# NNA Registry Service - Taxonomy System

## Overview

The taxonomy system is a core component of the NNA Registry Service, organizing digital assets into a hierarchical structure of layers, categories, and subcategories. This system is critical for generating the dual addressing system (HFN and MFA) that uniquely identifies each asset.

## Taxonomy Structure

The taxonomy follows a three-level hierarchy:

1. **Layer**: Top-level division (e.g., Stars, Looks, Moves)
2. **Category**: Mid-level classification within a layer (e.g., Pop, Rock, Jazz)
3. **Subcategory**: Detailed classification within a category (e.g., Base, Experimental)

## Data Model

Each taxonomy item has the following properties:

```typescript
interface TaxonomyItem {
  code: string;           // Human-readable code (e.g., "POP")
  name: string;           // Display name (e.g., "Pop")
  numericCode: string;    // Numeric code for MFA (e.g., "001")
  description?: string;   // Optional description
}
```

## Implementation Evolution

The taxonomy system has gone through several iterations of improvement:

### Original Implementation
- Simple direct mapping
- Limited error handling
- Issues with certain taxonomy combinations

### Enhanced Implementation
- Robust error handling with fallbacks
- Multi-tiered data lookup strategy
- Session storage for resilience
- Special case handling for problematic combinations

### Current Implementation
- React component architecture
- Provider pattern for data management
- Stateless UI components
- Comprehensive error handling and recovery

## Components

### TaxonomyDataProvider
Central data provider that handles:
- Loading taxonomy data
- Caching for performance
- Error handling and recovery
- Special case mapping

### TaxonomySelector
Main UI component that provides:
- Layer, category, subcategory selection
- Visual feedback for selection state
- Error display and recovery options
- Selection preservation

### LayerGrid, CategoryGrid, SubcategoryGrid
Specialized grid components for displaying:
- Available options at each level
- Visual indication of selected items
- Loading and error states
- Empty state handling

## Services

### enhancedTaxonomyService
Core service that provides:
- Taxonomy data loading
- Error handling and recovery
- Fallback mechanisms
- Special case handling

### simpleTaxonomyService
Basic service that provides:
- Direct taxonomy data access
- Simple mapping functions
- Foundation for enhanced service

## Hooks

### useTaxonomy
Custom hook that provides:
- Access to taxonomy data and state
- Selection operations
- Loading and error state
- Synchronization with TaxonomyContext

## Error Handling Strategies

The taxonomy system implements multiple error handling strategies:

1. **Multi-tiered Data Sources**
   - Primary: TaxonomyContext data
   - Secondary: Direct service call
   - Tertiary: Local component state
   - Quaternary: Session storage

2. **Fallback Mechanisms**
   - Default subcategory generation
   - Special case mapping
   - Emergency static data

3. **Error Recovery**
   - Automatic retry mechanisms
   - Manual retry options
   - State restoration from backup

4. **User Feedback**
   - Clear error messages
   - Loading indicators
   - Recovery suggestions

## Special Cases

The system handles several special cases that required custom implementation:

1. **S.POP.HPM (Star Pop Hipster Male)**
   - Special mapping to MFA: 2.001.007.001
   - Custom display name handling

2. **W.BCH.SUN (World Beach Sunset)**
   - Special mapping to MFA: 5.004.003.001
   - Custom numeric code assignment

## Known Limitations

Current limitations of the taxonomy system:

1. Performance with very large taxonomy datasets
2. Occasional UI glitches during rapid selection changes
3. Limited support for taxonomy data updates at runtime
4. Edge cases in certain layer/category combinations

## Future Improvements

Planned improvements for the taxonomy system:

1. Dynamic taxonomy data loading from API
2. Improved caching mechanism
3. Better visual feedback for selection state
4. Enhanced error recovery options