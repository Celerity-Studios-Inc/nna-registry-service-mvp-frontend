import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import VideoThumbnail from './VideoThumbnail';
import EnhancedLayerIcon from './EnhancedLayerIcon';
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

  const getLayerIcon = (layer: string) => {
    return (
      <EnhancedLayerIcon 
        layer={layer} 
        width={Math.min(width, height) * 0.8}
        height={Math.min(width, height) * 0.8}
        showLabel={false}
        showBadge={false}
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

  // Handle audio assets with album art support for Songs layer (G)
  if (asset.gcpStorageUrl && isAudioUrl(asset.gcpStorageUrl)) {
    // Phase 2A: Album art support for Songs layer
    if (asset.layer === 'G' && asset.metadata?.albumArtUrl && !imageError) {
      return (
        <Box sx={containerStyle}>
          <img
            src={asset.metadata.albumArtUrl}
            alt={`Album art for ${asset.friendlyName || asset.name}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
            onError={() => {
              // Fallback to layer icon if album art fails to load
              setImageError(true);
            }}
            onLoad={() => {
              setImageError(false);
            }}
          />
        </Box>
      );
    }
    
    // Fallback to layer icon for audio assets without album art or when album art fails
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