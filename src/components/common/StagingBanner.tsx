/**
 * Environment Banner Component
 * Displays environment identification banner for non-production environments
 * Enhanced for three-environment strategy (January 2025)
 */

import React from 'react';
import { Box, Alert, AlertTitle, Chip, Typography } from '@mui/material';
import { Warning, Science, BugReport, DeveloperMode, Public } from '@mui/icons-material';
import { getEnvironmentConfig } from '../../utils/environment.config';

export const StagingBanner: React.FC = () => {
  const config = getEnvironmentConfig();
  
  // Show banner for non-production environments or if explicitly enabled
  const showBanner = !config.isProduction || 
                    process.env.REACT_APP_STAGING_BANNER === 'true' ||
                    window.location.search.includes('showBanner=true');

  if (!showBanner) {
    return null;
  }

  // Environment-specific styling and content
  const environmentConfig = {
    development: {
      icon: <DeveloperMode />,
      severity: 'info' as const,
      backgroundColor: '#e3f2fd', // Blue 50
      borderColor: '#2196f3', // Blue 500
      iconColor: '#1565c0', // Blue 800
      title: 'Development Environment',
      message: '🔧 Local Development: This is your local development environment.',
      chipColor: 'info' as const,
    },
    staging: {
      icon: <Science />,
      severity: 'warning' as const,
      backgroundColor: '#fff3e0', // Orange 50
      borderColor: '#ff9800', // Orange 500
      iconColor: '#f57c00', // Orange 800
      title: 'Staging Environment',
      message: '⚠️ Test Environment: This is the staging version of the NNA Registry Service.',
      chipColor: 'warning' as const,
    },
    production: {
      icon: <Public />,
      severity: 'success' as const,
      backgroundColor: '#e8f5e8', // Green 50
      borderColor: '#4caf50', // Green 500
      iconColor: '#2e7d32', // Green 800
      title: 'Production Environment',
      message: '🚀 Live Production: You are using the live production service.',
      chipColor: 'success' as const,
    },
  };

  const envConfig = environmentConfig[config.name];

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1400, // Above app bar
        width: '100%',
      }}
    >
      <Alert 
        severity={envConfig.severity}
        icon={envConfig.icon}
        sx={{
          borderRadius: 0,
          backgroundColor: envConfig.backgroundColor,
          borderBottom: `2px solid ${envConfig.borderColor}`,
          '& .MuiAlert-icon': {
            color: envConfig.iconColor,
          },
        }}
      >
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <BugReport fontSize="small" />
          {envConfig.title}
          <Chip 
            label={config.name.toUpperCase()} 
            size="small" 
            color={envConfig.chipColor}
            variant="outlined"
          />
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          {envConfig.message}
        </Typography>
        
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          <strong>Backend:</strong> {config.backendUrl} | 
          <strong> Frontend:</strong> {config.frontendUrl} |
          <strong> Debug:</strong> {config.enableDebugLogging ? 'Enabled' : 'Disabled'}
        </Typography>
      </Alert>
    </Box>
  );
};

export default StagingBanner;