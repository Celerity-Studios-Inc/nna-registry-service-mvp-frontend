import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Paper, Box, Button, TextField, 
  CircularProgress, Stepper, Step, StepLabel 
} from '@mui/material';
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
  
  // Load actual taxonomy data from taxonomyService
  useEffect(() => {
    const loadTaxonomyData = () => {
      setLoading(true);
      try {
        // Get all layers
        const layers = Object.keys(LAYER_LOOKUPS).map(layerCode => {
          return {
            code: layerCode,
            name: LAYER_LOOKUPS[layerCode].__name || layerCode,
            numericCode: taxonomyService.getLayerNumericCode(layerCode),
          };
        });

        // Initialize categories and subcategories arrays
        const categories: TaxonomyData['categories'] = [];
        const subcategories: TaxonomyData['subcategories'] = [];

        // For each layer, get categories and subcategories
        layers.forEach(layer => {
          const layerCategories = taxonomyService.getCategories(layer.code);
          
          // Add each category to the categories array
          layerCategories.forEach(category => {
            categories.push({
              layer: layer.code,
              code: category.code,
              name: category.name,
              numericCode: category.numericCode,
            });
            
            // Get and add subcategories for this category
            const categorySubcategories = taxonomyService.getSubcategories(layer.code, category.code);
            
            categorySubcategories.forEach(subcategory => {
              subcategories.push({
                layer: layer.code,
                categoryCode: category.code,
                code: subcategory.code,
                name: subcategory.name,
                numericCode: subcategory.numericCode,
              });
            });
          });
        });

        // Set the taxonomy data
        setTaxonomyData({
          layers,
          categories,
          subcategories,
        });
        
        setLoading(false);
        logger.debug('Taxonomy data loaded successfully:', {
          layerCount: layers.length,
          categoryCount: categories.length,
          subcategoryCount: subcategories.length,
        });
      } catch (err) {
        setError('Failed to load taxonomy data');
        setLoading(false);
        logger.error('Error loading taxonomy:', err instanceof Error ? err.message : String(err));
      }
    };
    
    loadTaxonomyData();
  }, []);
  
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
  
  // Handle form submission
  const handleSubmit = () => {
    // Here you would submit the form data to your API
    console.log('Form data to submit:', formData);
    
    // Simulate API call
    setTimeout(() => {
      alert('Asset registered successfully!');
      // Reset form or redirect
    }, 1500);
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
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Submission
            </Typography>
            
            <Typography variant="subtitle1">
              Taxonomy:
            </Typography>
            <Typography variant="body1" paragraph>
              Layer: <strong>{formData.taxonomy.layer}</strong><br />
              Category: <strong>{formData.taxonomy.category}</strong><br />
              Subcategory: <strong>{formData.taxonomy.subcategory}</strong>
            </Typography>
            
            <Typography variant="subtitle1">
              Asset Details:
            </Typography>
            <Typography variant="body1" paragraph>
              Description: <strong>{formData.details.description}</strong><br />
              Source: <strong>{formData.details.source}</strong><br />
              Tags: <strong>{formData.details.tags.join(', ')}</strong><br />
              File: <strong>{formData.file ? formData.file.name : 'No file selected'}</strong>
            </Typography>
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
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Simplified Asset Registration
        </Typography>
        <Typography variant="subtitle1" color="secondary" gutterBottom>
          This is a simplified implementation with improved stability for taxonomy selection.
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
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
              disabled={!formData.taxonomy.layer || !formData.taxonomy.category || !formData.taxonomy.subcategory}
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
      </Paper>
    </Container>
  );
};

export default AssetRegistration;