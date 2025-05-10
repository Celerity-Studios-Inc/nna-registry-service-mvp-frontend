# Search Feature Implementation Plan

This document outlines the plan for implementing advanced search functionality in the NNA Registry Service frontend.

## 1. Overview

The search feature will allow users to find assets using various criteria, including name, layer, category, subcategory, tags, and creation dates. The implementation will support both basic text search and advanced filtering options.

## 2. Architecture

### 2.1 Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│ UI          │     │ React State  │     │ API Service │     │ Backend API  │
│ Components  ├────►│ (Parameters) ├────►│ Functions   ├────►│ Endpoints    │
└─────┬───────┘     └──────────────┘     └─────────────┘     └──────────────┘
      │                                                             │
      │                                                             │
      │                      ┌──────────────┐                       │
      └─────────────────────┤ Search Results◄───────────────────────┘
                            └──────────────┘
```

### 2.2 API Integration

- Use existing endpoints `/api/assets` (GET) and `/api/assets/search` (POST)
- Extend `AssetSearchParams` interface to support all filter options
- Implement pagination and sorting parameters

### 2.3 Component Structure

```
SearchPage
├── SearchHeader
│   └── BasicSearchInput
├── FilterPanel
│   ├── LayerFilter
│   ├── CategoryFilter
│   ├── DateRangeFilter
│   └── TagFilter
├── SearchResults
│   ├── ResultsHeader (count, sorting)
│   ├── ResultsGrid/ResultsList
│   │   └── AssetCard
│   └── Pagination
└── EmptyState
```

## 3. Implementation Tasks

### 3.1 API & Types

| Task | Priority | Description |
|------|----------|-------------|
| ✅ Define search parameters interface | High | Extend `AssetSearchParams` in asset.types.ts |
| ✅ Implement asset service search methods | High | Add advancedSearch method to assetService.ts |
| Add pagination support | High | Implement pagination in API requests and UI |
| Add sorting parameters | Medium | Support sorting by various fields |

### 3.2 UI Components

| Task | Priority | Description |
|------|----------|-------------|
| Create basic search input | High | Input field with search button |
| Implement filter panel | High | Panel for all advanced filters |
| Create layer/category filters | High | Dropdown selectors for taxonomies |
| Add date range filter | Medium | Date pickers for created/modified dates |
| Implement tag filter | Medium | Multi-select with autocomplete |
| Create results grid/list view | High | Display search results |
| Add empty/loading states | Medium | Handle no results and loading states |
| Add sorting controls | Low | Dropdown for sort field/direction |

### 3.3 State Management

| Task | Priority | Description |
|------|----------|-------------|
| Create search context | Medium | Global state for search parameters |
| Implement URL query params | Medium | Enable shareable/bookmarkable searches |
| Add search history | Low | Store recent searches for quick access |
| Implement filter presets | Low | Allow saving common search filters |

## 4. Technical Details

### 4.1 Search Parameters Interface

```typescript
export interface AssetSearchParams {
  search?: string;            // Text search across name, description, etc.
  layer?: string;             // Layer code (e.g., "S", "M", "L")
  category?: string;          // Category code
  subcategory?: string;       // Subcategory code
  tags?: string[];            // Array of tags to filter by
  startDate?: Date | string;  // Created after date
  endDate?: Date | string;    // Created before date
  status?: string;            // Asset status
  sortBy?: string;            // Field to sort by
  sortOrder?: 'asc' | 'desc'; // Sort direction
  page?: number;              // Page number (1-based)
  limit?: number;             // Items per page
}
```

### 4.2 API Endpoints

```typescript
// Basic search with query parameters
async getAssets(params: AssetSearchParams): Promise<PaginatedResponse<Asset>> {
  try {
    const apiParams = this.prepareSearchParams(params);
    const response = await api.get<ApiResponse<PaginatedResponse<Asset>>>(
      '/assets',
      { params: apiParams }
    );
    return response.data.data;
  } catch (error) {
    // Handle errors
  }
}

// Advanced search with complex filters
async advancedSearch(params: AssetSearchParams): Promise<PaginatedResponse<Asset>> {
  try {
    const apiParams = this.prepareSearchParams(params);
    const response = await api.post<ApiResponse<PaginatedResponse<Asset>>>(
      '/assets/search',
      apiParams
    );
    return response.data.data;
  } catch (error) {
    // Handle errors
  }
}
```

### 4.3 Pagination Component

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (count: number) => void;
}

const PaginationControls: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages,
  onPageChange,
  // ...other props
}) => {
  // Implementation
};
```

## 5. Responsive Design

The search interface will be responsive:

- **Desktop**: Side-by-side layout with filter panel on left, results on right
- **Tablet**: Filter panel collapses to top with toggle
- **Mobile**: Filter panel becomes a modal, simplified results view

## 6. Performance Considerations

- Implement debounced search to avoid excessive API calls
- Use React Query for data fetching with caching
- Lazy load search results images
- Virtual scrolling for large result sets
- Memoize filter components to prevent unnecessary re-renders

## 7. Implementation Phases

### Phase 1: Core Search (MVP)
- Basic text search input
- Display search results in grid/list
- Implement pagination
- Layer/category/subcategory filters

### Phase 2: Advanced Filters
- Date range filters
- Tag filters with autocomplete
- Status filters
- Sorting options

### Phase 3: Enhanced Features
- Save searches
- Filter presets
- Search history
- Export search results
- URL parameter persistence

## 8. Testing Plan

| Test Type | Description |
|-----------|-------------|
| Unit Tests | Test individual filter components and search logic |
| Integration Tests | Test API integration and state management |
| E2E Tests | Test full search flows from UI to results |
| Performance Tests | Test with large result sets and complex filters |

## 9. Dependencies

- Material UI components for UI elements
- React Query for data fetching
- React Hook Form for filter state
- React Router for URL parameter handling

## 10. Timeline Estimate

| Phase | Time Estimate | Dependencies |
|-------|---------------|--------------|
| Core Search (MVP) | 1 week | None |
| Advanced Filters | 1 week | Core Search |
| Enhanced Features | 1 week | Advanced Filters |
| Testing & Refinement | 1 week | All phases |

Total estimated time: **4 weeks**

## 11. Next Steps

1. Implement the `AssetSearchParams` interface
2. Create basic search input component
3. Set up API service methods for search
4. Build results display components
5. Implement pagination controls
6. Begin work on filter components