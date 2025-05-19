/**
 * LayerIcon Component
 *
 * A component that displays an icon for a layer, with fallback to a
 * generated icon if the actual icon is not available.
 */
import React, { useState, useEffect } from 'react';
import { getLayerIcon, getLayerName } from '../../utils/LayerIcons';
import '../../styles/LayerIcon.css';

interface LayerIconProps {
  layer: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showName?: boolean;
}

const LayerIcon: React.FC<LayerIconProps> = ({
  layer,
  size = 'medium',
  className = '',
  showName = false,
}) => {
  const [iconUrl, setIconUrl] = useState<string>('');
  const [iconLoaded, setIconLoaded] = useState<boolean>(false);
  const [iconError, setIconError] = useState<boolean>(false);

  useEffect(() => {
    // Reset state when layer changes
    setIconLoaded(false);
    setIconError(false);

    // Get the icon URL
    const url = getLayerIcon(layer);
    setIconUrl(url);
  }, [layer]);

  const handleIconLoad = () => {
    setIconLoaded(true);
    setIconError(false);
  };

  const handleIconError = () => {
    setIconLoaded(false);
    setIconError(true);
  };

  const layerName = getLayerName(layer);

  return (
    <div className={`layer-icon ${size} ${className}`}>
      <div className="layer-icon-image">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={`${layerName} icon`}
            onLoad={handleIconLoad}
            onError={handleIconError}
            className={iconLoaded ? 'loaded' : 'loading'}
          />
        ) : (
          <div className="layer-icon-fallback">{layer}</div>
        )}

        {!iconLoaded && !iconError && (
          <div className="layer-icon-loading">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {showName && <div className="layer-icon-name">{layerName}</div>}
    </div>
  );
};

export default LayerIcon;
