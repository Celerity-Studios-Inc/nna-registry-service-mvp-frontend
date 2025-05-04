import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  CardHeader,
  Divider,
  useTheme,
  CircularProgress,
  Alert,
  Tooltip,
  Badge,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { LayerOption } from '../../types/taxonomy.types';
import taxonomyService from '../../api/taxonomyService';
import {
  layerConfig,
  mvpLayerCodes,
  generateHumanFriendlyName,
  generateMachineFriendlyAddress,
  getNextSequentialNumber,
} from '../../api/layerConfig';
import api from '../../services/api/api';

interface LayerSelectionProps {
  onLayerSelect: (layer: LayerOption, isDoubleClick?: boolean) => void;
  selectedLayerCode?: string;
}

// Define layer card details with icon, description and color
type LayerDetail = {
  icon: React.ReactNode;
  description: string;
  color: string;
  fileTypes?: string[];
  examples?: string[];
};

const LayerSelection: React.FC<LayerSelectionProps> = ({ onLayerSelect, selectedLayerCode }) => {
  const [layers, setLayers] = useState<LayerOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverLayer, setHoverLayer] = useState<string | null>(null);
  const [layerStats, setLayerStats] = useState<Record<string, number>>({});
  const theme = useTheme();

  useEffect(() => {
    const fetchLayers = async () => {
      try {
        setLoading(true);
        // Get all layers from taxonomy service
        const allLayerOptions = taxonomyService.getLayers();
        // Filter to only show MVP layers
        const filteredLayers = allLayerOptions.filter(layer => mvpLayerCodes.includes(layer.code));

        setLayers(filteredLayers);

        const { data } = await api.get('/assets/count');


        // Simulate fetching layer stats (asset counts per layer)
        // In a real implementation, this would come from the backend
        // const mockLayerStats: Record<string, number> = {
        //   G: 128,
        //   S: 85,
        //   L: 64,
        //   M: 42,
        //   W: 37,
        //   B: 18,
        //   P: 9,
        //   T: 24,
        //   C: 15,
        //   R: 32,
        // };

        setLayerStats(data);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load layers');
      } finally {
        setLoading(false);
      }
    };

    fetchLayers();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Select Asset Layer
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the primary layer for your asset. The layer determines the asset's classification in
        the NNA framework.
        <strong> Double-click a card to select and proceed to the next step.</strong>
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {layers.map(layer => {
          // Use the imported layerConfig for layer details
          const configDetails = layerConfig[layer.code];

          // Fallback details if not found in config
          const details: LayerDetail = configDetails || {
            icon: React.createElement('div'),
            description: 'Layer description not available',
            color: theme.palette.grey[500],
            fileTypes: [],
            examples: [],
          };

          const isSelected = layer.code === selectedLayerCode;
          const isHovered = hoverLayer === layer.code;
          const assetCount = layerStats[layer.code] || 0;

          // Skip non-MVP layers (should already be filtered, but adding as a safeguard)
          if (!mvpLayerCodes.includes(layer.code)) {
            return null;
          }

          return (
            <Grid item xs={12} sm={6} md={4} key={layer.code}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="subtitle2">Registered assets: {assetCount}</Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <Badge
                  badgeContent={isSelected ? <CheckCircleIcon color="success" /> : null}
                  overlap="circular"
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  sx={{ width: '100%' }}
                >
                  <Card
                    raised={isSelected || isHovered}
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      borderColor: isSelected ? details.color : 'transparent',
                      borderWidth: isSelected ? 2 : 0,
                      borderStyle: 'solid',
                      transition: 'all 0.3s ease',
                      backgroundColor: isSelected ? `${details.color}10` : 'background.paper',
                      '&:hover': {
                        backgroundColor: `${details.color}08`,
                        transform: 'translateY(-3px)',
                        boxShadow: 3,
                      },
                      width: '100%',
                    }}
                    onMouseEnter={() => setHoverLayer(layer.code)}
                    onMouseLeave={() => setHoverLayer(null)}
                  >
                    <CardActionArea
                      sx={{ height: '100%' }}
                      onClick={() => onLayerSelect(layer, false)}
                      onDoubleClick={e => {
                        e.preventDefault(); // Prevent the single click from also firing
                        console.log(`Double clicked on layer: ${layer.name} (${layer.code})`);
                        onLayerSelect(layer, true);
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Box
                            sx={{
                              color: details.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: `${details.color}15`,
                              padding: 1.5,
                              borderRadius: '50%',
                            }}
                          >
                            {details.icon}
                          </Box>
                        }
                        title={`${layer.name} (${layer.code})`}
                        titleTypographyProps={{ variant: 'h6' }}
                        subheader={`${assetCount} registered assets`}
                      />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {details.description}
                        </Typography>

                        {isSelected && (
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Typography variant="caption" color="success.main">
                              Selected
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Badge>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default LayerSelection;
