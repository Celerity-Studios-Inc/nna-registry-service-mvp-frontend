import React from 'react';
import { Typography, Box } from '@mui/material';
import AssetSearch from '../components/search/AssetSearch';
import EnvironmentDebugger from '../components/debug/EnvironmentDebugger';

const SearchAssetsPage: React.FC = () => {
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Search is handled directly in the AssetSearch component
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Browse Assets
      </Typography>

      <EnvironmentDebugger />

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
    </Box>
  );
};

export default SearchAssetsPage;