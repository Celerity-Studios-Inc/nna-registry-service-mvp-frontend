import React, { useCallback } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorBoundary from '../common/ErrorBoundary';
import { logger, LogLevel } from '../../utils/logger';

interface TaxonomyErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
  attemptReload?: () => void;
}

/**
 * Specialized error boundary for taxonomy components
 * Includes taxonomy-specific error handling and recovery options
 */
export const TaxonomyErrorBoundary: React.FC<TaxonomyErrorBoundaryProps> = ({ 
  children, 
  onReset,
  attemptReload
}) => {
  // Handler for resetting the error boundary
  const handleReset = useCallback(() => {
    logger.taxonomy(
      LogLevel.INFO, 
      'TaxonomyErrorBoundary reset requested by user'
    );
    
    // Call any additional reset logic provided by parent
    onReset?.();
  }, [onReset]);
  
  // Handler for attempting to reload taxonomy data
  const handleReload = useCallback(() => {
    logger.taxonomy(
      LogLevel.INFO, 
      'Taxonomy reload requested by user after error'
    );
    
    // Call reload function if provided
    attemptReload?.();
  }, [attemptReload]);
  
  // Custom fallback UI for taxonomy errors
  const renderFallback = useCallback((error: Error, resetError: () => void) => {
    return (
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          m: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="h5" color="error">
          Taxonomy Selection Error
        </Typography>
        
        <Typography variant="body1">
          There was a problem with the taxonomy selection system.
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {error.message}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={() => {
              resetError(); // Reset the error boundary first
              handleReset(); // Then call our custom reset handler
            }}
          >
            Reset and Try Again
          </Button>
          
          {attemptReload && (
            <Button 
              variant="outlined" 
              onClick={() => {
                resetError(); // Reset the error boundary first
                handleReload(); // Then attempt to reload the data
              }}
            >
              Reload Taxonomy Data
            </Button>
          )}
        </Box>
        
        {/* Only show detailed error info in development */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            width: '100%',
            backgroundColor: '#f5f5f5', 
            borderRadius: 1,
            overflow: 'auto'
          }}>
            <Typography variant="subtitle2" gutterBottom>
              Developer Error Details:
            </Typography>
            <Typography component="pre" variant="body2" sx={{ fontSize: '0.8rem' }}>
              {error.stack}
            </Typography>
          </Box>
        )}
      </Paper>
    );
  }, [handleReset, handleReload, attemptReload]);
  
  return (
    <ErrorBoundary 
      fallback={renderFallback} 
      componentName="TaxonomyComponent"
      resetOnPropsChange={true}
      onError={(error, errorInfo) => {
        // Additional error handling specific to taxonomy
        logger.taxonomy(
          LogLevel.ERROR,
          'Taxonomy component error caught by boundary',
          { 
            errorMessage: error.message,
            componentStack: errorInfo.componentStack
          }
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default TaxonomyErrorBoundary;