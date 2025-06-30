import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const EnvironmentDebugger: React.FC = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'server-side';
  const reactAppEnv = process.env.REACT_APP_ENVIRONMENT;
  const nodeEnv = process.env.NODE_ENV;
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL;

  // Manually detect environment using same logic
  const detectEnv = () => {
    if (reactAppEnv === 'staging' || reactAppEnv === 'production' || reactAppEnv === 'development') {
      return reactAppEnv;
    }
    
    if ((nodeEnv as string) === 'staging') {
      return 'staging';
    }
    
    if (hostname === 'nna-registry-frontend-dev.vercel.app' || hostname.includes('-dev.vercel.app')) {
      return 'development';
    }
    
    if (hostname.includes('nna-registry-frontend-stg.vercel.app') || hostname.includes('-stg.vercel.app')) {
      return 'staging';
    }
    
    return 'production';
  };

  return (
    <Card sx={{ margin: 2, backgroundColor: '#f5f5f5' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          🐛 Environment Debug Information
        </Typography>
        
        <Box sx={{ display: 'grid', gap: 1 }}>
          <Typography variant="body2">
            <strong>Hostname:</strong> {hostname}
          </Typography>
          
          <Typography variant="body2">
            <strong>REACT_APP_ENVIRONMENT:</strong> {reactAppEnv || 'undefined'}
          </Typography>
          
          <Typography variant="body2">
            <strong>NODE_ENV:</strong> {nodeEnv || 'undefined'}
          </Typography>
          
          <Typography variant="body2">
            <strong>REACT_APP_BACKEND_URL:</strong> {backendUrl || 'undefined'}
          </Typography>
          
          <Typography variant="body2">
            <strong>REACT_APP_FRONTEND_URL:</strong> {frontendUrl || 'undefined'}
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
            <strong>Detected Environment:</strong> {detectEnv().toUpperCase()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EnvironmentDebugger;