import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Paper,
  FormControlLabel,
  Switch,
  Collapse,
} from '@mui/material';
import { CheckCircle, Error, Sync, WarningAmber } from '@mui/icons-material';
import axios from 'axios';

interface BackendStatusProps {
  onStatusChange?: (status: 'available' | 'unavailable') => void;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ onStatusChange }) => {
  const [status, setStatus] = useState<
    'checking' | 'available' | 'unavailable'
  >('checking');
  const [expanded, setExpanded] = useState(false);
  const [mockMode, setMockMode] = useState(
    localStorage.getItem('forceMockApi') === 'true'
  );
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkBackendStatus = async () => {
    setLoading(true);
    try {
      // Use the standard health endpoint that exists on staging backend
      const response = await axios.get('/api/health', {
        timeout: 5000,
      });

      setDetails(response.data);

      // Check if we got a healthy response - be more flexible with status checking
      const backendStatus =
        response.data?.status === 'healthy' || 
        response.data?.status === 'ok' ||
        response.status === 200
          ? 'available'
          : 'unavailable';

      setStatus(backendStatus);
      onStatusChange?.(backendStatus);

      console.log(`Backend status check: ${backendStatus}`, response.data);
    } catch (error) {
      console.error('Error checking backend status:', error);
      setStatus('unavailable');
      onStatusChange?.('unavailable');
    } finally {
      setLoading(false);
    }
  };

  // Toggle mock mode
  const toggleMockMode = () => {
    const newValue = !mockMode;
    setMockMode(newValue);

    if (newValue) {
      localStorage.setItem('forceMockApi', 'true');
      console.log('Mock API mode enabled via localStorage');
    } else {
      localStorage.removeItem('forceMockApi');
      console.log('Mock API mode disabled');
    }

    // Refresh the page to apply the change
    window.location.reload();
  };

  // Check status on component mount and then periodically
  useEffect(() => {
    checkBackendStatus();

    // Check every 30 seconds
    const interval = setInterval(() => {
      checkBackendStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            Backend:
          </Typography>

          {loading ? (
            <Chip
              icon={<CircularProgress size={16} color="inherit" />}
              label="Checking..."
              color="default"
              size="small"
            />
          ) : status === 'available' ? (
            <Chip
              icon={<CheckCircle fontSize="small" />}
              label="Available"
              color="success"
              size="small"
            />
          ) : (
            <Chip
              icon={<Error fontSize="small" />}
              label="Unavailable"
              color="error"
              size="small"
            />
          )}

          <Chip
            icon={
              mockMode ? (
                <WarningAmber fontSize="small" />
              ) : (
                <CheckCircle fontSize="small" />
              )
            }
            label={mockMode ? 'Mock Mode' : 'Real API'}
            color={mockMode ? 'warning' : 'primary'}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>

        <Box>
          <Button
            startIcon={<Sync />}
            size="small"
            onClick={checkBackendStatus}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={mockMode}
                onChange={toggleMockMode}
                color="warning"
              />
            }
            label="Force Mock API Mode"
          />

          <Typography variant="caption" display="block" color="text.secondary">
            When enabled, the application will use mock data instead of real API
            calls. This is useful for testing when the backend is unavailable.
          </Typography>

          {details && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2">Diagnostics:</Typography>
              <pre
                style={{
                  fontSize: '0.75rem',
                  whiteSpace: 'pre-wrap',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {JSON.stringify(details, null, 2)}
              </pre>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default BackendStatus;
