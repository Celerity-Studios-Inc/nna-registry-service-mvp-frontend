import React from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { AccountTree as TaxonomyIcon } from '@mui/icons-material';

// Helper function to handle display name from taxonomy data
const formatDisplayName = (name?: string): string => {
  if (!name) return '';
  
  // Clean up formatting - replace underscores with spaces
  return name.replace(/_/g, ' ');
};

// Helper function to get display name for category and subcategory codes
const getCategoryDisplayName = (code: string, name?: string): string => {
  // If we have a name directly from the taxonomy service, use it (priority 1)
  if (name && name.trim() !== '') {
    return formatDisplayName(name);
  }
  
  // Fallback display names for common categories and subcategories (priority 2)
  const displayNames: Record<string, string> = {
    // Categories
    'POP': 'Pop',
    'ROK': 'Rock',
    'DNC': 'Dance Electronic',
    'HIP': 'Hip Hop',
    'RNB': 'R&B',
    'PRF': 'Performance',
    'EVC': 'Everyday Casual',
    'BCH': 'Beach',
    'LAT': 'Latin',
    'VAV': 'Virtual Avatars',
    'JZZ': 'Jazz',
    'AFB': 'Afrobeats Dance',
    'FLK': 'Folk',
    'MET': 'Metal',
    'CTR': 'Country',
    'CLS': 'Classical',
    'DIS': 'Disco',
    'EDM': 'EDM',
    'URB': 'Urban Dance',
    'BLT': 'Ballet',
    'HHS': 'Hip Hop Style',
    'STG': 'Concert Stages',
    'CLB': 'Dance Clubs',
    'FUT': 'Futuristic',
    'FAN': 'Fantasy',
    'NTL': 'Natural',
    'VIR': 'Virtual',
    'IND': 'Industrial',
    'RUR': 'Rural',
    'HST': 'Historical',
    'CUL': 'Cultural',
    'ABS': 'Abstract',
    'RET': 'Retro',
    'NAT': 'Nature',
    
    // Subcategories
    'BAS': 'Base',
    'PAL': 'Palm',
    'REG': 'Reggaeton',
    'CUM': 'Cumbia',
    'MER': 'Merengue',
    'SAL': 'Salsa',
    'TRP': 'Trap',
    'BAC': 'Bachata',
    'FLM': 'Flamenco',
    'AIG': 'AI Generated',
    'AZN': 'Azonto',
    'BAT': 'Bata',
    'HLF': 'Highlife',
    'KUD': 'Kuduro',
    'SHK': 'Shaku',
    'SHB': 'Shoki',
    'ZAN': 'Zanku',
    'CPR': 'Coupe Decale',
    'EXP': 'Experimental',
    'MTN': 'Mountain',
    'FOR': 'Forest',
    'DSR': 'Desert',
    'LKE': 'Lake'
  };
  
  // If we have a match in our dictionary, return it
  if (displayNames[code]) {
    return displayNames[code];
  }
  
  // If no match, try to generate a human-readable name from the code
  // For codes like NTL, URB, etc., this provides a reasonable fallback
  if (code && code.length <= 4) {
    return code.charAt(0).toUpperCase() + code.slice(1).toLowerCase();
  }
  
  // Last resort - just return the code
  return code;
};

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
              <Box display="flex" alignItems="center">
                <Chip 
                  label={categoryCode}
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {getCategoryDisplayName(categoryCode, categoryName)}
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" fontWeight="bold" color="text.secondary" minWidth="80px">
                Subcategory:
              </Typography>
              <Box display="flex" alignItems="center">
                <Chip 
                  label={subcategoryCode}
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" fontWeight="medium" color="text.primary">
                  {getCategoryDisplayName(subcategoryCode, subcategoryName)}
                </Typography>
              </Box>
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