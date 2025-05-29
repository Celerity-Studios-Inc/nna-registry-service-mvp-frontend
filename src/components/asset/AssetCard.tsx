import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CardActions,
  Button,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
  InsertDriveFile as DefaultFileIcon,
  Article as DocumentIcon,
  Code as CodeIcon,
  Launch as LaunchIcon,
  TextSnippet as TextIcon,
} from '@mui/icons-material';
import { Asset } from '../../types/asset.types';
import { Link, useNavigate } from 'react-router-dom';
import taxonomyService from '../../api/taxonomyService';
import AssetThumbnail from '../common/AssetThumbnail';

interface AssetCardProps {
  asset: Asset;
  onClick?: () => void;
  showActions?: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onClick,
  showActions = true,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Handle double-click navigation to asset details
  const handleDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const assetId = asset._id || asset.id;
    if (assetId) {
      console.log(`🖱️ Double-click detected on asset card: ${assetId}`);
      navigate(`/assets/${assetId}`);
    } else {
      console.error('Asset ID is undefined, cannot navigate to details page', asset);
    }
  };

  // Enhanced click handler with debugging
  const handleClick = (event: React.MouseEvent) => {
    console.log(`🖱️ Single click detected on asset card: ${asset._id || asset.id}`);
    if (onClick) {
      onClick();
    }
  };

  // Determine file type for preview
  const getFileTypeInfo = () => {
    // Check if asset has files
    if (!asset.files || asset.files.length === 0) {
      // Try to use gcpStorageUrl if available (common in API responses)
      if (asset.gcpStorageUrl) {
        return {
          icon: <ImageIcon sx={{ fontSize: 48 }} />,
          color: theme.palette.primary.main,
          previewUrl: asset.gcpStorageUrl,
        };
      }
      // Fall back to layer-based icons if no files
      return getLayerIcon();
    }

    const file = asset.files[0];

    // Handle case where contentType might be missing
    const contentType = (file.contentType || '').toLowerCase();

    // Check for thumbnail URL first (priority)
    if (file.thumbnailUrl) {
      return {
        icon: <ImageIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.primary.main,
        previewUrl: file.thumbnailUrl,
      };
    }

    // Then check content type for images
    if (contentType.startsWith('image/')) {
      return {
        icon: <ImageIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.primary.main,
        previewUrl: file.url,
      };
    }

    if (contentType.startsWith('audio/')) {
      return {
        icon: <AudioIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.warning.main,
        previewUrl: null,
      };
    }

    if (contentType.startsWith('video/')) {
      return {
        icon: <VideoIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.error.main,
        previewUrl: null,
      };
    }

    if (contentType.startsWith('text/')) {
      return {
        icon: <TextIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.info.main,
        previewUrl: null,
      };
    }

    if (contentType.includes('pdf')) {
      return {
        icon: <DocumentIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.error.main,
        previewUrl: null,
      };
    }

    if (
      contentType.includes('json') ||
      contentType.includes('javascript') ||
      contentType.includes('code')
    ) {
      return {
        icon: <CodeIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.success.main,
        previewUrl: null,
      };
    }

    return {
      icon: <DefaultFileIcon sx={{ fontSize: 48 }} />,
      color: theme.palette.grey[500],
      previewUrl: null,
    };
  };

  // Fallback to layer-based icons
  const getLayerIcon = () => {
    const layerIcons: Record<string, { icon: JSX.Element; color: string }> = {
      G: {
        // Songs
        icon: <AudioIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.primary.main,
      },
      S: {
        // Stars
        icon: <ImageIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.error.main,
      },
      L: {
        // Looks
        icon: <ImageIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.secondary.main,
      },
      M: {
        // Moves
        icon: <VideoIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.warning.main,
      },
      W: {
        // Worlds
        icon: <VideoIcon sx={{ fontSize: 48 }} />,
        color: theme.palette.success.main,
      },
    };

    return {
      icon: layerIcons[asset.layer]?.icon || (
        <DefaultFileIcon sx={{ fontSize: 48 }} />
      ),
      color: layerIcons[asset.layer]?.color || theme.palette.grey[500],
      previewUrl: null,
    };
  };

  const { icon, color, previewUrl } = getFileTypeInfo();

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get taxonomy path
  const getTaxonomyLabel = () => {
    return taxonomyService.getTaxonomyPath(
      asset?.layer,
      asset?.category,
      asset?.subcategory
    );
  };

  // Truncate description
  const truncateDescription = (text: string, maxLength: number) => {
    if (!text) return 'No description provided';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea 
        onClick={handleClick} 
        onDoubleClick={handleDoubleClick}
        sx={{ flexGrow: 1 }}
      >
        {/* Media section with smart thumbnail handling */}
        <Box
          sx={{
            height: 180,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.default',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Use AssetThumbnail component for smart video/image handling */}
          <AssetThumbnail 
            asset={asset} 
            width={180} 
            height={180} 
          />

          {/* Layer badge */}
          <Chip
            label={asset.layer}
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontWeight: 'bold',
            }}
          />
        </Box>

        {/* Content */}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {asset.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontSize: '0.75rem' }}
          >
            {getTaxonomyLabel()}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {truncateDescription(asset.description || '', 100)}
          </Typography>

          {/* Tags */}
          {asset.tags && asset.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {asset.tags.slice(0, 3).map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
              {asset.tags.length > 3 && (
                <Tooltip title={asset.tags.slice(3).join(', ')}>
                  <Chip
                    label={`+${asset.tags.length - 3}`}
                    size="small"
                    sx={{ fontSize: '0.7rem' }}
                  />
                </Tooltip>
              )}
            </Box>
          )}

          <Divider sx={{ my: 1 }} />

          <Typography variant="caption" color="text.secondary">
            Created: {formatDate(asset.createdAt)}
          </Typography>
        </CardContent>
      </CardActionArea>

      {/* Actions */}
      {showActions && (
        <CardActions>
          <Button
            size="small"
            component={Link}
            to={`/assets/${asset._id || asset.id}`} // Use MongoDB ID for URL routing
            endIcon={<LaunchIcon />}
            onClick={e => {
              // Prevent navigation if id is undefined or null
              if (!asset._id && !asset.id) {
                e.preventDefault();
                console.error(
                  'Asset ID is undefined, cannot navigate to details page',
                  asset
                );
                // Could add an error notification here
              } else {
                const assetId = asset._id || asset.id;
                console.log(`Navigating to asset details: ${assetId}`);
              }
            }}
          >
            View Details
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default AssetCard;
