import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  TextField, 
  Alert, 
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardActions,
  Link
} from '@mui/material';
import { Settings, Code, BugReport, Storage, Login } from '@mui/icons-material';
import axios from 'axios';

/**
 * This page provides help for debugging API connectivity issues
 * and demonstrates how to connect to the backend
 */
const ConnectivityHelp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [proxyInfo, setProxyInfo] = useState<any>(null);
  const [realBackendInfo, setRealBackendInfo] = useState<any>(null);
  const [backendUrlInfo, setBackendUrlInfo] = useState<any>(null);
  const [mockMode, setMockMode] = useState(localStorage.getItem('forceMockApi') === 'true');

  // Load the proxy debug info on mount
  useEffect(() => {
    const fetchProxyInfo = async () => {
      try {
        const response = await axios.get('/api/proxy-debug');
        setProxyInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch proxy debug info', error);
      }
    };

    const fetchRealBackendInfo = async () => {
      try {
        const response = await axios.get('/api/test-real-backend');
        setRealBackendInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch real backend info', error);
      }
    };

    const fetchBackendUrlInfo = async () => {
      try {
        const response = await axios.get('/api/backend-url');
        setBackendUrlInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch backend URL info', error);
      }
    };

    fetchProxyInfo();
    fetchRealBackendInfo();
    fetchBackendUrlInfo();
  }, []);

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
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        NNA Registry Backend Connectivity Help
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        This page provides information and tools to help you diagnose and fix API connectivity issues.
      </Alert>

      <Grid container spacing={4}>
        {/* Mock Mode Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Settings sx={{ mr: 1 }} /> Mock API Mode
              </Typography>
              <Typography variant="body2" paragraph>
                The application can run with mock data when the backend is unavailable or you don't have credentials.
              </Typography>
              <Alert severity={mockMode ? "warning" : "success"} sx={{ mb: 2 }}>
                Mock API Mode is currently: <strong>{mockMode ? "ENABLED" : "DISABLED"}</strong>
              </Alert>
              <Typography variant="body2">
                When enabled, the application will use fake data instead of real API calls.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant={mockMode ? "outlined" : "contained"} 
                color={mockMode ? "warning" : "primary"} 
                onClick={toggleMockMode}
              >
                {mockMode ? "Disable Mock Mode" : "Enable Mock Mode"}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* API Status Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Storage sx={{ mr: 1 }} /> Backend API Status
              </Typography>
              
              {realBackendInfo ? (
                <>
                  <Alert 
                    severity={realBackendInfo.realBackendAvailable ? "success" : "error"} 
                    sx={{ mb: 2 }}
                  >
                    Backend API is: <strong>{realBackendInfo.realBackendAvailable ? "AVAILABLE" : "UNAVAILABLE"}</strong>
                  </Alert>
                  <Typography variant="body2">
                    The backend API is {realBackendInfo.realBackendAvailable ? 
                      "responding correctly to requests" : 
                      "not responding or returning errors"}
                  </Typography>
                </>
              ) : (
                <CircularProgress size={24} />
              )}
            </CardContent>
            <CardActions>
              <Button 
                component={Link} 
                href="/api-debug" 
                target="_blank"
                startIcon={<BugReport />}
              >
                View Full Diagnostics
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Backend URL Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Backend Configuration
            </Typography>
            {backendUrlInfo ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Backend URL:</Typography>
                  <TextField 
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={backendUrlInfo.backendUrl || "Not configured"}
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Mock Mode:</Typography>
                  <TextField 
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={backendUrlInfo.mockEnabled ? "Enabled" : "Disabled"}
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Environment:</Typography>
                  <TextField 
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={backendUrlInfo.environment || "production"}
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            ) : (
              <CircularProgress size={24} />
            )}
          </Paper>
        </Grid>

        {/* How to Connect */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              How to Connect to the Real Backend
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              To use the real backend API, you need valid credentials. Without proper authentication, 
              the application will fall back to mock data.
            </Alert>
            
            <Typography variant="subtitle1" gutterBottom>
              Steps to Connect:
            </Typography>
            <ol>
              <li>
                <Typography paragraph>
                  <strong>Disable Mock Mode</strong> - Make sure mock mode is disabled in the dashboard or by clicking the button above.
                </Typography>
              </li>
              <li>
                <Typography paragraph>
                  <strong>Get Valid Credentials</strong> - Obtain a valid username and password for the backend API.
                </Typography>
              </li>
              <li>
                <Typography paragraph>
                  <strong>Login with Credentials</strong> - Use the login page with your valid credentials.
                </Typography>
              </li>
              <li>
                <Typography paragraph>
                  <strong>Verify Connection</strong> - After logging in, the application will automatically use the real API.
                </Typography>
              </li>
            </ol>

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Proxy Configuration:
            </Typography>
            
            {proxyInfo ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  API Routes:
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(proxyInfo.proxyRoutes).map(([route, description]) => (
                    <Grid item xs={12} md={6} key={route}>
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle2" color="primary">
                          {route}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {description as string}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <CircularProgress size={24} />
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button component={Link} href="/dashboard">
          Back to Dashboard
        </Button>
        <Button 
          component={Link} 
          href="/login" 
          variant="contained" 
          color="primary"
          startIcon={<Login />}
        >
          Go to Login
        </Button>
      </Box>
    </Box>
  );
};

export default ConnectivityHelp;