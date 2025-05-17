import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { Box, TextField, Button, Grid, Typography, Pagination, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { assetService } from '../../api/assetService';
import { Asset, AssetSearchParams } from '../../types/asset.types';
import AssetCard from './AssetCard';

const AssetSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useState<AssetSearchParams>({ search: '', page: 1, limit: 10 });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce(async (params: AssetSearchParams) => {
      try {
        setLoading(true);
        setError(null);
        const { assets: fetchedAssets, pagination: fetchedPagination } = await assetService.getAssets(params);
        setAssets(fetchedAssets);
        setPagination(fetchedPagination);
        if (params.search) {
          const newSearches = [params.search, ...recentSearches.filter(s => s !== params.search)].slice(0, 5);
          setRecentSearches(newSearches);
          localStorage.setItem('recentSearches', JSON.stringify(newSearches));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assets. Please try again.');
        setAssets([]);
        setPagination({ currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 });
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 500),
    [recentSearches]
  );

  useEffect(() => {
    debouncedSearch(searchParams);
  }, [searchParams, debouncedSearch]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setSearchParams({ ...searchParams, page });
  };

  return (
    <Box>
      {recentSearches.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Recent Searches</Typography>
          {recentSearches.map((search, index) => (
            <Button key={index} onClick={() => setSearchParams({ ...searchParams, search })}>
              {search}
            </Button>
          ))}
        </Box>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField
          label="Search Assets"
          value={searchParams.search}
          onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Layer</InputLabel>
          <Select
            value={searchParams.layer || ''}
            onChange={(e) => setSearchParams({ ...searchParams, layer: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="S">Stars</MenuItem>
            <MenuItem value="W">Worlds</MenuItem>
            <MenuItem value="L">Looks</MenuItem>
            <MenuItem value="M">Moves</MenuItem>
            <MenuItem value="G">Songs</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={searchParams.category || ''}
            onChange={(e) => setSearchParams({ ...searchParams, category: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="POP">Pop</MenuItem>
            <MenuItem value="ROK">Rock</MenuItem>
            <MenuItem value="CST">Concert Stages</MenuItem>
            <MenuItem value="BCH">Beach</MenuItem>
            <MenuItem value="TRO">Tropical</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Subcategory</InputLabel>
          <Select
            value={searchParams.subcategory || ''}
            onChange={(e) => setSearchParams({ ...searchParams, subcategory: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="BAS">Base</MenuItem>
            <MenuItem value="FES">Festival</MenuItem>
            <MenuItem value="SUN">Sunset</MenuItem>
            <MenuItem value="TRO">Tropical</MenuItem>
            <MenuItem value="PRO">Professional</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Tags (comma-separated)"
          value={searchParams.tags ? searchParams.tags.join(',') : ''}
          onChange={(e) => setSearchParams({ ...searchParams, tags: e.target.value.split(',').map(tag => tag.trim()) })}
        />
        <TextField
          label="Start Date"
          type="date"
          value={searchParams.startDate || ''}
          onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          value={searchParams.endDate || ''}
          onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={searchParams.status || ''}
            onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {error && <Typography color="error">{error}</Typography>}
      {assets.length === 0 && !error && !loading && <Typography>No assets found.</Typography>}
      {loading && <Typography>Loading...</Typography>}
      <Grid container spacing={2}>
        {assets.map(asset => (
          <Grid item key={asset.id}>
            <AssetCard asset={asset} />
          </Grid>
        ))}
      </Grid>
      {pagination.totalPages > 1 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
          />
        </Box>
      )}
    </Box>
  );
};

export default AssetSearch;