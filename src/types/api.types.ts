/**
 * API response types for NNA Registry Service
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  status?: number;
  timestamp?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasMore?: boolean;
  };
}

/**
 * Error response from API
 */
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  stack?: string;
  timestamp?: string;
}

/**
 * Filter parameters for API requests
 */
export interface ApiFilterParams {
  [key: string]: string | number | boolean | undefined | null | string[];
}

/**
 * Sort parameters for API requests
 */
export interface ApiSortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Pagination parameters for API requests
 */
export interface ApiPaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Generic query parameters for API requests
 */
export interface ApiQueryParams extends ApiFilterParams, ApiPaginationParams {
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  fields?: string[];
  include?: string[];
  exclude?: string[];
}

/**
 * File upload response
 */
export interface ApiFileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

/**
 * Batch operation response
 */
export interface ApiBatchResponse<T = any> {
  totalItems: number;
  processedItems: number;
  successItems: number;
  failedItems: number;
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
}

/**
 * Health check response
 */
export interface ApiHealthResponse {
  status: 'ok' | 'degraded' | 'unavailable';
  version: string;
  uptime: number;
  timestamp: string;
  services: Record<string, 'ok' | 'degraded' | 'unavailable'>;
  dependencies: Record<string, 'ok' | 'degraded' | 'unavailable'>;
}