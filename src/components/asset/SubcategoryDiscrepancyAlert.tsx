import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { SubcategoryPreserver } from '../../utils/subcategoryPreserver';

interface SubcategoryDiscrepancyAlertProps {
  backendSubcategory: string;
  displayHfn: string;
  displayMfa: string;
}

/**
 * Alert component that displays when there's a discrepancy between 
 * the subcategory selected by the user and what was returned by the backend
 */
const SubcategoryDiscrepancyAlert: React.FC<SubcategoryDiscrepancyAlertProps> = ({
  backendSubcategory,
  displayHfn,
  displayMfa
}) => {
  // Check if we have stored data for any subcategory
  // This is a simplified implementation since we don't know
  // which layer and category to check against
  const storedData = sessionStorage.getItem('taxonomy_subcategory_selections');
  
  if (!storedData) return null;
  
  let stored;
  try {
    stored = JSON.parse(storedData);
    
    // If no subcategory in the stored data, don't show alert
    if (!stored.subcategory) return null;
  } catch (error) {
    console.error('[SubcategoryDiscrepancyAlert] Error parsing stored data:', error);
    return null;
  }
  
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Alert 
        severity="info"
        sx={{ 
          '& .MuiAlert-message': { 
            width: '100%' 
          }
        }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Note:</strong> You selected subcategory <strong>{stored.subcategory}</strong> but the backend stored it as <strong>{backendSubcategory}</strong>.
        </Typography>
        <Typography variant="body2">
          The system is displaying the correct HFN ({displayHfn}) and MFA ({displayMfa}) based on your selection.
        </Typography>
      </Alert>
    </Box>
  );
};

export default SubcategoryDiscrepancyAlert;