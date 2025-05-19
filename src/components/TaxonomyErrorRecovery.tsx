import React, { useState, useEffect } from 'react';
import { Typography, Button, Box, CircularProgress } from '@mui/material';

interface TaxonomyErrorRecoveryProps {
  error: string | null;
  onRetry: () => void;
  recoveryInProgress?: boolean;
}

/**
 * A component for handling taxonomy-related errors with a user-friendly interface
 * and automatic recovery capabilities
 */
const TaxonomyErrorRecovery: React.FC<TaxonomyErrorRecoveryProps> = ({
  error,
  onRetry,
  recoveryInProgress = false,
}) => {
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [countdownValue, setCountdownValue] = useState(5);
  const [autoRetryInProgress, setAutoRetryInProgress] = useState(false);

  // Auto-retry logic with exponential backoff
  useEffect(() => {
    if (!error || autoRetryCount >= 3 || recoveryInProgress) return;

    // Start countdown for auto-retry
    setAutoRetryInProgress(true);
    setCountdownValue(5);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Actual retry after countdown finishes
    const retryTimer = setTimeout(() => {
      if (autoRetryCount < 3) {
        console.log(`[TAXONOMY ERROR] Auto-retry attempt ${autoRetryCount + 1}`);
        setAutoRetryCount((prev) => prev + 1);
        setAutoRetryInProgress(false);
        onRetry();
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(retryTimer);
    };
  }, [error, autoRetryCount, onRetry, recoveryInProgress]);

  // Reset retry count when error changes or clears
  useEffect(() => {
    if (!error) {
      setAutoRetryCount(0);
      setAutoRetryInProgress(false);
    }
  }, [error]);

  if (!error) return null;

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: '#fef6f6',
        border: '1px solid #ffcccc',
        borderRadius: 2,
        my: 2,
        maxWidth: '100%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h6" color="error" gutterBottom>
        Taxonomy Error Detected
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        {error}
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
        This issue may occur due to temporary data loading problems. The system will 
        attempt to recover automatically.
      </Typography>
      
      {autoRetryInProgress ? (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <CircularProgress size={20} sx={{ mr: 2 }} />
          <Typography variant="body2">
            Auto-retrying in {countdownValue} seconds (Attempt {autoRetryCount + 1}/3)...
          </Typography>
        </Box>
      ) : recoveryInProgress ? (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <CircularProgress size={20} sx={{ mr: 2 }} />
          <Typography variant="body2">
            Recovery in progress...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            onClick={onRetry} 
            color="primary"
            sx={{ mr: 2 }}
          >
            Retry Now
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()} 
            color="secondary"
          >
            Refresh Page
          </Button>
          
          {autoRetryCount >= 3 && (
            <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
              Multiple automatic retries failed. Manual intervention may be needed.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TaxonomyErrorRecovery;