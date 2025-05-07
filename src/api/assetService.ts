import api from './api';
import {
  Asset,
  AssetSearchParams,
  AssetCreateRequest,
  AssetUpdateRequest,
  FileUpload,
  FileUploadResponse
} from '../types/asset.types';
import { ApiResponse, PaginatedResponse } from '../types/api.types';

/**
 * Service for managing assets
 */
class AssetService {
  /**
   * Get assets with optional search parameters
   */
  async getAssets(
    params: AssetSearchParams = {}
  ): Promise<PaginatedResponse<Asset>> {
    try {
      // For complex search params with date objects, convert to ISO strings for API
      const apiParams = this.prepareSearchParams(params);

      const response = await api.get<ApiResponse<PaginatedResponse<Asset>>>(
        '/assets',
        {
          params: apiParams,
        }
      );
      return response.data.data as PaginatedResponse<Asset>;
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw new Error('Failed to fetch assets');
    }
  }

  /**
   * Get an asset by ID
   */
  async getAssetById(id: string): Promise<Asset> {
    try {
      const response = await api.get<ApiResponse<Asset>>(`/assets/${id}`);
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error fetching asset ${id}:`, error);
      throw new Error('Failed to fetch asset');
    }
  }

  /**
   * Upload a file for an asset
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<FileUpload> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadId = Math.random().toString(36).substring(7);
    const fileUpload: FileUpload = {
      id: uploadId,
      file,
      progress: 0,
      status: 'pending',
      error: null,
      cancel: () => false
    } as FileUpload;

    try {
      fileUpload.status = 'uploading';
      
      // Simulate upload progress for development
      if (process.env.NODE_ENV !== 'production') {
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
        
        // Simulate successful response after a delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        clearInterval(progressInterval);
        fileUpload.progress = 100;
        onProgress?.(100);

        // Create a mock response for development
        const mockResponse = {
          filename: file.name,
          url: URL.createObjectURL(file), // Create a temporary URL for testing
          size: file.size,
          mimeType: file.type,
          originalName: file.name
        };
        
        fileUpload.status = 'completed';
        fileUpload.response = mockResponse;
        return fileUpload;
      } else {
        // Production code - actual API call
        const response = await api.post('/assets/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total ? (progressEvent.loaded / progressEvent.total) * 100 : 0;
            fileUpload.progress = progress;
            onProgress?.(progress);
          }
        });
        
        fileUpload.status = 'completed';
        fileUpload.response = response.data;
        return fileUpload;
      }
    } catch (error) {
      fileUpload.status = 'error';
      fileUpload.error = error instanceof Error ? error.message : 'Upload failed';
      throw error;
    }
  }

  /**
   * Create a new asset
   */
  async createAsset(assetData: AssetCreateRequest): Promise<Asset> {
    try {
      if (process.env.NODE_ENV !== 'production') {
        // Mock implementation for development
        console.log("Using mock createAsset implementation");
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a mock response
        const mockAsset: Asset = {
          id: `mock-asset-${Date.now()}`,
          name: assetData.name,
          friendlyName: assetData.name,
          nnaAddress: "0.000.000.001", // Mock NNA address
          type: "standard",
          description: assetData.description || '',
          layer: assetData.layer,
          categoryCode: assetData.categoryCode,
          subcategoryCode: assetData.subcategoryCode,
          category: assetData.category,
          subcategory: assetData.subcategory,
          tags: assetData.tags || [],
          files: [], // Would contain file info in a real response
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "user@example.com"
        };
        
        return mockAsset;
      } else {
        // Production code - actual API call
        const response = await api.post<ApiResponse<Asset>>(
          '/assets',
          assetData
        );
        return response.data.data as Asset;
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      throw new Error('Failed to create asset');
    }
  }

  /**
   * Update an existing asset
   */
  async updateAsset(
    id: string,
    updateData: AssetUpdateRequest
  ): Promise<Asset> {
    try {
      const response = await api.put<ApiResponse<Asset>>(
        `/assets/${id}`,
        updateData
      );
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error updating asset ${id}:`, error);
      throw new Error('Failed to update asset');
    }
  }

  /**
   * Delete an asset
   */
  async deleteAsset(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse<void>>(`/assets/${id}`);
    } catch (error) {
      console.error(`Error deleting asset ${id}:`, error);
      throw new Error('Failed to delete asset');
    }
  }

  /**
   * Helper method to prepare search parameters for API
   */
  private prepareSearchParams(params: AssetSearchParams): Record<string, any> {
    const apiParams: Record<string, any> = { ...params };

    // Convert date objects to ISO strings
    if (apiParams.startDate instanceof Date) {
      apiParams.startDate = apiParams.startDate.toISOString();
    }
    if (apiParams.endDate instanceof Date) {
      apiParams.endDate = apiParams.endDate.toISOString();
    }

    return apiParams;
  }
}

const assetService = new AssetService();
export default assetService;