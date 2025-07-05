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
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
  InsertDriveFile as DefaultFileIcon,
} from '@mui/icons-material';
import { Asset, AssetFile } from '../types/asset.types';
import assetService from '../api/assetService';
import taxonomyService from '../api/taxonomyService';
import AssetThumbnail from '../components/common/AssetThumbnail';
import { isVideoUrl } from '../utils/videoThumbnail';

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
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Get appropriate icon for file type
  const getFileIcon = (file: AssetFile) => {
    const contentType = (file.contentType || '').toLowerCase();

    if (contentType.startsWith('image/')) {
      return <ImageIcon color="primary" />;
    } else if (contentType.startsWith('audio/')) {
      return <AudioIcon color="secondary" />;
    } else if (contentType.startsWith('video/')) {
      return <VideoIcon color="error" />;
    }

    return <DefaultFileIcon color="action" />;
  };

  // Get taxonomy path display
  const getTaxonomyPath = () => {
    if (!asset) return '';

    try {
      return taxonomyService.getTaxonomyPath(
        asset.layer,
        asset.category || asset.categoryCode,
        asset.subcategory || asset.subcategoryCode
      );
    } catch (error) {
      console.error('Error getting taxonomy path:', error);
      // Fallback display
      const parts = [];
      if (asset.layer) parts.push(asset.layer);
      if (asset.category || asset.categoryCode)
        parts.push(asset.category || asset.categoryCode);
      if (asset.subcategory || asset.subcategoryCode)
        parts.push(asset.subcategory || asset.subcategoryCode);
      return parts.join(' > ');
    }
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

  // Extract NNA addressing information from asset data with proper fallbacks
  const hfn =
    asset.metadata?.humanFriendlyName ||
    asset.metadata?.hfn ||
    asset.friendlyName ||
    asset.name;

  // For MFA, use the nnaAddress field (primary field) or check metadata properties
  // Using consistent fallback pattern across all components
  // CRITICAL FIX: Backend returns "nna_address" (with underscore), not "nnaAddress"
  const mfa =
    (asset as any).nna_address ||  // Backend field format with underscore
    asset.nnaAddress ||           // Frontend field format (if normalized)
    asset.metadata?.machineFriendlyAddress ||
    asset.metadata?.mfa;

  // If we don't have a valid MFA, log a warning
  if (!mfa) {
    console.warn(
      'Warning: No MFA found in asset! Asset ID:',
      asset.id || asset._id
    );
  }

  // Get preview URL if available
  const getPreviewUrl = () => {
    if (asset.files && asset.files.length > 0) {
      const file = asset.files[0];
      return file.thumbnailUrl || file.url;
    }
    return asset.gcpStorageUrl;
  };

  const previewUrl = getPreviewUrl();

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
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">{asset.name}</Typography>
          <Chip
            label={asset.status || 'active'}
            color={asset.status === 'active' ? 'success' : 'default'}
            sx={{ ml: 'auto' }}
          />
        </Box>

        <Chip label={getTaxonomyPath()} variant="outlined" sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Left column with preview */}
          <Grid item xs={12} md={5}>
            <Card>
              {/* Enhanced preview that handles both images and videos properly */}
              <Box
                sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'background.default',
                  p: 2,
                }}
              >
                {previewUrl ? (
                  // Use smart AssetThumbnail component for proper video/image handling
                  isVideoUrl(previewUrl) ? (
                    <AssetThumbnail 
                      asset={asset} 
                      width={280} 
                      height={280} 
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt={asset.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        console.warn(`Image failed to load: ${previewUrl}`);
                        // Fallback to AssetThumbnail on image load error
                        const target = e.target as HTMLImageElement;
                        const parent = target.parentElement;
                        if (parent) {
                          target.style.display = 'none';
                          // Create fallback thumbnail
                          const fallback = document.createElement('div');
                          fallback.style.display = 'flex';
                          fallback.style.alignItems = 'center';
                          fallback.style.justifyContent = 'center';
                          fallback.innerHTML = `<span style="color: #666; font-size: 14px;">Preview not available</span>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  )
                ) : (
                  // Use AssetThumbnail as fallback for assets without preview URL
                  <AssetThumbnail 
                    asset={asset} 
                    width={280} 
                    height={280} 
                  />
                )}
              </Box>
              <CardContent>
                <Typography variant="body1" gutterBottom>
                  <strong>Description:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {asset.description || 'No description provided'}
                </Typography>

                {/* Tags */}
                {asset.tags && asset.tags.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Tags:</strong>
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {asset.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right column with details */}
          <Grid item xs={12} md={7}>
            {/* NNA Address section */}
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                mb: 3, 
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                border: '1px solid #e0e7ff'
              }}
            >
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                gutterBottom
                sx={{ color: 'primary.main', mb: 2 }}
              >
                🔗 NNA Addressing
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    border: '1px solid #e3f2fd'
                  }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Human-Friendly Name (HFN)
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      sx={{ 
                        wordBreak: 'break-word',
                        fontFamily: 'monospace',
                        fontSize: '0.95rem',
                        color: 'success.main',
                        bgcolor: '#f8f9fa',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px dashed #dee2e6'
                      }}
                    >
                      {hfn || 'Not available'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'background.paper', 
                    borderRadius: 2,
                    border: '1px solid #e3f2fd'
                  }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Machine-Friendly Address (MFA)
                    </Typography>
                    <Typography
                      variant="body1"
                      fontFamily="monospace"
                      sx={{ 
                        wordBreak: 'break-word',
                        fontSize: '0.95rem',
                        color: 'info.main',
                        bgcolor: '#f8f9fa',
                        p: 1.5,
                        borderRadius: 1,
                        border: '1px dashed #dee2e6'
                      }}
                    >
                      {mfa || 'Not available'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Basic Details */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                gutterBottom
                sx={{ color: 'text.primary', mb: 2 }}
              >
                📋 Asset Details
              </Typography>
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Asset ID"
                    secondary={asset.id || asset._id || 'Unknown'}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      fontFamily: 'monospace',
                      sx: { wordBreak: 'break-all' },
                    }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Layer"
                    secondary={asset.layer || 'Unknown'}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Category"
                    secondary={
                      asset.category || asset.categoryCode || 'Unknown'
                    }
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Subcategory"
                    secondary={
                      asset.subcategory || asset.subcategoryCode || 'Unknown'
                    }
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Created"
                    secondary={formatDate(asset.createdAt)}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText
                    primary="Last Updated"
                    secondary={formatDate(asset.updatedAt)}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
                {/* File Information - Adapted for backend structure */}
                {asset.gcpStorageUrl && (
                  <>
                    <Divider component="li" />
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary="Filename"
                        secondary={(() => {
                          // Extract filename from GCS URL or use asset name with extension
                          if (asset.gcpStorageUrl) {
                            const urlParts = asset.gcpStorageUrl.split('/');
                            const filename = urlParts[urlParts.length - 1];
                            return filename || `${asset.name}.mp4`;
                          }
                          return `${asset.name || 'Unknown'}.mp4`;
                        })()}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                        }}
                        secondaryTypographyProps={{
                          variant: 'body2',
                          fontFamily: 'monospace',
                          sx: { wordBreak: 'break-all' },
                        }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary="File Type"
                        secondary={(() => {
                          // Determine file type from URL extension
                          if (asset.gcpStorageUrl) {
                            const url = asset.gcpStorageUrl.toLowerCase();
                            if (url.includes('.mp4')) return 'video/mp4';
                            if (url.includes('.jpg') || url.includes('.jpeg')) return 'image/jpeg';
                            if (url.includes('.png')) return 'image/png';
                            if (url.includes('.mp3')) return 'audio/mp3';
                            if (url.includes('.wav')) return 'audio/wav';
                          }
                          // Default based on layer
                          if (asset.layer === 'W' || asset.layer === 'M') return 'video/mp4';
                          if (asset.layer === 'G') return 'audio/mp3';
                          if (asset.layer === 'S' || asset.layer === 'L') return 'image/jpeg';
                          return 'Unknown';
                        })()}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                        }}
                      />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary="File URL"
                        secondary={asset.gcpStorageUrl}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                        }}
                        secondaryTypographyProps={{
                          variant: 'body2',
                          fontFamily: 'monospace',
                          sx: { 
                            wordBreak: 'break-all',
                            fontSize: '0.75rem'
                          },
                        }}
                      />
                    </ListItem>
                  </>
                )}
                {asset.createdBy && (
                  <>
                    <Divider component="li" />
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemText
                        primary="Created By"
                        secondary={asset.createdBy}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.secondary',
                        }}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>

            {/* Files section */}
            {asset.files && asset.files.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Files
                </Typography>
                <List disablePadding>
                  {asset.files.map((file, index) => (
                    <React.Fragment key={file.id || index}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem sx={{ py: 1 }}>
                        <Box sx={{ mr: 2 }}>{getFileIcon(file)}</Box>
                        <ListItemText
                          primary={file.filename || `File ${index + 1}`}
                          secondary={`${file.contentType || 'Unknown type'}, ${
                            file.size
                              ? (file.size / 1024).toFixed(1) + ' KB'
                              : 'Unknown size'
                          }`}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{
                            variant: 'body2',
                            color: 'text.secondary',
                          }}
                        />
                        {file.url && (
                          <Button
                            size="small"
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                          >
                            View
                          </Button>
                        )}
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>

          {/* Metadata section at bottom */}
          {asset.metadata && Object.keys(asset.metadata).length > 0 && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ color: 'text.primary', mb: 2 }}
                >
                  🔧 Additional Metadata
                </Typography>
                <Box
                  sx={{
                    bgcolor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e9ecef',
                    overflow: 'hidden'
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      padding: '16px',
                      whiteSpace: 'pre-wrap',
                      overflowX: 'auto',
                      fontFamily: 'Monaco, "Roboto Mono", monospace',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                      color: '#495057',
                      background: 'transparent'
                    }}
                  >
                    {JSON.stringify(asset.metadata, null, 2)}
                  </pre>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default AssetDetail;
