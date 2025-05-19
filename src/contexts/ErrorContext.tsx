import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Snackbar, Alert, AlertTitle, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  ErrorSeverity,
  ErrorMessage,
  ErrorHandler,
} from '../types/error.types';

interface ErrorContextType {
  setError: ErrorHandler;
  clearError: () => void;
  currentError: ErrorMessage | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [errorState, setErrorState] = useState<ErrorMessage | null>(null);

  const setError = (
    messageInput: string | ErrorMessage,
    severity: ErrorSeverity = 'error'
  ) => {
    if (typeof messageInput === 'string') {
      setErrorState({
        message: messageInput,
        severity,
        autoHide: true,
      });
    } else {
      setErrorState({
        ...messageInput,
        autoHide: messageInput.autoHide !== false, // Default to true if not specified
      });
    }
  };

  const clearError = () => setErrorState(null);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    clearError();
  };

  return (
    <ErrorContext.Provider
      value={{ setError, clearError, currentError: errorState }}
    >
      {children}
      <Snackbar
        open={!!errorState}
        autoHideDuration={errorState?.autoHide ? 6000 : null}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={errorState?.severity || 'error'}
          sx={{
            width: '100%',
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
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
        >
          {errorState?.title && <AlertTitle>{errorState.title}</AlertTitle>}
          {errorState?.message}
        </Alert>
      </Snackbar>
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;
