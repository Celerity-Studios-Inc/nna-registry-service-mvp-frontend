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
import axios from 'axios';
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
    // Perform initial load using working API pattern
    const loadInitialAssets = async () => {
      setIsLoading(true);

      try {
        // Use simple parameters like working composite search
        const searchParams = {
          limit: itemsPerPage,
        };

        console.log('🔍 Loading initial assets with working pattern:', searchParams);

        // Use direct axios call like the working composite search
        let response;
        try {
          response = await axios.get('/api/assets', {
            params: searchParams,
            timeout: 5000,
            headers: {
              'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                              localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
            },
          });
        } catch (proxyError) {
          console.log('Proxy failed, trying direct backend connection...');
          response = await axios.get('https://registry.reviz.dev/api/assets', {
            params: searchParams,
            timeout: 10000,
            headers: {
              'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                              localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
            },
          });
          console.log('Direct backend connection successful!');
        }

        // Parse response using the same logic as working composite search
        let results: Asset[] = [];
        
        if (response.data.success && response.data.data) {
          results = response.data.data.items || [];
        } else if (response.data.items) {
          results = response.data.items;
        } else if (Array.isArray(response.data)) {
          results = response.data;
        }

        console.log(`🎯 Retrieved ${results.length} initial assets`);

        // Normalize asset structure
        const normalizedResults = results.map(asset => ({
          ...asset,
          id: asset.id || (asset as any)._id || (asset as any).assetId,
          layer: asset.layer || (asset as any).assetLayer || asset.metadata?.layer,
          nnaAddress: (asset as any).nna_address || asset.nnaAddress || (asset as any).mfa || (asset as any).MFA,
          friendlyName: asset.name || asset.friendlyName || (asset as any).hfn || (asset as any).HFN,
        }));

        // Client-side pagination
        const paginatedResults = normalizedResults.slice(0, itemsPerPage);
        setSearchResults(paginatedResults);
        setTotalAssets(normalizedResults.length);
        setTotalPages(Math.ceil(normalizedResults.length / itemsPerPage));
        setCurrentPage(1);
        setLastSearchTime(Date.now());
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
  }, [itemsPerPage]);

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
      // Use the same working API pattern as composite asset search
      const searchParams = {
        search: searchQuery || undefined,
        layer: selectedLayer || undefined,
        limit: itemsPerPage,
        // Cache busting: add timestamp for force refresh or if data is stale
        ...(forceRefresh || searchTime - lastSearchTime > 30000 ? { _t: searchTime } : {})
      };

      console.log('🔍 Search parameters (using working pattern):', searchParams);

      // Use direct axios call like the working composite search
      let response;
      try {
        response = await axios.get('/api/assets', {
          params: searchParams,
          timeout: 5000,
          headers: {
            'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                            localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
          },
        });
      } catch (proxyError) {
        console.log('Proxy failed, trying direct backend connection...', proxyError instanceof Error ? proxyError.message : 'Unknown error');
        // If proxy fails, try direct backend connection
        response = await axios.get('https://registry.reviz.dev/api/assets', {
          params: searchParams,
          timeout: 10000,
          headers: {
            'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                            localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
          },
        });
        console.log('Direct backend connection successful!');
      }

      // Parse response using the same logic as working composite search
      let results: Asset[] = [];
      let totalCount = 0;
      
      if (response.data.success && response.data.data) {
        // Paginated response format: { success: true, data: { items: [...], pagination: {...} } }
        results = response.data.data.items || [];
        totalCount = response.data.data.total || results.length;
      } else if (response.data.items) {
        // Direct items response: { items: [...] }
        results = response.data.items;
        totalCount = results.length;
      } else if (Array.isArray(response.data)) {
        // Direct array response: [...]
        results = response.data;
        totalCount = results.length;
      }

      console.log(`🎯 Retrieved ${results.length} assets, total: ${totalCount}`);

      // Normalize asset structure for frontend use
      const normalizedResults = results.map(asset => ({
        ...asset,
        id: asset.id || (asset as any)._id || (asset as any).assetId,
        layer: asset.layer || (asset as any).assetLayer || asset.metadata?.layer,
        nnaAddress: (asset as any).nna_address || asset.nnaAddress || (asset as any).mfa || (asset as any).MFA,
        friendlyName: asset.name || asset.friendlyName || (asset as any).hfn || (asset as any).HFN,
      }));

      // Apply client-side filtering for category/subcategory and additional search terms
      let filteredResults = normalizedResults;
      
      if (selectedCategory) {
        filteredResults = filteredResults.filter(asset => 
          asset.category === selectedCategory || asset.categoryCode === selectedCategory
        );
      }
      
      if (selectedSubcategory) {
        filteredResults = filteredResults.filter(asset => 
          asset.subcategory === selectedSubcategory || asset.subcategoryCode === selectedSubcategory
        );
      }

      // Apply client-side sorting
      if (sortBy && filteredResults.length > 0) {
        filteredResults.sort((a, b) => {
          let aValue: any = '';
          let bValue: any = '';
          
          switch (sortBy) {
            case 'createdAt':
              aValue = new Date(a.createdAt || 0).getTime();
              bValue = new Date(b.createdAt || 0).getTime();
              break;
            case 'updatedAt':
              aValue = new Date(a.updatedAt || 0).getTime();
              bValue = new Date(b.updatedAt || 0).getTime();
              break;
            case 'name':
              aValue = (a.name || a.friendlyName || '').toLowerCase();
              bValue = (b.name || b.friendlyName || '').toLowerCase();
              break;
            case 'layer':
              aValue = a.layer || '';
              bValue = b.layer || '';
              break;
            case 'category':
              aValue = a.category || '';
              bValue = b.category || '';
              break;
            default:
              return 0;
          }
          
          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Client-side pagination since backend pagination parameters don't work
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedResults = filteredResults.slice(startIndex, endIndex);
      
      setSearchResults(paginatedResults);
      setTotalAssets(filteredResults.length);
      setCurrentPage(page);
      setTotalPages(Math.ceil(filteredResults.length / itemsPerPage));
      setLastSearchTime(searchTime);

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

  // Sorting handlers - now using client-side sorting
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
    // Since we're now using client-side sorting, trigger a fresh search
    performSearch(1);
  };

  const handleSortOrderChange = (newOrder: 'asc' | 'desc') => {
    setSortOrder(newOrder);
    setCurrentPage(1);
    // Since we're now using client-side sorting, trigger a fresh search
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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mr: 2 }}>
                🔄 Sort Results
              </Typography>
              <Chip 
                label={sortBy === 'createdAt' ? 'By Date' : sortBy === 'name' ? 'By Name' : `By ${sortBy}`} 
                size="small" 
                color="primary"
                variant="filled"
              />
              <Chip 
                label={sortOrder === 'asc' ? '⬆️ Ascending' : '⬇️ Descending'} 
                size="small" 
                color="secondary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    label="Sort By"
                    onChange={(e) => handleSortChange(e.target.value)}
                    sx={{
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center'
                      }
                    }}
                  >
                    <MenuItem value="createdAt">📅 Creation Date</MenuItem>
                    <MenuItem value="name">🔤 Asset Name</MenuItem>
                    <MenuItem value="layer">🏷️ Layer</MenuItem>
                    <MenuItem value="category">📂 Category</MenuItem>
                    <MenuItem value="updatedAt">⏰ Last Modified</MenuItem>
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
          <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 3 }} 
            sx={{ mt: 2 }}
          >
            {searchResults.map(asset => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                xl={3}
                key={asset.id}
                sx={{
                  display: 'flex',
                  '& > *': {
                    width: '100%'
                  }
                }}
              >
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
