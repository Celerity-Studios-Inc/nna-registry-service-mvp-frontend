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
  showSubmitButton?: boolean; // Whether to show the submit button (default: true)
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
  showSubmitButton = true,
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

      {/* ENHANCED REVIEW DETAILS LAYOUT: Asset Metadata full left column, other cards stacked right */}
      <Grid container spacing={4}>
        
        {/* LEFT COLUMN: Asset Metadata (Full Height) */}
        <Grid item xs={12} lg={8}>
          <Paper variant="outlined" sx={{ p: 3, height: 'fit-content' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'primary.main' }}>
                📋 Asset Metadata
              </Typography>
              <IconButton
                size="small"
                onClick={() => onEditStep(2)}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* Creator's Description (Primary - Blue Background) */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                Creator's Description:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  p: 2,
                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                  borderRadius: 1,
                  border: '1px solid rgba(25, 118, 210, 0.2)',
                  color: 'text.primary',
                  lineHeight: 1.5
                }}
              >
                {name || 'No creator description provided'}
              </Typography>
            </Box>

            {/* AI-Generated Description (Secondary, when different) */}
            {description && description !== name && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                  AI-Generated Description:
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    color: 'text.secondary',
                    lineHeight: 1.5
                  }}
                >
                  {description}
                </Typography>
              </Box>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                  Tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontSize: '0.75rem',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'white'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Source */}
            {source && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                  Source:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {source}
                </Typography>
              </Box>
            )}

            {/* Layer Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                Layer:
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {layerName ? `${layerName} (${layer})` : layer || 'Not specified'}
              </Typography>
            </Box>

            {/* Category & Subcategory */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                  Category:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {categoryCode ? `${getCategoryDisplayName(categoryCode, categoryName)} (${categoryCode})` : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                  Subcategory:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {subcategoryCode ? `${getCategoryDisplayName(subcategoryCode, subcategoryName)} (${subcategoryCode})` : 'Not specified'}
                </Typography>
              </Grid>
            </Grid>

            {/* Phase 2A: Album Art Display for Songs Layer */}
            {layer === 'G' && (assetData as any).albumArtUrl && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                  Album Art:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper'
                  }}
                >
                  <img
                    src={(assetData as any).albumArtUrl}
                    alt="Album Art"
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                    onError={(e) => {
                      console.warn('Album art failed to load in review');
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Source: {(assetData as any).albumArtSource || 'iTunes'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* RIGHT COLUMN: Taxonomy Information + NNA Address + Files (Stacked) */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* Taxonomy Information Card */}
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Taxonomy
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
              
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Layer</Typography>
                  <Typography variant="body2" fontWeight="bold">{layer || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body2" fontWeight="bold">{categoryCode || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Subcategory</Typography>
                  <Typography variant="body2" fontWeight="bold">{subcategoryCode || '-'}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* NNA Address Card */}
            <Paper variant="outlined" sx={{ p: 2 }}>
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

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Human-Friendly Name (HFN)
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  fontFamily="monospace"
                  sx={{ 
                    wordBreak: 'break-word',
                    color: 'success.main',
                    bgcolor: '#f8f9fa',
                    p: 1,
                    borderRadius: 1,
                    fontSize: '0.8rem'
                  }}
                >
                  {displayHfn || 'Not generated yet'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Machine-Friendly Address (MFA)
                </Typography>
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  sx={{ 
                    wordBreak: 'break-word',
                    color: 'info.main',
                    bgcolor: '#f8f9fa',
                    p: 1,
                    borderRadius: 1,
                    fontSize: '0.8rem'
                  }}
                >
                  {displayMfa || 'Not generated yet'}
                </Typography>
              </Box>
            </Paper>

            {/* Files Card */}
            <Paper variant="outlined" sx={{ p: 2 }}>
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
                  <Typography variant="body2" fontWeight="medium">
                    No files uploaded
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onEditStep(2)}
                    sx={{ mt: 1 }}
                  >
                    Upload Files
                  </Button>
                </Alert>
              ) : (
                <Box>
                  {/* Compact File Preview */}
                  {files.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          overflow: 'hidden',
                          borderRadius: 1,
                          height: '120px',
                          backgroundColor: '#fafafa',
                        }}
                      >
                        <FilePreview
                          file={files[0]}
                          height="120px"
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

                  {/* File List - Compact */}
                  <Box>
                    {files.map((file, index) => {
                      const uploadedFile = uploadedFiles.find(
                        uf => uf.originalName === file.name
                      );
                      const isUploaded = !!uploadedFile;

                      return (
                        <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getFileIcon(file.type)}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="caption" noWrap sx={{ display: 'block' }}>
                                {file.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatBytes(file.size)}
                              </Typography>
                            </Box>
                            <Chip
                              label={isUploaded ? 'Ready' : 'Pending'}
                              color={isUploaded ? 'success' : 'warning'}
                              size="small"
                              sx={{ fontSize: '0.6rem', height: '20px' }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Paper>
            
          </Box>
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

        {isComplete && showSubmitButton && (
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
