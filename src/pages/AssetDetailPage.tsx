import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Asset } from '../types/asset.types';
import assetService from '../api/assetService';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [asset, setAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load asset data
  useEffect(() => {
    const loadAsset = async () => {
      try {
        setLoading(true);
        if (!id) throw new Error('Asset ID is required');

        const loadedAsset = await assetService.getAssetById(id);
        setAsset(loadedAsset);
        setError(null);
      } catch (err) {
        console.error('Error loading asset:', err);
        setError(err instanceof Error ? err.message : 'Failed to load asset');
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !asset) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Asset not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/search-assets')}
          variant="outlined"
        >
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/search-assets')}
        variant="outlined"
        sx={{ mb: 3 }}
      >
        Back to Search
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {asset.name}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Basic Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>ID:</strong> {asset.id}
              </Typography>
              <Typography variant="body1">
                <strong>Description:</strong> {asset.description}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong>
                <Chip
                  label={asset.status}
                  color={asset.status === 'active' ? 'success' : 'default'}
                  size="small"
                />
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Technical Details
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                <strong>Version:</strong> {asset.version?.number}
              </Typography>
              <Typography variant="body1">
                <strong>Created At:</strong>
                {formatDate(asset.createdAt || '')}
              </Typography>
              <Typography variant="body1">
                <strong>Updated At:</strong>
                {formatDate(asset.updatedAt || '')}
              </Typography>
            </Box>
          </Grid>

          {asset.metadata && (
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
              >
                Additional Metadata
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(asset.metadata, null, 2)}
                </pre>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default AssetDetail;
