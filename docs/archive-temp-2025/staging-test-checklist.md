# Staging Environment Test Checklist

## 🎯 **Testing Protocol for Live Staging Backend**

This checklist provides comprehensive testing procedures for the staging environment connected to the live staging backend.

**Backend URL**: `https://nna-registry-service-staging-297923701246.us-central1.run.app`  
**Frontend URL**: `https://nna-registry-staging.vercel.app` (after deployment)

## 📋 **Test Sequence**

### **Phase 1: Basic Connectivity** ⚠️ **HIGH PRIORITY**

#### 1.1 Health Check Test
```bash
# Test direct backend health
curl -X GET https://nna-registry-service-staging-297923701246.us-central1.run.app/api/health

# Expected: JSON response with health status
```

#### 1.2 Frontend Deployment Verification
- [ ] Navigate to staging URL: `https://nna-registry-staging.vercel.app`
- [ ] Verify staging banner is visible (orange warning banner)
- [ ] Check browser console for environment detection logs
- [ ] Confirm "Staging Environment" indicator shows correct backend URL

#### 1.3 API Proxy Test
```javascript
// Test from browser console on staging site
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('Proxy health check:', data))
  .catch(error => console.error('Proxy error:', error));
```

### **Phase 2: Authentication Flow** 🔐

#### 2.1 User Registration Test
- [ ] Navigate to Register page
- [ ] Create new staging user account
- [ ] Verify registration succeeds with staging backend
- [ ] Check that user data is isolated to staging environment

#### 2.2 Login Flow Test
- [ ] Use staging credentials to log in
- [ ] Verify JWT token storage (separate from production)
- [ ] Confirm dashboard loads with staging data
- [ ] Test logout functionality

#### 2.3 Authentication Headers Test
```javascript
// Test from authenticated session in browser console
const token = localStorage.getItem('accessToken');
fetch('/api/assets', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(response => console.log('Auth test status:', response.status))
.catch(error => console.error('Auth error:', error));
```

### **Phase 3: File Upload Testing** 📁

#### 3.1 Small File Upload Test (≤4MB)
- [ ] Register Asset → Select any layer
- [ ] Upload image file (2-3MB)
- [ ] Verify console shows "PROXY" routing
- [ ] Confirm upload succeeds via Vercel proxy
- [ ] Check asset appears in staging backend only

#### 3.2 Large File Upload Test (>4MB)
- [ ] Register Asset → Select video layer (M or W)
- [ ] Upload video file (8-15MB)
- [ ] Verify console shows "DIRECT backend" routing
- [ ] Confirm upload succeeds via direct staging backend
- [ ] Test up to 30MB file if available

#### 3.3 Smart Routing Verification
Expected console output:
```
🌍 Environment Configuration
Environment: staging
Backend URL: https://nna-registry-service-staging-297923701246.us-central1.run.app
📤 Uploading asset via DIRECT backend: https://nna-registry-service-staging-297923701246.us-central1.run.app/api/assets
📦 File size: 8.45MB
📊 Routing reason: Large file (8.45MB) routed directly to backend
```

### **Phase 4: Asset Management Workflow** 🗂️

#### 4.1 Component Asset Registration
- [ ] Complete registration workflow for each layer: G, S, L, M, W
- [ ] Verify HFN/MFA generation works correctly
- [ ] Test taxonomy selection for all combinations
- [ ] Confirm success page shows proper asset details

#### 4.2 Composite Asset Creation
- [ ] Register Composite Asset (C layer)
- [ ] Complete 5-step composite workflow
- [ ] Search and select existing component assets
- [ ] Verify composite address generation: `C.XXX.XXX.XXX:G.XXX+S.XXX+M.XXX`
- [ ] Confirm components are linked correctly

#### 4.3 Search and Browse Testing
- [ ] Test Browse Assets with layer filtering
- [ ] Verify search functionality with text queries
- [ ] Test sort options (Name, Layer, Date, Created By)
- [ ] Confirm pagination works correctly
- [ ] Verify asset detail pages load properly

### **Phase 5: Environment Isolation** 🔒

#### 5.1 Data Separation Verification
- [ ] Confirm staging assets don't appear in production
- [ ] Verify staging user accounts are isolated
- [ ] Check that staging file URLs point to staging storage
- [ ] Test that production tokens don't work in staging

#### 5.2 Visual Environment Indicators
- [ ] Staging banner displays prominently
- [ ] Environment information shows correct backend URL
- [ ] Debug logging appears in console (staging only)
- [ ] Browser developer tools show staging API calls

#### 5.3 Cross-Environment Prevention
- [ ] Attempt to use production token in staging (should fail)
- [ ] Verify CORS headers prevent unauthorized cross-origin requests
- [ ] Confirm staging data doesn't leak to production searches

### **Phase 6: Performance and Error Handling** ⚡

#### 6.1 Performance Testing
- [ ] Measure page load times (should be <3 seconds)
- [ ] Test file upload speeds for various sizes
- [ ] Verify search response times (<1 second)
- [ ] Check video thumbnail generation

#### 6.2 Error Handling
- [ ] Test invalid file uploads (wrong format, too large)
- [ ] Verify network error recovery
- [ ] Test authentication failure scenarios
- [ ] Confirm graceful degradation for API failures

#### 6.3 Browser Compatibility
- [ ] Chrome: Full functionality test
- [ ] Firefox: Complete workflow test  
- [ ] Safari: Basic functionality verification
- [ ] Mobile: Responsive design check

## 🚨 **Critical Success Criteria**

### **Must Pass (Deployment Blocker)**
- [ ] Health check returns valid response
- [ ] Staging banner displays correctly
- [ ] Authentication flow works end-to-end
- [ ] File uploads succeed via smart routing
- [ ] Environment isolation is confirmed

### **Should Pass (Quality Gates)**
- [ ] All asset workflows complete successfully
- [ ] Search and browse functionality works
- [ ] Performance meets expectations
- [ ] Error handling is graceful
- [ ] Cross-browser compatibility verified

### **Nice to Have (Enhancement)**
- [ ] Video thumbnails generate quickly
- [ ] Advanced search features work
- [ ] Mobile experience is optimal
- [ ] Debug logging provides useful information

## 📊 **Test Results Template**

```
🧪 STAGING ENVIRONMENT TEST RESULTS
Date: ___________
Tester: ___________
Browser: ___________

✅ PHASE 1 - Basic Connectivity: PASS/FAIL
✅ PHASE 2 - Authentication Flow: PASS/FAIL  
✅ PHASE 3 - File Upload Testing: PASS/FAIL
✅ PHASE 4 - Asset Management: PASS/FAIL
✅ PHASE 5 - Environment Isolation: PASS/FAIL
✅ PHASE 6 - Performance & Errors: PASS/FAIL

Overall Status: READY FOR USE / NEEDS FIXES
Critical Issues: ___________
Performance Notes: ___________
```

## 🔧 **Troubleshooting Guide**

### Common Issues and Solutions

**Issue**: "Staging banner not showing"
- Check browser console for environment detection
- Verify `REACT_APP_STAGING_BANNER=true` 
- Confirm `REACT_APP_ENVIRONMENT=staging`

**Issue**: "API calls failing with CORS errors"
- Verify backend staging environment is running
- Check CORS headers in Network tab
- Confirm frontend URL is allowlisted by backend

**Issue**: "File uploads failing"
- Test with smaller files first (proxy routing)
- Check file size routing threshold (4MB)
- Verify direct backend CORS for large files

**Issue**: "Authentication not working"
- Clear localStorage and re-register
- Verify staging uses separate JWT keys
- Check that production tokens don't work

---

**🎯 Execute this checklist after successful Vercel deployment to verify complete staging environment functionality.**