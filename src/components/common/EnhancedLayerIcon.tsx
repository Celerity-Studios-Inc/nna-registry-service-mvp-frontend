import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  MusicNote as MusicNoteIcon,
  Star as StarIcon,
  Face as FaceIcon,
  DirectionsRun as MovesIcon,
  Public as WorldIcon,
  LocalOffer as BrandingIcon,
  Person as PersonIcon,
  School as TrainingIcon,
  Layers as CompositeIcon,
  Copyright as RightsIcon,
  VideoFile as VideoIcon,
} from '@mui/icons-material';

interface EnhancedLayerIconProps {
  layer: string;
  width?: number;
  height?: number;
  showLabel?: boolean;
  showBadge?: boolean;
}

/**
 * Enhanced layer icon component with better visual design for video fallbacks
 */
const EnhancedLayerIcon: React.FC<EnhancedLayerIconProps> = ({
  layer,
  width = 40,
  height = 40,
  showLabel = false,
  showBadge = true,
}) => {
  const getLayerConfig = (layer: string) => {
    switch (layer) {
      case 'G': // Songs
        return {
          icon: MusicNoteIcon,
          color: '#1976d2', // Blue
          bgColor: '#e3f2fd',
          label: 'Songs',
          description: 'Audio'
        };
      case 'S': // Stars  
        return {
          icon: StarIcon,
          color: '#e91e63', // Pink
          bgColor: '#fce4ec',
          label: 'Stars',
          description: 'Image'
        };
      case 'L': // Looks
        return {
          icon: FaceIcon,
          color: '#9c27b0', // Purple
          bgColor: '#f3e5f5',
          label: 'Looks',
          description: 'Image'
        };
      case 'M': // Moves
        return {
          icon: MovesIcon,
          color: '#ff9800', // Orange
          bgColor: '#fff3e0',
          label: 'Moves',
          description: 'Video'
        };
      case 'W': // Worlds
        return {
          icon: WorldIcon,
          color: '#4caf50', // Green
          bgColor: '#e8f5e8',
          label: 'Worlds',
          description: 'Video'
        };
      case 'B': // Branded
        return {
          icon: BrandingIcon,
          color: '#f44336', // Red
          bgColor: '#ffebee',
          label: 'Branded',
          description: 'Image'
        };
      case 'P': // Personalize
        return {
          icon: PersonIcon,
          color: '#00bcd4', // Cyan
          bgColor: '#e0f7fa',
          label: 'Personalize',
          description: 'Data'
        };
      case 'T': // Training Data
        return {
          icon: TrainingIcon,
          color: '#673ab7', // Deep Purple
          bgColor: '#ede7f6',
          label: 'Training',
          description: 'Data'
        };
      case 'C': // Composites
        return {
          icon: CompositeIcon,
          color: '#795548', // Brown
          bgColor: '#efebe9',
          label: 'Composite',
          description: 'Video'
        };
      case 'R': // Rights
        return {
          icon: RightsIcon,
          color: '#607d8b', // Blue Grey
          bgColor: '#eceff1',
          label: 'Rights',
          description: 'Document'
        };
      default:
        return {
          icon: VideoIcon,
          color: '#757575',
          bgColor: '#f5f5f5',
          label: 'Asset',
          description: 'Unknown'
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

      {/* Video indicator badge - optional */}
      {showBadge && (
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
      )}
    </Box>
  );
};

export default EnhancedLayerIcon;