import api, { apiConfig } from './api';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  Asset,
  AssetFile,
  AssetSearchParams,
  SavedSearch,
  SearchGroup,
  SearchCondition,
  SearchOperator,
  SearchConditionType,
  SearchComparisonOperator,
  AssetCreateRequest,
  AssetUpdateRequest,
  FileUpload,
  FileUploadOptions,
  FileUploadResponse,
  AssetUploadResult,
  BatchUploadItem,
  BatchItemMetadata,
  BatchUploadOptions,
  BatchUploadResult,
  CSVTemplate,
  CSVTemplateField,
  VersionInfo,
  VersionChanges,
  FieldChange,
  FileChange,
  MetadataChange,
  CreateVersionRequest,
  RevertVersionRequest,
  AssetAnalyticsFilters,
  AssetsAnalyticsData,
  AssetUsageData,
  TopAssetData,
  UserActivityData,
  PlatformUsageData,
  AssetsByCategoryData,
  AssetTimeseriesDataPoint,
  AssetUsageMetrics,
  RightsVerificationRequest,
  RightsUpdateRequest,
  RightsClearanceRequest,
  AssetRights,
  RightsStatus,
  RightsType,
  RightsLimitation,
  RightsVerificationMethod,
  RightsVerification,
  RightsLimitationDetail,
  RightsClearance,
  RightsUsage,
} from '../../types/asset.types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';

// Mock data for development until the backend API is available
const mockAssets: Asset[] = Array.from({ length: 30 }, (_, i) => ({
  id: `asset-${i + 1}`,
  name: `Asset ${i + 1}`,
  nnaAddress: `G.001.${(i + 1).toString().padStart(3, '0')}`,
  layer: ['G', 'S', 'L', 'M', 'W'][Math.floor(Math.random() * 5)],
  category: '001',
  subcategory: '001',
  description: `This is a sample asset description for ${
    i + 1
  }. It showcases what the asset is about.`,
  tags: ['sample', 'mock', 'demo', 'test'].slice(0, Math.floor(Math.random() * 4) + 1),
  files: [
    {
      id: `file-${i + 1}`,
      filename: `asset-${i + 1}.jpg`,
      contentType: 'image/jpeg',
      size: 1024 * 1024 * (Math.random() * 5 + 1),
      url: `https://via.placeholder.com/300?text=Asset+${i + 1}`,
      uploadedAt: new Date().toISOString(),
      thumbnailUrl: `https://via.placeholder.com/100?text=Asset+${i + 1}`,
    },
  ],
  metadata: {
    key: 'value',
    sample: 'data',
  },
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-1',
}));

// Track ongoing uploads
const activeUploads: Map<string, FileUpload> = new Map();

class AssetService {
  // Use the centralized config for mock data
  private useMockData(): boolean {
    return apiConfig.useMockData;
  }

  async getAssets(params: AssetSearchParams = {}): Promise<PaginatedResponse<Asset>> {
    try {
      console.log('Fetching assets with mock data:', apiConfig.useMockData);

      if (this.useMockData()) {
        console.log('Using mock asset data');
        return this.getMockAssets(params);
      }

      // For complex search params with date objects, convert to ISO strings for API
      const apiParams = this.prepareSearchParams(params);

      const response = await api.get<ApiResponse<PaginatedResponse<Asset>>>('/assets', {
        params: apiParams,
      });
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
  async advancedSearch(params: AssetSearchParams = {}): Promise<PaginatedResponse<Asset>> {
    try {
      if (this.useMockData()) {
        console.log('Using mock asset data for advanced search');
        return this.getMockAssets(params);
      }

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
   * Get saved searches for the current user
   * @returns List of saved searches
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      if (this.useMockData()) {
        return this.getMockSavedSearches();
      }

      const response = await api.get<ApiResponse<SavedSearch[]>>('/assets/searches');
      return response.data.data as SavedSearch[];
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      throw new Error('Failed to fetch saved searches');
    }
  }

  /**
   * Save a search configuration for later use
   * @param search Search to save
   * @returns Created saved search
   */
  async saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'userId'>): Promise<SavedSearch> {
    try {
      if (this.useMockData()) {
        return this.addMockSavedSearch(search);
      }

      const response = await api.post<ApiResponse<SavedSearch>>('/assets/searches', search);
      return response.data.data as SavedSearch;
    } catch (error) {
      console.error('Error saving search:', error);
      throw new Error('Failed to save search');
    }
  }

  /**
   * Update an existing saved search
   * @param id Saved search ID
   * @param search Updated search data
   * @returns Updated saved search
   */
  async updateSavedSearch(
    id: string,
    search: Partial<Omit<SavedSearch, 'id' | 'createdAt' | 'userId'>>
  ): Promise<SavedSearch> {
    try {
      if (this.useMockData()) {
        return this.updateMockSavedSearch(id, search);
      }

      const response = await api.patch<ApiResponse<SavedSearch>>(`/assets/searches/${id}`, search);
      return response.data.data as SavedSearch;
    } catch (error) {
      console.error(`Error updating saved search ${id}:`, error);
      throw new Error('Failed to update saved search');
    }
  }

  /**
   * Delete a saved search
   * @param id Saved search ID
   */
  async deleteSavedSearch(id: string): Promise<void> {
    try {
      if (this.useMockData()) {
        this.deleteMockSavedSearch(id);
        return;
      }

      await api.delete<ApiResponse<void>>(`/assets/searches/${id}`);
    } catch (error) {
      console.error(`Error deleting saved search ${id}:`, error);
      throw new Error('Failed to delete saved search');
    }
  }

  /**
   * Set a saved search as the default
   * @param id Saved search ID
   * @returns Updated saved search
   */
  async setDefaultSavedSearch(id: string): Promise<SavedSearch> {
    try {
      if (this.useMockData()) {
        return this.setMockDefaultSavedSearch(id);
      }

      const response = await api.post<ApiResponse<SavedSearch>>(`/assets/searches/${id}/default`);
      return response.data.data as SavedSearch;
    } catch (error) {
      console.error(`Error setting default saved search ${id}:`, error);
      throw new Error('Failed to set default saved search');
    }
  }

  /**
   * Prepare search parameters for API call, handling date conversions, etc.
   */
  private prepareSearchParams(params: AssetSearchParams): Record<string, any> {
    const apiParams: Record<string, any> = { ...params };

    // Convert Date objects to ISO strings
    if (params.createdAfter instanceof Date) {
      apiParams.createdAfter = params.createdAfter.toISOString();
    }
    if (params.createdBefore instanceof Date) {
      apiParams.createdBefore = params.createdBefore.toISOString();
    }
    if (params.updatedAfter instanceof Date) {
      apiParams.updatedAfter = params.updatedAfter.toISOString();
    }
    if (params.updatedBefore instanceof Date) {
      apiParams.updatedBefore = params.updatedBefore.toISOString();
    }

    // Convert any complex structures to JSON strings if needed for GET parameters
    // For POST requests (advancedSearch), we can send complex objects directly

    return apiParams;
  }

  async getAssetById(id: string): Promise<Asset> {
    try {
      if (this.useMockData()) {
        console.log('Using mock asset data for ID:', id);
        const asset = mockAssets.find(a => a.id === id);
        if (!asset) {
          // If not found by ID, return the first asset as a fallback for demo
          return mockAssets[0];
        }
        return asset;
      }

      const response = await api.get<ApiResponse<Asset>>(`/assets/${id}`);
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error fetching asset with ID ${id}:`, error);
      throw new Error('Failed to fetch asset');
    }
  }

  async getAssetByNnaAddress(nnaAddress: string): Promise<Asset> {
    try {
      if (this.useMockData()) {
        console.log('Using mock asset data for NNA address:', nnaAddress);
        const asset = mockAssets.find(a => a.nna_address === nnaAddress);
        if (!asset) {
          // If not found by NNA address, return the first asset as a fallback for demo
          return mockAssets[0];
        }
        return asset;
      }

      const response = await api.get<ApiResponse<Asset>>(`/assets/nna/${nnaAddress}`);
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error fetching asset with NNA address ${nnaAddress}:`, error);
      throw new Error('Failed to fetch asset');
    }
  }

  /**
   * Upload a single file with progress tracking
   * @param file The file to upload
   * @param options Options for tracking progress, completion, and errors
   * @returns FileUpload object with tracking information
   */
  uploadFile(file: File, options?: FileUploadOptions): FileUpload {
    const fileId = uuidv4();
    const abortController = new AbortController();

    // Create file upload object for tracking
    const fileUpload: FileUpload = {
      file,
      id: fileId,
      progress: 0,
      status: 'pending',
      abortController,
      startTime: Date.now(),
    };

    // Store in active uploads
    activeUploads.set(fileId, fileUpload);

    // Ensure file size doesn't exceed limit (default 100MB)
    const maxFileSize = options?.maxSize || 100 * 1024 * 1024; // 100MB default
    if (file.size > maxFileSize) {
      fileUpload.status = 'error';
      fileUpload.error = `File exceeds maximum size of ${(maxFileSize / (1024 * 1024)).toFixed(
        2
      )}MB`;
      fileUpload.errorCode = 'FILE_TOO_LARGE';
      activeUploads.set(fileId, fileUpload);
      options?.onError?.(fileId, fileUpload.error, fileUpload.errorCode);
      return fileUpload;
    }

    // Validate the file if a validator is provided
    const validateAndUpload = async () => {
      try {
        // Trigger the onStart callback
        options?.onStart?.(fileId, file);

        // Validate the file if a validator is provided
        if (options?.validateBeforeUpload) {
          let isValid: boolean;
          try {
            isValid = await Promise.resolve(options.validateBeforeUpload(file));
          } catch (validationError) {
            throw new Error(
              `Validation error: ${
                validationError instanceof Error ? validationError.message : String(validationError)
              }`
            );
          }

          if (!isValid) {
            fileUpload.status = 'error';
            fileUpload.error = 'File validation failed';
            fileUpload.errorCode = 'VALIDATION_FAILED';
            activeUploads.set(fileId, fileUpload);
            options?.onError?.(fileId, 'File validation failed', 'VALIDATION_FAILED');
            return;
          }
        }

        // Start the upload process
        this.processFileUpload(fileUpload, options);
      } catch (error) {
        fileUpload.status = 'error';
        fileUpload.error =
          error instanceof Error ? error.message : 'Unknown error during validation';
        fileUpload.errorCode = 'VALIDATION_ERROR';
        activeUploads.set(fileId, fileUpload);
        options?.onError?.(fileId, fileUpload.error, fileUpload.errorCode);
      }
    };

    // Start the validation and upload process asynchronously
    validateAndUpload();

    return fileUpload;
  }

  /**
   * Process a file upload with progress tracking
   * @param fileUpload The FileUpload object
   * @param options Options for tracking progress, completion, and errors
   */
  private async processFileUpload(
    fileUpload: FileUpload,
    options?: FileUploadOptions
  ): Promise<void> {
    const { file, id, abortController } = fileUpload;
    let lastLoaded = 0;
    let lastLoadedTime = Date.now();
    let retryCount = 0;
    const maxRetries = options?.retryCount || 0;
    const retryDelay = options?.retryDelay || 2000;
    const chunkSize = options?.chunkSize || 0; // 0 means no chunking

    const updateUploadSpeed = (loaded: number) => {
      const now = Date.now();
      const timeDiff = now - lastLoadedTime;
      if (timeDiff >= 500) {
        // Update speed every 500ms
        const loadedDiff = loaded - lastLoaded;
        fileUpload.uploadSpeed = (loadedDiff / timeDiff) * 1000; // bytes per second

        // Update estimated time remaining
        if (file.size && fileUpload.uploadSpeed && fileUpload.uploadSpeed > 0) {
          const bytesRemaining = file.size - loaded;
          fileUpload.estimatedTimeRemaining = bytesRemaining / fileUpload.uploadSpeed;
        }

        lastLoaded = loaded;
        lastLoadedTime = now;
      }
    };

    const executeUpload = async (): Promise<void> => {
      try {
        // Update status to uploading
        fileUpload.status = 'uploading';
        activeUploads.set(id, fileUpload);

        if (this.useMockData()) {
          // Simulate upload with mock data
          await this.simulateFileUpload(fileUpload, options);
          return;
        }

        // Create form data for the file
        const formData = new FormData();
        formData.append('file', file);

        // Add metadata if provided
        console.log(options, 'options');

        if (options?.metadata) {
          for (const [key, value] of Object.entries(options.metadata)) {
            formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
          }
        }

        // Set up the request with progress tracking
        const response = await api.post<ApiResponse<FileUploadResponse>>('/assets', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            // 'X-File-Id': id, // Add file ID to headers for server identification
          },
          signal: abortController.signal,
          onUploadProgress: progressEvent => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);

              // Update progress in the tracking object
              fileUpload.progress = progress;

              // Update upload speed
              updateUploadSpeed(progressEvent.loaded);

              activeUploads.set(id, fileUpload);

              // Call progress callback if provided
              options?.onProgress?.(id, progress);
            }
          },
          // Set timeout to avoid hanging uploads
          timeout: options?.timeout || 30 * 60 * 1000, // 30 minutes default
        });

        // Update status to completed
        fileUpload.status = 'completed';
        fileUpload.progress = 100;
        fileUpload.endTime = Date.now();
        fileUpload.estimatedTimeRemaining = 0;
        activeUploads.set(id, fileUpload);

        // Call completion callback if provided
        const fileData = response.data.data as FileUploadResponse;
        options?.onComplete?.(id, fileData);
      } catch (error) {
        // Skip aborting a request that was intentionally aborted
        if (axios.isCancel(error)) {
          console.log(`Upload ${id} was canceled`);
          fileUpload.status = 'cancelled';
          fileUpload.endTime = Date.now();
          activeUploads.set(id, fileUpload);
          options?.onCancel?.(id);
          return;
        }

        // Network or server error
        const isNetworkError =
          !axios.isAxiosError(error) || (axios.isAxiosError(error) && !error.response);

        // Handle error
        const errorMessage = error instanceof Error ? error.message : 'File upload failed';
        let errorCode = 'UNKNOWN_ERROR';

        if (axios.isAxiosError(error)) {
          if (error.code) {
            errorCode = error.code;
          } else if (error.response) {
            errorCode = `SERVER_ERROR_${error.response.status}`;
          } else if (error.request) {
            errorCode = 'NETWORK_ERROR';
          }
        }

        // Check if we should retry - only retry network errors and certain server errors
        const shouldRetry =
          retryCount < maxRetries &&
          (isNetworkError ||
            (axios.isAxiosError(error) && error.response && error.response.status >= 500));

        if (shouldRetry) {
          console.log(`Retrying upload for ${file.name} (attempt ${retryCount + 1}/${maxRetries})`);
          retryCount++;

          // Wait before retrying with exponential backoff
          const exponentialDelay = retryDelay * Math.pow(2, retryCount - 1);
          const actualDelay = Math.min(exponentialDelay, 30000); // Cap at 30 seconds

          console.log(`Waiting ${actualDelay}ms before retry`);
          await new Promise(resolve => setTimeout(resolve, actualDelay));

          // Try again
          return executeUpload();
        }

        // If we've reached max retries or no retries are configured, mark as error
        fileUpload.status = 'error';
        fileUpload.error = errorMessage;
        fileUpload.errorCode = errorCode;
        fileUpload.endTime = Date.now();
        activeUploads.set(id, fileUpload);

        // Call error callback if provided
        options?.onError?.(id, errorMessage, errorCode);

        console.error(`Error uploading file ${file.name}:`, error);
      }
    };

    // Start the upload process
    return executeUpload();
  }

  /**
   * Simulate file upload with progress for mock data mode
   */
  private async simulateFileUpload(
    fileUpload: FileUpload,
    options?: FileUploadOptions
  ): Promise<void> {
    const { file, id } = fileUpload;
    const totalSteps = 10;
    const totalSimulatedTime = 3000; // Total simulation time in ms
    const stepTime = totalSimulatedTime / totalSteps;
    const simulatedSpeed = file.size / (totalSimulatedTime / 1000); // bytes per second

    // Simulate upload progress
    for (let step = 1; step <= totalSteps; step++) {
      // Check if upload was cancelled
      if (fileUpload.status !== 'uploading') {
        if (fileUpload.status === 'pending') {
          fileUpload.status = 'cancelled';
          fileUpload.endTime = Date.now();
          activeUploads.set(id, fileUpload);
          options?.onCancel?.(id);
        }
        return;
      }

      // Calculate and update progress
      const progress = Math.round((step / totalSteps) * 100);
      const loaded = Math.round((step / totalSteps) * file.size);

      // Update tracking info
      fileUpload.progress = progress;
      fileUpload.uploadSpeed = simulatedSpeed;
      fileUpload.estimatedTimeRemaining = (totalSteps - step) * (stepTime / 1000);
      activeUploads.set(id, fileUpload);

      // Call progress callback
      options?.onProgress?.(id, progress);

      // Wait a bit to simulate network delay
      await new Promise(resolve => setTimeout(resolve, stepTime));
    }

    // Create mock response data
    const responseData: FileUploadResponse = {
      id: uuidv4(),
      filename: file.name,
      contentType: file.type,
      size: file.size,
      url: URL.createObjectURL(file), // Create local object URL for preview
      thumbnailUrl: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : `https://via.placeholder.com/100?text=${encodeURIComponent(file.name)}`,
      uploadedAt: new Date().toISOString(),
    };

    // Update status to completed
    fileUpload.status = 'completed';
    fileUpload.progress = 100;
    fileUpload.endTime = Date.now();
    fileUpload.estimatedTimeRemaining = 0;
    activeUploads.set(id, fileUpload);

    // Call completion callback
    options?.onComplete?.(id, responseData);
  }

  /**
   * Cancel an active file upload
   * @param fileId The ID of the file upload to cancel
   */
  cancelUpload(fileId: string): boolean {
    const upload = activeUploads.get(fileId);

    if (!upload) {
      return false;
    }

    // Abort the upload
    upload.abortController.abort();
    upload.status = 'cancelled';
    upload.endTime = Date.now();
    activeUploads.set(fileId, upload);

    return true;
  }

  /**
   * Get the current status of a file upload
   * @param fileId The ID of the file upload
   */
  getUploadStatus(fileId: string): FileUpload | undefined {
    return activeUploads.get(fileId);
  }

  /**
   * Create an asset with files and track upload progress
   * @param assetData The asset data to create
   * @param options Options for tracking upload progress
   */
  // Utility function to convert prompts to text files
  private convertPromptsToFiles(
    prompts: string[],
    categories?: Record<string, string[]>,
    promptMetadata?: Record<string, any>
  ): File[] {
    const files: File[] = [];

    // Process regular prompts
    prompts.forEach((prompt, index) => {
      const promptBlob = new Blob([prompt], { type: 'text/plain' });
      const fileName = `prompt-${index + 1}-${Date.now()}.txt`;
      const file = new File([promptBlob], fileName, { type: 'text/plain' });
      files.push(file);
    });

    // Process categorized prompts if present
    if (categories) {
      Object.entries(categories).forEach(([category, categoryPrompts], categoryIndex) => {
        categoryPrompts.forEach((prompt, promptIndex) => {
          const promptBlob = new Blob([prompt], { type: 'text/plain' });
          const fileName = `prompt-category-${categoryIndex + 1}-${
            promptIndex + 1
          }-${Date.now()}.txt`;
          const file = new File([promptBlob], fileName, {
            type: 'text/plain',
          });

          // Add custom property to track category
          Object.defineProperty(file, 'promptCategory', {
            value: category,
            writable: false,
          });

          files.push(file);
        });
      });
    }

    return files;
  }

  async createAssetWithFiles(
    assetData: AssetCreateRequest,
    options?: FileUploadOptions
  ): Promise<AssetUploadResult> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset creation with files');

        // Create base asset without files first
        const baseAsset: Asset = {
          id: `asset-${mockAssets.length + 1}`,
          name: assetData.name,
          nna_address: `${assetData.layer}.${assetData.category || '001'}.${(mockAssets.length + 1)
            .toString()
            .padStart(3, '0')}`,
          layer: assetData.layer,
          category: assetData.category,
          subcategory: assetData.subcategory,
          description: assetData.description,
          tags: assetData.tags,
          metadata: assetData.metadata,
          files: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          registeredBy: 'user-1',
        };

        // Track uploaded files and failures
        const uploadedFiles: FileUploadResponse[] = [];
        const failedFiles: { file: File; error: string }[] = [];

        // Process each file if any
        if (assetData.files && assetData.files.length > 0) {
          for (const file of assetData.files) {
            // Create a unique upload ID
            const uploadId = uuidv4();

            // Create file upload tracking
            const fileUpload: FileUpload = {
              file,
              id: uploadId,
              progress: 0,
              status: 'pending',
              abortController: new AbortController(),
            };

            try {
              // Simulate the upload
              await this.simulateFileUpload(fileUpload, {
                onProgress: options?.onProgress,
                onComplete: (fileId, fileData) => {
                  uploadedFiles.push(fileData);
                  options?.onComplete?.(fileId, fileData);
                },
                onError: options?.onError,
              });
            } catch (error) {
              failedFiles.push({
                file,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        }

        // Add the uploaded files to the asset
        baseAsset.files = uploadedFiles.map(file => ({
          id: file.id,
          filename: file.filename,
          contentType: file.contentType,
          size: file.size,
          url: file.url,
          uploadedAt: file.uploadedAt,
          thumbnailUrl: file.thumbnailUrl,
        }));

        // Add the asset to mock data
        mockAssets.push(baseAsset);

        return {
          asset: baseAsset,
          uploadedFiles,
          failedFiles,
        };
      }

      // For real API implementation:
      // 1. Upload each file individually with progress tracking
      const uploadTasks: Promise<FileUploadResponse>[] = [];
      const uploadedFiles: FileUploadResponse[] = [];
      const failedFiles: { file: File; error: string }[] = [];

      // Process each file if any
      // if (assetData.files && assetData.files.length > 0) {
      //   for (const file of assetData.files) {
      //     const fileUpload = this.uploadFile(file, {
      //       onProgress: options?.onProgress,
      //       onComplete: options?.onComplete,
      //       onError: options?.onError,
      //     });

      //     // Create a promise for this upload
      //     const uploadPromise = new Promise<FileUploadResponse>((resolve, reject) => {
      //       // Poll the upload status until completion or error
      //       const checkStatus = () => {
      //         const status = this.getUploadStatus(fileUpload.id);

      //         if (!status) {
      //           reject(new Error('Upload not found'));
      //           return;
      //         }

      //         if (status.status === 'completed') {
      //           // When completed, the API response is stored in options.onComplete callback
      //           // We need to reconstruct that here since we don't have direct access
      //           const response: FileUploadResponse = {
      //             id: uuidv4(), // This would come from the server
      //             filename: file.name,
      //             contentType: file.type,
      //             size: file.size,
      //             url: URL.createObjectURL(file), // Temporary URL
      //             uploadedAt: new Date().toISOString(),
      //           };
      //           resolve(response);
      //         } else if (status.status === 'error') {
      //           reject(new Error(status.error || 'Upload failed'));
      //         } else {
      //           // Still in progress, check again after a short delay
      //           setTimeout(checkStatus, 500);
      //         }
      //       };

      //       // Start checking status
      //       checkStatus();
      //     });

      //     // Handle success and failure for this upload
      //     uploadPromise
      //       .then(fileData => {
      //         uploadedFiles.push(fileData);
      //       })
      //       .catch(error => {
      //         failedFiles.push({
      //           file,
      //           error: error instanceof Error ? error.message : 'Unknown error',
      //         });
      //       });

      //     uploadTasks.push(uploadPromise);
      //   }
      // }

      // Wait for all uploads to complete
      await Promise.allSettled(uploadTasks);

      // Create the asset with the uploaded file IDs
      const formData = new FormData();
      formData.append('layer', assetData.layer);

      if (assetData.category) formData.append('category', assetData.category);
      if (assetData.subcategory) formData.append('subcategory', assetData.subcategory);
      if (assetData.description) formData.append('description', assetData.description);
      if (assetData.tags) formData.append('tags', JSON.stringify(assetData.tags));
      if (assetData?.metadata?.source) formData.append('source', assetData.metadata?.source);

      if (assetData.layer === 'C' && assetData?.metadata?.components.length <= 0) {
        throw Error('Components is required');
      }

      assetData?.metadata?.components?.forEach((component: any) => {
        formData.append('components', component);
      });

      // Add the IDs of successfully uploaded files
      if (uploadedFiles.length > 0) {
        formData.append('fileIds', JSON.stringify(uploadedFiles.map(file => file.id)));
      }

      if (assetData.files && assetData.files.length > 0) {
        assetData.files.forEach((file, index) => {
          formData.append('file', file);
        });
      }

      // Create the asset with the uploaded files
      const response = await api.post<ApiResponse<Asset>>('/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const asset = response.data.data as Asset;

      return {
        asset,
        uploadedFiles,
        failedFiles,
      };
    } catch (error) {
      console.error('Error creating asset with files:', error);
      throw new Error('Failed to create asset with files');
    }
  }

  /**
   * Create an asset with standard approach (no advanced upload tracking)
   */
  async createAsset(assetData: AssetCreateRequest): Promise<Asset> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset creation');
        const newAsset: Asset = {
          id: `asset-${mockAssets.length + 1}`,
          name: assetData.name,
          nna_address: `${assetData.layer}.${assetData.category || '001'}.${(mockAssets.length + 1)
            .toString()
            .padStart(3, '0')}`,
          layer: assetData.layer,
          category: assetData.category,
          subcategory: assetData.subcategory,
          description: assetData.description,
          tags: assetData.tags,
          metadata: assetData.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          registeredBy: 'user-1',
        };
        mockAssets.push(newAsset);
        return newAsset;
      }

      const formData = new FormData();
      formData.append('name', assetData.name);
      formData.append('layer', assetData.layer);

      if (assetData.category) formData.append('category', assetData.category);
      if (assetData.subcategory) formData.append('subcategory', assetData.subcategory);
      if (assetData.description) formData.append('description', assetData.description);
      if (assetData.tags) formData.append('tags', JSON.stringify(assetData.tags));
      if (assetData.metadata) formData.append('metadata', JSON.stringify(assetData.metadata));

      // Add files to form data
      if (assetData.files && assetData.files.length > 0) {
        assetData.files.forEach((file, index) => {
          formData.append(`files`, file);
        });
      }

      const response = await api.post<ApiResponse<Asset>>('/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data as Asset;
    } catch (error) {
      console.error('Error creating asset:', error);
      throw new Error('Failed to create asset');
    }
  }

  /**
   * Get an asset for editing (may include additional edit-specific data)
   * @param id Asset ID
   * @returns Asset with edit-specific data
   */
  async getAssetForEditing(id: string): Promise<Asset> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for getting asset for editing');
        const asset = mockAssets.find(a => a.id === id);
        if (!asset) {
          throw new Error('Asset not found');
        }
        return { ...asset }; // Return a copy to avoid unintended mutations
      }

      // In a real implementation, this might hit a different endpoint
      // that includes additional edit-specific data
      const response = await api.get<ApiResponse<Asset>>(`/assets/${id}/edit`);
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error fetching asset for editing with ID ${id}:`, error);
      // Fallback to regular fetch if edit-specific endpoint fails
      try {
        return await this.getAssetById(id);
      } catch (secondError) {
        throw new Error('Failed to fetch asset for editing');
      }
    }
  }

  /**
   * Update an existing asset
   * @param id Asset ID
   * @param updateData Asset update data
   * @returns Updated asset
   */
  async updateAsset(id: string, updateData: AssetUpdateRequest): Promise<Asset> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset update');
        const assetIndex = mockAssets.findIndex(a => a.id === id);
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }

        // Handle files separately to ensure type compatibility
        const files = updateData.files
          ? mockAssets[assetIndex].files || []
          : mockAssets[assetIndex].files;

        // Create updated asset with correct types
        const updatedAsset: Asset = {
          ...mockAssets[assetIndex],
          name: updateData.name || mockAssets[assetIndex].name,
          description: updateData.description || mockAssets[assetIndex].description,
          tags: updateData.tags || mockAssets[assetIndex].tags,
          // For taxonomy updates, if provided in the update data
          layer: updateData.layer || mockAssets[assetIndex].layer,
          category: updateData.category || mockAssets[assetIndex].category,
          subcategory: updateData.subcategory || mockAssets[assetIndex].subcategory,
          metadata: updateData.metadata || mockAssets[assetIndex].metadata,
          files,
          updatedAt: new Date().toISOString(),
        };

        // If there are new files, add mock file entries for them
        if (updateData.files && updateData.files.length > 0) {
          if (!updatedAsset.files) {
            updatedAsset.files = [];
          }

          // Add mock entries for each new file
          updateData.files.forEach(file => {
            const newFile: AssetFile = {
              id: uuidv4(),
              filename: file.name,
              contentType: file.type,
              size: file.size,
              url: URL.createObjectURL(file),
              uploadedAt: new Date().toISOString(),
              thumbnailUrl: file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : `https://via.placeholder.com/100?text=${encodeURIComponent(file.name)}`,
            };
            updatedAsset.files!.push(newFile);
          });
        }

        mockAssets[assetIndex] = updatedAsset;
        return updatedAsset;
      }

      // If files are included, use multipart form data
      if (updateData.files && updateData.files.length > 0) {
        const formData = new FormData();

        // Add non-file fields
        if (updateData.name) formData.append('name', updateData.name);
        if (updateData.description) formData.append('description', updateData.description);
        if (updateData.tags) formData.append('tags', JSON.stringify(updateData.tags));
        if (updateData.layer) formData.append('layer', updateData.layer);
        if (updateData.category) formData.append('category', updateData.category);
        if (updateData.subcategory) formData.append('subcategory', updateData.subcategory);
        if (updateData.metadata) formData.append('metadata', JSON.stringify(updateData.metadata));

        // Add files
        updateData.files.forEach(file => {
          formData.append('files', file);
        });

        const response = await api.patch<ApiResponse<Asset>>(`/assets/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data.data as Asset;
      } else {
        // No files, use standard JSON request
        const response = await api.patch<ApiResponse<Asset>>(`/assets/${id}`, updateData);
        return response.data.data as Asset;
      }
    } catch (error) {
      console.error(`Error updating asset with ID ${id}:`, error);
      throw new Error('Failed to update asset');
    }
  }

  /**
   * Update an asset with files, supporting progress tracking
   * @param id Asset ID to update
   * @param updateData Update data with files
   * @param options Upload progress options
   * @returns Result containing updated asset and upload info
   */
  async updateAssetWithFiles(
    id: string,
    updateData: AssetUpdateRequest,
    options?: FileUploadOptions
  ): Promise<AssetUploadResult> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset update with files');

        // Get the existing asset
        const assetIndex = mockAssets.findIndex(a => a.id === id);
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }

        // Create base updated asset without new files first
        const baseAsset: Asset = {
          ...mockAssets[assetIndex],
          name: updateData.name || mockAssets[assetIndex].name,
          description: updateData.description || mockAssets[assetIndex].description,
          tags: updateData.tags || mockAssets[assetIndex].tags,
          layer: updateData.layer || mockAssets[assetIndex].layer,
          category: updateData.category || mockAssets[assetIndex].category,
          subcategory: updateData.subcategory || mockAssets[assetIndex].subcategory,
          metadata: updateData.metadata || mockAssets[assetIndex].metadata,
          updatedAt: new Date().toISOString(),
        };

        // Track uploaded files and failures
        const uploadedFiles: FileUploadResponse[] = [];
        const failedFiles: { file: File; error: string }[] = [];

        // Process each file if any
        if (updateData.files && updateData.files.length > 0) {
          for (const file of updateData.files) {
            // Create a unique upload ID
            const uploadId = uuidv4();

            // Create file upload tracking
            const fileUpload: FileUpload = {
              file,
              id: uploadId,
              progress: 0,
              status: 'pending',
              abortController: new AbortController(),
            };

            try {
              // Simulate the upload
              await this.simulateFileUpload(fileUpload, {
                onProgress: options?.onProgress,
                onComplete: (fileId, fileData) => {
                  uploadedFiles.push(fileData);
                  options?.onComplete?.(fileId, fileData);
                },
                onError: options?.onError,
              });
            } catch (error) {
              failedFiles.push({
                file,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        }

        // Add the uploaded files to the asset (don't remove existing files)
        if (!baseAsset.files) {
          baseAsset.files = [];
        }

        // Add new files to the asset
        baseAsset.files = [
          ...baseAsset.files,
          ...uploadedFiles.map(file => ({
            id: file.id,
            filename: file.filename,
            contentType: file.contentType,
            size: file.size,
            url: file.url,
            uploadedAt: file.uploadedAt,
            thumbnailUrl: file.thumbnailUrl,
          })),
        ];

        // Update the asset in mock data
        mockAssets[assetIndex] = baseAsset;

        return {
          asset: baseAsset,
          uploadedFiles,
          failedFiles,
        };
      }

      // For real API implementation:
      // 1. Upload each file individually with progress tracking
      const uploadTasks: Promise<FileUploadResponse>[] = [];
      const uploadedFiles: FileUploadResponse[] = [];
      const failedFiles: { file: File; error: string }[] = [];

      // Process each file if any
      if (updateData.files && updateData.files.length > 0) {
        for (const file of updateData.files) {
          const fileUpload = this.uploadFile(file, {
            onProgress: options?.onProgress,
            onComplete: options?.onComplete,
            onError: options?.onError,
          });

          // Create a promise for this upload
          const uploadPromise = new Promise<FileUploadResponse>((resolve, reject) => {
            // Poll the upload status until completion or error
            const checkStatus = () => {
              const status = this.getUploadStatus(fileUpload.id);

              if (!status) {
                reject(new Error('Upload not found'));
                return;
              }

              if (status.status === 'completed') {
                // When completed, the API response is stored in options.onComplete callback
                // We need to reconstruct that here since we don't have direct access
                const response: FileUploadResponse = {
                  id: uuidv4(), // This would come from the server
                  filename: file.name,
                  contentType: file.type,
                  size: file.size,
                  url: URL.createObjectURL(file), // Temporary URL
                  uploadedAt: new Date().toISOString(),
                };
                resolve(response);
              } else if (status.status === 'error') {
                reject(new Error(status.error || 'Upload failed'));
              } else {
                // Still in progress, check again after a short delay
                setTimeout(checkStatus, 500);
              }
            };

            // Start checking status
            checkStatus();
          });

          // Handle success and failure for this upload
          uploadPromise
            .then(fileData => {
              uploadedFiles.push(fileData);
            })
            .catch(error => {
              failedFiles.push({
                file,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            });

          uploadTasks.push(uploadPromise);
        }
      }

      // Wait for all uploads to complete
      await Promise.allSettled(uploadTasks);

      // Update the asset with the uploaded file IDs
      const formData = new FormData();

      // Add update data
      if (updateData.name) formData.append('name', updateData.name);
      if (updateData.description) formData.append('description', updateData.description);
      if (updateData.tags) formData.append('tags', JSON.stringify(updateData.tags));
      if (updateData.layer) formData.append('layer', updateData.layer);
      if (updateData.category) formData.append('category', updateData.category);
      if (updateData.subcategory) formData.append('subcategory', updateData.subcategory);
      if (updateData.metadata) formData.append('metadata', JSON.stringify(updateData.metadata));

      // Add the IDs of successfully uploaded files
      if (uploadedFiles.length > 0) {
        formData.append('fileIds', JSON.stringify(uploadedFiles.map(file => file.id)));
      }

      // Update the asset with the uploaded files
      const response = await api.patch<ApiResponse<Asset>>(`/assets/${id}`, formData);
      const updatedAsset = response.data.data as Asset;

      return {
        asset: updatedAsset,
        uploadedFiles,
        failedFiles,
      };
    } catch (error) {
      console.error(`Error updating asset ${id} with files:`, error);
      throw new Error('Failed to update asset with files');
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset deletion');
        const assetIndex = mockAssets.findIndex(a => a.id === id);
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }

        mockAssets.splice(assetIndex, 1);
        return;
      }

      await api.delete<ApiResponse<void>>(`/assets/${id}`);
    } catch (error) {
      console.error(`Error deleting asset with ID ${id}:`, error);
      throw new Error('Failed to delete asset');
    }
  }

  /**
   * Delete a file from an asset
   * @param assetId The ID of the asset
   * @param fileId The ID of the file to delete
   */
  async deleteAssetFile(assetId: string, fileId: string): Promise<Asset> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for file deletion');
        const assetIndex = mockAssets.findIndex(a => a.id === assetId);
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }

        const asset = mockAssets[assetIndex];
        if (!asset.files) {
          throw new Error('Asset has no files');
        }

        const fileIndex = asset.files.findIndex(f => f.id === fileId);
        if (fileIndex === -1) {
          throw new Error('File not found');
        }

        // Remove the file
        asset.files.splice(fileIndex, 1);
        asset.updatedAt = new Date().toISOString();

        mockAssets[assetIndex] = asset;
        return asset;
      }

      const response = await api.delete<ApiResponse<Asset>>(`/assets/${assetId}/files/${fileId}`);
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error deleting file ${fileId} from asset ${assetId}:`, error);
      throw new Error('Failed to delete file from asset');
    }
  }

  /**
   * Update the order of assets
   * @param assets Array of assets with updated order
   */
  async updateAssetOrder(assets: Asset[]): Promise<void> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset order update');

        // Update the assets in the mock data
        assets.forEach(updatedAsset => {
          const assetIndex = mockAssets.findIndex(a => a.id === updatedAsset.id);
          if (assetIndex !== -1) {
            mockAssets[assetIndex] = {
              ...mockAssets[assetIndex],
              order: updatedAsset.order,
              updatedAt: new Date().toISOString(),
            };
          }
        });

        return Promise.resolve();
      }

      // Construct payload with just the necessary data
      const orderUpdatePayload = assets.map(asset => ({
        id: asset.id,
        order: asset.order,
      }));

      await api.patch<ApiResponse<void>>('/assets/order', { assets: orderUpdatePayload });
    } catch (error) {
      console.error('Error updating asset order:', error);
      throw new Error('Failed to update asset order');
    }
  }

  /**
   * Update asset group assignments
   * @param assets Array of assets with updated group assignments
   */
  async updateAssetGroups(assets: Asset[]): Promise<void> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset group update');

        // Update the assets in the mock data
        assets.forEach(updatedAsset => {
          const assetIndex = mockAssets.findIndex(a => a.id === updatedAsset.id);
          if (assetIndex !== -1) {
            mockAssets[assetIndex] = {
              ...mockAssets[assetIndex],
              layer: updatedAsset.layer,
              category: updatedAsset.category,
              subcategory: updatedAsset.subcategory,
              order: updatedAsset.order,
              updatedAt: new Date().toISOString(),
            };
          }
        });

        return Promise.resolve();
      }

      // Construct payload with just the necessary data
      const groupUpdatePayload = assets.map(asset => ({
        id: asset.id,
        layer: asset.layer,
        category: asset.category,
        subcategory: asset.subcategory,
        order: asset.order,
      }));

      await api.patch<ApiResponse<void>>('/assets/groups', { assets: groupUpdatePayload });
    } catch (error) {
      console.error('Error updating asset groups:', error);
      throw new Error('Failed to update asset groups');
    }
  }

  /**
   * Save the current asset organization
   * This makes the temporary changes permanent
   */
  async saveAssetOrganization(): Promise<void> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for save asset organization');

        // In mock mode, the changes are already saved to mockAssets
        // This would just commit any pending changes to the database

        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        return Promise.resolve();
      }

      await api.post<ApiResponse<void>>('/assets/organization/save');
    } catch (error) {
      console.error('Error saving asset organization:', error);
      throw new Error('Failed to save asset organization');
    }
  }

  /**
   * Reset the asset organization to the last saved state
   */
  async resetAssetOrganization(): Promise<void> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for reset asset organization');

        // In real implementation, this would fetch the assets with saved order
        // Here we'll just simulate by removing the order property

        mockAssets.forEach(asset => {
          delete asset.order;
        });

        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        return Promise.resolve();
      }

      await api.post<ApiResponse<void>>('/assets/organization/reset');
    } catch (error) {
      console.error('Error resetting asset organization:', error);
      throw new Error('Failed to reset asset organization');
    }
  }

  /**
   * Get version history for an asset
   * @param assetId The asset ID
   */
  async getVersionHistory(assetId: string): Promise<VersionInfo[]> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for version history');

        // Find the asset
        const asset = mockAssets.find(a => a.id === assetId);
        if (!asset) {
          throw new Error('Asset not found');
        }

        // If the asset doesn't have version history, create some mock versions
        if (!asset.versionHistory) {
          // Create mock version history
          const currentVersion: VersionInfo = {
            number: '1.0.0',
            createdAt: asset.createdAt,
            createdBy: asset.registeredBy,
            message: 'Initial version',
            hash: 'abc123',
          };

          asset.version = currentVersion;
          asset.versionHistory = [currentVersion];

          // Add a few more mock versions if this isn't a brand new asset
          const creationDate = new Date(asset.createdAt);
          if (Date.now() - creationDate.getTime() > 86400000) {
            // If asset is older than a day
            asset.versionHistory.push({
              number: '1.0.1',
              createdAt: new Date(creationDate.getTime() + 3600000).toISOString(), // 1 hour later
              createdBy: asset.registeredBy,
              message: 'Updated metadata',
              hash: 'def456',
              changes: {
                metadataChanges: [
                  {
                    key: 'description',
                    oldValue: 'Original description',
                    newValue: asset.description,
                  },
                ],
              },
            });

            // If asset has files, add a version with file changes
            if (asset.files && asset.files.length > 0) {
              asset.versionHistory.push({
                number: '1.0.2',
                createdAt: new Date(creationDate.getTime() + 7200000).toISOString(), // 2 hours later
                createdBy: asset.registeredBy,
                message: 'Added new file',
                hash: 'ghi789',
                changes: {
                  filesAdded: [asset.files[0]],
                },
              });

              // Current version will be the latest
              asset.version = {
                number: '1.0.2',
                createdAt: new Date(creationDate.getTime() + 7200000).toISOString(),
                createdBy: asset.registeredBy,
                message: 'Added new file',
                hash: 'ghi789',
              };
            }
          }
        }

        return asset.versionHistory;
      }

      const response = await api.get<ApiResponse<VersionInfo[]>>(`/assets/${assetId}/versions`);
      return response.data.data as VersionInfo[];
    } catch (error) {
      console.error(`Error fetching version history for asset ${assetId}:`, error);
      throw new Error('Failed to fetch version history');
    }
  }

  /**
   * Get a specific version of an asset
   * @param assetId The asset ID
   * @param versionNumber The version number to fetch
   */
  async getAssetVersion(assetId: string, versionNumber: string): Promise<Asset> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset version');

        // Find the asset
        const asset = mockAssets.find(a => a.id === assetId);
        if (!asset) {
          throw new Error('Asset not found');
        }

        // Check if the requested version matches the current version
        if (asset.version && asset.version.number === versionNumber) {
          return { ...asset };
        }

        // If the asset has a version history, try to find the requested version
        if (asset.versionHistory) {
          const requestedVersion = asset.versionHistory.find(v => v.number === versionNumber);
          if (requestedVersion) {
            // In a real implementation, this would fetch the asset state at the requested version
            // For mock data, we'll just return the current asset with the requested version info
            return {
              ...asset,
              version: requestedVersion,
              // In reality, other fields would reflect the state at that version
            };
          }
        }

        throw new Error('Requested version not found');
      }

      const response = await api.get<ApiResponse<Asset>>(
        `/assets/${assetId}/versions/${versionNumber}`
      );
      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error fetching version ${versionNumber} of asset ${assetId}:`, error);
      throw new Error('Failed to fetch asset version');
    }
  }

  /**
   * Create a new version of an asset
   * @param request The version creation request
   */
  async createVersion(request: CreateVersionRequest): Promise<Asset> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for create version');

        // Find the asset
        const assetIndex = mockAssets.findIndex(a => a.id === request.assetId);
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }

        const asset = mockAssets[assetIndex];

        // Generate a new version number
        const currentVersion = asset.version?.number || '1.0.0';
        const versionParts = currentVersion.split('.').map(Number);
        versionParts[2] += 1; // Increment patch version
        const newVersionNumber = versionParts.join('.');

        // Generate changes based on the request
        const changes: VersionChanges = {};

        // Add files if provided
        if (request.files && request.files.length > 0) {
          changes.filesAdded = request.files.map(file => ({
            id: `file-${Math.floor(Math.random() * 10000)}`,
            filename: file.name,
            contentType: file.type,
            size: file.size,
            url: URL.createObjectURL(file),
            uploadedAt: new Date().toISOString(),
            thumbnailUrl: file.type.startsWith('image/')
              ? URL.createObjectURL(file)
              : `https://via.placeholder.com/100?text=${encodeURIComponent(file.name)}`,
          }));
        }

        // Add field changes if provided
        if (request.changes) {
          const fieldChanges: FieldChange[] = [];

          for (const [key, value] of Object.entries(request.changes)) {
            // Skip functions and complex objects that can't be easily compared
            if (
              typeof value === 'function' ||
              (typeof value === 'object' && value !== null && !Array.isArray(value))
            ) {
              continue;
            }

            // Skip version and versionHistory fields
            if (key === 'version' || key === 'versionHistory') {
              continue;
            }

            fieldChanges.push({
              field: key as keyof Asset,
              oldValue: (asset as any)[key],
              newValue: value,
            });
          }

          if (fieldChanges.length > 0) {
            changes.fields = fieldChanges;
          }
        }

        // Add metadata changes if provided
        if (request.metadata) {
          const metadataChanges: MetadataChange[] = [];

          for (const [key, value] of Object.entries(request.metadata)) {
            metadataChanges.push({
              key,
              oldValue: asset.metadata?.[key],
              newValue: value,
            });
          }

          if (metadataChanges.length > 0) {
            changes.metadataChanges = metadataChanges;
          }
        }

        // Create the new version info
        const newVersion: VersionInfo = {
          number: newVersionNumber,
          createdAt: new Date().toISOString(),
          createdBy: 'Current User',
          message: request.message,
          hash: `v${newVersionNumber}-${Date.now()}`,
          changes,
        };

        // Update the asset with the new version
        const updatedAsset = {
          ...asset,
          version: newVersion,
          versionHistory: [...(asset.versionHistory || []), newVersion],
          updatedAt: new Date().toISOString(),
        };

        // Apply changes to the asset
        if (request.changes) {
          Object.assign(updatedAsset, request.changes);
        }

        // Add any new files to the asset
        if (changes.filesAdded) {
          updatedAsset.files = [...(updatedAsset.files || []), ...changes.filesAdded];
        }

        // Update metadata if provided
        if (request.metadata) {
          updatedAsset.metadata = {
            ...(updatedAsset.metadata || {}),
            ...request.metadata,
          };
        }

        // Update the asset in the mock data
        mockAssets[assetIndex] = updatedAsset;

        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        return updatedAsset;
      }

      // For a real implementation with file uploads
      const formData = new FormData();
      formData.append('message', request.message);

      // Add files if provided
      if (request.files && request.files.length > 0) {
        request.files.forEach(file => {
          formData.append('files', file);
        });
      }

      // Add changes if provided
      if (request.changes) {
        formData.append('changes', JSON.stringify(request.changes));
      }

      // Add metadata if provided
      if (request.metadata) {
        formData.append('metadata', JSON.stringify(request.metadata));
      }

      const response = await api.post<ApiResponse<Asset>>(
        `/assets/${request.assetId}/versions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data as Asset;
    } catch (error) {
      console.error(`Error creating version for asset ${request.assetId}:`, error);
      throw new Error('Failed to create asset version');
    }
  }

  /**
   * Revert to a previous version of an asset
   * @param request The revert request
   */
  async revertToVersion(request: RevertVersionRequest): Promise<Asset> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for revert version');

        // Find the asset
        const assetIndex = mockAssets.findIndex(a => a.id === request.assetId);
        if (assetIndex === -1) {
          throw new Error('Asset not found');
        }

        const asset = mockAssets[assetIndex];

        // Find the requested version
        if (!asset.versionHistory) {
          throw new Error('Asset has no version history');
        }

        const targetVersion = asset.versionHistory.find(v => v.number === request.versionNumber);
        if (!targetVersion) {
          throw new Error('Requested version not found');
        }

        // Generate a new version number
        const currentVersion = asset.version.number;
        const versionParts = currentVersion.split('.').map(Number);
        versionParts[2] += 1; // Increment patch version
        const newVersionNumber = versionParts.join('.');

        // Create a new version for the revert
        const newVersion: VersionInfo = {
          number: newVersionNumber,
          createdAt: new Date().toISOString(),
          createdBy: 'Current User',
          message: request.message || `Reverted to version ${request.versionNumber}`,
          hash: `v${newVersionNumber}-${Date.now()}`,
          // In a real implementation, you would calculate the changes from the current version to the target version
          changes: {
            fields: [
              {
                field: 'version',
                oldValue: currentVersion,
                newValue: newVersionNumber,
              },
            ],
          },
        };

        // Update the asset with the new version
        const updatedAsset = {
          ...asset,
          version: newVersion,
          versionHistory: [...asset.versionHistory, newVersion],
          updatedAt: new Date().toISOString(),
        };

        // In a real implementation, you would apply all the changes from the target version
        // For mock data, we'll just update the version info

        // Update the asset in the mock data
        mockAssets[assetIndex] = updatedAsset;

        // Add a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        return updatedAsset;
      }

      const response = await api.post<ApiResponse<Asset>>(
        `/assets/${request.assetId}/versions/${request.versionNumber}/revert`,
        { message: request.message }
      );

      return response.data.data as Asset;
    } catch (error) {
      console.error(
        `Error reverting asset ${request.assetId} to version ${request.versionNumber}:`,
        error
      );
      throw new Error('Failed to revert to previous version');
    }
  }

  /**
   * Get CSV template for batch upload
   * @returns Template with field definitions and example
   */
  getCSVTemplate(): CSVTemplate {
    const fields: CSVTemplateField[] = [
      {
        name: 'filename',
        description: 'The filename that will be uploaded',
        required: true,
        example: 'song.mp3',
      },
      {
        name: 'name',
        description: 'Asset name (or auto-generated)',
        required: false,
        example: 'My awesome asset',
      },
      {
        name: 'layer',
        description: 'Asset layer code (G, S, L, M, W, etc.)',
        required: true,
        example: 'G',
      },
      {
        name: 'category',
        description: 'Category code within the layer',
        required: true,
        example: 'POP',
      },
      {
        name: 'subcategory',
        description: 'Subcategory code (optional)',
        required: false,
        example: 'KPOP',
      },
      {
        name: 'description',
        description: 'Asset description',
        required: true,
        example: 'This is a great asset',
      },
      {
        name: 'tags',
        description: 'Comma-separated tags',
        required: false,
        example: 'music,pop,catchy',
      },
      {
        name: 'source',
        description: 'Source of the asset (ReViz, User, Brand)',
        required: false,
        example: 'ReViz',
      },
      { name: 'license', description: 'License for the asset', required: false, example: 'CC-BY' },
      {
        name: 'attributionRequired',
        description: 'Whether attribution is required (true/false)',
        required: false,
        example: 'true',
      },
      {
        name: 'attributionText',
        description: 'Text to use for attribution',
        required: false,
        example: 'Created by John Doe',
      },
      {
        name: 'commercialUse',
        description: 'Whether commercial use is allowed (true/false)',
        required: false,
        example: 'true',
      },
    ];

    // Example CSV
    const exampleRows = [
      'filename,name,layer,category,subcategory,description,tags,source,license,attributionRequired,attributionText,commercialUse',
      'song1.mp3,Catchy Song,G,POP,KPOP,A catchy pop song,music\\,pop\\,catchy,ReViz,CC-BY,true,Music by SoundStudio,true',
      'character.glb,Cool Character,S,FIC,ANIME,An anime-style character,character\\,anime\\,cool,User,CC-BY-SA,true,Character by 3DArtist,false',
      'texture.png,Stone Texture,L,NAT,ROCK,A stone texture for 3D environments,texture\\,stone\\,natural,ReViz,CC0,false,,true',
    ];

    return {
      fields,
      example: exampleRows.join('\\n'),
    };
  }

  /**
   * Parse CSV data for batch upload
   * @param csvData CSV string data
   * @returns Array of parsed metadata objects or error
   */
  parseCSVForBatchUpload(csvData: string): BatchItemMetadata[] | { error: string } {
    try {
      // Split by lines and remove any empty lines
      const lines = csvData.split(/\\r?\\n/).filter(line => line.trim() !== '');

      if (lines.length <= 0) {
        return { error: 'CSV must contain a header row and at least one data row' };
      }

      // Parse header row
      const headers = this.parseCSVRow(lines[0]);

      // Validate required headers
      const requiredHeaders = ['filename', 'layer', 'description'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        return { error: `Missing required headers: ${missingHeaders.join(', ')}` };
      }

      // Parse data rows
      const metadataItems: BatchItemMetadata[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = this.parseCSVRow(lines[i]);

        // Skip empty rows
        if (row.length === 0 || row.every(cell => cell.trim() === '')) {
          continue;
        }

        // Create metadata object
        const metadata: BatchItemMetadata = {
          layer: '', // Will be populated below
        };

        // Map row values to metadata properties
        headers.forEach((header, index) => {
          if (index < row.length && row[index].trim() !== '') {
            // Handle special cases
            if (header === 'tags') {
              metadata.tags = row[index].split(',').map(tag => tag.trim());
            } else if (header === 'attributionRequired' || header === 'commercialUse') {
              metadata[header] = row[index].toLowerCase() === 'true';
            } else {
              // @ts-ignore - We're dynamically setting properties
              metadata[header] = row[index];
            }
          }
        });

        // Validate required fields
        if (!metadata.layer) {
          return { error: `Row ${i + 1}: Missing required field: layer` };
        }

        // Add to items list
        metadataItems.push(metadata);
      }

      return metadataItems;
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      return { error: 'Failed to parse CSV data. Please ensure it is properly formatted.' };
    }
  }

  /**
   * Parse a CSV row into an array of values
   * Handles quoted values and escaped commas
   */
  private parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];

      if (char === '"') {
        // Toggle quote state
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // End of cell
        result.push(current);
        current = '';
      } else {
        // Add character to current cell
        current += char;
      }
    }

    // Add the last cell
    result.push(current);

    // Clean up quoted values
    return result.map(cell => {
      // Remove surrounding quotes and replace escaped quotes
      if (cell.startsWith('"') && cell.endsWith('"')) {
        return cell.slice(1, -1).replace(/""/g, '"');
      }
      return cell;
    });
  }

  /**
   * Get asset analytics data with filters
   * @param filters Analytics filters
   * @returns AssetsAnalyticsData
   */
  async getAssetsAnalytics(filters: AssetAnalyticsFilters = {}): Promise<AssetsAnalyticsData> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset analytics');
        return this.getMockAnalyticsData(filters);
      }

      const response = await api.get<ApiResponse<AssetsAnalyticsData>>('/analytics/assets', {
        params: filters,
      });
      return response.data.data as AssetsAnalyticsData;
    } catch (error) {
      console.error('Error fetching asset analytics:', error);
      throw new Error('Failed to fetch asset analytics');
    }
  }

  /**
   * Get analytics data for a specific asset
   * @param assetId Asset ID
   * @param filters Analytics filters
   * @returns AssetUsageData
   */
  async getAssetAnalytics(
    assetId: string,
    filters: AssetAnalyticsFilters = {}
  ): Promise<AssetUsageData> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for asset analytics');
        return this.getMockAssetUsageData(filters);
      }

      const response = await api.get<ApiResponse<AssetUsageData>>(`/analytics/assets/${assetId}`, {
        params: filters,
      });
      return response.data.data as AssetUsageData;
    } catch (error) {
      console.error(`Error fetching analytics for asset ${assetId}:`, error);
      throw new Error('Failed to fetch asset analytics');
    }
  }

  /**
   * Get top assets based on usage
   * @param filters Analytics filters
   * @returns TopAssetData[]
   */
  async getTopAssets(filters: AssetAnalyticsFilters = {}): Promise<TopAssetData[]> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for top assets');
        const analyticsData = this.getMockAnalyticsData(filters);
        return analyticsData.topAssets;
      }

      const response = await api.get<ApiResponse<TopAssetData[]>>('/analytics/assets/top', {
        params: filters,
      });
      return response.data.data as TopAssetData[];
    } catch (error) {
      console.error('Error fetching top assets:', error);
      throw new Error('Failed to fetch top assets');
    }
  }

  /**
   * Get user activity data
   * @param filters Analytics filters
   * @returns UserActivityData[]
   */
  async getUserActivityData(filters: AssetAnalyticsFilters = {}): Promise<UserActivityData[]> {
    try {
      if (this.useMockData()) {
        console.log('Using mock data for user activity');
        const analyticsData = this.getMockAnalyticsData(filters);
        return analyticsData.userActivity;
      }

      const response = await api.get<ApiResponse<UserActivityData[]>>('/analytics/users/activity', {
        params: filters,
      });
      return response.data.data as UserActivityData[];
    } catch (error) {
      console.error('Error fetching user activity data:', error);
      throw new Error('Failed to fetch user activity data');
    }
  }

  /**
   * Generate mock analytics data for development
   */
  private getMockAnalyticsData(filters: AssetAnalyticsFilters): AssetsAnalyticsData {
    // Get date range from filters or use defaults
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    const startDate = filters.startDate ? new Date(filters.startDate) : new Date(endDate);
    startDate.setMonth(endDate.getMonth() - 3); // Default to 3 months ago

    // Generate timeseries data
    const timeseriesData = this.generateTimeseriesData(
      startDate,
      endDate,
      filters.timeFrame || 'day'
    );

    // Generate top assets
    const topAssets = this.generateTopAssets(filters.limit || 10, filters.layer);

    // Generate platform usage data
    const platformUsage = [
      { platform: 'Web', views: 15423, downloads: 3245, percentage: 42.5 },
      { platform: 'Mobile App', views: 10932, downloads: 2876, percentage: 30.1 },
      { platform: 'Desktop App', views: 5871, downloads: 1542, percentage: 16.2 },
      { platform: 'API', views: 3265, downloads: 987, percentage: 9.0 },
      { platform: 'Other', views: 873, downloads: 231, percentage: 2.2 },
    ];

    // Generate user activity data
    const userActivity = this.generateUserActivityData(
      startDate,
      endDate,
      filters.timeFrame || 'day'
    );

    // Generate assets by category
    const assetsByCategory = [
      { category: 'Pop', count: 257, percentage: 25.7 },
      { category: 'Rock', count: 203, percentage: 20.3 },
      { category: 'Hip Hop', count: 178, percentage: 17.8 },
      { category: 'Electronic', count: 134, percentage: 13.4 },
      { category: 'Classical', count: 98, percentage: 9.8 },
      { category: 'Jazz', count: 76, percentage: 7.6 },
      { category: 'Other', count: 54, percentage: 5.4 },
    ];

    // Assets by layer
    const assetsByLayer = {
      G: 523, // Songs
      S: 328, // Stars
      L: 267, // Looks
      M: 189, // Moves
      W: 95, // Worlds
    };

    // Totals and changes
    const totalAssets = Object.values(assetsByLayer).reduce((sum, count) => sum + count, 0);
    const newAssetsThisPeriod = Math.round(totalAssets * 0.15); // Mock 15% new
    const newAssetsPercentageChange = 8.3; // Mock 8.3% increase

    // Calculate metrics
    const totalViews = timeseriesData.reduce((sum, point) => sum + point.views, 0);
    const totalDownloads = timeseriesData.reduce((sum, point) => sum + point.downloads, 0);

    const metrics: AssetUsageMetrics = {
      totalViews,
      totalDownloads,
      totalUniquePlatforms: platformUsage.length,
      totalUniqueUsers: Math.round(totalViews * 0.2), // Approximately 20% of views are unique users
      viewsChange: 12.8, // Mock percentage change
      downloadsChange: 7.5, // Mock percentage change
      uniqueUsersChange: 15.2, // Mock percentage change
    };

    return {
      usageData: {
        timeseriesData,
        metrics,
      },
      topAssets,
      platformUsage,
      userActivity,
      assetsByCategory,
      assetsByLayer,
      totalAssets,
      newAssetsThisPeriod,
      newAssetsPercentageChange,
    };
  }

  /**
   * Generate mock asset usage data for a specific asset
   */
  private getMockAssetUsageData(filters: AssetAnalyticsFilters): AssetUsageData {
    // Get date range from filters or use defaults
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    const startDate = filters.startDate ? new Date(filters.startDate) : new Date(endDate);
    startDate.setMonth(endDate.getMonth() - 3); // Default to 3 months ago

    // Generate timeseries data with lower numbers for a single asset
    const divisor = Math.floor(Math.random() * 5) + 5; // Random number between 5-10
    const timeseriesData = this.generateTimeseriesData(
      startDate,
      endDate,
      filters.timeFrame || 'day',
      divisor
    );

    // Calculate metrics
    const totalViews = timeseriesData.reduce((sum, point) => sum + point.views, 0);
    const totalDownloads = timeseriesData.reduce((sum, point) => sum + point.downloads, 0);

    const metrics: AssetUsageMetrics = {
      totalViews,
      totalDownloads,
      totalUniquePlatforms: 5,
      totalUniqueUsers: Math.round(totalViews * 0.3), // Approximately 30% of views are unique users
      viewsChange: Math.random() * 30 - 10, // Random between -10% and 20%
      downloadsChange: Math.random() * 25 - 5, // Random between -5% and 20%
      uniqueUsersChange: Math.random() * 20 - 5, // Random between -5% and 15%
    };

    return {
      timeseriesData,
      metrics,
    };
  }

  /**
   * Generate mock timeseries data for the given date range
   */
  private generateTimeseriesData(
    startDate: Date,
    endDate: Date,
    timeFrame: 'day' | 'week' | 'month' | 'quarter' | 'year',
    divisor: number = 1
  ): AssetTimeseriesDataPoint[] {
    const data: AssetTimeseriesDataPoint[] = [];
    let currentDate = new Date(startDate);

    // Function to increment date based on timeFrame
    const incrementDate = () => {
      switch (timeFrame) {
        case 'day':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'week':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'month':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'quarter':
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
        case 'year':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }
    };

    // Generate data points
    while (currentDate <= endDate) {
      // Base values with some randomness
      const baseViews = Math.floor(100 + Math.random() * 400);
      const baseDownloads = Math.floor(baseViews * (0.1 + Math.random() * 0.2)); // 10-30% of views
      const baseUniqueUsers = Math.floor(baseViews * (0.2 + Math.random() * 0.3)); // 20-50% of views

      // Add trend and seasonality
      const dayOfWeek = currentDate.getDay();
      const monthOfYear = currentDate.getMonth();

      // Weekend boost
      const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.5 : 1;

      // Seasonal trends (higher in summer months)
      const seasonalMultiplier = monthOfYear >= 5 && monthOfYear <= 7 ? 1.3 : 1;

      // Calculate final values
      const views = Math.floor((baseViews * weekendMultiplier * seasonalMultiplier) / divisor);
      const downloads = Math.floor(
        (baseDownloads * weekendMultiplier * seasonalMultiplier) / divisor
      );
      const uniqueUsers = Math.floor(
        (baseUniqueUsers * weekendMultiplier * seasonalMultiplier) / divisor
      );

      data.push({
        date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
        views,
        downloads,
        uniqueUsers,
      });

      incrementDate();
    }

    return data;
  }

  /**
   * Generate mock top assets data
   */
  private generateTopAssets(limit: number, layer?: string): TopAssetData[] {
    const topAssets: TopAssetData[] = [];

    // Use a subset of mock assets or generate new ones
    const filteredAssets = layer ? mockAssets.filter(a => a.layer === layer) : mockAssets;

    // Ensure we have enough assets
    const baseAssets =
      filteredAssets.length >= limit
        ? filteredAssets.slice(0, limit)
        : [
            ...filteredAssets,
            ...Array(limit - filteredAssets.length)
              .fill(null)
              .map((_, i) => ({
                id: `top-asset-${i}`,
                name: `Top Asset ${i + 1}`,
                nna_address: `G.TOP.${(i + 1).toString().padStart(3, '0')}`,
                layer: ['G', 'S', 'L', 'M', 'W'][Math.floor(Math.random() * 5)],
                category: '001',
                subcategory: '001',
                createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
                registeredBy: 'user-1',
              })),
          ];

    // Add usage data to each asset
    for (let i = 0; i < limit; i++) {
      const asset = baseAssets[i];

      if (!asset) continue;

      // Higher values for higher-ranked assets with some randomness
      const rankFactor = 1 - i / limit; // 1 for top asset, lower for others
      const views = Math.floor(10000 * rankFactor * (0.8 + Math.random() * 0.4));
      const downloads = Math.floor(views * (0.1 + Math.random() * 0.3));

      topAssets.push({
        id: asset.id,
        name: asset.name,
        nna_address: asset.nna_address,
        layer: asset.layer,
        category: asset.category,
        subcategory: asset.subcategory,
        views,
        downloads,
        thumbnailUrl:
          (asset as Asset).files && (asset as Asset).files.length > 0
            ? (asset as Asset).files[0].thumbnailUrl
            : undefined,
        createdBy: asset.registeredBy,
        createdAt: asset.createdAt,
        lastViewedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      });
    }

    // Sort by views in descending order
    return topAssets.sort((a, b) => b.views - a.views);
  }

  /**
   * Generate mock user activity data
   */
  private generateUserActivityData(
    startDate: Date,
    endDate: Date,
    timeFrame: 'day' | 'week' | 'month' | 'quarter' | 'year'
  ): UserActivityData[] {
    const data: UserActivityData[] = [];
    let currentDate = new Date(startDate);

    // Function to increment date based on timeFrame
    const incrementDate = () => {
      switch (timeFrame) {
        case 'day':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'week':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'month':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case 'quarter':
          currentDate.setMonth(currentDate.getMonth() + 3);
          break;
        case 'year':
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }
    };

    // Generate data points
    while (currentDate <= endDate) {
      // Base values with some randomness
      const baseActiveUsers = Math.floor(200 + Math.random() * 300);
      const baseNewUsers = Math.floor(30 + Math.random() * 70);

      // Add trend and seasonality
      const dayOfWeek = currentDate.getDay();
      const monthOfYear = currentDate.getMonth();

      // Weekend boost
      const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;

      // Seasonal trends (higher in summer months)
      const seasonalMultiplier = monthOfYear >= 5 && monthOfYear <= 7 ? 1.2 : 1;

      // Calculate final values
      const activeUsers = Math.floor(baseActiveUsers * weekendMultiplier * seasonalMultiplier);
      const newUsers = Math.floor(baseNewUsers * weekendMultiplier * seasonalMultiplier);
      const returningUsers = activeUsers - newUsers;

      data.push({
        date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
        activeUsers,
        newUsers,
        returningUsers,
      });

      incrementDate();
    }

    return data;
  }

  /**
   * Process a batch of assets uploads
   * @param items Batch upload items with files and metadata
   * @param options Batch upload options for tracking progress
   * @returns Results of the batch upload operation
   */
  async batchUploadAssets(
    items: BatchUploadItem[],
    options?: BatchUploadOptions
  ): Promise<BatchUploadResult> {
    // Initialize result tracking
    const result: BatchUploadResult = {
      successful: [],
      failed: [],
      totalCount: items.length,
      successCount: 0,
      failureCount: 0,
    };

    // Set concurrency limit
    const maxConcurrent = options?.maxConcurrentUploads || 3;
    let activeUploads = 0;
    let completedItems = 0;
    let queue = [...items];

    // Process a single item
    const processItem = async (item: BatchUploadItem): Promise<void> => {
      try {
        // Start tracking
        item.status = 'uploading';
        item.startTime = Date.now();
        options?.onItemStart?.(item.id);

        // Prepare asset creation data
        const assetData: AssetCreateRequest = {
          name: item.metadata.name || '',
          layer: item.metadata.layer,
          category: item.metadata.category,
          subcategory: item.metadata.subcategory,
          description: item.metadata.description,
          tags: item.metadata.tags,
          files: [item.file],
          metadata: {
            source: item.metadata.source || 'ReViz',
            // Rights information
            rights: {
              license: item.metadata.license || 'CC-BY',
              attributionRequired: item.metadata.attributionRequired !== false,
              attributionText: item.metadata.attributionText || '',
              commercialUse: item.metadata.commercialUse !== false,
            },
            // Any other fields from metadata
            ...Object.entries(item.metadata)
              .filter(
                ([key]) =>
                  ![
                    'name',
                    'layer',
                    'category',
                    'subcategory',
                    'description',
                    'tags',
                    'source',
                    'license',
                    'attributionRequired',
                    'attributionText',
                    'commercialUse',
                    'filename',
                  ].includes(key)
              )
              .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
          },
        };

        if (this.useMockData()) {
          // For mock mode, simulate upload with delays
          let progress = 0;
          const totalSteps = 10;

          for (let step = 1; step <= totalSteps; step++) {
            // Check if operation was cancelled
            if (item.status !== 'uploading') {
              throw new Error('Upload cancelled or no longer in progress');
            }

            // Update progress
            progress = Math.round((step / totalSteps) * 100);
            item.progress = progress;
            options?.onItemProgress?.(item.id, progress);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          // Create mock asset
          const mockAsset: Asset = {
            id: `asset-${Math.floor(Math.random() * 10000)}`,
            name: assetData.name || item.file.name,
            nna_address: `${assetData.layer}.${assetData.category || '001'}.${Math.floor(
              Math.random() * 1000
            )
              .toString()
              .padStart(3, '0')}`,
            layer: assetData.layer,
            category: assetData.category,
            subcategory: assetData.subcategory,
            description: assetData.description,
            tags: assetData.tags,
            files: [
              {
                id: `file-${Math.floor(Math.random() * 10000)}`,
                filename: item.file.name,
                contentType: item.file.type,
                size: item.file.size,
                url: URL.createObjectURL(item.file),
                uploadedAt: new Date().toISOString(),
                thumbnailUrl: item.file.type.startsWith('image/')
                  ? URL.createObjectURL(item.file)
                  : `https://via.placeholder.com/100?text=${encodeURIComponent(item.file.name)}`,
              },
            ],
            metadata: assetData.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            registeredBy: 'user-1',
          };

          // Add to mock data
          mockAssets.push(mockAsset);

          // Update item status
          item.status = 'completed';
          item.asset = mockAsset;
          item.endTime = Date.now();
          item.progress = 100;

          // Track success
          result.successful.push(mockAsset);
          result.successCount++;

          // Notify
          options?.onItemComplete?.(item.id, mockAsset);
        } else {
          // For real implementation, use createAssetWithFiles with progress tracking
          const uploadResult = await this.createAssetWithFiles(assetData, {
            onProgress: (fileId, progress) => {
              item.progress = progress;
              options?.onItemProgress?.(item.id, progress);
            },
            onComplete: () => {
              // Progress callback only, actual completion is handled below
            },
            onError: (fileId, error) => {
              console.error(`Error uploading file for asset ${item.id}:`, error);
              // Continue with process, final error will be caught in the catch block
            },
          });

          // Update item status
          item.status = 'completed';
          item.asset = uploadResult.asset;
          item.endTime = Date.now();
          item.progress = 100;

          // Track success
          result.successful.push(uploadResult.asset);
          result.successCount++;

          // Notify
          options?.onItemComplete?.(item.id, uploadResult.asset);
        }
      } catch (error) {
        // Update item status
        item.status = 'error';
        item.error = error instanceof Error ? error.message : 'Unknown error occurred';
        item.endTime = Date.now();

        // Track failure
        result.failed.push({
          id: item.id,
          file: item.file,
          error: item.error,
        });
        result.failureCount++;

        // Notify
        options?.onItemError?.(item.id, item.error);
        console.error(`Error uploading asset ${item.id}:`, error);
      } finally {
        // Update batch progress
        completedItems++;
        activeUploads--;

        options?.onBatchProgress?.(completedItems, items.length);

        // Process next item from queue if available
        if (queue.length > 0) {
          const nextItem = queue.shift();
          if (nextItem) {
            activeUploads++;
            await processItem(nextItem);
          }
        } else if (activeUploads === 0) {
          // All items processed, complete the batch
          options?.onBatchComplete?.(result);
        }
      }
    };

    // Start initial batch of uploads up to max concurrent limit
    const initialBatch = queue.splice(0, maxConcurrent);

    if (initialBatch.length === 0) {
      // No items to process
      options?.onBatchComplete?.(result);
      return result;
    }

    // Process initial batch in parallel
    activeUploads = initialBatch.length;
    await Promise.all(initialBatch.map(item => processItem(item)));

    // Return final result
    return result;
  }

  /**
   * Cancel a batch upload item
   * @param itemId ID of the item to cancel
   * @returns True if successfully cancelled
   */
  cancelBatchUploadItem(itemId: string): boolean {
    // In a real implementation, this would cancel the upload for this item
    // For now, we'll just return true
    return true;
  }

  // Helper method for mock data
  private getMockAssets(params: AssetSearchParams): PaginatedResponse<Asset> {
    let filteredAssets = [...mockAssets];

    // Apply basic filters
    if (params.search) {
      const query = params.search.toLowerCase();
      filteredAssets = filteredAssets.filter(
        asset =>
          asset.name.toLowerCase().includes(query) ||
          (asset.description && asset.description.toLowerCase().includes(query))
      );
    }

    if (params.layer) {
      filteredAssets = filteredAssets.filter(asset => asset.layer === params.layer);
    }

    if (params.category) {
      filteredAssets = filteredAssets.filter(asset => asset.category === params.category);
    }

    if (params.subcategory) {
      filteredAssets = filteredAssets.filter(asset => asset.subcategory === params.subcategory);
    }

    if (params.tags && params.tags.length > 0) {
      filteredAssets = filteredAssets.filter(
        asset => asset.tags && params.tags!.some(tag => asset.tags!.includes(tag))
      );
    }

    // Advanced filters
    if (params.createdAfter) {
      const createdAfter =
        params.createdAfter instanceof Date ? params.createdAfter : new Date(params.createdAfter);

      filteredAssets = filteredAssets.filter(asset => new Date(asset.createdAt) >= createdAfter);
    }

    if (params.createdBefore) {
      const createdBefore =
        params.createdBefore instanceof Date
          ? params.createdBefore
          : new Date(params.createdBefore);

      filteredAssets = filteredAssets.filter(asset => new Date(asset.createdAt) <= createdBefore);
    }

    if (params.updatedAfter) {
      const updatedAfter =
        params.updatedAfter instanceof Date ? params.updatedAfter : new Date(params.updatedAfter);

      filteredAssets = filteredAssets.filter(asset => new Date(asset.updatedAt) >= updatedAfter);
    }

    if (params.updatedBefore) {
      const updatedBefore =
        params.updatedBefore instanceof Date
          ? params.updatedBefore
          : new Date(params.updatedBefore);

      filteredAssets = filteredAssets.filter(asset => new Date(asset.updatedAt) <= updatedBefore);
    }

    if (params.createdBy) {
      filteredAssets = filteredAssets.filter(asset => asset.registeredBy === params.createdBy);
    }

    if (params.hasFiles !== undefined) {
      filteredAssets = filteredAssets.filter(asset =>
        params.hasFiles
          ? !!(asset.files && asset.files.length > 0)
          : !(asset.files && asset.files.length > 0)
      );
    }

    if (params.fileTypes && params.fileTypes.length > 0) {
      filteredAssets = filteredAssets.filter(
        asset =>
          asset.files &&
          asset.files.some(file =>
            params.fileTypes!.some(
              type => file.contentType.includes(type) || file.filename.endsWith(type)
            )
          )
      );
    }

    if (params.fileCount !== undefined) {
      filteredAssets = filteredAssets.filter(
        asset => asset.files && asset.files.length === params.fileCount
      );
    }

    if (params.minFileSize !== undefined) {
      filteredAssets = filteredAssets.filter(
        asset => asset.files && asset.files.some(file => file.size >= (params.minFileSize || 0))
      );
    }

    if (params.maxFileSize !== undefined) {
      filteredAssets = filteredAssets.filter(
        asset =>
          asset.files && asset.files.every(file => file.size <= (params.maxFileSize || Infinity))
      );
    }

    // Complex search group filtering
    if (params.searchGroup) {
      filteredAssets = this.applySearchGroup(filteredAssets, params.searchGroup);
    }

    // Metadata filtering
    if (params.metadata && Object.keys(params.metadata).length > 0) {
      filteredAssets = filteredAssets.filter(asset => {
        if (!asset.metadata) return false;

        return Object.entries(params.metadata!).every(([key, value]) => {
          if (typeof value === 'string' && asset.metadata![key]) {
            return asset.metadata![key].toString().toLowerCase().includes(value.toLowerCase());
          }
          return asset.metadata![key] === value;
        });
      });
    }

    // Apply sorting if specified
    if (params.sortBy) {
      const sortField = params.sortBy as keyof Asset;
      const sortDirection = params.sortDirection || 'asc';

      filteredAssets.sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        // Handle dates as special case
        if (sortField === 'createdAt' || sortField === 'updatedAt') {
          valueA = new Date(valueA as string).getTime();
          valueB = new Date(valueB as string).getTime();
        }

        // Compare values based on sort direction
        if (sortDirection === 'asc') {
          return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
        } else {
          return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
        }
      });
    }

    // Pagination
    const page = params.page || 1;
    const limit = params.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

    return {
      items: paginatedAssets,
      total: filteredAssets.length,
      page,
      limit,
      totalPages: Math.ceil(filteredAssets.length / limit),
    };
  }

  /**
   * Apply a search group (complex conditions) to filter assets
   */
  private applySearchGroup(assets: Asset[], searchGroup: SearchGroup): Asset[] {
    return assets.filter(asset => {
      return this.evaluateSearchGroup(asset, searchGroup);
    });
  }

  /**
   * Evaluate a search group against a single asset
   */
  private evaluateSearchGroup(asset: Asset, group: SearchGroup): boolean {
    const results = group.conditions.map(condition => {
      if ('operator' in condition && 'conditions' in condition) {
        // This is a nested group
        return this.evaluateSearchGroup(asset, condition as SearchGroup);
      } else {
        // This is a simple condition
        return this.evaluateSearchCondition(asset, condition as SearchCondition);
      }
    });

    // Combine results based on group operator
    if (group.operator === 'AND') {
      return results.every(result => result);
    } else {
      return results.some(result => result);
    }
  }

  /**
   * Evaluate a single search condition against an asset
   */
  private evaluateSearchCondition(asset: Asset, condition: SearchCondition): boolean {
    // Get field value, supporting nested paths (e.g., "metadata.key")
    const getFieldValue = (obj: any, path: string): any => {
      const parts = path.split('.');
      let value = obj;

      for (const part of parts) {
        if (value === null || value === undefined) return undefined;
        value = value[part];
      }

      return value;
    };

    const value = getFieldValue(asset, condition.field);

    // Handle undefined/null values
    if (value === undefined || value === null) {
      if (condition.operator === 'exists') {
        return false;
      }
      return condition.operator === 'notEquals' && condition.value !== null;
    }

    // Evaluate based on operator and type
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;

      case 'notEquals':
        return value !== condition.value;

      case 'contains':
        if (typeof value === 'string') {
          return value.toLowerCase().includes(condition.value.toLowerCase());
        }
        if (Array.isArray(value)) {
          return value.some(v => v === condition.value);
        }
        return false;

      case 'notContains':
        if (typeof value === 'string') {
          return !value.toLowerCase().includes(condition.value.toLowerCase());
        }
        if (Array.isArray(value)) {
          return !value.some(v => v === condition.value);
        }
        return true;

      case 'startsWith':
        return (
          typeof value === 'string' && value.toLowerCase().startsWith(condition.value.toLowerCase())
        );

      case 'endsWith':
        return (
          typeof value === 'string' && value.toLowerCase().endsWith(condition.value.toLowerCase())
        );

      case 'greaterThan':
        return value > condition.value;

      case 'lessThan':
        return value < condition.value;

      case 'greaterThanOrEqual':
        return value >= condition.value;

      case 'lessThanOrEqual':
        return value <= condition.value;

      case 'between':
        return value >= condition.value[0] && value <= condition.value[1];

      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);

      case 'exists':
        return true; // We already handled null/undefined above

      default:
        return false;
    }
  }

  // Mock saved searches for development
  private mockSavedSearches: SavedSearch[] = [
    {
      id: '1',
      name: 'Recent Songs',
      description: 'Songs created in the last 30 days',
      params: {
        layer: 'G',
        createdAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        sortBy: 'createdAt',
        sortDirection: 'desc',
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'user-1',
      isDefault: true,
      icon: 'music_note',
    },
    {
      id: '2',
      name: 'My Assets with Files',
      description: 'Assets that I created with files',
      params: {
        createdBy: 'user-1',
        hasFiles: true,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'user-1',
      icon: 'folder',
    },
    {
      id: '3',
      name: 'High-res Images',
      description: 'Images with high resolution',
      params: {
        fileTypes: ['image/jpeg', 'image/png', 'image/webp'],
        minFileSize: 1024 * 1024 * 2, // 2MB
        sortBy: 'updatedAt',
        sortDirection: 'desc',
      },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'user-1',
      icon: 'image',
    },
  ];

  /**
   * Get mock saved searches
   */
  private getMockSavedSearches(): SavedSearch[] {
    return [...this.mockSavedSearches];
  }

  /**
   * Add a mock saved search
   */
  private addMockSavedSearch(
    search: Omit<SavedSearch, 'id' | 'createdAt' | 'userId'>
  ): SavedSearch {
    const newSearch: SavedSearch = {
      ...search,
      id: `${this.mockSavedSearches.length + 1}`,
      createdAt: new Date().toISOString(),
      userId: 'user-1',
    };

    // If this is set as default, update other searches
    if (newSearch.isDefault) {
      this.mockSavedSearches.forEach(s => {
        s.isDefault = false;
      });
    }

    this.mockSavedSearches.push(newSearch);
    return newSearch;
  }

  /**
   * Update a mock saved search
   */
  private updateMockSavedSearch(
    id: string,
    search: Partial<Omit<SavedSearch, 'id' | 'createdAt' | 'userId'>>
  ): SavedSearch {
    const index = this.mockSavedSearches.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Saved search with ID ${id} not found`);
    }

    // If this is set as default, update other searches
    if (search.isDefault) {
      this.mockSavedSearches.forEach(s => {
        s.isDefault = false;
      });
    }

    const updatedSearch = {
      ...this.mockSavedSearches[index],
      ...search,
    };

    this.mockSavedSearches[index] = updatedSearch;
    return updatedSearch;
  }

  /**
   * Delete a mock saved search
   */
  private deleteMockSavedSearch(id: string): void {
    const index = this.mockSavedSearches.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Saved search with ID ${id} not found`);
    }

    this.mockSavedSearches.splice(index, 1);
  }

  /**
   * Set a mock saved search as default
   */
  private setMockDefaultSavedSearch(id: string): SavedSearch {
    // Set all to not default
    this.mockSavedSearches.forEach(s => {
      s.isDefault = false;
    });

    // Set the specified one to default
    const index = this.mockSavedSearches.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Saved search with ID ${id} not found`);
    }

    this.mockSavedSearches[index].isDefault = true;
    return this.mockSavedSearches[index];
  }
}

// Create a singleton instance
const assetService = new AssetService();

// Export the singleton
export default assetService;
