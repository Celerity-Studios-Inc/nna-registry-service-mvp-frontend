# API Integration Guide for Frontend Team

## 🎯 **Executive Summary**
This guide provides the frontend team with comprehensive information about integrating with the NNA Registry Service backend APIs. Includes authentication, file uploads, asset management, and environment-specific configurations.

---

## 🔌 **Base API Configuration**

### **Environment-Specific Backend URLs**
```typescript
// Environment detection and API URL configuration
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('nna-registry-frontend-stg.vercel.app')) {
    return 'https://registry.stg.reviz.dev';
  }
  
  if (hostname.includes('nna-registry-dev-frontend.vercel.app')) {
    return 'https://registry.dev.reviz.dev';
  }
  
  // Default to production
  return 'https://registry.reviz.dev';
};

const API_BASE_URL = getBackendUrl();
```

### **API Endpoints Structure**
```typescript
// Base API structure
const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
  },
  assets: {
    create: `${API_BASE_URL}/api/assets`,
    list: `${API_BASE_URL}/api/assets`,
    get: (id: string) => `${API_BASE_URL}/api/assets/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/assets/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/assets/${id}`,
    search: `${API_BASE_URL}/api/assets/search`,
  },
  taxonomy: {
    tree: `${API_BASE_URL}/api/taxonomy/tree`,
    lookup: (layer: string) => `${API_BASE_URL}/api/taxonomy/lookup/${layer}`,
    nextSequence: `${API_BASE_URL}/api/taxonomy/next-sequence`,
  },
};
```

---

## 🔐 **Authentication Integration**

### **Login Flow**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'administrator' | 'creator' | 'curator' | 'editor';
  };
}

const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch(API_ENDPOINTS.auth.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  return response.json();
};
```

### **JWT Token Management**
```typescript
// Token storage and management
class TokenManager {
  private static ACCESS_TOKEN_KEY = 'nna_access_token';
  private static REFRESH_TOKEN_KEY = 'nna_refresh_token';

  static setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
```

### **Authenticated API Client**
```typescript
class AuthenticatedApiClient {
  private async refreshTokenIfNeeded() {
    const accessToken = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();

    if (!accessToken || !refreshToken) {
      throw new Error('No tokens available');
    }

    if (TokenManager.isTokenExpired(accessToken)) {
      const response = await fetch(API_ENDPOINTS.auth.refresh, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        TokenManager.clearTokens();
        throw new Error('Token refresh failed');
      }

      const { access_token, refresh_token } = await response.json();
      TokenManager.setTokens(access_token, refresh_token);
    }
  }

  async request(url: string, options: RequestInit = {}) {
    await this.refreshTokenIfNeeded();
    
    const accessToken = TokenManager.getAccessToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      TokenManager.clearTokens();
      throw new Error('Authentication required');
    }

    return response;
  }
}
```

---

## 📁 **File Upload Integration**

### **Direct GCS Upload Strategy**
Our backend supports direct file uploads to Google Cloud Storage, bypassing the backend for better performance:

```typescript
interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  fields: Record<string, string>;
}

const getUploadUrl = async (filename: string, contentType: string): Promise<UploadUrlResponse> => {
  const response = await authenticatedClient.request(
    `${API_ENDPOINTS.assets.create}/upload-url`,
    {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    }
  );

  return response.json();
};

const uploadFileDirectly = async (file: File, onProgress?: (progress: number) => void) => {
  // Get signed upload URL from backend
  const { uploadUrl, fields } = await getUploadUrl(file.name, file.type);

  // Create form data for direct upload
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('file', file);

  // Upload directly to GCS
  const xhr = new XMLHttpRequest();
  
  return new Promise<string>((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 204) {
        resolve(fields.key); // Return the file key
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
};
```

### **Asset Creation with File Upload**
```typescript
interface CreateAssetRequest {
  name: string;
  description?: string;
  layer: 'G' | 'L' | 'M' | 'S' | 'W' | 'B' | 'P' | 'R' | 'T';
  category: string;
  subcategory: string;
  metadata?: Record<string, any>;
}

const createAsset = async (assetData: CreateAssetRequest, file: File) => {
  // Step 1: Upload file directly to GCS
  const fileKey = await uploadFileDirectly(file, (progress) => {
    console.log(`Upload progress: ${progress}%`);
  });

  // Step 2: Create asset record in backend
  const response = await authenticatedClient.request(API_ENDPOINTS.assets.create, {
    method: 'POST',
    body: JSON.stringify({
      ...assetData,
      fileKey,
    }),
  });

  return response.json();
};
```

---

## 🏷️ **Asset Management Integration**

### **Asset Search and Filtering**
```typescript
interface AssetSearchParams {
  layer?: string;
  category?: string;
  subcategory?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'layer';
  sortOrder?: 'asc' | 'desc';
}

const searchAssets = async (params: AssetSearchParams) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await authenticatedClient.request(
    `${API_ENDPOINTS.assets.search}?${queryParams.toString()}`
  );

  return response.json();
};
```

### **Asset CRUD Operations**
```typescript
// Get all assets
const getAssets = async (params?: AssetSearchParams) => {
  const queryParams = params ? new URLSearchParams(params) : '';
  const url = queryParams ? `${API_ENDPOINTS.assets.list}?${queryParams}` : API_ENDPOINTS.assets.list;
  
  const response = await authenticatedClient.request(url);
  return response.json();
};

// Get single asset
const getAsset = async (id: string) => {
  const response = await authenticatedClient.request(API_ENDPOINTS.assets.get(id));
  return response.json();
};

// Update asset
const updateAsset = async (id: string, updates: Partial<CreateAssetRequest>) => {
  const response = await authenticatedClient.request(API_ENDPOINTS.assets.update(id), {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.json();
};

// Delete asset
const deleteAsset = async (id: string) => {
  const response = await authenticatedClient.request(API_ENDPOINTS.assets.delete(id), {
    method: 'DELETE',
  });
  return response.status === 204;
};
```

---

## 🗂️ **Taxonomy Integration**

### **Taxonomy Tree Retrieval**
```typescript
interface TaxonomyNode {
  layer: string;
  category: string;
  subcategory: string;
  name: string;
  description?: string;
  children?: TaxonomyNode[];
}

const getTaxonomyTree = async (): Promise<TaxonomyNode[]> => {
  const response = await fetch(API_ENDPOINTS.taxonomy.tree);
  return response.json();
};
```

### **Layer-Specific Lookups**
```typescript
interface TaxonomyLookup {
  layer: string;
  categories: {
    [category: string]: {
      [subcategory: string]: string;
    };
  };
}

const getTaxonomyLookup = async (layer: string): Promise<TaxonomyLookup> => {
  const response = await fetch(API_ENDPOINTS.taxonomy.lookup(layer));
  return response.json();
};
```

### **Sequential Number Generation**
```typescript
interface NextSequenceRequest {
  layer: string;
  category: string;
  subcategory: string;
}

interface NextSequenceResponse {
  nextNumber: number;
  hfn: string; // Human-Friendly Name
  mfa: string; // Machine-Friendly Address
}

const getNextSequence = async (params: NextSequenceRequest): Promise<NextSequenceResponse> => {
  const response = await authenticatedClient.request(API_ENDPOINTS.taxonomy.nextSequence, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response.json();
};
```

---

## 🔍 **Health Check Integration**

### **Environment Detection**
```typescript
interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  detection: {
    method: string;
    hostname: string;
  };
  config: {
    database: {
      connected: boolean;
      name: string;
    };
    storage: {
      provider: string;
      bucket: string;
    };
    cors: {
      allowedOrigins: string[];
    };
    logging: {
      level: string;
    };
  };
}

const checkBackendHealth = async (): Promise<HealthResponse> => {
  const response = await fetch(API_ENDPOINTS.health);
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  
  return response.json();
};

// Environment detection for frontend
const detectEnvironment = async (): Promise<string> => {
  try {
    const health = await checkBackendHealth();
    return health.environment;
  } catch (error) {
    console.error('Failed to detect environment:', error);
    return 'production'; // Default to production for safety
  }
};
```

---

## 🚨 **Error Handling**

### **API Error Response Format**
```typescript
interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

// Global error handler
const handleApiError = (error: any): string => {
  if (error instanceof Response) {
    return `HTTP ${error.status}: ${error.statusText}`;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};
```

### **Retry Logic for Network Issues**
```typescript
const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};
```

---

## 🧪 **Testing Integration**

### **Environment-Specific Testing**
```typescript
// Test configuration for different environments
const testConfig = {
  development: {
    apiUrl: 'https://registry.dev.reviz.dev',
    timeout: 10000,
    retries: 3,
  },
  staging: {
    apiUrl: 'https://registry.stg.reviz.dev',
    timeout: 15000,
    retries: 2,
  },
  production: {
    apiUrl: 'https://registry.reviz.dev',
    timeout: 20000,
    retries: 1,
  },
};

// Get test configuration based on environment
const getTestConfig = () => {
  const environment = detectEnvironment();
  return testConfig[environment] || testConfig.production;
};
```

### **API Testing Utilities**
```typescript
// Test helper for API endpoints
const testApiEndpoint = async (endpoint: string, expectedStatus: number = 200) => {
  const config = getTestConfig();
  
  const response = await fetch(`${config.apiUrl}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (response.status !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
  }
  
  return response.json();
};
```

---

## 📋 **Integration Checklist**

### **Setup Requirements**
- [ ] Environment detection logic implemented
- [ ] API base URL configuration
- [ ] Authentication flow integrated
- [ ] Token management system
- [ ] Error handling middleware
- [ ] File upload integration
- [ ] Asset management APIs
- [ ] Taxonomy integration
- [ ] Health check monitoring

### **Testing Requirements**
- [ ] All environments tested
- [ ] Authentication flow tested
- [ ] File uploads tested
- [ ] Asset CRUD operations tested
- [ ] Error scenarios tested
- [ ] Performance testing completed

---

**This integration guide ensures seamless communication between frontend and backend, with robust error handling and environment-specific configurations.**

---

**Document Created**: June 27, 2025  
**Version**: 1.0  
**Last Updated**: Initial creation  
**Next Review**: After Phase 1 completion 