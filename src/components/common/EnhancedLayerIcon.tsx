import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  VideoFile as VideoIcon,
  DirectionsRun as MovesIcon,
  Public as WorldIcon,
  Movie as MovieIcon,
} from '@mui/icons-material';

interface EnhancedLayerIconProps {
  layer: string;
  width?: number;
  height?: number;
  showLabel?: boolean;
}

/**
 * Enhanced layer icon component with better visual design for video fallbacks
 */
const EnhancedLayerIcon: React.FC<EnhancedLayerIconProps> = ({
  layer,
  width = 40,
  height = 40,
  showLabel = false,
}) => {
  const getLayerConfig = (layer: string) => {
    switch (layer) {
      case 'M': // Moves
        return {
          icon: MovesIcon,
          color: '#388e3c',
          bgColor: '#e8f5e8',
          label: 'Moves',
          description: 'Video'
        };
      case 'W': // Worlds
        return {
          icon: WorldIcon,
          color: '#00796b',
          bgColor: '#e0f2f1',
          label: 'Worlds',
          description: 'Video'
        };
      case 'C': // Composites
        return {
          icon: MovieIcon,
          color: '#ff5722',
          bgColor: '#fbe9e7',
          label: 'Composite',
          description: 'Video'
        };
      default:
        return {
          icon: VideoIcon,
          color: '#757575',
          bgColor: '#f5f5f5',
          label: 'Video',
          description: 'Asset'
        };
    }
  };

  const config = getLayerConfig(layer);
  const IconComponent = config.icon;

  return (
    <Box
      sx={{
        width,
        height,
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}20`,
        position: 'relative',
      }}
    >
      <IconComponent
        sx={{
          fontSize: Math.min(width, height) * 0.5,
          color: config.color,
          mb: showLabel ? 0.5 : 0,
        }}
      />
      
      {showLabel && (
        <Typography
          variant="caption"
          sx={{
            fontSize: Math.min(width, height) * 0.15,
            color: config.color,
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          {config.description}
        </Typography>
      )}

      {/* Video indicator badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          width: Math.min(width, height) * 0.25,
          height: Math.min(width, height) * 0.25,
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <VideoIcon
          sx={{
            fontSize: Math.min(width, height) * 0.15,
            color: 'white',
          }}
        />
      </Box>
    </Box>
  );
};

export default EnhancedLayerIcon;