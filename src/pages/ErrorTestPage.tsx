import React from 'react';
import { Container, Typography } from '@mui/material';
import ErrorTestComponent from '../components/common/ErrorTestComponent';

/**
 * Page that contains the error test component
 */
const ErrorTestPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Error Testing
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        This page provides tools to test the error handling system.
      </Typography>

      {/* Render the ErrorTestComponent in normal (non-dialog) mode */}
      <ErrorTestComponent />
    </Container>
  );
};

export default ErrorTestPage;
