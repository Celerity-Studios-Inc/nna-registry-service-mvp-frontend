import React, { useMemo } from 'react';
import { Alert, Box, Typography } from '@mui/material';

interface SubcategoryDiscrepancyAlertProps {
  backendSubcategory: string;
  displayHfn: string;
  displayMfa: string;
}

/**
 * Enhanced Alert component that displays when there's a discrepancy between 
 * the subcategory selected by the user and what was returned by the backend,
 * or when there's a mismatch between HFN parts in the displayHfn.
 */
const SubcategoryDiscrepancyAlert: React.FC<SubcategoryDiscrepancyAlertProps> = ({
  backendSubcategory,
  displayHfn,
  displayMfa
}) => {
  // Extract subcategory from displayHfn for direct comparison
  const hfnParts = useMemo(() => {
    if (!displayHfn) return { layer: '', category: '', subcategory: '', sequential: '' };
    
    const parts = displayHfn.split('.');
    if (parts.length < 4) return { layer: '', category: '', subcategory: '', sequential: '' };
    
    return {
      layer: parts[0],
      category: parts[1],
      subcategory: parts[2],
      sequential: parts[3]
    };
  }, [displayHfn]);
  
  // Check if we have stored data for any subcategory selection
  const storedData = sessionStorage.getItem('taxonomy_subcategory_selections');
  let stored: any = null;
  
  // Try to parse stored subcategory selection if available
  if (storedData) {
    try {
      stored = JSON.parse(storedData);
    } catch (error) {
      console.error('[SubcategoryDiscrepancyAlert] Error parsing stored data:', error);
    }
  }
  
  // Detect discrepancy in subcategory codes between backend and HFN
  const hfnSubcategoryMismatch = 
    backendSubcategory && 
    hfnParts.subcategory && 
    backendSubcategory.toUpperCase() !== hfnParts.subcategory &&
    backendSubcategory.toUpperCase() !== 'BASE' && 
    hfnParts.subcategory !== 'BAS';
  
  // Detect discrepancy between stored user selection and backend/display values
  const storedSelectionMismatch = 
    stored?.subcategory && 
    backendSubcategory && 
    stored.subcategory.toUpperCase() !== backendSubcategory.toUpperCase() &&
    stored.subcategory.toUpperCase() !== 'BASE' && 
    backendSubcategory.toUpperCase() !== 'BASE';
  
  // If there's no discrepancy, don't show any alert
  if (!hfnSubcategoryMismatch && !storedSelectionMismatch) {
    return null;
  }
  
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Alert 
        severity="info"
        sx={{ 
          '& .MuiAlert-message': { 
            width: '100%' 
          },
          border: '1px solid #90caf9',
          bgcolor: '#e3f2fd'
        }}
      >
        {hfnSubcategoryMismatch && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Note:</strong> There's a discrepancy between the subcategory code in the backend 
            (<strong>{backendSubcategory}</strong>) and the one used in the HFN 
            (<strong>{hfnParts.subcategory}</strong>).
          </Typography>
        )}
        
        {storedSelectionMismatch && stored?.subcategory && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Note:</strong> You selected subcategory <strong>{stored.subcategory}</strong> but 
            the backend stored it as <strong>{backendSubcategory}</strong>.
          </Typography>
        )}
        
        <Typography variant="body2">
          The displayed HFN (<strong>{displayHfn}</strong>) and MFA (<strong>{displayMfa}</strong>) 
          represent the correct values as stored in the asset's metadata.
        </Typography>
      </Alert>
    </Box>
  );
};

export default SubcategoryDiscrepancyAlert;