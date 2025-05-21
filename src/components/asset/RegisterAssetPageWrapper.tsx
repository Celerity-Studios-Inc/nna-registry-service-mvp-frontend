import React from 'react';
import { Box } from '@mui/material';
import RegisterAssetPage from '../../pages/RegisterAssetPage';
import { debugLog, logger, LogLevel, LogCategory } from '../../utils/logger';
import { TaxonomyProvider } from '../../contexts/TaxonomyContext';
import { TaxonomyDataProvider } from '../../providers/taxonomy/TaxonomyDataProvider';

/**
 * Wrapper component that renders the original RegisterAssetPage implementation
 * This component has been updated to use the original implementation with dropdown selectors
 * for better user experience and consistent taxonomy handling.
 */
const RegisterAssetPageWrapper: React.FC = React.memo(() => {
  // Log for context using environment-aware logger
  debugLog('[RegisterAssetPageWrapper] Using original implementation with dropdown-based taxonomy selection');
  
  // Also log with structured logger for UI category
  logger.ui(LogLevel.INFO, 'RegisterAssetPageWrapper initialized with original workflow');

  return (
    <Box position="relative">
      <TaxonomyDataProvider>
        <TaxonomyProvider>
          <RegisterAssetPage />
        </TaxonomyProvider>
      </TaxonomyDataProvider>
    </Box>
  );
});

export default RegisterAssetPageWrapper;