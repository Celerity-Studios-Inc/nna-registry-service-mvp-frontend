import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  Button,
  Alert,
  Divider,
} from '@mui/material';

/**
 * Settings Page - User preferences and data filtering settings
 */
const SettingsPage: React.FC = () => {
  const [hideAssetsBeforeDate, setHideAssetsBeforeDate] = useState<string>('2025-05-15');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      const savedDate = localStorage.getItem('nna-hide-assets-before-date');
      const savedEnabled = localStorage.getItem('nna-hide-test-assets');
      
      if (savedDate) {
        setHideAssetsBeforeDate(savedDate);
      }
      
      if (savedEnabled !== null) {
        setIsEnabled(JSON.parse(savedEnabled));
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const handleSaveSettings = () => {
    try {
      localStorage.setItem('nna-hide-assets-before-date', hideAssetsBeforeDate);
      localStorage.setItem('nna-hide-test-assets', JSON.stringify(isEnabled));
      
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      
      // Trigger a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('nna-settings-changed', {
        detail: { hideAssetsBeforeDate, isEnabled }
      }));
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveMessage('Failed to save settings');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleToggleFilter = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Data Filtering
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Control which assets are displayed in search and browse results.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button
            variant={isEnabled ? "contained" : "outlined"}
            color={isEnabled ? "success" : "primary"}
            onClick={handleToggleFilter}
            sx={{ mb: 2 }}
          >
            {isEnabled ? '✅ Filter Active' : '❌ Filter Disabled'}
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            {isEnabled 
              ? 'Hiding assets registered before the specified date' 
              : 'Showing all assets regardless of registration date'
            }
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel sx={{ mb: 1 }}>
            Don't include assets registered before:
          </FormLabel>
          <TextField
            type="date"
            value={hideAssetsBeforeDate}
            onChange={(e) => setHideAssetsBeforeDate(e.target.value)}
            disabled={!isEnabled}
            helperText={
              isEnabled 
                ? `Assets created before ${new Date(hideAssetsBeforeDate).toLocaleDateString()} will be hidden from search results`
                : 'Enable filtering to set a cutoff date'
            }
            sx={{ maxWidth: 300 }}
          />
        </FormControl>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
          
          {saveMessage && (
            <Alert 
              severity={saveMessage.includes('success') ? 'success' : 'error'}
              sx={{ flex: 1 }}
            >
              {saveMessage}
            </Alert>
          )}
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          About Data Filtering
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          This setting helps provide a cleaner experience by hiding automated test data 
          and older assets that may not be relevant for daily use.
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          <strong>Recommended:</strong> Keep filtering enabled with the default date 
          (May 15, 2025) to hide automated test assets and focus on production content.
        </Typography>
      </Paper>
    </Box>
  );
};

export default SettingsPage;