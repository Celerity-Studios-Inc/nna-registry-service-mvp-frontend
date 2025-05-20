import React from 'react';
import { Box } from '@mui/material';
import RegisterAssetPageNew from '../../pages/new/RegisterAssetPageNew';
import { debugLog, logger, LogLevel, LogCategory } from '../../utils/logger';
import { TaxonomyProvider } from '../../contexts/TaxonomyContext';
import { TaxonomyDataProvider } from '../../providers/taxonomy/TaxonomyDataProvider';

/**
 * Wrapper component that renders the new RegisterAssetPage implementation
 * This component previously switched between old and new implementations,
 * but now solely uses the new implementation after feature toggle removal.
 */
const RegisterAssetPageWrapper: React.FC = React.memo(() => {
  // Log for context using environment-aware logger
  debugLog('[RegisterAssetPageWrapper] Using new implementation');
  
  // Also log with structured logger for UI category
  logger.ui(LogLevel.INFO, 'RegisterAssetPageWrapper initialized');

  return (
    <Box position="relative">
      <TaxonomyDataProvider>
        <TaxonomyProvider>
          <RegisterAssetPageNew />
        </TaxonomyProvider>
      </TaxonomyDataProvider>
    </Box>
  );
});

export default RegisterAssetPageWrapper;