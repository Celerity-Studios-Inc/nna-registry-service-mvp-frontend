import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Remove as RemoveIcon,
  Security as SecurityIcon,
  Preview as PreviewIcon,
  WorkspacePremium as CrownIcon,
  Lock as LockIcon,
  AudioFile as AudioIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  DirectionsRun as MovesIcon,
  Public as WorldIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Asset } from '../types/asset.types';
import AssetSearch from './AssetSearch';

// Component compatibility matrix per NNA Framework Section 1.3.2
const COMPATIBLE_LAYERS = ['G', 'S', 'L', 'M', 'W', 'B', 'P'];

// Layer icons and colors for visual identification
const LAYER_CONFIG = {
  G: { icon: AudioIcon, color: '#1976d2', name: 'Songs' },
  S: { icon: PersonIcon, color: '#9c27b0', name: 'Stars' },
  L: { icon: PaletteIcon, color: '#f57c00', name: 'Looks' },
  M: { icon: MovesIcon, color: '#388e3c', name: 'Moves' },
  W: { icon: WorldIcon, color: '#00796b', name: 'Worlds' },
  B: { icon: CrownIcon, color: '#d32f2f', name: 'Branded' },
  P: { icon: LockIcon, color: '#7b1fa2', name: 'Personalize' },
};

interface CompositeAssetSelectionProps {
  onComponentsSelected: (components: Asset[]) => void;
  initialComponents?: Asset[];
}

interface SearchParams {
  query: string;
  layer: string;
}

interface RightsVerificationResult {
  assetId: string;
  status: 'approved' | 'denied' | 'restricted';
  message?: string;
  restrictions?: string[];
}

const CompositeAssetSelection: React.FC<CompositeAssetSelectionProps> = ({
  onComponentsSelected,
  initialComponents = [],
}) => {
  const [selectedComponents, setSelectedComponents] = useState<Asset[]>(initialComponents);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    layer: '',
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [rightsValidation, setRightsValidation] = useState<{
    [assetId: string]: RightsVerificationResult;
  }>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Validate component compatibility
  const validateComponentCompatibility = (components: Asset[]): string[] => {
    const errors: string[] = [];

    // Check layer compatibility
    const incompatibleLayers = components.filter(
      asset => !COMPATIBLE_LAYERS.includes(asset.layer)
    );

    if (incompatibleLayers.length > 0) {
      errors.push(
        `Incompatible layers detected: ${incompatibleLayers
          .map(asset => `${asset.layer} (${asset.friendlyName})`)
          .join(', ')}`
      );
    }

    // Check minimum components requirement
    if (components.length < 2) {
      errors.push('Composite assets require at least 2 components');
    }

    // Check maximum components limit (optional business rule)
    if (components.length > 10) {
      errors.push('Composite assets cannot have more than 10 components');
    }

    // Check for duplicate components
    const duplicateIds = components
      .map(asset => asset.id)
      .filter((id, index, arr) => arr.indexOf(id) !== index);

    if (duplicateIds.length > 0) {
      errors.push('Duplicate components detected');
    }

    return errors;
  };

  // Step 2: Validate components function as specified
  const validateComponents = (components: Asset[]): string[] => {
    const errors: string[] = [];
    
    // Check if all components have a layer in allowed layers
    const invalidComponents = components.filter(
      asset => !COMPATIBLE_LAYERS.includes(asset.layer)
    );
    
    if (invalidComponents.length > 0) {
      errors.push(
        `Components from incompatible layers detected: ${invalidComponents
          .map(asset => `${asset.layer} (${asset.friendlyName || asset.name})`)
          .join(', ')}. Allowed layers: ${COMPATIBLE_LAYERS.join(', ')}`
      );
    }
    
    return errors;
  };

  // Handle Continue button click with validation
  const handleContinue = () => {
    const errors = validateComponents(selectedComponents);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      toast.success('All components are compatible! Ready to register.');
      setRegistrationError(null); // Clear any previous registration errors
    } else {
      toast.error('Please fix validation errors before continuing');
    }
  };

  // Step 4: Handle composite registration
  const handleRegister = async () => {
    // First validate components
    const errors = validateComponents(selectedComponents);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix validation errors before registering');
      return;
    }

    setRegistering(true);
    setRegistrationError(null);
    
    try {
      const registeredAsset = await registerCompositeAsset(selectedComponents);
      toast.success(`Composite registered successfully: ${registeredAsset.friendlyName || registeredAsset.name}`);
      
      // Reset form after successful registration
      setSelectedComponents([]);
      setValidationErrors([]);
      setRightsValidation({});
      
      // Notify parent component of successful registration
      onComponentsSelected([]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register composite asset';
      setRegistrationError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setRegistering(false);
    }
  };

  // Verify rights for components via Clearity integration
  const verifyComponentRights = async (asset: Asset): Promise<RightsVerificationResult> => {
    try {
      const response = await axios.post(`/v1/rights/verify/${asset.id}`, {
        usage_context: {
          platform: 'TikTok',
          territories: ['US'],
          usage_type: 'composite',
        },
      });

      return {
        assetId: asset.id,
        status: response.data.status,
        message: response.data.message,
        restrictions: response.data.restrictions,
      };
    } catch (error) {
      console.error(`Rights verification failed for ${asset.id}:`, error);
      return {
        assetId: asset.id,
        status: 'denied',
        message: 'Rights verification failed',
      };
    }
  };

  // Step 4: Generate composite HFN in the format C.[CategoryCode].[SubCategoryCode].[Sequential]:[Component IDs]
  const generateCompositeHFN = (components: Asset[], sequential: string = '001'): string => {
    const componentIds = components.map(asset => asset.friendlyName || asset.name).join('+');
    // Format: C.[CategoryCode].[SubCategoryCode].[Sequential]:[Component IDs]
    return `C.001.001.${sequential}:${componentIds}`;
  };

  // Step 4: Register composite asset with backend
  const registerCompositeAsset = async (components: Asset[]): Promise<Asset> => {
    try {
      const componentHFNs = components.map(asset => asset.friendlyName || asset.name);
      const compositeHFN = generateCompositeHFN(components);
      
      // Prepare registration payload
      const registrationPayload = {
        layer: 'C',
        category: '001',
        subcategory: '001',
        sequential: '001',
        components: componentHFNs.join(','), // Backend expects comma-separated string
        metadata: {
          components: componentHFNs, // Also include as array in metadata
          componentCount: components.length,
          totalSize: components.reduce((sum, asset) => 
            sum + (asset.files?.reduce((fileSum, file) => fileSum + file.size, 0) || 0), 0),
          createdFrom: 'CompositeAssetSelection',
        },
        name: compositeHFN,
        friendlyName: compositeHFN,
        description: `Composite asset containing ${components.length} components: ${componentHFNs.join(', ')}`,
        tags: ['composite', 'generated', ...Array.from(new Set(components.flatMap(asset => asset.tags || [])))],
        source: 'ReViz', // Default source for composites
      };

      const response = await axios.post('/v1/asset/register', registrationPayload);
      return response.data;
    } catch (error) {
      // Handle HTTP 409 for duplicate HFN
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        throw new Error('HFN conflict: A composite with this combination already exists');
      }
      
      // Handle other registration errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to register composite asset: ${errorMessage}`);
    }
  };

  // Generate composite preview
  const generatePreview = async (components: Asset[]): Promise<string> => {
    const startTime = performance.now();
    
    try {
      const response = await axios.post('/v1/asset/preview', {
        components: components.map(asset => asset.id),
        format: 'mp4',
        quality: 'preview',
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log warning if preview generation exceeds 2s target
      if (duration > 2000) {
        console.warn(`Preview generation exceeded 2s: ${duration}ms`);
        toast.warning('Preview generation was slower than expected');
      }

      return response.data.previewUrl;
    } catch (error) {
      console.error('Preview generation failed:', error);
      throw new Error('Failed to generate preview');
    }
  };

  // Handle adding a component
  const handleAddComponent = useCallback(async (asset: Asset) => {
    // Check if already added
    if (selectedComponents.some(comp => comp.id === asset.id)) {
      toast.info('Component already added');
      return;
    }

    // Verify rights before adding
    toast.info('Verifying component rights...');
    const rightsResult = await verifyComponentRights(asset);
    
    setRightsValidation(prev => ({
      ...prev,
      [asset.id]: rightsResult,
    }));

    if (rightsResult.status !== 'approved') {
      toast.error(`Rights verification failed: ${rightsResult.message}`);
      return;
    }

    const newComponents = [...selectedComponents, asset];
    setSelectedComponents(newComponents);
    
    // Validate compatibility
    const errors = validateComponentCompatibility(newComponents);
    setValidationErrors(errors);

    // Update parent component
    onComponentsSelected(newComponents);

    toast.success(`Added ${asset.friendlyName || asset.name}`);
  }, [selectedComponents, onComponentsSelected]);

  // Handle removing a component
  const handleRemoveComponent = (assetId: string) => {
    const newComponents = selectedComponents.filter(comp => comp.id !== assetId);
    setSelectedComponents(newComponents);
    
    // Remove from rights validation
    setRightsValidation(prev => {
      const updated = { ...prev };
      delete updated[assetId];
      return updated;
    });

    // Validate compatibility
    const errors = validateComponentCompatibility(newComponents);
    setValidationErrors(errors);

    // Update parent component
    onComponentsSelected(newComponents);
  };

  // Handle preview generation
  const handleGeneratePreview = async () => {
    if (selectedComponents.length < 2) {
      toast.error('Need at least 2 components to generate preview');
      return;
    }

    setPreviewLoading(true);
    try {
      const url = await generatePreview(selectedComponents);
      setPreviewUrl(url);
      setShowPreviewDialog(true);
    } catch (error) {
      toast.error('Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Get layer icon component
  const getLayerIcon = (layer: string) => {
    const config = LAYER_CONFIG[layer as keyof typeof LAYER_CONFIG];
    if (!config) return null;
    
    const IconComponent = config.icon;
    return <IconComponent sx={{ color: config.color }} />;
  };

  // Get asset accessibility tags display
  const getAccessibilityDisplay = (asset: Asset) => {
    const accessibilityTags = asset.metadata?.Accessibility_Tags || [];
    if (accessibilityTags.length === 0) return null;

    return (
      <Box sx={{ mt: 1 }}>
        {accessibilityTags.map((tag: string, index: number) => (
          <Box
            key={index}
            component="span"
            sx={{
              display: 'inline-block',
              backgroundColor: 'info.light',
              color: 'info.contrastText',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: '0.75rem',
              mr: 0.5,
              mb: 0.5,
            }}
            aria-label={`Accessibility tag: ${tag}`}
          >
            {tag}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Composite Components
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add compatible assets (G, S, L, M, W, B, P layers) to create your composite.
        All components will be verified for rights clearance.
      </Typography>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Validation Errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Registration Errors */}
      {registrationError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Registration Error:
          </Typography>
          {registrationError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Search Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Search Assets
            </Typography>
            
            <AssetSearch
              onAssetSelect={handleAddComponent}
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          </Paper>
        </Grid>

        {/* Selected Components Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Selected Components ({selectedComponents.length})
              </Typography>
              {selectedComponents.length >= 2 && (
                <Button
                  variant="outlined"
                  startIcon={previewLoading ? <CircularProgress size={16} /> : <PreviewIcon />}
                  onClick={handleGeneratePreview}
                  disabled={previewLoading}
                  aria-label="Generate preview of composite"
                >
                  Preview
                </Button>
              )}
            </Box>

            {selectedComponents.length === 0 ? (
              <Alert severity="info">
                No components selected. Search and add assets above to create your composite.
              </Alert>
            ) : (
              <Box>
                {/* Composite HFN Preview */}
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="caption" gutterBottom>
                    Composite HFN Preview:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {generateCompositeHFN(selectedComponents)}
                  </Typography>
                </Alert>

                <List>
                  {selectedComponents.map(asset => {
                    const rightsStatus = rightsValidation[asset.id];
                    return (
                      <ListItem key={asset.id} divider>
                        <ListItemIcon>
                          {getLayerIcon(asset.layer)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              {asset.friendlyName || asset.name}
                              {asset.layer === 'B' && (
                                <CrownIcon sx={{ color: 'gold', fontSize: 16 }} />
                              )}
                              {asset.layer === 'P' && (
                                <LockIcon sx={{ color: 'purple', fontSize: 16 }} />
                              )}
                              {rightsStatus && (
                                <Tooltip title={rightsStatus.message || 'Rights verified'}>
                                  <SecurityIcon
                                    sx={{
                                      color: rightsStatus.status === 'approved' ? 'success.main' : 'error.main',
                                      fontSize: 16,
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {asset.layer} • {asset.nnaAddress || 'No address'}
                              </Typography>
                              {getAccessibilityDisplay(asset)}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveComponent(asset.id)}
                            color="error"
                            aria-label={`Remove ${asset.friendlyName || asset.name} from composite`}
                          >
                            <RemoveIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      {selectedComponents.length > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={handleContinue}
            disabled={registering}
            aria-label="Validate selected components"
          >
            Validate
          </Button>
          
          {validationErrors.length === 0 && (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleRegister}
              disabled={registering}
              startIcon={registering ? <CircularProgress size={16} /> : null}
              aria-label="Register composite asset"
            >
              {registering ? 'Registering...' : 'Register'}
            </Button>
          )}
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="preview-dialog-title"
      >
        <DialogTitle id="preview-dialog-title">
          Composite Preview
        </DialogTitle>
        <DialogContent>
          {previewUrl ? (
            <Box sx={{ textAlign: 'center' }}>
              <video
                controls
                style={{ maxWidth: '100%', maxHeight: '400px' }}
                src={previewUrl}
                aria-label="Composite asset preview video"
              >
                Your browser does not support the video tag.
              </video>
            </Box>
          ) : (
            <Typography>No preview available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreviewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompositeAssetSelection;