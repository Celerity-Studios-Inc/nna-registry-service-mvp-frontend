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
  // Create the human-friendly NNA address
  const hfnAddress = formatNNAAddress(
    layerCode,
    categoryCode,
    subcategoryCode,
    sequentialNumber
  );

  // Create the machine-friendly NNA address
  const mfaAddress = convertHFNToMFA(hfnAddress);

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
      </Box>
    </Paper>
  );
};

export default NNAAddressPreview;