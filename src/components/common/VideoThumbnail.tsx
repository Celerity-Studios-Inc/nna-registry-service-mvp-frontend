import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import {
  VideoFile as VideoIcon,
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
 * Enhanced component that displays video thumbnails with robust error handling
 */
const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  asset,
  width = 40,
  height = 40,
  showFallbackIcon = true,
}) => {
  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Initialize state from cache if available
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(() => {
    return asset.gcpStorageUrl && isVideoUrl(asset.gcpStorageUrl) 
      ? thumbnailCache.get(asset.gcpStorageUrl) || null 
      : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<string>('');

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Generate thumbnail when component mounts
  useEffect(() => {
    if (!asset.gcpStorageUrl || !isVideoUrl(asset.gcpStorageUrl)) {
      return;
    }

    // Check cache first
    const cachedThumbnail = thumbnailCache.get(asset.gcpStorageUrl);
    if (cachedThumbnail) {
      console.log(`✅ Using cached thumbnail for ${asset.name}`);
      if (isMountedRef.current) {
        setThumbnailUrl(cachedThumbnail);
        setIsLoading(false);
        setHasError(false);
      }
      return;
    }

    // Start thumbnail generation
    console.log(`🎬 Starting thumbnail generation for ${asset.name}: ${asset.gcpStorageUrl}`);
    
    if (isMountedRef.current) {
      setIsLoading(true);
      setHasError(false);
      setLoadingProgress('Loading video...');
    }

    generateVideoThumbnail(asset.gcpStorageUrl)
      .then((dataUrl) => {
        console.log(`✅ Successfully generated thumbnail for ${asset.name}`);
        
        // Cache the thumbnail globally
        thumbnailCache.set(asset.gcpStorageUrl, dataUrl);
        
        if (isMountedRef.current) {
          setThumbnailUrl(dataUrl);
          setIsLoading(false);
          setLoadingProgress('');
        }
      })
      .catch((error) => {
        console.warn(`❌ Failed to generate thumbnail for ${asset.name}:`, error.message);
        
        if (isMountedRef.current) {
          setHasError(true);
          setIsLoading(false);
          setLoadingProgress('');
        }
      });
  }, [asset.gcpStorageUrl, asset.name]);


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

  // Show loading state with progress indicator
  if (isLoading) {
    return (
      <Box sx={containerStyle}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 0.5
        }}>
          <CircularProgress size={Math.min(width, height) * 0.4} />
          {width >= 80 && loadingProgress && (
            <Typography variant="caption" sx={{ 
              fontSize: '0.6rem', 
              color: 'text.secondary',
              textAlign: 'center'
            }}>
              {loadingProgress}
            </Typography>
          )}
        </Box>
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
          onError={(e) => {
            console.warn(`Thumbnail failed to load for ${asset.name}`);
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