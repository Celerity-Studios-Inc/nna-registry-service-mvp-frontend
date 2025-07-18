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
import AssetCard from '../components/asset/AssetCard';
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
          <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 3 }}
          >
            {recentAssets.map(asset => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                xl={3}
                key={asset.id || asset._id}
                sx={{
                  display: 'flex',
                  '& > *': {
                    width: '100%'
                  }
                }}
              >
                <AssetCard asset={asset} />
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default DashboardPage;
