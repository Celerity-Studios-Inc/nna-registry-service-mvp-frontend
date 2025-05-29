import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import {
  VideoFile as VideoIcon,
  Movie as MovieIcon,
  DirectionsRun as MovesIcon,
  Public as WorldIcon,
} from '@mui/icons-material';
import { generateVideoThumbnail, isVideoUrl } from '../../utils/videoThumbnail';
import { Asset } from '../../types/asset.types';

interface VideoThumbnailProps {
  asset: Asset;
  width?: number;
  height?: number;
  showFallbackIcon?: boolean;
}

/**
 * Component that displays video thumbnails with fallback to layer icons
 */
const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  asset,
  width = 40,
  height = 40,
  showFallbackIcon = true,
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Generate thumbnail when component mounts
  useEffect(() => {
    if (!asset.gcpStorageUrl || !isVideoUrl(asset.gcpStorageUrl)) {
      return;
    }

    setIsLoading(true);
    setHasError(false);

    generateVideoThumbnail(asset.gcpStorageUrl)
      .then((dataUrl) => {
        setThumbnailUrl(dataUrl);
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn(`Failed to generate thumbnail for ${asset.name}:`, error);
        setHasError(true);
        setIsLoading(false);
      });
  }, [asset.gcpStorageUrl, asset.name]);

  // Get appropriate fallback icon based on layer
  const getFallbackIcon = () => {
    const iconProps = {
      sx: { 
        fontSize: Math.min(width, height) * 0.6,
        color: 'action.active'
      }
    };

    switch (asset.layer) {
      case 'M': // Moves
        return <MovesIcon {...iconProps} />;
      case 'W': // Worlds  
        return <WorldIcon {...iconProps} />;
      case 'C': // Composites (usually videos)
        return <MovieIcon {...iconProps} />;
      default:
        return <VideoIcon {...iconProps} />;
    }
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
    position: 'relative' as const,
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={containerStyle}>
        <CircularProgress size={Math.min(width, height) * 0.4} />
      </Box>
    );
  }

  // Show generated thumbnail
  if (thumbnailUrl && !hasError) {
    return (
      <Box sx={containerStyle}>
        <img
          src={thumbnailUrl}
          alt={`${asset.friendlyName || asset.name} thumbnail`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '4px'
          }}
          onError={() => {
            console.warn(`Thumbnail image failed to load for ${asset.name}`);
            setHasError(true);
          }}
        />
        {/* Video indicator overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: '2px',
            padding: '1px 3px',
          }}
        >
          <VideoIcon sx={{ fontSize: 8, color: 'white' }} />
        </Box>
      </Box>
    );
  }

  // Show fallback icon for errors or non-video assets
  if (showFallbackIcon) {
    return (
      <Box sx={containerStyle}>
        {getFallbackIcon()}
      </Box>
    );
  }

  // Return null if no fallback requested
  return null;
};

export default VideoThumbnail;