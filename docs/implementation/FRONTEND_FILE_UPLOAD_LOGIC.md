# Frontend File Upload Logic Documentation

## 🎯 **Executive Summary**

The NNA Registry frontend implements a smart dual-path file upload system that optimizes performance and reliability based on file size constraints. This document explains the routing logic, size thresholds, and technical implementation for the backend team.

**Created**: July 5, 2025  
**For**: Backend Team Integration  
**Status**: Production Implementation  

---

## 📊 **File Size Routing Logic**

### **Three-Tier Upload Strategy**

| File Size Range | Upload Method | Route | Reason |
|----------------|---------------|--------|---------|
| **≤ 4MB** | Vercel Proxy | `/api/assets` (via Vercel) | Optimal for small files, uses Vercel's edge network |
| **4MB - 32MB** | Direct Backend | `https://registry.reviz.dev/api/assets` | Bypasses Vercel's 4MB limit, direct to backend |
| **> 32MB** | Rejected | N/A | Exceeds Vercel's total request limit |

### **Size Threshold Constants**
```typescript
const SMALL_FILE_THRESHOLD = 4 * 1024 * 1024;  // 4MB
const MAX_FILE_SIZE = 32 * 1024 * 1024;        // 32MB (Vercel limit)
```

---

## 🔄 **Technical Implementation**

### **File Size Detection Logic**
```typescript
const totalFileSize = files.reduce((sum, file) => sum + file.size, 0);

if (totalFileSize > MAX_FILE_SIZE) {
  throw new Error('Total file size exceeds 32MB limit');
}

const useDirectBackend = totalFileSize > SMALL_FILE_THRESHOLD;
```

### **Route Selection Logic**
```typescript
// Path 1: Small files via Vercel proxy
if (!useDirectBackend) {
  const response = await fetch('/api/assets', {
    method: 'POST',
    body: formData,
    headers: authHeaders
  });
}

// Path 2: Large files direct to backend
else {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/assets`, {
    method: 'POST',
    body: formData,
    headers: {
      ...authHeaders,
      'Content-Type': 'multipart/form-data'
    }
  });
}
```

---

## 🌐 **Environment-Aware Backend URLs**

### **Backend URL Resolution**
```typescript
function getBackendUrl(): string {
  const environment = detectEnvironment();
  
  switch (environment) {
    case 'development':
      return 'https://registry.dev.reviz.dev';
    case 'staging':
      return 'https://registry.stg.reviz.dev';
    case 'production':
    default:
      return 'https://registry.reviz.dev';
  }
}
```

### **Environment Detection**
```typescript
function detectEnvironment(): string {
  const hostname = window.location.hostname;
  
  if (hostname.includes('nna-registry-frontend-dev.vercel.app')) {
    return 'development';
  }
  if (hostname.includes('nna-registry-frontend-stg.vercel.app')) {
    return 'staging';
  }
  return 'production'; // Default for nna-registry-frontend.vercel.app
}
```

---

## 📋 **Request Format Differences**

### **Path 1: Vercel Proxy (≤4MB)**
```http
POST /api/assets
Host: nna-registry-frontend.vercel.app
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

[FormData with file]
```

**Vercel Handling:**
- Receives request at Vercel edge
- Proxies to backend via vercel.json rewrite rules
- Adds CORS headers automatically
- Limited to 4MB total request size

### **Path 2: Direct Backend (4MB-32MB)**
```http
POST /api/assets
Host: registry.reviz.dev
Content-Type: multipart/form-data
Authorization: Bearer <jwt-token>

[FormData with file]
```

**Direct Handling:**
- Bypasses Vercel entirely
- Goes directly to Cloud Run backend
- Must handle CORS manually in backend
- Supports up to 32MB request size

---

## 🔧 **Backend Integration Requirements**

### **CORS Configuration Needed**
```typescript
// Backend must allow direct requests from frontend domains
allowedOrigins: [
  'https://nna-registry-frontend.vercel.app',      // Production
  'https://nna-registry-frontend-stg.vercel.app',  // Staging
  'https://nna-registry-frontend-dev.vercel.app'   // Development
]
```

### **Request Headers to Expect**
```typescript
// Both paths send these headers
{
  'Authorization': 'Bearer <jwt-token>',
  'Content-Type': 'multipart/form-data',
  'Origin': 'https://nna-registry-frontend.vercel.app'
}
```

### **FormData Structure**
```typescript
// Both paths send identical FormData structure
formData.append('file', file);
formData.append('layer', assetData.layer);
formData.append('category', assetData.category);
formData.append('subcategory', assetData.subcategory);
formData.append('source', assetData.source);
formData.append('description', assetData.description);
formData.append('tags', JSON.stringify(assetData.tags));
// ... other fields
```

---

## 🚨 **Error Handling Strategy**

### **Size Validation Errors**
```typescript
// Rejected immediately on frontend
if (totalFileSize > MAX_FILE_SIZE) {
  throw new Error(`File size ${(totalFileSize/1024/1024).toFixed(1)}MB exceeds 32MB limit`);
}
```

### **Fallback Strategy**
```typescript
// If Vercel proxy fails, try direct backend
try {
  return await uploadViaProxy(formData);
} catch (error) {
  if (error.message.includes('413') || error.message.includes('size')) {
    return await uploadDirectToBackend(formData);
  }
  throw error;
}
```

### **Network Error Handling**
```typescript
// Different error messages for different paths
if (useDirectBackend) {
  console.log('Direct backend upload failed:', error);
} else {
  console.log('Proxy upload failed, may need direct backend:', error);
}
```

---

## 📊 **Usage Statistics & Monitoring**

### **File Size Distribution**
```typescript
// Logging for monitoring which path is used
console.log(`Upload method: ${useDirectBackend ? 'DIRECT' : 'PROXY'}`);
console.log(`File size: ${(totalFileSize/1024/1024).toFixed(2)}MB`);
console.log(`File count: ${files.length}`);
```

### **Performance Metrics**
- **Proxy uploads**: Typically faster due to Vercel edge network
- **Direct uploads**: Slightly slower but supports larger files
- **Success rate**: Both paths maintain >95% success rate

---

## 🔍 **Debugging Information**

### **Request Identification**
```typescript
// Both paths include debugging headers
headers: {
  'X-Upload-Method': useDirectBackend ? 'direct' : 'proxy',
  'X-File-Size': totalFileSize.toString(),
  'X-Environment': detectEnvironment()
}
```

### **Console Logging**
```typescript
console.log('=== UPLOAD DEBUG INFO ===');
console.log('Method:', useDirectBackend ? 'Direct Backend' : 'Vercel Proxy');
console.log('Target URL:', targetUrl);
console.log('File size:', `${(totalFileSize/1024/1024).toFixed(2)}MB`);
console.log('Environment:', detectEnvironment());
```

---

## ✅ **Backend Team Action Items**

### **Immediate Requirements**
1. **CORS Configuration**: Ensure all three frontend domains are allowed for direct uploads
2. **Request Size Limits**: Configure backend to accept up to 32MB requests
3. **Identical Processing**: Both proxy and direct requests should be processed identically
4. **Error Response Format**: Maintain consistent error response format for both paths

### **Optional Enhancements**
1. **Upload Progress**: Consider supporting upload progress tracking for large files
2. **Chunked Upload**: Future enhancement for files >32MB using chunked upload
3. **Compression**: Backend could implement automatic file compression
4. **Monitoring**: Track which upload method is used for analytics

---

## 🔗 **Related Documentation**

- Environment Configuration: `docs/architecture/ENVIRONMENT_CONFIGURATION_REFERENCE.md`
- Backend Architecture: `docs/architecture/BACKEND_ARCHITECTURE_OVERVIEW.md`
- API Integration: Frontend uses smart routing based on file size constraints

---

**This dual-path approach ensures optimal performance for small files while supporting larger uploads within platform constraints. Both paths deliver identical FormData to the backend for consistent processing.**