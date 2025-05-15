# Pagination Implementation for Asset Browse/Search Feature

This document describes the implementation of pagination in the asset browse and search feature of the NNA Registry Service frontend application.

## Overview

Pagination has been implemented in the `AssetSearch` component to allow users to navigate through large sets of assets, with the following features:

- Page navigation controls (first, previous, next, last)
- Items per page selection (12, 24, 48, 96)
- Current page indicator
- Total items and page count display

## Implementation Details

### 1. Component Integration

The implementation leverages the existing `PaginationControls` component in `src/components/common/PaginationControls.tsx`, which provides a reusable pagination UI with the following features:

- Page navigation with first/previous/next/last buttons
- Items per page dropdown selector
- Showing X-Y of Z items text display
- Responsive design for both desktop and mobile

### 2. State Management

The `AssetSearch` component now maintains the following pagination-related state:

```typescript
// Pagination state
const [currentPage, setCurrentPage] = useState<number>(1);
const [itemsPerPage, setItemsPerPage] = useState<number>(12);
const [totalPages, setTotalPages] = useState<number>(1);
```

This state is properly updated when:
- A search is performed (resets to page 1)
- Filters are changed (resets to page 1)
- The user navigates to a different page
- The user changes the number of items per page

### 3. API Integration

The component makes proper use of pagination parameters when calling the API:

```typescript
const searchParams: AssetSearchParams = {
  search: searchQuery || undefined,
  layer: selectedLayer || undefined,
  category: selectedCategory || undefined,
  subcategory: selectedSubcategory || undefined,
  page: page,
  limit: limit,
  sortBy: 'createdAt',
  order: 'desc' // Show newest assets first
};
```

The backend API supports these pagination parameters and returns pagination metadata in the response:

```typescript
// Example pagination metadata in API response
pagination: {
  total: 100,    // Total number of items available
  page: 2,       // Current page
  limit: 10,     // Items per page
  pages: 10      // Total number of pages
}
```

### 4. User Interface

The pagination controls are rendered at the bottom of the asset grid:

```tsx
{totalAssets > 0 && (
  <Box sx={{ mt: 4 }}>
    <PaginationControls
      page={currentPage}
      totalPages={totalPages}
      totalItems={totalAssets}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onItemsPerPageChange={handleItemsPerPageChange}
      itemsPerPageOptions={[12, 24, 48, 96]}
      disabled={isLoading}
    />
  </Box>
)}
```

### 5. Refactored Methods

The component includes the following pagination-related methods:

1. `loadAssets(page, limit)` - Common function to load assets with pagination parameters
2. `handlePageChange(page)` - Handler for page navigation
3. `handleItemsPerPageChange(itemsPerPage)` - Handler for changing items per page

## Usage

The pagination controls will appear automatically when assets are loaded. Users can:

1. Navigate between pages using the page numbers or previous/next buttons
2. Change the number of assets shown per page using the dropdown
3. See their current position in the dataset with the "Showing X-Y of Z items" indicator

## Benefits

- Improved performance by loading only a subset of assets at a time
- Better user experience when browsing large asset collections
- Reduced memory usage by not loading all assets at once
- Consistent UI with standard pagination patterns
- Mobile-friendly design with responsive layout

## Future Enhancements

Potential improvements for the pagination implementation:

1. Add URL query parameter sync for bookmarkable pages
2. Implement scroll position memory when navigating back to the search page
3. Add sorting options for different asset attributes
4. Consider implementing infinite scroll as an alternative navigation pattern