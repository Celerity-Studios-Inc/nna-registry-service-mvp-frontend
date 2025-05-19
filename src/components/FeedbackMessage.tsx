import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

interface FeedbackMessageProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number; // Duration in milliseconds, defaults to 3000
  onClose?: () => void;
}

/**
 * Enhanced component to display feedback messages to the user
 * Uses Material UI components for better visual integration
 */
const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose && onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setVisible(false);
    onClose && onClose();
  };

  if (!visible) return null;

  // Get the appropriate icon based on feedback type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon fontSize="small" />;
      case 'error':
        return <ErrorIcon fontSize="small" />;
      case 'warning':
        return <WarningIcon fontSize="small" />;
      case 'info':
        return <InfoIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Get the title based on feedback type
  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return '';
    }
  };

  return (
    <Snackbar
      open={visible}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      className="feedback-snackbar"
    >
      <Alert
        severity={type}
        variant="filled"
        icon={getIcon()}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          mb: 2,
        }}
      >
        <AlertTitle>{getTitle()}</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default FeedbackMessage;
