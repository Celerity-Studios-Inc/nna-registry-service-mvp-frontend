import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { environmentSafeLog, environmentSafeWarn, environmentSafeError } from '../utils/environment';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Container,
  Alert,
  Grid,
  Divider,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Tooltip,
} from '@mui/material';
import {
  ChevronLeft as PreviousIcon,
  ChevronRight as NextIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import assetService from '../api/assetService';
import { formatNNAAddressForDisplay } from '../api/codeMapping.enhanced';
import LayerSelection from '../components/asset/LayerSelection';
import SimpleTaxonomySelectionV3 from '../components/asset/SimpleTaxonomySelectionV3';
import TaxonomyContext from '../components/asset/TaxonomyContext';
import FileUpload from '../components/asset/FileUpload';
import ReviewSubmit from '../components/asset/ReviewSubmit';
import CompositeAssetSelection from '../components/CompositeAssetSelection';
import { taxonomyFormatter } from '../utils/taxonomyFormatter';
import SubcategoryDiscrepancyAlert from '../components/asset/SubcategoryDiscrepancyAlert';

// Types
import { LayerOption, CategoryOption, SubcategoryOption } from '../types/taxonomy.types';
import { FileUploadResponse, Asset, SOURCE_OPTIONS } from '../types/asset.types';

// Define the steps in the composite registration process
// Layer is already selected via URL parameters, so we start with taxonomy
const getCompositeSteps = () => {
  return ['Choose Taxonomy', 'Upload Files', 'Search & Add Components', 'Review & Submit'];
};

// Define the form validation schema
const compositeSchema = yup.object({
  layer: yup.string().required('Layer is required'),
  layerName: yup.string(),
  categoryCode: yup.string().required('Category is required'),
  categoryName: yup.string(),
  subcategoryCode: yup.string().required('Subcategory is required'),
  subcategoryName: yup.string(),
  subcategoryNumericCode: yup.string(),
  name: yup.string().required('Name is required'),
  description: yup.string(),
  source: yup.string().required('Source is required'),
  tags: yup.array().of(yup.string()),
  files: yup.array(),
  // NNA Address fields
  hfn: yup.string(), // human friendly name
  mfa: yup.string(), // machine friendly address
  sequential: yup.string(), // sequential number
  // Composite-specific fields
  components: yup.array().of(yup.object()).min(2, 'Composite assets require at least 2 components'),
});

interface CompositeFormData {
  layer: string;
  layerName: string;
  categoryCode: string;
  categoryName: string;
  subcategoryCode: string;
  subcategoryName: string;
  subcategoryNumericCode: string;
  name: string;
  description: string;
  source: string;
  tags: string[];
  files: File[];
  hfn: string; // human friendly name
  mfa: string; // machine friendly address
  sequential: string; // sequential number
  components: any[]; // Component assets
}

const CompositeRegisterAssetPage: React.FC = () => {
  // State management
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse[]>([]);
  const [showSuccessPage, setShowSuccessPage] = useState<boolean>(false);
  const [createdAsset, setCreatedAsset] = useState<Asset | null>(null);
  const [selectedComponents, setSelectedComponents] = useState<any[]>([]);

  // URL parameters handling
  const [searchParams] = useSearchParams();
  const urlLayer = searchParams.get('layer') || 'C';
  const urlLayerName = searchParams.get('layerName') || 'Composites';
  
  environmentSafeLog(`CompositeRegisterAssetPage initialized with layer: ${urlLayer} (${urlLayerName})`);

  // React Hook Form setup
  const methods = useForm({
    resolver: yupResolver(compositeSchema) as any,
    defaultValues: {
      layer: urlLayer, // Use layer from URL parameters
      layerName: urlLayerName, // Use layer name from URL parameters
      categoryCode: '',
      categoryName: '',
      subcategoryCode: '',
      subcategoryName: '',
      subcategoryNumericCode: '',
      name: '',
      description: '',
      source: '',
      tags: [],
      files: [],
      hfn: '',
      mfa: '',
      sequential: '000', // Default for composites
      components: [],
    },
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, getValues, watch, trigger } = methods;

  // Watch form values
  const watchLayer = watch('layer');
  const watchCategoryCode = watch('categoryCode');
  const watchSubcategoryCode = watch('subcategoryCode');

  // IMPORTANT: Force real API mode for asset creation
  React.useEffect(() => {
    localStorage.setItem('forceMockApi', 'false');
    environmentSafeLog('FORCING REAL API MODE for composite asset creation');
  }, []);

  // Navigation handlers
  const handleNext = async () => {
    // Validate current step before proceeding
    let isValid = true;
    
    switch (activeStep) {
      case 0: // Taxonomy Selection (Category + Subcategory)
        isValid = await trigger(['categoryCode', 'subcategoryCode']);
        break;
      case 1: // File Upload
        isValid = await trigger(['files', 'name', 'description', 'source']);
        break;
      case 2: // Component Selection
        isValid = selectedComponents.length >= 2;
        if (!isValid) {
          setError('Please select at least 2 component assets for the composite.');
          return;
        }
        setValue('components', selectedComponents as any);
        break;
      case 3: // Review & Submit - no validation needed, will submit
        break;
    }

    if (isValid) {
      setError(null);
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else {
      setError('Please complete all required fields before proceeding.');
    }
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // File upload handlers
  const handleFilesChange = (files: File[]) => {
    setValue('files', files as any);
    environmentSafeLog('Files changed:', files);
  };

  const handleUploadProgress = (fileId: string, progress: number) => {
    environmentSafeLog('Upload progress:', fileId, progress);
  };

  const handleUploadComplete = (fileId: string, fileData: FileUploadResponse) => {
    setUploadedFiles(prev => [...prev, fileData]);
    environmentSafeLog('Upload completed:', fileId, fileData);
  };

  const handleUploadError = (error: string) => {
    setError(error);
    environmentSafeError('Upload error:', error);
  };

  // Layer selection handler (pre-filled with C, but allow changing)
  const handleLayerSelect = (layer: LayerOption, isDoubleClick?: boolean) => {
    setValue('layer', layer.code);
    setValue('layerName', layer.name);
    
    // Clear category and subcategory when layer changes
    setValue('categoryCode', '');
    setValue('categoryName', '');
    setValue('subcategoryCode', '');
    setValue('subcategoryName', '');
    setValue('subcategoryNumericCode', '');
    setValue('hfn', '');
    setValue('mfa', '');
    
    if (isDoubleClick) {
      handleNext();
    }
  };

  // Category selection handler
  const handleCategorySelect = (categoryCode: string) => {
    setValue('categoryCode', categoryCode);
    setValue('categoryName', ''); // Will be set by SimpleTaxonomySelectionV3
    setValue('subcategoryCode', '');
    setValue('subcategoryName', '');
    setValue('subcategoryNumericCode', '');
    updateNNAAddress();
  };

  // Subcategory selection handler
  const handleSubcategorySelect = (subcategoryCode: string) => {
    setValue('subcategoryCode', subcategoryCode);
    setValue('subcategoryName', ''); // Will be set by SimpleTaxonomySelectionV3
    setValue('subcategoryNumericCode', ''); // Will be set by SimpleTaxonomySelectionV3
    updateNNAAddress();
  };

  // Update NNA Address when taxonomy changes
  const updateNNAAddress = () => {
    const layer = getValues('layer');
    const categoryCode = getValues('categoryCode');
    const subcategoryCode = getValues('subcategoryCode');
    
    if (layer && categoryCode && subcategoryCode) {
      try {
        const hfn = `${layer}.${categoryCode}.${subcategoryCode}.000`;
        const addressResult = formatNNAAddressForDisplay(layer, categoryCode, subcategoryCode);
        const mfa = typeof addressResult === 'string' ? addressResult : addressResult.mfa;
        
        setValue('hfn', hfn);
        setValue('mfa', mfa);
        setValue('sequential', '000');
        
        environmentSafeLog('Updated NNA Address:', { hfn, mfa });
      } catch (error) {
        environmentSafeWarn('Failed to generate NNA Address:', error);
      }
    }
  };

  // Component selection handler
  const handleComponentsChange = (components: any[]) => {
    setSelectedComponents(components);
    setValue('components', components as any);
    environmentSafeLog('Components changed:', components);
  };

  // Form submission handler
  const onSubmit: SubmitHandler<CompositeFormData> = async (data) => {
    try {
      setLoading(true);
      setError(null);

      environmentSafeLog('Submitting composite asset with data:', data);

      // Generate the composite HFN with component addresses
      const componentMFAs = selectedComponents.map(component => 
        component.nna_address || component.nnaAddress || component.mfa || 'UNKNOWN.MFA'
      );
      const compositeAddress = `${data.hfn}:${componentMFAs.join('+')}`;

      const assetData = {
        name: data.name,
        description: data.description,
        source: data.source,
        layer: data.layer,
        categoryCode: data.categoryCode,
        subcategoryCode: data.subcategoryCode,
        tags: data.tags || [],
        files: data.files || [],
        nnaAddress: compositeAddress,
        metadata: {
          hfn: data.hfn,
          mfa: data.mfa,
          componentCount: selectedComponents.length,
          components: componentMFAs,
          isComposite: true,
          originalSubcategory: data.subcategoryCode,
        },
      };

      environmentSafeLog('Final asset data for submission:', assetData);

      const createdAsset = await assetService.createAsset(assetData);
      environmentSafeLog("Composite asset created successfully:", createdAsset);

      setCreatedAsset(createdAsset);
      setSuccess(true);
      setShowSuccessPage(true);

      // Store in session for success page
      window.sessionStorage.setItem('showSuccessPage', 'true');
      localStorage.setItem('lastCreatedAsset', JSON.stringify(createdAsset));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to create composite asset: ${errorMessage}`);
      environmentSafeError('Composite asset creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Choose Taxonomy (Category + Subcategory)
        return (
          <>
            <SimpleTaxonomySelectionV3
              selectedLayer={watchLayer}
              onLayerSelect={(layer) => {
                setValue('layer', layer);
                setValue('categoryCode', '');
                setValue('subcategoryCode', '');
              }}
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
              selectedCategoryCode={watchCategoryCode}
              selectedSubcategoryCode={watchSubcategoryCode}
            />
            
            {/* Show current selection */}
            {watchCategoryCode && watchSubcategoryCode && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Selected:</strong> {watchLayer}.{watchCategoryCode}.{watchSubcategoryCode}.000
                </Typography>
              </Box>
            )}
          </>
        );
      
      case 1: // Upload Files
        return (
          <Box>
            {/* Show taxonomy context */}
            <TaxonomyContext
              layer={watchLayer}
              layerName={getValues('layerName')}
              categoryCode={watchCategoryCode}
              categoryName={getValues('categoryName')}
              subcategoryCode={watchSubcategoryCode}
              subcategoryName={getValues('subcategoryName')}
            />
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Upload Composite Asset File
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload the main composite asset file (typically a .mp4 video that combines multiple layer elements).
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <FileUpload
              onFilesChange={handleFilesChange}
              layerCode={watchLayer}
              maxFiles={1}
              onUploadProgress={handleUploadProgress}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              initialFiles={getValues('files')}
            />
            
            {/* Asset Details Form */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Asset Details
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Provide additional information about your composite asset.
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Name *
                    </Typography>
                    <input
                      {...register('name')}
                      placeholder="Composite Asset Name"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                    />
                    {errors.name && (
                      <Typography color="error" variant="caption" display="block">
                        {errors.name.message}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Description
                    </Typography>
                    <textarea
                      {...register('description')}
                      placeholder="Describe this composite asset..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Tags
                    </Typography>
                    <input
                      {...register('tags')}
                      placeholder="Enter tags separated by commas"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                        setValue('tags', tags as any);
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="source-label">Source</InputLabel>
                    <Select
                      labelId="source-label"
                      value={watch('source')}
                      label="Source"
                      error={!!errors.source}
                      {...register('source')}
                      onChange={(e) => setValue('source', e.target.value)}
                    >
                      {SOURCE_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.source && (
                      <FormHelperText error>
                        {errors.source.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      
      case 2: // Search & Add Components
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Search & Add Component Assets
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Search and select the existing component assets that were used to create this composite asset.
              These components should already be registered in the system through the individual layer workflows.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <CompositeAssetSelection
              targetLayer={watchLayer}
              layerName={getValues('layerName')}
              onComponentsSelected={handleComponentsChange}
            />
          </Box>
        );
      
      case 3: // Review & Submit
        return (
          <ReviewSubmit
            assetData={{
              name: getValues('name'),
              description: getValues('description'),
              source: getValues('source'),
              layer: getValues('layer'),
              layerName: getValues('layerName'),
              categoryCode: getValues('categoryCode'),
              categoryName: getValues('categoryName'),
              subcategoryCode: getValues('subcategoryCode'),
              subcategoryName: getValues('subcategoryName'),
              hfn: getValues('hfn'),
              mfa: getValues('mfa'),
              sequential: getValues('sequential'),
              files: getValues('files'),
              uploadedFiles: uploadedFiles,
              tags: getValues('tags'),
              components: selectedComponents,
            }}
            onEditStep={(step) => setActiveStep(step)}
            loading={loading}
            error={error}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit as any)}
          />
        );
      
      default:
        return 'Unknown step';
    }
  };

  // Render Success Screen
  const renderSuccessScreen = () => {
    if (!createdAsset) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h4" gutterBottom color="success.main">
            ❌ Error
          </Typography>
          <Typography variant="body1">
            Asset creation completed but asset data is missing.
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h4" gutterBottom color="success.main">
          🎉 Composite Asset Created Successfully!
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            {createdAsset.friendlyName || createdAsset.name}
          </Typography>
          <Typography variant="body1">
            <strong>HFN:</strong> {createdAsset.metadata?.hfn || 'N/A'}
          </Typography>
          <Typography variant="body1">
            <strong>MFA:</strong> {createdAsset.nnaAddress || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Components:</strong> {selectedComponents.length} assets
          </Typography>
        </Paper>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/dashboard'}
          >
            🏠 Go to Dashboard
          </Button>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/register-asset'}
          >
            ➕ Register Another Asset
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/training-data'}
          >
            📊 Upload Training Data
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/personalize'}
          >
            🎨 Upload Personalize Data
          </Button>
        </Box>
      </Box>
    );
  };

  // Show success page if asset was created
  if (showSuccessPage && createdAsset) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mt: 4 }}>
          {renderSuccessScreen()}
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Composite Asset Registration - {urlLayerName} Layer
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Register a composite asset that references multiple component assets from different layers.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {getCompositeSteps().map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <FormProvider {...methods}>
          <Box>{getStepContent(activeStep)}</Box>

          {/* Navigation buttons */}
          {activeStep < getCompositeSteps().length - 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<PreviousIcon />}
                disabled={activeStep === 0}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<NextIcon />}
                  disabled={loading}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default CompositeRegisterAssetPage;