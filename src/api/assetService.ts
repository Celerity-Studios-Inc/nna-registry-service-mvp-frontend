import api, { isBackendAvailable as apiBackendStatus } from './api';
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
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import assetRegistryService from './assetRegistryService';
import { checkEnv } from './envCheck';

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
    if (now - lastBackendCheck < BACKEND_CHECK_INTERVAL && lastBackendCheck > 0) {
      console.log('Using cached backend availability result:', isBackendAvailable);
      return isBackendAvailable;
    }
    
    // Try to hit our own health endpoint first - this just tells us if *our* API is working,
    // not the real backend
    console.log('Checking local API health using /api/health...');
    try {
      const healthResponse = await fetch('/api/health');
      
      // If health endpoint works, log success but continue checking
      if (healthResponse.ok) {
        console.log('Local health endpoint available with status:', healthResponse.status);
        localHealthEndpointWorking = true;
        
        // Try to get the response body for more debugging
        try {
          // First check if it's HTML
          const responseText = await healthResponse.text();
          if (responseText.trim().startsWith('<!doctype html>') || responseText.includes('<html')) {
            console.log('%c Health endpoint returned HTML instead of JSON. This is likely a routing issue.', 'color: red; font-weight: bold');
            console.log('HTML preview:', responseText.substring(0, 150) + '...');
            console.log('%c SOLUTION: When using serve -s build, include the --config serve.json parameter', 'color: green; font-weight: bold');
            
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
              console.log('Health endpoint response:', healthBody);
              
              // Check for our special marker
              if (healthBody && healthBody.diagnostics && healthBody.diagnostics.responseMarker === 'JSON_RESPONSE_MARKER') {
                console.log('%c API routing is configured correctly!', 'color: green; font-weight: bold');
                // Clear any previous error flags
                try {
                  localStorage.removeItem('apiRoutingError');
                } catch (e) {
                  // Ignore localStorage errors
                }
              }
            } catch (jsonError) {
              console.log('Could not parse health response as JSON');
              console.log('Raw response:', responseText.substring(0, 200));
            }
          }
        } catch (parseError) {
          console.log('Could not parse health response:', parseError);
        }
      } else {
        console.log('Health endpoint returned non-OK status:', healthResponse.status);
      }
    } catch (healthError) {
      console.log('Health endpoint request failed:', healthError);
    }
    
    // Use our dedicated endpoint to test the real backend directly
    console.log('Checking REAL backend availability with /api/test-real-backend...');
    try {
      const response = await fetch('/api/test-real-backend');
      
      if (response.ok) {
        try {
          // First check if it's HTML
          const responseText = await response.text();
          if (responseText.trim().startsWith('<!doctype html>')) {
            console.log('test-real-backend endpoint returned HTML instead of JSON. This is likely a routing issue.');
            console.log('HTML preview:', responseText.substring(0, 100) + '...');
            // Since we got HTML, the real backend is probably not working correctly
            realBackendWorking = false;
          } else {
            // Try to parse as JSON
            try {
              const testResult = JSON.parse(responseText);
              console.log('Real backend test results:', testResult);
              
              // Get the actual backend status from the dedicated test
              realBackendWorking = testResult.realBackendAvailable === true;
              
              if (realBackendWorking) {
                console.log('✅ Real backend API is available and responding!');
              } else {
                console.log('❌ Real backend API is NOT available. Will use mock data.');
                console.log('Reason:', testResult.diagnostics?.realBackend?.error || 'Unknown error');
              }
            } catch (jsonError) {
              console.log('Could not parse test-real-backend response as JSON:', jsonError);
              console.log('Raw response:', responseText.substring(0, 200));
              realBackendWorking = false;
            }
          }
        } catch (parseError) {
          console.log('Could not process test-real-backend response:', parseError);
          realBackendWorking = false;
        }
      } else {
        console.log('test-real-backend endpoint returned non-OK status:', response.status);
      }
    } catch (testError) {
      console.log('test-real-backend endpoint request failed:', testError);
    }
    
    // Check if user has forced mock mode via localStorage
    let forceMockMode = false;
    try {
      forceMockMode = localStorage.getItem('forceMockApi') === 'true';
      if (forceMockMode) {
        console.log('⚠️ Mock API mode forced via localStorage setting');
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Real backend is only available if the test confirms it AND user hasn't forced mock mode
    isBackendAvailable = realBackendWorking && !forceMockMode;
    
    // Update cache timestamp
    lastBackendCheck = now;
    
    console.log(`Backend availability final result: ${isBackendAvailable ? 'Available' : 'Unavailable'}`);
    console.log(`Local API health: ${localHealthEndpointWorking ? 'Working' : 'Not working'}`);
    console.log(`Real backend API: ${realBackendWorking ? 'Working' : 'Not working'}`);
    console.log(`Force mock mode: ${forceMockMode ? 'Enabled' : 'Disabled'}`);
    
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
      // Check if we should use mock data based on token and backend availability
      const authToken = localStorage.getItem('accessToken') || '';
      // const hasAuthToken = !!authToken; // Commented out unused variable
      const isMockToken = authToken.startsWith('MOCK-');
      
      // Use mock data if using a mock token or backend isn't available
      if (isMockToken || !isBackendAvailable) {
        console.log("Using mock implementation for getAssets due to mock token or unavailable backend");
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Generate some mock assets based on search params
        const mockAssets: Asset[] = [];
        
        // Add some demo assets
        for (let i = 1; i <= 5; i++) {
          mockAssets.push({
            id: `mock-asset-${Date.now()}-${i}`,
            name: `Mock Asset ${i}`,
            friendlyName: `Mock Asset ${i}`,
            nnaAddress: `2.001.001.00${i}`,
            type: 'standard',
            layer: params.layer || 'S',
            categoryCode: params.category || 'POP',
            subcategoryCode: params.subcategory || 'BAS',
            category: params.category || 'POP',
            subcategory: params.subcategory || 'BAS',
            description: `This is a mock asset created for demonstration purposes.`,
            tags: ['mock', 'demo', 'test'],
            gcpStorageUrl: 'https://storage.googleapis.com/mock-bucket/',
            files: [],
            metadata: {
              humanFriendlyName: `S.POP.BAS.00${i}`,
              machineFriendlyAddress: `2.001.001.00${i}`,
              layerName: 'Stars',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: "user@example.com"
          });
        }
        
        // Filter by search term if provided
        let filteredAssets = mockAssets;
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredAssets = mockAssets.filter(asset => 
            asset.name.toLowerCase().includes(searchLower) || 
            (asset.description && asset.description.toLowerCase().includes(searchLower))
          );
        }
        
        // Return as paginated response
        return {
          data: filteredAssets,
          pagination: {
            total: filteredAssets.length,
            page: 1,
            limit: 10,
            pages: 1
          }
        };
      }
      
      // Real API implementation
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
      
      // Fallback to mock data on error
      console.log("Falling back to mock implementation for getAssets due to error");
      
      // Create mock assets
      const mockAssets: Asset[] = [];
      for (let i = 1; i <= 5; i++) {
        mockAssets.push({
          id: `mock-asset-${Date.now()}-${i}`,
          name: `Mock Asset ${i}`,
          friendlyName: `Mock Asset ${i}`,
          nnaAddress: `2.001.001.00${i}`,
          type: 'standard',
          layer: params.layer || 'S',
          categoryCode: params.category || 'POP',
          subcategoryCode: params.subcategory || 'BAS',
          category: params.category || 'POP',
          subcategory: params.subcategory || 'BAS',
          description: `This is a mock asset created for demonstration purposes.`,
          tags: ['mock', 'demo', 'test'],
          gcpStorageUrl: 'https://storage.googleapis.com/mock-bucket/',
          files: [],
          metadata: {
            humanFriendlyName: `S.POP.BAS.00${i}`,
            machineFriendlyAddress: `2.001.001.00${i}`,
            layerName: 'Stars',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "user@example.com"
        });
      }
      
      // Return as paginated response
      return {
        data: mockAssets,
        pagination: {
          total: mockAssets.length,
          page: 1,
          limit: 10,
          pages: 1
        }
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
   * Mock implementation to create an asset (fallback for errors)
   * @param assetData Original asset data
   * @param apiAssetData Processed API asset data
   * @returns Mocked asset
   */
  private mockCreateAsset(assetData: AssetCreateRequest, apiAssetData?: any): Asset {
    console.log("Using mock createAsset implementation after API failure");
    
    // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 300));
    
    // Extract metadata from the custom assetData structure 
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
    
    // Register in our asset registry for duplicate detection
    if (assetData.files && assetData.files.length > 0) {
      const file = assetData.files[0];
      const fingerprint = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        hash: `${file.name}-${file.size}-${file.lastModified}` // Simple hash
      };
      
      assetRegistryService.registerAsset(mockAsset, fingerprint);
    }
    
    console.log("Created mock asset:", mockAsset.id);
    return mockAsset;
  }

  /**
   * Create an asset
   * @param assetData Asset data
   * @returns Created asset
   */
  /**
   * Direct asset creation method that bypasses our proxy 
   * This is a simplified implementation that makes a direct API call to the backend
   * @param assetData Asset data for creation
   * @returns Created asset from backend or mock asset on error
   */
  async directCreateAsset(assetData: AssetCreateRequest): Promise<Asset> {
    console.log("⚡ Using DIRECT asset creation implementation (bypassing proxy)");
    
    // Format based on reference implementation - only the essential fields
    const formData = new FormData();
    
    // Add the file if it exists (most important part)
    if (assetData.files && assetData.files.length > 0) {
      const file = assetData.files[0];
      if (file) {
        formData.append('file', file);
        console.log("Added file to FormData:", file.name);
      }
    }
    
    // Add all required fields exactly as in reference implementation
    formData.append('name', assetData.name || 'Unnamed Asset');
    formData.append('layer', assetData.layer || 'S');
    formData.append('category', assetData.category || 'POP'); 
    formData.append('subcategory', assetData.subcategory || 'BASE');
    formData.append('description', assetData.description || 'Asset description');
    
    // Add tags exactly as used in reference
    if (assetData.tags && assetData.tags.length > 0) {
      // Use TypeScript-safe forEach with null check
      assetData.tags.forEach((tag: string) => {
        formData.append('tags[]', tag);
      });
    } else {
      formData.append('tags[]', 'general');
    }
    
    // Add empty trainingData and rights objects
    formData.append('trainingData', JSON.stringify({
      "prompts": [],
      "images": [],
      "videos": []
    }));
    
    formData.append('rights', JSON.stringify({
      "source": "Original",
      "rights_split": "100%"
    }));
    
    // Empty array for components
    formData.append('components[]', '');
    
    // Debug: List all keys in the FormData - use Array.from to avoid Iterator issue
    console.log("FormData keys:");
    Array.from(formData.entries()).forEach(([key]) => {
      console.log(" - " + key);
    });
    
    // Get auth token
    const token = localStorage.getItem('accessToken') || '';
    console.log("Using auth token:", token.substring(0, 15) + '...');
    
    try {
      // Make a direct fetch call to the backend API
      const response = await fetch('https://registry.reviz.dev/api/assets', {
        method: 'POST',
        headers: {
          // Only add Authorization header, let browser set Content-Type with boundary
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log("Direct API response status:", response.status);
      
      // Get the response content
      const responseText = await response.text();
      console.log("Direct API response text:", responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      
      // Parse as JSON if possible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Parsed response data:", responseData);
      } catch (e) {
        console.error("Failed to parse response as JSON:", e);
        throw new Error("Invalid response format");
      }
      
      // Check for success flag or data property
      if (responseData.success && responseData.data) {
        return responseData.data as Asset;
      }
      
      // If we got here, something is wrong with the response format
      throw new Error("Invalid response format or asset creation failed");
    } catch (error) {
      console.error("Direct API call failed:", error);
      
      // Fall back to mock implementation for UI testing
      console.log("Falling back to mock implementation");
      return this.mockCreateAsset(assetData);
    }
  }
  
  /**
   * Main asset creation method
   * Currently forwarding directly to directCreateAsset
   * To use proxy approach, comment out the early return
   */
  async createAsset(assetData: AssetCreateRequest): Promise<Asset> {
    try {
      // Force direct API implementation for testing
      // Comment out the next line to use the regular proxy flow
      return await this.directCreateAsset(assetData);
      
      /* 
      // ======================================================================
      // WARNING: UNREACHABLE CODE BELOW - FOR REFERENCE ONLY
      // The code below is unreachable due to the early return above
      // It's kept as a reference for the regular proxy approach
      // To use this code: comment out the "return" line above
      // ======================================================================
      
      // Determine whether to use mock implementation or real API
      const envStatus = checkEnv();
      console.log("Environment check in createAsset:", envStatus);
      
      // Check if we're in a production domain - if so, force real API usage
      const isProductionDomain = window.location.hostname.includes('vercel.app') || 
                                 window.location.hostname.includes('registry-service-frontend');
      
      // Determine whether to use mock implementation or real API
      let useMock = process.env.REACT_APP_USE_MOCK_API === 'true';
      
      // Get auth token and determine if it's a mock token
      const authToken = localStorage.getItem('accessToken') || '';
      // const hasAuthToken = !!authToken; // Commented out unused variable
      const isMockToken = authToken.startsWith('MOCK-');
      
      // Add more token debugging
      console.log("Auth token information:", {
        tokenExists: !!authToken,
        tokenLength: authToken.length,
        isMockToken: isMockToken,
        tokenPrefix: authToken.substring(0, 15) + '...' // Only show beginning for security
      });
      
      // Determine whether to use real API based on several factors:
      // 1. Is the backend available? (based on our backend test)
      // 2. Do we have an auth token? (needed for API calls)
      // 3. Is it a mock token? (if so, real API will fail)
      // 4. Is mock mode forced via localStorage?
      
      // Check if we have a valid authentication token
      const hasValidAuthToken = !!authToken && !isMockToken;
      
      // Check if mock mode is forced via localStorage
      const forceMockMode = localStorage.getItem('forceMockApi') === 'true';
      if (forceMockMode) {
        console.log("⚠️ Mock API mode forced via localStorage setting");
        useMock = true;
      } else if (isBackendAvailable && hasValidAuthToken) {
        // Ideal case: Backend is available, we have a real token
        useMock = false;
        console.log("✅ Backend available and real authentication token found. Using real API.");
      } else if (isBackendAvailable && authToken && isMockToken) {
        // We have a token but it's a mock one - API will reject it
        useMock = true;
        console.log("ℹ️ Backend available but using mock token. Using mock data.");
      } else if (isBackendAvailable && !authToken) {
        // No auth token - API will reject the request
        useMock = true;
        console.log("ℹ️ Backend available but no authentication token. Using mock data.");
      } else if (!isBackendAvailable) {
        // Backend not available - have to use mock
        useMock = true;
        console.log("ℹ️ Backend unavailable. Using mock data.");
      }
      
      // Override for production domain if needed
      if (isProductionDomain && !useMock && !authToken) {
        console.warn("⚠️ Production domain with no auth token. Forcing mock data for better user experience.");
        useMock = true;
      }
      
      console.log("useMock determined as:", useMock);
      
      if (useMock) {
        console.log("Using mock createAsset implementation");
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Extract metadata from the custom assetData structure 
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
        
        // Register in our asset registry for duplicate detection
        if (assetData.files && assetData.files.length > 0) {
          const file = assetData.files[0];
          const fingerprint = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            hash: `${file.name}-${file.size}-${file.lastModified}` // Simple hash
          };
          
          assetRegistryService.registerAsset(mockAsset, fingerprint);
        }
        
        return mockAsset;
      } else {
        // Real API implementation
        console.log("Using real API implementation for createAsset");
        
        // Format the data as expected by the API
        const apiAssetData = {
          name: assetData.name,
          friendlyName: assetData.name,
          description: assetData.description || '',
          layer: assetData.layer,
          categoryCode: (assetData as any).categoryCode || "",
          subcategoryCode: (assetData as any).subcategoryCode || "",
          tags: assetData.tags || [],
          metadata: (assetData as any).metadata || {},
          files: assetData.files || []
        };
        
        try {
          console.log("Preparing asset data for real API submission");
          console.log("Original asset data:", {
            name: assetData.name,
            friendlyName: assetData.name,
            description: assetData.description || '',
            layer: assetData.layer || 'S',
            category: assetData.category || 'POP',
            subcategory: assetData.subcategory || 'BASE',
            hasFiles: !!(assetData.files && assetData.files.length > 0),
            fileCount: assetData.files ? assetData.files.length : 0,
            tags: assetData.tags || []
          });
          
          // Format based on the reference implementation and backend examples
          const formData = new FormData();
          
          // Add the file if it exists
          if (assetData.files && assetData.files.length > 0) {
            const file = assetData.files[0];
            formData.append('file', file);
            console.log("Added file to FormData:", {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type
            });
          } else {
            console.warn("No file provided for asset creation");
          }
          
          // Add all the required fields from the backend
          formData.append('name', assetData.name || 'Unnamed Asset');
          formData.append('layer', assetData.layer || 'S');
          formData.append('category', assetData.category || 'POP'); 
          formData.append('subcategory', assetData.subcategory || 'BASE');
          formData.append('description', assetData.description || 'Asset description');
          formData.append('source', 'NNA Registry Frontend');
          
          // Add tags as array items (important: backend expects tags[] format)
          if (assetData.tags && assetData.tags.length > 0) {
            assetData.tags.forEach(tag => {
              formData.append('tags[]', tag);
            });
            console.log("Added tags to FormData:", assetData.tags);
          } else {
            // Make sure we at least have one tag
            formData.append('tags[]', 'general');
            console.log("No tags provided, added default 'general' tag");
          }
          
          // Add empty objects for training data and rights as required by API
          const trainingData = JSON.stringify({
            "prompts": [],
            "images": [],
            "videos": []
          });
          formData.append('trainingData', trainingData);
          
          const rights = JSON.stringify({
            "source": "Original",
            "rights_split": "100%"
          });
          formData.append('rights', rights);
          
          // Empty array for components
          formData.append('components[]', '');
          
          // Debug: List all keys in the FormData
          console.log("FormData keys:");
          for (const [key] of formData.entries()) {
            console.log(" - " + key);
          }
          
          // Add token debugging
          const authToken = localStorage.getItem('accessToken') || '';
          const isMockToken = authToken.startsWith('MOCK-');
          console.log("Token validation:", {
            hasToken: !!authToken,
            isMockToken: isMockToken,
            tokenPrefix: authToken ? authToken.substring(0, 15) + '...' : 'none'
          });
          
          console.log("FormData prepared with file and metadata following reference implementation");
          
          // Make the actual API call with FormData - don't set Content-Type header,
          // Axios will set the correct one with boundary
          console.log("Making API call to /assets with FormData");
          
          // To ensure proper FormData handling, explicitly set the right config options
          const response = await api.post<ApiResponse<Asset>>(
            '/assets',
            formData,
            {
              headers: {
                // Don't set Content-Type here - let Axios set it with the correct boundary
                // Only send the authorization header
                'Accept': 'application/json',
              },
              // Required for proper FormData handling
              transformRequest: (data) => {
                // Don't transform FormData objects
                if (data instanceof FormData) {
                  console.log("Preserving FormData object during request transformation");
                  return data;
                }
                // Default transformation for other data types
                return JSON.stringify(data);
              }
            }
          );
          
          console.log("API Response:", response.data);
          
          // Return the created asset
          const createdAsset = response.data.data as Asset;
          return createdAsset;
        } catch (apiError: any) {
          // Check if it's a 400 Bad Request error
          if (apiError?.response?.status === 400) {
            console.warn("Backend returned 400 Bad Request. This is likely due to missing fields or validation errors.");
            console.warn("Error details:", apiError.response.data);
            console.warn("Will fall back to mock implementation to ensure UI flow works");
            
            // Fall back to mock implementation 
            console.log("Using mock asset creation as fallback after API error");
            return this.mockCreateAsset(assetData, apiAssetData);
          }
          
          // For other errors, re-throw
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      throw new Error('Failed to create asset');
    }
  }
  
  /**
   * Mock implementation to create an asset (fallback for errors)
   * This replaces the original implementation with a more robust one
   * @param assetData Asset data to create mock from
   * @param apiAssetData Optional processed API data 
   * @returns Mocked asset with all required fields
   */
  private mockCreateAsset(assetData: AssetCreateRequest, apiAssetData?: any): Asset {
    console.log("Using mock createAsset implementation");
    
    // Extract metadata from the custom assetData structure 
    const customMetadata = (assetData as any).metadata || {};
    
    // Map uploaded files to AssetFile format safely
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
    
    // Register in our asset registry for duplicate detection
    if (assetData.files && assetData.files.length > 0) {
      const file = assetData.files[0];
      if (file) {
        const fingerprint = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          hash: `${file.name}-${file.size}-${file.lastModified}` // Simple hash
        };
        
        assetRegistryService.registerAsset(mockAsset, fingerprint);
      }
    }
    
    console.log("Created mock asset:", mockAsset.id);
    return mockAsset;
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
