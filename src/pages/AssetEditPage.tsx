import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, CircularProgress, Alert, Chip, Paper, Divider, Grid } from '@mui/material';
import { Asset } from '../types/asset.types';
import assetService from '../api/assetService';
import { taxonomyService } from '../services/simpleTaxonomyService';

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

  // Get taxonomy path for breadcrumb display (manual implementation)
  const getTaxonomyPath = () => {
    if (!asset) return '';

    const layer = asset.layer;
    const category = asset.category || asset.categoryCode;
    const subcategory = asset.subcategory || asset.subcategoryCode;

    // Layer name mapping
    const layerNames: Record<string, string> = {
      'G': 'Songs',
      'S': 'Stars', 
      'L': 'Looks',
      'M': 'Moves',
      'W': 'Worlds',
      'C': 'Composites',
      'B': 'Branded',
      'P': 'Personalize',
      'T': 'Training Data',
      'R': 'Rights'
    };

    // Simple category name mapping  
    const categoryNames: Record<string, string> = {
      'POP': 'Pop',
      'ROK': 'Rock',
      'DNC': 'Dance Electronic',
      'HIP': 'Hip Hop',
      'CAS': 'Casual',
      'PRF': 'Performance',
      'BCH': 'Beach',
      'LAT': 'Latin'
    };

    // Simple subcategory name mapping
    const subcategoryNames: Record<string, string> = {
      'BAS': 'Base',
      'STR': 'Streetwear',
      'EXP': 'Experimental',
      'RSM': 'Romantic'
    };

    const layerName = layerNames[layer] || layer;
    const categoryName = categoryNames[category] || category;
    const subcategoryName = subcategoryNames[subcategory] || subcategory;

    return `${layerName} > ${categoryName} > ${subcategoryName}`;
  };

  // Get MFA (same logic as AssetDetailPage)
  const getMFA = () => {
    if (!asset) return '';
    return (asset as any).nna_address || asset.nnaAddress || asset.metadata?.machineFriendlyAddress || asset.metadata?.mfa || '';
  };

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
        // Fix field mapping: Phase 2B backend sends creatorDescription and stores AI content in description
        setCreatorDescription(assetData.creatorDescription || assetData.name || '');
        setDescription(assetData.description || assetData.aiMetadata?.generatedDescription || assetData.aiDescription || '');
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
      // Phase 2B: Send correct field mapping to backend
      await assetService.updateAsset(assetIdentifier, { 
        description: description, // Store AI-generated description in description field
        creatorDescription: creatorDescription, // Store Creator's Description in dedicated field
        tags
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
      
      {/* Breadcrumb - Consistent with View Details page */}
      <Chip label={getTaxonomyPath()} variant="outlined" sx={{ mb: 3 }} />
      
      {/* NNA Addressing - Same as View Details page */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          🔗 NNA Addressing
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
              Human-Friendly Name (HFN)
            </Typography>
            <Typography 
              variant="body2" 
              fontFamily="monospace" 
              sx={{ 
                bgcolor: '#ffffff', 
                p: 1, 
                borderRadius: 1, 
                border: '1px solid #e0e0e0',
                color: 'success.main'
              }}
            >
              {asset.name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
              Machine-Friendly Address (MFA)
            </Typography>
            <Typography 
              variant="body2" 
              fontFamily="monospace" 
              sx={{ 
                bgcolor: '#ffffff', 
                p: 1, 
                borderRadius: 1, 
                border: '1px solid #e0e0e0',
                color: 'info.main'
              }}
            >
              {getMFA() || 'Not available'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
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

        {/* Description Section (AI-Generated) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            AI-generated description that enhances searchability and provides additional context.
          </Typography>
          <TextField
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Enter description..."
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