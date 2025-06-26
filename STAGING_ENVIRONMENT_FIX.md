# Staging Environment Authentication Fix

## 🚨 **Root Cause Analysis**

The staging environment authentication issues were caused by a **domain name mismatch** between the expected and actual deployment URLs.

### **Issue Details**
- **Expected Domain**: `https://nna-registry-staging.vercel.app` (configured in .env.staging)
- **Actual Domain**: `https://nna-registry-frontend-stg.vercel.app` (where user is testing)
- **Backend**: `https://registry.stg.reviz.dev` (✅ healthy and properly configured)

### **Error Manifestation**
```
POST https://nna-registry-frontend-stg.vercel.app/api/auth/login 401 (Unauthorized)
```
Frontend was calling itself instead of routing to the staging backend through Vercel proxy.

## ✅ **Fixes Applied**

### **1. Updated .env.staging Configuration**
```env
# Before
REACT_APP_FRONTEND_URL=https://nna-registry-staging.vercel.app

# After  
REACT_APP_FRONTEND_URL=https://nna-registry-frontend-stg.vercel.app
```

### **2. Enhanced Environment Detection**
Updated `/src/utils/environment.config.ts` to detect both staging domains:
```typescript
// Added support for both staging domains
if (hostname.includes('nna-registry-frontend-stg.vercel.app') || 
    hostname.includes('nna-registry-staging.vercel.app') || 
    hostname.includes('staging') || 
    hostname.includes('-stg.vercel.app')) {
  return 'staging';
}
```

### **3. Verified Vercel Proxy Configuration**
The `vercel.staging.json` configuration is correct:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://registry.stg.reviz.dev/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://nna-registry-frontend-stg.vercel.app"
        }
      ]
    }
  ]
}
```

## 🔧 **Backend Team Coordination Required**

### **CORS Configuration Update Needed**
The staging backend at `https://registry.stg.reviz.dev` needs to be updated to accept requests from:
- ✅ `https://nna-registry-frontend-stg.vercel.app` (current actual domain)
- ✅ `https://nna-registry-staging.vercel.app` (backup domain for flexibility)

### **Recommended Backend CORS Update**
```typescript
// In staging backend CORS configuration
allowedOrigins: [
  'https://nna-registry-frontend-stg.vercel.app',
  'https://nna-registry-staging.vercel.app'
]
```

## 🧪 **Testing Protocol**

### **1. Environment Detection Test**
```javascript
// Test in browser console at https://nna-registry-frontend-stg.vercel.app
import { detectEnvironment } from './src/utils/environment.config';
console.log('Detected Environment:', detectEnvironment());
// Should return: 'staging'
```

### **2. API Routing Test**
```javascript
// Test proxy routing
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('Backend Health:', data));
// Should return staging backend health with environment: 'staging'
```

### **3. Authentication Flow Test**
```javascript
// Test login endpoint routing
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'test' })
})
.then(response => {
  console.log('Auth response status:', response.status);
  console.log('Auth response from:', response.url);
});
// Should show URL: https://registry.stg.reviz.dev/api/auth/login
```

## 📊 **Verification Checklist**

### **Frontend Configuration** ✅
- [x] `.env.staging` updated with correct frontend domain
- [x] Environment detection supports both staging domains
- [x] Vercel proxy configuration verified
- [x] API routing uses relative URLs through proxy

### **Backend Coordination** ⏳
- [ ] Backend CORS updated to accept correct frontend domain
- [ ] Backend health endpoint accessible from staging frontend
- [ ] Authentication endpoints accepting staging frontend requests

### **Deployment Testing** ⏳
- [ ] Deploy frontend changes to staging
- [ ] Test environment detection in browser
- [ ] Test API routing through Vercel proxy
- [ ] Test authentication flow end-to-end

## 🚀 **Next Steps**

1. **Deploy Changes**: Commit and push the fixes to trigger staging deployment
2. **Backend Update**: Coordinate with backend team to update CORS configuration
3. **End-to-End Testing**: Test complete authentication flow
4. **Documentation**: Update staging environment documentation

## 📝 **Files Modified**

- `.env.staging` - Updated frontend domain configuration
- `src/utils/environment.config.ts` - Enhanced staging domain detection
- `STAGING_ENVIRONMENT_FIX.md` - This documentation

## 🎯 **Expected Outcome**

After these fixes:
- ✅ Environment detection correctly identifies staging environment
- ✅ API calls route through Vercel proxy to staging backend
- ✅ Authentication endpoints receive requests at correct backend URL
- ✅ Login flow works end-to-end without domain mismatch errors

**Status**: ✅ **FRONTEND FIXES COMPLETE** - Ready for backend CORS coordination and deployment testing.