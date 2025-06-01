import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import {
  AudioFile as AudioIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
  DirectionsRun as MovesIcon,
  Public as WorldIcon,
  WorkspacePremium as CrownIcon,
  Lock as LockIcon,
  VideoFile as VideoIcon,
} from '@mui/icons-material';
import VideoThumbnail from './VideoThumbnail';
import { isVideoUrl, isAudioUrl } from '../../utils/videoThumbnail';
import { Asset } from '../../types/asset.types';

interface AssetThumbnailProps {
  asset: Asset;
  width?: number;
  height?: number;
}

/**
 * Smart asset thumbnail component that handles both images and videos
 */
const AssetThumbnail: React.FC<AssetThumbnailProps> = ({
  asset,
  width = 40,
  height = 40,
}) => {
  // State to track image loading errors
  const [imageError, setImageError] = useState(false);

  // Reset error state when asset URL changes (e.g., when search results change)
  useEffect(() => {
    setImageError(false);
  }, [asset.gcpStorageUrl, asset.id]);
  // Layer configuration for icons and colors
  const LAYER_CONFIG = {
    G: { icon: AudioIcon, color: '#1976d2', name: 'Songs' },
    S: { icon: PersonIcon, color: '#9c27b0', name: 'Stars' },
    L: { icon: PaletteIcon, color: '#f57c00', name: 'Looks' },
    M: { icon: MovesIcon, color: '#388e3c', name: 'Moves' },
    W: { icon: WorldIcon, color: '#00796b', name: 'Worlds' },
    B: { icon: CrownIcon, color: '#d32f2f', name: 'Branded' },
    P: { icon: LockIcon, color: '#7b1fa2', name: 'Personalize' },
    C: { icon: VideoIcon, color: '#ff5722', name: 'Composites' },
  };

  const getLayerIcon = (layer: string) => {
    const config = LAYER_CONFIG[layer as keyof typeof LAYER_CONFIG];
    if (!config) return null;
    
    const IconComponent = config.icon;
    return (
      <IconComponent 
        sx={{ 
          color: config.color, 
          fontSize: Math.min(width, height) * 0.6 
        }} 
      />
    );
  };

  const containerStyle = {
    width,
    height,
    borderRadius: 1,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'grey.100',
  };

  // Handle video assets with VideoThumbnail component
  if (asset.gcpStorageUrl && isVideoUrl(asset.gcpStorageUrl)) {
    return (
      <VideoThumbnail 
        asset={asset} 
        width={width} 
        height={height} 
        showFallbackIcon={true}
      />
    );
  }

  // Handle audio assets with layer icon fallback
  if (asset.gcpStorageUrl && isAudioUrl(asset.gcpStorageUrl)) {
    return (
      <Box sx={containerStyle}>
        {getLayerIcon(asset.layer)}
      </Box>
    );
  }

  // Handle image assets with proper React error handling
  if (asset.gcpStorageUrl && !isVideoUrl(asset.gcpStorageUrl) && !isAudioUrl(asset.gcpStorageUrl)) {
    return (
      <Box sx={containerStyle}>
        {imageError ? (
          // Show layer icon fallback when image fails to load
          getLayerIcon(asset.layer)
        ) : (
          <img
            src={asset.gcpStorageUrl}
            alt={`${asset.friendlyName || asset.name} thumbnail`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
            onError={() => {
              // Set error state to trigger layer icon fallback
              setImageError(true);
            }}
            onLoad={() => {
              // Reset error state when image loads successfully
              setImageError(false);
            }}
          />
        )}
      </Box>
    );
  }

  // Fallback to layer icon for assets without storage URL
  return (
    <Box sx={containerStyle}>
      {getLayerIcon(asset.layer)}
    </Box>
  );
};

export default AssetThumbnail;