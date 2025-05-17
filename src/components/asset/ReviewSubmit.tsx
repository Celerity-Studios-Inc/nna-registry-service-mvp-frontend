import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Label as TagIcon,
  Code as CodeIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  PictureAsPdf as PdfIcon,
  InsertChart as DataIcon,
  Check as SubmitIcon,
  ChevronLeft,
  Public as PublicIcon,
} from '@mui/icons-material';
import { FileUploadResponse } from '../../types/asset.types';
import taxonomyMapper from '../../api/taxonomyMapper';

// Props interface
interface ReviewSubmitProps {
  assetData: {
    name: string;
    description: string;
    source: string; // Source field
    layer: string;
    layerName: string;
    categoryCode: string;
    categoryName: string;
    subcategoryCode: string;
    subcategoryName: string;
    hfn: string;
    mfa: string;
    sequential: string;
    files: File[];
    uploadedFiles: FileUploadResponse[];
    tags?: string[];
    components?: any[]; // Component assets for Composite (C) layer
  };
  onEditStep: (step: number) => void;
  loading?: boolean;
  error?: string | null;
  onSubmit?: () => void; // New submit handler
  isSubmitting?: boolean; // Flag to show loading state
}

// Helper function to get file icon based on MIME type
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return <ImageIcon color="primary" />;
  } else if (mimeType.startsWith('audio/')) {
    return <AudioIcon color="secondary" />;
  } else if (mimeType.startsWith('video/')) {
    return <VideoIcon color="success" />;
  } else if (mimeType === 'application/pdf') {
    return <PdfIcon color="error" />;
  } else if (
    mimeType === 'application/json' ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel')
  ) {
    return <DataIcon color="info" />;
  }
  return <FileIcon />;
};

// Format bytes to human-readable size
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
  assetData,
  onEditStep,
  loading = false,
  error = null,
  onSubmit,
  isSubmitting = false,
}) => {
  const {
    name,
    description,
    source,
    layer,
    layerName,
    categoryCode,
    categoryName,
    subcategoryCode,
    subcategoryName,
    hfn,
    mfa,
    sequential,
    files,
    uploadedFiles,
    tags = [],
    components = [],
  } = assetData;

  // Use taxonomy mapper to ensure consistent display across all components
  // But first check if we have valid layer, category and subcategory information
  let displayHfn = '';
  let displayMfa = '';

  if (layer && categoryCode && subcategoryCode) {
    // We have enough information to generate formatted addresses
    const formattedAddresses = taxonomyMapper.formatNNAAddress(
      layer,
      categoryCode,
      subcategoryCode,
      "000" // Always use "000" for display consistency
    );
    displayHfn = formattedAddresses.hfn;
    displayMfa = formattedAddresses.mfa;

    // Ensure HFN always displays with alphabetic codes, never numeric
    displayHfn = taxonomyMapper.normalizeAddressForDisplay(displayHfn, 'hfn');

    console.log(`ReviewSubmit: Generated formatted addresses - HFN=${displayHfn}, MFA=${displayMfa}`);
  } else {
    // Fallback to the values provided in props
    displayHfn = hfn ? hfn.replace(/\.\d+$/, '.000') : '';
    displayMfa = mfa ? mfa.replace(/\.\d+$/, '.000') : '';

    // Even for fallback values, ensure consistent format
    if (displayHfn) {
      displayHfn = taxonomyMapper.normalizeAddressForDisplay(displayHfn, 'hfn');
    }
  }

  // Validate that all required fields are present
  const isComplete = name && source && layer && categoryCode && subcategoryCode && files.length > 0;
  
  // Check if this is a composite asset 
  const isCompositeAsset = layer === 'C';

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Review Asset Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review the information below before submitting your asset.
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!isComplete && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Some required information is missing. Please complete all required fields.
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Asset Information */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Asset Information
              </Typography>
              <IconButton size="small" onClick={() => onEditStep(2)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Name"
                  secondary={name || 'Not specified'}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              
              {description && (
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Description"
                    secondary={description}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              )}
              
              {source && (
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <PublicIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Source"
                    secondary={source}
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1' }}
                  />
                </ListItem>
              )}
              
              {tags && tags.length > 0 && (
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <TagIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tags"
                    primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {tags.map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    ))}
                  </Box>
                </ListItem>
              )}
            </List>
          </Paper>
          
          {/* Taxonomy Information */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Taxonomy Information
              </Typography>
              <IconButton size="small" onClick={() => onEditStep(1)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List disablePadding>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Layer"
                  secondary={layerName ? `${layerName} (${layer})` : layer || 'Not specified'}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
              
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Category"
                  secondary={categoryName && categoryCode ? (
                    <>
                      {categoryName} ({taxonomyMapper.getAlphabeticCode(categoryCode) || categoryCode})
                    </>
                  ) : (categoryCode || 'Not specified')}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Subcategory"
                  secondary={subcategoryName && subcategoryCode ? (
                    <>
                      {subcategoryName} ({taxonomyMapper.getAlphabeticCode(subcategoryCode) || subcategoryCode})
                    </>
                  ) : (subcategoryCode || 'Not specified')}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
            </List>
          </Paper>
          
          {/* NNA Address Information - Enhanced */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                NNA Address
              </Typography>
              <IconButton size="small" onClick={() => onEditStep(1)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f7ff', borderRadius: 1, border: '1px solid #d6e4ff' }}>
              <Typography variant="subtitle2" align="center" gutterBottom>
                Human-Friendly Name (HFN)
              </Typography>
              <Typography variant="h5" align="center" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
                {displayHfn || 'Not generated yet'}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" align="center" gutterBottom>
                  Machine-Friendly Address (MFA)
                </Typography>
                <Typography variant="h5" align="center" fontFamily="monospace" gutterBottom sx={{ color: '#4a148c' }}>
                  {displayMfa || 'Not generated yet'}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Layer
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {layer || '-'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {categoryCode || '-'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Subcategory
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {subcategoryCode || '-'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Sequential Number
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {sequential || '001'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Files Section */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Asset Files
              </Typography>
              <IconButton size="small" onClick={() => onEditStep(2)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {files.length === 0 ? (
              <Alert severity="warning">No files have been uploaded.</Alert>
            ) : (
              <Box>
                {/* Enhanced File Preview */}
                {files.length > 0 && (
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    {files[0].type.startsWith('image/') ? (
                      <Box
                        component="img"
                        src={URL.createObjectURL(files[0])}
                        alt={files[0].name}
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          borderRadius: '4px',
                          border: '1px solid #eee'
                        }}
                      />
                    ) : files[0].type.startsWith('video/') ? (
                      <Box sx={{ width: '100%', maxHeight: '250px', border: '1px solid #eee', borderRadius: '4px' }}>
                        <video
                          controls
                          style={{ width: '100%', maxHeight: '250px', objectFit: 'contain' }}
                        >
                          <source src={URL.createObjectURL(files[0])} type={files[0].type} />
                          Your browser does not support the video element.
                        </video>
                      </Box>
                    ) : files[0].type.startsWith('audio/') ? (
                      <Box sx={{ width: '100%', p: 2, border: '1px solid #eee', borderRadius: '4px' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                          <AudioIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
                        </Box>
                        <audio controls style={{ width: '100%' }}>
                          <source src={URL.createObjectURL(files[0])} type={files[0].type} />
                          Your browser does not support the audio element.
                        </audio>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', p: 3, border: '1px dashed #ccc', borderRadius: '4px' }}>
                        {getFileIcon(files[0].type)}
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          {files[0].name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
                
                <List>
                  {files.map((file, index) => {
                    // Check if the file has been uploaded
                    const uploadedFile = uploadedFiles.find(
                      (uf) => uf.originalName === file.name
                    );
                    
                    const isUploaded = !!uploadedFile;
                    
                    return (
                      <ListItem key={index} divider={index < files.length - 1}>
                        <ListItemIcon>
                          {getFileIcon(file.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${formatBytes(file.size)} - ${file.type}`}
                          primaryTypographyProps={{ noWrap: true }}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={isUploaded ? 'Uploaded' : 'Pending'}
                            color={isUploaded ? 'success' : 'warning'}
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
          </Paper>
          
          {/* Component Assets (only for Composite layer) */}
          {isCompositeAsset && components && components.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Component Assets
                </Typography>
                <IconButton size="small" onClick={() => onEditStep(2)} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {components.map((component, index) => (
                  <ListItem key={index} divider={index < components.length - 1}>
                    <ListItemIcon>
                      {component.layer === 'G' ? <AudioIcon color="primary" /> :
                       component.layer === 'S' ? <CategoryIcon color="secondary" /> :
                       component.layer === 'L' ? <DescriptionIcon color="success" /> :
                       component.layer === 'M' ? <VideoIcon color="warning" /> :
                       component.layer === 'W' ? <PublicIcon color="info" /> :
                       <FileIcon />
                      }
                    </ListItemIcon>
                    <ListItemText
                      primary={component.title}
                      secondary={component.nnaAddress || `${component.layer} layer asset`}
                      primaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItem>
                ))}
              </List>
              
              {components.length === 0 && (
                <Alert severity="warning">No component assets have been selected.</Alert>
              )}
            </Paper>
          )}
          
          {/* Enhanced NNA Address Information */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                NNA Address
              </Typography>
              <IconButton size="small" onClick={() => onEditStep(1)} color="primary">
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f7ff', borderRadius: 1, border: '1px solid #d6e4ff' }}>
              <Typography variant="subtitle2" align="center" gutterBottom>
                Human-Friendly Name (HFN)
              </Typography>
              <Typography variant="h5" align="center" fontWeight="bold" gutterBottom sx={{ color: '#1976d2' }}>
                {displayHfn || 'Not generated yet'}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" align="center" gutterBottom>
                  Machine-Friendly Address (MFA)
                </Typography>
                <Typography variant="h5" align="center" fontFamily="monospace" gutterBottom sx={{ color: '#4a148c' }}>
                  {displayMfa || 'Not generated yet'}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Layer
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {layer || '-'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {categoryCode || '-'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Subcategory
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {subcategoryCode || '-'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Sequential Number
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {sequential || '001'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Back and Submit Asset Buttons - Placed at the bottom in the same row */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 4, 
        mb: 1 
      }}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => onEditStep(2)}
          startIcon={<ChevronLeft />}
          sx={{ 
            px: 3, 
            py: 1.5, 
            borderRadius: '8px'
          }}
        >
          Back
        </Button>
        
        {isComplete && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onSubmit}
            disabled={isSubmitting || loading}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SubmitIcon />}
            sx={{ 
              px: 6, 
              py: 1.5, 
              fontSize: '16px', 
              fontWeight: 'bold',
              borderRadius: '8px',
              boxShadow: 3
            }}
          >
            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT ASSET'}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default ReviewSubmit;