import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, CircularProgress, Alert } from '@mui/material';
import { Asset } from '../types/asset.types';
import assetService from '../api/assetService';

const AssetEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAsset = async () => {
      if (!id) {
        setError('Asset ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const assetData = await assetService.getAssetById(id);
        setAsset(assetData);
        setDescription(assetData.description || '');
      } catch (error) {
        console.error('Error loading asset:', error);
        setError('Failed to load asset');
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [id]);

  const handleSave = async () => {
    if (!asset || !id) return;

    try {
      setSaving(true);
      setError(null);
      await assetService.updateAsset(id, { description });
      navigate(`/assets/${id}`);
    } catch (error) {
      console.error('Error updating asset:', error);
      setError('Failed to update asset');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/assets/${id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/search-assets')} variant="outlined">
          Back to Search
        </Button>
      </Container>
    );
  }

  if (!asset) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Asset not found
        </Alert>
        <Button onClick={() => navigate('/search-assets')} variant="outlined">
          Back to Search
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Asset: {asset.name}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={4}
          placeholder="Enter asset description..."
          variant="outlined"
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          onClick={handleCancel} 
          variant="outlined"
          disabled={saving}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={saving}
        >
          {saving ? <CircularProgress size={20} /> : 'Save Changes'}
        </Button>
      </Box>
    </Container>
  );
};

export default AssetEditPage;