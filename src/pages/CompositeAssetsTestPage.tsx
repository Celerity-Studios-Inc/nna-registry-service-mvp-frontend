import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Chip, Alert } from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CompositeAssetSelection from '../components/CompositeAssetSelection';
import AuthTestHelper from '../components/AuthTestHelper';
import { Asset } from '../types/asset.types';

const CompositeAssetsTestPage: React.FC = () => {
  const [selectedComponents, setSelectedComponents] = useState<Asset[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
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
    setSelectedComponents(components);
    console.log('Components selected for', selectedLayer, 'layer:', components);
  };

  const handleBackToRegistration = () => {
    navigate('/register-asset');
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
        
        <AuthTestHelper />
        
        <Box sx={{ mt: 3 }}>
          <CompositeAssetSelection
            onComponentsSelected={handleComponentsSelected}
            initialComponents={[]}
            targetLayer={selectedLayer || 'C'}
            layerName={displayName}
          />
        </Box>

        {selectedComponents.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Selected Components Debug Info:
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <pre>{JSON.stringify(selectedComponents, null, 2)}</pre>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CompositeAssetsTestPage;