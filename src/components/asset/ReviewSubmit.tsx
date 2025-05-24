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
  Tooltip,
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
  Info as InfoIcon,
} from '@mui/icons-material';
import { FileUploadResponse } from '../../types/asset.types';
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { taxonomyFormatter } from '../../utils/taxonomyFormatter';
import FilePreview from '../common/FilePreview';

// Helper function to format display name from taxonomy data
const formatDisplayName = (name?: string): string => {
  if (!name) return '';
  
  // Clean up formatting - replace underscores with spaces
  return name.replace(/_/g, ' ');
};

// Helper function to get display name for category and subcategory codes
const getCategoryDisplayName = (code: string, name?: string): string => {
  // If we have a name directly from the taxonomy service, use it (priority 1)
  if (name && name.trim() !== '') {
    return formatDisplayName(name);
  }
  
  // Try to find the name by looking up in the taxonomy service data (priority 2)
  try {
    // For categories, we can try to get the categories for the layer and find the matching one
    const currentLayer = sessionStorage.getItem('selected_layer');
    if (currentLayer) {
      // First, check if this might be a category code
      const categories = taxonomyService.getCategories(currentLayer);
      const matchingCategory = categories.find(cat => cat.code === code);
      if (matchingCategory && matchingCategory.name) {
        return formatDisplayName(matchingCategory.name);
      }
      
      // Then, check if it might be a subcategory code
      // We'll need the category code as well, which we can get from session storage
      const currentCategory = sessionStorage.getItem('selected_category');
      if (currentCategory) {
        const subcategories = taxonomyService.getSubcategories(currentLayer, currentCategory);
        const matchingSubcategory = subcategories.find(subcat => subcat.code === code);
        if (matchingSubcategory && matchingSubcategory.name) {
          return formatDisplayName(matchingSubcategory.name);
        }
      }
    }
  } catch (error) {
    console.warn(`[ReviewSubmit] Could not get name from taxonomy service for code: ${code}`, error);
  }
  
  // Fallback display names for common categories and subcategories (priority 3)
  const displayNames: Record<string, string> = {
    // Categories
    'POP': 'Pop',
    'ROK': 'Rock',
    'DNC': 'Dance Electronic',
    'HIP': 'Hip Hop',
    'RNB': 'R&B',
    'PRF': 'Performance',
    'EVC': 'Everyday Casual',
    'BCH': 'Beach',
    'LAT': 'Latin',
    'VAV': 'Virtual Avatars',
    'JZZ': 'Jazz',
    'AFB': 'Afrobeats Dance',
    'FLK': 'Folk',
    'MET': 'Metal',
    'CTR': 'Country',
    'CLS': 'Classical',
    'DIS': 'Disco',
    'EDM': 'EDM',
    'URB': 'Urban Dance',
    'BLT': 'Ballet',
    'HHS': 'Hip Hop Style',
    
    // Subcategories
    'BAS': 'Base',
    'PAL': 'Palm',
    'REG': 'Reggaeton',
    'CUM': 'Cumbia',
    'MER': 'Merengue',
    'SAL': 'Salsa',
    'TRP': 'Trap',
    'BAC': 'Bachata',
    'FLM': 'Flamenco',
    'AIG': 'AI Generated',
    'AZN': 'Azonto',
    'BAT': 'Bata',
    'HLF': 'Highlife',
    'KUD': 'Kuduro',
    'SHK': 'Shaku',
    'SHB': 'Shoki',
    'ZAN': 'Zanku',
    'CPR': 'Coupe Decale',
    'EXP': 'Experimental'
  };
  
  // Return from our fallback list or just the code itself if nothing else works
  return displayNames[code] || code;
};

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

  // Use the new TaxonomyFormatter utility for consistent display
  let displayHfn = '';
  let displayMfa = '';

  if (layer && categoryCode && subcategoryCode) {
    // Use our centralized formatter to ensure consistent display across the application
    // First, construct the raw HFN
    const rawHfn = `${layer}.${categoryCode}.${subcategoryCode}.000`; // Always use 000 for display

    // Then format it properly with the utility
    displayHfn = taxonomyFormatter.formatHFN(rawHfn);

    // Generate MFA from the formatted HFN
    try {
      displayMfa = taxonomyFormatter.convertHFNtoMFA(displayHfn);
    } catch (error) {
      console.error('Error converting HFN to MFA in ReviewSubmit:', error);

      // Fallback to the older taxonomy mapper if the formatter fails
      try {
        // Try directly with taxonomyService as fallback
        const fallbackMfa = taxonomyService.convertHFNtoMFA(`${layer}.${categoryCode}.${subcategoryCode}.001`);
        displayMfa = fallbackMfa || '0.000.000.000'; // Default if conversion fails completely
      } catch (fallbackError) {
        console.error(
          'Both formatter and legacy mapper failed:',
          fallbackError
        );
        // Use a basic fallback format as last resort
        const layerCode = taxonomyFormatter.getLayerCode(layer) || '0';
        displayMfa = `${layerCode}.001.001.000`;
      }
    }
  } else {
    // Fallback to the values provided in props
    if (hfn) {
      // Format the HFN properly
      const cleanHfn = hfn.replace(/\.\d+$/, '.000'); // Replace sequential with 000
      displayHfn = taxonomyFormatter.formatHFN(cleanHfn);
    }

    if (mfa) {
      // Format the MFA properly
      const cleanMfa = mfa.replace(/\.\d+$/, '.000'); // Replace sequential with 000
      displayMfa = taxonomyFormatter.formatMFA(cleanMfa);
    }

    // If we have HFN but no MFA, try to generate it
    if (displayHfn && !displayMfa) {
      try {
        displayMfa = taxonomyFormatter.convertHFNtoMFA(displayHfn);
      } catch (error) {
        console.error('Error converting from HFN in fallback path:', error);
      }
    }
  }

  // Validate that all required fields are present
  const isComplete =
    name &&
    source &&
    layer &&
    categoryCode &&
    subcategoryCode &&
    files.length > 0;

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
          <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
            Required information is missing. Please complete the following
            fields:
          </Typography>
          <Box component="ul" sx={{ ml: 2, mb: 0 }}>
            {!name && (
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography variant="body2">
                  <strong>Name</strong> - Asset needs a name (Step 3)
                </Typography>
              </Box>
            )}
            {!source && (
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography variant="body2">
                  <strong>Source</strong> - Asset needs a source (Step 3)
                </Typography>
              </Box>
            )}
            {!layer && (
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography variant="body2">
                  <strong>Layer</strong> - Select a layer (Step 1)
                </Typography>
              </Box>
            )}
            {!categoryCode && (
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography variant="body2">
                  <strong>Category</strong> - Select a category (Step 2)
                </Typography>
              </Box>
            )}
            {!subcategoryCode && (
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography variant="body2">
                  <strong>Subcategory</strong> - Select a subcategory (Step 2)
                </Typography>
              </Box>
            )}
            {(!files || files.length === 0) && (
              <Box component="li" sx={{ mb: 0.5 }}>
                <Typography variant="body2">
                  <strong>Files</strong> - Upload at least one file (Step 3)
                </Typography>
              </Box>
            )}
          </Box>
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Asset Information */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Asset Information
              </Typography>
              <IconButton
                size="small"
                onClick={() => onEditStep(2)}
                color="primary"
              >
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
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary',
                  }}
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
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
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
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
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
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Taxonomy Information
              </Typography>
              <IconButton
                size="small"
                onClick={() => onEditStep(1)}
                color="primary"
              >
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
                  secondary={
                    layerName
                      ? `${layerName} (${layer})`
                      : layer || 'Not specified'
                  }
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary',
                  }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Category"
                  secondary={
                    <>
                      {categoryCode ? (
                        <Box component="span" fontWeight="medium">
                          {getCategoryDisplayName(categoryCode, categoryName)} ({categoryCode})
                        </Box>
                      ) : (
                        <Box
                          component="span"
                          sx={{ color: 'error.main', fontWeight: 'medium' }}
                        >
                          Not specified (Required)
                        </Box>
                      )}

                      {/* Category validation indicator */}
                      {!categoryCode && (
                        <Box
                          sx={{
                            mt: 1,
                            display: 'flex',
                            alignItems: 'center',
                            color: 'error.main',
                            fontSize: '0.8rem',
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              mr: 0.5,
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              bgcolor: 'error.main',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: 'bold',
                            }}
                          >
                            !
                          </Box>
                          <Box component="span">
                            Required field - Please go back and select a
                            category
                          </Box>
                        </Box>
                      )}
                    </>
                  }
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary',
                  }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Subcategory"
                  secondary={
                    <>
                      {subcategoryCode ? (
                        <Box component="span" fontWeight="medium">
                          {getCategoryDisplayName(subcategoryCode, subcategoryName)} ({subcategoryCode})
                        </Box>
                      ) : (
                        <Box
                          component="span"
                          sx={{ color: 'error.main', fontWeight: 'medium' }}
                        >
                          Not specified (Required)
                        </Box>
                      )}

                      {/* Subcategory validation indicator */}
                      {!subcategoryCode && (
                        <Box
                          sx={{
                            mt: 1,
                            display: 'flex',
                            alignItems: 'center',
                            color: 'error.main',
                            fontSize: '0.8rem',
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              mr: 0.5,
                              width: 16,
                              height: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              bgcolor: 'error.main',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: 'bold',
                            }}
                          >
                            !
                          </Box>
                          <Box component="span">
                            Required field - Please go back and select a
                            subcategory
                          </Box>
                        </Box>
                      )}

                      {/* Session storage recovery hint */}
                      {categoryCode && !subcategoryCode && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              // Try to recover from session storage
                              try {
                                const storedSubcategory =
                                  sessionStorage.getItem(
                                    `originalSubcategory_${layer}_${categoryCode}`
                                  );
                                if (storedSubcategory) {
                                  onEditStep(1); // Go back to taxonomy selection step
                                  console.log(
                                    'Found stored subcategory, redirecting to selection step'
                                  );
                                } else {
                                  onEditStep(1); // Go back to taxonomy selection step anyway
                                }
                              } catch (e) {
                                console.warn(
                                  'Error accessing session storage:',
                                  e
                                );
                                onEditStep(1); // Go back to taxonomy selection step
                              }
                            }}
                          >
                            Select Subcategory
                          </Button>
                        </Box>
                      )}
                    </>
                  }
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary',
                  }}
                  secondaryTypographyProps={{ variant: 'body1' }}
                />
              </ListItem>
            </List>
          </Paper>

          {/* NNA Address Information - Enhanced */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                NNA Address
              </Typography>
              <IconButton
                size="small"
                onClick={() => onEditStep(1)}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: '#f0f7ff',
                borderRadius: 1,
                border: '1px solid #d6e4ff',
              }}
            >
              <Typography variant="subtitle2" align="center" gutterBottom>
                Human-Friendly Name (HFN)
              </Typography>
              <Typography
                variant="h5"
                align="center"
                fontWeight="bold"
                gutterBottom
                sx={{ color: '#1976d2' }}
              >
                {displayHfn || 'Not generated yet'}
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" align="center" gutterBottom>
                  Machine-Friendly Address (MFA)
                </Typography>
                <Typography
                  variant="h5"
                  align="center"
                  fontFamily="monospace"
                  gutterBottom
                  sx={{ color: '#4a148c' }}
                >
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" fontWeight="bold">
                  .000
                </Typography>
                <Tooltip title="The .000 will be replaced with an assigned sequential number after submission">
                  <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
                    <InfoIcon fontSize="small" color="info" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Will be replaced after submission
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Files Section */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Asset Files
              </Typography>
              <IconButton
                size="small"
                onClick={() => onEditStep(2)}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {files.length === 0 ? (
              <Alert severity="warning">
                <Typography variant="body1" fontWeight="medium">
                  No files have been uploaded.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Please go back to Step 3 to upload at least one file for your
                  asset.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onEditStep(2)}
                  sx={{ mt: 2 }}
                >
                  Go to Upload Files
                </Button>
              </Alert>
            ) : (
              <Box>
                {/* Enhanced File Preview with FilePreview component */}
                {files.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      File Preview
                    </Typography>

                    <Paper
                      variant="outlined"
                      sx={{
                        overflow: 'hidden',
                        borderRadius: 1,
                        height: '220px',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <FilePreview
                        file={files[0]}
                        height="220px"
                        showControls={false}
                      />
                    </Paper>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      align="center"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      {files[0].name} ({formatBytes(files[0].size)})
                    </Typography>
                  </Box>
                )}

                <List>
                  {files.map((file, index) => {
                    // Check if the file has been uploaded
                    const uploadedFile = uploadedFiles.find(
                      uf => uf.originalName === file.name
                    );

                    const isUploaded = !!uploadedFile;

                    return (
                      <ListItem key={index} divider={index < files.length - 1}>
                        <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Component Assets
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onEditStep(2)}
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <List>
                {components.map((component, index) => (
                  <ListItem key={index} divider={index < components.length - 1}>
                    <ListItemIcon>
                      {component.layer === 'G' ? (
                        <AudioIcon color="primary" />
                      ) : component.layer === 'S' ? (
                        <CategoryIcon color="secondary" />
                      ) : component.layer === 'L' ? (
                        <DescriptionIcon color="success" />
                      ) : component.layer === 'M' ? (
                        <VideoIcon color="warning" />
                      ) : component.layer === 'W' ? (
                        <PublicIcon color="info" />
                      ) : (
                        <FileIcon />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={component.title}
                      secondary={
                        component.nnaAddress || `${component.layer} layer asset`
                      }
                      primaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItem>
                ))}
              </List>

              {components.length === 0 && (
                <Alert severity="warning">
                  No component assets have been selected.
                </Alert>
              )}
            </Paper>
          )}

          {/* Second NNA Address card removed to avoid duplication */}
        </Grid>
      </Grid>

      {/* Back and Submit Asset Buttons - Placed at the bottom in the same row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 4,
          mb: 1,
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => onEditStep(2)}
          startIcon={<ChevronLeft />}
          sx={{
            px: 3,
            py: 1.5,
            borderRadius: '8px',
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
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SubmitIcon />
              )
            }
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px',
              boxShadow: 3,
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
