import { Autocomplete, CircularProgress, LinearProgress, Stack, TextField, Typography, Chip, Box, Button, Alert } from '@mui/material';
import { Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { Asset } from '../../types/asset.types';
import assetService from '../../api/assetService';

interface ComponentFormProps {
  control: any;
  watchLayer?: string;
}

/**
 * Component selection form for Composite (C) layer assets
 * Allows selecting other registered assets as components
 */
export const ComponentsForm = ({ control, watchLayer }: ComponentFormProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only show this component for Composite (C) layer
  const isCompositeLayer = watchLayer === 'C';

  useEffect(() => {
    if (isCompositeLayer) {
      fetchAssets();
    }
  }, [isCompositeLayer]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch from the backend API
      // For now, we'll use a mock implementation
      const response = await assetService.getAssets();
      
      if (response && Array.isArray(response)) {
        setAssets(response);
      } else if (response && response.data) {
        // Handle paginated response if that's what the service returns
        setAssets(response.data);
      } else {
        // Create dummy assets for testing
        const dummyAssets: Asset[] = [
          {
            id: '1',
            name: 'Sample Song Asset',
            friendlyName: 'Pop Song Asset',
            description: 'Pop music track',
            layer: 'G',
            categoryCode: 'POP',
            subcategoryCode: 'USA',
            type: 'audio',
            gcpStorageUrl: 'https://storage.googleapis.com/sample/song.mp3',
            files: [],
            tags: ['music', 'pop'],
            nnaAddress: 'G.POP.USA.001',
            metadata: {
              machineFriendlyAddress: '1.001.001.001'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            status: 'active'
          },
          {
            id: '2',
            name: 'Sample Character Model',
            friendlyName: 'Anime Character',
            description: 'Anime character model',
            layer: 'S',
            categoryCode: 'ANI',
            subcategoryCode: 'JPG',
            type: 'model',
            gcpStorageUrl: 'https://storage.googleapis.com/sample/character.glb',
            files: [],
            tags: ['anime', 'character'],
            nnaAddress: 'S.ANI.JPG.001',
            metadata: {
              machineFriendlyAddress: '2.002.001.001'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            status: 'active'
          },
          {
            id: '3',
            name: 'Sample Costume',
            friendlyName: 'Futuristic Costume',
            description: 'Futuristic outfit',
            layer: 'L',
            categoryCode: 'FUT',
            subcategoryCode: 'SCI',
            type: 'model',
            gcpStorageUrl: 'https://storage.googleapis.com/sample/costume.glb',
            files: [],
            tags: ['outfit', 'sci-fi'],
            nnaAddress: 'L.FUT.SCI.001',
            metadata: {
              machineFriendlyAddress: '3.001.002.001'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            status: 'active'
          }
        ];
        
        setAssets(dummyAssets);
      }
    } catch (error) {
      console.error('Error fetching assets for component selection:', error);
      setError('Failed to load assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const options = assets.map(asset => ({
    value: asset.id,
    title: `${asset.name} (${asset.nnaAddress || asset.layer})`,
    description: asset.description,
    layer: asset.layer,
    nnaAddress: asset.nnaAddress || `${asset.layer}.${asset.categoryCode}.${asset.subcategoryCode}.001`
  }));
  
  if (!isCompositeLayer) {
    return null;
  }

  return (
    <Stack mt={2} spacing={2}>
      <Typography variant="subtitle1" gutterBottom>
        Component Assets
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select existing assets to include as components in this composite asset.
        The selected assets will be referenced and linked to this composite asset.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {isLoading && (
        <LinearProgress
          sx={{
            mb: 2,
          }}
        />
      )}
      
      <Controller
        name="layerSpecificData.components"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <Autocomplete
            multiple
            options={options}
            fullWidth
            getOptionLabel={(option: any) => option.title}
            getOptionKey={(option: any) => option.value}
            filterOptions={(values) => {
              return values.filter(
                item => !field?.value?.some((item2: any) => item.value === item2.value)
              );
            }}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                <Typography variant="body1">{option.title}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 0.5 }}>
                  <Chip 
                    label={option.layer} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">{option.nnaAddress}</Typography>
                </Box>
                {option.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {option.description}
                  </Typography>
                )}
              </Box>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Select Component Assets" placeholder="Search for assets to include" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.title}
                  {...getTagProps({ index })}
                  key={option.value}
                />
              ))
            }
            onChange={(event, item) => {
              field.onChange(item);
            }}
            value={field.value || []}
            loading={isLoading}
            loadingText="Loading assets..."
          />
        )}
      />
      
      {/* Display selected components summary */}
      <Controller
        name="layerSpecificData.components"
        control={control}
        render={({ field }) => {
          const selectedComponents = field.value || [];
          if (selectedComponents.length === 0) {
            return (
              <Alert severity="info" sx={{ mt: 2 }}>
                No components selected yet. Select at least one asset to create a composite.
              </Alert>
            );
          }
          
          return (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Components ({selectedComponents.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedComponents.map((component: any) => (
                  <Chip
                    key={component.value}
                    label={component.title}
                    color="primary"
                    variant="outlined"
                    onDelete={() => {
                      const newComponents = selectedComponents.filter(
                        (c: any) => c.value !== component.value
                      );
                      field.onChange(newComponents);
                    }}
                  />
                ))}
              </Box>
            </Box>
          );
        }}
      />
    </Stack>
  );
};

export default ComponentsForm;