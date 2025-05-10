export interface Asset {
  id: string;
  name: string;
  friendlyName: string;
  nnaAddress: string;
  layer: string;
  categoryCode: string;
  subcategoryCode: string;
  type: string;
  gcpStorageUrl: string;
  files: AssetFile[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  order?: number;
  groupId?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  status: 'active' | 'inactive' | 'draft' | 'archived';
  version?: VersionInfo;
}

export interface AssetSearchFilters {
  layer?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  metadata?: Record<string, unknown>;
}

export interface AssetFile {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  uploadedAt: string;
  thumbnailUrl?: string;
}

export interface AssetSearchParams {
  search?: string;
  layer?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  createdAfter?: string | Date;
  createdBefore?: string | Date;
  updatedAfter?: string | Date;
  updatedBefore?: string | Date;
  createdBy?: string;
  fileTypes?: string[];
  fileCount?: number;
  minFileSize?: number;
  maxFileSize?: number;
  hasFiles?: boolean;
  metadata?: Record<string, unknown>;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Interface for asset creation request
 *
 * IMPORTANT: Field names here MUST match exactly what the backend expects
 * When creating FormData for backend requests, use the following fields:
 * - file: The file to upload
 * - layer: Layer code (e.g., "S")
 * - category: Category code (e.g., "POP") - NOT categoryCode
 * - subcategory: Subcategory code (e.g., "BASE") - NOT subcategoryCode
 * - source: Source of asset (e.g., "ReViz")
 * - description: Description of asset
 * - tags: JSON.stringify(array of tags)
 * - trainingData: JSON.stringify(trainingData object)
 * - rights: JSON.stringify(rights object)
 * - components: JSON.stringify(components array)
 */
export interface AssetCreateRequest {
  name: string;              // Used in UI but don't send to backend
  layer: string;             // REQUIRED: Layer code
  category?: string;         // Category code (not categoryCode)
  subcategory?: string;      // Subcategory code (not subcategoryCode)
  // NOTE: 'source' is required by the backend API but not included in
  // this interface to avoid TypeScript errors with existing code.
  // Access it with (assetData as any).source or supply default 'ReViz'
  description?: string;      // Optional description
  tags?: string[];           // Optional tags
  metadata?: Record<string, unknown>; // Optional metadata
  files?: File[];            // Files to upload
}

export interface AssetUpdateRequest {
  name?: string;
  description?: string;
  tags?: string[];
  layer?: string;
  category?: string;
  subcategory?: string;
  metadata?: Record<string, unknown>;
  files?: File[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface VersionInfo {
  number: string;
  createdAt: string;
  createdBy: string;
  message: string;
  changes?: VersionChanges;
  hash?: string;
}

export interface VersionChanges {
  fields?: FieldChange[];
  filesAdded?: AssetFile[];
  filesRemoved?: AssetFile[];
  filesModified?: FileChange[];
  metadataChanges?: MetadataChange[];
}

export interface FieldChange {
  field: keyof Asset;
  oldValue: unknown;
  newValue: unknown;
}

export interface FileChange {
  file: AssetFile;
  changedProperties: string[];
}

export interface MetadataChange {
  key: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface CreateVersionRequest {
  assetId: string;
  message: string;
  files?: File[];
  metadata?: Record<string, unknown>;
  changes?: Partial<Asset>;
}

export interface RevertVersionRequest {
  assetId: string;
  versionNumber: string;
  message?: string;
}

export interface AssetAnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  layer?: string;
  category?: string;
  subcategory?: string;
  createdBy?: string;
  timeFrame?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  limit?: number;
}

export interface AssetUsageMetrics {
  totalViews: number;
  totalDownloads: number;
  totalUniquePlatforms: number;
  totalUniqueUsers: number;
  viewsChange: number;
  downloadsChange: number;
  uniqueUsersChange: number;
}

export interface AssetTimeseriesDataPoint {
  date: string;
  views: number;
  downloads: number;
  uniqueUsers?: number;
}

export interface AssetUsageData {
  timeseriesData: AssetTimeseriesDataPoint[];
  metrics: AssetUsageMetrics;
}

export interface TopAssetData {
  id: string;
  name: string;
  nna_address: string;
  layer: string;
  category?: string;
  subcategory?: string;
  views: number;
  downloads: number;
  thumbnailUrl?: string;
  createdBy: string;
  createdAt: string;
  lastViewedAt?: string;
}

export interface PlatformUsageData {
  platform: string;
  views: number;
  downloads: number;
  percentage: number;
}

export interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
}

export interface AssetsByCategoryData {
  category: string;
  count: number;
  percentage: number;
}

export interface AssetsAnalyticsData {
  usageData: AssetUsageData;
  topAssets: TopAssetData[];
  platformUsage: PlatformUsageData[];
  userActivity: UserActivityData[];
  assetsByCategory: AssetsByCategoryData[];
  assetsByLayer: Record<string, number>;
  totalAssets: number;
  newAssetsThisPeriod: number;
  newAssetsPercentageChange: number;
}

export interface AssetSearchResponse {
  items: Asset[];
  total: number;
  page: number;
  limit: number;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  originalName?: string; // Original filename before upload
}

export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error: string | null;
  response?: FileUploadResponse;
  cancel: () => boolean;
}

export interface CSVTemplateField {
  name: string;
  label: string;
  required: boolean;
  type: string;
}

export interface BatchItemMetadata {
  name: string;
  description: string;
  tags: string[];
  files: File[];
  layer: string;
}

export interface BatchUploadOptions {
  files?: File[];
  maxConcurrentUploads?: number;
  onItemStart?: (itemId: string) => void;
  onItemProgress?: (itemId: string, progress: number) => void;
  onItemComplete?: (itemId: string, asset: Asset) => void;
  onItemError?: (itemId: string, error: string) => void;
  onBatchProgress?: (completed: number, total: number) => void;
  onBatchComplete?: (result: BatchUploadResult) => void;
}

export interface BatchUploadResult {
  successful: Asset[];
  failed: {
    id: string;
    file: File;
    error: string;
  }[];
  totalCount: number;
  successCount: number;
  failureCount: number;
}

// Source options as shown in Swagger documentation
export const SOURCE_OPTIONS = [
  { value: 'ReViz', label: 'ReViz' },
  { value: 'Original', label: 'Original' },
  { value: 'Licensed', label: 'Licensed' },
  { value: 'External', label: 'External' }
];
