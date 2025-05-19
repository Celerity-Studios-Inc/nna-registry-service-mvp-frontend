import React, { useEffect } from 'react';
import './App.css';
import './styles/ErrorHandling.css';
import './styles/TaxonomyExample.css';
import './styles/Feedback.css';
import './styles/ErrorBoundary.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  StyledEngineProvider,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterAssetPage from './pages/RegisterAssetPage';
import SearchAssetsPage from './pages/SearchAssetsPage';
import AssetDetailPage from './pages/AssetDetailPage';
import DashboardPage from './pages/DashboardPage';
import ApiDebugPage from './pages/ApiDebugPage';
import ConnectivityHelp from './pages/ConnectivityHelp';
import ErrorTestPage from './pages/ErrorTestPage';
import TaxonomyDebugPage from './pages/TaxonomyDebugPage';
import TaxonomyTestPage from './pages/TaxonomyTestPage';
import TaxonomySelectorTestPage from './pages/TaxonomySelectorTestPage';
import TaxonomyDebugger from './components/debug/TaxonomyDebugger';
import './styles/TaxonomyDebugger.css';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { FeedbackProvider } from './contexts/FeedbackContext';
import FeedbackDisplay from './components/feedback/FeedbackDisplay';
import ErrorBoundary from './components/error/ErrorBoundary';
import GlobalErrorHandler from './components/common/GlobalErrorHandler';
import TestComponent from './components/common/TestComponent';
import ApiRouteAlert from './components/common/ApiRouteAlert';
import TaxonomyValidator from './components/TaxonomyValidator';
import AssetRegistrationWrapper from './components/AssetRegistrationWrapper';
import TaxonomyInitProvider from './components/providers/TaxonomyInitProvider';
import TaxonomyExample from './components/examples/TaxonomyExample';

// Force initialization of the flattened taxonomy service is now handled by TaxonomyInitProvider
import { taxonomyService } from './services/simpleTaxonomyService';
import { logger, LogLevel, LogCategory } from './utils/logger';
import LogViewer from './components/debug/LogViewer';
import './styles/LogViewer.css';

// Import new taxonomy error recovery utilities
import { setupGlobalTaxonomyErrorHandler } from './utils/taxonomyErrorRecovery';

// Log the import of taxonomy service, but let the TaxonomyInitProvider handle initialization
logger.taxonomy(LogLevel.INFO, 'Taxonomy service imported in App.tsx');

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
    
    // Initialize the global taxonomy error handler
    console.log('[APP] Setting up global taxonomy error handler');
    setupGlobalTaxonomyErrorHandler();
  }, []);

  return (
    <ErrorBoundary>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorProvider>
            <GlobalErrorHandler />
            <ApiRouteAlert /> {/* Add alert for API routing issues */}
            <FeedbackProvider>
              <NotificationsProvider>
                <AuthProvider>
                  <TaxonomyInitProvider
                    fallback={
                      <div className="taxonomy-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading taxonomy data...</p>
                      </div>
                    }
                  >
                    <Router>
                      <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/api-test" element={<TestComponent />} />
                        <Route path="/api-debug" element={<ApiDebugPage />} />
                        <Route path="/debug" element={<ApiDebugPage />} />
                        <Route path="/connect" element={<ConnectivityHelp />} />
                        <Route path="/help" element={<ConnectivityHelp />} />
                        <Route path="/error-test" element={<ErrorTestPage />} />
                        <Route
                          path="/taxonomy-validator"
                          element={<TaxonomyValidator />}
                        />
                        <Route
                          path="/taxonomy-debug"
                          element={<TaxonomyDebugPage />}
                        />
                        <Route
                          path="/taxonomy-example"
                          element={<TaxonomyExample />}
                        />
                        <Route
                          path="/taxonomy-test"
                          element={<TaxonomyTestPage />}
                        />
                        <Route
                          path="/taxonomy-selector-test"
                          element={<TaxonomySelectorTestPage />}
                        />
                        <Route element={<MainLayout />}>
                          <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute>
                                <DashboardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/register-asset"
                            element={
                              <ProtectedRoute>
                                <AssetRegistrationWrapper />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/search-assets"
                            element={
                              <ProtectedRoute>
                                <SearchAssetsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/assets/:id"
                            element={
                              <ProtectedRoute>
                                <AssetDetailPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/" element={<RootRedirect />} />
                        </Route>
                      </Routes>
                    </Router>
                    <FeedbackDisplay />
                  </TaxonomyInitProvider>
                </AuthProvider>
              </NotificationsProvider>
            </FeedbackProvider>
          </ErrorProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </ErrorBoundary>
  );
};

export default App;
