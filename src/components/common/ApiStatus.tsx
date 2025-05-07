import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Chip, Button } from '@mui/material';
import api from '../../api/api';

interface ApiStatusProps {
  onClose?: () => void;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ onClose }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Check API connection
  const checkApiConnection = async () => {
    setIsChecking(true);
    setApiStatus('checking');
    setErrorDetails(null);
    setApiBaseUrl(process.env.REACT_APP_API_BASE_URL || api.defaults.baseURL || '/api');

    try {
      // Try to hit a simple API endpoint that doesn't require authentication
      const response = await api.get('/health', { timeout: 5000 });
      
      if (response.status === 200) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
        setErrorDetails(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      setApiStatus('error');
      if (error instanceof Error) {
        setErrorDetails(error.message);
      } else {
        setErrorDetails('Unknown error occurred');
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Check API connection on component mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        API Connection Status
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ mr: 2 }}>
          API Endpoint:
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {apiBaseUrl}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="body1" sx={{ mr: 2 }}>
          Status:
        </Typography>
        {apiStatus === 'checking' && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography>Checking...</Typography>
          </Box>
        )}
        {apiStatus === 'connected' && (
          <Chip 
            label="Connected" 
            color="success" 
            variant="outlined" 
            sx={{ fontWeight: 500 }} 
          />
        )}
        {apiStatus === 'error' && (
          <Chip 
            label="Connection Error" 
            color="error" 
            variant="outlined" 
            sx={{ fontWeight: 500 }} 
          />
        )}
      </Box>
      
      {errorDetails && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
            Error Details:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff5f5' }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
              {errorDetails}
            </Typography>
          </Paper>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined" 
          onClick={checkApiConnection}
          disabled={isChecking}
        >
          Recheck Connection
        </Button>
        
        {onClose && (
          <Button 
            variant="text" 
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default ApiStatus;