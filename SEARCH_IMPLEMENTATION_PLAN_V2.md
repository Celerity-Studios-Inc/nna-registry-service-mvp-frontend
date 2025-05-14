# Search Feature Implementation Plan V2

## 1. Current Status

After analyzing the codebase, I've found that the NNA Registry Service frontend already has the foundational elements for search functionality:

1. **Basic Search Components**:
   - `AssetSearch.tsx` component with basic search input and filters
   - `SearchAssetsPage.tsx` page component that renders the search interface

2. **API Integration**:
   - `assetService.ts` has `getAssets()` and `advancedSearch()` methods
   - `AssetSearchParams` interface in `asset.types.ts`

3. **UI Elements**:
   - Filter UI for layer, category, and subcategory
   - Basic search results display with asset cards

## 2. Missing Features

Despite the existing foundation, several critical search features are missing:

1. **Pagination & Sorting**:
   - No UI controls for pagination
   - No sorting options in the UI
   - Backend pagination parameters exist but aren't utilized

2. **Advanced Filters**:
   - Date range filtering not implemented
   - Tag filtering not implemented
   - Missing file type/size filtering
   - No saved search functionality

3. **Search Results Presentation**:
   - Limited result display options (grid only, no list view)
   - No sorting controls in results view
   - No detailed information in result cards

4. **Performance & UX**:
   - No debounced search
   - No caching of search results
   - Missing loading states and visual feedback

## 3. Implementation Plan

### Phase 1: Core Search Improvements (1-2 days)

1. **Enhance Search Results Display**:
   - Add list/grid view toggle
   - Improve asset card design with more metadata
   - Add empty state illustrations
   - Implement better loading indicators

2. **Implement Pagination**:
   - Create `PaginationControls` component
   - Add page size selector
   - Implement navigation between pages
   - Update API calls to include pagination parameters

3. **Add Basic Sorting**:
   - Add sort dropdown (name, date created, date updated)
   - Implement sort direction toggle
   - Update API calls with sort parameters

### Phase 2: Advanced Search Features (2-3 days)

1. **Enhance Filter Panel**:
   - Redesign filter UI for better UX
   - Make filter panel collapsible/expandable
   - Add filter badges for active filters
   - Implement clear individual filters

2. **Implement Advanced Filters**:
   - Add date range filters with date pickers
   - Create tag filter with autocomplete
   - Add file type filter
   - Implement file size range filter

3. **Search Parameter Management**:
   - Create search context for state management
   - Implement URL query parameters for shareable searches
   - Add search history (local storage)

### Phase 3: Performance & UX Enhancements (1-2 days)

1. **Performance Optimizations**:
   - Implement debounced search input
   - Add result caching with React Query
   - Lazy load search result images
   - Add virtual scrolling for large result sets

2. **User Experience Improvements**:
   - Implement keyboard shortcuts
   - Add filter presets (save filters)
   - Implement search suggestions
   - Add export search results functionality

## 4. Technical Implementation Details

### Pagination Component

```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

const PaginationControls: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  // Implementation details
};
```

### Search Context for State Management

```tsx
interface SearchContextType {
  searchParams: AssetSearchParams;
  results: PaginatedResponse<Asset> | null;
  isLoading: boolean;
  error: string | null;
  setSearchParams: (params: Partial<AssetSearchParams>) => void;
  executeSearch: () => Promise<void>;
  clearSearch: () => void;
  searchHistory: AssetSearchParams[];
  saveSearch: (name: string) => void;
  loadSavedSearch: (searchId: string) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC = ({ children }) => {
  // Implementation details
};
```

### Advanced Date Range Filter

```tsx
interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  disabled?: boolean;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled = false
}) => {
  // Implementation details
};
```

### URL Parameter Handling

```tsx
// Function to convert search params to URL query params
const searchParamsToQueryString = (params: AssetSearchParams): string => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.set('q', params.search);
  if (params.layer) queryParams.set('layer', params.layer);
  if (params.category) queryParams.set('category', params.category);
  if (params.subcategory) queryParams.set('subcategory', params.subcategory);
  if (params.tags?.length) queryParams.set('tags', params.tags.join(','));
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.sortBy) queryParams.set('sort', params.sortBy);
  if (params.sortDirection) queryParams.set('order', params.sortDirection);
  
  // Handle date ranges
  if (params.createdAfter) queryParams.set('from', formatDate(params.createdAfter));
  if (params.createdBefore) queryParams.set('to', formatDate(params.createdBefore));
  
  return queryParams.toString();
};

// Function to parse URL query params into search params
const queryStringToSearchParams = (queryString: string): AssetSearchParams => {
  const queryParams = new URLSearchParams(queryString);
  const params: AssetSearchParams = {};
  
  // Implementation details for parsing params
  
  return params;
};
```

## 5. Component Structure Updates

```
SearchAssetsPage
├── SearchHeader
│   ├── BasicSearchInput (with debounce)
│   └── ViewToggle (grid/list)
├── FilterPanel (collapsible)
│   ├── ActiveFilters (badges)
│   ├── LayerCategoryFilter
│   ├── DateRangeFilter
│   ├── TagFilter
│   └── FileFilter (type/size)
├── SearchResults
│   ├── ResultsHeader
│   │   ├── ResultCount
│   │   ├── SortControls
│   │   └── ExportButton
│   ├── GridView / ListView (conditional)
│   │   └── EnhancedAssetCard
│   └── PaginationControls
├── SavedSearches (dropdown)
└── SearchHistory (dropdown)
```

## 6. Testing Strategy

1. **Unit Tests**:
   - Test search parameter handling functions
   - Test URL parameter conversion
   - Test filter components in isolation

2. **Integration Tests**:
   - Test search flow with API mocks
   - Test pagination and sorting
   - Test filter combinations

3. **UI Tests**:
   - Test responsiveness across device sizes
   - Test accessibility of search controls
   - Test keyboard navigation

## 7. Responsive Design

- **Desktop** (>1200px): 
  - Side-by-side filter panel and results
  - 4-column grid view

- **Tablet** (768px-1200px):
  - Collapsible filter panel above results
  - 3-column grid view
  - Simplified filter options

- **Mobile** (<768px):
  - Filters in dropdown/dialog
  - 1-column grid or compact list view
  - Simplified pagination

## 8. Priority Implementation Order

1. Pagination controls
2. Sorting functionality
3. Enhanced results display
4. Advanced filter panel
5. Date range filter
6. Tag filter implementation
7. URL parameter handling
8. Search history & saved searches
9. Performance optimizations
10. Export functionality

## 9. API Enhancements Needed

Currently, the asset service has basic search functionality, but may need enhancements:

1. Implement or test the `prepareSearchParams` method to handle complex parameters
2. Add support for more advanced filtering options
3. Ensure proper error handling and fallbacks
4. Add support for saved searches (could be client-side only)

## 10. Timeline and Resource Allocation

| Task | Effort | Priority | Assignee |
|------|--------|----------|----------|
| Pagination & Sorting | 1 day | High | TBD |
| Enhanced Results Display | 1 day | High | TBD |
| Filter Panel Redesign | 1 day | Medium | TBD |
| Advanced Filters | 2 days | Medium | TBD |
| URL Parameters | 1 day | Medium | TBD |
| Performance Optimizations | 1 day | Low | TBD |
| Saved Searches | 1 day | Low | TBD |

Total estimated effort: **7-10 days**

## 11. Conclusion

The search functionality is partially implemented but requires significant enhancements to meet modern UX expectations and provide advanced search capabilities. This plan outlines a phased approach that builds on the existing foundation while adding critical features for usability and performance.