# Staging Environment Debug & Detection Fixes

**Date**: January 2025  
**Issue**: Staging environment incorrectly detected as production, API routing to self  
**Status**: ✅ **DEBUGGING ENHANCED** - Comprehensive fixes applied

## Issues Identified from Console Logs

### 1. **Environment Detection Problem**
**Console Evidence**: Shows green "PRODUCTION" chip instead of orange "STAGING"
**Problem**: Environment detection logic not working correctly on deployed staging

### 2. **API Self-Routing Problem** 
**Console Evidence**: `POST https://nna-registry-frontend-stg.vercel.app/api/auth/login 401 (Unauthorized)`
**Expected**: `POST https://registry.stg.reviz.dev/api/auth/login`
**Problem**: API calls routing to frontend itself instead of staging backend

### 3. **Backend Status Confusion**
**Console Evidence**: `environment: 'production'` in backend status
**Expected**: `environment: 'staging'`
**Problem**: Either backend not detecting staging or frontend calling wrong endpoint

## Root Cause Analysis

### **Primary Issue: Environment Variable Priority Bug**
The environment detection was failing due to:

1. **Fallback Logic Override**: Generic `vercel.app` check was overriding specific staging detection
2. **Environment Variable Missing**: Build-time variables not properly set for runtime detection
3. **Debug Logging Insufficient**: No visibility into detection process

### **Secondary Issue: API Routing Logic**
The API calls were going to frontend domain because:

1. **Proxy Configuration**: Vercel proxy expecting correct environment detection
2. **BaseURL Logic**: API service using wrong base URL due to environment misdetection

## Fixes Applied

### ✅ **Fix 1: Enhanced Environment Detection Logic**
**File**: `src/utils/environment.config.ts`

**Changes**:
- Added comprehensive debug logging for all detection steps
- Fixed priority order to check specific staging domains first
- Added explicit console logging for each detection path
- Removed generic fallback that was overriding staging detection

```typescript
// Before (problematic)
if (hostname.includes('vercel.app')) {
  return 'production'; // This was overriding staging!
}

// After (fixed)
if (hostname.includes('nna-registry-frontend-stg.vercel.app') || 
    hostname.includes('-stg.vercel.app')) {
  console.log('🎯 Environment Detection: STAGING detected by hostname');
  return 'staging';
}
```

### ✅ **Fix 2: Early Environment Initialization**
**File**: `src/App.tsx`

**Changes**:
- Added `logEnvironmentInfo()` call in App component useEffect
- Environment detection now runs immediately on app startup
- Added console logging to track initialization sequence

```typescript
useEffect(() => {
  // Initialize environment configuration logging FIRST
  console.log('🚀 [APP] Initializing environment configuration...');
  logEnvironmentInfo();
  // ... rest of initialization
}, []);
```

### ✅ **Fix 3: Comprehensive Debug Logging**
**File**: `src/utils/environment.config.ts`

**Enhanced logging includes**:
- Environment variables (`REACT_APP_ENVIRONMENT`, `NODE_ENV`)
- Hostname detection process
- Backend/Frontend URL configuration
- Detection method used (env var vs hostname vs fallback)

### ✅ **Fix 4: Production-Safe Debug Mode**
**Changes**:
- Debug logging enabled for staging environment regardless of production setting
- Environment information logged to console for verification
- Detailed variable inspection for troubleshooting

## Expected Results After Fix

### **Environment Detection**
- ✅ Console should show: `🎯 Environment Detection: STAGING detected by hostname`
- ✅ Banner should show: Orange "STAGING" chip
- ✅ Environment config should show: `environment: 'staging'`

### **API Routing**
- ✅ Login requests should go to: `https://registry.stg.reviz.dev/api/auth/login`
- ✅ Vercel proxy should route correctly: `/api/*` → `https://registry.stg.reviz.dev/api/*`
- ✅ No more self-routing errors

### **Backend Communication**
- ✅ Backend status should show: `environment: 'staging'`
- ✅ CORS errors should be resolved
- ✅ Authentication should work properly

## Debugging Information Added

### **Console Output Expected**
```
🚀 [APP] Initializing environment configuration...
🌍 Environment Detection Debug:
  - Hostname: nna-registry-frontend-stg.vercel.app
  - REACT_APP_ENVIRONMENT: staging
  - NODE_ENV: staging
  - URL hostname check: nna-registry-frontend-stg.vercel.app
🎯 Environment Detection: STAGING detected by hostname
🌍 Environment Configuration
├── Environment: staging
├── Backend URL: https://registry.stg.reviz.dev
├── Frontend URL: https://nna-registry-frontend-stg.vercel.app
├── Is Staging: true
├── Is Production: false
└── Environment Variables: { ... }
```

## Verification Steps

### **After Deployment**
1. **Check Console Logs**: Should show staging environment detection
2. **Verify Banner**: Should show orange STAGING banner
3. **Test API Calls**: Should route to staging backend
4. **Check Network Tab**: Login should call `registry.stg.reviz.dev`
5. **Backend Status**: Should show `environment: 'staging'`

## Technical Confidence

**High Confidence**: These fixes address the core detection logic issues:

1. **Environment Detection**: Fixed fallback override bug
2. **Early Initialization**: Environment detected immediately on app load
3. **Debug Visibility**: Complete logging for troubleshooting
4. **Runtime Detection**: Works regardless of build-time variable issues

## Next Steps

1. **Deploy Fixes**: Push to trigger GitHub Actions staging deployment
2. **Monitor Console**: Check for proper staging environment detection
3. **Test Authentication**: Verify login works without CORS errors
4. **Backend Verification**: Confirm staging backend responds correctly

---

**Previous Issue**: Environment detection failing, API routing to frontend instead of backend  
**Current Status**: ✅ **READY FOR TESTING** - Enhanced detection and debugging applied