import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import AssetSearch from '../../components/search/AssetSearch';
import { Asset } from '../../types/asset.types';
import { useNavigate } from 'react-router-dom';

const SearchAssetsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSelectAsset = (asset: Asset) => {
    navigate(`/assets/${asset.id}`);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <div>
            <Typography variant="h4" component="h1" gutterBottom>
              Asset Library
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Browse, search, and discover assets in the NNA Registry.
            </Typography>
          </div>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/register"
            sx={{
              [theme.breakpoints.down('sm')]: {
                display: 'none'
              }
            }}
          >
            Register Asset
          </Button>
        </Box>

        {/* Mobile register button */}
        <Box
          sx={{
            display: 'none',
            [theme.breakpoints.down('sm')]: {
              display: 'flex',
              mb: 2
            }
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/register"
            fullWidth
          >
            Register Asset
          </Button>
        </Box>
        
        {/* Search component */}
        <AssetSearch 
          onSelectAsset={handleSelectAsset}
          showFilters={true}
        />
      </Box>
    </Container>
  );
};

export default SearchAssetsPage;