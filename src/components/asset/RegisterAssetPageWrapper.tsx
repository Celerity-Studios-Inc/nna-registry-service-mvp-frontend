import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import RegisterAssetPage from '../../pages/RegisterAssetPage';
import RegisterAssetPageNew from '../../pages/new/RegisterAssetPageNew';
import UIVersionToggle from '../common/UIVersionToggle';
import { getUIVersion, UIVersion, saveUIVersionPreference } from '../../utils/featureToggle';

/**
 * Wrapper component that conditionally renders either the old or new version
 * of the RegisterAssetPage based on user preference or URL parameters
 */
const RegisterAssetPageWrapper: React.FC = () => {
  // Get initial version preference
  const [uiVersion, setUiVersion] = useState<UIVersion>(getUIVersion());

  // Listen for URL or storage changes
  useEffect(() => {
    const handleVersionChange = () => {
      const currentVersion = getUIVersion();
      setUiVersion(currentVersion);
    };

    // Check for version changes when the URL changes
    window.addEventListener('popstate', handleVersionChange);
    
    // Set up a storage event listener for changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'preferredUIVersion') {
        handleVersionChange();
      }
    });

    // Custom event for version changes within the same tab
    window.addEventListener('uiVersionChanged', handleVersionChange);

    return () => {
      window.removeEventListener('popstate', handleVersionChange);
      window.removeEventListener('storage', handleVersionChange);
      window.removeEventListener('uiVersionChanged', handleVersionChange);
    };
  }, []);

  // Log version information to help with debugging
  useEffect(() => {
    console.log(`[RegisterAssetPageWrapper] Using UI version: ${uiVersion}`);
  }, [uiVersion]);

  return (
    <Box position="relative">
      {/* Render the appropriate version based on user preference */}
      {uiVersion === 'new' ? <RegisterAssetPageNew /> : <RegisterAssetPage />}
    </Box>
  );
};

export default RegisterAssetPageWrapper;