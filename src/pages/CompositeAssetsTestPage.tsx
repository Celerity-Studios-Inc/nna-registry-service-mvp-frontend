import React, { useState } from 'react';
import { Box, Typography, Container, Paper } from '@mui/material';
import CompositeAssetSelection from '../components/CompositeAssetSelection';
import { Asset } from '../types/asset.types';

const CompositeAssetsTestPage: React.FC = () => {
  const [selectedComponents, setSelectedComponents] = useState<Asset[]>([]);

  const handleComponentsSelected = (components: Asset[]) => {
    setSelectedComponents(components);
    console.log('Components selected:', components);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Composite Assets Test Page
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Test the composite assets feature. This page allows you to test component selection, 
          validation, HFN generation, and preview functionality.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <CompositeAssetSelection
            onComponentsSelected={handleComponentsSelected}
            initialComponents={[]}
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