import api from './api';
// import axios from 'axios'; // Removed unused import
import {
  Asset,
  AssetSearchParams,
  AssetCreateRequest,
  AssetUpdateRequest,
  FileUpload,
  FileUploadResponse,
  AssetFile
} from '../types/asset.types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';
import assetRegistryService from './assetRegistryService';

// Track ongoing uploads
const activeUploads: Map<string, FileUpload> = new Map();

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'; // Removed unused constant

class AssetService {
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
   * Advanced search for assets with complex filtering
   * @param params Search parameters with complex filters
   * @returns Paginated asset results
   */
  async advancedSearch(
    params: AssetSearchParams = {}
  ): Promise<PaginatedResponse<Asset>> {
    try {
      // For POST-based complex search, send params in request body
      const apiParams = this.prepareSearchParams(params);

      const response = await api.post<ApiResponse<PaginatedResponse<Asset>>>(
        '/assets/search',
        apiParams
      );
      return response.data.data as PaginatedResponse<Asset>;
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw new Error('Failed to perform advanced search');
    }
  }

  /**
   * Get an asset by ID
   * @param id Asset ID
   * @returns Asset
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
   * Get an asset by NNA address
   * @param nnaAddress NNA address
   * @returns Asset
   */
  async getAssetByNnaAddress(nnaAddress: string): Promise<Asset> {
    try {
      const response = await api.get<ApiResponse<Asset>>(
        `/assets/nna/${nnaAddress}`
      );
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error fetching asset with NNA address ${nnaAddress}:`, error);
      throw new Error('Failed to fetch asset');
    }
  }

  /**
   * Upload a file
   * @param file File to upload
   * @param options Upload options
   * @returns File upload object
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
      
      // This is for MOCK development - simulate a successful response after a delay
      // This prevents the 404 error when the API endpoint isn't available
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simulated response instead of making the actual API call
      // In production, you would use the commented code with the real API call
      /*
      const response = await api.post('/assets/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total ? (progressEvent.loaded / progressEvent.total) * 100 : 0;
          fileUpload.progress = progress;
          onProgress?.(progress);
        }
      });
      */
      
      // Mock response
      const mockResponse = {
        data: {
          filename: file.name,
          url: URL.createObjectURL(file), // Create a temporary URL for testing
          size: file.size,
          mimeType: file.type,
          originalName: file.name,
          success: true
        }
      };
      
      clearInterval(progressInterval);
      fileUpload.progress = 100;
      onProgress?.(100);

      fileUpload.status = 'completed';
      (fileUpload as FileUpload).response = mockResponse.data;
      return fileUpload;
    } catch (error) {
      fileUpload.status = 'error';
      fileUpload.error = error instanceof Error ? error.message : 'Upload failed';
      throw error;
    }
  }

  /**
   * Cancel an ongoing upload
   * @param fileId File ID
   * @returns Whether the upload was cancelled
   */
  cancelUpload(fileId: string): boolean {
    const fileUpload = activeUploads.get(fileId);
    if (fileUpload && fileUpload.status === 'uploading') {
      fileUpload.status = 'cancelled';
      activeUploads.delete(fileId);
      return true;
    }
    return false;
  }

  /**
   * Get upload status
   * @param fileId File ID
   * @returns File upload object
   */
  getUploadStatus(fileId: string): FileUpload | undefined {
    return activeUploads.get(fileId);
  }
  
  /**
   * Check if a file is a duplicate of a previously registered asset
   * @param file The file to check
   * @returns Registered asset if found, otherwise null
   */
  checkDuplicateAsset(file: File): { asset: Asset, confidence: 'high' | 'medium' | 'low' } | null {
    if (!file) return null;
    
    // Create a simple fingerprint for the file
    const fingerprint = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      hash: `${file.name}-${file.size}-${file.lastModified}` // Simple hash
    };
    
    // Look for exact matches first (high confidence)
    const exactMatch = assetRegistryService.findExactAssetMatch(fingerprint);
    if (exactMatch) {
      return { 
        asset: exactMatch.asset,
        confidence: 'high'
      };
    }
    
    // Look for partial matches (name and size - medium confidence)
    const nameAndSizeMatches = assetRegistryService.findAssetsByFingerprint({
      name: file.name,
      size: file.size
    });
    
    if (nameAndSizeMatches.length > 0) {
      // Sort by most recent registration
      const mostRecent = nameAndSizeMatches.sort(
        (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      )[0];
      
      return {
        asset: mostRecent.asset,
        confidence: 'medium'
      };
    }
    
    // Look for just name matches (low confidence)
    const nameMatches = assetRegistryService.findAssetsByFingerprint({
      name: file.name
    });
    
    if (nameMatches.length > 0) {
      // Sort by most recent registration
      const mostRecent = nameMatches.sort(
        (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      )[0];
      
      return {
        asset: mostRecent.asset,
        confidence: 'low'
      };
    }
    
    return null;
  }

  /**
   * Create an asset
   * @param assetData Asset data
   * @returns Created asset
   */
  async createAsset(assetData: AssetCreateRequest): Promise<Asset> {
    try {
      // For development/testing: Use mock implementation to avoid 401 errors
      // Comment this out when the API is ready
      console.log("Using mock createAsset implementation");
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extract metadata from the custom assetData structure 
      // since TypeScript complains about the structure not matching AssetCreateRequest
      const customMetadata = (assetData as any).metadata || {};
      
      // Map uploaded files to AssetFile format
      const uploadedFiles: AssetFile[] = (customMetadata.uploadedFiles || []).map((file: FileUploadResponse) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.filename,
        contentType: file.mimeType,
        size: file.size,
        url: file.url,
        uploadedAt: new Date().toISOString(),
        thumbnailUrl: file.mimeType.startsWith('image/') ? file.url : undefined
      }));
      
      // Extract metadata properly for consistent HFN/MFA values
      const hfn = customMetadata.hfn || customMetadata.humanFriendlyName || assetData.name;
      const mfa = customMetadata.mfa || customMetadata.machineFriendlyAddress || "0.000.000.001";
      const layerName = customMetadata.layerName || "Unknown Layer";
      
      // Generate a mock response
      const mockAsset: Asset = {
        id: `mock-asset-${Date.now()}`,
        name: assetData.name,
        friendlyName: assetData.name,
        nnaAddress: mfa, // Ensure consistent MFA values
        type: "standard",
        gcpStorageUrl: "https://storage.googleapis.com/mock-bucket/",
        description: assetData.description || '',
        layer: assetData.layer,
        categoryCode: (assetData as any).categoryCode || "",
        subcategoryCode: (assetData as any).subcategoryCode || "",
        category: assetData.category,
        subcategory: assetData.subcategory,
        tags: assetData.tags || [],
        files: uploadedFiles,
        metadata: {
          ...customMetadata,
          humanFriendlyName: hfn, // Always set these consistently
          machineFriendlyAddress: mfa,
          layerName: layerName, // Include layer name in metadata
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "user@example.com"
      };
      
      // Register this asset in our local registry for duplicate detection
      // Only if we have file information
      if (assetData.files && assetData.files.length > 0) {
        const file = assetData.files[0];
        const fingerprint = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          hash: `${file.name}-${file.size}-${file.lastModified}` // Simple hash
        };
        
        // Register in our asset registry
        assetRegistryService.registerAsset(mockAsset, fingerprint);
      }
      
      return mockAsset;
      
      // Original implementation - uncomment when API is ready
      /*
      const response = await api.post<ApiResponse<Asset>>(
        '/assets',
        assetData
      );
      return response.data.data as Asset;
      */
    } catch (error) {
      console.error('Error creating asset:', error);
      throw new Error('Failed to create asset');
    }
  }

  /**
   * Get an asset for editing
   * @param id Asset ID
   * @returns Asset
   */
  async getAssetForEditing(id: string): Promise<Asset> {
    try {
      const response = await api.get<ApiResponse<Asset>>(
        `/assets/${id}/edit`
      );
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error fetching asset ${id} for editing:`, error);
      throw new Error('Failed to fetch asset for editing');
    }
  }

  /**
   * Update an asset
   * @param id Asset ID
   * @param updateData Update data
   * @returns Updated asset
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
   * @param id Asset ID
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
   * Delete an asset file
   * @param assetId Asset ID
   * @param fileId File ID
   * @returns Updated asset
   */
  async deleteAssetFile(assetId: string, fileId: string): Promise<Asset> {
    try {
      const response = await api.delete<ApiResponse<Asset>>(
        `/assets/${assetId}/files/${fileId}`
      );
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error deleting file ${fileId} from asset ${assetId}:`, error);
      throw new Error('Failed to delete asset file');
    }
  }

  /**
   * Update asset order
   * @param assets Assets with updated order
   */
  async updateAssetOrder(assets: Asset[]): Promise<void> {
    try {
      await api.put<ApiResponse<void>>('/assets/order', {
        assets: assets.map((asset) => ({
          id: asset.id,
          ...(asset.order !== undefined ? { order: asset.order } : {}),
        })) as Partial<Asset>[],
      });
    } catch (error) {
      console.error('Error updating asset order:', error);
      throw new Error('Failed to update asset order');
    }
  }

  /**
   * Update asset groups
   * @param assets Assets with updated groups
   */
  async updateAssetGroups(assets: Asset[]): Promise<void> {
    try {
      await api.put<ApiResponse<void>>('/assets/groups', {
        assets: assets.map((asset) => ({
          id: asset.id,
          ...(asset.groupId !== undefined ? { groupId: asset.groupId } : {}),
        })) as Partial<Asset>[],
      });
    } catch (error) {
      console.error('Error updating asset groups:', error);
      throw new Error('Failed to update asset groups');
    }
  }

  /**
   * Save asset organization
   */
  async saveAssetOrganization(): Promise<void> {
    try {
      await api.post<ApiResponse<void>>('/assets/organization/save');
    } catch (error) {
      console.error('Error saving asset organization:', error);
      throw new Error('Failed to save asset organization');
    }
  }

  /**
   * Reset asset organization
   */
  async resetAssetOrganization(): Promise<void> {
    try {
      await api.post<ApiResponse<void>>('/assets/organization/reset');
    } catch (error) {
      console.error('Error resetting asset organization:', error);
      throw new Error('Failed to reset asset organization');
    }
  }

  /**
   * Prepare search params for API
   * @param params Search params
   * @returns Prepared search params
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
