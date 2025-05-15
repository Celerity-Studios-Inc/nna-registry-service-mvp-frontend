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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import AssetCard from '../asset/AssetCard';
import { Asset, AssetSearchParams } from '../../types/asset.types';
import assetService from '../../api/assetService';
import taxonomyService from '../../api/taxonomyService';
import { LayerOption, CategoryOption, SubcategoryOption } from '../../types/taxonomy.types';
import PaginationControls from '../common/PaginationControls';

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
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
    loadAssets(currentPage, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Common function to load assets with pagination
  const loadAssets = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      
      // Construct search parameters
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
      
      console.log("Fetching assets with params:", searchParams);
      
      const results = await assetService.getAssets(searchParams);
      
      // Normalize the API response consistently
      if (results && results.data) {
        let assets: Asset[] = [];
        let total = 0;

        // Handle both API response formats
        if (Array.isArray(results.data)) {
          // Old format: results.data is the array
          assets = results.data;
          total = results.pagination?.total || results.data.length;
        } else if (typeof results.data === 'object' && results.data !== null && 'items' in results.data && Array.isArray((results.data as any).items)) {
          // New format: results.data.items is the array
          const dataWithItems = results.data as { items: Asset[], total?: number };
          console.log("Using items array from API response:", dataWithItems.items.length);
          assets = dataWithItems.items;
          total = dataWithItems.total || dataWithItems.items.length;
        } else {
          console.warn("Unexpected API response format:", results);
        }

        // Ensure all assets have required properties
        const normalizedAssets = assets.map(asset => ({
          ...asset,
          // Ensure id exists (use _id as fallback)
          id: asset.id || asset._id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          // Ensure these properties exist for UI rendering
          name: asset.name || asset.friendlyName || 'Unnamed Asset',
          description: asset.description || 'No description provided',
          createdAt: asset.createdAt || new Date().toISOString(),
          layer: asset.layer || 'Unknown',
          nnaAddress: asset.nnaAddress || ''
        }));

        setSearchResults(normalizedAssets);
        setTotalAssets(total);
        
        // Update pagination data
        if (results.pagination) {
          setTotalPages(results.pagination.pages || Math.ceil(total / limit));
        }
      } else {
        // Handle empty response
        console.warn("Empty response from asset service");
        setSearchResults([]);
        setTotalAssets(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      // In case of error, show a helpful message
      setSearchResults([]);
      setTotalAssets(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery && !selectedLayer && !selectedCategory && !selectedSubcategory) {
      return;
    }

    // Reset to first page when performing a new search
    setCurrentPage(1);
    loadAssets(1, itemsPerPage);
    
    // Call the onSearch callback with the query
    onSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedLayer('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setCurrentPage(1);
    
    // Load initial assets (first page)
    loadAssets(1, itemsPerPage);
    
    setShowAdvancedFilters(false);
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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAssets(page, itemsPerPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
    loadAssets(1, newItemsPerPage);
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
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
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
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Search"}
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            sx={{ mb: 2 }}
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {(searchQuery || selectedLayer || selectedCategory || selectedSubcategory) && (
            <Button
              color="secondary"
              onClick={handleClearSearch}
              sx={{ mb: 2 }}
            >
              Clear All
            </Button>
          )}
        </Box>

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
                  >
                    <MenuItem value="">
                      <em>Any Layer</em>
                    </MenuItem>
                    {layers.map((layer) => (
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
                  >
                    <MenuItem value="">
                      <em>Any Category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.code} value={category.code}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth disabled={!selectedCategory}>
                  <InputLabel id="subcategory-select-label">Subcategory</InputLabel>
                  <Select
                    labelId="subcategory-select-label"
                    id="subcategory-select"
                    value={selectedSubcategory}
                    label="Subcategory"
                    onChange={handleSubcategoryChange}
                    disabled={!selectedCategory || subcategories.length === 0}
                  >
                    <MenuItem value="">
                      <em>Any Subcategory</em>
                    </MenuItem>
                    {subcategories.map((subcategory) => (
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
              {searchQuery || selectedLayer || selectedCategory || selectedSubcategory
                ? "Search Results"
                : "Recent Assets"}
            </Typography>
            <Chip
              label={`${totalAssets} asset${totalAssets !== 1 ? 's' : ''} ${
                searchQuery || selectedLayer || selectedCategory || selectedSubcategory
                  ? 'found'
                  : 'available'
              }`}
              color="primary"
              variant="outlined"
            />
          </Box>
          <Grid container spacing={3}>
            {searchResults.map((asset) => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <AssetCard asset={asset} />
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination Controls */}
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
        </Box>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* No results message - only show if we've actually searched */}
      {searchResults.length === 0 && (searchQuery || selectedLayer || selectedCategory || selectedSubcategory) && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No assets found</Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AssetSearch;