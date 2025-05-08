import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterAssetPage from './pages/RegisterAssetPage';
import SearchAssetsPage from './pages/SearchAssetsPage';
import AssetDetailPage from './pages/AssetDetailPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import { NotificationsProvider } from './contexts/NotificationsContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue
    },
    secondary: {
      main: '#9c27b0', // Purple
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.8rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.3rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Create a protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check if user is authenticated
  const token = localStorage.getItem('accessToken');
  
  // If not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  // If authenticated, render children
  return <>{children}</>;
};

// Root redirect component
const RootRedirect = () => {
  const token = localStorage.getItem('accessToken');
  
  if (token) {
    return <Navigate to="/dashboard" />;
  } else {
    return <Navigate to="/login" />;
  }
};

const App: React.FC = () => {
  // On start, check if we have a valid token structure and clear if not
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    // If token doesn't exist or looks malformed, clear it
    if (token && token.length < 10) {
      localStorage.removeItem('accessToken');
    }
  }, []);

  return (
    <ErrorBoundary>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NotificationsProvider>
            <AuthProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/register-asset" element={
                      <ProtectedRoute>
                        <RegisterAssetPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/search-assets" element={
                      <ProtectedRoute>
                        <SearchAssetsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/assets/:id" element={
                      <ProtectedRoute>
                        <AssetDetailPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/" element={<RootRedirect />} />
                  </Route>
                </Routes>
              </Router>
            </AuthProvider>
          </NotificationsProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </ErrorBoundary>
  );
};

export default App;
