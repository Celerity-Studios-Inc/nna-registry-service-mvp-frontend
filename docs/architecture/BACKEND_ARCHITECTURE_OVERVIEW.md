# Backend Architecture Overview for Frontend Team

## 🎯 **Executive Summary**
This document provides the frontend team with a complete understanding of the NNA Registry Service backend architecture, environment strategy, and integration points. Our backend is designed to perfectly align with your three-environment frontend strategy.

---

## 🏗️ **Architecture Overview**

### **Single Codebase, Three Environment Configuration**
- **Codebase**: One NestJS application serving all environments
- **Configuration**: Environment-specific settings via environment variables and runtime detection
- **Deployment**: Separate Cloud Run services for each environment
- **Database**: Isolated MongoDB databases per environment
- **Storage**: Isolated GCS buckets per environment

### **Technology Stack**
```typescript
Framework: NestJS (Node.js)
Database: MongoDB (with PostgreSQL migration planned)
Storage: Google Cloud Storage (GCS)
Deployment: Google Cloud Run
Authentication: JWT with role-based access
Documentation: Swagger/OpenAPI
Monitoring: Sentry + structured logging
```

---

## 🌍 **Environment Strategy**

### **Environment Detection Logic**
Our backend uses a sophisticated multi-layered detection system that perfectly aligns with your frontend strategy:

```typescript
// Primary: Hostname-based detection (matches frontend)
const hostname = req.hostname;
if (hostname.includes('registry.stg.reviz.dev')) return 'staging';
if (hostname.includes('registry.dev.reviz.dev')) return 'development';
if (hostname.includes('registry.reviz.dev')) return 'production';

// Fallback: Environment variables
const nodeEnv = process.env.NODE_ENV;
const environment = process.env.ENVIRONMENT;

// Safety: Default to production
return 'production';
```

### **Environment-Specific Resources**

| Environment | Backend URL | Database | Storage Bucket | CORS Origins |
|-------------|-------------|----------|----------------|--------------|
| **Development** | `https://registry.dev.reviz.dev` | `nna-registry-development` | `nna-registry-dev-storage` | `https://nna-registry-dev-frontend.vercel.app` |
| **Staging** | `https://registry.stg.reviz.dev` | `nna-registry-staging` | `nna-registry-staging-storage` | `https://nna-registry-frontend-stg.vercel.app` |
| **Production** | `https://registry.reviz.dev` | `nna-registry-production` | `nna-registry-production-storage` | `https://nna-registry-frontend.vercel.app` |

---

## 🔌 **API Integration Points**

### **Health Endpoint**
```typescript
GET /api/health
```
**Response Format** (Enhanced for transparency):
```json
{
  "status": "healthy",
  "timestamp": "2025-06-25T21:19:12.612Z",
  "version": "1.0.1",
  "environment": "production",
  "detection": {
    "method": "hostname",
    "hostname": "registry.reviz.dev"
  },
  "config": {
    "database": {
      "connected": true,
      "name": "nna-registry-production"
    },
    "storage": {
      "provider": "gcp",
      "bucket": "nna-registry-production-storage"
    },
    "cors": {
      "allowedOrigins": ["https://nna-registry-frontend.vercel.app"]
    },
    "logging": {
      "level": "warn"
    }
  }
}
```

### **Asset Management APIs**
```typescript
// Asset Creation
POST /api/assets
Content-Type: multipart/form-data

// Asset Retrieval
GET /api/assets
GET /api/assets/:id

// Asset Search
GET /api/assets/search?layer=G&category=music&subcategory=pop

// Asset Update
PUT /api/assets/:id

// Asset Deletion
DELETE /api/assets/:id
```

### **Authentication APIs**
```typescript
// User Registration
POST /api/auth/register

// User Login
POST /api/auth/login

// JWT Token Refresh
POST /api/auth/refresh
```

### **Taxonomy APIs**
```typescript
// Get Taxonomy Tree
GET /api/taxonomy/tree

// Get Layer-Specific Lookup
GET /api/taxonomy/lookup/:layer

// Get Sequential Number
POST /api/taxonomy/next-sequence
```

---

## 🔒 **Security & CORS Configuration**

### **CORS Strategy**
We implement strict CORS policies that match your environment-specific domains:

```typescript
// Development
allowedOrigins: ['https://nna-registry-dev-frontend.vercel.app']

// Staging  
allowedOrigins: ['https://nna-registry-frontend-stg.vercel.app']

// Production
allowedOrigins: ['https://nna-registry-frontend.vercel.app']
```

### **Authentication Flow**
```typescript
1. Frontend sends credentials to /api/auth/login
2. Backend validates and returns JWT token
3. Frontend includes JWT in Authorization header
4. Backend validates JWT and extracts user/role information
5. Role-based access control applied to all protected endpoints
```

### **File Upload Security**
- **Direct Upload**: Files uploaded directly to GCS (bypassing backend)
- **Signed URLs**: Backend generates signed URLs for secure uploads
- **File Validation**: Backend validates file metadata and permissions
- **Virus Scanning**: Integration with GCS security features

---

## 📊 **Data Models**

### **Asset Model**
```typescript
interface Asset {
  id: string;
  hfn: string; // Human-Friendly Name
  mfa: string; // Machine-Friendly Address
  name: string;
  description?: string;
  layer: 'G' | 'L' | 'M' | 'S' | 'W' | 'B' | 'P' | 'R' | 'T';
  category: string;
  subcategory: string;
  fileUrl: string;
  thumbnailUrl?: string;
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **User Model**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'administrator' | 'creator' | 'curator' | 'editor';
  createdAt: Date;
  updatedAt: Date;
}
```

### **Taxonomy Model**
```typescript
interface TaxonomyNode {
  layer: string;
  category: string;
  subcategory: string;
  name: string;
  description?: string;
  sequentialNumber?: number;
}
```

---

## 🚀 **Deployment Strategy**

### **Cloud Run Services**
Each environment has its own isolated Cloud Run service:

```yaml
# Development
Service: nna-registry-dev
URL: https://registry.dev.reviz.dev
Environment: development

# Staging
Service: nna-registry-staging  
URL: https://registry.stg.reviz.dev
Environment: staging

# Production
Service: nna-registry-production
URL: https://registry.reviz.dev
Environment: production
```

### **Environment Variables**
```bash
# Common Variables
NODE_ENV=production|staging|development
ENVIRONMENT=production|staging|development
GCP_PROJECT_ID=your-project-id

# Database
MONGODB_URI=mongodb://...

# Storage
GCS_BUCKET_NAME=nna-registry-{env}-storage

# CORS
CORS_ORIGINS=https://nna-registry-{env}-frontend.vercel.app

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## 🔍 **Monitoring & Debugging**

### **Health Endpoint Transparency**
Our enhanced health endpoints provide complete visibility into:
- Environment detection method
- Database connectivity status
- Storage configuration
- CORS settings
- Logging levels

### **Structured Logging**
```typescript
// All logs include environment context
{
  "level": "info",
  "environment": "staging",
  "timestamp": "2025-06-25T21:19:12.612Z",
  "message": "Asset created successfully",
  "assetId": "abc123",
  "userId": "user456"
}
```

### **Error Tracking**
- **Sentry Integration**: Automatic error capture and alerting
- **Environment-Specific**: Separate Sentry projects per environment
- **User Context**: JWT user information included in error reports

---

## 🔄 **Integration Workflow**

### **Frontend-Backend Alignment**
1. **Environment Detection**: Both use hostname as primary method
2. **Configuration**: Environment-specific settings applied at runtime
3. **CORS**: Strict origin validation per environment
4. **Authentication**: JWT tokens with role-based access
5. **File Handling**: Direct GCS upload with signed URLs

### **Development Workflow**
```typescript
// Frontend detects environment
const environment = detectEnvironment();

// Frontend calls appropriate backend
const backendUrl = getBackendUrl(environment);

// Backend validates request
const validatedRequest = validateRequest(req, environment);

// Backend processes with environment-specific config
const result = processWithEnvironmentConfig(validatedRequest);
```

---

## 📋 **Next Steps & Roadmap**

### **Immediate Priorities**
1. **Complete Development Environment**: Finalize enhanced health endpoint
2. **End-to-End Testing**: Validate all environments with frontend
3. **Performance Optimization**: Implement caching and CDN

### **Phase 1: Taxonomy Service** (Weeks 1-3)
- Standalone taxonomy microservice
- RESTful API with versioning
- Admin interface for taxonomy management

### **Phase 2: RBAC & Admin Interface** (Weeks 5-8)
- Role-based access control implementation
- Comprehensive admin dashboard
- User management interface

### **Phase 3: Gen-AI Integration** (Weeks 9-12)
- Unified creation workflow
- Real-time generation status tracking
- Seamless frontend-backend integration

---

## 🤝 **Collaboration Points**

### **Frontend Team Responsibilities**
- Environment detection and banner display
- API integration and error handling
- File upload UI and progress tracking
- User authentication and session management

### **Backend Team Responsibilities**
- API development and optimization
- Environment-specific configuration
- Database design and migration
- Security and CORS implementation

### **Shared Responsibilities**
- Environment strategy alignment
- API contract maintenance
- Testing and quality assurance
- Documentation and knowledge sharing

---

**This architecture ensures perfect alignment between frontend and backend, with robust environment isolation and enterprise-grade security. We're ready to support your frontend development and integration needs!**

---

**Document Created**: June 27, 2025  
**Version**: 1.0  
**Last Updated**: Initial creation  
**Next Review**: After Phase 1 completion 