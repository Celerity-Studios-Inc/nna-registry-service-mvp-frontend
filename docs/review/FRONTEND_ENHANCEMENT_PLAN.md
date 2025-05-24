# Frontend Enhancement Plan

This document outlines improvements we can make to the frontend to better handle subcategory normalization without requiring backend changes.

## 1. Robust Subcategory Display Overrides

### Create a dedicated subcategory utility module

```typescript
// src/utils/subcategoryUtils.ts

/**
 * Determines if a subcategory needs display override based on backend behavior
 */
export const needsSubcategoryOverride = (
  layer: string,
  category: string,
  subcategory: string,
  backendSubcategory: string
): boolean => {
  // If backend sent something different than what we sent, we need an override
  if (subcategory !== backendSubcategory) {
    // Special case: If we sent 'HPM' and got back 'HPM', no override needed
    if (subcategory === 'HPM' && backendSubcategory === 'HPM') {
      return false;
    }
    
    // Specifically check S.POP.* combinations that we know need overrides
    if (layer === 'S' && 
        (category === 'POP' || category === 'Pop') && 
        subcategory !== backendSubcategory) {
      return true;
    }
    
    // Add other layer-category combinations that need overrides
    return true;
  }
  
  return false;
};

/**
 * Creates a corrected HFN using the original subcategory selection
 */
export const createOverriddenHFN = (
  originalHFN: string,
  originalSubcategory: string
): string => {
  // Parse the HFN parts
  const parts = originalHFN.split('.');
  if (parts.length !== 4) {
    return originalHFN; // Not a valid HFN format
  }
  
  // Replace subcategory part with original selection
  parts[2] = originalSubcategory;
  
  return parts.join('.');
};

/**
 * Adds a visual indicator that the display has been overridden
 */
export const getOverrideIndicator = (isOverridden: boolean): JSX.Element | null => {
  if (!isOverridden) return null;
  
  return (
    <Tooltip title="This subcategory display has been adjusted from the backend value">
      <InfoIcon fontSize="small" color="info" sx={{ ml: 1, verticalAlign: 'middle' }} />
    </Tooltip>
  );
};
```

### Integrate with ReviewSubmit and Asset Details pages

Apply these utilities consistently across all relevant components to ensure unified behavior.

## 2. Fix Build and GitHub Action Issues

### 1. Fix FileUpload.tsx Dependency

The build error appears to be related to missing dependencies. Update the imports in FileUpload.tsx:

```typescript
// Add this import if it's missing
import { Tooltip, InfoIcon } from '@mui/material';
```

### 2. Fix GitHub Actions Permission Issue

The "Resource not accessible by integration" error is a GitHub permissions issue. Add the following to your GitHub workflow file:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
      pull-requests: write
      issues: write
      
    # Then the rest of your job configuration...
```

This grants the necessary permissions for the action to comment on PRs and create deployments.

## 3. Enhanced User Notifications

### Add a Taxonomy Status Component

Create a component that informs users about subcategory handling:

```typescript
// src/components/common/TaxonomyStatusAlert.tsx

import React from 'react';
import { Alert, AlertTitle, Box, Typography, Paper } from '@mui/material';

interface TaxonomyStatusAlertProps {
  layer?: string;
  category?: string;
  subcategory?: string;
  originalSubcategory?: string;
  serverSubcategory?: string;
  isOverridden?: boolean;
}

const TaxonomyStatusAlert: React.FC<TaxonomyStatusAlertProps> = ({
  layer,
  category,
  subcategory,
  originalSubcategory,
  serverSubcategory,
  isOverridden = false
}) => {
  if (!isOverridden) return null;
  
  return (
    <Paper elevation={0} sx={{ mb: 2 }}>
      <Alert severity="info" variant="outlined">
        <AlertTitle>Subcategory Display Notice</AlertTitle>
        <Typography variant="body2">
          The subcategory <strong>{originalSubcategory}</strong> you selected may be stored 
          as <strong>Base</strong> in the backend system. This is expected behavior and won't 
          affect your asset's functionality.
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
          Your selection is preserved for display purposes, but may appear differently in some system views.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default TaxonomyStatusAlert;
```

### Integrate the alert in key workflows

Add this component to:
- TaxonomySelection.tsx - when a non-HPM subcategory is selected
- ReviewSubmit.tsx - when reviewing the selection before submission
- AssetDetailPage.tsx - when viewing an asset with an overridden subcategory

## 4. Improve Debugging and Logging

### Add dedicated logging for subcategory handling

Enhance the existing logging to provide clearer information about subcategory processing:

```typescript
// In assetService.ts and other relevant files:

const logTaxonomyOperation = (operation: string, details: any) => {
  if (process.env.NODE_ENV !== 'production' || localStorage.getItem('enableDebugLogs') === 'true') {
    console.group(`Taxonomy Operation: ${operation}`);
    console.log('Details:', details);
    console.groupEnd();
  }
};

// Then use it in relevant places:
logTaxonomyOperation('Subcategory Processing', {
  original: { layer, category, subcategory },
  normalized: { layer: layerName, category: categoryName, subcategory: subcategoryName },
  backend: response.data
});
```

## 5. Robust Error Handling Improvements

### Create a dedicated error boundary for taxonomy issues

```typescript
// src/components/common/TaxonomyErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Box, Typography } from '@mui/material';

interface TaxonomyErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface TaxonomyErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class TaxonomyErrorBoundary extends Component<TaxonomyErrorBoundaryProps, TaxonomyErrorBoundaryState> {
  constructor(props: TaxonomyErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TaxonomyErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Taxonomy component error:", error, errorInfo);
    // Could send to an error reporting service
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Alert severity="error">
            <Typography variant="subtitle2">
              There was an issue with the taxonomy selection
            </Typography>
            <Typography variant="body2">
              {this.state.error?.message || "Please try again or select different values"}
            </Typography>
            <Button
              size="small"
              color="inherit"
              onClick={this.reset}
              sx={{ mt: 1 }}
            >
              Try Again
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default TaxonomyErrorBoundary;
```

### Wrap taxonomy components with this error boundary

```tsx
<TaxonomyErrorBoundary>
  <TaxonomySelection
    layer={layer}
    onLayerSelect={handleLayerSelect}
    // ... other props
  />
</TaxonomyErrorBoundary>
```

## 6. UI Improvements for Asset Registration Success

Update the success screen to clearly show both the original and backend values to help users understand the system's behavior:

```tsx
// In RegisterAssetPage.tsx success screen

const SuccessDisplay = () => {
  const isOverridden = originalSubcategory !== backendSubcategory;
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Asset Registered Successfully
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          NNA Addresses
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Human Friendly Name (HFN)
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {isOverridden ? overriddenHFN : backendHFN}
              {isOverridden && (
                <Tooltip title="Display adjusted from backend value">
                  <InfoIcon fontSize="small" color="info" sx={{ ml: 1, verticalAlign: 'middle' }} />
                </Tooltip>
              )}
            </Typography>
            {isOverridden && (
              <Typography variant="caption" color="text.secondary">
                Original: {backendHFN}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Machine Friendly Address (MFA)
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {backendMFA}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Rest of success screen */}
    </Box>
  );
};
```

## 7. Testing Enhancements

Create a comprehensive set of tests to validate the subcategory override system:

```typescript
// src/utils/__tests__/subcategoryUtils.test.ts

import { needsSubcategoryOverride, createOverriddenHFN } from '../subcategoryUtils';

describe('Subcategory Utils', () => {
  describe('needsSubcategoryOverride', () => {
    it('should return true when backend normalizes a subcategory', () => {
      expect(needsSubcategoryOverride('S', 'POP', 'LGF', 'BAS')).toBe(true);
    });
    
    it('should return false when backend preserves HPM subcategory', () => {
      expect(needsSubcategoryOverride('S', 'POP', 'HPM', 'HPM')).toBe(false);
    });
    
    // More tests...
  });
  
  describe('createOverriddenHFN', () => {
    it('should replace subcategory in HFN with original selection', () => {
      expect(createOverriddenHFN('S.POP.BAS.001', 'LGF')).toBe('S.POP.LGF.001');
    });
    
    // More tests...
  });
});
```

## Implementation Priority

1. **Highest Priority**:
   - Fix GitHub Actions issues to enable proper deployment
   - Create the subcategory utility module

2. **Medium Priority**:
   - Enhance the success display with clear information
   - Add the taxonomy status alerts

3. **Lower Priority**:
   - Implement enhanced logging
   - Add the error boundary component
   - Create comprehensive tests

## Conclusion

These enhancements will significantly improve the frontend's ability to handle subcategory normalization without requiring backend changes. The approach focuses on consistent behavior, clear user feedback, and robust error handling to ensure a smooth user experience despite the backend normalization issue.