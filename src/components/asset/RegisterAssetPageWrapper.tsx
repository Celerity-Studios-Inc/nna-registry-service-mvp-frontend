import React from 'react';
import { Box } from '@mui/material';
import RegisterAssetPageNew from '../../pages/new/RegisterAssetPageNew';

/**
 * Wrapper component that renders the new RegisterAssetPage implementation
 * This component previously switched between old and new implementations,
 * but now solely uses the new implementation after feature toggle removal.
 */
const RegisterAssetPageWrapper: React.FC = () => {
  // Log for context
  console.log('[RegisterAssetPageWrapper] Using new implementation');

  return (
    <Box position="relative">
      <RegisterAssetPageNew />
    </Box>
  );
};

export default RegisterAssetPageWrapper;