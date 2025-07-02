import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Badge,
  Tooltip,
  Button,
  Dialog,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Collections as CollectionsIcon,
  Notifications as NotificationsIcon,
  ChevronLeft as ChevronLeftIcon,
  Upload as UploadIcon,
  ViewList as ViewListIcon,
  Category as CategoryIcon,
  DataObject as DataObjectIcon,
  Settings as SettingsIcon,
  Api as ApiIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  BugReport as BugReportIcon,
  ErrorOutline as ErrorOutlineIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import ErrorTestComponent from '../common/ErrorTestComponent';
import { detectEnvironment } from '../../utils/environment.config';
import TaxonomySyncStatus from '../common/TaxonomySyncStatus';

const drawerWidth = 240;

// Environment detection using comprehensive detection logic
const getCurrentEnvironment = () => {
  return detectEnvironment();
};

// Version from package.json
const APP_VERSION = process.env.REACT_APP_VERSION || '1.1.6';

// Define navigation items with improved organization and grouping
const navigationItems = [
  // Core Features - Always visible
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', group: 'core' },
  { text: 'Browse Assets', icon: <SearchIcon />, path: '/search-assets', group: 'core' },
  { text: 'Register Asset', icon: <AddIcon />, path: '/register-asset', group: 'core' },
  
  // Asset Management - Primary functions
  { text: 'Collections', icon: <CollectionsIcon />, path: '/collections', group: 'management' },
  
  // Tools and Utilities - Secondary functions
  { text: 'Taxonomy Browser', icon: <CategoryIcon />, path: '/taxonomy', group: 'tools' },
];

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [errorTestOpen, setErrorTestOpen] = useState(false);
  const authContext = useContext(AuthContext);

  const handleLogout = () => {
    if (authContext) {
      authContext.logout();
      navigate('/login');
    } else {
      // Fallback if context not available
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const openErrorTestDialog = () => {
    setErrorTestOpen(true);
  };

  const closeErrorTestDialog = () => {
    setErrorTestOpen(false);
  };

  const drawer = (
    <div>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
        }}
      >
        <Typography variant="h6" noWrap component="div">
          NNA Registry
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      {/* Primary navigation items */}
      <List>
        {navigationItems
          .filter(item => item.group === 'core')
          .map(item => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (mobileOpen) handleDrawerToggle();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      
      {/* Asset Management Section */}
      <Divider textAlign="left" sx={{ mt: 1, mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontSize: '0.7rem', fontWeight: 500 }}>
          ASSET MANAGEMENT
        </Typography>
      </Divider>
      <List>
        {navigationItems
          .filter(item => item.group === 'management')
          .map(item => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (mobileOpen) handleDrawerToggle();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      
      {/* Tools and Utilities Section */}
      <Divider textAlign="left" sx={{ mt: 1, mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontSize: '0.7rem', fontWeight: 500 }}>
          TOOLS
        </Typography>
      </Divider>
      <List>
        {navigationItems
          .filter(item => item.group === 'tools')
          .map(item => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (mobileOpen) handleDrawerToggle();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      
      <Divider sx={{ mt: 'auto' }} />
      <Divider textAlign="left" sx={{ mt: 1, mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontSize: '0.7rem', fontWeight: 500 }}>
          SYSTEM
        </Typography>
      </Divider>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Title with environment chip and version */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div" sx={{ mr: 2 }}>
              NNA Registry Service
            </Typography>
            <Chip
              label={getCurrentEnvironment().toUpperCase()}
              size="small"
              color={getCurrentEnvironment() === 'production' ? 'success' : 
                     getCurrentEnvironment() === 'staging' ? 'warning' : 'info'}
              sx={{ mr: 1.5 }}
            />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Release {APP_VERSION}
            </Typography>
          </Box>

          {/* Taxonomy Sync Status */}
          <Box sx={{ mr: 2 }}>
            <TaxonomySyncStatus compact showRefreshButton={false} />
          </Box>

          {/* Right-aligned user info */}
          {authContext?.user && (
            <Typography 
              variant="body2" 
              sx={{ 
                mr: 2,
                opacity: 0.9, 
                fontSize: '0.9rem',
                fontWeight: 400 
              }}
            >
              • {authContext.user.username || authContext.user.email || 'User'}
            </Typography>
          )}

          {/* Add Login/Logout button */}
          {authContext?.isAuthenticated ? (
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          ) : (
            <Button
              color="inherit"
              onClick={handleLogin}
              startIcon={<LoginIcon />}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>

      {/* Error Test Dialog that can be opened from the nav sidebar */}
      <ErrorTestComponent
        isDialog={true}
        open={errorTestOpen}
        onClose={closeErrorTestDialog}
      />
    </Box>
  );
};

export default MainLayout;
