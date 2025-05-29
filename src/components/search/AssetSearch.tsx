import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Typography,
  Divider,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import AssetCard from '../asset/AssetCard';
import PaginationControls from '../common/PaginationControls';
import { Asset, AssetSearchParams } from '../../types/asset.types';
import assetService from '../../api/assetService';
import taxonomyService from '../../api/taxonomyService';
import {
  LayerOption,
  CategoryOption,
  SubcategoryOption,
} from '../../types/taxonomy.types';

interface AssetSearchProps {
  onSearch: (query: string) => void;
  initialParams?: AssetSearchParams;
}

const AssetSearch: React.FC<AssetSearchProps> = ({
  onSearch,
  initialParams = {},
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] =
    useState<boolean>(false);
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
  const [layers, setLayers] = useState<LayerOption[]>([]);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSortControls, setShowSortControls] = useState<boolean>(false);
  
  // Cache busting
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);

  // Load layers for filtering
  useEffect(() => {
    try {
      const availableLayers = taxonomyService.getLayers();
      setLayers(availableLayers);
    } catch (error) {
      console.error('Error loading layers:', error);
    }
  }, []);

  // Load initial assets when component mounts
  useEffect(() => {
    // Perform initial load with backward compatibility
    const loadInitialAssets = async () => {
      setIsLoading(true);
      const searchTime = Date.now();

      try {
        // Try enhanced parameters first
        let searchParams: AssetSearchParams = {
          page: 1,
          limit: itemsPerPage,
          sort: sortBy,
          order: sortOrder,
        };

        console.log('🔍 Loading initial assets with enhanced params:', searchParams);
        let results = await assetService.getAssets(searchParams);
        
        // If enhanced search failed, try basic search (no parameters)
        if (!results || !results.data || (results as any).error === '500_UNSUPPORTED_PARAMS') {
          console.log('⚠️ Enhanced initial load failed, falling back to basic...');
          results = await assetService.getAssets({});
          searchParams = {}; // Update for pagination logic
        }

        if (results && results.data) {
          let assetResults: Asset[] = [];
          let totalCount = 0;

          if (Array.isArray(results.data)) {
            assetResults = results.data;
            totalCount = results.pagination?.total || results.data.length;
          } else if (
            typeof results.data === 'object' &&
            results.data !== null &&
            'items' in results.data &&
            Array.isArray((results.data as any).items)
          ) {
            const dataWithItems = results.data as {
              items: Asset[];
              total?: number;
            };
            assetResults = dataWithItems.items;
            totalCount = dataWithItems.total || dataWithItems.items.length;
          }

          // Apply client-side pagination if backend doesn't support it
          const usedPagination = searchParams.page !== undefined;
          if (usedPagination && totalCount > 0) {
            // Backend pagination working
            setSearchResults(assetResults);
            setTotalAssets(totalCount);
            setTotalPages(Math.ceil(totalCount / itemsPerPage));
          } else {
            // Client-side pagination
            const paginatedResults = assetResults.slice(0, itemsPerPage);
            setSearchResults(paginatedResults);
            setTotalAssets(assetResults.length);
            setTotalPages(Math.ceil(assetResults.length / itemsPerPage));
          }
          
          setCurrentPage(1);
          setLastSearchTime(searchTime);
        }
      } catch (error) {
        console.error('Error loading initial assets:', error);
        setSearchResults([]);
        setTotalAssets(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialAssets();
  }, []);

  // Load categories when layer changes
  useEffect(() => {
    if (!selectedLayer) {
      setCategories([]);
      return;
    }

    try {
      const availableCategories = taxonomyService.getCategories(selectedLayer);
      setCategories(availableCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [selectedLayer]);

  // Load subcategories when category changes
  useEffect(() => {
    if (!selectedLayer || !selectedCategory) {
      setSubcategories([]);
      return;
    }

    try {
      const availableSubcategories = taxonomyService.getSubcategories(
        selectedLayer,
        selectedCategory
      );
      setSubcategories(availableSubcategories);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  }, [selectedLayer, selectedCategory]);

  const performSearch = async (page = currentPage, forceRefresh = false) => {
    setIsLoading(true);
    const searchTime = Date.now();

    try {
      // Try enhanced search first, fall back to basic on failure
      let searchParams: AssetSearchParams = {
        search: searchQuery || undefined,
        layer: selectedLayer || undefined,
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
        page: page,
        limit: itemsPerPage,
        sort: sortBy,
        order: sortOrder,
        // Cache busting: add timestamp for force refresh or if data is stale
        ...(forceRefresh || searchTime - lastSearchTime > 30000 ? { _t: searchTime } : {})
      };

      console.log('🔍 Enhanced search parameters:', searchParams);

      // Call the search API with enhanced parameters
      let results = await assetService.getAssets(searchParams);
      
      // If enhanced search failed with 500 error, try basic search
      if (!results || !results.data || (results as any).error === '500_UNSUPPORTED_PARAMS') {
        console.log('⚠️ Enhanced search failed, falling back to basic search...');
        
        // Basic search parameters (backward compatible)
        const basicParams: AssetSearchParams = {
          // Only include basic parameters that backend supports
          ...(searchQuery && { search: searchQuery }),
          ...(selectedLayer && { layer: selectedLayer }),
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedSubcategory && { subcategory: selectedSubcategory })
        };
        
        console.log('🔄 Basic search parameters:', basicParams);
        results = await assetService.getAssets(basicParams);
        
        // Update searchParams to reflect the fallback (for pagination logic)
        searchParams = basicParams;
      }

      // Update state with results
      if (results && results.data) {
        // Extract search results using either format
        let assetResults: Asset[] = [];
        let totalCount = 0;

        if (Array.isArray(results.data)) {
          // Old format: results.data is the array
          assetResults = results.data;
          totalCount = results.pagination?.total || results.data.length;
          console.log('Search results (old format):', assetResults.length);
        } else if (
          typeof results.data === 'object' &&
          results.data !== null &&
          'items' in results.data &&
          Array.isArray((results.data as any).items)
        ) {
          // New format: results.data.items is the array
          const dataWithItems = results.data as {
            items: Asset[];
            total?: number;
          };
          assetResults = dataWithItems.items;
          totalCount = dataWithItems.total || dataWithItems.items.length;
          console.log('Search results from items array:', assetResults.length);
        } else {
          console.warn(
            'Received unexpected format from assets search:',
            results
          );
          setSearchResults([]);
          setTotalAssets(0);
          return;
        }

        // Enhanced result processing with backward compatibility
        console.log(`📊 Received ${assetResults.length} assets from backend search`);
        console.log(`📄 Total count: ${totalCount}, Current page: ${page}`);
        
        // Check if pagination was used in request (enhanced backend support)
        const usedPagination = searchParams.page !== undefined;
        
        if (usedPagination && totalCount > 0) {
          // Backend supports pagination - use server-side pagination
          setSearchResults(assetResults);
          setTotalAssets(totalCount);
          setCurrentPage(page);
          setTotalPages(Math.ceil(totalCount / itemsPerPage));
          console.log('✅ Using server-side pagination');
        } else {
          // Backend doesn't support pagination - implement client-side pagination
          const startIndex = (page - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedResults = assetResults.slice(startIndex, endIndex);
          
          setSearchResults(paginatedResults);
          setTotalAssets(assetResults.length);
          setCurrentPage(page);
          setTotalPages(Math.ceil(assetResults.length / itemsPerPage));
          console.log('⚙️ Using client-side pagination:', {
            total: assetResults.length,
            page: page,
            showing: paginatedResults.length
          });
        }
        
        setLastSearchTime(searchTime);
      } else {
        console.warn('Received empty or invalid results from assets search');
        setSearchResults([]);
        setTotalAssets(0);
        setTotalPages(1);
      }

      // Call the onSearch callback with the query
      onSearch(searchQuery);
    } catch (error) {
      console.error('Error searching assets:', error);
      setSearchResults([]);
      setTotalAssets(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Wrapper function for backward compatibility
  const handleSearch = () => performSearch(1);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    performSearch(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    performSearch(1);
  };

  // Sorting handlers
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
    performSearch(1);
  };

  const handleSortOrderChange = (newOrder: 'asc' | 'desc') => {
    setSortOrder(newOrder);
    setCurrentPage(1);
    performSearch(1);
  };

  // Force refresh handler for cache busting
  const handleForceRefresh = () => {
    performSearch(currentPage, true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedLayer('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchResults([]);
    setShowAdvancedFilters(false);
    setCurrentPage(1);
    setTotalAssets(0);
    setTotalPages(1);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLayerChange = (event: SelectChangeEvent<string>) => {
    setSelectedLayer(event.target.value);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
    setSelectedSubcategory('');
  };

  const handleSubcategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedSubcategory(event.target.value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Search NNA Assets
        </Typography>

        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search assets by name, description, tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            aria-label="Search assets"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery('')} edge="end">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="medium"
            sx={{ mr: 1 }}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={isLoading}
            sx={{ minWidth: '120px' }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Search'
            )}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              startIcon={<FilterListIcon />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              sx={{ mb: 2 }}
            >
              {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            <Button
              startIcon={<SortIcon />}
              onClick={() => setShowSortControls(!showSortControls)}
              sx={{ mb: 2 }}
            >
              {showSortControls ? 'Hide Sort' : 'Sort'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {totalAssets > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleForceRefresh}
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                Refresh
              </Button>
            )}

            {(searchQuery ||
              selectedLayer ||
              selectedCategory ||
              selectedSubcategory) && (
              <Button
                color="secondary"
                onClick={handleClearSearch}
                sx={{ mb: 2 }}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        {/* Sorting Controls */}
        {showSortControls && (
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Sort Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <MenuItem value="createdAt">Creation Date</MenuItem>
                    <MenuItem value="name">Asset Name</MenuItem>
                    <MenuItem value="layer">Layer</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="updatedAt">Last Modified</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={sortOrder}
                    label="Order"
                    onChange={(e) => handleSortOrderChange(e.target.value as 'asc' | 'desc')}
                  >
                    <MenuItem value="desc">Newest First</MenuItem>
                    <MenuItem value="asc">Oldest First</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        {showAdvancedFilters && (
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Filter by Taxonomy
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="layer-select-label">Layer</InputLabel>
                  <Select
                    labelId="layer-select-label"
                    id="layer-select"
                    value={selectedLayer}
                    label="Layer"
                    onChange={handleLayerChange}
                    aria-label="Filter by layer"
                  >
                    <MenuItem value="">
                      <em>Any Layer</em>
                    </MenuItem>
                    {layers.map(layer => (
                      <MenuItem key={layer.code} value={layer.code}>
                        {layer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={!selectedLayer}>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={selectedCategory}
                    label="Category"
                    onChange={handleCategoryChange}
                    disabled={!selectedLayer || categories.length === 0}
                    aria-label="Filter by category"
                  >
                    <MenuItem value="">
                      <em>Any Category</em>
                    </MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category.code} value={category.code}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={!selectedCategory}>
                  <InputLabel id="subcategory-select-label">
                    Subcategory
                  </InputLabel>
                  <Select
                    labelId="subcategory-select-label"
                    id="subcategory-select"
                    value={selectedSubcategory}
                    label="Subcategory"
                    onChange={handleSubcategoryChange}
                    disabled={!selectedCategory || subcategories.length === 0}
                    aria-label="Filter by subcategory"
                  >
                    <MenuItem value="">
                      <em>Any Subcategory</em>
                    </MenuItem>
                    {subcategories.map(subcategory => (
                      <MenuItem key={subcategory.code} value={subcategory.code}>
                        {subcategory.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Results section - either search results or recent assets */}
      {searchResults.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              {/* Show "Search Results" if a search was performed, otherwise "Recent Assets" */}
              {searchQuery ||
              selectedLayer ||
              selectedCategory ||
              selectedSubcategory
                ? 'Search Results'
                : 'Recent Assets'}
            </Typography>
            <Chip
              label={`${totalAssets} asset${totalAssets !== 1 ? 's' : ''} ${
                searchQuery ||
                selectedLayer ||
                selectedCategory ||
                selectedSubcategory
                  ? 'found'
                  : 'available'
              }`}
              color="primary"
              variant="outlined"
            />
          </Box>
          <Grid container spacing={3}>
            {searchResults.map(asset => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <AssetCard asset={asset} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <PaginationControls
              page={currentPage}
              totalPages={totalPages}
              totalItems={totalAssets}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[6, 12, 24, 48]}
              disabled={isLoading}
            />
          )}
        </Box>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Task 9: Enhanced no results message with Material-UI Alert */}
      {searchResults.length === 0 &&
        (searchQuery ||
          selectedLayer ||
          selectedCategory ||
          selectedSubcategory) &&
        !isLoading && (
          <Alert severity="info" sx={{ mt: 4 }}>
            No assets found for your search criteria.
          </Alert>
        )}
    </Box>
  );
};

export default AssetSearch;
