/**
 * Asset file representation
 */
export interface AssetFile {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  uploadedAt: string;
  thumbnailUrl?: string;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  originalName: string;
}

/**
 * File upload tracking
 */
export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error: string | null;
  response?: FileUploadResponse;
  cancel: () => boolean;
}

/**
 * Core asset model
 */
export interface Asset {
  id: string;
  name: string;
  friendlyName?: string;
  nnaAddress?: string; // Machine-friendly address (MFA)
  type: string;
  gcpStorageUrl?: string;
  description: string;
  layer: string;
  categoryCode: string;
  subcategoryCode: string;
  category?: string;
  subcategory?: string;
  tags: string[];
  files: AssetFile[];
  metadata?: Record<string, any>;
  status: 'active' | 'inactive' | 'processing' | 'deleted';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  groupId?: string;
  order?: number;
}

/**
 * Asset search parameters
 */
export interface AssetSearchParams {
  query?: string;
  layer?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  status?: string;
  createdBy?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Asset creation request
 */
export interface AssetCreateRequest {
  name: string;
  friendlyName?: string;
  layer: string;
  category?: string;
  subcategory?: string;
  categoryCode: string;
  subcategoryCode: string;
  description?: string;
  tags?: string[];
  files: File[];
  metadata?: Record<string, any>;
}

/**
 * Asset update request
 */
export interface AssetUpdateRequest {
  name?: string;
  friendlyName?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  status?: 'active' | 'inactive';
}