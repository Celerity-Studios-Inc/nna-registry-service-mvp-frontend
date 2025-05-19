import React, { useEffect } from 'react';
import { useError } from '../../contexts/ErrorContext';
import { setGlobalErrorHandler } from '../../api/api';

/**
 * This component initializes the global error handler to connect
 * the API service with the ErrorContext. It should be mounted once
 * at the application root level.
 */
const GlobalErrorHandler: React.FC = () => {
  const { setError } = useError();

  useEffect(() => {
    // Set the global error handler to use our context
    setGlobalErrorHandler(setError);

    return () => {
      // Clean up by setting the handler to null when unmounted
      setGlobalErrorHandler(() => null);
    };
  }, [setError]);

  // This component doesn't render anything
  return null;
};

export default GlobalErrorHandler;
