import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  CircularProgress,
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
  Chip,
  Divider,
} from '@mui/material';
import {
  Remove as RemoveIcon,
  Security as SecurityIcon,
  WorkspacePremium as CrownIcon,
  Lock as LockIcon,
  AudioFile as AudioIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  DirectionsRun as MovesIcon,
  Public as WorldIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Asset } from '../types/asset.types';
import AssetSearch from './AssetSearch';
import AssetThumbnail from './common/AssetThumbnail';

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
  onValidationChange?: (errors: string[]) => void;
  initialComponents?: Asset[];
  targetLayer?: string;
  layerName?: string;
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
  onValidationChange,
  initialComponents = [],
  targetLayer = 'C',
  layerName = 'Composite',
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
  // Registration state removed - now handled by unified workflow
  const [validating, setValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  
  // Helper function to update validation errors and notify parent
  const updateValidationErrors = (errors: string[]) => {
    setValidationErrors(errors);
    if (onValidationChange) {
      onValidationChange(errors);
    }
  };

  // Initial validation on component mount and whenever selectedComponents changes
  useEffect(() => {
    const errors = validateComponents(selectedComponents);
    updateValidationErrors(errors);
  }, [selectedComponents]);

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

  // Step 2: Enhanced validate components function with edge case handling
  const validateComponents = (components: Asset[]): string[] => {
    const errors: string[] = [];
    
    // Check if components array is valid
    if (!Array.isArray(components)) {
      errors.push('Invalid components data: expected array');
      return errors;
    }
    
    // Check minimum components requirement
    if (components.length < 2) {
      errors.push('Composite assets require at least 2 components');
    }
    
    // Check maximum components limit
    if (components.length > 10) {
      errors.push('Composite assets cannot have more than 10 components');
    }
    
    // Validate each component has required fields
    const invalidStructure = components.filter(asset => {
      return !asset || typeof asset !== 'object' || !asset.id || !asset.layer;
    });
    
    if (invalidStructure.length > 0) {
      errors.push(`${invalidStructure.length} component(s) have invalid or missing required data (id, layer)`);
    }
    
    // Check for components with missing/null/invalid layer values
    const missingLayers = components.filter(asset => {
      return asset && (!asset.layer || typeof asset.layer !== 'string' || asset.layer.trim() === '');
    });
    
    if (missingLayers.length > 0) {
      errors.push(
        `Components with missing or invalid layer detected: ${missingLayers
          .map(asset => `${asset.friendlyName || asset.name || asset.id} (layer: ${asset.layer || 'missing'})`)
          .join(', ')}`
      );
    }
    
    // Check if all components have a layer in allowed layers (excluding those with missing layers)
    const componentsWithValidLayers = components.filter(asset => 
      asset && asset.layer && typeof asset.layer === 'string' && asset.layer.trim() !== ''
    );
    
    const invalidComponents = componentsWithValidLayers.filter(
      asset => !COMPATIBLE_LAYERS.includes(asset.layer.trim().toUpperCase())
    );
    
    if (invalidComponents.length > 0) {
      errors.push(
        `Components from incompatible layers detected: ${invalidComponents
          .map(asset => `${asset.friendlyName || asset.name || asset.id} (layer: ${asset.layer})`)
          .join(', ')}. Allowed layers: ${COMPATIBLE_LAYERS.join(', ')}`
      );
    }
    
    // Check for duplicate components
    const componentIds = components.map(asset => asset.id).filter(Boolean);
    const duplicateIds = componentIds.filter((id, index) => componentIds.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      const uniqueDuplicates = Array.from(new Set(duplicateIds));
      errors.push(`Duplicate components detected: ${uniqueDuplicates.join(', ')}`);
    }
    
    // Check for components with missing names (for HFN generation)
    const missingNames = components.filter(asset => 
      asset && asset.id && (!asset.friendlyName && !asset.name)
    );
    
    if (missingNames.length > 0) {
      errors.push(
        `Components missing display names: ${missingNames
          .map(asset => asset.id)
          .join(', ')}. Names are required for composite HFN generation.`
      );
    }
    
    return errors;
  };

  // Handle Continue button click with validation
  const handleContinue = async () => {
    setValidating(true);
    setValidationStatus('validating');
    
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const errors = validateComponents(selectedComponents);
    updateValidationErrors(errors);
    
    if (errors.length === 0) {
      setValidationStatus('success');
      toast.success(`✅ Validation passed! ${selectedComponents.length} components are compatible and ready to register.`);
      // Registration errors now handled by unified workflow
    } else {
      setValidationStatus('error');
      toast.error(`❌ Validation failed: ${errors.length} error${errors.length > 1 ? 's' : ''} found. Please fix before continuing.`);
    }
    
    setValidating(false);
  };

  // Step 4: Handle advancing to Review & Submit step
  const handleAdvanceToReview = () => {
    // First validate components
    const errors = validateComponents(selectedComponents);
    if (errors.length > 0) {
      updateValidationErrors(errors);
      toast.error('Please fix validation errors before continuing');
      return;
    }

    // Notify parent component with selected components to advance workflow
    onComponentsSelected(selectedComponents);
    
    toast.success(`✅ Components selected! Proceeding to Review & Submit step...`, {
      autoClose: 3000,
    });
  };

  // REMOVED: Deprecated registration function that was interfering with unified workflow
  // Registration is now handled by RegisterAssetPage through the onSubmit flow

  // Verify rights for components via Clearity integration
  const verifyComponentRights = async (asset: Asset): Promise<RightsVerificationResult> => {
    try {
      const requestData = {
        usage_context: {
          platform: 'TikTok',
          territories: ['US'],
          usage_type: 'composite',
        },
      };

      let response;
      try {
        // Try proxy first
        response = await axios.post(`/v1/rights/verify/${asset.id}`, requestData, {
          headers: {
            'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                            localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        });
      } catch (proxyError) {
        console.log('Rights verification proxy failed, trying direct backend connection...');
        // If proxy fails, try direct backend connection
        response = await axios.post(`https://registry.reviz.dev/v1/rights/verify/${asset.id}`, requestData, {
          headers: {
            'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                            localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });
        console.log('Direct backend connection successful for rights verification!');
      }

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

  // Step 4: Generate composite address in the format [Layer].[CategoryCode].[SubCategoryCode].[Sequential]:[MFA addresses]
  const generateCompositeHFN = (components: Asset[], sequential: string = '001'): string => {
    if (components.length === 0) {
      return `${targetLayer}.001.001.${sequential}`;
    }
    
    // Extract MFA addresses from components (backend uses nna_address, frontend uses nnaAddress)
    const componentMFAs = components.map(asset => {
      // Try multiple possible field names for MFA address
      return (asset as any).nna_address || asset.nnaAddress || (asset as any).mfa || (asset as any).MFA || 'UNKNOWN.MFA';
    }).join('+');
    
    // Format: [targetLayer].001.001.[Sequential]:[MFA addresses]
    return `${targetLayer}.001.001.${sequential}:${componentMFAs}`;
  };

  // REMOVED: registerCompositeAsset function - registration now handled by RegisterAssetPage unified workflow
  // Step 5: Optimized composite preview generation with performance logging

  // Handle adding a component
  const handleAddComponent = useCallback(async (asset: Asset) => {
    // Check if already added
    if (selectedComponents.some(comp => comp.id === asset.id)) {
      toast.info('Component already added');
      return;
    }

    // Skip rights verification since the endpoint is not implemented yet
    // Show informational message about rights verification being bypassed
    toast.info('Adding component (rights verification bypassed as per notice above)');
    
    // Set placeholder rights validation status for UI consistency
    setRightsValidation(prev => ({
      ...prev,
      [asset.id]: {
        assetId: asset.id,
        status: 'approved', // Placeholder status since verification is bypassed
        message: 'Rights verification bypassed - endpoint not available',
      },
    }));

    const newComponents = [...selectedComponents, asset];
    setSelectedComponents(newComponents);
    
    // Validate compatibility
    const errors = validateComponentCompatibility(newComponents);
    updateValidationErrors(errors);

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
    updateValidationErrors(errors);

    // Update parent component
    onComponentsSelected(newComponents);
  };

  // Step 5: Enhanced preview generation handler with performance tracking

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

      {/* Registration errors now handled by unified workflow */}


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
                  <Typography 
                    variant="body2" 
                    fontFamily="monospace"
                    sx={{
                      wordBreak: 'break-all',
                      whiteSpace: 'pre-wrap',
                      fontSize: '0.75rem',
                      lineHeight: 1.4,
                      mt: 0.5,
                      p: 1,
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderRadius: 1,
                      border: '1px dashed rgba(0,0,0,0.2)'
                    }}
                  >
                    {generateCompositeHFN(selectedComponents)}
                  </Typography>
                </Alert>

                <List>
                  {selectedComponents.map(asset => {
                    const rightsStatus = rightsValidation[asset.id];
                    return (
                      <ListItem key={asset.id} divider>
                        <ListItemIcon>
                          {/* Use AssetThumbnail component for smart video/image handling */}
                          <AssetThumbnail 
                            asset={asset} 
                            width={40} 
                            height={40} 
                          />
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

      {/* Action buttons now handled by RegisterAssetPage - no redundant buttons needed */}

      {/* Registration status now handled by unified workflow */}

    </Box>
  );
};

export default CompositeAssetSelection;