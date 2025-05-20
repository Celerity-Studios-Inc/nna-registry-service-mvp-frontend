import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  Check as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { EmergencyTaxonomySelector } from '../components/taxonomy/EmergencyTaxonomySelector';
import { emergencyTaxonomyAdapter } from '../services/emergencyTaxonomyAdapter';
import { logger } from '../utils/logger';

// Type definitions
interface TaxonomySelection {
  layer: string;
  category: string;
  subcategory: string;
}

interface AssetDetails {
  description: string;
  source: string;
  tags: string[];
  sequentialNumber?: string;
}

/**
 * EmergencyAssetRegistrationPage
 * 
 * This page provides a simplified, resilient interface for registering assets
 * when the regular asset registration process might be experiencing issues.
 * It uses direct access to taxonomy data to ensure reliability.
 */
export const EmergencyAssetRegistrationPage: React.FC = () => {
  // State for taxonomy data
  const [taxonomyData, setTaxonomyData] = useState(emergencyTaxonomyAdapter.getTaxonomyData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for form data
  const [taxonomySelection, setTaxonomySelection] = useState<TaxonomySelection>({
    layer: '',
    category: '',
    subcategory: '',
  });
  
  const [details, setDetails] = useState<AssetDetails>({
    description: '',
    source: 'Emergency Registration',
    tags: ['emergency'],
    sequentialNumber: '001', // Default sequential number
  });
  
  const [file, setFile] = useState<File | null>(null);
  
  // State for form submission
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  
  // State for feedback
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error' | 'warning',
    duration: 6000,
  });
  
  // Current HFN and MFA based on selection
  const [currentHFN, setCurrentHFN] = useState('');
  const [currentMFA, setCurrentMFA] = useState('');
  
  // Handle feedback display
  const showFeedback = (message: string, severity: 'info' | 'success' | 'error' | 'warning' = 'info', duration = 6000) => {
    setFeedback({
      open: true,
      message,
      severity,
      duration,
    });
  };
  
  const handleCloseFeedback = () => {
    setFeedback(prev => ({ ...prev, open: false }));
  };
  
  // Update HFN and MFA when taxonomy selection changes
  useEffect(() => {
    if (taxonomySelection.layer && taxonomySelection.category && taxonomySelection.subcategory) {
      const hfn = `${taxonomySelection.layer}.${taxonomySelection.category}.${taxonomySelection.subcategory}.${details.sequentialNumber || '001'}`;
      setCurrentHFN(hfn);
      
      try {
        const mfa = emergencyTaxonomyAdapter.convertHFNtoMFA(hfn);
        setCurrentMFA(mfa);
      } catch (error) {
        logger.error('Error converting HFN to MFA:', error);
        setCurrentMFA('');
      }
    } else {
      setCurrentHFN('');
      setCurrentMFA('');
    }
  }, [taxonomySelection, details.sequentialNumber]);
  
  // Update taxonomy selection when selector completes
  const handleTaxonomySelectionComplete = useCallback((selection: TaxonomySelection) => {
    setTaxonomySelection(selection);
    logger.info('Taxonomy selection complete:', selection);
  }, []);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'tags') {
      setDetails({
        ...details,
        tags: value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      });
    } else if (name === 'sequentialNumber') {
      // Validate sequential number (3 digits)
      const validatedValue = value.replace(/[^0-9]/g, '').substring(0, 3);
      
      // Pad with leading zeros if needed
      const paddedValue = validatedValue.padStart(3, '0');
      
      setDetails({
        ...details,
        sequentialNumber: paddedValue,
      });
    } else {
      setDetails({
        ...details,
        [name]: value,
      });
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!taxonomySelection.layer || !taxonomySelection.category || !taxonomySelection.subcategory) {
      showFeedback('Please complete the taxonomy selection', 'error');
      return;
    }
    
    if (!details.description) {
      showFeedback('Please provide a description', 'error');
      return;
    }
    
    if (!file) {
      showFeedback('Please select a file to upload', 'error');
      return;
    }
    
    if (!currentHFN || !currentMFA) {
      showFeedback('Invalid asset identifiers. Please check your selection.', 'error');
      return;
    }
    
    // Prepare submission
    setSubmitting(true);
    setSubmissionError('');
    
    try {
      // For demonstration, we'll simulate an API call
      // In a real implementation, this would call the asset registration API
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('hfn', currentHFN);
      formData.append('mfa', currentMFA);
      formData.append('description', details.description);
      formData.append('source', details.source);
      formData.append('tags', JSON.stringify(details.tags));
      
      // Log the submission for debugging
      logger.info('Submitting emergency asset registration:', {
        hfn: currentHFN,
        mfa: currentMFA,
        description: details.description,
        fileName: file.name,
        fileSize: file.size,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated success
      setSubmissionSuccess(true);
      showFeedback(
        `Asset registered successfully! HFN: ${currentHFN}, MFA: ${currentMFA}`,
        'success',
        10000
      );
      
      // Reset form
      setTaxonomySelection({ layer: '', category: '', subcategory: '' });
      setDetails({
        description: '',
        source: 'Emergency Registration',
        tags: ['emergency'],
        sequentialNumber: '001',
      });
      setFile(null);
      
    } catch (error) {
      logger.error('Error submitting emergency asset registration:', error);
      setSubmissionError('Failed to register asset. Please try again.');
      showFeedback('Failed to register asset. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mt: 3, 
          mb: 3, 
          position: 'relative',
          borderLeft: '5px solid',
          borderColor: 'error.main',
        }}
      >
        <Typography variant="h4" gutterBottom color="error">
          Emergency Asset Registration
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1">
            This is an emergency registration page with simplified functionality.
            Use this page only when the standard registration process is not working.
            All assets registered here will be tagged as "emergency" for later verification.
          </Typography>
        </Alert>
        
        {submissionSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            icon={<CheckIcon fontSize="inherit" />}
          >
            <Typography variant="body1">
              Asset registered successfully!
            </Typography>
            <Typography variant="body2">
              HFN: {currentHFN}<br />
              MFA: {currentMFA}
            </Typography>
          </Alert>
        )}
        
        {submissionError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            icon={<ErrorIcon fontSize="inherit" />}
          >
            <Typography variant="body1">
              {submissionError}
            </Typography>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Taxonomy Selection */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Step 1: Select Taxonomy
          </Typography>
          
          <EmergencyTaxonomySelector
            taxonomyData={taxonomyData}
            onSelectionComplete={handleTaxonomySelectionComplete}
            loading={loading}
          />
          
          <Divider sx={{ my: 4 }} />
          
          {/* Step 2: Asset Details */}
          <Typography variant="h6" gutterBottom>
            Step 2: Asset Details
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <TextField
              label="Description"
              name="description"
              value={details.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              fullWidth
              margin="normal"
              required
            />
            
            <TextField
              label="Source"
              name="source"
              value={details.source}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Tags (comma separated)"
              name="tags"
              value={details.tags.join(', ')}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              helperText="Tags will help with identifying and categorizing this asset"
            />
            
            <TextField
              label="Sequential Number"
              name="sequentialNumber"
              value={details.sequentialNumber || '001'}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              helperText="Three-digit number (001-999)"
              inputProps={{ maxLength: 3, pattern: '[0-9]{3}' }}
            />
            
            <Box sx={{ mt: 3 }}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="contained-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="contained-button-file">
                <Button 
                  variant="contained" 
                  component="span"
                  color="primary"
                >
                  Upload File
                </Button>
              </label>
              {file && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          {/* Step 3: Review and Submit */}
          <Typography variant="h6" gutterBottom>
            Step 3: Review and Submit
          </Typography>
          
          <Box 
            sx={{ 
              p: 3, 
              bgcolor: 'background.paper', 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 1,
              my: 3,
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              Asset Identifiers
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              Human-Friendly Name (HFN): <strong>{currentHFN || 'Incomplete selection'}</strong>
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              Machine-Friendly Address (MFA): <strong>{currentMFA || 'Incomplete selection'}</strong>
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
              Taxonomy
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              Layer: <strong>{taxonomySelection.layer || 'Not selected'}</strong><br />
              Category: <strong>{taxonomySelection.category || 'Not selected'}</strong><br />
              Subcategory: <strong>{taxonomySelection.subcategory || 'Not selected'}</strong>
            </Typography>
            
            <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
              Details
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              Description: <strong>{details.description || 'Not provided'}</strong><br />
              Source: <strong>{details.source}</strong><br />
              Tags: <strong>{details.tags.join(', ') || 'None'}</strong><br />
              File: <strong>{file ? file.name : 'No file selected'}</strong>
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              size="large"
            >
              {submitting ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                  Registering...
                </>
              ) : (
                'Register Asset'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
      
      {/* Feedback Snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={feedback.duration}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseFeedback} 
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmergencyAssetRegistrationPage;