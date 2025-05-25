import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Stack,
} from '@mui/material';

interface AuthTestHelperProps {
  onTokenSet?: (token: string) => void;
}

const AuthTestHelper: React.FC<AuthTestHelperProps> = ({ onTokenSet }) => {
  const [token, setToken] = useState(localStorage.getItem('testToken') || '');
  const [message, setMessage] = useState('');

  const handleSetToken = () => {
    if (token.trim()) {
      // Clean the token by removing all whitespace and newlines
      const cleanToken = token.replace(/\s+/g, '');
      localStorage.setItem('testToken', cleanToken);
      setMessage('Test token saved! You can now test with the real backend.');
      onTokenSet?.(cleanToken);
    } else {
      localStorage.removeItem('testToken');
      setMessage('Test token cleared. Using mock data fallback.');
      onTokenSet?.('');
    }
  };

  const handleClearToken = () => {
    setToken('');
    localStorage.removeItem('testToken');
    setMessage('Test token cleared. Using mock data fallback.');
    onTokenSet?.('');
  };

  const currentToken = localStorage.getItem('testToken');

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Backend Authentication Test Helper
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The backend at https://registry.reviz.dev requires authentication. 
        If you have a valid JWT token, enter it below to test with real data.
        Otherwise, the system will use mock data for testing.
      </Typography>
      
      {currentToken && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Current token: {currentToken.substring(0, 20)}...
        </Alert>
      )}
      
      <Stack spacing={2}>
        <TextField
          label="JWT Token (Bearer token for https://registry.reviz.dev)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          fullWidth
          size="small"
          multiline
          rows={3}
        />
        
        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={handleSetToken}>
            {token.trim() ? 'Set Token' : 'Clear Token'}
          </Button>
          {currentToken && (
            <Button variant="outlined" onClick={handleClearToken}>
              Clear Token
            </Button>
          )}
        </Box>
        
        {message && (
          <Alert severity={token.trim() ? 'success' : 'warning'}>
            {message}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};

export default AuthTestHelper;