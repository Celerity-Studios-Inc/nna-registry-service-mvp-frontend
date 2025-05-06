export interface Asset {
  id: string;
  name: string;
  friendlyName?: string;
  nnaAddress: string;
  layer: string;
  categoryCode: string;
  subcategoryCode: string;
  type: string;
  files: AssetFile[];
  description: string;
  tags: string[];
  registeredBy?: string;
  version?: VersionInfo;
  versionHistory?: VersionInfo[];
  metadata: {
    source?: string;
    tags?: string[];
    popularity_score?: number;
    training_data?: {
      prompts: string[];
      images: string[];
      video_urls: string[];
      dataset_id: string;
    };
    rights?: {
      source: string;
      rights_split: string;
    };
    [key: string]: any;
  };
  gcpStorageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  contentType: string;
  size: number;
  uploadedAt?: string;
  thumbnailUrl?: string;
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
  hasFiles?: boolean;
  fileTypes?: string[];
  fileCount?: number;
  minFileSize?: number;
  maxFileSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  metadata?: Record<string, any>;
  searchGroup?: any;
}

export interface SavedSearch {
  id: string;
  name: string;
  description?: string;
  params: AssetSearchParams;
  createdAt: string;
  userId: string;
  isDefault?: boolean;
  icon?: string;
}

export interface SearchGroup {
  operator: SearchOperator;
  conditions: (SearchGroup | SearchCondition)[];
}

export type SearchOperator = 'AND' | 'OR';

export interface SearchCondition {
  field: string;
  operator: SearchConditionType;
  value: any;
}

export type SearchConditionType =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'exists';

export interface AssetUpdateRequest {
  name?: string;
  description?: string;
  tags?: string[];
  layer?: string;
  category?: string;
  subcategory?: string;
  metadata?: Record<string, any>;
  files?: File[];
}

export interface AssetCreateRequest extends AssetUpdateRequest {
  name: string;
  layer: string;
}

export interface VersionInfo {
  number: string;
  createdAt: string;
  createdBy: string;
  message?: string;
  hash?: string;
  changes?: VersionChanges;
}

export interface VersionChanges {
  filesAdded?: AssetFile[];
  fields?: FieldChange[];
  metadataChanges?: MetadataChange[];
}

export interface FieldChange {
  field: keyof Asset;
  oldValue: any;
  newValue: any;
}

export interface FileChange {
  id: string;
  changeType: 'added' | 'removed' | 'updated';
}

export interface MetadataChange {
  key: string;
  oldValue: any;
  newValue: any;
}

export interface CreateVersionRequest {
  assetId: string;
  message: string;
  files?: File[];
  changes?: Partial<AssetUpdateRequest>;
  metadata?: Record<string, any>;
}

export interface RevertVersionRequest {
  assetId: string;
  versionNumber: string;
  message?: string;
}

export interface AssetUploadResult {
  asset: Asset;
  uploadedFiles: FileUploadResponse[];
  failedFiles: { file: File; error: string }[];
}

export interface BatchUploadItem {
  id: string;
  file: File;
  metadata: BatchItemMetadata;
  status?: string;
  progress?: number;
  startTime?: number;
  endTime?: number;
  error?: string;
  asset?: Asset;
}

export interface BatchItemMetadata {
  [key: string]: any;
  name?: string;
  layer: string;
  category?: string;
  subcategory?: string;
  description?: string;
  tags?: string[];
  source?: string;
  license?: string;
  attributionRequired?: boolean;
  attributionText?: string;
  commercialUse?: boolean;
  filename?: string;
}

export interface BatchUploadOptions {
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
  failed: { id: string; file: File; error: string }[];
  totalCount: number;
  successCount: number;
  failureCount: number;
}

export interface CSVTemplate {
  fields: CSVTemplateField[];
  example: string;
}

export interface CSVTemplateField {
  name: string;
  description: string;
  required: boolean;
  example: string;
}

export type SearchComparisonOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'between'
  | 'in';

export interface FileUpload {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  abortController: AbortController;
  startTime?: number;
  endTime?: number;
  uploadSpeed?: number;
  estimatedTimeRemaining?: number;
  error?: string;
  errorCode?: string;
}

export interface FileUploadOptions {
  maxSize?: number;
  metadata?: Record<string, any>;
  retryCount?: number;
  retryDelay?: number;
  chunkSize?: number;
  timeout?: number;
  validateBeforeUpload?: (file: File) => boolean | Promise<boolean>;
  onStart?: (fileId: string, file: File) => void;
  onProgress?: (fileId: string, progress: number) => void;
  onComplete?: (fileId: string, response: FileUploadResponse) => void;
  onError?: (fileId: string, error: string, errorCode?: string) => void;
  onCancel?: (fileId: string) => void;
}

export interface AssetAnalyticsFilters {
  startDate?: string;
  endDate?: string;
  timeFrame?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  layer?: string;
  limit?: number;
}

export interface AssetsAnalyticsData {
  usageData: {
    timeseriesData: AssetTimeseriesDataPoint[];
    metrics: AssetUsageMetrics;
  };
  topAssets: TopAssetData[];
  platformUsage: PlatformUsageData[];
  userActivity: UserActivityData[];
  assetsByCategory: AssetsByCategoryData[];
  assetsByLayer: Record<string, number>;
  totalAssets: number;
  newAssetsThisPeriod: number;
  newAssetsPercentageChange: number;
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
  category: string;
  subcategory: string;
  views: number;
  downloads: number;
  thumbnailUrl?: string;
  createdBy?: string;
  createdAt?: string;
  lastViewedAt?: string;
}

export interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
}

export interface PlatformUsageData {
  platform: string;
  views: number;
  downloads: number;
  percentage: number;
}

export interface AssetsByCategoryData {
  category: string;
  count: number;
  percentage: number;
}

export interface AssetTimeseriesDataPoint {
  date: string;
  views: number;
  downloads: number;
  uniqueUsers: number;
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

export interface RightsVerificationRequest {
  assetId: string;
  method: RightsVerificationMethod;
  details?: Record<string, any>;
}

export interface RightsUpdateRequest {
  assetId: string;
  rights: AssetRights;
}

export interface RightsClearanceRequest {
  assetId: string;
  clearanceDetails: RightsClearance;
}

export interface AssetRights {
  status: RightsStatus;
  type: RightsType;
  limitations?: RightsLimitation[];
  verification?: RightsVerification;
  clearance?: RightsClearance;
  usage?: RightsUsage;
}

export type RightsStatus = 'verified' | 'pending' | 'unverified' | 'restricted';

export type RightsType = 'copyright' | 'license' | 'publicDomain' | 'other';

export interface RightsLimitation {
  type: string;
  description: string;
}

export type RightsVerificationMethod = 'manual' | 'automated' | 'external';

export interface RightsVerification {
  method: RightsVerificationMethod;
  verifiedBy: string;
  verifiedAt: string;
  details?: string;
}

export interface RightsLimitationDetail {
  limitation: RightsLimitation;
  notes?: string;
}

export interface RightsClearance {
  clearedBy: string;
  clearedAt: string;
  notes?: string;
}

export interface RightsUsage {
  allowed: boolean;
  terms?: string;
  notes?: string;
} 