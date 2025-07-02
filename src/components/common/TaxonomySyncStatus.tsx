// components/common/TaxonomySyncStatus.tsx

import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Collapse,
  Stack
} from '@mui/material';
import {
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CloudSync as CloudSyncIcon,
  CloudOff as CloudOffIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useTaxonomy } from '../providers/TaxonomySyncProvider';
import { logger } from '../../utils/logger';

interface TaxonomySyncStatusProps {
  compact?: boolean;
  showDetails?: boolean;
  showRefreshButton?: boolean;
  position?: 'inline' | 'floating';
}

export function TaxonomySyncStatus({
  compact = false,
  showDetails = true,
  showRefreshButton = true,
  position = 'inline'
}: TaxonomySyncStatusProps) {
  const taxonomy = useTaxonomy();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Determine status and appearance
  const getStatusInfo = () => {
    if (taxonomy.initializing) {
      return {
        status: 'initializing',
        icon: <CircularProgress size={16} />,
        color: 'info' as const,
        label: 'Initializing...',
        chipColor: 'default' as const
      };
    }

    if (taxonomy.error) {
      return {
        status: 'error',
        icon: <ErrorIcon fontSize="small" />,
        color: 'error' as const,
        label: 'Sync Error',
        chipColor: 'error' as const
      };
    }

    if (!taxonomy.isConnected) {
      return {
        status: 'disconnected',
        icon: <CloudOffIcon fontSize="small" />,
        color: 'warning' as const,
        label: 'Disconnected',
        chipColor: 'warning' as const
      };
    }

    if (!taxonomy.isHealthy) {
      return {
        status: 'degraded',
        icon: <WarningIcon fontSize="small" />,
        color: 'warning' as const,
        label: 'Service Degraded',
        chipColor: 'warning' as const
      };
    }

    if (taxonomy.loading) {
      return {
        status: 'syncing',
        icon: <SyncIcon fontSize="small" className="spinning" />,
        color: 'info' as const,
        label: 'Syncing...',
        chipColor: 'info' as const
      };
    }

    return {
      status: 'healthy',
      icon: <CheckCircleIcon fontSize="small" />,
      color: 'success' as const,
      label: 'Synced',
      chipColor: 'success' as const
    };
  };

  const statusInfo = getStatusInfo();

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      logger.info('Manual taxonomy sync requested from status component');
      await taxonomy.forceSync();
    } catch (error) {
      logger.error('Manual sync failed:', error);
    }
  };

  // Compact version
  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={`Taxonomy: ${statusInfo.label}${taxonomy.cacheAge ? ` (${taxonomy.cacheAge})` : ''}`}>
          <Chip
            icon={statusInfo.icon}
            label={statusInfo.label}
            color={statusInfo.chipColor}
            size="small"
            variant="outlined"
          />
        </Tooltip>
        
        {showRefreshButton && (
          <Tooltip title="Refresh taxonomy data">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={taxonomy.loading || taxonomy.initializing}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  // Full version
  const renderStatusDetails = () => (
    <Stack spacing={2}>
      {/* Current Status */}
      <Alert severity={statusInfo.color} icon={statusInfo.icon}>
        <Typography variant="body2">
          <strong>Status:</strong> {statusInfo.label}
          {taxonomy.index && ` (Version ${taxonomy.index.version})`}
        </Typography>
        {taxonomy.cacheAge && (
          <Typography variant="caption" display="block">
            Last synced: {taxonomy.cacheAge}
          </Typography>
        )}
      </Alert>

      {/* Error Details */}
      {taxonomy.error && (
        <Alert severity="error">
          <Typography variant="body2">
            <strong>Error:</strong> {taxonomy.error}
          </Typography>
        </Alert>
      )}

      {/* Connection Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {taxonomy.isConnected ? (
          <CloudSyncIcon color="success" fontSize="small" />
        ) : (
          <CloudOffIcon color="error" fontSize="small" />
        )}
        <Typography variant="body2">
          Backend: {taxonomy.isConnected ? 'Connected' : 'Disconnected'}
        </Typography>
      </Box>

      {/* Health Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {taxonomy.isHealthy ? (
          <CheckCircleIcon color="success" fontSize="small" />
        ) : (
          <WarningIcon color="warning" fontSize="small" />
        )}
        <Typography variant="body2">
          Service: {taxonomy.isHealthy ? 'Healthy' : 'Degraded'}
        </Typography>
      </Box>

      {/* Last Sync Time */}
      {taxonomy.lastSyncTime && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="action" fontSize="small" />
          <Typography variant="body2">
            Last sync: {taxonomy.lastSyncTime.toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* Taxonomy Summary */}
      {taxonomy.index && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Taxonomy Summary
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Layer</TableCell>
                  <TableCell align="right">Categories</TableCell>
                  <TableCell align="right">Subcategories</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taxonomy.getAllLayers().map((layer) => (
                  <TableRow key={layer}>
                    <TableCell>
                      <strong>{layer}</strong> - {taxonomy.formatLayerName(layer)}
                    </TableCell>
                    <TableCell align="right">
                      {taxonomy.getCategoryCount(layer)}
                    </TableCell>
                    <TableCell align="right">
                      {taxonomy.getTotalSubcategories(layer)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell align="right">
                    <strong>
                      {taxonomy.getAllLayers().reduce((sum, layer) => 
                        sum + taxonomy.getCategoryCount(layer), 0
                      )}
                    </strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>
                      {taxonomy.getAllLayers().reduce((sum, layer) => 
                        sum + taxonomy.getTotalSubcategories(layer), 0
                      )}
                    </strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Stack>
  );

  return (
    <Box sx={{ 
      ...(position === 'floating' && {
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000
      })
    }}>
      {/* Status Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        p: position === 'floating' ? 1 : 0,
        backgroundColor: position === 'floating' ? 'background.paper' : 'transparent',
        borderRadius: position === 'floating' ? 1 : 0,
        boxShadow: position === 'floating' ? 2 : 0
      }}>
        <Chip
          icon={statusInfo.icon}
          label={`Taxonomy: ${statusInfo.label}`}
          color={statusInfo.chipColor}
          variant="outlined"
          onClick={showDetails ? () => setExpanded(!expanded) : undefined}
          clickable={showDetails}
        />
        
        {showRefreshButton && (
          <Tooltip title="Refresh taxonomy data">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={taxonomy.loading || taxonomy.initializing}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        
        {showDetails && (
          <Tooltip title="View details">
            <IconButton size="small" onClick={() => setDetailsOpen(true)}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        
        {showDetails && (
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {/* Expandable Quick Status */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Stack spacing={1}>
            <Typography variant="caption">
              Version: {taxonomy.index?.version || 'Unknown'}
            </Typography>
            <Typography variant="caption">
              Layers: {taxonomy.getLayerCount()}
            </Typography>
            <Typography variant="caption">
              Last sync: {taxonomy.cacheAge || 'Never'}
            </Typography>
            <Typography variant="caption" color={taxonomy.isHealthy ? 'success.main' : 'warning.main'}>
              Status: {taxonomy.isHealthy ? 'Healthy' : 'Degraded'}
            </Typography>
          </Stack>
        </Box>
      </Collapse>

      {/* Detailed Status Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {statusInfo.icon}
            Taxonomy Sync Status
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {renderStatusDetails()}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRefresh}
            disabled={taxonomy.loading || taxonomy.initializing}
            startIcon={<RefreshIcon />}
          >
            Refresh Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Spinning animation for sync icon */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spinning {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </Box>
  );
}

export default TaxonomySyncStatus;