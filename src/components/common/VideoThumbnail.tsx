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
import EnhancedLayerIcon from './EnhancedLayerIcon';

// Global cache for video thumbnails to persist across re-renders
const thumbnailCache = new Map<string, string>();

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
  // Initialize state from cache if available
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(() => {
    const cached = asset.gcpStorageUrl && isVideoUrl(asset.gcpStorageUrl) 
      ? thumbnailCache.get(asset.gcpStorageUrl) || null 
      : null;
    console.log(`🔄 VideoThumbnail init for ${asset.name}, cached: ${cached ? 'YES' : 'NO'}, isVideo: ${isVideoUrl(asset.gcpStorageUrl || '')}`);
    return cached;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Generate thumbnail when component mounts
  useEffect(() => {
    if (!asset.gcpStorageUrl || !isVideoUrl(asset.gcpStorageUrl)) {
      return;
    }

    // Check cache first
    const cachedThumbnail = thumbnailCache.get(asset.gcpStorageUrl);
    if (cachedThumbnail) {
      console.log(`🏪 Using cached thumbnail for ${asset.name}`);
      setThumbnailUrl(cachedThumbnail);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    console.log(`🎬 Attempting to generate thumbnail for ${asset.name}:`, asset.gcpStorageUrl);
    setIsLoading(true);
    setHasError(false);

    generateVideoThumbnail(asset.gcpStorageUrl)
      .then((dataUrl) => {
        console.log(`✅ Successfully generated thumbnail for ${asset.name}`);
        console.log(`📸 Thumbnail data URL length: ${dataUrl?.length || 0} chars`);
        console.log(`📸 Data URL preview: ${dataUrl?.substring(0, 50)}...`);
        console.log(`📸 Setting thumbnail URL state for ${asset.name}`);
        
        // Cache the thumbnail
        thumbnailCache.set(asset.gcpStorageUrl, dataUrl);
        console.log(`💾 Cached thumbnail for ${asset.name}`);
        
        setThumbnailUrl(dataUrl);
        setIsLoading(false);
      })
      .catch((error) => {
        console.warn(`❌ Failed to generate thumbnail for ${asset.name}:`, error);
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
    console.log(`🖼️ Rendering thumbnail for ${asset.name}, URL length: ${thumbnailUrl.length}`);
    console.log(`🖼️ Thumbnail src preview: ${thumbnailUrl.substring(0, 50)}...`);
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
          onLoad={() => {
            console.log(`✅ Thumbnail image loaded successfully for ${asset.name}`);
          }}
          onError={(e) => {
            console.warn(`🚨 Thumbnail image failed to load for ${asset.name}:`, e);
            console.warn(`🚨 Failed image src length: ${thumbnailUrl?.length || 0}`);
            console.warn(`🚨 Failed image src preview: ${thumbnailUrl?.substring(0, 100)}...`);
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

  // Show enhanced fallback icon ONLY for errors or non-video assets
  // Don't show fallback if we're still loading or if this is a video that should have a thumbnail
  if (showFallbackIcon && !isLoading && (!isVideoUrl(asset.gcpStorageUrl || '') || hasError)) {
    console.log(`🔄 Showing EnhancedLayerIcon fallback for ${asset.name} - thumbnailUrl: ${thumbnailUrl ? 'exists' : 'null'}, hasError: ${hasError}, isLoading: ${isLoading}, isVideo: ${isVideoUrl(asset.gcpStorageUrl || '')}`);
    return (
      <EnhancedLayerIcon 
        layer={asset.layer}
        width={width}
        height={height}
        showLabel={width >= 60} // Only show label for larger icons
      />
    );
  }

  // Return a loading placeholder for video assets that are generating thumbnails
  if (isVideoUrl(asset.gcpStorageUrl || '') && !thumbnailUrl && !hasError) {
    console.log(`⏳ Waiting for video thumbnail generation for ${asset.name}`);
    return (
      <Box sx={containerStyle}>
        <CircularProgress size={Math.min(width, height) * 0.4} />
      </Box>
    );
  }

  // Return null if no fallback requested
  return null;
};

export default VideoThumbnail;