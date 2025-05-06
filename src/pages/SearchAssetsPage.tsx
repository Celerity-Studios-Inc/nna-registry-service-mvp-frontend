import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import AssetSearch from '../components/search/AssetSearch';
import { Asset } from '../types/asset.types';

const SearchAssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    // Placeholder for fetching assets
    setAssets([]);
  }, []);

  const handleSearch = (query: string) => {
    // Placeholder for search logic
    console.log('Search query:', query);
  };

  return (
    <div>
      {' '}
      <Typography variant="h5" gutterBottom>
        {' '}
        Search Assets{' '}
      </Typography>{' '}
      <AssetSearch onSearch={handleSearch} />{' '}
      {assets.length === 0 && <Typography>No assets found.</Typography>}{' '}
    </div>
  );
};
export default SearchAssetsPage;
