# NNA Registry Service - Environment Configuration Reference

## 🎯 **Executive Summary**

This document provides the definitive reference for all environment configurations in the NNA Registry Service. It includes canonical domain mappings, environment-specific variables, and verification procedures to ensure proper isolation between development, staging, and production environments.

**Last Updated**: July 5, 2025  
**Version**: 1.0  
**Status**: ✅ **Canonical Configuration Established**

---

## 🌍 **Canonical Environment Mapping**

### **Complete Environment Configuration Table**

| Environment | Frontend Domain                              | Backend Domain                | Database Name                  | GCS Bucket Name             | CORS Allowed Origin                        | MongoDB URI                                                                 |
|-------------|----------------------------------------------|-------------------------------|-------------------------------|-----------------------------|--------------------------------------------|-----------------------------------------------------------------------------|
| **Development** | `https://nna-registry-frontend-dev.vercel.app`       | `https://registry.dev.reviz.dev`      | `nna-registry-service-dev`    | `nna_registry_assets_dev`   | `https://nna-registry-frontend-dev.vercel.app` | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-dev?retryWrites=true&w=majority&appName=registryService` |
| **Staging**     | `https://nna-registry-frontend-stg.vercel.app`       | `https://registry.stg.reviz.dev`      | `nna-registry-service-staging`| `nna_registry_assets_stg`   | `https://nna-registry-frontend-stg.vercel.app` | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-staging?retryWrites=true&w=majority&appName=registryService` |
| **Production**  | `https://nna-registry-frontend.vercel.app`           | `https://registry.reviz.dev`          | `nna-registry-service-production`   | `nna_registry_assets_prod`  | `https://nna-registry-frontend.vercel.app`      | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-production?retryWrites=true&w=majority&appName=registryService` |

---

## 🏗️ **Cloud Run Service Configuration**

### **Service Names and Regions**

| Environment | Cloud Run Service Name | Region | Custom Domain |
|-------------|----------------------|---------|---------------|
| **Development** | `nna-registry-service-dev` | `us-central1` | `registry.dev.reviz.dev` |
| **Staging** | `nna-registry-service-staging` | `us-central1` | `registry.stg.reviz.dev` |
| **Production** | `nna-registry-service` | `us-central1` | `registry.reviz.dev` |

### **Environment Variable Mappings**

Each Cloud Run service maps environment variables to Google Cloud Secret Manager secrets:

#### **Development Environment Variables**
```yaml
Environment Variables:
  NODE_ENV: "development"
  MONGODB_URI: "mongodb-uri-dev" (secret)
  GCP_BUCKET_NAME: "GCP_BUCKET_NAME_DEV" (secret)
  JWT_SECRET: "JWT_SECRET_DEV" (secret)
  SENTRY_DSN: "SENTRY_DSN_DEV" (secret)
```

#### **Staging Environment Variables**
```yaml
Environment Variables:
  NODE_ENV: "staging"
  MONGODB_URI: "mongodb-uri-stg" (secret)
  GCP_BUCKET_NAME: "GCP_BUCKET_NAME_STG" (secret)
  JWT_SECRET: "JWT_SECRET_STG" (secret)
  SENTRY_DSN: "SENTRY_DSN_STG" (secret)
```

#### **Production Environment Variables**
```yaml
Environment Variables:
  NODE_ENV: "production"
  MONGODB_URI: "mongodb-uri" (secret)
  GCP_BUCKET_NAME: "GCP_BUCKET_NAME" (secret)
  JWT_SECRET: "JWT_SECRET" (secret)
  SENTRY_DSN: "SENTRY_DSN" (secret)
```

---

## 🔐 **Secret Manager Configuration**

### **Secret Names and Values**

#### **Development Secrets**
| Secret Name | Secret Value | Purpose |
|-------------|--------------|---------|
| `mongodb-uri-dev` | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-dev?retryWrites=true&w=majority&appName=registryService` | Development database connection |
| `GCP_BUCKET_NAME_DEV` | `nna_registry_assets_dev` | Development GCS bucket |
| `JWT_SECRET_DEV` | `dev-jwt-secret-key` | Development JWT signing |
| `SENTRY_DSN_DEV` | `https://dev-sentry-dsn@sentry.io/project` | Development error tracking |

#### **Staging Secrets**
| Secret Name | Secret Value | Purpose |
|-------------|--------------|---------|
| `mongodb-uri-stg` | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-staging?retryWrites=true&w=majority&appName=registryService` | Staging database connection |
| `GCP_BUCKET_NAME_STG` | `nna_registry_assets_stg` | Staging GCS bucket |
| `JWT_SECRET_STG` | `stg-jwt-secret-key` | Staging JWT signing |
| `SENTRY_DSN_STG` | `https://stg-sentry-dsn@sentry.io/project` | Staging error tracking |

#### **Production Secrets**
| Secret Name | Secret Value | Purpose |
|-------------|--------------|---------|
| `mongodb-uri` | `mongodb+srv://admin:PTtQFc0N9gftuRIX@registryservice.xhmyito.mongodb.net/nna-registry-service-production?retryWrites=true&w=majority&appName=registryService` | Production database connection |
| `GCP_BUCKET_NAME` | `nna_registry_assets_prod` | Production GCS bucket |
| `JWT_SECRET` | `prod-jwt-secret-key` | Production JWT signing |
| `SENTRY_DSN` | `https://prod-sentry-dsn@sentry.io/project` | Production error tracking |

---

## 🔒 **CORS Configuration**

### **Environment-Specific CORS Policies**

#### **Development CORS**
```typescript
allowedOrigins: [
  'https://nna-registry-frontend-dev.vercel.app',
  'http://localhost:3000',  // For local development
  'http://localhost:3001'   // Alternative local port
]
```

#### **Staging CORS**
```typescript
allowedOrigins: [
  'https://nna-registry-frontend-stg.vercel.app'
]
```

#### **Production CORS**
```typescript
allowedOrigins: [
  'https://nna-registry-frontend.vercel.app'
]
```

---

## 🚀 **Deployment Configuration**

### **GitHub Actions Workflows**

#### **Development Deployment** (`ci-cd-dev.yml`)
```yaml
Triggers: Push to `taxonomy-dev` branch
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

---

## 📊 **Health Endpoint Responses**

### **Expected Health Endpoint Format**

#### **Development Health Response**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-05T03:27:40.749377Z",
  "version": "1.0.1",
  "environment": "development",
  "detection": {
    "method": "hostname",
    "hostname": "registry.dev.reviz.dev"
  },
  "config": {
    "database": {
      "connected": true,
      "name": "nna-registry-service-dev"
    },
    "storage": {
      "provider": "gcp",
      "bucket": "nna_registry_assets_dev"
    },
    "cors": {
      "allowedOrigins": ["https://nna-registry-frontend-dev.vercel.app"]
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
  "timestamp": "2025-07-05T03:27:40.749377Z",
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
    },
    "logging": {
      "level": "info"
    }
  }
}
```

#### **Production Health Response**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-05T03:27:40.749377Z",
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
    },
    "logging": {
      "level": "warn"
    }
  }
}
```

---

## 🛠️ **Verification Procedures**

### **Automated Verification Script**

Use the provided verification script to check all environments:

```bash
# Verify all environments
./scripts/verify-environments.sh all

# Verify specific environment
./scripts/verify-environments.sh dev
./scripts/verify-environments.sh staging
./scripts/verify-environments.sh prod
```

### **Manual Verification Checklist**

#### **Pre-Deployment Checks**
- [ ] Verify Cloud Run service names match expected pattern
- [ ] Confirm secret mappings are correct for target environment
- [ ] Validate environment variables are properly set
- [ ] Check CORS configuration allows correct frontend domain

#### **Post-Deployment Checks**
- [ ] Health endpoint returns correct environment information
- [ ] Database connection uses correct database name
- [ ] GCS bucket name matches expected value
- [ ] CORS preflight requests succeed from frontend domain
- [ ] Environment detection logic works correctly

#### **Cross-Environment Isolation Checks**
- [ ] Assets created in dev appear only in dev database/bucket
- [ ] Assets created in staging appear only in staging database/bucket
- [ ] Assets created in production appear only in production database/bucket
- [ ] No cross-environment data leakage occurs

---

## 🚨 **Common Configuration Issues**

### **Issue 1: Wrong GCS Bucket Name**
**Symptoms**: Assets show production bucket URL in development environment
**Cause**: `GCP_BUCKET_NAME` secret mapped to wrong value
**Solution**: Update Cloud Run environment variable mapping to correct secret

### **Issue 2: Wrong Database Connection**
**Symptoms**: Assets appear in wrong database
**Cause**: `MONGODB_URI` secret mapped to wrong value
**Solution**: Update Cloud Run environment variable mapping to correct secret

### **Issue 3: CORS Errors**
**Symptoms**: Frontend cannot communicate with backend
**Cause**: CORS configuration doesn't allow frontend domain
**Solution**: Update CORS allowed origins in backend configuration

### **Issue 4: Environment Detection Failure**
**Symptoms**: Health endpoint shows wrong environment
**Cause**: Hostname detection logic or environment variables incorrect
**Solution**: Verify hostname configuration and environment variable values

---

## 📋 **Maintenance Procedures**

### **Adding New Environment**
1. Create new Cloud Run service with appropriate name
2. Create new secrets in Secret Manager with environment suffix
3. Configure environment variables in Cloud Run service
4. Update CORS configuration for new frontend domain
5. Add new environment to verification script
6. Update this documentation

### **Updating Secret Values**
1. Update secret value in Google Cloud Secret Manager
2. Redeploy Cloud Run service to pick up new secret value
3. Verify configuration using health endpoint
4. Run verification script to confirm changes

### **Troubleshooting Configuration**
1. Run verification script to identify issues
2. Check Cloud Run service configuration
3. Verify secret values in Secret Manager
4. Test health endpoint for runtime configuration
5. Check CORS preflight requests

---

## 📚 **Related Documentation**

- [CANONICAL_DOMAINS_INTEGRATION.md](../for-backend/CANONICAL_DOMAINS_INTEGRATION.md)
- [THREE_ENVIRONMENT_STRATEGY.md](../for-backend/THREE_ENVIRONMENT_STRATEGY.md)
- [CONSOLIDATED_DOMAIN_REQUEST.md](../for-backend/CONSOLIDATED_DOMAIN_REQUEST.md)
- [THREE_ENVIRONMENT_STRATEGY_ALIGNMENT.md](../for-frontend/THREE_ENVIRONMENT_STRATEGY_ALIGNMENT.md)
- [BACKEND_ARCHITECTURE_OVERVIEW.md](../for-frontend/BACKEND_ARCHITECTURE_OVERVIEW.md)

---

**This document serves as the single source of truth for all environment configurations. Any changes to environment setup must be reflected here and verified using the provided verification script.** 