# Backend Team: Staging Environment CORS Update Required

## 🚨 **Urgent Request: Staging Backend CORS Configuration Update**

**Date**: January 26, 2025  
**Priority**: **HIGH** - Blocking staging environment testing  
**Issue**: Authentication failures due to CORS domain mismatch  

---

## 📋 **Issue Summary**

The staging frontend authentication is failing because the backend CORS configuration doesn't match the actual deployment domain.

### **Current Situation**
- **Staging Backend**: `https://registry.stg.reviz.dev` ✅ (healthy and responding)
- **Staging Frontend**: `https://nna-registry-frontend-stg.vercel.app` ✅ (deployed)
- **Error**: `POST https://nna-registry-frontend-stg.vercel.app/api/auth/login 401 (Unauthorized)`

### **Root Cause**
Frontend API calls are being made through Vercel proxy rewrites:
```
/api/auth/login → https://registry.stg.reviz.dev/api/auth/login
```
But the backend CORS may not be configured to accept requests from the correct frontend domain.

---

## 🔧 **Required Backend Changes**

### **CORS Configuration Update Needed**

Please update the staging backend CORS configuration to accept requests from:

```typescript
// Staging Backend CORS Configuration
const corsOptions = {
  origin: [
    'https://nna-registry-frontend-stg.vercel.app',  // ← PRIMARY (actual deployment)
    'https://nna-registry-staging.vercel.app',       // ← BACKUP (alternative domain)
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Authorization', 
    'Content-Type', 
    'Content-Length', 
    'X-Requested-With'
  ]
};
```

### **Environment-Specific Configuration**
```typescript
// If using environment-based CORS configuration
const allowedOrigins = {
  development: [
    'http://localhost:3001',
    'https://nna-registry-dev-frontend.vercel.app'
  ],
  staging: [
    'https://nna-registry-frontend-stg.vercel.app',  // ← ADD THIS
    'https://nna-registry-staging.vercel.app'        // ← KEEP AS BACKUP
  ],
  production: [
    'https://nna-registry-frontend.vercel.app',
    'https://registry.reviz.dev'
  ]
};
```

---

## 🧪 **Verification Steps**

After updating the CORS configuration:

### **1. Backend Health Check** ✅ (Already verified)
```bash
curl -X GET https://registry.stg.reviz.dev/api/health
# Should return: {"status": "healthy", "environment": "staging"}
```

### **2. CORS Preflight Test** ⏳ (Needs verification after update)
```bash
curl -X OPTIONS https://registry.stg.reviz.dev/api/auth/login \
  -H "Origin: https://nna-registry-frontend-stg.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization, Content-Type" \
  -v
# Should return CORS headers allowing the frontend domain
```

### **3. Authentication Endpoint Test** ⏳ (Needs verification after update)
```bash
curl -X POST https://registry.stg.reviz.dev/api/auth/login \
  -H "Origin: https://nna-registry-frontend-stg.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' \
  -v
# Should not return CORS errors
```

---

## 📊 **Frontend Configuration Status**

### **✅ Frontend Fixes Completed**
- **Domain Configuration**: Updated to match actual deployment
- **Environment Detection**: Enhanced to support both staging domains
- **Proxy Configuration**: Verified Vercel rewrites are correct
- **API Routing**: Uses relative URLs through proxy (baseURL: '/api')

### **Vercel Proxy Configuration** ✅
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://registry.stg.reviz.dev/api/$1"
    }
  ]
}
```

---

## 🎯 **Expected Outcome**

After the backend CORS update:

1. **Authentication Flow**: Login requests will succeed
2. **API Routing**: All `/api/*` calls will route correctly through proxy
3. **Environment Isolation**: Staging data remains separate from production
4. **Development Continuity**: Staging environment fully functional for testing

---

## ⏰ **Timeline & Priority**

- **Priority**: **HIGH** - Blocking staging environment testing
- **Impact**: Cannot test staging deployment or coordinate development
- **Estimated Backend Work**: 5-10 minutes to update CORS configuration
- **Verification**: Can be tested immediately after deployment

---

## 📞 **Contact & Coordination**

- **Frontend Changes**: ✅ Ready to deploy (pending this CORS update)
- **Testing**: Ready to verify end-to-end flow once CORS is updated
- **Documentation**: Will update Master Development Roadmap after resolution

---

## 🔍 **Debug Information**

### **Current Error Logs**
```
POST https://nna-registry-frontend-stg.vercel.app/api/auth/login 401 (Unauthorized)
```

### **Expected After Fix**
```
POST https://registry.stg.reviz.dev/api/auth/login 200 (Success)
```

### **Verification Commands**
```bash
# Test CORS configuration
curl -H "Origin: https://nna-registry-frontend-stg.vercel.app" \
     -X OPTIONS https://registry.stg.reviz.dev/api/auth/login -v

# Test authentication endpoint  
curl -H "Origin: https://nna-registry-frontend-stg.vercel.app" \
     -H "Content-Type: application/json" \
     -X POST https://registry.stg.reviz.dev/api/auth/login \
     -d '{"email":"test","password":"test"}' -v
```

---

**Status**: ⏳ **AWAITING BACKEND CORS UPDATE**  
**Next Step**: Update staging backend CORS configuration as specified above  
**ETA**: Ready for testing immediately after backend deployment

Thank you for the quick turnaround on this critical staging environment issue! 🚀