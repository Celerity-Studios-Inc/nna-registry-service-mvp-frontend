import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { SelectionStorage } from '../../utils/selectionStorage';

/**
 * Component props
 */
interface StorageOperationFeedbackProps {
  enableFeedback?: boolean;
}

/**
 * Feedback message state
 */
interface FeedbackState {
  open: boolean;
  message: string;
  severity: AlertColor;
  autoHideDuration: number;
}

/**
 * Component for providing user feedback on storage operations
 */
const StorageOperationFeedback: React.FC<StorageOperationFeedbackProps> = ({ 
  enableFeedback = true
}) => {
  // Message display state
  const [feedback, setFeedback] = useState<FeedbackState>({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 3000,
  });
  
  // Listen for storage events
  useEffect(() => {
    if (!enableFeedback) return;
    
    const handleStorageEvent = (eventType: string, formId: string, data?: any) => {
      let message = '';
      let severity: AlertColor = 'info';
      
      switch (eventType) {
        case SelectionStorage.EventType.SAVE:
          message = 'Your selections have been saved';
          severity = 'success';
          break;
          
        case SelectionStorage.EventType.RETRIEVE:
          message = 'Previously saved selections have been restored';
          severity = 'info';
          break;
          
        case SelectionStorage.EventType.UPDATE:
          message = 'Selections have been updated';
          severity = 'info';
          break;
          
        case SelectionStorage.EventType.CLEAR:
          if (data?.reason === 'stale') {
            message = 'Old selections have been cleared (data was stale)';
            severity = 'warning';
          } else {
            message = 'Selections have been cleared';
            severity = 'info';
          }
          break;
          
        default:
          return; // Don't show feedback for unknown events
      }
      
      setFeedback({
        open: true,
        message,
        severity,
        autoHideDuration: 3000,
      });
    };
    
    // Register our event handler
    SelectionStorage.registerEventHandler('StorageOperationFeedback', handleStorageEvent);
    
    // Cleanup on component unmount
    return () => {
      SelectionStorage.unregisterEventHandler('StorageOperationFeedback');
    };
  }, [enableFeedback]);
  
  // Handler for closing the snackbar
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    
    setFeedback(prev => ({
      ...prev,
      open: false,
    }));
  };
  
  // Don't render anything if feedback is disabled
  if (!enableFeedback) {
    return null;
  }
  
  return (
    <Snackbar
      open={feedback.open}
      autoHideDuration={feedback.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={feedback.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {feedback.message}
      </Alert>
    </Snackbar>
  );
};

export default StorageOperationFeedback;