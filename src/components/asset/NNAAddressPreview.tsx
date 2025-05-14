import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Tooltip,
  Alert,
  Grid,
} from '@mui/material';
import {
  Check as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { convertHFNToMFA, formatNNAAddress } from '../../api/codeMapping';

interface NNAAddressPreviewProps {
  layerCode: string;
  subcategoryNumericCode?: string;
  categoryCode: string;
  subcategoryCode: string;
  sequentialNumber: string;
  isUnique: boolean;
  checkingUniqueness: boolean;
  validationError?: string;
}

const NNAAddressPreview: React.FC<NNAAddressPreviewProps> = ({
  layerCode,
  subcategoryNumericCode,
  categoryCode,
  subcategoryCode,
  sequentialNumber,
  isUnique,
  checkingUniqueness,
  validationError,
}) => {
  // Replace the actual sequential number with ".000" for preview display
  // This indicates that the actual number will be determined by the backend after submission
  const displaySequential = "000";

  // For debugging
  console.log(`NNAAddressPreview Input: layer=${layerCode}, category=${categoryCode}, subcategory=${subcategoryCode}`);

  // Ensure we're using alphabetic codes for the HFN where possible
  // This is particularly important for layer W (Worlds) which often shows numeric codes
  let displayCategoryCode = categoryCode;

  // Special handling for layer W Nature (015)
  if (layerCode === 'W' && categoryCode === '015') {
    displayCategoryCode = 'NAT';
    console.log(`NNAAddressPreview: Detected W layer with Nature category, using NAT instead of 015`);
  }

  // Create the human-friendly NNA address - use the displaySequential for preview
  const hfnAddress = formatNNAAddress(
    layerCode,
    displayCategoryCode,
    subcategoryCode,
    displaySequential // Use "000" as the placeholder for sequential number
  );

  // Create the machine-friendly NNA address
  // Special handling for S.POP.HPM to ensure sequential consistency
  let mfaAddress;
  if (layerCode === 'S' &&
      (categoryCode === 'POP' || categoryCode === '001') &&
      (subcategoryCode === 'HPM' || subcategoryCode === '007')) {
    // Direct construction for this special case to ensure consistent sequential number
    mfaAddress = `2.001.007.${displaySequential}`; // Use "nnn" instead of the actual sequential number
    console.log(`NNAAddressPreview: Direct MFA for S.POP.HPM: ${mfaAddress}`);
  } else {
    // Standard conversion for other cases - the conversion function will preserve "nnn"
    mfaAddress = convertHFNToMFA(hfnAddress);
  }

  return (
    <Paper sx={{ p: 3, mt: 3, backgroundColor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">NNA Address Preview</Typography>
        {checkingUniqueness ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Checking uniqueness...
            </Typography>
          </Box>
        ) : validationError ? (
          <Chip
            icon={<ErrorIcon fontSize="small" />}
            label="Invalid"
            color="error"
            variant="outlined"
            size="small"
          />
        ) : isUnique ? (
          <Chip
            icon={<CheckIcon fontSize="small" />}
            label="Unique"
            color="success"
            variant="outlined"
            size="small"
          />
        ) : null}
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        The NNA address provides a unique identifier for your asset in both human-friendly and machine-friendly formats.
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      {validationError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mr: 1 }}>
                  Human-Friendly Name (HFN)
                </Typography>
                <Tooltip title="Human-readable format used for natural communication">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {hfnAddress}
                </Typography>
              </Paper>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ mr: 1 }}>
                  Machine-Friendly Address (MFA)
                </Typography>
                <Tooltip title="Machine-optimized format used for system identification">
                  <InfoIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                  fontFamily: 'monospace',
                }}
              >
                <Typography variant="h6" fontFamily="monospace" color="secondary">
                  {mfaAddress}
                </Typography>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      )}
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Format:</strong> Layer.Category.Subcategory.SequentialNumber
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <InfoIcon fontSize="small" color="info" sx={{ mr: 1, width: 18, height: 18 }} />
          <Typography variant="caption" color="info.main">
            The sequential number (.000) will be assigned by the system when you submit the asset.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default NNAAddressPreview;