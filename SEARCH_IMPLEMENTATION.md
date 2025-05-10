# Search Feature Implementation Plan

This document outlines the plan for implementing enhanced search functionality in the NNA Registry Service frontend.

## Overview

The search feature will allow users to find assets using various criteria, including name, layer, category, subcategory, tags, and date ranges. It will support both basic text search and advanced filtering options.

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