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
  
  // Enhanced cache busting
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);
  const [cacheVersion, setCacheVersion] = useState<number>(1);
  const [isStaleData, setIsStaleData] = useState<boolean>(false);
  
  // Enhanced search features
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isRealTimeSearch, setIsRealTimeSearch] = useState<boolean>(true); // Default to Live Search

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
        // Use backend API structure for consistency
        const searchParams = {
          page: 1,
          limit: itemsPerPage,
        };

        console.log('🔍 Loading initial assets with backend API:', searchParams);

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

        // Parse response according to documented backend API format
        let results: Asset[] = [];
        let totalCount = 0;
        
        if (response.data.success && response.data.data && response.data.data.items) {
          // Documented backend format: { success: true, data: { items: [...], total: N } }
          results = response.data.data.items;
          totalCount = response.data.data.total || results.length;
          console.log('✅ Initial load: parsed documented backend format');
        } else if (response.data.items) {
          // Legacy items response: { items: [...] }
          results = response.data.items;
          totalCount = results.length;
          console.log('⚠️ Initial load: using legacy items format');
        } else if (Array.isArray(response.data)) {
          // Direct array response: [...]
          results = response.data;
          totalCount = results.length;
          console.log('⚠️ Initial load: using direct array format');
        } else {
          console.warn('⚠️ Initial load: unexpected API response format:', response.data);
          results = [];
          totalCount = 0;
        }

        console.log(`🎯 Retrieved ${results.length} initial assets, total: ${totalCount}`);

        // Normalize asset structure
        const normalizedResults = results.map(asset => ({
          ...asset,
          id: asset.id || (asset as any)._id || (asset as any).assetId,
          layer: asset.layer || (asset as any).assetLayer || asset.metadata?.layer,
          nnaAddress: (asset as any).nna_address || asset.nnaAddress || (asset as any).mfa || (asset as any).MFA,
          friendlyName: asset.name || asset.friendlyName || (asset as any).hfn || (asset as any).HFN,
        }));

        // Use backend pagination data
        setSearchResults(normalizedResults);
        setTotalAssets(totalCount);
        setTotalPages(Math.ceil(totalCount / itemsPerPage));
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
      // STEP 2A FIX: Convert codes to full names for backend compatibility
      // Backend expects full names like "Casual", "Athleisure" not codes like "CAS", "ATL"
      const getCategoryName = (categoryCode: string | undefined): string | undefined => {
        if (!categoryCode) return undefined;
        const category = categories.find(cat => cat.code === categoryCode);
        return category?.name || categoryCode;
      };

      const getSubcategoryName = (subcategoryCode: string | undefined): string | undefined => {
        if (!subcategoryCode) return undefined;
        const subcategory = subcategories.find(subcat => subcat.code === subcategoryCode);
        return subcategory?.name || subcategoryCode;
      };

      const searchParams = {
        search: searchQuery || undefined,
        layer: selectedLayer || undefined,
        category: getCategoryName(selectedCategory),
        subcategory: getSubcategoryName(selectedSubcategory),
        page: page,
        limit: itemsPerPage,
        // STEP 1.6 FIX: Removed all cache busting parameters (_t, _v, _fresh)
        // Backend rejects these with "property should not exist" errors
      };

      console.log('🔍 Search parameters (aligned with backend API):', searchParams);

      // Use direct axios call like the working composite search
      let response;
      try {
        response = await axios.get('/api/assets', {
          params: searchParams,
          timeout: 5000,
          headers: {
            'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                            localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
            // Cache busting via headers instead of query params
            'Cache-Control': forceRefresh ? 'no-cache, no-store, must-revalidate' : 'max-age=30',
            'Pragma': forceRefresh ? 'no-cache' : undefined,
            'X-Requested-At': Date.now().toString(),
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
            // Cache busting via headers instead of query params
            'Cache-Control': forceRefresh ? 'no-cache, no-store, must-revalidate' : 'max-age=30',
            'Pragma': forceRefresh ? 'no-cache' : undefined,
            'X-Requested-At': Date.now().toString(),
          },
        });
        console.log('Direct backend connection successful!');
      }

      // Parse response according to documented backend API format
      let results: Asset[] = [];
      let totalCount = 0;
      
      if (response.data.success && response.data.data && response.data.data.items) {
        // Documented backend format: { success: true, data: { items: [...], total: N } }
        results = response.data.data.items;
        totalCount = response.data.data.total || results.length;
        console.log('✅ Parsed documented backend format');
      } else if (response.data.items) {
        // Legacy items response: { items: [...] }
        results = response.data.items;
        totalCount = results.length;
        console.log('⚠️ Using legacy items format');
      } else if (Array.isArray(response.data)) {
        // Direct array response: [...]
        results = response.data;
        totalCount = results.length;
        console.log('⚠️ Using direct array format');
      } else {
        console.warn('⚠️ Unexpected API response format:', response.data);
        results = [];
        totalCount = 0;
      }

      console.log(`🎯 Retrieved ${results.length} assets, total: ${totalCount}`);

      // Check for potentially stale data (e.g., unexpected zero results for broad searches)
      if (results.length === 0 && searchQuery.trim() && !selectedLayer && !selectedCategory && !selectedSubcategory) {
        console.warn(`⚠️ Potentially stale data: Search for "${searchQuery}" returned 0 results`);
        setIsStaleData(true);
      }

      // Normalize asset structure for frontend use
      const normalizedResults = results.map(asset => ({
        ...asset,
        id: asset.id || (asset as any)._id || (asset as any).assetId,
        layer: asset.layer || (asset as any).assetLayer || asset.metadata?.layer,
        nnaAddress: (asset as any).nna_address || asset.nnaAddress || (asset as any).mfa || (asset as any).MFA,
        friendlyName: asset.name || asset.friendlyName || (asset as any).hfn || (asset as any).HFN,
      }));

      // Backend now handles filtering via category/subcategory parameters
      // Apply client-side sorting only if needed (backend should handle this eventually)
      let sortedResults = normalizedResults;
      if (sortBy && sortedResults.length > 0) {
        sortedResults.sort((a, b) => {
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

      // Use backend pagination when available, fallback to client-side
      setSearchResults(sortedResults);
      setTotalAssets(totalCount);
      setCurrentPage(page);
      setTotalPages(Math.ceil(totalCount / itemsPerPage));
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

  // Enhanced search handler
  const handleSearch = () => {
    // Update search history
    updateSearchHistory(searchQuery);
    
    // Clear suggestions
    setSearchSuggestions([]);
    
    // Trigger search
    performSearch(1);
  };

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

  // Enhanced force refresh handler for cache busting
  const handleForceRefresh = () => {
    invalidateCache();
    performSearch(currentPage, true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedLayer('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setShowAdvancedFilters(false);
    setCurrentPage(1);
    // Immediate search to show all assets when clearing filters
    performSearch(1);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleLayerChange = (event: SelectChangeEvent<string>) => {
    const newLayer = event.target.value;
    setSelectedLayer(newLayer);
    setSelectedCategory('');
    setSelectedSubcategory('');
    // Auto-trigger handled by useEffect
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
    setSelectedSubcategory('');
    // Auto-trigger handled by useEffect
  };

  const handleSubcategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedSubcategory(event.target.value);
    // Auto-trigger handled by useEffect
  };

  // Enhanced cache busting functions
  const invalidateCache = () => {
    setCacheVersion(prev => prev + 1);
    setIsStaleData(false);
  };

  const checkDataFreshness = () => {
    const currentTime = Date.now();
    const dataAge = currentTime - lastSearchTime;
    
    // Data is considered stale after 2 minutes
    if (dataAge > 120000) {
      setIsStaleData(true);
    }
    
    return dataAge < 120000;
  };

  // Enhanced search term processing
  const processSearchTerms = (query: string): string[] => {
    if (!query.trim()) return [];
    
    // Split by common delimiters and clean up
    const terms = query
      .split(/[\s,;|]+/)
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);
    
    return Array.from(new Set(terms)); // Remove duplicates
  };

  const updateSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newSearches);
    
    // Persist to localStorage
    localStorage.setItem('nna-recent-searches', JSON.stringify(newSearches));
  };

  const generateSearchSuggestions = (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    // Generate suggestions based on common search patterns
    const suggestions = [
      `${query} video`,
      `${query} asset`,
      `layer:${query}`,
      `tag:${query}`,
      `name:${query}`
    ].filter(suggestion => 
      suggestion.toLowerCase() !== query.toLowerCase()
    ).slice(0, 3);

    setSearchSuggestions(suggestions);
  };

  // Enhanced search with debouncing for real-time search
  useEffect(() => {
    if (!isRealTimeSearch) return;
    
    // Auto-trigger search when taxonomy dropdowns change OR when search query changes
    // Also trigger when search is cleared to show recent assets
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedLayer, selectedCategory, selectedSubcategory, isRealTimeSearch]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('nna-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Periodic data freshness check
  useEffect(() => {
    if (!lastSearchTime) return;

    const interval = setInterval(() => {
      checkDataFreshness();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [lastSearchTime]);

  // Enhanced search query handler
  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    
    // Process search terms
    const terms = processSearchTerms(value);
    setSearchTerms(terms);
    
    // Generate suggestions
    generateSearchSuggestions(value);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Search NNA Assets
        </Typography>

        <Box sx={{ position: 'relative', mb: 2 }}>
          <Box sx={{ display: 'flex' }}>
            <TextField
              fullWidth
              placeholder="Search assets by name, description, tags..."
              value={searchQuery}
              onChange={e => handleSearchQueryChange(e.target.value)}
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
                    <IconButton onClick={() => {
                      setSearchQuery('');
                      setSearchTerms([]);
                      setSearchSuggestions([]);
                    }} edge="end">
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

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <Paper 
              sx={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0, 
                zIndex: 1000,
                mt: 0.5,
                maxHeight: 200,
                overflow: 'auto'
              }}
            >
              {searchSuggestions.map((suggestion, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    borderBottom: index < searchSuggestions.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider'
                  }}
                  onClick={() => {
                    handleSearchQueryChange(suggestion);
                    setSearchSuggestions([]);
                    handleSearch();
                  }}
                >
                  <Typography variant="body2">{suggestion}</Typography>
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        {/* Search Terms Display */}
        {searchTerms.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Search terms:
            </Typography>
            {searchTerms.map((term, index) => (
              <Chip
                key={index}
                label={term}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
                onDelete={() => {
                  const newTerms = searchTerms.filter((_, i) => i !== index);
                  const newQuery = newTerms.join(' ');
                  handleSearchQueryChange(newQuery);
                }}
              />
            ))}
          </Box>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchQuery && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
              Recent searches:
            </Typography>
            {recentSearches.slice(0, 3).map((search, index) => (
              <Chip
                key={index}
                label={search}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ mr: 0.5, mb: 0.5 }}
                onClick={() => {
                  handleSearchQueryChange(search);
                  handleSearch();
                }}
              />
            ))}
          </Box>
        )}

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

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Stale Data Warning */}
            {isStaleData && (
              <Chip
                label="⚠️ Data may be stale"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            )}

            {totalAssets > 0 && (
              <Button
                variant={isStaleData ? "contained" : "outlined"}
                color={isStaleData ? "warning" : "primary"}
                size="small"
                onClick={handleForceRefresh}
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                {isStaleData ? '🔄 Force Refresh' : 'Refresh'}
              </Button>
            )}

            {/* Real-time Search Toggle */}
            <Button
              variant={isRealTimeSearch ? "contained" : "outlined"}
              size="small"
              onClick={() => setIsRealTimeSearch(!isRealTimeSearch)}
              sx={{ mb: 2 }}
            >
              {isRealTimeSearch ? '⚡ Live Search' : 'Manual Search'}
            </Button>

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

      {/* Enhanced no results message with stale data detection */}
      {searchResults.length === 0 &&
        (searchQuery ||
          selectedLayer ||
          selectedCategory ||
          selectedSubcategory) &&
        !isLoading && (
          <Alert 
            severity={isStaleData ? "warning" : "info"} 
            sx={{ mt: 4 }}
            action={
              isStaleData && (
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={handleForceRefresh}
                  disabled={isLoading}
                >
                  🔄 Force Refresh
                </Button>
              )
            }
          >
            {isStaleData 
              ? `No assets found for "${searchQuery}". This might be due to stale data - try forcing a refresh.`
              : "No assets found for your search criteria."
            }
          </Alert>
        )}
    </Box>
  );
};

export default AssetSearch;
