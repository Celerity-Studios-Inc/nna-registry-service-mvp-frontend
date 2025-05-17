import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import { taxonomyService } from '../../api/taxonomyService';
import { Asset } from '../../types/asset.types';

interface AssetCardProps {
  asset: Asset;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    console.log('Navigating to asset details:', asset.id);
    navigate(`/asset/${asset.id}`);
  };

  const taxonomyPath = taxonomyService.getTaxonomyPath(asset.layer, asset.category, asset.subcategory);

  return (
    <Card
      onClick={handleNavigate}
      onDoubleClick={handleNavigate}
      sx={{ cursor: 'pointer', maxWidth: 345 }}
    >
      {asset.files && asset.files.length > 0 && asset.files[0].url ? (
        <CardMedia
          component="img"
          height="140"
          image={asset.files[0].url}
          alt={asset.name}
        />
      ) : (
        <Box sx={{ height: 140, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>No Preview Available</Typography>
        </Box>
      )}
      <CardContent>
        <Typography variant="h6">{asset.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {taxonomyPath}
        </Typography>
        <Button onClick={(e) => { e.stopPropagation(); handleNavigate(); }}>
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default AssetCard;