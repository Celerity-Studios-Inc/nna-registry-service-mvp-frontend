/**
 * Compact Environment Banner Component
 * Displays a minimal 1-line environment identification banner
 * Enhanced for three-environment strategy with compact design (January 2025)
 * Force deployment trigger for staging environment testing
 */

import React from 'react';

export const StagingBanner: React.FC = () => {
  // Don't show banner for any environment since we have environment indicators in main header
  // The AppBar in MainLayout already shows environment chips consistently across all environments
  return null;
};

export default StagingBanner;