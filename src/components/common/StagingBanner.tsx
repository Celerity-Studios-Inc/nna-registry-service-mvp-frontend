/**
 * Compact Environment Banner Component
 * Displays a minimal 1-line environment identification banner
 * Enhanced for three-environment strategy with compact design (January 2025)
 * Force deployment trigger for staging environment testing
 */

import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { getEnvironmentConfig } from '../../utils/environment.config';

export const StagingBanner: React.FC = () => {
  const config = getEnvironmentConfig();
  
  // Show banner for all environments (with environment-specific styling)
  const showBanner = true; // Always show for environment identification

  if (!showBanner) {
    return null;
  }

  // Environment-specific styling with red/orange/green color scheme
  const environmentConfig = {
    development: {
      backgroundColor: '#d32f2f', // Red background
      textColor: '#ffffff', // White text
      chipColor: '#ffcdd2', // Light red chip
      chipTextColor: '#b71c1c', // Dark red chip text
      label: 'DEVELOPMENT',
    },
    staging: {
      backgroundColor: '#f57c00', // Orange background
      textColor: '#ffffff', // White text
      chipColor: '#ffe0b2', // Light orange chip
      chipTextColor: '#e65100', // Dark orange chip text
      label: 'STAGING',
    },
    production: {
      backgroundColor: '#388e3c', // Green background
      textColor: '#ffffff', // White text
      chipColor: '#c8e6c9', // Light green chip
      chipTextColor: '#1b5e20', // Dark green chip text
      label: 'PRODUCTION',
    },
  };

  const envConfig = environmentConfig[config.name];

  // Don't show banner for production or staging since we have environment indicators in main header
  if (config.isProduction || config.isStaging) {
    return null;
  }

  // Only show full banner for development
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1400, // Above app bar
        width: '100%',
        height: '32px', // Fixed 1-line height
        backgroundColor: envConfig.backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: envConfig.textColor,
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          NNA Registry Service
        </Typography>
        
        <Chip 
          label={envConfig.label}
          size="small"
          sx={{
            backgroundColor: envConfig.chipColor,
            color: envConfig.chipTextColor,
            fontWeight: 600,
            fontSize: '0.75rem',
            height: '20px',
            borderRadius: '10px',
            '& .MuiChip-label': {
              px: 1,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default StagingBanner;