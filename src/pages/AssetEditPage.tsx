import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, CircularProgress, Alert, Chip, Paper, Divider } from '@mui/material';
import { Asset } from '../types/asset.types';
import assetService from '../api/assetService';

const AssetEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [creatorDescription, setCreatorDescription] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
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
        // Set Creator's Description from metadata or fallback to name field
        setCreatorDescription(assetData.creatorDescription || assetData.metadata?.creatorDescription || assetData.friendlyName || assetData.name || '');
        setDescription(assetData.description || '');
        setTags(assetData.tags || []);
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
      // Use asset.name for the backend API (which expects asset name, not MongoDB ID)
      const assetIdentifier = asset.name || id;
      console.log('🔍 Update attempt - using asset identifier:', assetIdentifier, 'for asset:', asset.name);
      // Include Creator's Description in the update payload
      await assetService.updateAsset(assetIdentifier, { 
        description, 
        tags,
        metadata: {
          ...asset.metadata,
          creatorDescription: creatorDescription
        }
      });
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
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Creator's Description Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Creator's Description
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This is the original description provided by the creator when the asset was registered.
          </Typography>
          <TextField
            value={creatorDescription}
            onChange={(e) => setCreatorDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Enter creator's description..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(25, 118, 210, 0.04)',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.06)',
                },
                '&.Mui-focused': {
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                }
              }
            }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* AI-Generated Description Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            AI-Generated Description
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This description was generated by AI to enhance searchability and provide additional context.
          </Typography>
          <TextField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Enter AI-generated description..."
            variant="outlined"
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Tags Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Tags
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add tags to improve searchability and categorization of this asset.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => setTags(tags.filter((_, i) => i !== index))}
                variant="outlined"
                sx={{
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white'
                  }
                }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Add Tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              size="small"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTag.trim()) {
                  setTags([...tags, newTag.trim()]);
                  setNewTag('');
                }
              }}
            />
            <Button
              onClick={() => {
                if (newTag.trim()) {
                  setTags([...tags, newTag.trim()]);
                  setNewTag('');
                }
              }}
              variant="outlined"
              size="small"
            >
              Add
            </Button>
          </Box>
        </Box>
      </Paper>
      
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