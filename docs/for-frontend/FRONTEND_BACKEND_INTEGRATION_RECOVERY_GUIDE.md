# Frontend-Backend Integration Recovery Guide

**Date**: July 18, 2025  
**Status**: 🔧 **CRITICAL - Integration Recovery Required**  
**Priority**: URGENT - Frontend Team Action Required

## 🚨 **Current Situation**

The frontend-backend integration has been disrupted due to database initialization issues. The backend is working correctly, but the frontend is making API requests to the wrong URLs.

### **Root Cause Analysis**
- ✅ **Backend**: Fully functional at canonical domains
- ✅ **Environment Detection**: Working correctly in frontend
- ❌ **API Service Configuration**: Frontend making requests to wrong domains
- ❌ **Database**: Cleared during initialization (users need to be recreated)

## 🎯 **Immediate Action Required**

### **Frontend Team - CRITICAL FIX**

The frontend environment detection is working correctly, but the API service configuration is not using the detected URLs.

#### **Current Issue**
```
✅ Environment Detection: https://registry.dev.reviz.dev
❌ API Requests: https://nna-registry-frontend-dev.vercel.app/api/auth/login
```

#### **Required Fix**
Update the API service configuration to use the detected backend URL:

**Files to Update:**
- `authService.ts` (Line 48)
- `assetService.ts` (Line 243)
- Any other API service files

**Expected Behavior:**
```
✅ Environment Detection: https://registry.dev.reviz.dev
✅ API Requests: https://registry.dev.reviz.dev/api/auth/login
```

## 🌍 **Canonical Environment Configuration**

### **Definitive Environment Mapping**

| Environment     | Frontend Domain                                | Backend Domain                   | Status |
| --------------- | ---------------------------------------------- | -------------------------------- | ------ |
| **Development** | `https://nna-registry-frontend-dev.vercel.app` | `https://registry.dev.reviz.dev` | ✅ Working |
| **Staging**     | `https://nna-registry-frontend-stg.vercel.app` | `https://registry.stg.reviz.dev` | ⏳ Pending |
| **Production**  | `https://nna-registry-frontend.vercel.app`     | `https://registry.reviz.dev`     | ⏳ Pending |

### **Backend Health Status**

#### **Development Environment** ✅
```json
{
  "status": "healthy",
  "environment": "development",
  "backend_url": "https://registry.dev.reviz.dev",
  "database": "connected",
  "cors": ["https://nna-registry-frontend-dev.vercel.app"]
}
```

#### **Test User Credentials**
- **Email**: `ajay@testuser.com`
- **Password**: `password123`
- **Username**: `ajaymadhok`

## 🔧 **Frontend Configuration Fix**

### **Environment Detection (Working)**
```typescript
// ✅ This is working correctly
const getBackendUrl = () => {
  const environment = detectEnvironment();
  switch (environment) {
    case 'development': return 'https://registry.dev.reviz.dev';
    case 'staging': return 'https://registry.stg.reviz.dev';
    case 'production': return 'https://registry.reviz.dev';
    default: return 'https://registry.reviz.dev';
  }
};
```

### **API Service Configuration (Needs Fix)**
```typescript
// ❌ Current (Broken)
const API_BASE_URL = 'https://nna-registry-frontend-dev.vercel.app';

// ✅ Required (Fixed)
const API_BASE_URL = getBackendUrl();
```

### **Files Requiring Updates**

#### **1. authService.ts**
```typescript
// Line 48: Change from frontend domain to backend domain
const response = await axios.post(`${getBackendUrl()}/api/auth/login`, credentials);
```

#### **2. assetService.ts**
```typescript
// Line 243: Change from frontend domain to backend domain
const response = await axios.get(`${getBackendUrl()}/api/assets`, config);
```

#### **3. Any Other API Services**
- Ensure all API calls use `getBackendUrl()` instead of hardcoded frontend domains
- Remove any hardcoded URLs that point to frontend domains

## 🧪 **Testing Procedure**

### **Step 1: Verify Backend Health**
```bash
curl https://registry.dev.reviz.dev/api/health
```

### **Step 2: Test Authentication**
```bash
curl -X POST https://registry.dev.reviz.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ajay@testuser.com","password":"password123"}'
```

### **Step 3: Test Frontend Integration**
1. Deploy frontend fix
2. Test login with `ajay@testuser.com` / `password123`
3. Verify API requests go to correct backend domain
4. Test asset creation and retrieval

## 📋 **Frontend Team Checklist**

### **Immediate Actions (Today)**
- [ ] **Fix API Service Configuration**
  - [ ] Update `authService.ts` to use `getBackendUrl()`
  - [ ] Update `assetService.ts` to use `getBackendUrl()`
  - [ ] Check all other API service files
- [ ] **Deploy Fix**
  - [ ] Push to development branch
  - [ ] Verify deployment to `https://nna-registry-frontend-dev.vercel.app`
- [ ] **Test Integration**
  - [ ] Test login with provided credentials
  - [ ] Verify API requests in browser dev tools
  - [ ] Test asset creation

### **Validation Steps**
- [ ] **Environment Detection**: Verify correct backend URL detection
- [ ] **API Requests**: Confirm requests go to `https://registry.dev.reviz.dev`
- [ ] **Authentication**: Test login and token generation
- [ ] **Asset Operations**: Test create, read, update operations
- [ ] **Error Handling**: Verify proper error responses

## 🚀 **Phase 2B Features Ready**

Once the API routing is fixed, all Phase 2B features are ready for testing:

### **New Fields Available**
- ✅ `creatorDescription` - Preserved during asset creation
- ✅ `albumArt` - Album art URL support
- ✅ `aiMetadata` - AI-generated metadata support

### **Songs Layer Assets**
- ✅ Songs layer taxonomy available
- ✅ All 20 Songs categories present
- ✅ Asset creation with creator description working

## 📞 **Support and Communication**

### **Backend Team Support**
- **Backend Status**: All systems operational
- **Database**: Connected and functional
- **Taxonomy**: Complete with Songs layer
- **Authentication**: Working with JWT tokens

### **Escalation Process**
1. **Frontend Issues**: Contact frontend team lead
2. **Backend Issues**: Contact backend team lead
3. **Integration Issues**: Joint frontend-backend team meeting

## 📚 **Reference Documents**

### **Updated Documentation**
- [Environment Configuration Reference](./architecture/ENVIRONMENT_CONFIGURATION_REFERENCE.md)
- [Architecture Overview](./architecture/architecture-overview.md)
- [Three-Tier Promotion Strategy](./for-backend/FRONTEND_THREE_TIER_PROMOTION_STRATEGY.md)

### **API Documentation**
- **Swagger UI**: `https://registry.dev.reviz.dev/api/docs`
- **Health Endpoint**: `https://registry.dev.reviz.dev/api/health`
- **Taxonomy Endpoint**: `https://registry.dev.reviz.dev/api/taxonomy/layers`

## 🎯 **Success Criteria**

### **Integration Recovery Complete When:**
- [ ] Frontend successfully logs in with test credentials
- [ ] API requests go to correct backend domains
- [ ] Asset creation works with Phase 2B fields
- [ ] Songs layer assets can be created
- [ ] No 401/404 errors in browser console

### **Next Steps After Recovery:**
1. **Staging Environment**: Deploy and test staging integration
2. **Production Environment**: Deploy and test production integration
3. **Phase 2B Testing**: Comprehensive testing of new features
4. **User Migration**: Migrate existing users and assets

---

**Contact**: Backend team is ready to support frontend integration recovery
**Status**: Backend systems 100% operational, waiting for frontend fix 