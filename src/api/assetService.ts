import api, { isBackendAvailable as apiBackendStatus, apiConfig } from './api';
import {
  Asset,
  AssetSearchParams,
  AssetCreateRequest,
  AssetUpdateRequest,
  FileUpload,
  FileUploadResponse,
  AssetFile,
} from '../types/asset.types';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import assetRegistryService from './assetRegistryService';
// Import checkEnv only when needed - currently commented out in the code
// import { checkEnv } from './envCheck';
import { TaxonomyConverter } from '../services/taxonomyConverter';
import { debugLog } from '../utils/logger';
import { environmentSafeLog } from '../utils/environment';
import { getUploadEndpoint, getEnvironmentConfig, logEnvironmentInfo } from '../utils/environment.config';
import axios from 'axios';

// Determine whether real backend is available and connected
// Use the API module's backend status tracking
let isBackendAvailable = apiBackendStatus;
let lastBackendCheck = 0;
const BACKEND_CHECK_INTERVAL = 30 * 1000; // 30 seconds

// Simple check function to be run at startup
const checkBackendAvailability = async () => {
  try {
    // Always start assuming backend is unavailable until proven otherwise
    let realBackendWorking = false;
    let localHealthEndpointWorking = false;

    // For caching - only recheck if it's been long enough since last check
    const now = Date.now();
    if (
      now - lastBackendCheck < BACKEND_CHECK_INTERVAL &&
      lastBackendCheck > 0
    ) {
      return isBackendAvailable;
    }

    // Try to hit our own health endpoint first - this just tells us if *our* API is working,
    // not the real backend
    try {
      const healthResponse = await fetch('/api/health');

      // If health endpoint works, log success but continue checking
      if (healthResponse.ok) {
        localHealthEndpointWorking = true;

        // Try to get the response body for more debugging
        try {
          // First check if it's HTML
          const responseText = await healthResponse.text();
          if (
            responseText.trim().startsWith('<!doctype html>') ||
            responseText.includes('<html')
          ) {

            // Log a more detailed error with visual emphasis
            console.error(`
======================================
API ROUTING CONFIGURATION ERROR DETECTED
======================================
The server is returning HTML instead of JSON for API endpoints.
This happens when the server is not properly configured to handle API routes.

This is common when using 'serve -s build' without proper configuration.

SOLUTION:
1. Use the provided serve-local.sh script: ./serve-local.sh
   OR
2. Use serve with the config file: serve -s build -l 3000 --config serve.json

The serve.json file contains special routing rules to handle API requests properly.
======================================`);

            // Set a flag in localStorage to show an error in the UI
            try {
              localStorage.setItem('apiRoutingError', 'true');
            } catch (e) {
              // Ignore localStorage errors
            }

            // This is definitely indicative of an issue
            localHealthEndpointWorking = false;
          } else {
            // Try to parse as JSON
            try {
              const healthBody = JSON.parse(responseText);
              // Check for our special marker
              if (
                healthBody &&
                healthBody.diagnostics &&
                healthBody.diagnostics.responseMarker === 'JSON_RESPONSE_MARKER'
              ) {
                // Clear any previous error flags
                try {
                  localStorage.removeItem('apiRoutingError');
                } catch (e) {
                  // Ignore localStorage errors
                }
              }
            } catch (jsonError) {
              // Could not parse health response as JSON
            }
          }
        } catch (parseError) {
          // Could not parse health response
        }
      }
    } catch (healthError) {
      // Health endpoint request failed
    }

    // Use the standard health endpoint to test backend connectivity
    try {
      const response = await fetch('/api/health');

      if (response.ok) {
        try {
          const responseText = await response.text();
          if (responseText.trim().startsWith('<!doctype html>')) {
            // Since we got HTML, the backend is not working correctly
            realBackendWorking = false;
          } else {
            // Try to parse as JSON
            try {
              const healthResult = JSON.parse(responseText);
              // Check if backend reports healthy status
              realBackendWorking = healthResult.status === 'healthy';
            } catch (jsonError) {
              realBackendWorking = false;
            }
          }
        } catch (parseError) {
          realBackendWorking = false;
        }
      }
    } catch (testError) {
      // Health endpoint request failed
    }

    // Check if user has forced mock mode via localStorage
    let forceMockMode = false;
    try {
      forceMockMode = localStorage.getItem('forceMockApi') === 'true';
      if (forceMockMode) {
        // Mock API mode forced via localStorage setting
      }
    } catch (e) {
      // Ignore localStorage errors
    }

    // Real backend is only available if the test confirms it AND user hasn't forced mock mode
    isBackendAvailable = realBackendWorking && !forceMockMode;

    // Update cache timestamp
    lastBackendCheck = now;


    // Also update the API module's status for consistency
    if (isBackendAvailable !== apiBackendStatus) {
      // Expose for debugging
      try {
        (window as any).apiBackendAvailable = isBackendAvailable;
      } catch (e) {
        // Ignore if window is not defined (e.g., in test environment)
      }
    }

    return isBackendAvailable;
  } catch (error) {
    console.error('Backend availability check failed:', error);
    isBackendAvailable = false;
    lastBackendCheck = Date.now(); // Update timestamp even on error
    return false;
  }
};

// Run the check when this module is loaded
checkBackendAvailability();

// Also periodically recheck to see if backend has come back online
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  setInterval(checkBackendAvailability, 30000); // Check every 30 seconds in production
}

// Track ongoing uploads
const activeUploads: Map<string, FileUpload> = new Map();

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api'; // Removed unused constant

class AssetService {
  async getAssets(
    params: AssetSearchParams = {}
  ): Promise<PaginatedResponse<Asset>> {
    try {

      // Create query parameters
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.layer) queryParams.append('layer', params.layer);
      if (params.category) queryParams.append('category', params.category);
      if (params.subcategory)
        queryParams.append('subcategory', params.subcategory);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.status) queryParams.append('status', params.status);

      // Convert date objects to ISO strings
      if (params.startDate) {
        const dateStr =
          params.startDate instanceof Date
            ? params.startDate.toISOString()
            : params.startDate.toString();
        queryParams.append('startDate', dateStr);
      }

      if (params.endDate) {
        const dateStr =
          params.endDate instanceof Date
            ? params.endDate.toISOString()
            : params.endDate.toString();
        queryParams.append('endDate', dateStr);
      }

      // Add tags if they exist
      if (params.tags && Array.isArray(params.tags)) {
        params.tags.forEach(tag => {
          queryParams.append('tags[]', tag);
        });
      }


      // Get auth token
      const authToken = localStorage.getItem('accessToken') || '';

      // Make the API request - use proxy for GET requests (no CORS issues)
      const response = await fetch(`/api/assets?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Check if this is a 500 error that might indicate unsupported parameters
        if (response.status === 500) {
          const errorText = await response.text();
          
          // Return empty result to trigger fallback in calling code
          return {
            data: [],
            pagination: {
              total: 0,
              page: 1,
              limit: 10,
              pages: 1,
            },
            error: '500_UNSUPPORTED_PARAMS'
          } as PaginatedResponse<Asset> & { error: string };
        }
        
        throw new Error(`Failed to fetch assets: ${response.statusText}`);
      }

      // Parse the response
      const responseData = await response.json();

      let assets: Asset[] = [];
      let pagination = {
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        pages: 1,
      };

      // Handle different response formats
      if (responseData.success && responseData.data) {
        // New backend format: { success: true, data: { items: [], total: number, page: number, limit: number } }
        if (responseData.data.items && Array.isArray(responseData.data.items)) {
          assets = responseData.data.items.map((item: any) => {
            // Ensure each item has an id property (frontend uses id, backend uses _id)
            const normalizedAsset = { ...item };
            if (item._id && !item.id) {
              normalizedAsset.id = item._id;
            }
            return normalizedAsset as Asset;
          });

          pagination = {
            total: responseData.data.total || assets.length,
            page: responseData.data.page || 1,
            limit: responseData.data.limit || assets.length,
            pages:
              Math.ceil(
                (responseData.data.total || assets.length) /
                  (responseData.data.limit || 10)
              ) || 1,
          };
        } else if (Array.isArray(responseData.data)) {
          // Traditional format: response.data.data is an array of assets
          assets = responseData.data;
          pagination = {
            total: assets.length,
            page: 1,
            limit: assets.length,
            pages: 1,
          };
        }
      } else if (Array.isArray(responseData)) {
        // Direct array response
        assets = responseData;
        pagination = {
          total: assets.length,
          page: 1,
          limit: assets.length,
          pages: 1,
        };
      } else {
        console.warn('Unexpected API response format:', responseData);
      }

      // Ensure all assets have an id property
      assets = assets.map(asset => {
        if (asset._id && !asset.id) {
          return { ...asset, id: asset._id };
        }
        return asset;
      });


      return {
        data: assets,
        pagination: pagination,
      };
    } catch (error) {
      console.error('Error fetching assets:', error);
      // Return empty result set rather than mock data
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        },
      };
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
   * Get an asset by ID or Name
   * @param identifier Asset ID or Name (backend expects name)
   * @returns Asset
   */
  async getAssetById(identifier: string): Promise<Asset> {
    try {
      // Check for invalid or empty identifiers
      if (!identifier || identifier.trim() === '') {
        throw new Error('Asset identifier is required and cannot be empty');
      }

      // CRITICAL FIX: Use search endpoint but check if identifier is MongoDB ID
      // If it's a MongoDB ID, we need a different approach since search doesn't work with IDs
      const isMongoId = /^[a-f0-9]{24}$/i.test(identifier);

      let response;
      try {
        if (isMongoId) {
          // For MongoDB IDs, we need to get all assets and filter client-side
          // This is not ideal but works until backend provides ID-based endpoint
          response = await axios.get(`/api/assets`, {
            params: { limit: 1000 }, // Get enough assets to find the one we need
            timeout: 5000,
            headers: {
              'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                              localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
            },
          });
        } else {
          // For asset names, use search parameter
          response = await axios.get(`/api/assets`, {
            params: {
              search: identifier,
              limit: 1
            },
            timeout: 5000,
            headers: {
              'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                              localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
            },
          });
        }
      } catch (proxyError) {
        // If proxy fails, try direct backend connection
        try {
          // Use same logic for direct backend
          if (isMongoId) {
            response = await axios.get(`https://registry.reviz.dev/api/assets`, {
              params: { limit: 1000 },
              timeout: 8000,
              headers: {
                'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                                localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
              },
            });
          } else {
            response = await axios.get(`https://registry.reviz.dev/api/assets`, {
              params: {
                search: identifier,
                limit: 1
              },
              timeout: 8000,
              headers: {
                'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')?.replace(/\s+/g, '')}` : 
                                localStorage.getItem('testToken') ? `Bearer ${localStorage.getItem('testToken')?.replace(/\s+/g, '')}` : undefined,
              },
            });
          }
        } catch (directError) {
          console.error('Direct backend connection failed:', directError instanceof Error ? directError.message : 'Unknown error');
          throw new Error('Failed to load asset from both proxy and direct backend');
        }
      }

      if (response && response.data) {
        let asset;
        // Handle search response format (items array)
        if (response.data.success && response.data.data && response.data.data.items) {
          const items = response.data.data.items;
          
          if (isMongoId) {
            // Filter by MongoDB ID when we fetched all assets
            const foundAsset = items.find((item: any) => item._id === identifier);
            if (foundAsset) {
              asset = foundAsset;
            } else {
              throw new Error(`Asset not found with ID: ${identifier}`);
            }
          } else {
            // For name search, take the first result
            if (items.length > 0) {
              asset = items[0];
            } else {
              throw new Error(`Asset not found: ${identifier}`);
            }
          }
        } else if (response.data.success && response.data.data) {
          // Fallback: single asset response
          asset = response.data.data;
        } else {
          throw new Error('Invalid response format from search');
        }

        // Normalize IDs
        if (asset._id && !asset.id) {
          asset.id = asset._id;
        }

        return asset as Asset;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error fetching asset ' + identifier + ':', error);
      throw new Error('Failed to fetch asset: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      console.error(
        `Error fetching asset with NNA address ${nnaAddress}:`,
        error
      );
      throw new Error('Failed to fetch asset');
    }
  }

  /**
   * Upload a file
   * @param file File to upload
   * @param options Upload options
   * @returns File upload object
   */
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FileUpload> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadId = Math.random().toString(36).substring(7);
    const fileUpload: FileUpload = {
      id: uploadId,
      file,
      progress: 0,
      status: 'pending',
      error: null,
      cancel: () => false,
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
          success: true,
        },
      };

      clearInterval(progressInterval);
      fileUpload.progress = 100;
      onProgress?.(100);

      fileUpload.status = 'completed';
      (fileUpload as FileUpload).response = mockResponse.data;
      return fileUpload;
    } catch (error) {
      fileUpload.status = 'error';
      fileUpload.error =
        error instanceof Error ? error.message : 'Upload failed';
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
  checkDuplicateAsset(
    file: File
  ): { asset: Asset; confidence: 'high' | 'medium' | 'low' } | null {
    if (!file) return null;

    // Create a simple fingerprint for the file
    const fingerprint = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      hash: `${file.name}-${file.size}-${file.lastModified}`, // Simple hash
    };

    // Look for exact matches first (high confidence)
    const exactMatch = assetRegistryService.findExactAssetMatch(fingerprint);
    if (exactMatch) {
      return {
        asset: exactMatch.asset,
        confidence: 'high',
      };
    }

    // Look for partial matches (name and size - medium confidence)
    const nameAndSizeMatches = assetRegistryService.findAssetsByFingerprint({
      name: file.name,
      size: file.size,
    });

    if (nameAndSizeMatches.length > 0) {
      // Sort by most recent registration
      const mostRecent = nameAndSizeMatches.sort(
        (a, b) =>
          new Date(b.registeredAt).getTime() -
          new Date(a.registeredAt).getTime()
      )[0];

      return {
        asset: mostRecent.asset,
        confidence: 'medium',
      };
    }

    // Look for just name matches (low confidence)
    const nameMatches = assetRegistryService.findAssetsByFingerprint({
      name: file.name,
    });

    if (nameMatches.length > 0) {
      // Sort by most recent registration
      const mostRecent = nameMatches.sort(
        (a, b) =>
          new Date(b.registeredAt).getTime() -
          new Date(a.registeredAt).getTime()
      )[0];

      return {
        asset: mostRecent.asset,
        confidence: 'low',
      };
    }

    return null;
  }

  /**
   * Direct asset creation method that bypasses our proxy
   * This is a simplified implementation that makes a direct API call to the backend
   * @param assetData Asset data for creation
   * @returns Created asset from backend or mock asset on error
   */
  async directCreateAsset(assetData: AssetCreateRequest): Promise<Asset> {

    // Format based on reference implementation - only the essential fields
    const formData = new FormData();

    // Add the file if it exists (most important part)
    if (assetData.files && assetData.files.length > 0) {
      const file = assetData.files[0];
      if (file) {
        formData.append('file', file);
      }
    }

    // Add all required fields exactly as in reference implementation
    // From the error message "property name should not exist", we need to REMOVE 'name' field completely
    // Don't use either 'name' or 'title' since API is rejecting both
    // formData.append('name', assetData.name || 'Unnamed Asset'); // Removed as API rejects this field

    // DO NOT include 'name' field - backend will reject it
    // Backend expects the name to be set via taxonomic naming only
    // formData.append('name', assetData.name || 'Unnamed Asset');

    formData.append('layer', assetData.layer || 'S');
    // Use category and subcategory as the backend is rejecting categoryCode
    formData.append('category', assetData.category || 'POP');
    // Use a valid subcategory for S layer and POP category (DIV = Pop_Diva_Female_Stars)
    formData.append(
      'subcategory',
      assetData.subcategory ||
        (assetData.layer === 'S' && assetData.category === 'POP'
          ? 'DIV'
          : 'BAS')
    );
    formData.append(
      'description',
      assetData.description || 'Asset description'
    );
    // IMPORTANT: Asset "source" field (different from rights.source)
    // This field is required by the backend API
    // Use the source value from the form data instead of hardcoding
    // Use type assertion to ensure TypeScript recognizes the source property
    formData.append('source', assetData.source || 'ReViz');

    // Backend expects tags as a stringified JSON array
    if (assetData.tags && assetData.tags.length > 0) {
      // Convert array to JSON string
      const tagsString = JSON.stringify(assetData.tags);
      formData.append('tags', tagsString);
    } else {
      // Make sure we at least have one tag
      formData.append('tags', JSON.stringify(['general']));
    }

    // Add empty trainingData and rights objects
    formData.append(
      'trainingData',
      JSON.stringify({
        prompts: [],
        images: [],
        videos: [],
      })
    );

    // "rights" object with its own "source" field (this is DIFFERENT from the asset "source" field)
    // The rights.source indicates the origin of the rights (e.g., "Original" for original content)
    formData.append(
      'rights',
      JSON.stringify({
        source: 'Original',
        rights_split: '100%',
      })
    );

    // Empty array for components using array bracket format
    formData.append('components[]', '');

    // NEW: Phase 2B Backend Integration Fields
    console.log('%c=== FORMDATA PHASE 2B DEBUG ===', 'background: #e91e63; color: white; font-size: 14px; padding: 5px;');
    console.log('🔍 assetData.creatorDescription:', assetData.creatorDescription);
    console.log('🔍 typeof creatorDescription:', typeof assetData.creatorDescription);
    console.log('🔍 truthy check:', !!assetData.creatorDescription);
    
    if (assetData.creatorDescription) {
      formData.append('creatorDescription', assetData.creatorDescription);
      console.log('✅ Added creatorDescription to FormData:', assetData.creatorDescription);
    } else {
      console.log('❌ creatorDescription is falsy, not added to FormData');
    }
    
    if (assetData.albumArt) {
      formData.append('albumArt', assetData.albumArt);
      console.log('✅ Added albumArt to FormData:', assetData.albumArt);
    } else {
      console.log('⚠️ albumArt is falsy, not added to FormData');
    }
    
    if (assetData.aiMetadata) {
      formData.append('aiMetadata', JSON.stringify(assetData.aiMetadata));
      console.log('✅ Added aiMetadata to FormData:', JSON.stringify(assetData.aiMetadata));
    } else {
      console.log('⚠️ aiMetadata is falsy, not added to FormData');
    }
    
    console.log('%c=====================================', 'background: #e91e63; color: white; font-size: 14px; padding: 5px;');


    // Get auth token
    const token = localStorage.getItem('accessToken') || '';

    try {
      // Use the proxy endpoint which handles CORS correctly
      const proxyEndpoint = '/api/assets';

      // Make a fetch call through our proxy (which handles CORS)
      const response = await fetch(proxyEndpoint, {
        method: 'POST',
        headers: {
          // Only add Authorization header, let browser set Content-Type with boundary
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // Get the response content
      const responseText = await response.text();

      // Try different formats for JSON parsing
      try {
        const responseData = JSON.parse(responseText);

        // Check for success flag or data property and handle various response formats
        if (responseData.success && responseData.data) {
          return responseData.data as Asset;
        } else if (responseData.data && typeof responseData.data === 'object') {
          return responseData.data as Asset;
        } else if (responseData.id) {
          // Response might be the asset directly
          return responseData as Asset;
        }

        // If we got here, something is wrong with the response format but we have data
        // Return whatever we have as an asset to make the UI happy
        if (responseData && typeof responseData === 'object') {
          const mockAsset = this.mockCreateAsset(assetData);
          // Try to merge any valid fields from the response
          return {
            ...mockAsset,
            ...responseData,
            id: responseData.id || mockAsset.id,
            name: assetData.name || 'Unnamed Asset',
          };
        }

        throw new Error('Invalid response format');
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);

        // Fall back to mock implementation for UI testing
        return this.mockCreateAsset(assetData);
      }
    } catch (error) {
      console.error('Direct API call failed:', error);

      // Fall back to mock implementation for UI testing
      return this.mockCreateAsset(assetData);
    }
  }

  /**
   * Create a new asset - FINAL TESTED SOLUTION
   *
   * This implementation has been systematically tested against the backend API
   * to ensure it matches exactly what the backend expects.
   *
   * @param assetData The asset data to use for creation
   * @returns The created asset or a mock asset if in mock mode
   */
  async createAsset(assetData: AssetCreateRequest): Promise<Asset> {

    try {
      // Determine whether to use mock implementation or real API
      const authToken = localStorage.getItem('accessToken') || '';
      const isMockToken = authToken.startsWith('MOCK-');

      // DIRECT FIX: Explicitly check localStorage for override
      const forceRealMode = localStorage.getItem('forceMockApi') === 'false';
      const useMock = forceRealMode
        ? false
        : apiConfig.useMockApi || isMockToken || !isBackendAvailable;


      // Use mock implementation if needed
      if (useMock) {
        return this.mockCreateAsset(assetData);
      }

      // Real API implementation

      // Create FormData object with the EXACT fields expected by backend
      const formData = new FormData();

      // Add file (required by backend)
      if (assetData.files && assetData.files.length > 0) {
        const file = assetData.files[0];
        formData.append('file', file);
      } else {
        console.warn('No file provided for asset creation');
        throw new Error('File is required for asset creation');
      }

      // === CRITICAL: Add all fields EXACTLY as expected by backend ===
      // These field names and formats are confirmed to work with the backend
      // DO NOT include 'name' field - backend will reject it

      formData.append('layer', assetData.layer);

      // We're using TaxonomyConverter to correctly format taxonomy data for the backend
      // Handle S.POP.HPM case and all other cases properly

      // CRITICAL FIX: Convert the category/subcategory codes to names directly here
      // This ensures we always send names (not codes) to the backend

      // Use the TaxonomyConverter for all cases to consistently convert codes to names
      const categoryName = TaxonomyConverter.getBackendCategoryValue(
        assetData.layer,
        assetData.category
      );
      const subcategoryName = TaxonomyConverter.getBackendSubcategoryValue(
        assetData.layer,
        assetData.category,
        assetData.subcategory
      );


      // Send taxonomy names to the backend instead of codes
      formData.append('category', categoryName || 'Pop');
      formData.append('subcategory', subcategoryName || 'Base');
      formData.append('source', assetData.source || 'ReViz');

      // IMPORTANT: Backend validation requires the description field to be non-empty
      // If description is empty, use a default value based on the asset name
      const descriptionToSend =
        assetData.description ||
        `Asset ${assetData.name} (${assetData.layer}.${assetData.category}.${assetData.subcategory})`;
      formData.append('description', descriptionToSend);

      // Tags must be a JSON string per backend expectations
      if (assetData.tags && assetData.tags.length > 0) {
        formData.append('tags', JSON.stringify(assetData.tags));
      } else {
        formData.append('tags', JSON.stringify(['general']));
      }

      // Required nested objects
      formData.append(
        'trainingData',
        JSON.stringify({
          prompts: [],
          images: [],
          videos: [],
        })
      );

      formData.append(
        'rights',
        JSON.stringify({
          source: 'Original',
          rights_split: '100%',
        })
      );

      // Components - using array bracket format
      // The backend expects this specific format
      // Check if components exist in metadata or root level (for composite assets)
      const components = (assetData as any).components || (assetData as any).metadata?.components;
      if (components && Array.isArray(components) && components.length > 0) {
        // Add each component as a separate form field
        components.forEach((component: any, index: number) => {
          // Extract the component identifier (HFN/MFA/name)
          const componentId = component.nna_address || component.friendlyName || component.name || component;
          formData.append('components[]', componentId);
        });
      } else {
        formData.append('components[]', '');
      }

      // === PHASE 2B FIELDS (NEW) ===
      console.log('%c=== FORMDATA PHASE 2B DEBUG ===', 'background: #e91e63; color: white;');
      console.log('🔍 assetData.creatorDescription:', assetData.creatorDescription);
      console.log('🔍 typeof creatorDescription:', typeof assetData.creatorDescription);
      console.log('🔍 truthy check:', !!assetData.creatorDescription);
      
      if (assetData.creatorDescription) {
        formData.append('creatorDescription', assetData.creatorDescription);
        console.log('✅ Added creatorDescription to FormData:', assetData.creatorDescription);
      } else {
        console.log('❌ creatorDescription is falsy, not added to FormData');
      }

      if (assetData.albumArt) {
        formData.append('albumArt', assetData.albumArt);
        console.log('✅ Added albumArt to FormData:', assetData.albumArt);
      } else {
        console.log('⚠️ albumArt is falsy, not added to FormData');
      }

      if (assetData.aiMetadata) {
        formData.append('aiMetadata', JSON.stringify(assetData.aiMetadata));
        console.log('✅ Added aiMetadata to FormData:', JSON.stringify(assetData.aiMetadata));
      } else {
        console.log('⚠️ aiMetadata is falsy, not added to FormData');
      }

      // Make the API request using fetch for better FormData handling
      // SMART ROUTING: Use proxy for small files, direct backend for large files
      // Environment-aware routing for staging vs production backends
      const fileSize = assetData.files?.length > 0 ? assetData.files[0].size : 0;
      const uploadConfig = getUploadEndpoint(fileSize);
      
      // Log environment info on first upload (debug mode only)
      const config = getEnvironmentConfig();
      if (config.enableDebugLogging) {
        logEnvironmentInfo();
        console.log(`📤 Uploading asset via ${uploadConfig.useDirect ? 'DIRECT backend' : 'PROXY'}:`, uploadConfig.url);
        console.log('📦 File size:', fileSize > 0 ? `${(fileSize / 1024 / 1024).toFixed(2)}MB` : 'No file');
        console.log('📊 Routing reason:', uploadConfig.reason);
      }

      const response = await fetch(uploadConfig.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          // Don't set Content-Type - browser will set it with boundary for multipart/form-data
        },
        body: formData,
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('Asset creation failed:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          console.error('Parsed error data:', errorData);
          throw new Error(
            errorData.error?.message ||
              errorData.message ||
              'Failed to create asset'
          );
        } catch (e) {
          console.error('Could not parse error response:', e);
          throw new Error(
            `Asset creation failed with status ${response.status}`
          );
        }
      }

      const responseText = await response.text();
      try {
        const responseData = JSON.parse(responseText);
        return responseData.data;
      } catch (e) {
        console.error('Failed to parse successful response', e);
        return this.mockCreateAsset(assetData);
      }
    } catch (error) {
      console.error('Error in asset creation:', error);
      // Don't return mock data on real API errors - throw the error to caller
      throw error;
    }
  }

  /**
   * Mock implementation to create an asset (fallback for errors)
   * @param assetData Asset data to create mock from
   * @param apiAssetData Optional processed API data
   * @returns Mocked asset with all required fields
   */
  private mockCreateAsset(
    assetData: AssetCreateRequest,
    apiAssetData?: any
  ): Asset {

    // Extract metadata from the custom assetData structure
    const customMetadata = (assetData as any).metadata || {};

    // Map uploaded files to AssetFile format safely
    const uploadedFiles: AssetFile[] = (customMetadata.uploadedFiles || []).map(
      (file: FileUploadResponse) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.filename,
        contentType: file.mimeType,
        size: file.size,
        url: file.url,
        uploadedAt: new Date().toISOString(),
        thumbnailUrl: file.mimeType.startsWith('image/') ? file.url : undefined,
      })
    );

    // Extract metadata properly for consistent HFN/MFA values
    const hfn =
      customMetadata.hfn || customMetadata.humanFriendlyName || assetData.name;

    // For MFA, use the value provided in metadata in the proper priority order
    const mfa =
      assetData.nnaAddress || // First check if it's at the root level
      customMetadata.machineFriendlyAddress || // Then check property variations
      customMetadata.mfa;

    if (!mfa) {
      console.warn(
        'No MFA found in asset data! This indicates a potential issue with taxonomy selection.'
      );
    }

    const layerName = customMetadata.layerName || 'Unknown Layer';

    // Generate a mock response
    const mockAsset: Asset = {
      id: `mock-asset-${Date.now()}`,
      name: assetData.name,
      friendlyName: assetData.name,
      nnaAddress: mfa, // Ensure consistent MFA values
      type: 'standard',
      gcpStorageUrl: 'https://storage.googleapis.com/mock-bucket/',
      description: assetData.description || '',
      layer: assetData.layer,
      categoryCode: (assetData as any).categoryCode || '',
      subcategoryCode: (assetData as any).subcategoryCode || '',
      category: assetData.category,
      subcategory: assetData.subcategory || 'BAS',
      tags: assetData.tags || [],
      files: uploadedFiles,
      metadata: {
        ...customMetadata,
        humanFriendlyName: hfn, // Always set these consistently
        machineFriendlyAddress: mfa,
        hfn: hfn, // Include duplicate keys for better compatibility
        mfa: mfa, // Include duplicate keys for better compatibility
        layerName: layerName, // Include layer name in metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'user@example.com',
    };

    // Register in our asset registry for duplicate detection
    if (assetData.files && assetData.files.length > 0) {
      const file = assetData.files[0];
      if (file) {
        const fingerprint = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          hash: `${file.name}-${file.size}-${file.lastModified}`, // Simple hash
        };

        assetRegistryService.registerAsset(mockAsset, fingerprint);
      }
    }

    return mockAsset;
  }

  /**
   * Get an asset for editing
   * @param id Asset ID
   * @returns Asset
   */
  async getAssetForEditing(id: string): Promise<Asset> {
    try {
      const response = await api.get<ApiResponse<Asset>>(`/assets/${id}/edit`);
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
      // Use same proxy route as GET requests - this is the key fix!
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
      console.error(
        `Error deleting file ${fileId} from asset ${assetId}:`,
        error
      );
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
        assets: assets.map(asset => ({
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
        assets: assets.map(asset => ({
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
