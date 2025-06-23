# Staging Backend Connection Configuration

## 🎯 **Direct Cloud Run URL Integration**

The staging backend is now live and ready for connection using the direct Cloud Run URL provided by the backend team.

## 📝 **Configuration Updates Applied**

### 1. Environment Variables Updated
**File: `.env.staging`**
```bash
# Backend API Configuration (Direct Cloud Run URL)
REACT_APP_API_BASE_URL=https://nna-registry-service-staging-297923701246.us-central1.run.app/api
REACT_APP_BACKEND_URL=https://nna-registry-service-staging-297923701246.us-central1.run.app
```

### 2. Vercel Configuration Updated
**File: `vercel.staging.json`**
- Routes API calls to direct Cloud Run URL
- Environment variables include `/api` path for base URL
- Build configuration updated with correct backend URL

### 3. GitHub Workflow Updated
**File: `.github/workflows/staging-deploy.yml`**
- Build environment variables updated
- Documentation references updated
- Deployment testing configured for direct URL

## 🔧 **Backend URL Strategy**

### Smart Routing Implementation
```typescript
// For direct API calls (large files)
const directBackendUrl = 'https://nna-registry-service-staging-297923701246.us-central1.run.app'

// For proxy routes (small files)
const proxyRoute = '/api' // Routed via Vercel to staging backend
```

### Environment Detection
The application automatically detects staging environment and routes to:
- **Small files (≤4MB)**: Via Vercel proxy to staging backend
- **Large files (>4MB)**: Direct to staging backend Cloud Run URL
- **API calls**: Via proxy with staging backend routing

## 🚀 **Deployment Ready**

All configuration files have been updated for immediate deployment:

1. **Environment variables** point to direct Cloud Run URL
2. **Vercel routing** configured for staging backend
3. **GitHub workflow** ready for automated deployment
4. **API service** configured for environment-aware routing

## 📋 **Next Steps**

1. **Deploy to Vercel**: Push staging branch to trigger deployment
2. **Test API connectivity**: Verify health check and authentication
3. **Test file uploads**: Confirm smart routing works with staging backend
4. **Full workflow testing**: Registration, search, browse functionality

## 🔄 **Future Custom Domain Migration**

When `https://registry.stg.reviz.dev` is ready, update:
```bash
# Future configuration
REACT_APP_BACKEND_URL=https://registry.stg.reviz.dev
```

The migration will be seamless - just update the environment variable and redeploy.

## ✅ **Ready for Testing**

The staging frontend is now configured to connect to the live staging backend using the direct Cloud Run URL. All smart routing, environment detection, and deployment configurations are in place for immediate testing.

---

**Status**: Ready for Deployment  
**Backend URL**: https://nna-registry-service-staging-297923701246.us-central1.run.app  
**Frontend URL**: https://nna-registry-staging.vercel.app  
**Last Updated**: January 2025