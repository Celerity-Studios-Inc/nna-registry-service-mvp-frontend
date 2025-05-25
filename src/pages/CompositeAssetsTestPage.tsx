import React from 'react';
import { Box, Typography, Container, Paper, Chip, Alert } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import CompositeAssetSelection from '../components/CompositeAssetSelection';
import { Asset } from '../types/asset.types';

const CompositeAssetsTestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Get layer information from URL parameters
  const selectedLayer = searchParams.get('layer');
  const layerName = searchParams.get('layerName');
  
  // Layer information for display
  const layerInfo = {
    'B': { name: 'Branded', description: 'Brand assets, logos, and official marketing materials' },
    'P': { name: 'Personalize', description: 'Personalized user content and customizations' },
    'T': { name: 'Training_Data', description: 'AI training datasets, prompts, and machine learning resources' },
    'C': { name: 'Composites', description: 'Combined assets that reference components from other layers' },
    'R': { name: 'Rights', description: 'Rights, licenses, and legal documentation for assets' }
  };

  const currentLayerInfo = selectedLayer ? layerInfo[selectedLayer as keyof typeof layerInfo] : null;
  const displayName = layerName || currentLayerInfo?.name || 'Composite Assets';
  const description = currentLayerInfo?.description || 'Create composite assets by selecting and combining multiple component assets.';

  const handleComponentsSelected = (components: Asset[]) => {
    console.log('Components selected for', selectedLayer, 'layer:', components);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
            {selectedLayer ? `${displayName} (${selectedLayer}) Asset Registration` : 'Composite Assets Test Page'}
          </Typography>
          {selectedLayer && (
            <Chip 
              label={`Layer ${selectedLayer}`} 
              color="primary" 
              variant="outlined"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
        
        {selectedLayer && (
          <Alert severity="info" sx={{ mb: 3 }}>
            You selected the <strong>{displayName} ({selectedLayer})</strong> layer. This layer requires selecting multiple component assets 
            to create a composite asset. Use the search below to find and select the components you want to include.
          </Alert>
        )}
        
        <Box sx={{ mt: 3 }}>
          <CompositeAssetSelection
            onComponentsSelected={handleComponentsSelected}
            initialComponents={[]}
            targetLayer={selectedLayer || 'C'}
            layerName={displayName}
          />
        </Box>

      </Paper>
    </Container>
  );
};

export default CompositeAssetsTestPage;