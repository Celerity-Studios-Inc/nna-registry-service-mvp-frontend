import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state if available
  const from =
    (location.state as LocationState)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 450,
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            NNA Registry Service
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Log in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {process.env.NODE_ENV === 'development' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>Development Mode:</strong> Use test credentials - Email: ajay@testuser.com, Password: password123
              <br />
              <Button 
                size="small" 
                sx={{ mt: 1 }} 
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('testToken');
                  setError('');
                  window.location.reload();
                }}
              >
                Clear Cached Credentials
              </Button>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              placeholder="ajay@testuser.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              placeholder="password123"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
