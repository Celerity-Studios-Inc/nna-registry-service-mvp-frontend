import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Badge, Tooltip, Button, Dialog
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, Search as SearchIcon, Add as AddIcon, Collections as CollectionsIcon,
  Notifications as NotificationsIcon, ChevronLeft as ChevronLeftIcon, Upload as UploadIcon, ViewList as ViewListIcon,
  Category as CategoryIcon, DataObject as DataObjectIcon, Settings as SettingsIcon, Api as ApiIcon,
  Logout as LogoutIcon, Login as LoginIcon, BugReport as BugReportIcon
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import ErrorTestComponent from '../common/ErrorTestComponent';

const drawerWidth = 240;

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Browse Assets', icon: <SearchIcon />, path: '/search-assets' },
  { text: 'Register Asset', icon: <AddIcon />, path: '/register-asset' },
  { text: 'Batch Upload', icon: <UploadIcon />, path: '/batch-upload' },
  { text: 'Organize Assets', icon: <ViewListIcon />, path: '/organize-assets' },
  { text: 'Collections', icon: <CollectionsIcon />, path: '/collections' },
  { text: 'Taxonomy Browser', icon: <CategoryIcon />, path: '/taxonomy' },
  { text: 'Taxonomy Validator', icon: <CategoryIcon />, path: '/taxonomy-validator' },
  { text: 'Asset Analytics', icon: <DataObjectIcon />, path: '/asset-analytics' },
];

const MainLayout: React.FC = () => {
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
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
        <Typography variant="h6" noWrap component="div">
          NNA Registry
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
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
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={openErrorTestDialog}>
            <ListItemIcon><BugReportIcon /></ListItemIcon>
            <ListItemText primary="Error Test" secondary="Test error handling" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><ApiIcon /></ListItemIcon>
            <ListItemText primary="API Configuration" secondary="Using Real API" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            NNA Registry Service
          </Typography>
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={3} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
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