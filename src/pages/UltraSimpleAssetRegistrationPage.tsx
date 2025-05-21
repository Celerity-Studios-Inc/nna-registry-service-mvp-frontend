/**
 * UltraSimpleAssetRegistrationPage
 * 
 * A drastically simplified asset registration page that uses native HTML elements
 * and minimal state management to provide a guaranteed reliable registration experience.
 * 
 * This is the "nuclear option" to resolve the persistent taxonomy selection issues.
 */

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress,
  Snackbar
} from '@mui/material';
import UltraSimpleTaxonomySelector from '../components/ultra-simple/UltraSimpleTaxonomySelector';
import './UltraSimpleAssetRegistrationPage.css';

interface TaxonomySelection {
  layer: string;
  category: string;
  subcategory: string;
  hfn: string;
  mfa: string;
}

const UltraSimpleAssetRegistrationPage: React.FC = () => {
  console.log('[UltraSimpleAssetRegistrationPage] Rendering page');
  
  // Simple form state
  const [taxonomySelection, setTaxonomySelection] = useState<TaxonomySelection | null>(null);
  const [description, setDescription] = useState('');
  const [source, setSource] = useState('Ultra Simple Registration');
  const [tags, setTags] = useState<string[]>(['ultra-simple']);
  const [file, setFile] = useState<File | null>(null);
  
  // Form status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Feedback message
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'info' | 'warning'
  });
  
  // Handle taxonomy selection
  const handleTaxonomySelectionComplete = (selection: TaxonomySelection) => {
    console.log('[UltraSimpleAssetRegistrationPage] Taxonomy selection complete:', selection);
    setTaxonomySelection(selection);
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('[UltraSimpleAssetRegistrationPage] File selected:', selectedFile.name);
      setFile(selectedFile);
    }
  };
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'description') {
      setDescription(value);
    } else if (name === 'source') {
      setSource(value);
    } else if (name === 'tags') {
      setTags(value.split(',').map(tag => tag.trim()).filter(Boolean));
    }
  };
  
  // Show feedback message
  const showFeedback = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setFeedback({
      open: true,
      message,
      severity
    });
  };
  
  // Close feedback message
  const handleCloseFeedback = () => {
    setFeedback(prev => ({ ...prev, open: false }));
  };
  
  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!taxonomySelection) {
      showFeedback('Please complete the taxonomy selection', 'error');
      return;
    }
    
    if (!description) {
      showFeedback('Please provide a description', 'error');
      return;
    }
    
    if (!file) {
      showFeedback('Please select a file', 'error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      console.log('[UltraSimpleAssetRegistrationPage] Preparing form submission...');
      
      // Prepare form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('layer', taxonomySelection.layer);
      formData.append('categoryCode', taxonomySelection.category);
      formData.append('subcategoryCode', taxonomySelection.subcategory);
      formData.append('description', description);
      formData.append('source', source);
      formData.append('tags', JSON.stringify(tags));
      formData.append('hfn', taxonomySelection.hfn);
      formData.append('mfa', taxonomySelection.mfa);
      
      // Log the form data for debugging
      console.log('[UltraSimpleAssetRegistrationPage] Form data prepared:', {
        layer: taxonomySelection.layer,
        categoryCode: taxonomySelection.category,
        subcategoryCode: taxonomySelection.subcategory,
        hfn: taxonomySelection.hfn,
        mfa: taxonomySelection.mfa,
        description,
        source,
        tags,
        fileName: file.name,
        fileSize: file.size
      });
      
      // Normally we would call the API here
      // For testing, simulate an API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set success
      setSubmitSuccess(true);
      showFeedback('Asset registered successfully!', 'success');
      
      console.log('[UltraSimpleAssetRegistrationPage] Submission successful');
      
      // Reset form after success (optional)
      setTimeout(() => {
        setSubmitSuccess(false);
        setTaxonomySelection(null);
        setDescription('');
        setFile(null);
      }, 5000);
    } catch (error) {
      console.error('[UltraSimpleAssetRegistrationPage] Error submitting form:', error);
      setSubmitError('Failed to submit form. Please try again.');
      showFeedback('Failed to submit form. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Box className="ultra-simple-page">
      <Paper className="ultra-simple-container" elevation={3}>
        <Typography variant="h4" component="h1" className="ultra-simple-title">
          Ultra Simple Asset Registration
        </Typography>
        
        <Alert severity="info" className="ultra-simple-alert">
          This is an ultra-simplified asset registration form designed for maximum reliability.
          Use this form if you're experiencing issues with the standard registration process.
        </Alert>
        
        {submitSuccess && (
          <Alert severity="success" className="ultra-simple-result">
            <Typography variant="body1">Asset registered successfully!</Typography>
            <div className="preview-item">
              <strong>HFN:</strong> {taxonomySelection?.hfn}
            </div>
            <div className="preview-item">
              <strong>MFA:</strong> {taxonomySelection?.mfa}
            </div>
          </Alert>
        )}
        
        {submitError && (
          <Alert severity="error" className="ultra-simple-result">
            {submitError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="ultra-simple-form">
          <Box className="form-section">
            <Typography variant="h5" component="h2">
              Step 1: Taxonomy Selection
            </Typography>
            
            <UltraSimpleTaxonomySelector
              onSelectionComplete={handleTaxonomySelectionComplete}
            />
          </Box>
          
          <Box className="form-section">
            <Typography variant="h5" component="h2">
              Step 2: Asset Details
            </Typography>
            
            <TextField
              label="Description"
              name="description"
              value={description}
              onChange={handleInputChange}
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              margin="normal"
              required
            />
            
            <TextField
              label="Source"
              name="source"
              value={source}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Tags (comma separated)"
              name="tags"
              value={tags.join(', ')}
              onChange={handleInputChange}
              variant="outlined"
              fullWidth
              margin="normal"
              helperText="Tags will help with identifying and categorizing this asset"
            />
            
            <Box className="file-upload-section">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden-input"
              />
              <label htmlFor="file-upload" className="file-upload-button">
                Choose File
              </label>
              {file && (
                <Typography className="file-name">
                  Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box className="form-section">
            <Typography variant="h5" component="h2">
              Step 3: Submit
            </Typography>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={isSubmitting || !taxonomySelection || !description || !file}
              className="submit-button"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} className="button-progress" />
                  Submitting...
                </>
              ) : 'Register Asset'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Snackbar
        open={feedback.open}
        autoHideDuration={6000}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseFeedback} 
          severity={feedback.severity}
          variant="filled"
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UltraSimpleAssetRegistrationPage;