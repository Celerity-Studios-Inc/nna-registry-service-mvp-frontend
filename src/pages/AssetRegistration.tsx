import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Typography, Paper, Box, Button, TextField, 
  CircularProgress, Stepper, Step, StepLabel, Alert, Backdrop,
  Snackbar
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { SimplifiedTaxonomySelector } from '../components/taxonomy/SimplifiedTaxonomySelector';
import { taxonomyService } from '../services/simpleTaxonomyService';
import { LAYER_LOOKUPS } from '../taxonomyLookup/constants';
import { logger } from '../utils/logger';

// Define interfaces
interface TaxonomySelection {
  layer: string;
  category: string;
  subcategory: string;
}

interface AssetDetails {
  description: string;
  source: string;
  tags: string[];
}

interface FormData {
  taxonomy: TaxonomySelection;
  details: AssetDetails;
  file: File | null;
}

// Interface for taxonomy data
interface TaxonomyData {
  layers: Array<{
    code: string;
    name: string;
    numericCode: string;
  }>;
  categories: Array<{
    layer: string;
    code: string;
    name: string;
    numericCode: string;
  }>;
  subcategories: Array<{
    layer: string;
    categoryCode: string;
    code: string;
    name: string;
    numericCode: string;
  }>;
}

export const AssetRegistration: React.FC = () => {
  // State for the taxonomy data
  const [taxonomyData, setTaxonomyData] = useState<TaxonomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for form submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // State for user feedback
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
    autoHideDuration?: number;
  }>({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 3000,
  });
  
  // State for the multi-step form
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Select Taxonomy', 'Asset Details', 'Preview & Submit'];
  
  // State for form data
  const [formData, setFormData] = useState<FormData>({
    taxonomy: {
      layer: '',
      category: '',
      subcategory: ''
    },
    details: {
      description: '',
      source: 'ReViz',
      tags: []
    },
    file: null
  });
  
  // Handle feedback notifications
  const showFeedback = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info', autoHideDuration: number = 3000) => {
    setFeedback({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
  }, []);
  
  const handleCloseFeedback = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setFeedback(prev => ({ ...prev, open: false }));
  };
  
  // Load actual taxonomy data from taxonomyService with optimized approach
  useEffect(() => {
    const loadTaxonomyData = async () => {
      setLoading(true);
      try {
        // Wait for taxonomy initialization to complete
        const { waitForTaxonomyInit } = await import('../services/taxonomyInitializer');
        await waitForTaxonomyInit();
        
        // Get all layers
        const layers = Object.keys(LAYER_LOOKUPS).map(layerCode => {
          return {
            code: layerCode,
            name: LAYER_LOOKUPS[layerCode].__name || layerCode,
            numericCode: taxonomyService.getLayerNumericCode(layerCode),
          };
        });

        // Initialize categories array - we'll prefetch categories only
        const categories: TaxonomyData['categories'] = [];
        const subcategories: TaxonomyData['subcategories'] = [];

        // For each layer, get basic categories
        logger.debug('Loading categories for all layers');
        for (const layer of layers) {
          const layerCategories = taxonomyService.getCategories(layer.code);
          
          layerCategories.forEach(category => {
            categories.push({
              layer: layer.code,
              code: category.code,
              name: category.name,
              numericCode: category.numericCode,
            });
          });
        }

        // For efficiency and performance, don't preload all subcategories
        // They will be loaded only when needed

        // Set the taxonomy data with prefetched categories but empty subcategories
        setTaxonomyData({
          layers,
          categories,
          subcategories, // Initially empty, will be filled when user selects a category
        });
        
        setLoading(false);
        logger.debug('Taxonomy data loaded successfully:', {
          layerCount: layers.length,
          categoryCount: categories.length,
        });
      } catch (err) {
        setError('Failed to load taxonomy data');
        setLoading(false);
        logger.error('Error loading taxonomy:', err instanceof Error ? err.message : String(err));
      }
    };
    
    loadTaxonomyData();
  }, []);
  
  // Handle loading subcategories when a layer and category are selected
  const loadSubcategories = useCallback(async (layer: string, category: string) => {
    if (!layer || !category) return;
    
    try {
      const categorySubcategories = taxonomyService.getSubcategories(layer, category);
      
      if (categorySubcategories.length > 0) {
        // Map to our expected format
        const formattedSubcategories = categorySubcategories.map(subcategory => ({
          layer,
          categoryCode: category,
          code: subcategory.code,
          name: subcategory.name,
          numericCode: subcategory.numericCode,
        }));
        
        setTaxonomyData(prevData => {
          if (!prevData) return prevData;
          
          // Merge new subcategories with existing ones (replacing any that exist)
          const existingSubcats = prevData.subcategories.filter(
            sc => sc.layer !== layer || sc.categoryCode !== category
          );
          
          return {
            ...prevData,
            subcategories: [...existingSubcats, ...formattedSubcategories],
          };
        });
        
        logger.debug(`Loaded ${categorySubcategories.length} subcategories for ${layer}.${category}`);
      } else {
        logger.warn(`No subcategories found for ${layer}.${category}`);
      }
    } catch (err) {
      logger.error(`Failed to load subcategories for ${layer}.${category}:`, 
        err instanceof Error ? err.message : String(err)
      );
    }
  }, []);
  
  // When layer and category are selected, load subcategories
  useEffect(() => {
    if (formData.taxonomy.layer && formData.taxonomy.category) {
      loadSubcategories(formData.taxonomy.layer, formData.taxonomy.category);
    }
  }, [formData.taxonomy.layer, formData.taxonomy.category, loadSubcategories]);

  // Handle taxonomy selection complete
  const handleTaxonomySelectionComplete = (selection: TaxonomySelection) => {
    setFormData({
      ...formData,
      taxonomy: selection
    });
  };
  
  // Handle input changes for details form
  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        [name]: value
      }
    });
  };
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
    }
  };
  
  // Handle form navigation
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle form submission with proper error handling and loading state
  const handleSubmit = async () => {
    // Reset previous submission state
    setSubmitError('');
    setSubmitSuccess(false);
    setSubmitting(true);
    
    console.log('Form data to submit:', formData);
    
    try {
      // Validate all required fields
      if (!formData.taxonomy.layer || !formData.taxonomy.category || !formData.taxonomy.subcategory) {
        throw new Error('Taxonomy selection is incomplete. Please complete all selections.');
      }
      
      if (!formData.details.description) {
        throw new Error('Please provide a description for the asset.');
      }
      
      if (!formData.file) {
        throw new Error('Please upload a file for the asset.');
      }
      
      // Create FormData object for file upload
      const submitFormData = new FormData();
      submitFormData.append('file', formData.file);
      submitFormData.append('layer', formData.taxonomy.layer);
      submitFormData.append('categoryCode', formData.taxonomy.category);
      submitFormData.append('subcategoryCode', formData.taxonomy.subcategory);
      submitFormData.append('description', formData.details.description);
      submitFormData.append('source', formData.details.source);
      submitFormData.append('tags', JSON.stringify(formData.details.tags));
      
      // In a real implementation, we would call an API here
      // For now, simulate a successful API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Handle success
      setSubmitSuccess(true);
      showFeedback('Asset registered successfully!', 'success', 5000);
      
      // Reset form after successful submission (optional)
      setTimeout(() => {
        setActiveStep(0);
        setFormData({
          taxonomy: { layer: '', category: '', subcategory: '' },
          details: { description: '', source: 'ReViz', tags: [] },
          file: null
        });
      }, 2000);
      
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : 'Failed to register asset';
      setSubmitError(errorMessage);
      showFeedback(errorMessage, 'error', 5000);
      logger.error('Form submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <SimplifiedTaxonomySelector 
            taxonomyData={taxonomyData}
            onSelectionComplete={handleTaxonomySelectionComplete}
            initialSelection={formData.taxonomy}
          />
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Description"
              name="description"
              value={formData.details.description}
              onChange={handleDetailsChange}
              multiline
              rows={4}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Source"
              name="source"
              value={formData.details.source}
              onChange={handleDetailsChange}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Tags (comma separated)"
              name="tags"
              value={formData.details.tags.join(', ')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({
                  ...formData,
                  details: {
                    ...formData.details,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                  }
                });
              }}
              fullWidth
              margin="normal"
            />
            
            <Box sx={{ mt: 2 }}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="raised-button-file">
                <Button variant="contained" component="span">
                  Upload File
                </Button>
              </label>
              {formData.file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {formData.file.name}
                </Typography>
              )}
            </Box>
          </Box>
        );
      case 2:
        // Compute HFN and MFA for display
        let hfnPreview = '';
        let mfaPreview = '';
        
        if (formData.taxonomy.layer && formData.taxonomy.category && formData.taxonomy.subcategory) {
          // Construct the HFN with standard sequential number 001
          hfnPreview = `${formData.taxonomy.layer}.${formData.taxonomy.category}.${formData.taxonomy.subcategory}.001`;
          
          // Try to get the MFA using the taxonomyService
          try {
            mfaPreview = taxonomyService.convertHFNtoMFA(hfnPreview);
          } catch (err) {
            logger.error('Error converting HFN to MFA:', err);
            
            // Fallback to manual calculation if taxonomyService fails
            const layerNumericCode = taxonomyData?.layers.find(
              l => l.code === formData.taxonomy.layer
            )?.numericCode || '000';
            
            const categoryNumericCode = taxonomyData?.categories.find(
              c => c.layer === formData.taxonomy.layer && c.code === formData.taxonomy.category
            )?.numericCode || '000';
            
            const subcategoryNumericCode = taxonomyData?.subcategories.find(
              s => s.layer === formData.taxonomy.layer && 
                  s.categoryCode === formData.taxonomy.category && 
                  s.code === formData.taxonomy.subcategory
            )?.numericCode || '000';
            
            // Manual MFA creation (fallback)
            mfaPreview = `${layerNumericCode}.${categoryNumericCode}.${subcategoryNumericCode}.001`;
          }
        }
        
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Submission
            </Typography>
            
            {/* Asset Identifiers Section with HFN/MFA */}
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Asset Identifiers:
              </Typography>
              <Typography variant="body1">
                Human-Friendly Name (HFN): <strong>{hfnPreview || 'Incomplete selection'}</strong>
              </Typography>
              <Typography variant="body1">
                Machine-Friendly Address (MFA): <strong>{mfaPreview || 'Incomplete selection'}</strong>
              </Typography>
            </Box>
            
            {/* Taxonomy Section */}
            <Typography variant="subtitle1">
              Taxonomy:
            </Typography>
            <Typography variant="body1" paragraph>
              Layer: <strong>{formData.taxonomy.layer || 'Not selected'}</strong><br />
              Category: <strong>{formData.taxonomy.category || 'Not selected'}</strong><br />
              Subcategory: <strong>{formData.taxonomy.subcategory || 'Not selected'}</strong>
            </Typography>
            
            {/* Asset Details Section */}
            <Typography variant="subtitle1">
              Asset Details:
            </Typography>
            <Typography variant="body1" paragraph>
              Description: <strong>{formData.details.description || 'Not provided'}</strong><br />
              Source: <strong>{formData.details.source}</strong><br />
              Tags: <strong>{formData.details.tags.length > 0 ? formData.details.tags.join(', ') : 'None'}</strong><br />
              File: <strong>{formData.file ? formData.file.name : 'No file selected'}</strong>
            </Typography>
            
            {/* Summary message */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Please review your submission carefully. Once submitted, this asset will be registered in the NNA Registry Service
                with the identifiers shown above.
              </Typography>
            </Alert>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  // Show loading indicator while taxonomy data is loading
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Show error if taxonomy data failed to load
  if (error) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3, position: 'relative' }}>
        {/* Loading overlay */}
        <Backdrop
          sx={{ 
            position: 'absolute', 
            zIndex: theme => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 1
          }}
          open={submitting}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress color="primary" />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Registering asset...
            </Typography>
          </Box>
        </Backdrop>
        
        <Typography variant="h4" gutterBottom>
          Simplified Asset Registration
        </Typography>
        <Typography variant="subtitle1" color="secondary" gutterBottom>
          This is a simplified implementation with improved stability for taxonomy selection.
        </Typography>
        
        {/* Success message */}
        {submitSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            icon={<CheckCircleIcon fontSize="inherit" />}
          >
            <Typography variant="body1">
              Asset registered successfully!
            </Typography>
          </Alert>
        )}
        
        {/* Error message */}
        {submitError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            icon={<ErrorIcon fontSize="inherit" />}
          >
            <Typography variant="body1">
              {submitError}
            </Typography>
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Show loading spinner while loading taxonomy data */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 3 }}>
            <Typography variant="body1">{error}</Typography>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }} 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Alert>
        ) : (
          <>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}
              
              {activeStep === steps.length - 1 ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleSubmit}
                  disabled={!formData.taxonomy.layer || !formData.taxonomy.category || !formData.taxonomy.subcategory || submitting}
                >
                  Submit
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && (!formData.taxonomy.layer || !formData.taxonomy.category || !formData.taxonomy.subcategory)) ||
                    (activeStep === 1 && !formData.file)
                  }
                >
                  Next
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
      
      {/* Feedback snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={feedback.autoHideDuration}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseFeedback} 
          severity={feedback.severity} 
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AssetRegistration;