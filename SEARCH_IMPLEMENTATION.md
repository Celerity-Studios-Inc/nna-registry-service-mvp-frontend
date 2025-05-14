# Search Feature Implementation

This document outlines the implementation of search functionality in the NNA Registry Service frontend application.

## Overview

The search feature allows users to find assets using various criteria, including name, layer, category, subcategory, tags, and date ranges. It supports both basic text search and advanced filtering options.

## Recent Bugfixes (May 14, 2025)

A critical bug was fixed related to backend API response handling. The frontend was expecting the asset search API response in one format, but the backend was returning data in a different format, causing the search functionality to fail.

### Issue Details
The frontend components were expecting the asset search API response to return data in the format:
```json
{
  "data": [...assets...],
  "pagination": { "total": number, "page": number, "limit": number, "pages": number }
}
```

However, the backend API was actually returning data in the format:
```json
{
  "success": true,
  "data": {
    "items": [...assets...],
    "total": number,
    "page": number,
    "limit": number
  }
}
```

This mismatch caused the search functionality to show "Received empty or invalid results from assets search" even when results were actually returned by the API.

### Fix Implemented
The solution involved updating several components to handle both response formats:

1. **AssetSearch.tsx**: Updated to handle both response structures when loading initial assets and when performing searches.
2. **SearchAssetsPage.tsx**: Modified to handle both response formats when loading assets on the page.
3. **assetService.ts**: Enhanced the `getAssets()` method to normalize API responses into a consistent format regardless of the input structure.

## Implementation Steps

### 1. API Integration

- [x] Define search parameters interface in `types/asset.types.ts`
- [x] Implement `getAssets` method with search parameters in `assetService.ts`
- [x] Add advanced search method in `assetService.ts`
- [ ] Add pagination support in API requests

### 2. UI Components

- [x] Create basic search input component
- [ ] Implement advanced search filter panel
  - [ ] Layer filter dropdown
  - [ ] Category/subcategory filter dropdowns
  - [ ] Tag filter with autocomplete
  - [ ] Date range picker
  - [ ] Status filter
- [ ] Create search results grid/list view
- [ ] Implement pagination controls
- [ ] Add sorting options

### 3. Search Results Page

- [ ] Create `SearchResultsPage.tsx` component
- [ ] Implement URL query parameter handling for sharable searches
- [ ] Add state management for search filters
- [ ] Implement empty state and loading states
- [ ] Create result card component with asset preview

### 4. Advanced Features

- [ ] Implement debounced search for better performance
- [ ] Add "save search" functionality
- [ ] Create recent searches history
- [ ] Support for export search results
- [ ] Implement keyboard shortcuts for power users

## Technical Details

### Search Parameters Interface

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

### API Endpoints

The search functionality will utilize these API endpoints:

- `GET /api/assets` - Basic search with query parameters
- `POST /api/assets/search` - Advanced search with complex filters
- `GET /api/assets/tags` - Get available tags for autocomplete

### Pagination Interface

```typescript
export interface PaginationControls {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}
```

## UI Design

The search interface will include:

1. **Search Bar**: Text input with search button at the top
2. **Filter Panel**: Collapsible panel with all filter options
3. **Results Grid**: Card-based grid showing asset previews
4. **Pagination**: Controls at the bottom to navigate between pages
5. **Sorting Controls**: Dropdown to change sort order and field

## Responsive Behavior

- Desktop: Side-by-side filter panel and results
- Tablet: Collapsible filter panel above results
- Mobile: Modal filter panel, simplified results view

## Testing Plan

1. Unit tests for search parameter handling
2. Integration tests for API connectivity
3. UI component tests for filter interactions
4. End-to-end tests for search workflows

## Implementation Priority

1. Basic text search with results display
2. Layer/category/subcategory filters
3. Pagination support
4. Advanced filters (date, tags, status)
5. Sorting functionality
6. Export and saved searches

## Dependencies

- Material UI components for filters and UI elements
- React Query for data fetching and caching
- React Hook Form for filter form state management

## Estimated Effort

- API Integration: 1 day
- Basic UI Components: 2 days
- Advanced Filters: 2 days
- Pagination & Sorting: 1 day
- Refinement & Testing: 2 days

Total: **8 days**