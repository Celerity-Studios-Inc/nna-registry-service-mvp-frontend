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
          } else if (results.data.items && Array.isArray(results.data.items)) {
            // New format: results.data.items is the array
            console.log("Using items array from API response:", results.data.items.length);
            setSearchResults(results.data.items);
            setTotalAssets(results.data.total || results.data.items.length);
          } else {
            console.warn("Unexpected API response format:", results);
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
    if (!searchQuery && !selectedLayer && !selectedCategory && !selectedSubcategory) {
      return;
    }

    setIsLoading(true);

    try {
      // Construct search parameters
      const searchParams: AssetSearchParams = {
        search: searchQuery || undefined,
        layer: selectedLayer || undefined,
        category: selectedCategory || undefined,
        subcategory: selectedSubcategory || undefined,
      };

      console.log("Searching with params:", searchParams);

      // Call the search API
      const results = await assetService.getAssets(searchParams);
      
      // Update state with results
      if (results && results.data) {
        if (Array.isArray(results.data)) {
          // Old format: results.data is the array
          console.log("Search results:", results.data.length);
          setSearchResults(results.data);
          setTotalAssets(results.pagination?.total || results.data.length);
        } else if (results.data.items && Array.isArray(results.data.items)) {
          // New format: results.data.items is the array
          console.log("Search results from items array:", results.data.items.length);
          setSearchResults(results.data.items);
          setTotalAssets(results.data.total || results.data.items.length);
        } else {
          console.warn("Received unexpected format from assets search:", results);
          setSearchResults([]);
          setTotalAssets(0);
        }
      } else {
        console.warn("Received empty or invalid results from assets search");
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

      {/* Search results */}
      {searchResults.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Search Results
            </Typography>
            <Chip 
              label={`${totalAssets} asset${totalAssets !== 1 ? 's' : ''} found`} 
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