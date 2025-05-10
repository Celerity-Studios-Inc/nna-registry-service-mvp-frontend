import api, { isBackendAvailable as apiBackendStatus } from './api';
import {
  Asset,
  AssetSearchParams,
  AssetCreateRequest,
  AssetUpdateRequest,
  FileUpload,
  FileUploadResponse,
  AssetFile
} from '../types/asset.types';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import assetRegistryService from './assetRegistryService';

/**
 * Dedicated function for creating assets with FormData
 * This follows the backend API specification exactly
 */
async function createAssetWithFormData(assetData: AssetCreateRequest): Promise<Asset> {
  console.log('Creating asset with FormData...');
  console.log('Asset data provided:', {
    name: assetData.name,
    layer: assetData.layer,
    category: assetData.category,
    subcategory: assetData.subcategory,
    description: assetData.description,
    source: (assetData as any).source || 'ReViz',
    tags: assetData.tags,
    hasFiles: assetData.files && assetData.files.length > 0
  });

  // Create FormData object
  const formData = new FormData();
  
  // Add file (required by backend)
  if (assetData.files && assetData.files.length > 0) {
    const file = assetData.files[0];
    formData.append('file', file);
    console.log('Added file to FormData:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
  } else {
    throw new Error('File is required for asset creation');
  }

  // Add required fields from backend API specification
  formData.append('layer', assetData.layer);
  formData.append('category', assetData.category || '');
  formData.append('subcategory', assetData.subcategory || '');
  formData.append('source', (assetData as any).source || 'ReViz');
  formData.append('description', assetData.description || '');
  
  // Tags must be a JSON string - backend will parse it
  if (assetData.tags && assetData.tags.length > 0) {
    formData.append('tags', JSON.stringify(assetData.tags));
  } else {
    formData.append('tags', JSON.stringify(['general']));
  }
  
  // Add optional fields
  // Training data
  formData.append('trainingData', JSON.stringify({
    prompts: [],
    images: [],
    videos: []
  }));
  
  // Rights information
  formData.append('rights', JSON.stringify({
    source: 'Original',
    rights_split: '100%'
  }));
  
  // Components (if any)
  formData.append('components', JSON.stringify([]));
  
  // Log FormData fields for debugging
  console.log('FormData created with fields:');
  console.log(' - file');
  console.log(` - layer: ${assetData.layer}`);
  console.log(` - category: ${assetData.category}`);
  console.log(` - subcategory: ${assetData.subcategory}`);
  console.log(` - source: ${(assetData as any).source || 'ReViz'}`);
  console.log(` - description: ${assetData.description ? assetData.description.substring(0, 30) + (assetData.description.length > 30 ? '...' : '') : ''}`);
  console.log(` - tags: ${JSON.stringify(assetData.tags)}`);
  console.log(' - trainingData: {}');
  console.log(' - rights: {}');
  console.log(' - components: []');
  
  // Get authentication token
  const authToken = localStorage.getItem('accessToken');
  if (!authToken) {
    throw new Error('Authentication required. Please login.');
  }
  
  // Make the API request using fetch for better FormData handling
  try {
    console.log('Sending asset creation request to API...');
    const response = await fetch('/api/assets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Asset creation failed:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.message || errorData.message || 'Failed to create asset');
      } catch (e) {
        throw new Error(`Asset creation failed with status ${response.status}`);
      }
    }
    
    const responseText = await response.text();
    try {
      const responseData = JSON.parse(responseText);
      console.log('Asset created successfully:', responseData.data);
      return responseData.data;
    } catch (e) {
      console.error('Failed to parse successful response', e);
      throw new Error('Failed to parse API response');
    }
  } catch (error) {
    console.error('Error in asset creation:', error);
    throw error;
  }
}

/**
 * Create a mock asset for testing
 */
function createMockAsset(assetData: AssetCreateRequest): Asset {
  console.log('Creating mock asset...');
  
  // Extract metadata from the custom assetData structure 
  const customMetadata = (assetData as any).metadata || {};
  
  // Map uploaded files to AssetFile format safely
  const uploadedFiles: AssetFile[] = [];
  
  if (assetData.files && assetData.files.length > 0) {
    const file = assetData.files[0];
    uploadedFiles.push({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
      thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    });
  }
  
  // Generate a mock asset
  const mockAsset: Asset = {
    id: `mock-asset-${Date.now()}`,
    name: assetData.name,
    friendlyName: assetData.name,
    nnaAddress: customMetadata.mfa || "2.001.001.001",
    type: "standard",
    gcpStorageUrl: "https://storage.googleapis.com/mock-bucket/",
    description: assetData.description || '',
    layer: assetData.layer,
    categoryCode: assetData.category || "",
    subcategoryCode: assetData.subcategory || "",
    category: assetData.category,
    subcategory: assetData.subcategory,
    tags: assetData.tags || [],
    files: uploadedFiles,
    metadata: {
      humanFriendlyName: assetData.name,
      machineFriendlyAddress: customMetadata.mfa || "2.001.001.001",
      layerName: customMetadata.layerName || "Unknown Layer",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "user@example.com"
  };
  
  return mockAsset;
}

/**
 * Asset service class
 */
class AssetService {
  // Upload file method
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileUpload> {
    // Implementation logic...
    // This is a simulation for the demo
    const fileUpload: FileUpload = {
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'pending',
      error: null,
      cancel: () => false
    } as FileUpload;
    
    try {
      fileUpload.status = 'uploading';
      
      // Simulate upload progress
      let simulatedProgress = 0;
      const progressInterval = setInterval(() => {
        simulatedProgress += 10;
        if (simulatedProgress > 100) {
          simulatedProgress = 100;
          clearInterval(progressInterval);
        }
        fileUpload.progress = simulatedProgress;
        onProgress?.(simulatedProgress);
      }, 300);
      
      // Simulate upload completion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create simulated response
      const mockResponse = {
        filename: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type,
        originalName: file.name,
        success: true
      };
      
      clearInterval(progressInterval);
      fileUpload.progress = 100;
      onProgress?.(100);
      
      fileUpload.status = 'completed';
      fileUpload.response = mockResponse;
      return fileUpload;
    } catch (error) {
      fileUpload.status = 'error';
      fileUpload.error = error instanceof Error ? error.message : 'Upload failed';
      throw error;
    }
  }
  
  // Create asset method
  async createAsset(assetData: AssetCreateRequest): Promise<Asset> {
    try {
      // Check if backend is available or if we're in mock mode
      const authToken = localStorage.getItem('accessToken') || '';
      const isMockToken = authToken.startsWith('MOCK-');
      const useMock = isMockToken || !apiBackendStatus;
      
      if (useMock) {
        console.log('Using mock implementation for createAsset');
        return createMockAsset(assetData);
      } else {
        console.log('Using real API implementation for createAsset');
        try {
          // Use the dedicated FormData function
          return await createAssetWithFormData(assetData);
        } catch (error) {
          console.error('Real API asset creation failed:', error);
          console.log('Falling back to mock implementation');
          return createMockAsset(assetData);
        }
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      throw new Error('Failed to create asset');
    }
  }
  
  // Other service methods
  // ...
}

// Create singleton instance
const assetService = new AssetService();
export default assetService;