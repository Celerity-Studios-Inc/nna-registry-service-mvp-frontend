import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Check as CheckIcon,
  InsertDriveFile as FileIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  TextSnippet as TextIcon
} from '@mui/icons-material';
import { AssetMetadata } from './MetadataForm';
import taxonomyService from '../../api/taxonomyService';

interface ReviewSubmitProps {
  assetMetadata: AssetMetadata;
  layerCode: string;
  categoryCode: string;
  subcategoryCode: string;
  files: File[];
  onEditStep: (step: number) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

// File type icons mapping
const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <ImageIcon />;
  if (fileType.startsWith('audio/')) return <AudioIcon />;
  if (fileType.startsWith('video/')) return <VideoIcon />;
  if (fileType.startsWith('text/')) return <TextIcon />;
  if (fileType.includes('json') || fileType.includes('javascript') || fileType.includes('xml')) return <CodeIcon />;
  return <FileIcon />;
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * ReviewSubmit component - Final review step for asset registration
 * Shows all entered data and previews before submission
 */
const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
  assetMetadata,
  layerCode,
  categoryCode,
  subcategoryCode,
  files,
  onEditStep,
  onSubmit,
  loading,
  error
}) => {
  // Get taxonomy path
  const taxonomyPath = taxonomyService.getTaxonomyPath(layerCode, categoryCode, subcategoryCode);

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Review and Submit
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review all the information below before submitting.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Taxonomy Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Taxonomy</Typography>
                <Button
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={() => onEditStep(0)}
                >
                  Edit
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Layer:
                  </Typography>
                  <Typography variant="body1">
                    {taxonomyService.getLayer(layerCode)?.name || layerCode}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Category:
                  </Typography>
                  <Typography variant="body1">
                    {categoryCode ? (taxonomyService.getCategory(layerCode, categoryCode)?.name || categoryCode) : 'None selected'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subcategory:
                  </Typography>
                  <Typography variant="body1">
                    {subcategoryCode ? 
                      (taxonomyService.getSubcategory(layerCode, categoryCode, subcategoryCode)?.name || subcategoryCode) 
                      : 'None selected'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box mt={2} p={1.5} bgcolor="background.default" borderRadius={1}>
                <Typography variant="body2">
                  <strong>Full Path:</strong> {taxonomyPath || 'Incomplete taxonomy selection'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Asset Details */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Asset Details</Typography>
                <Button
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={() => onEditStep(2)}
                >
                  Edit
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name:
                  </Typography>
                  <Typography variant="body1">
                    {assetMetadata.name || 'Not provided'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description:
                  </Typography>
                  <Typography variant="body1">
                    {assetMetadata.description || 'Not provided'}
                  </Typography>
                </Grid>
                
                {assetMetadata.source && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Source:
                    </Typography>
                    <Typography variant="body1">
                      {assetMetadata.source}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {assetMetadata.tags && assetMetadata.tags.length > 0 ? (
                      assetMetadata.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No tags provided
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                {/* Layer-specific metadata if available */}
                {assetMetadata.layerSpecificData && Object.keys(assetMetadata.layerSpecificData).length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {layerCode} Layer-specific Information:
                    </Typography>
                    <List dense>
                      {Object.entries(assetMetadata.layerSpecificData).map(([key, value]) => (
                        value && (
                          <ListItem key={key} disablePadding>
                            <ListItemText 
                              primary={`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`}
                            />
                          </ListItem>
                        )
                      ))}
                    </List>
                  </Grid>
                )}
                
                {/* Auto-generated assets */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Auto-generated Related Assets:
                  </Typography>
                  <Box sx={{ mt: 1, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      {/* Training Data Asset */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Chip 
                              size="small" 
                              label="Training Data"
                              sx={{ bgcolor: '#607d8b', color: 'white', mr: 1 }}
                            />
                            <Chip 
                              size="small" 
                              variant="outlined"
                              label="Auto-generated"
                            />
                          </Box>
                          <Typography variant="body2">
                            <strong>Name:</strong> T.{layerCode}.{categoryCode}.{subcategoryCode}.001.set
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            <strong>MFA:</strong> T.{layerCode}.001.001.001.set
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Contains prompts, reference images, and videos used for training.
                          </Typography>
                        </Box>
                      </Grid>
                      
                      {/* Rights Data Asset */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Chip 
                              size="small" 
                              label="Rights Data"
                              sx={{ bgcolor: '#673ab7', color: 'white', mr: 1 }}
                            />
                            <Chip 
                              size="small" 
                              variant="outlined"
                              label="Auto-generated"
                            />
                          </Box>
                          <Typography variant="body2">
                            <strong>Name:</strong> R.{categoryCode}.{subcategoryCode}.001.json
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            <strong>MFA:</strong> R.001.001.001.json
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Contains licensing, attribution and rights information.
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                      These assets will be automatically generated when you submit this registration and will have a 1:1 mapping with your primary asset.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Files and Preview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">Files and Preview</Typography>
                <Button
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={() => onEditStep(3)}
                >
                  Edit
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {files.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No files uploaded
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {files.map((file, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            zIndex: 1,
                            bgcolor: 'primary.main',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          Primary Asset
                        </Box>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          <CardContent>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 1,
                                justifyContent: 'center',
                                height: 120,
                                overflow: 'hidden',
                                bgcolor: 'background.default',
                                borderRadius: 1
                              }}
                            >
                              {file.type.startsWith('image/') ? (
                                <Box 
                                  component="img" 
                                  src={URL.createObjectURL(file)} 
                                  alt={file.name}
                                  sx={{ 
                                    maxHeight: '100%', 
                                    maxWidth: '100%',
                                    objectFit: 'contain'
                                  }}
                                />
                              ) : (
                                <Box sx={{ fontSize: 40 }}>
                                  {getFileIcon(file.type)}
                                </Box>
                              )}
                            </Box>
                            <Typography variant="body2" noWrap title={file.name}>
                              {file.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(file.size)} • {file.type}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
              onClick={onSubmit}
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Submitting...' : 'Submit Asset'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReviewSubmit;