# NNA Registry Service - Environment Configuration Reference

## 🎯 **Executive Summary**

This document provides the definitive reference for all environment configurations in the NNA Registry Service. It includes canonical domain mappings, environment-specific variables, and verification procedures to ensure proper isolation between development, staging, and production environments.

**Last Updated**: July 18, 2025  
**Version**: 2.0  
**Status**: ✅ **Canonical Configuration Established - Frontend Integration Recovery Required**

---

## 🌍 **Canonical Environment Mapping**

### **Complete Environment Configuration Table**

| Environment     | Frontend Domain                                | Backend Domain                   | Database Name                     | GCS Bucket Name            | CORS Allowed Origin                            | MongoDB URI                                                                                                                                                    |
| --------------- | ---------------------------------------------- | -------------------------------- | --------------------------------- | -------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Development** | `https://nna-registry-frontend-dev.vercel.app` | `https://registry.dev.reviz.dev` | `nna-registry-service-dev`        | `nna_registry_assets_dev`  | `https://nna-registry-frontend-dev.vercel.app` | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-dev?retryWrites=true&w=majority&appName=registryService`        |
| **Staging**     | `https://nna-registry-frontend-stg.vercel.app` | `https://registry.stg.reviz.dev` | `nna-registry-service-staging`    | `nna_registry_assets_stg`  | `https://nna-registry-frontend-stg.vercel.app` | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-staging?retryWrites=true&w=majority&appName=registryService`    |
| **Production**  | `https://nna-registry-frontend.vercel.app`     | `https://registry.reviz.dev`     | `nna-registry-service-production` | `nna_registry_assets_prod` | `https://nna-registry-frontend.vercel.app`     | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-production?retryWrites=true&w=majority&appName=registryService` |

### **⚠️ CRITICAL: Frontend Integration Issue**

**Current Problem**: Frontend is making API requests to frontend domains instead of backend domains.

**Incorrect (Current)**:
```
❌ API Requests: https://nna-registry-frontend-dev.vercel.app/api/auth/login
```

**Correct (Required)**:
```
✅ API Requests: https://registry.dev.reviz.dev/api/auth/login
```

**Frontend Team Action Required**: Update API service configuration to use detected backend URLs.

---

## 🏗️ **Cloud Run Service Configuration**

### **Service Names and Regions**

| Environment     | Cloud Run Service Name         | Region        | Custom Domain            | Status |
| --------------- | ------------------------------ | ------------- | ------------------------ | ------ |
| **Development** | `nna-registry-service-dev`     | `us-central1` | `registry.dev.reviz.dev` | ✅ Active |
| **Staging**     | `nna-registry-service-staging` | `us-central1` | `registry.stg.reviz.dev` | ⏳ Pending |
| **Production**  | `nna-registry-service`         | `us-central1` | `registry.reviz.dev`     | ⏳ Pending |

### **Environment Variable Mappings**

Each Cloud Run service maps environment variables to Google Cloud Secret Manager secrets:

#### **Development Environment Variables**

```yaml
Environment Variables:
  NODE_ENV: "development"
  ENVIRONMENT: "development"
  MONGODB_URI: "mongodb-uri-dev" (secret)
  GCP_BUCKET_NAME: "GCP_BUCKET_NAME_DEV" (secret)
  JWT_SECRET: "JWT_SECRET_DEV" (secret)
  SENTRY_DSN: "SENTRY_DSN_DEV" (secret)
```

#### **Staging Environment Variables**

```yaml
Environment Variables:
  NODE_ENV: "staging"
  ENVIRONMENT: "staging"
  MONGODB_URI: "mongodb-uri-stg" (secret)
  GCP_BUCKET_NAME: "GCP_BUCKET_NAME_STG" (secret)
  JWT_SECRET: "JWT_SECRET_STG" (secret)
  SENTRY_DSN: "SENTRY_DSN_STG" (secret)
```

#### **Production Environment Variables**

```yaml
Environment Variables:
  NODE_ENV: "production"
  ENVIRONMENT: "production"
  MONGODB_URI: "mongodb-uri" (secret)
  GCP_BUCKET_NAME: "GCP_BUCKET_NAME" (secret)
  JWT_SECRET: "JWT_SECRET" (secret)
  SENTRY_DSN: "SENTRY_DSN" (secret)
```

---

## 🔐 **Secret Manager Configuration**

### **Secret Names and Values**

#### **Development Secrets**

| Secret Name           | Secret Value                                                                                                                                            | Purpose                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `mongodb-uri-dev`     | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-dev?retryWrites=true&w=majority&appName=registryService` | Development database connection |
| `GCP_BUCKET_NAME_DEV` | `nna_registry_assets_dev`                                                                                                                               | Development GCS bucket          |
| `JWT_SECRET_DEV`      | `dev-jwt-secret-key`                                                                                                                                    | Development JWT signing         |
| `SENTRY_DSN_DEV`      | `https://dev-sentry-dsn@sentry.io/project`                                                                                                              | Development error tracking      |

#### **Staging Secrets**

| Secret Name           | Secret Value                                                                                                                                                | Purpose                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `mongodb-uri-stg`     | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-staging?retryWrites=true&w=majority&appName=registryService` | Staging database connection |
| `GCP_BUCKET_NAME_STG` | `nna_registry_assets_stg`                                                                                                                                   | Staging GCS bucket          |
| `JWT_SECRET_STG`      | `stg-jwt-secret-key`                                                                                                                                        | Staging JWT signing         |
| `SENTRY_DSN_STG`      | `https://stg-sentry-dsn@sentry.io/project`                                                                                                                  | Staging error tracking      |

#### **Production Secrets**

| Secret Name       | Secret Value                                                                                                                                                   | Purpose                        |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `mongodb-uri`     | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-production?retryWrites=true&w=majority&appName=registryService` | Production database connection |
| `GCP_BUCKET_NAME` | `nna_registry_assets_prod`                                                                                                                                     | Production GCS bucket          |
| `JWT_SECRET`      | `prod-jwt-secret-key`                                                                                                                                          | Production JWT signing         |
| `SENTRY_DSN`      | `https://prod-sentry-dsn@sentry.io/project`                                                                                                                    | Production error tracking      |

---

## 🔒 **CORS Configuration**

### **Environment-Specific CORS Policies**

#### **Development CORS**

```typescript
allowedOrigins: [
  'https://nna-registry-frontend-dev.vercel.app',
  'http://localhost:3000', // For local development
  'http://localhost:3001', // Alternative local port
];
```

#### **Staging CORS**

```typescript
allowedOrigins: ['https://nna-registry-frontend-stg.vercel.app'];
```

#### **Production CORS**

```typescript
allowedOrigins: ['https://nna-registry-frontend.vercel.app'];
```

---

## 🚀 **Deployment Configuration**

### **GitHub Actions Workflows**

#### **Development Deployment** (`ci-cd-dev.yml`)

```yaml
Triggers: Push to `dev` branch
Target: `nna-registry-service-dev` Cloud Run service
Environment: Development
Secrets: All `-dev` suffixed secrets
```

#### **Staging Deployment** (`ci-cd-stg.yml`)

```yaml
Triggers: Push to `staging` branch
Target: `nna-registry-service-staging` Cloud Run service
Environment: Staging
Secrets: All `-stg` suffixed secrets
```

#### **Production Deployment** (`ci-cd.yml`)

```yaml
Triggers: Push to `main` branch (with approval)
Target: `nna-registry-service` Cloud Run service
Environment: Production
Secrets: All production secrets (no suffix)
```

---

## 🔍 **Environment Detection Logic**

### **Backend Environment Detection**

```typescript
// Primary: Hostname-based detection
const hostname = req.hostname;

if (hostname.includes('registry.stg.reviz.dev')) {
  return 'staging';
}

if (hostname.includes('registry.dev.reviz.dev')) {
  return 'development';
}

if (hostname.includes('registry.reviz.dev')) {
  return 'production';
}

// Fallback: Environment variables
const nodeEnv = process.env.NODE_ENV;
const environment = process.env.ENVIRONMENT;

// Safety: Default to production
return 'production';
```

### **Frontend Environment Detection**

```typescript
// Primary: Hostname-based detection
const hostname = window.location.hostname;

if (hostname.includes('nna-registry-frontend-stg.vercel.app')) {
  return 'staging';
}

if (hostname.includes('nna-registry-frontend-dev.vercel.app')) {
  return 'development';
}

if (hostname.includes('nna-registry-frontend.vercel.app')) {
  return 'production';
}

// Fallback: Environment variables
const reactAppEnv = process.env.REACT_APP_ENVIRONMENT;
const nodeEnv = process.env.NODE_ENV;

// Safety: Default to production
return 'production';
```

### **Frontend Backend URL Resolution**

```typescript
// ✅ CORRECT: Use detected environment to get backend URL
const getBackendUrl = () => {
  const environment = detectEnvironment();
  switch (environment) {
    case 'development': return 'https://registry.dev.reviz.dev';
    case 'staging': return 'https://registry.stg.reviz.dev';
    case 'production': return 'https://registry.reviz.dev';
    default: return 'https://registry.reviz.dev';
  }
};

// ❌ INCORRECT: Hardcoded frontend domain
const API_BASE_URL = 'https://nna-registry-frontend-dev.vercel.app';
```

---

## 📊 **Health Endpoint Responses**

### **Expected Health Endpoint Format**

#### **Development Health Response**

```json
{
  "status": "healthy",
  "timestamp": "2025-07-18T18:39:21.253Z",
  "version": "1.0.1",
  "environment": "development",
  "detection": {
    "method": "hostname",
    "hostname": "registry.dev.reviz.dev",
    "nodeEnv": "development",
    "environmentVar": "development",
    "gcpBucketName": "nna_registry_assets_dev",
    "mongodbDatabase": "nna-registry-service-dev"
  },
  "config": {
    "database": {
      "connected": true,
      "name": "nna-registry-development"
    },
    "storage": {
      "provider": "gcp",
      "bucket": "nna-registry-development-storage"
    },
    "cors": {
      "allowedOrigins": [
        "http://localhost:3001",
        "https://nna-registry-frontend-dev.vercel.app"
      ]
    },
    "logging": {
      "level": "debug"
    }
  }
}
```

#### **Staging Health Response**

```json
{
  "status": "healthy",
  "timestamp": "2025-07-18T18:39:21.253Z",
  "version": "1.0.1",
  "environment": "staging",
  "detection": {
    "method": "hostname",
    "hostname": "registry.stg.reviz.dev"
  },
  "config": {
    "database": {
      "connected": true,
      "name": "nna-registry-service-staging"
    },
    "storage": {
      "provider": "gcp",
      "bucket": "nna_registry_assets_stg"
    },
    "cors": {
      "allowedOrigins": ["https://nna-registry-frontend-stg.vercel.app"]
    }
  }
}
```

#### **Production Health Response**

```json
{
  "status": "healthy",
  "timestamp": "2025-07-18T18:39:21.253Z",
  "version": "1.0.1",
  "environment": "production",
  "detection": {
    "method": "hostname",
    "hostname": "registry.reviz.dev"
  },
  "config": {
    "database": {
      "connected": true,
      "name": "nna-registry-service-production"
    },
    "storage": {
      "provider": "gcp",
      "bucket": "nna_registry_assets_prod"
    },
    "cors": {
      "allowedOrigins": ["https://nna-registry-frontend.vercel.app"]
    }
  }
}
```

---

## 🔧 **API Endpoints Reference**

### **Canonical API Endpoints**

All API endpoints follow the pattern: `{BACKEND_DOMAIN}/api/{endpoint}`

#### **Authentication Endpoints**

| Endpoint | Method | Description | Example URL |
|----------|--------|-------------|-------------|
| `/api/auth/register` | POST | User registration | `https://registry.dev.reviz.dev/api/auth/register` |
| `/api/auth/login` | POST | User login | `https://registry.dev.reviz.dev/api/auth/login` |
| `/api/auth/profile` | GET | Get user profile | `https://registry.dev.reviz.dev/api/auth/profile` |

#### **Asset Endpoints**

| Endpoint | Method | Description | Example URL |
|----------|--------|-------------|-------------|
| `/api/assets` | GET | List assets | `https://registry.dev.reviz.dev/api/assets` |
| `/api/assets` | POST | Create asset | `https://registry.dev.reviz.dev/api/assets` |
| `/api/assets/{name}` | GET | Get asset by name | `https://registry.dev.reviz.dev/api/assets/asset-name` |
| `/api/assets/{name}` | PUT | Update asset | `https://registry.dev.reviz.dev/api/assets/asset-name` |
| `/api/assets/{name}` | DELETE | Delete asset | `https://registry.dev.reviz.dev/api/assets/asset-name` |

#### **Taxonomy Endpoints**

| Endpoint | Method | Description | Example URL |
|----------|--------|-------------|-------------|
| `/api/taxonomy/layers` | GET | List all layers | `https://registry.dev.reviz.dev/api/taxonomy/layers` |
| `/api/taxonomy/layers/{layer}/categories` | GET | Get layer categories | `https://registry.dev.reviz.dev/api/taxonomy/layers/G/categories` |
| `/api/taxonomy/layers/{layer}/categories/{category}/subcategories` | GET | Get subcategories | `https://registry.dev.reviz.dev/api/taxonomy/layers/G/Hip_Hop/subcategories` |

#### **Health Endpoints**

| Endpoint | Method | Description | Example URL |
|----------|--------|-------------|-------------|
| `/api/health` | GET | Service health | `https://registry.dev.reviz.dev/api/health` |
| `/api/taxonomy/health` | GET | Taxonomy health | `https://registry.dev.reviz.dev/api/taxonomy/health` |

#### **Documentation Endpoints**

| Endpoint | Method | Description | Example URL |
|----------|--------|-------------|-------------|
| `/api/docs` | GET | Swagger documentation | `https://registry.dev.reviz.dev/api/docs` |

---

## 🧪 **Testing and Verification**

### **Environment Health Checks**

#### **Development Environment Test**

```bash
# Health check
curl https://registry.dev.reviz.dev/api/health

# Authentication test
curl -X POST https://registry.dev.reviz.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ajay@testuser.com","password":"password123"}'

# Taxonomy test
curl https://registry.dev.reviz.dev/api/taxonomy/layers
```

#### **Staging Environment Test**

```bash
# Health check
curl https://registry.stg.reviz.dev/api/health

# Authentication test
curl -X POST https://registry.stg.reviz.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Taxonomy test
curl https://registry.stg.reviz.dev/api/taxonomy/layers
```

#### **Production Environment Test**

```bash
# Health check
curl https://registry.reviz.dev/api/health

# Authentication test
curl -X POST https://registry.reviz.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Taxonomy test
curl https://registry.reviz.dev/api/taxonomy/layers
```

### **Frontend Integration Test**

#### **Environment Detection Test**

```javascript
// Test environment detection
console.log('Environment:', detectEnvironment());
console.log('Backend URL:', getBackendUrl());
```

#### **API Request Test**

```javascript
// Test API request to correct backend
const response = await fetch(`${getBackendUrl()}/api/health`);
const data = await response.json();
console.log('Health check:', data);
```

---

## 🚨 **Common Issues and Solutions**

### **Issue 1: Frontend Making Requests to Wrong Domain**

**Problem**: Frontend making API requests to frontend domain instead of backend domain.

**Symptoms**:
- 401/404 errors in browser console
- API requests going to `https://nna-registry-frontend-dev.vercel.app/api/...`
- Login failures

**Solution**: Update API service configuration to use `getBackendUrl()`.

### **Issue 2: CORS Errors**

**Problem**: CORS policy blocking requests from frontend to backend.

**Symptoms**:
- CORS errors in browser console
- Preflight request failures

**Solution**: Ensure backend CORS configuration includes correct frontend domain.

### **Issue 3: Environment Detection Issues**

**Problem**: Frontend not detecting correct environment.

**Symptoms**:
- Wrong backend URL being used
- Incorrect environment variables

**Solution**: Verify hostname-based detection logic and fallback mechanisms.

---

## 📞 **Support and Troubleshooting**

### **Backend Team Support**

- **Health Monitoring**: All environments monitored via `/api/health`
- **Logging**: Comprehensive logging with environment detection
- **Error Tracking**: Sentry integration for error monitoring
- **Database**: MongoDB Atlas with environment isolation

### **Frontend Team Support**

- **Environment Detection**: Hostname-based with fallback
- **API Configuration**: Use `getBackendUrl()` for all API calls
- **Error Handling**: Proper error boundaries and user feedback
- **Testing**: Comprehensive testing across all environments

### **Escalation Process**

1. **Check Health Endpoints**: Verify backend status
2. **Review Environment Detection**: Confirm correct environment
3. **Test API Endpoints**: Verify endpoint accessibility
4. **Check CORS Configuration**: Ensure proper cross-origin setup
5. **Review Logs**: Check backend and frontend logs
6. **Contact Team Lead**: Escalate if issue persists

---

**Last Updated**: July 18, 2025  
**Version**: 2.0  
**Status**: ✅ Canonical configuration established, frontend integration recovery in progress
