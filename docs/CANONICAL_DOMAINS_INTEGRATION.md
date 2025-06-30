# Canonical Domains Integration - Corrected Mapping

## 🎯 **CANONICAL DOMAIN MAPPING - CORRECTED**

### **✅ Frontend Canonical Domains**
1. **Development**: `https://nna-registry-frontend.dev.vercel.app`
2. **Staging**: `https://nna-registry-frontend.stg.vercel.app`
3. **Production**: `https://nna-registry-frontend.vercel.app`

### **✅ Backend Canonical Domains**
1. **Development**: `https://registry.dev.reviz.dev`
2. **Staging**: `https://registry.stg.reviz.dev`
3. **Production**: `https://registry.reviz.dev`

### **✅ Environment Mapping Matrix**

| Environment | Frontend Domain | Backend Domain | Status |
|-------------|----------------|----------------|---------|
| **Development** | `nna-registry-frontend.dev.vercel.app` | `registry.dev.reviz.dev` | ✅ **Ready** |
| **Staging** | `nna-registry-frontend.stg.vercel.app` | `registry.stg.reviz.dev` | ✅ **Ready** |
| **Production** | `nna-registry-frontend.vercel.app` | `registry.reviz.dev` | ✅ **Ready** |

---

## 🔧 **BACKEND URL DETECTION LOGIC**

### **Updated Code in backendTaxonomyService.ts**
```typescript
private getBackendUrl(): string {
  const hostname = window.location.hostname;
  
  // Development: https://nna-registry-frontend.dev.vercel.app
  if (hostname === 'nna-registry-frontend.dev.vercel.app') {
    return 'https://registry.dev.reviz.dev';
  }
  
  // Staging: https://nna-registry-frontend.stg.vercel.app
  if (hostname === 'nna-registry-frontend.stg.vercel.app') {
    return 'https://registry.stg.reviz.dev';
  }
  
  // Production: https://nna-registry-frontend.vercel.app
  if (hostname === 'nna-registry-frontend.vercel.app') {
    return 'https://registry.reviz.dev';
  }
  
  // Fallback to production for any other domain
  return 'https://registry.reviz.dev';
}
```

---

## 🧪 **CORRECTED TESTING PLAN**

### **Phase 1: Development Environment Testing**
**URL**: `https://nna-registry-frontend.dev.vercel.app`

**Test Steps:**
1. **Access Development Frontend**: Navigate to canonical development URL
2. **Settings Toggle**: Test at `/settings` page
3. **Backend Detection**: Should route to `registry.dev.reviz.dev`
4. **Console Verification**: Check logs for correct backend URL
5. **Taxonomy Browser**: Test enhanced features at `/taxonomy`

### **Phase 2: Staging Environment Testing**
**URL**: `https://nna-registry-frontend.stg.vercel.app`

**Test Steps:**
1. **Access Staging Frontend**: Navigate to canonical staging URL
2. **Environment Detection**: Should route to `registry.stg.reviz.dev`
3. **Cross-Environment Validation**: Test data isolation
4. **CORS Verification**: Confirm no CORS errors
5. **Performance Testing**: Validate response times

### **Phase 3: Production Environment Testing**
**URL**: `https://nna-registry-frontend.vercel.app`

**Test Steps:**
1. **Access Production Frontend**: Navigate to canonical production URL
2. **Backend Integration**: Should route to `registry.reviz.dev`
3. **Toggle Functionality**: Test safe switching between services
4. **User Experience**: Validate seamless operation
5. **Monitoring**: Confirm health checks working

---

## 📋 **IMMEDIATE TESTING CHECKLIST**

### **✅ Test Each Environment**

#### **Development Environment**
- [ ] Access: `https://nna-registry-frontend.dev.vercel.app`
- [ ] Settings: Navigate to `/settings` and test toggle
- [ ] Backend URL: Should detect `registry.dev.reviz.dev`
- [ ] Taxonomy: Test enhanced browser at `/taxonomy`
- [ ] Integration: Enable backend service and verify

#### **Staging Environment**
- [ ] Access: `https://nna-registry-frontend.stg.vercel.app`
- [ ] Backend URL: Should detect `registry.stg.reviz.dev`
- [ ] Data Isolation: Verify separate from production
- [ ] CORS: Confirm backend allows staging domain
- [ ] Performance: Test response times

#### **Production Environment**
- [ ] Access: `https://nna-registry-frontend.vercel.app`
- [ ] Backend URL: Should detect `registry.reviz.dev`
- [ ] Toggle Safety: Verify safe rollback capability
- [ ] User Experience: Validate production readiness
- [ ] Monitoring: Confirm all systems operational

---

## 🔍 **BACKEND CORS VERIFICATION**

### **Required CORS Configuration**
The backend should allow these exact origins:

```typescript
// Development
allowedOrigins: ['https://nna-registry-frontend.dev.vercel.app']

// Staging
allowedOrigins: ['https://nna-registry-frontend.stg.vercel.app']

// Production
allowedOrigins: ['https://nna-registry-frontend.vercel.app']
```

### **CORS Testing Commands**
```bash
# Test Development CORS
curl -H "Origin: https://nna-registry-frontend.dev.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://registry.dev.reviz.dev/api/taxonomy/layers

# Test Staging CORS
curl -H "Origin: https://nna-registry-frontend.stg.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://registry.stg.reviz.dev/api/taxonomy/layers

# Test Production CORS
curl -H "Origin: https://nna-registry-frontend.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://registry.reviz.dev/api/taxonomy/layers
```

---

## 🚀 **DEPLOYMENT VERIFICATION**

### **Frontend Deployment Status**
1. **Development**: Deploying to `nna-registry-frontend.dev.vercel.app`
2. **Staging**: Available at `nna-registry-frontend.stg.vercel.app`
3. **Production**: Available at `nna-registry-frontend.vercel.app`

### **Backend Deployment Status** ✅ **CONFIRMED**
1. **Development**: `registry.dev.reviz.dev` - Operational
2. **Staging**: `registry.stg.reviz.dev` - Operational
3. **Production**: `registry.reviz.dev` - Operational

---

## 📝 **TESTING COMMANDS**

### **Quick Health Checks**
```bash
# Development
curl -s "https://registry.dev.reviz.dev/api/health"

# Staging
curl -s "https://registry.stg.reviz.dev/api/health"

# Production
curl -s "https://registry.reviz.dev/api/health"
```

### **Frontend Accessibility**
```bash
# Development
curl -s "https://nna-registry-frontend.dev.vercel.app" | head -5

# Staging
curl -s "https://nna-registry-frontend.stg.vercel.app" | head -5

# Production
curl -s "https://nna-registry-frontend.vercel.app" | head -5
```

---

## 🎯 **NEXT ACTIONS**

### **Immediate (Today)**
1. **Commit Domain Fixes**: Push updated backend URL detection
2. **Test Development**: Access `nna-registry-frontend.dev.vercel.app`
3. **Verify Toggle**: Test settings toggle with correct backend URL
4. **Document Results**: Confirm integration working correctly

### **Integration Testing (Tomorrow)**
1. **Cross-Environment**: Test all three environment pairs
2. **CORS Validation**: Verify no CORS errors in any environment
3. **Data Consistency**: Confirm taxonomy data matches across services
4. **Performance**: Validate response times < 500ms

### **Production Rollout (This Week)**
1. **End-to-End Testing**: Complete workflow validation
2. **User Acceptance**: Final testing with correct domains
3. **Monitoring Setup**: Implement cross-environment monitoring
4. **Documentation**: Update all references to use canonical domains

---

## 💡 **CORRECTED ENVIRONMENT REFERENCE**

### **Always Use These Canonical Domains:**

**✅ CORRECT:**
- Development: `https://nna-registry-frontend.dev.vercel.app`
- Staging: `https://nna-registry-frontend.stg.vercel.app`
- Production: `https://nna-registry-frontend.vercel.app`

**❌ INCORRECT (Previous Confusion):**
- ~~`https://nna-registry-service-mvp-frontend.vercel.app`~~
- ~~`https://nna-registry-frontend-dev.vercel.app`~~
- ~~`https://nna-registry-staging.vercel.app`~~

---

**Status**: ✅ **CANONICAL DOMAINS CORRECTED**  
**Backend URLs**: ✅ **UPDATED TO MATCH CANONICAL MAPPING**  
**Ready for**: ✅ **IMMEDIATE TESTING WITH CORRECT DOMAINS**

Thank you for the correction! The backend service will now correctly route to the appropriate backend based on the canonical frontend domains.