import React from 'react';
import { Typography, Box } from '@mui/material';
import AssetSearch from '../components/search/AssetSearch';

const SearchAssetsPage: React.FC = () => {
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
          sortBy: "createdAt",
          order: "desc",
          // Start with 12 assets per page (good grid layout: 3 columns x 4 rows)
          limit: 12,
          page: 1
        }}
      />
    </Box>
  );
};

export default SearchAssetsPage;
