# Staging Environment Setup Guide

## Overview

This document provides comprehensive guidance for setting up and using the staging environment for the NNA Registry Service frontend. The staging environment provides an isolated testing environment connected to the staging backend infrastructure.

## 🏗️ **Infrastructure Overview**

### Backend Infrastructure (Provided by Backend Team)
- **Staging Backend URL**: `https://nna-registry-service-staging-297923701246.us-central1.run.app`
- **Database**: Separate MongoDB instance (isolated from production)
- **Storage**: Dedicated Google Cloud Storage bucket
- **Authentication**: Separate JWT signing keys
- **Environment**: Complete isolation from production data

### Frontend Infrastructure 
- **Staging Frontend URL**: `https://nna-registry-staging.vercel.app`
- **Deployment**: Vercel preview deployments
- **Configuration**: Environment-specific settings and feature flags
- **CORS**: Pre-configured by backend team for staging domain

## 📋 **Setup Instructions**

### 1. Environment Configuration Files

The following files have been created for staging environment support:

#### `.env.staging`
```bash
REACT_APP_ENVIRONMENT=staging
REACT_APP_API_BASE_URL=https://nna-registry-service-staging-297923701246.us-central1.run.app
REACT_APP_FRONTEND_URL=https://nna-registry-staging.vercel.app
REACT_APP_ENABLE_DEBUG_LOGGING=true
REACT_APP_STAGING_BANNER=true
NODE_ENV=staging
CI=false
```

#### `vercel.staging.json`
- Vercel deployment configuration for staging
- Routes API calls to staging backend
- Environment-specific build settings
- CORS header configuration

### 2. Code Changes

#### Environment Detection Utility (`src/utils/environment.config.ts`)
- Automatic environment detection based on URL and environment variables
- Backend URL routing for staging vs production
- Smart file upload routing with environment awareness

#### API Service Updates (`src/api/assetService.ts`)
- Environment-aware backend URL selection
- Smart routing threshold configuration
- Enhanced logging for staging environment

#### Staging Banner Component (`src/components/common/StagingBanner.tsx`)
- Prominent visual indicator for staging environment
- Environment information display
- Warning about test data isolation

### 3. Build Scripts

New package.json scripts for staging:
- `npm run start:staging` - Start development server with staging config
- `npm run build:staging` - Build for staging deployment
- `npm run deploy:staging` - Deploy to Vercel staging

### 4. GitHub Workflow (`.github/workflows/staging-deploy.yml`)
- Automated staging deployment on push to `staging` branch
- Preview deployments for pull requests
- Environment variable configuration
- Deployment URL reporting

## 🚀 **Deployment Process**

### Manual Deployment
```bash
# Build for staging
npm run build:staging

# Deploy to Vercel staging
npm run deploy:staging
```

### Automated Deployment
- **Push to `staging` branch**: Triggers automatic staging deployment
- **Pull Request**: Creates preview deployment with staging backend
- **Workflow Dispatch**: Manual trigger from GitHub Actions

### Environment Variables (Vercel)
Set in Vercel dashboard for staging deployment:
- `REACT_APP_ENVIRONMENT=staging`
- `REACT_APP_API_BASE_URL=https://nna-registry-service-staging-297923701246.us-central1.run.app`
- `REACT_APP_FRONTEND_URL=https://nna-registry-staging.vercel.app`
- `REACT_APP_STAGING_BANNER=true`

## 🔧 **Configuration Details**

### Environment Detection
The application automatically detects environment based on:
1. `REACT_APP_ENVIRONMENT` environment variable
2. `NODE_ENV` value
3. URL hostname patterns
4. Vercel environment detection

### Smart Routing
File uploads are routed based on environment and file size:
- **Staging Small Files (≤4MB)**: Via Vercel proxy to staging backend
- **Staging Large Files (>4MB)**: Direct to staging backend
- **Production**: Maintains existing smart routing logic

### Feature Flags
Staging environment enables:
- Enhanced debug logging
- Performance monitoring
- Staging banner display
- Test data warnings

## 🧪 **Testing Procedures**

### 1. Backend Connectivity Test
```bash
curl -X GET https://nna-registry-staging.vercel.app/api/health
```

### 2. CORS Verification
Test from browser console on staging site:
```javascript
fetch('/api/assets', { 
  method: 'GET', 
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' } 
})
```

### 3. File Upload Test
- Test small file upload (≤4MB) - should use proxy
- Test large file upload (>4MB) - should use direct backend
- Verify uploads appear in staging backend only

### 4. Environment Verification
- Staging banner should be visible
- Console should show staging environment logs
- Backend URLs should point to staging infrastructure

## 🔍 **Monitoring & Debugging**

### Debug Logging
Staging environment enables enhanced logging:
- Environment configuration details
- API routing decisions
- Upload endpoint selection
- Backend connectivity status

### Performance Monitoring
If enabled, staging tracks:
- Page load times
- API response times
- File upload performance
- Error rates

### Error Reporting
Staging environment configured for:
- Enhanced error reporting
- Debug information retention
- Non-production error handling

## 🚨 **Important Notes**

### Data Isolation
- **Staging database is completely separate from production**
- Test assets created in staging will NOT appear in production
- User accounts are isolated between environments
- Authentication tokens are not interchangeable

### Authentication
- Staging uses separate JWT signing keys
- Users must register/login separately for staging
- Production tokens will not work in staging environment

### File Storage
- Staging uses dedicated Google Cloud Storage bucket
- Uploaded files are isolated from production storage
- File URLs will point to staging storage endpoints

### Environment Switching
**DO NOT** try to switch environments by changing URLs manually:
- Different backends require different authentication
- CORS policies are environment-specific
- Database schemas may have differences

## 📞 **Support & Troubleshooting**

### Common Issues

1. **"Staging banner not showing"**
   - Check `REACT_APP_STAGING_BANNER=true` environment variable
   - Verify `REACT_APP_ENVIRONMENT=staging` is set

2. **"API calls failing"**
   - Verify backend URL in environment configuration
   - Check CORS headers in network tab
   - Confirm backend staging environment is running

3. **"File uploads failing"**
   - Check file size routing logic
   - Verify direct backend CORS configuration
   - Test with smaller files first

4. **"Authentication not working"**
   - Staging requires separate user registration
   - Production tokens are not valid in staging
   - Clear localStorage and re-authenticate

### Getting Help
- Check GitHub Actions logs for deployment issues
- Use browser developer tools for client-side debugging
- Contact backend team for staging infrastructure issues
- Check Vercel dashboard for deployment status

---

## 📊 **Environment Comparison**

| Feature | Production | Staging | Development |
|---------|------------|---------|-------------|
| Backend URL | registry.reviz.dev | staging-297923701246.us-central1.run.app | configurable |
| Database | Production MongoDB | Staging MongoDB | Local/configurable |
| File Storage | Production GCS | Staging GCS | Local/configurable |
| Authentication | Production JWT | Staging JWT | Mock/configurable |
| Debug Logging | Minimal | Enhanced | Full |
| Error Reporting | Production | Enhanced | Development |
| Data Persistence | Permanent | Test data | Temporary |

## 🎯 **Next Steps**

1. **Set up Vercel project** with staging configuration
2. **Configure environment variables** in Vercel dashboard
3. **Test staging deployment** with provided scripts
4. **Verify backend connectivity** and CORS configuration
5. **Test complete user workflows** in staging environment
6. **Document any issues** and coordinate with backend team

The staging environment provides a complete, isolated testing platform that mirrors production functionality while maintaining data separation and enhanced debugging capabilities.