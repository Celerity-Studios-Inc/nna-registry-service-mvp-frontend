# Three-Environment Strategy - Backend Implementation Guide

## Overview
This document outlines the comprehensive three-environment infrastructure strategy for the NNA Registry Service, providing complete separation between development, staging, and production environments.

## 🎯 **Environment Architecture**

### **Development Environment**
- **Purpose**: Feature development and testing
- **Frontend Domain**: `https://nna-registry-dev-frontend.vercel.app`
- **Backend Domain**: `https://registry.dev.reviz.dev` (to be setup)
- **Local Backend**: `http://localhost:3000` (for local development)
- **Database**: Development MongoDB instance or local MongoDB
- **Storage**: Development GCS bucket or local storage
- **Authentication**: Development JWT keys
- **Logging**: Verbose debug logging enabled

### **Staging Environment** 
- **Purpose**: Pre-production testing and integration validation
- **Frontend Domain**: `https://nna-registry-stg-frontend.vercel.app`
- **Backend Domain**: `https://registry.stg.reviz.dev` (existing)
- **Database**: Dedicated staging MongoDB instance
- **Storage**: `nna_registry_assets_stg` GCS bucket
- **Authentication**: Staging-specific JWT signing keys

### **Production Environment**
- **Purpose**: Live production service
- **Frontend Domain**: `https://nna-registry-frontend.vercel.app`
- **Backend Domain**: `https://registry.reviz.dev` (existing)
- **Database**: Production MongoDB instance
- **Storage**: `nna_registry_assets` GCS bucket
- **Authentication**: Production JWT signing keys

## 🔧 **Backend Implementation Requirements**

### **1. Domain Configuration**

#### **Google Cloud Run Services**
```yaml
# Development Backend
name: nna-registry-service-development
domain: registry.dev.reviz.dev
ssl: managed_certificate
cors_origins:
  - https://nna-registry-dev-frontend.vercel.app
  - http://localhost:3001

# Staging Backend
name: nna-registry-service-staging
domain: registry.stg.reviz.dev
ssl: managed_certificate
cors_origins:
  - https://nna-registry-stg-frontend.vercel.app

# Production Backend  
name: nna-registry-service-production
domain: registry.reviz.dev
ssl: managed_certificate
cors_origins:
  - https://nna-registry-frontend.vercel.app
```

#### **DNS Configuration**
```dns
# Required DNS Records
registry.dev.reviz.dev    CNAME    ghs.googlehosted.com
registry.stg.reviz.dev    CNAME    ghs.googlehosted.com
registry.reviz.dev        CNAME    ghs.googlehosted.com
```

### **2. Database Isolation**

#### **MongoDB Database Structure**
```javascript
// Development
mongodb://localhost:27017/nna_registry_dev

// Staging  
mongodb://staging-cluster.mongodb.net/nna_registry_staging

// Production
mongodb://production-cluster.mongodb.net/nna_registry_production
```

#### **Environment-Specific Collections**
- **Assets Collection**: Complete data isolation between environments
- **Users Collection**: Separate user bases for staging vs production
- **Taxonomy Data**: Consistent across environments but separate instances

### **3. Storage Bucket Configuration**

#### **Google Cloud Storage Buckets**
```json
{
  "development": {
    "bucket": "nna_registry_assets_dev",
    "cors_policy": "permissive_local_development"
  },
  "staging": {
    "bucket": "nna_registry_assets_stg", 
    "cors_policy": {
      "origin": ["https://nna-registry-staging.vercel.app"],
      "method": ["GET", "POST", "OPTIONS"],
      "header": ["Authorization", "Content-Type"],
      "maxAgeSeconds": 86400
    }
  },
  "production": {
    "bucket": "nna_registry_assets",
    "cors_policy": {
      "origin": ["https://nna-registry-service-mvp-frontend.vercel.app"],
      "method": ["GET", "POST", "OPTIONS"], 
      "header": ["Authorization", "Content-Type"],
      "maxAgeSeconds": 86400
    }
  }
}
```

### **4. CORS Configuration**

#### **Required CORS Headers by Environment**
```javascript
// Staging CORS Configuration
const stagingCors = {
  origin: [
    'https://nna-registry-staging.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization',
    'Content-Type', 
    'Content-Length',
    'X-Requested-With',
    'Accept'
  ],
  credentials: true,
  maxAge: 86400
};

// Production CORS Configuration  
const productionCors = {
  origin: [
    'https://nna-registry-service-mvp-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization',
    'Content-Type',
    'Content-Length', 
    'X-Requested-With',
    'Accept'
  ],
  credentials: true,
  maxAge: 86400
};
```

### **5. Environment Detection**

#### **Backend Environment Configuration**
```javascript
// Environment detection logic
const getEnvironmentConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  const customDomain = process.env.CUSTOM_DOMAIN;
  
  const configs = {
    development: {
      database: 'mongodb://localhost:27017/nna_registry_dev',
      storage: 'nna_registry_assets_dev',
      jwtSecret: process.env.JWT_SECRET_DEV,
      corsOrigins: ['http://localhost:3000'],
      logLevel: 'debug'
    },
    staging: {
      database: process.env.MONGODB_STAGING_URI,
      storage: 'nna_registry_assets_stg',
      jwtSecret: process.env.JWT_SECRET_STAGING,
      corsOrigins: ['https://nna-registry-staging.vercel.app'],
      logLevel: 'info',
      customDomain: 'registry.stg.reviz.dev'
    },
    production: {
      database: process.env.MONGODB_PRODUCTION_URI,
      storage: 'nna_registry_assets',
      jwtSecret: process.env.JWT_SECRET_PRODUCTION,
      corsOrigins: ['https://nna-registry-service-mvp-frontend.vercel.app'],
      logLevel: 'error',
      customDomain: 'registry.mvp.reviz.dev'
    }
  };
  
  return configs[environment];
};
```

## 📊 **Environment Variables Configuration**

### **Staging Environment Variables**
```bash
# Staging Backend (.env.staging)
NODE_ENV=staging
MONGODB_URI=mongodb://staging-cluster.mongodb.net/nna_registry_staging
GCS_BUCKET_NAME=nna_registry_assets_stg
JWT_SECRET=staging_specific_jwt_secret
CUSTOM_DOMAIN=registry.stg.reviz.dev
CORS_ORIGINS=https://nna-registry-staging.vercel.app
LOG_LEVEL=info
```

### **Production Environment Variables**
```bash
# Production Backend (.env.production)
NODE_ENV=production
MONGODB_URI=mongodb://production-cluster.mongodb.net/nna_registry_production
GCS_BUCKET_NAME=nna_registry_assets
JWT_SECRET=production_jwt_secret
CUSTOM_DOMAIN=registry.mvp.reviz.dev
CORS_ORIGINS=https://nna-registry-service-mvp-frontend.vercel.app
LOG_LEVEL=error
```

## 🚀 **Deployment Strategy**

### **Google Cloud Run Deployment**
```yaml
# staging-deploy.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: nna-registry-service-staging
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/execution-environment: gen2
    spec:
      containers:
      - image: gcr.io/PROJECT_ID/nna-registry-backend:staging
        env:
        - name: NODE_ENV
          value: staging
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: staging-secrets
              key: mongodb-uri
```

### **Continuous Deployment Triggers**
- **Staging**: Deploy on push to `staging` branch
- **Production**: Deploy on push to `main` branch with manual approval
- **Development**: Local development only

## 🔍 **Testing & Validation**

### **Environment-Specific Health Checks**
```javascript
// Health check endpoint with environment identification
app.get('/api/health', (req, res) => {
  const config = getEnvironmentConfig();
  
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    domain: config.customDomain,
    database: config.database.includes('staging') ? 'staging' : 'production',
    storage: config.storage,
    corsOrigins: config.corsOrigins
  });
});
```

### **Data Isolation Verification**
```javascript
// Verify environment data isolation
const verifyDataIsolation = async () => {
  const environment = process.env.NODE_ENV;
  const assetCount = await Asset.countDocuments();
  
  console.log(`Environment: ${environment}`);
  console.log(`Asset count: ${assetCount}`);
  console.log(`Expected: ${environment === 'staging' ? '<1000 (test data)' : '>1000 (production data)'}`);
};
```

## 🛡️ **Security Considerations**

### **JWT Token Isolation**
- **Staging JWT Secret**: Separate from production
- **Token Expiration**: Shorter for staging (1 hour vs 24 hours)
- **Refresh Tokens**: Environment-specific validation

### **API Rate Limiting**
```javascript
// Environment-specific rate limiting
const rateLimits = {
  development: { windowMs: 60000, max: 1000 },
  staging: { windowMs: 60000, max: 100 },
  production: { windowMs: 60000, max: 50 }
};
```

### **Error Handling & Logging**
```javascript
// Environment-aware error responses
const errorHandler = (error, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isStaging = process.env.NODE_ENV === 'staging';
  
  const response = {
    message: error.message,
    ...(isDevelopment || isStaging) && { stack: error.stack },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  res.status(error.status || 500).json(response);
};
```

## 📋 **Implementation Checklist**

### **Phase 1: Infrastructure Setup**
- [ ] Create staging Google Cloud Run service
- [ ] Configure staging MongoDB database
- [ ] Set up staging GCS bucket with CORS
- [ ] Configure DNS records for custom domains
- [ ] Implement SSL certificates

### **Phase 2: Environment Configuration**
- [ ] Update backend environment detection
- [ ] Configure environment-specific variables
- [ ] Implement CORS policies per environment
- [ ] Set up JWT token isolation
- [ ] Configure logging levels

### **Phase 3: Deployment Pipeline**
- [ ] Create staging deployment workflow
- [ ] Implement environment-specific builds
- [ ] Set up automated testing per environment
- [ ] Configure monitoring and alerting
- [ ] Validate health check endpoints

### **Phase 4: Frontend Integration**
- [ ] Update frontend environment detection
- [ ] Configure API endpoints per environment
- [ ] Test smart file routing
- [ ] Validate video thumbnail CORS
- [ ] Verify complete workflows

## 🎯 **Success Metrics**

### **Staging Environment Validation**
- ✅ **Custom Domain**: `registry.stg.reviz.dev` responding
- ✅ **Data Isolation**: No production data visible
- ✅ **CORS Policy**: Video thumbnails working
- ✅ **File Uploads**: Smart routing operational
- ✅ **Asset Registration**: Complete workflows functional

### **Production Environment Validation**
- ✅ **Performance**: <3 second load times
- ✅ **Reliability**: 99.9% uptime
- ✅ **Security**: Input validation and error boundaries
- ✅ **Monitoring**: Comprehensive logging and alerting
- ✅ **Scalability**: Auto-scaling based on demand

## 🔄 **Migration Timeline**

### **Week 1: Staging Enhancement**
- Implement custom domain for staging
- Enhance environment detection
- Validate complete isolation

### **Week 2: Production Preparation**  
- Set up production custom domain
- Implement comprehensive monitoring
- Conduct load testing

### **Week 3: Deployment & Validation**
- Deploy three-environment strategy
- Validate all workflows
- Monitor system performance

### **Week 4: Documentation & Training**
- Update team documentation
- Conduct knowledge transfer
- Establish operational procedures

## 📞 **Support & Maintenance**

### **Environment Responsibilities**
- **Development**: Frontend team manages local setup
- **Staging**: DevOps team manages infrastructure and deployment
- **Production**: Backend team manages with DevOps support

### **Monitoring & Alerting**
- **Health Checks**: Every 5 minutes per environment
- **Performance Metrics**: Response time, error rate, throughput
- **Error Alerts**: Immediate notification for production issues
- **Capacity Planning**: Weekly review of resource utilization

### **Backup & Recovery**
- **Database Backups**: Daily automated backups per environment
- **Asset Storage**: GCS versioning and lifecycle management
- **Disaster Recovery**: Cross-region backup for production
- **Testing**: Monthly disaster recovery drills

This three-environment strategy provides complete isolation, enhanced security, and improved development workflows while maintaining the high-quality user experience of the NNA Registry Service.