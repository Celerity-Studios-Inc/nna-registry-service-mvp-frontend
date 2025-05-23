import React from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { AccountTree as TaxonomyIcon } from '@mui/icons-material';

interface TaxonomyContextProps {
  layer: string;
  layerName?: string;
  categoryCode: string;
  categoryName?: string;
  subcategoryCode: string;
  subcategoryName?: string;
  hfn?: string;
  mfa?: string;
}

/**
 * TaxonomyContext Component
 * 
 * Displays the currently selected taxonomy context (Layer, Category, Subcategory)
 * for reference on subsequent steps of the asset registration process.
 */
const TaxonomyContext: React.FC<TaxonomyContextProps> = ({
  layer,
  layerName,
  categoryCode,
  categoryName,
  subcategoryCode,
  subcategoryName,
  hfn,
  mfa
}) => {
  // Only render if we have the minimum required data
  if (!layer || !categoryCode || !subcategoryCode) {
    return null;
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 3, 
        border: '1px solid #e0e0e0',
        borderLeft: '4px solid #1976d2',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}
    >
      <Box display="flex" alignItems="center" mb={1}>
        <TaxonomyIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="subtitle1" fontWeight="medium">
          Selected Taxonomy
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                Layer:
              </Typography>
              <Chip 
                label={`${layer}${layerName ? ` - ${layerName}` : ''}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                Category:
              </Typography>
              <Chip 
                label={`${categoryCode}${categoryName ? ` - ${categoryName?.replace(/_/g, ' ')}` : categoryCode === 'DNC' ? ' - Dance Electronic' : ''}`}
                size="small" 
                color="primary"
                variant="outlined"
                sx={{ 
                  maxWidth: '100%',
                  '.MuiChip-label': { 
                    whiteSpace: 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    maxWidth: '100%'
                  }
                }}
                title={categoryName || categoryCode} // Add title for tooltip on hover
              />
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                Subcategory:
              </Typography>
              <Chip 
                label={`${subcategoryCode}${subcategoryName ? ` - ${subcategoryName?.replace(/_/g, ' ')}` : ''}`}
                size="small"
                color="primary" 
                variant="outlined"
                title={subcategoryName || subcategoryCode} // Add title for tooltip on hover
                sx={{ 
                  maxWidth: '100%',
                  '.MuiChip-label': { 
                    whiteSpace: 'normal',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    maxWidth: '100%'
                  }
                }}
              />
            </Box>
          </Box>
        </Grid>
        
        {(hfn || mfa) && (
          <Grid item xs={12} sm={6}>
            <Box display="flex" flexDirection="column" gap={1}>
              {hfn && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                    HFN:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" bgcolor="#f5f5f5" px={1} py={0.5} borderRadius={1}>
                    {hfn}
                  </Typography>
                </Box>
              )}
              
              {mfa && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                    MFA:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" bgcolor="#f5f5f5" px={1} py={0.5} borderRadius={1}>
                    {mfa}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default TaxonomyContext;