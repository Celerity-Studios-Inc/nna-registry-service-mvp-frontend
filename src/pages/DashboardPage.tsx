import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Divider,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import BackendStatus from '../components/common/BackendStatus';
import assetService from '../api/assetService';
import AssetThumbnail from '../components/common/AssetThumbnail';
import { Asset } from '../types/asset.types';

const mockUser = { username: 'ajaymadhok' };

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [recentAssets, setRecentAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentAssets = async () => {
      try {
        setLoading(true);
        // Fetch recent assets from the API (limit to 6 for dashboard)
        const response = await assetService.getAssets({
          page: 1,
          limit: 6,
          sort: 'createdAt',
          order: 'desc'
        });
        
        if (response && response.data) {
          setRecentAssets(response.data);
        }
      } catch (err) {
        console.error('Error loading recent assets:', err);
        setError('Failed to load recent assets');
      } finally {
        setLoading(false);
      }
    };

    loadRecentAssets();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Welcome back, {mockUser.username}!
      </Typography>

      {/* Backend Status */}
      <BackendStatus />

      {/* Quick Actions */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/register-asset"
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Register Asset
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/search-assets"
              variant="outlined"
              startIcon={<SearchIcon />}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Search Assets
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              component={RouterLink}
              to="/taxonomy"
              variant="outlined"
              startIcon={<CategoryIcon />}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              Taxonomy
            </Button>
          </Grid>
          {/* Simplified Asset Registration button removed - incomplete functionality */}
        </Grid>
      </Paper>

      {/* Recent Assets - Default Dashboard View */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h2">
            Recent Assets
          </Typography>
          <Button
            component={RouterLink}
            to="/search-assets"
            variant="outlined"
            size="small"
          >
            View All Assets
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Box>
        ) : recentAssets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" gutterBottom>
              No assets found. Start by registering your first asset!
            </Typography>
            <Button
              component={RouterLink}
              to="/register-asset"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Register Asset
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {recentAssets.map(asset => (
              <Grid item xs={12} sm={6} md={4} key={asset.id || asset._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                  onClick={() => navigate(`/asset/${asset.id || asset._id}`)}
                >
                  {/* Asset Thumbnail */}
                  <Box sx={{ height: 160, overflow: 'hidden' }}>
                    <AssetThumbnail 
                      asset={asset} 
                      width={400} 
                      height={160}
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      noWrap
                      sx={{ fontSize: '1rem', fontWeight: 600 }}
                    >
                      {asset.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
                      <Chip 
                        label={asset.layer} 
                        size="small" 
                        color="primary"
                        sx={{ fontSize: '0.75rem' }}
                      />
                      <Chip 
                        label={asset.category || asset.categoryCode} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                    
                    {asset.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {asset.description}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ flexGrow: 1 }}
                    >
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </Typography>
                    <Button 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/asset/${asset.id || asset._id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default DashboardPage;
