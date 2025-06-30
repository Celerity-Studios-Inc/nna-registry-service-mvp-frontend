# Step-by-Step Frontend Implementation Guide for NNA Registry Service for collaboration with Claude Code

This comprehensive guide will walk you through implementing a React-based frontend for the NNA Registry Service. This frontend will provide an intuitive interface for creators to register, search, and manage assets using the NNA Framework's layered taxonomy system.

## 1. Project Setup

### 1.1 Create a React Application

```bash
# Create a new React application using create-react-app
npx create-react-app nna-registry-frontend --template typescript
cd nna-registry-frontend

# Install necessary dependencies
npm install react-router-dom @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install axios react-hook-form @hookform/resolvers yup
npm install jwt-decode notistack
npm install @mui/lab @mui/x-data-grid

# Optional: Install development dependencies
npm install -D @types/react-router-dom @types/jwt-decode
```

### 1.2 Folder Structure

Create the following folder structure:

```
src/
├── api/               # API service functions
├── assets/            # Static assets (images, icons)
├── components/        # Reusable UI components
│   ├── common/        # Shared components (buttons, inputs)
│   ├── layout/        # Layout components (header, sidebar)
│   ├── asset/         # Asset-related components
│   └── auth/          # Authentication components
├── config/            # Configuration files
├── contexts/          # React context providers
├── hooks/             # Custom React hooks
├── pages/             # Page components
│   ├── assets/        # Asset management pages
│   ├── auth/          # Authentication pages
│   └── dashboard/     # Dashboard pages
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

### 1.3 Configure Environment Variables

Create `.env` and `.env.example` files in the root:

```
# .env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_NAME=NNA Registry Service

# .env.example (same content but without sensitive values)
REACT_APP_API_URL=http://localhost:3001
REACT_APP_NAME=NNA Registry Service
```

## 2. Authentication Implementation

### 2.1 Define Authentication Types (src/types/auth.ts)

```typescript
export interface User {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
  };
  metadata: {
    timestamp: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: User;
  metadata: {
    timestamp: string;
  };
}
```

### 2.2 Create Authentication API Service (src/api/authService.ts)

```typescript
import axios from 'axios';
import { LoginRequest, RegisterRequest, AuthResponse, ProfileResponse } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {
  // Register a new user
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login a user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Store token in localStorage
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>('/auth/profile');
    return response.data;
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return localStorage.getItem('token') !== null;
  }
};

export default api;
```

### 2.3 Create Authentication Context (src/contexts/AuthContext.tsx)

```typescript
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import jwt_decode from 'jwt-decode';
import { User } from '../types/auth';
import { authService } from '../api/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isAdmin: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check for token and load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Parse JWT to get basic user info
          const decoded = jwt_decode<User>(token);
          
          // Validate with backend
          const profileResponse = await authService.getProfile();
          if (profileResponse.success) {
            setUser(profileResponse.data);
          } else {
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.data.token) {
        // Get user profile after successful login
        const profileResponse = await authService.getProfile();
        if (profileResponse.success) {
          setUser(profileResponse.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.register({ email, password });
      
      if (response.success && response.data.token) {
        // Get user profile after successful registration
        const profileResponse = await authService.getProfile();
        if (profileResponse.success) {
          setUser(profileResponse.data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => React.useContext(AuthContext);
```

### 2.4 Create Login Page (src/pages/auth/LoginPage.tsx)

```typescript
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../contexts/AuthContext';

// Form validation schema
const schema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

type FormInputs = {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      setError('Invalid credentials. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ margin: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            fullWidth
            id="password"
            label="Password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          <Grid container>
            <Grid item>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
```

### 2.5 Create Register Page (src/pages/auth/RegisterPage.tsx)

```typescript
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useAuth } from '../../contexts/AuthContext';

// Form validation schema
const schema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required')
    .matches(/@celerity\.studio$/, 'Email must be from @celerity.studio domain'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type FormInputs = {
  email: string;
  password: string;
};

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    setError(null);
    try {
      await registerUser(data.email, data.password);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response && error.response.data) {
        setError(error.response.data.error?.message || 'Registration failed. Please try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ margin: 1, bgcolor: 'secondary.main' }}>
          <PersonAddIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            fullWidth
            id="password"
            label="Password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
```

## 3. Asset Types and Services

### 3.1 Define Asset Types (src/types/asset.ts)

```typescript
// Base Asset Type
export interface Asset {
  _id: string;
  layer: string;
  category: string;
  subcategory: string;
  name: string;
  nna_address: string;
  gcpStorageUrl: string;
  source: string;
  tags: string[];
  description: string;
  trainingData?: {
    prompts: string[];
    images: string[];
    videos: string[];
  };
  rights?: {
    source: string;
    rights_split: string;
  };
  components?: string[];
  createdAt: string;
  updatedAt: string;
}

// Asset Creation Request
export interface CreateAssetDto {
  layer: string;
  category: string;
  subcategory: string;
  source: string;
  tags: string[];
  description: string;
  trainingData?: {
    prompts: string[];
    images: string[];
    videos: string[];
  };
  rights?: {
    source: string;
    rights_split: string;
  };
  components?: string[];
}

// Asset Update Request
export interface UpdateAssetDto {
  layer?: string;
  category?: string;
  subcategory?: string;
  source?: string;
  tags?: string[];
  description?: string;
  trainingData?: {
    prompts: string[];
    images: string[];
    videos: string[];
  };
  rights?: {
    source: string;
    rights_split: string;
  };
  components?: string[];
}

// Asset Search Parameters
export interface SearchAssetParams {
  search?: string;
  layer?: string;
  category?: string;
  subcategory?: string;
  page?: number;
  limit?: number;
}

// Asset API Responses
export interface AssetResponse {
  success: boolean;
  data: Asset;
  metadata: {
    timestamp: string;
  };
}

export interface AssetsResponse {
  success: boolean;
  data: Asset[];
  metadata: {
    timestamp: string;
    pagination: {
      totalAssets: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

// Layer Metadata
export interface LayerInfo {
  code: string;
  name: string;
}

export interface Category {
  code: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  code: string;
  name: string;
}

export interface TaxonomyData {
  layers: LayerInfo[];
  categories: { [layerCode: string]: Category[] };
}
```

### 3.2 Create Asset API Service (src/api/assetService.ts)

```typescript
import api from './authService';
import {
  Asset,
  CreateAssetDto,
  UpdateAssetDto,
  SearchAssetParams,
  AssetResponse,
  AssetsResponse,
} from '../types/asset';

export const assetService = {
  // Create a new asset
  createAsset: async (data: CreateAssetDto, file: File): Promise<AssetResponse> => {
    const formData = new FormData();
    
    // Append file
    formData.append('file', file);
    
    // Append asset data as JSON strings
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'tags' && Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    const response = await api.post<AssetResponse>('/assets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get assets with search/filter
  getAssets: async (params: SearchAssetParams): Promise<AssetsResponse> => {
    const response = await api.get<AssetsResponse>('/assets', { params });
    return response.data;
  },

  // Get a single asset by name
  getAssetByName: async (name: string): Promise<AssetResponse> => {
    const response = await api.get<AssetResponse>(`/assets/${name}`);
    return response.data;
  },

  // Update an asset
  updateAsset: async (name: string, data: UpdateAssetDto): Promise<AssetResponse> => {
    const response = await api.put<AssetResponse>(`/assets/${name}`, data);
    return response.data;
  },

  // Delete an asset (admin only)
  deleteAsset: async (name: string): Promise<void> => {
    await api.delete(`/assets/${name}`);
  },

  // Curate an asset (admin only)
  curateAsset: async (name: string): Promise<AssetResponse> => {
    const response = await api.post<AssetResponse>(`/assets/curate/${name}`);
    return response.data;
  },
  
  // Get image URL for display (with caching for performance)
  getAssetImageUrl: (asset: Asset): string => {
    // Return the GCP Storage URL
    return asset.gcpStorageUrl;
  }
};
```

### 3.3 Create Taxonomy Service (src/api/taxonomyService.ts)

```typescript
import { TaxonomyData } from '../types/asset';

// Load taxonomy data from file (in production this would come from an API)
import taxonomyData from '../assets/enriched_nna_layer_taxonomy_v1.2.json';

export const taxonomyService = {
  // Get all layer information
  getLayers: () => {
    const layers = Object.keys(taxonomyData).filter(key => 
      typeof taxonomyData[key] === 'object' && 
      taxonomyData[key].name && 
      taxonomyData[key].categories
    );
    
    return layers.map(code => ({
      code,
      name: taxonomyData[code].name
    }));
  },
  
  // Get all categories for a layer
  getCategories: (layerCode: string) => {
    if (!taxonomyData[layerCode] || !taxonomyData[layerCode].categories) {
      return [];
    }
    
    const categories = taxonomyData[layerCode].categories;
    return Object.keys(categories).map(code => ({
      code,
      name: categories[code].name,
      subcategories: Object.keys(categories[code].subcategories).map(subCode => ({
        code: subCode,
        name: categories[code].subcategories[subCode].name
      }))
    }));
  },
  
  // Get all subcategories for a category
  getSubcategories: (layerCode: string, categoryCode: string) => {
    if (!taxonomyData[layerCode] || 
        !taxonomyData[layerCode].categories || 
        !taxonomyData[layerCode].categories[categoryCode] ||
        !taxonomyData[layerCode].categories[categoryCode].subcategories) {
      return [];
    }
    
    const subcategories = taxonomyData[layerCode].categories[categoryCode].subcategories;
    return Object.keys(subcategories).map(code => ({
      code,
      name: subcategories[code].name
    }));
  },
  
  // Get the full taxonomy data
  getTaxonomyData: (): TaxonomyData => {
    const layers = taxonomyService.getLayers();
    
    const categories = {};
    layers.forEach(layer => {
      categories[layer.code] = taxonomyService.getCategories(layer.code);
    });
    
    return {
      layers,
      categories
    };
  }
};
```

## 4. Layout and Navigation

### 4.1 Create Protected Route Component (src/components/common/ProtectedRoute.tsx)

```typescript
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if admin access is required
  if (requireAdmin && !isAdmin) {
    // Redirect to dashboard if user is not an admin
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
```

### 

I'll continue from where we left off on the frontend implementation guide, completing section 4.2 and the subsequent sections. Let me provide you with a comprehensive step-by-step guide that you can use with Claude Code to build the React frontend for the NNA Registry Service.

### 4.2 Create App Layout (src/components/layout/AppLayout.tsx) (continued)

```typescript
import React, { useState } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Container,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const AppLayout: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    navigate('/profile');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Register Asset', icon: <AddIcon />, path: '/assets/register' },
    { text: 'Search Assets', icon: <SearchIcon />, path: '/assets/search' },
    { text: 'My Assets', icon: <AssignmentIcon />, path: '/assets/my-assets' },
    { text: 'Browse Taxonomy', icon: <CategoryIcon />, path: '/taxonomy' }
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { text: 'Admin Panel', icon: <AdminPanelSettingsIcon />, path: '/admin' }
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: (theme) =>
              theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="toggle drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            NNA Registry Service
          </Typography>
          
          {/* User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={user?.email || 'User'}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Avatar>
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleProfile}>
                <ListItemIcon>
                  <Avatar sx={{ width: 24, height: 24 }}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Avatar>
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          ...(open && {
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              overflowX: 'hidden',
            },
          }),
          ...(!open && {
            '& .MuiDrawer-paper': {
              transition: (theme) =>
                theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              overflowX: 'hidden',
              width: (theme) => theme.spacing(7),
              [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
              },
            },
          }),
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 8px',
            minHeight: 64,
          }}
        >
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              disablePadding
              sx={{ display: 'block' }}
              component={RouterLink}
              to={item.path}
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        {isAdmin && (
          <List>
            {adminMenuItems.map((item) => (
              <ListItem
                key={item.text}
                disablePadding
                sx={{ display: 'block' }}
                component={RouterLink}
                to={item.path}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: `${open ? drawerWidth : 0}px` },
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar /> {/* This adds spacing at the top to accommodate the AppBar */}
        <Container maxWidth="lg">
          <Outlet /> {/* Renders the current route's element */}
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
```

### 4.3 Create Routes Configuration (src/App.tsx)

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Main Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';

// Asset Pages
import RegisterAssetPage from './pages/assets/RegisterAssetPage';
import SearchAssetsPage from './pages/assets/SearchAssetsPage';
import MyAssetsPage from './pages/assets/MyAssetsPage';
import AssetDetailsPage from './pages/assets/AssetDetailsPage';

// Admin Pages
import AdminPanelPage from './pages/admin/AdminPanelPage';

// Taxonomy Page
import TaxonomyBrowserPage from './pages/taxonomy/TaxonomyBrowserPage';

function App() {
  return (
    <SnackbarProvider 
      maxSnack={3} 
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/assets/register" element={<RegisterAssetPage />} />
                <Route path="/assets/search" element={<SearchAssetsPage />} />
                <Route path="/assets/my-assets" element={<MyAssetsPage />} />
                <Route path="/assets/:assetName" element={<AssetDetailsPage />} />
                <Route path="/taxonomy" element={<TaxonomyBrowserPage />} />
              </Route>
            </Route>
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute requireAdmin={true} />}>
              <Route element={<AppLayout />}>
                <Route path="/admin" element={<AdminPanelPage />} />
              </Route>
            </Route>
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </SnackbarProvider>
  );
}

export default App;
```

## 5. Dashboard and Profile Pages

### 5.1 Create Dashboard Page (src/pages/dashboard/DashboardPage.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import { assetService } from '../../api/assetService';
import { useAuth } from '../../contexts/AuthContext';
import { Asset } from '../../types/asset';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentAssets = async () => {
      try {
        setLoading(true);
        const response = await assetService.getAssets({ page: 1, limit: 6 });
        if (response.success) {
          setRecentAssets(response.data);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
        setError('Failed to load recent assets');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentAssets();
  }, []);

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 4,
          pb: 6,
        }}
      >
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12}>
            <Typography
              component="h1"
              variant="h4"
              align="center"
              color="primary.main"
              gutterBottom
            >
              Welcome to the NNA Registry Service
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" paragraph>
              Manage digital assets for ReViz's AI-powered video remixing platform with the NNA Framework
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Action Buttons */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
            }}
          >
            <AddIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Register Asset
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Add new assets to the registry
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/assets/register"
            >
              Register New
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
            }}
          >
            <SearchIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Search Assets
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Find assets in the registry
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/assets/search"
            >
              Search
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
            }}
          >
            <CategoryIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Browse Taxonomy
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Explore the NNA taxonomy structure
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/taxonomy"
            >
              Browse
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Assets */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Recent Assets
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" my={4}>
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {recentAssets.length > 0 ? (
            recentAssets.map((asset) => (
              <Grid item key={asset._id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: '0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 },
                  }}
                  component={RouterLink}
                  to={`/assets/${asset.name}`}
                  style={{ textDecoration: 'none' }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={assetService.getAssetImageUrl(asset)}
                    alt={asset.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" noWrap>
                      {asset.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {asset.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={`Layer: ${asset.layer}`}
                        size="small"
                        color="primary"
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={`${asset.category} / ${asset.subcategory}`}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Box width="100%" textAlign="center" my={4}>
              <Typography variant="body1" color="textSecondary">
                No assets found. Start by registering some assets!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/assets/register"
                sx={{ mt: 2 }}
              >
                Register Asset
              </Button>
            </Box>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default DashboardPage;
```

### 5.2 Create Profile Page (src/pages/profile/ProfilePage.tsx)

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Grid,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';

// Form validation schema for password change
const schema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

type PasswordFormInputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: PasswordFormInputs) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Simulate password change API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      reset();
      
      // Show success message
      setSuccess('Password updated successfully');
      enqueueSnackbar('Password updated successfully', { variant: 'success' });
    } catch (error: any) {
      console.error('Password change error:', error);
      setError(error.message || 'Failed to update password');
      enqueueSnackbar('Failed to update password', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
              >
                {user.email.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.email}
              </Typography>
              <Typography color="textSecondary">
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                margin="normal"
                fullWidth
                label="Current Password"
                type="password"
                id="currentPassword"
                {...register('currentPassword')}
                error={!!errors.currentPassword}
                helperText={errors.currentPassword?.message}
              />
              <TextField
                margin="normal"
                fullWidth
                label="New Password"
                type="password"
                id="newPassword"
                {...register('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Change Password'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
```

## 6. Asset Registration Implementation

### 6.1 Create Asset Registration Steps Components

First, let's create a shared component for the step control:

### 6.1.1 Create StepControl Component (src/components/asset/StepControl.tsx)

```typescript
import React from 'react';
import { Button, Box, Paper, Typography, Step, StepLabel, Stepper } from '@mui/material';

interface StepControlProps {
  activeStep: number;
  steps: string[];
  isLastStep: boolean;
  isNextDisabled: boolean;
  handleBack: () => void;
  handleNext: () => void;
  handleFinish?: () => void;
}

const StepControl: React.FC<StepControlProps> = ({
  activeStep,
  steps,
  isLastStep,
  isNextDisabled,
  handleBack,
  handleNext,
  handleFinish,
}) => {
  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="subtitle1" sx={{ my: 'auto' }}>
          Step {activeStep + 1} of {steps.length}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={isLastStep ? (handleFinish || handleNext) : handleNext}
          disabled={isNextDisabled}
        >
          {isLastStep ? 'Finish' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default StepControl;
```

Now, let's create components for each step in the asset registration process:

## 6.1.2 Create Layer Selection Component (src/components/asset/LayerSelection.tsx) (continued)

```typescript
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Divider,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TerrainIcon from '@mui/icons-material/Terrain';
import PaletteIcon from '@mui/icons-material/Palette';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import FaceIcon from '@mui/icons-material/Face';
import { taxonomyService } from '../../api/taxonomyService';
import { LayerInfo } from '../../types/asset';

interface LayerSelectionProps {
  selectedLayer: string;
  onChange: (layer: string) => void;
}

// Layer icons mapping
const layerIcons: Record<string, React.ReactElement> = {
  G: <MusicNoteIcon fontSize="large" />,
  S: <PersonIcon fontSize="large" />,
  L: <CheckroomIcon fontSize="large" />,
  M: <DirectionsRunIcon fontSize="large" />,
  W: <TerrainIcon fontSize="large" />,
  V: <PaletteIcon fontSize="large" />,
  B: <ShoppingBagIcon fontSize="large" />,
  P: <FaceIcon fontSize="large" />,
};

// Layer descriptions
const layerDescriptions: Record<string, string> = {
  G: 'Music tracks and audio files for remixing',
  S: 'Performance avatars and characters',
  L: 'Costumes, styling, and accessories',
  M: 'Choreography, dance moves, and animations',
  W: 'Environments, stages, and backgrounds',
  V: 'Visual effects, moods, and atmospheric elements',
  B: 'Branded content for marketing and collaborations',
  P: 'User personalization for customized content',
};

const LayerSelection: React.FC<LayerSelectionProps> = ({ selectedLayer, onChange }) => {
  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLayers = () => {
      try {
        // Get layers from the taxonomy service
        const layersData = taxonomyService.getLayers();
        setLayers(layersData);
      } catch (error) {
        console.error('Error fetching layers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLayers();
  }, []);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Asset Layer
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Choose the primary classification for your asset. Each layer represents a different type of content in the NNA Framework.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {layers.map((layer) => (
          <Grid item xs={12} sm={6} md={4} key={layer.code}>
            <Card 
              elevation={selectedLayer === layer.code ? 4 : 1}
              sx={{
                border: selectedLayer === layer.code ? '2px solid' : '1px solid',
                borderColor: selectedLayer === layer.code ? 'primary.main' : 'divider',
                transition: 'all 0.3s ease',
                height: '100%',
              }}
            >
              <CardActionArea 
                onClick={() => onChange(layer.code)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: selectedLayer === layer.code ? 'primary.main' : 'primary.light',
                      width: 60, 
                      height: 60,
                      mb: 2,
                    }}
                  >
                    {layerIcons[layer.code] || layer.code.charAt(0)}
                  </Avatar>
                  <Typography variant="h6" component="div" gutterBottom align="center">
                    {layer.name} ({layer.code})
                  </Typography>
                  <Typography variant="body2" color="textSecondary" align="center">
                    {layerDescriptions[layer.code] || `${layer.name} assets for the NNA Framework`}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LayerSelection;
```

### 6.1.3 Create Taxonomy Selection Component (src/components/asset/TaxonomySelection.tsx)

```typescript
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  FormHelperText,
  Alert,
  CircularProgress,
} from '@mui/material';
import { taxonomyService } from '../../api/taxonomyService';
import { Category, Subcategory } from '../../types/asset';

interface TaxonomySelectionProps {
  layer: string;
  selectedCategory: string;
  selectedSubcategory: string;
  onCategoryChange: (category: string) => void;
  onSubcategoryChange: (subcategory: string) => void;
}

const TaxonomySelection: React.FC<TaxonomySelectionProps> = ({
  layer,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories when layer changes
  useEffect(() => {
    const fetchCategories = () => {
      try {
        if (!layer) return;

        setLoading(true);
        setError(null);
        const categoriesData = taxonomyService.getCategories(layer);
        setCategories(categoriesData);

        // Clear selected category and subcategory when layer changes
        if (selectedCategory) {
          onCategoryChange('');
        }
        if (selectedSubcategory) {
          onSubcategoryChange('');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories for this layer');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [layer, onCategoryChange, onSubcategoryChange]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubcategories = () => {
      try {
        if (!layer || !selectedCategory) {
          setSubcategories([]);
          return;
        }

        setLoading(true);
        setError(null);
        
        // Find the selected category object
        const categoryObj = categories.find(cat => cat.code === selectedCategory);
        
        if (categoryObj && categoryObj.subcategories) {
          // Use subcategories directly from the category object
          setSubcategories(categoryObj.subcategories);
        } else {
          // Fallback to fetch subcategories
          const subcategoriesData = taxonomyService.getSubcategories(layer, selectedCategory);
          setSubcategories(subcategoriesData);
        }

        // Clear selected subcategory when category changes
        if (selectedSubcategory) {
          onSubcategoryChange('');
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setError('Failed to load subcategories for this category');
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [layer, selectedCategory, categories, onSubcategoryChange]);

  if (!layer) {
    return (
      <Alert severity="info">
        Please select a layer first to view categories and subcategories.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Category and Subcategory
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Choose the appropriate category and subcategory for your {layer} asset.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                id="category-select"
                value={selectedCategory}
                label="Category"
                onChange={(e) => onCategoryChange(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.code} value={category.code}>
                    {category.name} ({category.code})
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select a category for this {layer} asset
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!selectedCategory}>
              <InputLabel id="subcategory-select-label">Subcategory</InputLabel>
              <Select
                labelId="subcategory-select-label"
                id="subcategory-select"
                value={selectedSubcategory}
                label="Subcategory"
                onChange={(e) => onSubcategoryChange(e.target.value)}
              >
                {subcategories.map((subcategory) => (
                  <MenuItem key={subcategory.code} value={subcategory.code}>
                    {subcategory.name} ({subcategory.code})
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {selectedCategory
                  ? 'Select a subcategory for this asset'
                  : 'Please select a category first'}
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default TaxonomySelection;
```

### 6.1.4 Create Metadata Form Component (src/components/asset/MetadataForm.tsx)

```typescript
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
} from '@mui/material';

// Layer-specific metadata fields
const layerSpecificFields: Record<string, React.ReactNode> = {
  M: (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel id="movement-speed-label">Movement Speed</InputLabel>
          <Controller
            name="movementSpeed"
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <>
                <Select
                  labelId="movement-speed-label"
                  id="movement-speed"
                  label="Movement Speed"
                  {...field}
                >
                  <MenuItem value="Slow">Slow</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Fast">Fast</MenuItem>
                </Select>
                {error && <FormHelperText error>{error.message}</FormHelperText>}
              </>
            )}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel id="energy-level-label">Energy Level</InputLabel>
          <Controller
            name="energyLevel"
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <>
                <Select
                  labelId="energy-level-label"
                  id="energy-level"
                  label="Energy Level"
                  {...field}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
                {error && <FormHelperText error>{error.message}</FormHelperText>}
              </>
            )}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="culturalOrigin"
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <TextField
              id="cultural-origin"
              label="Cultural Origin"
              fullWidth
              {...field}
              error={!!error}
              helperText={error ? error.message : "Origin of the dance movement (e.g., 'African', 'Indian')"}
            />
          )}
        />
      </Grid>
    </Grid>
  ),
  G: (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel id="genre-label">Genre</InputLabel>
          <Controller
            name="genre"
            defaultValue=""
            render={({ field, fieldState: { error } }) => (
              <>
                <Select
                  labelId="genre-label"
                  id="genre"
                  label="Genre"
                  {...field}
                >
                  <MenuItem value="Pop">Pop</MenuItem>
                  <MenuItem value="Rock">Rock</MenuItem>
                  <MenuItem value="Hip-Hop">Hip-Hop</MenuItem>
                  <MenuItem value="Electronic">Electronic</MenuItem>
                  <MenuItem value="Jazz">Jazz</MenuItem>
                  <MenuItem value="Classical">Classical</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {error && <FormHelperText error>{error.message}</FormHelperText>}
              </>
            )}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          name="duration"
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <TextField
              id="duration"
              label="Duration (seconds)"
              type="number"
              fullWidth
              {...field}
              error={!!error}
              helperText={error ? error.message : "Length of the audio in seconds"}
            />
          )}
        />
      </Grid>
    </Grid>
  ),
};

interface MetadataFormProps {
  layer: string;
}

const MetadataForm: React.FC<MetadataFormProps> = ({ layer }) => {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Asset Details
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Provide detailed information about your asset to improve discoverability and usage.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Common fields for all layers */}
        <Grid item xs={12}>
          <Controller
            name="description"
            control={control}
            defaultValue=""
            rules={{ required: 'Description is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                id="description"
                label="Description"
                placeholder="Enter a detailed description of the asset"
                fullWidth
                multiline
                rows={3}
                {...field}
                error={!!error}
                helperText={error ? error.message : 'A clear description helps users find your asset'}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="source-label">Source</InputLabel>
            <Controller
              name="source"
              control={control}
              defaultValue=""
              rules={{ required: 'Source is required' }}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Select
                    labelId="source-label"
                    id="source"
                    label="Source"
                    {...field}
                    error={!!error}
                  >
                    <MenuItem value="ReViz">ReViz</MenuItem>
                    <MenuItem value="User">User</MenuItem>
                    <MenuItem value="Brand">Brand</MenuItem>
                  </Select>
                  {error && <FormHelperText error>{error.message}</FormHelperText>}
                </>
              )}
            />
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="tags"
            control={control}
            defaultValue={[]}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                multiple
                id="tags-input"
                options={[]}
                freeSolo
                value={value}
                onChange={(_, newValue) => onChange(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags"
                    helperText="Press Enter to add tags"
                  />
                )}
              />
            )}
          />
        </Grid>

        {/* Layer-specific fields */}
        {layer && layerSpecificFields[layer] && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              {layer}-Specific Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {layerSpecificFields[layer]}
          </Grid>
        )}
        
        {/* Training Data Fields */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Training Data (Optional)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="textSecondary" paragraph>
            Add information about training data used for this asset, if applicable.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="trainingData.prompts"
                control={control}
                defaultValue={[]}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    multiple
                    id="prompts-input"
                    options={[]}
                    freeSolo
                    value={value || []}
                    onChange={(_, newValue) => onChange(newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Prompts"
                        placeholder="Add AI prompts used"
                        helperText="Press Enter to add prompts"
                      />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        
        {/* Rights Information */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Rights Information (Optional)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Controller
                name="rights.source"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    id="rights-source"
                    label="Rights Source"
                    fullWidth
                    {...field}
                    helperText="Source of the rights (e.g., 'Original Creator', 'Licensed')"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="rights.rights_split"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    id="rights-split"
                    label="Rights Split"
                    fullWidth
                    {...field}
                    helperText="How rights are split (e.g., 'IP Holders: 25%, ReViz: 25%, Remixer: 50%')"
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MetadataForm;
```

### 6.1.5 Create File Upload Component (src/components/asset/FileUpload.tsx)

```typescript
import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

interface FileUploadProps {
  label: string;
  description: string;
  acceptedFileTypes: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  description,
  acceptedFileTypes,
  file,
  onFileChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFile(selectedFile);
    }
  };

  const handleFile = (selectedFile: File) => {
    // Check if file type is acceptable
    if (!acceptedFileTypes.includes(selectedFile.type.split('/')[0])) {
      alert(`Please upload a ${acceptedFileTypes} file.`);
      return;
    }

    onFileChange(selectedFile);

    // Create preview for image files
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine file type icon
  const getFileIcon = () => {
    if (!file) return null;
    
    if (file.type.startsWith('audio/')) {
      return <AudiotrackIcon sx={{ fontSize: 80, color: 'primary.main' }} />;
    } else if (file.type.startsWith('video/')) {
      return <VideoLibraryIcon sx={{ fontSize: 80, color: 'primary.main' }} />;
    } else if (!file.type.startsWith('image/')) {
      return <DescriptionIcon sx={{ fontSize: 80, color: 'primary.main' }} />;
    }
    
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {description}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {!file ? (
        <Paper
          elevation={isDragging ? 4 : 1}
          sx={{
            p: 4,
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'divider',
            backgroundColor: isDragging ? 'action.hover' : 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClickUpload}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            accept={acceptedFileTypes.split(',').map(type => `${type}/*`).join(',')}
          />
          <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            Drag & Drop file here or click to browse
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Accepted file types: {acceptedFileTypes}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <Box sx={{ display: 'flex', p: 2 }}>
                {preview ? (
                  <CardMedia
                    component="img"
                    sx={{ width: 120, height: 120, objectFit: 'cover' }}
                    image={preview}
                    alt="File preview"
                  />
                ) : (
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'action.hover',
                    }}
                  >
                    {getFileIcon()}
                  </Box>
                )}
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography variant="subtitle1" component="div">
                    {file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    {file.type || 'Unknown file type'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <IconButton 
                      aria-label="delete" 
                      onClick={handleRemoveFile}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Typography variant="caption" color="text.secondary">
                      Remove file
                    </Typography>
                  </Box>
                </CardContent>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default FileUpload;
```

### 6.1.6 Create Review and Submit Component (src/components/asset/ReviewSubmit.tsx)

```typescript
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';

interface ReviewSubmitProps {
  formData: any;
  file: File | null;
  onEdit: (step: number) => void;
  loading: boolean;
}

const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
  formData,
  file,
  onEdit,
  loading,
}) => {
  const getFilePreview = () => {
    if (!file) return null;

    if (file.type.startsWith('image/')) {
      return (
        <CardMedia
          component="img"
          sx={{ height: 140, objectFit: 'cover' }}
          image={URL.createObjectURL(file)}
          alt="File preview"
        />
      );
    } else if (file.type.startsWith('audio/')) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140, bgcolor: 'action.hover' }}>
          <AudiotrackIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>
      );
    } else if (file.type.startsWith('video/')) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140, bgcolor: 'action.hover' }}>
          <VideoLibraryIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 140, bgcolor: 'action.hover' }}>
          <DescriptionIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>
      );
    }
  };

  const getTaxonomyInfo = () => {
    const { layer, category, subcategory } = formData;
    if (!layer || !category || !subcategory) return null;

    const nextSequential = formData.nextSequential || '???';
    const tempAssetId = `${layer}.${category}.${subcategory}.${nextSequential}`;

    return (
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">Taxonomy</Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Layer" secondary={`${layer} (${formData.layerName || layer})`} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Category" secondary={`${category} (${formData.categoryName || category})`} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Subcategory" secondary={`${subcategory} (${formData.subcategoryName || subcategory})`} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Temporary Asset ID" secondary={tempAssetId} />
          </ListItem>
        </List>
        <Button
          startIcon={<EditIcon />}
          size="small"
          onClick={() => onEdit(0)}
          sx={{ mt: 1 }}
        >
          Edit Taxonomy
        </Button>
      </Box>
    );
  };

  const getAssetDetails = () => {
    return (
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">Asset Details</Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Description" secondary={formData.description || 'Not provided'} />
          </ListItem>
          <ListItem>
            <ListItemText primary="Source" secondary={formData.source || 'Not provided'} />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Tags" 
              secondary={
                formData.tags && formData.tags.length > 0 ? (
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                    {formData.tags.map((tag: string, index: number) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                ) : 'No tags provided'
              } 
            />
          </ListItem>
        </List>
        <Button
          startIcon={<EditIcon />}
          size="small"
          onClick={() => onEdit(1)}
          sx={{ mt: 1 }}
        >
          Edit Details
        </Button>
      </Box>
    );
  };

  const getTrainingData = () => {
    if (!formData.trainingData) return null;

    return (
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">Training Data</Typography>
        <List dense>
          {formData.trainingData.prompts && formData.trainingData.prompts.length > 0 && (
            <ListItem>
              <ListItemText 
                primary={`Prompts (${formData.trainingData.prompts.length})`} 
                secondary={formData.trainingData.prompts.join(', ')} 
              />
            </ListItem>
          )}
          {formData.trainingData.images && formData.trainingData.images.length > 0 && (
            <ListItem>
              <ListItemText primary={`Images (${formData.trainingData.images.length})`} />
            </ListItem>
          )}
          {formData.trainingData.videos && formData.trainingData.videos.length > 0 && (
            <ListItem>
              <ListItemText primary={`Videos (${formData.trainingData.videos.length})`} />
            </ListItem>
          )}
        </List>
        <Button
          startIcon={<EditIcon />}
          size="small"
          onClick={() => onEdit(2)}
          sx={{ mt: 1 }}
        >
          Edit Training Data
        </Button>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review and Submit
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review all the asset information before submission.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {getTaxonomyInfo()}
          <Divider sx={{ my: 2 }} />
          {getAssetDetails()}
          <Divider sx={{ my: 2 }} />
          {getTrainingData()}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Asset Preview
          </Typography>
          <Card>
            {getFilePreview()}
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {file ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)` : 'No file uploaded'}
              </Typography>
              <Button
                startIcon={<EditIcon />}
                size="small"
                onClick={() => onEdit(2)}
                sx={{ mt: 1 }}
              >
                Change File
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          disabled={loading}
          type="submit"
          sx={{ minWidth: 120 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Register Asset'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewSubmit;
```

## 6.1.7 Create Confirmation Component (src/components/asset/RegistrationSuccess.tsx)

```typescript
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Link,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface RegistrationSuccessProps {
  asset: any;
  onRegisterAnother: () => void;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  asset,
  onRegisterAnother,
}) => {
  return (
    <Box textAlign="center" py={3}>
      <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Registration Complete
      </Typography>
      <Typography variant="body1" paragraph>
        The asset has been successfully registered!
      </Typography>

      <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 3, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Asset Information
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Human-Friendly Name" 
              secondary={asset.name} 
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="NNA Address" 
              secondary={asset.nna_address} 
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItem>
          <Divider sx={{ my: 1 }} />
          <ListItem>
            <ListItemText 
              primary="Layer" 
              secondary={`${asset.layer}`} 
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Category" 
              secondary={`${asset.category}`} 
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Subcategory" 
              secondary={`${asset.subcategory}`} 
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItem>
          <Divider sx={{ my: 1 }} />
          <ListItem>
            <ListItemText 
              primary="File Storage URL" 
              secondary={
                <Link href={asset.gcpStorageUrl} target="_blank" rel="noopener">
                  {asset.gcpStorageUrl}
                </Link>
              } 
              primaryTypographyProps={{ fontWeight: 'medium' }}
            />
          </ListItem>
        </List>
      </Paper>

      <Box display="flex" justifyContent="center" gap={2}>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={onRegisterAnother}
        >
          Register Another Asset
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          href={`/assets/${asset.name}`}
        >
          View Asset Details
        </Button>
      </Box>
    </Box>
  );
};

export default RegistrationSuccess;
```

## 6.2 Implement Asset Registration Page (src/pages/AssetRegistrationPage.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import TaxonomySelection from '../components/asset/TaxonomySelection';
import AssetDetails from '../components/asset/AssetDetails';
import AssetUpload from '../components/asset/AssetUpload';
import ReviewSubmit from '../components/asset/ReviewSubmit';
import RegistrationSuccess from '../components/asset/RegistrationSuccess';
import { registerAsset, getTaxonomyData } from '../services/assetService';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Taxonomy Selection', 'Asset Details', 'Asset Upload', 'Review & Submit'];

const AssetRegistrationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [taxonomyData, setTaxonomyData] = useState(null);
  const [formData, setFormData] = useState({
    layer: '',
    category: '',
    subcategory: '',
    source: 'ReViz',
    tags: [],
    description: '',
    trainingData: {
      prompts: [],
      images: [],
      videos: [],
    },
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredAsset, setRegisteredAsset] = useState(null);

  useEffect(() => {
    const fetchTaxonomyData = async () => {
      try {
        const data = await getTaxonomyData();
        setTaxonomyData(data);
      } catch (err) {
        console.error('Error fetching taxonomy data:', err);
        setError('Failed to load taxonomy data. Please try again later.');
      }
    };

    fetchTaxonomyData();
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleEditStep = (step: number) => {
    setActiveStep(step);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please upload an asset file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('layer', formData.layer);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('source', formData.source);
      formDataToSend.append('description', formData.description);
      
      // Add tags as array
      if (formData.tags && formData.tags.length > 0) {
        formDataToSend.append('tags', JSON.stringify(formData.tags));
      }
      
      // Add training data if provided
      if (
        formData.trainingData &&
        (formData.trainingData.prompts.length > 0 ||
          formData.trainingData.images.length > 0 ||
          formData.trainingData.videos.length > 0)
      ) {
        formDataToSend.append('trainingData', JSON.stringify(formData.trainingData));
      }
      
      // Add the file
      formDataToSend.append('file', file);

      const response = await registerAsset(formDataToSend);
      setRegisteredAsset(response.data);
      handleNext();
    } catch (err: any) {
      console.error('Error registering asset:', err);
      setError(err.response?.data?.error?.message || 'Failed to register asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAnother = () => {
    setActiveStep(0);
    setFormData({
      layer: '',
      category: '',
      subcategory: '',
      source: 'ReViz',
      tags: [],
      description: '',
      trainingData: {
        prompts: [],
        images: [],
        videos: [],
      },
    });
    setFile(null);
    setError(null);
    setRegisteredAsset(null);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <TaxonomySelection
            formData={formData}
            onChange={handleFormChange}
            taxonomyData={taxonomyData}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <AssetDetails
            formData={formData}
            onChange={handleFormChange}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <AssetUpload
            formData={formData}
            onChange={handleFormChange}
            onFileChange={setFile}
            selectedFile={file}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <ReviewSubmit
            formData={formData}
            file={file}
            onEdit={handleEditStep}
            loading={loading}
          />
        );
      case 4:
        return (
          <RegistrationSuccess
            asset={registeredAsset}
            onRegisterAnother={handleRegisterAnother}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Register New Asset
        </Typography>
        <Typography variant="body1" paragraph align="center" color="text.secondary">
          Register a new digital asset in the NNA Framework with proper taxonomy classification.
        </Typography>

        {activeStep < steps.length && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {getStepContent(activeStep)}
        </form>
      </Paper>
    </Container>
  );
};

export default AssetRegistrationPage;
```

## 6.3 Create Asset Search Component (src/components/search/AssetSearch.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Pagination,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getTaxonomyData, searchAssets } from '../../services/assetService';
import AssetCard from './AssetCard';

const AssetSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taxonomyData, setTaxonomyData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  
  const [searchParams, setSearchParams] = useState({
    search: '',
    layer: '',
    category: '',
    subcategory: '',
    page: 1,
    limit: 12,
  });
  
  const [searchResults, setSearchResults] = useState<any>({
    assets: [],
    totalAssets: 0,
    totalPages: 0,
    currentPage: 1,
  });

  useEffect(() => {
    const fetchTaxonomyData = async () => {
      try {
        const data = await getTaxonomyData();
        setTaxonomyData(data);
      } catch (err) {
        console.error('Error fetching taxonomy data:', err);
        setError('Failed to load taxonomy data. Please try again later.');
      }
    };

    fetchTaxonomyData();
  }, []);

  useEffect(() => {
    if (taxonomyData && searchParams.layer) {
      const layerData = taxonomyData[searchParams.layer];
      if (layerData) {
        const categoryList = Object.entries(layerData.categories).map(([code, data]: [string, any]) => ({
          code,
          name: data.name,
        }));
        setCategories(categoryList);
      } else {
        setCategories([]);
      }
    } else {
      setCategories([]);
    }
    
    setSearchParams(prev => ({
      ...prev,
      category: '',
      subcategory: '',
    }));
  }, [taxonomyData, searchParams.layer]);

  useEffect(() => {
    if (taxonomyData && searchParams.layer && searchParams.category) {
      const layerData = taxonomyData[searchParams.layer];
      if (layerData) {
        const categoryData = Object.values(layerData.categories).find(
          (cat: any) => cat.name === searchParams.category
        );
        
        if (categoryData) {
          const subcategoryList = Object.entries(categoryData.subcategories).map(([code, data]: [string, any]) => ({
            code,
            name: data.name,
          }));
          setSubcategories(subcategoryList);
        } else {
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
    
    setSearchParams(prev => ({
      ...prev,
      subcategory: '',
    }));
  }, [taxonomyData, searchParams.layer, searchParams.category]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await searchAssets(searchParams);
      setSearchResults(response);
    } catch (err: any) {
      console.error('Error searching assets:', err);
      setError(err.response?.data?.error?.message || 'Failed to search assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [searchParams.page, searchParams.limit]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => ({
      ...prev,
      page: 1, // Reset to first page on new search
    }));
    performSearch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setSearchParams(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setSearchParams(prev => ({
      ...prev,
      page,
    }));
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <TextField
                name="search"
                label="Search Assets"
                variant="outlined"
                fullWidth
                value={searchParams.search}
                onChange={handleInputChange}
                placeholder="Search by name, description, tags..."
              />
            </Grid>
            
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth>
                <InputLabel id="layer-select-label">Layer</InputLabel>
                <Select
                  labelId="layer-select-label"
                  id="layer-select"
                  name="layer"
                  value={searchParams.layer}
                  label="Layer"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">All Layers</MenuItem>
                  {taxonomyData && Object.entries(taxonomyData).map(([key, value]: [string, any]) => (
                    key !== 'scalability_features' && (
                      <MenuItem key={key} value={key}>
                        {key} - {value.name}
                      </MenuItem>
                    )
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth disabled={!searchParams.layer}>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  name="category"
                  value={searchParams.category}
                  label="Category"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.code} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4} md={2}>
              <FormControl fullWidth disabled={!searchParams.category}>
                <InputLabel id="subcategory-select-label">Subcategory</InputLabel>
                <Select
                  labelId="subcategory-select-label"
                  id="subcategory-select"
                  name="subcategory"
                  value={searchParams.subcategory}
                  label="Subcategory"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">All Subcategories</MenuItem>
                  {subcategories.map((subcategory) => (
                    <MenuItem key={subcategory.code} value={subcategory.name}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={12} md={2}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                size="large"
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : searchResults.assets.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary">
            No assets found matching your criteria.
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Try adjusting your search parameters or clearing filters.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {searchResults.assets.map((asset: any) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={asset._id}>
                <AssetCard asset={asset} />
              </Grid>
            ))}
          </Grid>
          
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={searchResults.totalPages}
              page={searchResults.currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
          
          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {searchResults.assets.length} of {searchResults.totalAssets} assets
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AssetSearch;
```

## 6.4 Create Asset Card Component (src/components/search/AssetCard.tsx)

```typescript
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton,
  Link,
} from '@mui/material';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface AssetCardProps {
  asset: any;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const getAssetTypeIcon = () => {
    const url = asset.gcpStorageUrl.toLowerCase();
    
    if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
      return <AudiotrackIcon fontSize="large" />;
    } else if (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi')) {
      return <VideoLibraryIcon fontSize="large" />;
    } else {
      return <DescriptionIcon fontSize="large" />;
    }
  };

  const getAssetMediaSection = () => {
    const url = asset.gcpStorageUrl.toLowerCase();
    
    if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif')) {
      return (
        <CardMedia
          component="img"
          height="140"
          image={asset.gcpStorageUrl}
          alt={asset.name}
        />
      );
    } else if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
      return (
        <Box
          sx={{
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
          }}
        >
          <AudiotrackIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>
      );
    } else if (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi')) {
      return (
        <Box
          sx={{
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
          }}
        >
          <VideoLibraryIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>
      );
    } else {
      return (
        <Box
          sx={{
            height: 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
          }}
        >
          <DescriptionIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>
      );
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {getAssetMediaSection()}
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {asset.name}
          </Typography>
          <IconButton 
            component={RouterLink} 
            to={`/assets/${asset.name}`} 
            size="small"
            color="primary"
          >
            <OpenInNewIcon />
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph noWrap>
          {asset.description}
        </Typography>
        
        <Box display="flex" gap={0.5} mb={1}>
          <Chip
            label={asset.layer}
            size="small"
            color="primary"
            variant="outlined"
         />
         <Chip
           label={asset.category}
           size="small"
           color="secondary"
           variant="outlined"
         />
         <Chip
           label={asset.subcategory}
           size="small"
           color="default"
           variant="outlined"
         />
       </Box>
       
       <Box display="flex" flexWrap="wrap" gap={0.5}>
         {asset.tags && asset.tags.slice(0, 3).map((tag: string, index: number) => (
           <Chip key={index} label={tag} size="small" />
         ))}
         {asset.tags && asset.tags.length > 3 && (
           <Chip label={`+${asset.tags.length - 3}`} size="small" variant="outlined" />
         )}
       </Box>
     </CardContent>
   </Card>
 );
};

export default AssetCard;
```

## 6.5 Create Asset Search Page (src/pages/AssetSearchPage.tsx)

```typescript
import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import AssetSearch from '../components/search/AssetSearch';

const AssetSearchPage = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Asset Registry
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search, browse, and manage digital assets in the NNA Framework
        </Typography>
      </Box>
      
      <AssetSearch />
    </Container>
  );
};

export default AssetSearchPage;
```

## 6.6 Create Asset Detail Page (src/pages/AssetDetailPage.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Chip,
  Divider,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DescriptionIcon from '@mui/icons-material/Description';
import { getAssetByName, deleteAsset } from '../services/assetService';
import { useAuth } from '../contexts/AuthContext';

const AssetDetailPage = () => {
  const { assetName } = useParams<{ assetName: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!assetName) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await getAssetByName(assetName);
        setAsset(response.data);
      } catch (err: any) {
        console.error('Error fetching asset:', err);
        setError(err.response?.data?.error?.message || 'Failed to load asset details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [assetName]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!asset) return;
    
    try {
      setDeleteLoading(true);
      await deleteAsset(asset.name);
      setDeleteDialogOpen(false);
      navigate('/assets');
    } catch (err: any) {
      console.error('Error deleting asset:', err);
      setError(err.response?.data?.error?.message || 'Failed to delete asset.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getAssetMediaSection = () => {
    if (!asset) return null;
    
    const url = asset.gcpStorageUrl.toLowerCase();
    
    if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif')) {
      return (
        <Box sx={{ mb: 4 }}>
          <img 
            src={asset.gcpStorageUrl} 
            alt={asset.name}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '400px', 
              display: 'block',
              margin: '0 auto',
              borderRadius: '4px'
            }} 
          />
        </Box>
      );
    } else if (url.endsWith('.mp3') || url.endsWith('.wav') || url.endsWith('.ogg')) {
      return (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <AudiotrackIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <audio controls style={{ width: '100%', maxWidth: '500px' }}>
            <source src={asset.gcpStorageUrl} />
            Your browser does not support the audio element.
          </audio>
        </Box>
      );
    } else if (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi')) {
      return (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <video 
            controls 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '400px',
              borderRadius: '4px'
            }}
          >
            <source src={asset.gcpStorageUrl} />
            Your browser does not support the video element.
          </video>
        </Box>
      );
    } else {
      return (
        <Box 
          sx={{ 
            mb: 4, 
            height: '200px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            bgcolor: 'action.hover',
            borderRadius: '4px'
          }}
        >
          <DescriptionIcon sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>
      );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/assets')}
        >
          Back to Assets
        </Button>
      </Container>
    );
  }

  if (!asset) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Alert severity="warning">
          Asset not found
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/assets')}
          sx={{ mt: 2 }}
        >
          Back to Assets
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/assets')}
        >
          Back to Assets
        </Button>
        
        {user && user.role === 'admin' && (
          <Box>
            <Button
              startIcon={<EditIcon />}
              color="primary"
              sx={{ mr: 1 }}
              onClick={() => navigate(`/assets/${asset.name}/edit`)}
            >
              Edit
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              variant="outlined"
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>
      
      <Typography variant="h4" gutterBottom>
        {asset.name}
      </Typography>
      
      <Box display="flex" gap={1} mb={3}>
        <Chip label={`Layer: ${asset.layer}`} color="primary" />
        <Chip label={`Category: ${asset.category}`} color="secondary" />
        <Chip label={`Subcategory: ${asset.subcategory}`} />
      </Box>
      
      {getAssetMediaSection()}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Asset Information
            </Typography>
            
            <Typography variant="body1" paragraph>
              {asset.description}
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
              {asset.tags && asset.tags.length > 0 ? (
                asset.tags.map((tag: string, index: number) => (
                  <Chip key={index} label={tag} size="small" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No tags
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">
                  Human-Friendly Name
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {asset.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">
                  NNA Address
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {asset.nna_address}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">
                  Source
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {asset.source}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">
                  Registration Date
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(asset.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {asset.trainingData && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Training Data
              </Typography>
              
              {asset.trainingData.prompts && asset.trainingData.prompts.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Prompts
                  </Typography>
                  <List dense>
                    {asset.trainingData.prompts.map((prompt: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemText primary={prompt} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {asset.trainingData.images && asset.trainingData.images.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Training Images
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {asset.trainingData.images.length} images used for training
                  </Typography>
                </Box>
              )}
              
              {asset.trainingData.videos && asset.trainingData.videos.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Training Videos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {asset.trainingData.videos.length} videos used for training
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Asset Details
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                File URL
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                component="a" 
                href={asset.gcpStorageUrl} 
                target="_blank"
                sx={{ 
                  display: 'block', 
                  wordBreak: 'break-all',
                  textDecoration: 'none',
                  color: 'primary.main',
                  mb: 2
                }}
              >
                {asset.gcpStorageUrl}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Related Assets
              </Typography>
              {asset.components && asset.components.length > 0 ? (
                <List dense>
                  {asset.components.map((componentId: string, index: number) => (
                    <ListItem 
                      key={index} 
                      component="a" 
                      href={`/assets/${componentId}`}
                      sx={{ 
                        color: 'primary.main',
                        textDecoration: 'none'
                      }}
                    >
                      <ListItemText primary={componentId} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No related assets
                </Typography>
              )}
            </CardContent>
          </Card>
          
          {asset.rights && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Rights Information
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Source
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {asset.rights.source}
                </Typography>
                
                <Typography variant="subtitle2" gutterBottom>
                  Rights Split
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {asset.rights.rights_split}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Asset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the asset "{asset.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AssetDetailPage;
```

## 7. Authentication Flow

### 7.1 Create Login Page (src/pages/LoginPage.tsx)

```typescript
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access the NNA Registry Service
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
        </form>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register">
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
```

## 8. Application Integration

### 8.1 Update the Main App Component (src/App.tsx)

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AssetSearchPage from './pages/AssetSearchPage';
import AssetDetailPage from './pages/AssetDetailPage';
import AssetRegistrationPage from './pages/AssetRegistrationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#5c6bc0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="assets" element={<AssetSearchPage />} />
              <Route path="assets/:assetName" element={<AssetDetailPage />} />
              <Route 
                path="assets/register" 
                element={
                  <ProtectedRoute>
                    <AssetRegistrationPage />
                  </ProtectedRoute>
                } 
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
```

### 8.2 Create Main Layout (src/layouts/MainLayout.tsx)

```typescript
import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
          NNA Registry
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/">
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/assets">
            <ListItemIcon>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText primary="Browse Assets" />
          </ListItemButton>
        </ListItem>
        {user && (
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/assets/register">
              <ListItemIcon>
                <AddCircleOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="Register Asset" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            NNA Registry
          </Typography>
          
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button color="inherit" component={RouterLink} to="/">
              Home
            </Button>
            <Button color="inherit" component={RouterLink} to="/assets">
              Browse Assets
            </Button>
            {user && (
              <Button color="inherit" component={RouterLink} to="/assets/register">
                Register Asset
              </Button>
            )}
          </Box>
          
          {user ? (
            <Box>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleUserMenuOpen}
                color="inherit"
              >
                <AccountCircleIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2" noWrap>
                    {user.email}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box component="main">
        <Outlet />
      </Box>
    </>
  );
};

export default MainLayout;
```

### 8.3 Create Home Page (src/pages/HomePage.tsx)

```typescript
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CategoryIcon from '@mui/icons-material/Category';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" gutterBottom>
            NNA Registry Service
          </Typography>
          <Typography variant="h6" paragraph sx={{ maxWidth: '800px' }}>
            Manage digital assets in the ReViz platform with the Naming, Numbering, and Addressing (NNA) Framework
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/assets/register"
              startIcon={<AddCircleOutlineIcon />}
              sx={{ mr: 2, mb: 2 }}
              disabled={!user}
            >
              Register Asset
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              component={RouterLink}
              to="/assets"
              startIcon={<SearchIcon />}
              sx={{ mb: 2 }}
            >
              Browse Assets
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box mb={6}>
          <Typography variant="h4" gutterBottom>
            About NNA Framework
          </Typography>
          <Typography variant="body1" paragraph>
            The NNA Framework is a breakthrough system for managing digital assets in AI-powered video generation and remixing platforms. It provides a scalable, performant, and interoperable solution for asset management, rights tracking, and content creation.
          </Typography>
          <Typography variant="body1" paragraph>
            With support for multiple layers including Songs (G), Stars (S), Looks (L), Moves (M), Worlds (W), Vibes (V), Branded (B), and Personalize (P), the framework enables comprehensive organization and classification of digital assets.
          </Typography>
        </Box>

        <Grid container spacing={4} mb={6}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Asset Registration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Register new digital assets with proper taxonomy classification, upload files, and add metadata including training data.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  component={RouterLink}
                  to="/assets/register"
                  disabled={!user}
                >
                  Register Asset
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Asset Discovery
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search and browse digital assets using filters, full-text search, and taxonomy-based classification.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  component={RouterLink}
                  to="/assets"
                >
                  Browse Assets
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Taxonomy Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Explore the hierarchical taxonomy structure with layers, categories, and subcategories for consistent asset organization.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  component={RouterLink}
                  to="/assets"
                  startIcon={<CategoryIcon />}
                >
                  Explore Taxonomy
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={1} sx={{ p: 4, mb: 6, bgcolor: 'grey.50' }}>
          <Typography variant="h5" gutterBottom>
            Getting Started
          </Typography>
          <Typography variant="body1" paragraph>
            To start using the NNA Registry Service:
          </Typography>
          <ol>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Create an account</strong> to gain access to the asset registration and management features.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Browse existing assets</strong> to understand the taxonomy and classification system.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Register your first asset</strong> by selecting the appropriate layer, category, and subcategory, then uploading your file.
              </Typography>
            </li>
          </ol>
          {!user && (
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/login"
              >
                Login to Get Started
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
```

```typescript
                >
                  Register Asset
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Asset Discovery
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Search and browse digital assets using filters, full-text search, and taxonomy-based classification.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  component={RouterLink}
                  to="/assets"
                >
                  Browse Assets
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Taxonomy Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Explore the hierarchical taxonomy structure with layers, categories, and subcategories for consistent asset organization.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  component={RouterLink}
                  to="/assets"
                  startIcon={<CategoryIcon />}
                >
                  Explore Taxonomy
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={1} sx={{ p: 4, mb: 6, bgcolor: 'grey.50' }}>
          <Typography variant="h5" gutterBottom>
            Getting Started
          </Typography>
          <Typography variant="body1" paragraph>
            To start using the NNA Registry Service:
          </Typography>
          <ol>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Create an account</strong> to gain access to the asset registration and management features.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Browse existing assets</strong> to understand the taxonomy and classification system.
              </Typography>
            </li>
            <li>
              <Typography variant="body1" paragraph>
                <strong>Register your first asset</strong> by selecting the appropriate layer, category, and subcategory, then uploading your file.
              </Typography>
            </li>
          </ol>
          {!user && (
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/login"
              >
                Login to Get Started
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;
```

## 9. Final Steps

### 9.1 Create a ProtectedRoute Component (src/components/ProtectedRoute.tsx)

```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

### 9.2 Create a 404 Not Found Page (src/pages/NotFoundPage.tsx)

```typescript
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8, textAlign: 'center' }}>
      <ErrorOutlineIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h3" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" paragraph color="text.secondary">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/"
          size="large"
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
```

### 9.3 Create a Register Page (src/pages/RegisterPage.tsx)

```typescript
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            Sign Up
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create an account for the NNA Registry Service
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <TextField
            label="Confirm Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
        </form>

        <Box textAlign="center" mt={2}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
```

## 10. Building and Deploying

### 10.1 Add Build Configuration

Update the `package.json` file with the following scripts:

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject",
  "lint": "eslint src",
  "format": "prettier --write \"src/**/*.{ts,tsx}\""
}
```

### 10.2 Create a Production Build

Run the following command to create a production build:

```bash
npm run build
```

This will generate a `build` directory with optimized files ready for deployment.

### 10.3 Deployment Options

You can deploy the NNA Registry Service frontend to various platforms:

1. **Static Hosting (e.g., Netlify, Vercel)**:
    - Connect your GitHub repository
    - Configure build settings (build command: `npm run build`, publish directory: `build`)
    - Set environment variables as needed
1. **Traditional Hosting**:
    - Upload the contents of the `build` directory to your web server
1. **Google Cloud Storage**:
    - Create a bucket and configure it for static website hosting
    - Upload the contents of the `build` directory to the bucket
    - Configure CORS for API access

### 10.4 Environment Configuration

Create a `.env.production` file for production settings:

```
REACT_APP_API_URL=https://api.example.com
```

Make sure to replace `https://api.example.com` with your actual API URL.

## Conclusion

This comprehensive implementation plan provides all the code and steps needed to build the NNA Registry Service frontend using React and Material-UI. The application provides a user-friendly interface for asset registration, search, and management, with a focus on the taxonomy-based structure required by the NNA Framework.

The frontend communicates with the backend API for asset operations and authentication, providing a complete solution for managing digital assets in the ReViz platform. The responsive design ensures usability across devices, and the component structure allows for easy extension and maintenance.
