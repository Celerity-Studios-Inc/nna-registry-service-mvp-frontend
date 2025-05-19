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
import { taxonomyService } from '../../services/simpleTaxonomyService';
import { taxonomyFormatter } from '../../utils/taxonomyFormatter';

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
  // For debugging
  console.log(
    `NNAAddressPreview Input: layer=${layerCode}, category=${categoryCode}, subcategory=${subcategoryCode}`
  );

  // Use the taxonomyFormatter utility to ensure consistent display
  // This handles all special cases internally and returns properly formatted addresses
  const hfn = `${layerCode}.${categoryCode}.${subcategoryCode}.001`;
  
  // Get formatted addresses
  const hfnAddress = taxonomyFormatter.formatHFN(hfn);
  const mfaAddress = taxonomyService.convertHFNtoMFA(hfn) || '';
  
  // If MFA conversion failed, provide a fallback
  if (!mfaAddress) {
    console.warn(`Failed to convert HFN: ${hfn} to MFA, using fallback`);
  }

  // Log the formatted addresses for debugging
  console.log(
    `NNAAddressPreview: Formatted HFN=${hfnAddress}, MFA=${mfaAddress}`
  );

  // Store original subcategory for later use in the success screen
  if (subcategoryNumericCode) {
    // Store in sessionStorage to persist through the registration flow
    try {
      sessionStorage.setItem(
        `originalSubcategory_${layerCode}_${categoryCode}`,
        subcategoryCode
      );
      console.log(
        `Stored original subcategory: ${subcategoryCode} for ${layerCode}.${categoryCode}`
      );
    } catch (e) {
      console.warn(
        'Failed to store original subcategory in sessionStorage:',
        e
      );
    }
  }

  return (
    <Paper sx={{ p: 3, mt: 3, backgroundColor: 'background.default' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1,
        }}
      >
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
        The NNA address provides a unique identifier for your asset in both
        human-friendly and machine-friendly formats.
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
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
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
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.02)',
                  fontFamily: 'monospace',
                }}
              >
                <Typography
                  variant="h6"
                  fontFamily="monospace"
                  color="secondary"
                >
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
          <InfoIcon
            fontSize="small"
            color="info"
            sx={{ mr: 1, width: 18, height: 18 }}
          />
          <Typography variant="caption" color="info.main">
            The sequential number (.000) will be assigned by the system when you
            submit the asset.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default NNAAddressPreview;
