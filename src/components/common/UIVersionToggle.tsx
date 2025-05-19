import React, { useState, useEffect } from 'react';
import { Box, Switch, FormControlLabel, Tooltip, Typography, Paper } from '@mui/material';
import { 
  getUIVersion, 
  saveUIVersionPreference, 
  UIVersion 
} from '../../utils/featureToggle';

interface UIVersionToggleProps {
  // Optional props for custom styling or labels
  labelOld?: string;
  labelNew?: string;
}

/**
 * A component that allows users to toggle between old and new UI versions
 * Persists preference in localStorage and reflects URL parameters
 */
const UIVersionToggle: React.FC<UIVersionToggleProps> = ({
  labelOld = 'Classic UI',
  labelNew = 'New UI'
}) => {
  // Track current selection
  const [uiVersion, setUiVersion] = useState<UIVersion>(getUIVersion());
  
  // Update component state when URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setUiVersion(getUIVersion());
    };
    
    // Listen for URL changes
    window.addEventListener('popstate', handleUrlChange);
    
    // Check URL parameters on mount
    handleUrlChange();
    
    // Clean up listener
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);
  
  // Toggle between UI versions
  const handleToggle = () => {
    const newVersion: UIVersion = uiVersion === 'new' ? 'old' : 'new';
    setUiVersion(newVersion);
    saveUIVersionPreference(newVersion);
    
    // Update URL parameter without refreshing page
    const url = new URL(window.location.href);
    url.searchParams.set('uiVersion', newVersion);
    window.history.pushState({}, '', url.toString());
  };
  
  return (
    <Tooltip title="Toggle between the classic and new UI implementations">
      <div className="ui-version-toggle">
        <span className={`ui-version-toggle-label ${uiVersion === 'old' ? 'active' : 'inactive'}`}>
          {labelOld}
        </span>
        
        <Switch
          checked={uiVersion === 'new'}
          onChange={handleToggle}
          color="primary"
          size="small"
        />
        
        <span className={`ui-version-toggle-label ${uiVersion === 'new' ? 'active' : 'inactive'}`}>
          {labelNew}
          <span className="beta-badge">Beta</span>
        </span>
      </div>
    </Tooltip>
  );
};

export default UIVersionToggle;