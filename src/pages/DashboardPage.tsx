import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, Button, Box, Card, CardContent, CardActions, CardHeader, Divider, Avatar, Chip, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Add as AddIcon, Search as SearchIcon, Category as CategoryIcon, Edit as EditIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';

const mockUser = { username: 'ajaymadhok' };
const mockIncompleteAssets = [
  { id: '1', name: 'S.POP.BAS.001.png', description: 'Olivia as a Base Pop Star', type: 'training_data', createdAt: '2025-05-06' },
  { id: '2', name: 'G.POP.BAS.002.mp3', description: 'Pop Base Track', type: 'rights_data', createdAt: '2025-05-05' },
];
const mockStats = { registered: 30, myAssets: 12, pending: 5 };
const mockRecentAssets = [
  { id: '1', name: 'S.POP.BAS.001.png', layer: 'S', createdAt: '2025-05-06' },
  { id: '2', name: 'G.POP.BAS.002.mp3', layer: 'G', createdAt: '2025-05-05' },
  { id: '3', name: 'L.POP.BAS.001.png', layer: 'L', createdAt: '2025-05-03' },
];

const DashboardPage: React.FC = () => {
  const [incompleteAssets, setIncompleteAssets] = useState<any[]>([]);
  useEffect(() => { setIncompleteAssets(mockIncompleteAssets); }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Welcome back, {mockUser.username}!
      </Typography>

      {/* Quick Actions */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button component={RouterLink} to="/register-asset" variant="contained" color="primary" startIcon={<AddIcon />} fullWidth size="large" sx={{ py: 1.5 }}>
              Register Asset
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button component={RouterLink} to="/search-assets" variant="outlined" startIcon={<SearchIcon />} fullWidth size="large" sx={{ py: 1.5 }}>
              Search Assets
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button component={RouterLink} to="/taxonomy" variant="outlined" startIcon={<CategoryIcon />} fullWidth size="large" sx={{ py: 1.5 }}>
              Taxonomy
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Incomplete Assets */}
      {incompleteAssets.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">Incomplete Assets</Typography>
            <Chip label={`${incompleteAssets.length} pending`} color="warning" />
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {incompleteAssets.map((asset) => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.2s' } }}>
                  <CardHeader
                    avatar={<Avatar sx={{ bgcolor: asset.type === 'training_data' ? 'secondary.main' : 'primary.main' }}>{asset.name.charAt(0)}</Avatar>}
                    action={<IconButton><MoreVertIcon /></IconButton>}
                    title={asset.name}
                    subheader={`Needs ${asset.type === 'training_data' ? 'training data' : 'rights data'}`}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" paragraph>{asset.description}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">Created {asset.createdAt}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" startIcon={<EditIcon />} component={RouterLink} to={`/register-asset?edit=${asset.id}`}>Complete</Button>
                    <Button size="small">View Details</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>Overview</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent><Typography color="text.secondary" gutterBottom>Registered Assets</Typography><Typography variant="h5">{mockStats.registered}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent><Typography color="text.secondary" gutterBottom>My Assets</Typography><Typography variant="h5">{mockStats.myAssets}</Typography></CardContent></Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card><CardContent><Typography color="text.secondary" gutterBottom>Pending Review</Typography><Typography variant="h5">{mockStats.pending}</Typography></CardContent></Card>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Assets */}
      <Box>
        <Typography variant="h6" gutterBottom>Recent Assets</Typography>
        <Grid container spacing={2}>
          {mockRecentAssets.map((asset) => (
            <Grid item key={asset.id} xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1">{asset.name}</Typography>
                <Typography variant="body2">Layer: {asset.layer}</Typography>
                <Typography variant="caption">Created: {asset.createdAt}</Typography>
                <Box sx={{ mt: 1 }}>
                  <Button size="small" startIcon={<EditIcon />} component={RouterLink} to={`/register-asset?edit=${asset.id}`}>Curate</Button>
                  <Button size="small">View</Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default DashboardPage; 