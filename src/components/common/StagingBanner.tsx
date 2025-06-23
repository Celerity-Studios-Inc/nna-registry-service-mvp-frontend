/**
 * Staging Environment Banner Component
 * Displays a prominent banner when running in staging environment
 * Created for staging environment integration (January 2025)
 */

import React from 'react';
import { Box, Alert, AlertTitle, Chip, Typography } from '@mui/material';
import { Warning, Science, BugReport } from '@mui/icons-material';
import { getEnvironmentConfig } from '../../utils/environment.config';

export const StagingBanner: React.FC = () => {
  const config = getEnvironmentConfig();
  
  // Only show banner in staging environment or if explicitly enabled
  const showBanner = config.isStaging || 
                    process.env.REACT_APP_STAGING_BANNER === 'true' ||
                    (config.isDevelopment && window.location.search.includes('staging=true'));

  if (!showBanner) {
    return null;
  }

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
        severity="warning" 
        icon={<Science />}
        sx={{
          borderRadius: 0,
          backgroundColor: '#fff3e0', // Orange 50
          borderBottom: '2px solid #ff9800', // Orange 500
          '& .MuiAlert-icon': {
            color: '#f57c00', // Orange 800
          },
        }}
      >
        <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <BugReport fontSize="small" />
          Staging Environment
          <Chip 
            label={config.name.toUpperCase()} 
            size="small" 
            color="warning" 
            variant="outlined"
          />
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>⚠️ Test Environment:</strong> This is the staging version of the NNA Registry Service.
        </Typography>
        
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          <strong>Backend:</strong> {config.backendUrl} | 
          <strong> Features:</strong> Enhanced debugging, test data isolation, separate database
        </Typography>
      </Alert>
    </Box>
  );
};

export default StagingBanner;