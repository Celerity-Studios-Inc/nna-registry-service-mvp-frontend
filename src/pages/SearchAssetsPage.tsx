import React, { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import AssetSearch from '../components/search/AssetSearch';
import { Asset } from '../types/asset.types';
import assetService from '../api/assetService';
import axios from 'axios';

const SearchAssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load assets when page loads
  useEffect(() => {
    const loadInitialAssets = async () => {
      try {
        setIsLoading(true);
        // Use the same working pattern as AssetSearch.tsx
        const searchParams = {
          limit: 12,
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
          console.log('Proxy failed, trying direct backend connection...', proxyError instanceof Error ? proxyError.message : 'Unknown error');
          // If proxy fails, try direct backend connection
          try {
            response = await axios.get('https://registry.reviz.dev/api/assets', {
              params: searchParams,
              timeout: 8000,
              headers: {
                'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                                localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
              },
            });
          } catch (directError) {
            console.error('Direct backend connection failed:', directError instanceof Error ? directError.message : 'Unknown error');
            throw new Error('Failed to load assets from both proxy and direct backend');
          }
        }
        if (response && response.data) {
          // Handle both API response formats
          if (Array.isArray(response.data)) {
            // Old format: response.data is the array
            setAssets(response.data);
          } else if (
            typeof response.data === 'object' &&
            response.data !== null &&
            'items' in response.data &&
            Array.isArray((response.data as any).items)
          ) {
            // New format: response.data.items is the array
            const dataWithItems = response.data as { items: Asset[] };
            console.log(
              'Using items array from API response:',
              dataWithItems.items.length
            );
            setAssets(dataWithItems.items);
          } else {
            console.warn('Unexpected API response format:', response);
            setAssets([]);
          }
        } else {
          setAssets([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading initial assets:', err);
        setError('Could not load assets. Please try again later.');
        setAssets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialAssets();
  }, []);

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Search is handled directly in the AssetSearch component
    // but we could do additional processing here if needed
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Browse Assets
      </Typography>

      <AssetSearch
        onSearch={handleSearch}
        initialParams={{
          // Default to sorting by most recent
          sort: 'createdAt',
          order: 'desc',
          // Limit to 10 most recent assets by default
          limit: 10,
        }}
      />

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {!isLoading && !error && assets.length === 0 && (
        <Typography sx={{ mt: 2 }}>
          No assets found. Try creating your first asset or adjusting your
          search criteria.
        </Typography>
      )}
    </Box>
  );
};

export default SearchAssetsPage;
