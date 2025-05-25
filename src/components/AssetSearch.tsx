import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Select,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  CircularProgress,
  Chip,
  Typography,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  AudioFile as AudioIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  DirectionsRun as MovesIcon,
  Public as WorldIcon,
  WorkspacePremium as CrownIcon,
  Lock as LockIcon,
  Clear as ClearIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash';
import axios from 'axios';
import { Asset } from '../types/asset.types';

// Layer configuration for visual identification
const LAYER_CONFIG = {
  G: { icon: AudioIcon, color: '#1976d2', name: 'Songs' },
  S: { icon: PersonIcon, color: '#9c27b0', name: 'Stars' },
  L: { icon: PaletteIcon, color: '#f57c00', name: 'Looks' },
  M: { icon: MovesIcon, color: '#388e3c', name: 'Moves' },
  W: { icon: WorldIcon, color: '#00796b', name: 'Worlds' },
  B: { icon: CrownIcon, color: '#d32f2f', name: 'Branded' },
  P: { icon: LockIcon, color: '#7b1fa2', name: 'Personalize' },
};

interface AssetSearchProps {
  onAssetSelect: (asset: Asset) => void;
  searchParams: { query: string; layer: string };
  setSearchParams: (params: { query: string; layer: string }) => void;
}

const AssetSearch: React.FC<AssetSearchProps> = ({
  onAssetSelect,
  searchParams,
  setSearchParams,
}) => {
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available layers for filtering
  const availableLayers = ['G', 'S', 'L', 'M', 'W', 'B', 'P'];

  // Debounced search function with 300ms delay
  const debouncedSearch = useCallback(
    debounce(async (query: string, layer: string) => {
      if (!query.trim() && !layer) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Log token status for debugging
        const authToken = localStorage.getItem('authToken');
        const testToken = localStorage.getItem('testToken');
        console.log('Token status:', { 
          hasAuthToken: !!authToken, 
          hasTestToken: !!testToken,
          authTokenStart: authToken?.substring(0, 20),
          testTokenStart: testToken?.substring(0, 20)
        });

        // Try the real backend API endpoint first, fallback to direct if proxy fails
        let response;
        try {
          response = await axios.get('/api/assets', {
            params: {
              search: query,
              layer: layer || undefined,
              limit: 20,
            },
            timeout: 5000, // Shorter timeout for proxy attempt
            headers: {
              // Add authorization header if we have a token (clean any newlines/whitespace)
              'Authorization': localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')?.replace(/\s+/g, '')}` : 
                              localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
            },
          });
        } catch (proxyError) {
          console.log('Proxy failed, trying direct backend connection...', proxyError.message);
          // If proxy fails, try direct backend connection
          response = await axios.get('https://registry.reviz.dev/api/assets', {
            params: {
              search: query,
              layer: layer || undefined,
              limit: 20,
            },
            timeout: 10000,
            headers: {
              'Authorization': localStorage.getItem('authToken') ? `Bearer ${localStorage.getItem('authToken')?.replace(/\s+/g, '')}` : 
                              localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
            },
          });
          console.log('Direct backend connection successful!');
        }

        // Validate response structure
        if (!response.data) {
          throw new Error('Invalid response: missing data');
        }

        const results = response.data.items || response.data || [];
        
        // Validate that results is an array
        if (!Array.isArray(results)) {
          throw new Error('Invalid response: expected array of assets');
        }

        // Validate each asset has required fields
        const validatedResults = results.filter(asset => {
          if (!asset || typeof asset !== 'object') return false;
          if (!asset.id || !asset.layer) return false;
          return true;
        });

        setSearchResults(validatedResults);
        
        // Show warning if some results were filtered out
        if (validatedResults.length < results.length) {
          console.warn(`Filtered out ${results.length - validatedResults.length} invalid assets from search results`);
        }
        
      } catch (err) {
        console.error('Search failed:', err);
        
        // Enhanced error handling based on error type
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            // Handle unauthorized - fall back to mock data
            console.log('Backend requires authentication, falling back to mock data');
            setError('Backend requires authentication. Using mock data for testing.');
            
            // Use existing mock data fallback
            const mockAssets: Asset[] = [
              {
                id: 'mock-g-pop-001',
                name: 'G.POP.TSW.001',
                friendlyName: 'Pop Song - Taylor Swift Style',
                nnaAddress: 'G.POP.TSW.001',
                layer: 'G',
                categoryCode: 'POP',
                subcategoryCode: 'TSW',
                type: 'audio',
                gcpStorageUrl: 'gs://mock-bucket/song1.mp3',
                files: [],
                metadata: { duration: '3:24', artist: 'Mock Artist' },
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                createdBy: 'mock-user',
                status: 'active',
                tags: ['pop', 'taylor-swift']
              },
              {
                id: 'mock-s-pop-001',
                name: 'S.POP.PNK.001',
                friendlyName: 'Pop Star - Pink Style',
                nnaAddress: 'S.POP.PNK.001',
                layer: 'S',
                categoryCode: 'POP',
                subcategoryCode: 'PNK',
                type: 'avatar',
                gcpStorageUrl: 'gs://mock-bucket/star1.png',
                files: [],
                metadata: { appearance: 'Pink hair, sparkly outfit' },
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                createdBy: 'mock-user',
                status: 'active',
                tags: ['pop', 'pink']
              },
              {
                id: 'mock-w-bch-001',
                name: 'W.BCH.SUN.001',
                friendlyName: 'Beach World - Sunset',
                nnaAddress: 'W.BCH.SUN.001',
                layer: 'W',
                categoryCode: 'BCH',
                subcategoryCode: 'SUN',
                type: 'environment',
                gcpStorageUrl: 'gs://mock-bucket/beach-sunset.jpg',
                files: [],
                metadata: { time: 'sunset', location: 'tropical beach' },
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                createdBy: 'mock-user',
                status: 'active',
                tags: ['beach', 'sunset']
              }
            ];
            
            const filteredMockAssets = mockAssets.filter((asset: Asset) => {
              const matchesQuery = !query || 
                asset.name.toLowerCase().includes(query.toLowerCase()) ||
                asset.friendlyName?.toLowerCase().includes(query.toLowerCase()) ||
                (asset.tags && asset.tags.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase())));
              
              const matchesLayer = !layer || asset.layer === layer;
              
              return matchesQuery && matchesLayer;
            });
            
            setSearchResults(filteredMockAssets);
            return;
          } else if (err.code === 'ECONNABORTED') {
            setError('Search request timed out. Please check your connection and try again.');
          } else if (err.response?.status === 400) {
            setError('Invalid search parameters. Please check your query and try again.');
          } else if (err.response?.status === 429) {
            setError('Too many search requests. Please wait a moment and try again.');
          } else if (err.response?.status && err.response.status >= 500) {
            setError('Search service is temporarily unavailable. Please try again later.');
          } else if (!err.response) {
            setError('Unable to connect to search service. Please check your internet connection.');
          } else {
            setError(`Search failed with status ${err.response?.status || 'unknown'}. Please try again.`);
          }
        } else if (err instanceof Error) {
          setError(`Search error: ${err.message}`);
        } else {
          setError('Using mock data for testing - backend search endpoint not available yet.');
        }
        
        // Provide mock data for testing when real API fails
        if (query.length > 0) {
          const mockAssets: Asset[] = [
            {
              id: 'mock-g-pop-001',
              name: 'G.POP.TSW.001',
              friendlyName: 'Pop Song - Taylor Swift Style',
              nnaAddress: 'G.POP.TSW.001',
              layer: 'G',
              categoryCode: 'POP',
              subcategoryCode: 'TSW',
              type: 'audio',
              gcpStorageUrl: 'gs://mock-bucket/song1.mp3',
              files: [],
              metadata: { duration: '3:24', artist: 'Mock Artist' },
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              createdBy: 'mock-user',
              status: 'active',
              tags: ['pop', 'taylor-swift']
            },
            {
              id: 'mock-s-pop-001',
              name: 'S.POP.PNK.001',
              friendlyName: 'Pop Star - Pink Style',
              nnaAddress: 'S.POP.PNK.001',
              layer: 'S',
              categoryCode: 'POP',
              subcategoryCode: 'PNK',
              type: 'avatar',
              gcpStorageUrl: 'gs://mock-bucket/star1.png',
              files: [],
              metadata: { appearance: 'Pink hair, sparkly outfit' },
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              createdBy: 'mock-user',
              status: 'active',
              tags: ['pop', 'pink']
            },
            {
              id: 'mock-w-bch-001',
              name: 'W.BCH.SUN.001',
              friendlyName: 'Beach World - Sunset',
              nnaAddress: 'W.BCH.SUN.001',
              layer: 'W',
              categoryCode: 'BCH',
              subcategoryCode: 'SUN',
              type: 'environment',
              gcpStorageUrl: 'gs://mock-bucket/beach-sunset.jpg',
              files: [],
              metadata: { time: 'sunset', location: 'tropical beach' },
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              createdBy: 'mock-user',
              status: 'active',
              tags: ['beach', 'sunset']
            }
          ];
          
          // Filter mock assets based on search criteria
          const filteredMockAssets = mockAssets.filter(asset => {
            const matchesQuery = query === '' || 
              asset.name.toLowerCase().includes(query.toLowerCase()) ||
              asset.friendlyName.toLowerCase().includes(query.toLowerCase()) ||
              (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())));
            
            const matchesLayer = !layer || asset.layer === layer;
            
            return matchesQuery && matchesLayer;
          });
          
          setSearchResults(filteredMockAssets);
        } else {
          setSearchResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Effect to trigger search when params change
  useEffect(() => {
    debouncedSearch(searchParams.query, searchParams.layer);
  }, [searchParams.query, searchParams.layer, debouncedSearch]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchParams({
      ...searchParams,
      query: value,
    });
  };

  // Handle layer filter change
  const handleLayerChange = (layer: string) => {
    setSearchParams({
      ...searchParams,
      layer,
    });
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchParams({
      query: '',
      layer: '',
    });
  };

  // Get layer icon component
  const getLayerIcon = (layer: string) => {
    const config = LAYER_CONFIG[layer as keyof typeof LAYER_CONFIG];
    if (!config) return null;
    
    const IconComponent = config.icon;
    return <IconComponent sx={{ color: config.color, fontSize: 20 }} />;
  };

  // Get accessibility tags display
  const getAccessibilityDisplay = (asset: Asset) => {
    const accessibilityTags = asset.metadata?.Accessibility_Tags || [];
    if (accessibilityTags.length === 0) return null;

    return (
      <Box sx={{ mt: 1 }}>
        {accessibilityTags.slice(0, 3).map((tag: string, index: number) => (
          <Chip
            key={index}
            label={tag}
            size="small"
            color="info"
            variant="outlined"
            sx={{ mr: 0.5, mb: 0.5 }}
            aria-label={`Accessibility feature: ${tag}`}
          />
        ))}
        {accessibilityTags.length > 3 && (
          <Chip
            label={`+${accessibilityTags.length - 3} more`}
            size="small"
            variant="outlined"
            sx={{ mr: 0.5, mb: 0.5 }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* Search Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Search Assets"
          value={searchParams.query}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            endAdornment: searchParams.query && (
              <IconButton
                size="small"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <ClearIcon />
              </IconButton>
            ),
          }}
          aria-label="Search for assets"
        />
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="layer-select-label">Layer</InputLabel>
          <Select
            labelId="layer-select-label"
            value={searchParams.layer}
            onChange={(e) => handleLayerChange(e.target.value)}
            label="Layer"
            aria-label="Filter by asset layer"
          >
            <MenuItem value="">All Layers</MenuItem>
            {availableLayers.map(layer => (
              <MenuItem key={layer} value={layer}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getLayerIcon(layer)}
                  {layer}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Error Message */}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Search Results */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {searchResults.map(asset => (
            <ListItem key={asset.id} divider>
              <ListItemIcon>
                {getLayerIcon(asset.layer)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    {asset.friendlyName || asset.name}
                    {asset.layer === 'B' && (
                      <Tooltip title="Premium branded content">
                        <CrownIcon sx={{ color: 'gold', fontSize: 16 }} />
                      </Tooltip>
                    )}
                    {asset.layer === 'P' && (
                      <Tooltip title="Personalized content">
                        <LockIcon sx={{ color: 'purple', fontSize: 16 }} />
                      </Tooltip>
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {LAYER_CONFIG[asset.layer as keyof typeof LAYER_CONFIG]?.name} • 
                      {asset.nnaAddress || 'No address'}
                    </Typography>
                    {asset.tags && asset.tags.length > 0 && (
                      <Box sx={{ mt: 0.5 }}>
                        {asset.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {asset.tags.length > 3 && (
                          <Chip
                            label={`+${asset.tags.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        )}
                      </Box>
                    )}
                    {getAccessibilityDisplay(asset)}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => onAssetSelect(asset)}
                  aria-label={`Add ${asset.friendlyName || asset.name} to selection`}
                >
                  Add
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          
          {/* Empty State */}
          {searchResults.length === 0 && !loading && (searchParams.query || searchParams.layer) && (
            <ListItem>
              <ListItemText
                primary="No assets found"
                secondary="Try adjusting your search terms or layer filter"
              />
            </ListItem>
          )}
          
          {/* Initial State */}
          {searchResults.length === 0 && !loading && !searchParams.query && !searchParams.layer && (
            <ListItem>
              <ListItemText
                primary="Start typing to search for assets"
                secondary="Enter a search term or select a layer to find assets"
              />
            </ListItem>
          )}
        </List>
      )}
    </Box>
  );
};

export default AssetSearch;