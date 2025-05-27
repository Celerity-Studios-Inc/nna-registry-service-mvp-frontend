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
import AssetCard from '../asset/AssetCard';
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
    const loadInitialAssets = async () => {
      try {
        setIsLoading(true);
        const results = await assetService.getAssets();

        // Handle both API response formats: results.data as array, or results.data.items as array
        if (results && results.data) {
          if (Array.isArray(results.data)) {
            // Old format: results.data is the array
            setSearchResults(results.data);
            setTotalAssets(results.pagination?.total || results.data.length);
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
            console.log(
              'Using items array from API response:',
              dataWithItems.items.length
            );
            setSearchResults(dataWithItems.items);
            setTotalAssets(dataWithItems.total || dataWithItems.items.length);
          } else {
            console.warn('Unexpected API response format:', results);
            setSearchResults([]);
            setTotalAssets(0);
          }
        }
      } catch (error) {
        console.error('Error loading initial assets:', error);
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

  const handleSearch = async () => {
    if (
      !searchQuery &&
      !selectedLayer &&
      !selectedCategory &&
      !selectedSubcategory
    ) {
      return;
    }

    setIsLoading(true);

    try {
      // Task 9: Enhanced search with backend filtering
      const searchParams: AssetSearchParams = {
        search: searchQuery || undefined,
        layer: selectedLayer || undefined,
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
        limit: 20 // Add limit for better performance
      };

      // Task 9: Add console log to confirm backend query
      console.log('Querying backend with params:', searchParams);

      // Call the search API with enhanced parameters
      const results = await assetService.getAssets(searchParams);

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

        // Task 9: Remove frontend filtering, rely on backend results
        console.log(`Received ${assetResults.length} assets from backend search`);
        
        // Set results directly from backend (backend handles filtering)
        setSearchResults(assetResults);
        setTotalAssets(totalCount);
      } else {
        console.warn('Received empty or invalid results from assets search');
        setSearchResults([]);
        setTotalAssets(0);
      }

      // Call the onSearch callback with the query
      onSearch(searchQuery);
    } catch (error) {
      console.error('Error searching assets:', error);
      setSearchResults([]);
      setTotalAssets(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedLayer('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSearchResults([]);
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
          }}
        >
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            sx={{ mb: 2 }}
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
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
