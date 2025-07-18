# Frontend API Routing Issue Diagnosis

## Issue Summary

The frontend is correctly detecting the development environment and backend URL, but API requests are being sent to the wrong domain.

## Current Status

✅ **Backend**: Working perfectly at `https://registry.dev.reviz.dev`
✅ **Environment Detection**: Working correctly
✅ **Backend URL Detection**: Working correctly
❌ **API Request Routing**: Broken - requests going to frontend domain

## Detailed Analysis

### Environment Detection (Working)
```
🌍 Environment Detection Debug (Call #1):
- Hostname: nna-registry-frontend-dev.vercel.app
- Environment Detection: DEVELOPMENT (Git branch URL)
- Backend URL: https://registry.dev.reviz.dev ✅
```

### API Request Issue (Broken)
```
authService.ts:48 POST https://nna-registry-frontend-dev.vercel.app/api/auth/login 401 (Unauthorized)
```

**Problem**: API requests are going to `https://nna-registry-frontend-dev.vercel.app/api/auth/login` instead of `https://registry.dev.reviz.dev/api/auth/login`

## Root Cause

The frontend has **two separate configurations**:

1. **Environment Detection**: Correctly identifies `https://registry.dev.reviz.dev`
2. **API Service Configuration**: Still using the frontend domain for API calls

## Backend Verification

The backend is working correctly:

```bash
# Test backend health
curl https://registry.dev.reviz.dev/api/health
# Returns: {"status":"healthy",...}

# Test login with existing user
curl -X POST https://registry.dev.reviz.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@reviz.dev","password":"admin123"}'
# Returns: {"success":true,"data":{"token":"...",...}}
```

## Frontend Files to Check

The frontend team needs to check these files:

### 1. API Service Configuration
- `src/services/authService.ts` (line 48)
- `src/services/assetService.ts` (line 243)
- Any other API service files

### 2. Environment Configuration
- `src/config/environment.config.ts` (working correctly)
- `src/config/api.config.ts` (if exists)
- `src/config/axios.config.ts` (if exists)

### 3. Axios Configuration
- Base URL configuration
- Interceptor configuration
- Default headers configuration

## Expected vs Actual Behavior

### Expected (Correct)
```javascript
// Environment detection
const backendUrl = 'https://registry.dev.reviz.dev';

// API calls
axios.post(`${backendUrl}/api/auth/login`, data);
// Result: POST https://registry.dev.reviz.dev/api/auth/login
```

### Actual (Broken)
```javascript
// Environment detection (working)
const backendUrl = 'https://registry.dev.reviz.dev';

// API calls (broken)
axios.post('/api/auth/login', data);
// Result: POST https://nna-registry-frontend-dev.vercel.app/api/auth/login
```

## Solution Steps

### 1. Check API Service Base URL
Ensure all API services are using the detected backend URL:

```javascript
// In authService.ts, assetService.ts, etc.
const backendUrl = getBackendUrl(); // This is working
const apiUrl = `${backendUrl}/api`; // Use this for all API calls
```

### 2. Check Axios Configuration
If using axios, ensure base URL is set correctly:

```javascript
// In axios config
axios.defaults.baseURL = getBackendUrl();
// OR
const api = axios.create({
  baseURL: getBackendUrl()
});
```

### 3. Check API Call Patterns
Replace relative API calls with absolute URLs:

```javascript
// Instead of:
axios.post('/api/auth/login', data);

// Use:
axios.post(`${getBackendUrl()}/api/auth/login`, data);
```

## Test Credentials

Once the routing is fixed, use these credentials:

```
Email: admin@reviz.dev
Password: admin123
```

## Verification Commands

### Test Backend Directly
```bash
# Health check
curl https://registry.dev.reviz.dev/api/health

# Login test
curl -X POST https://registry.dev.reviz.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@reviz.dev","password":"admin123"}'
```

### Expected Frontend Behavior
After fix, the frontend should make requests to:
- `https://registry.dev.reviz.dev/api/auth/login`
- `https://registry.dev.reviz.dev/api/assets`
- `https://registry.dev.reviz.dev/api/auth/profile`

## Priority

**HIGH PRIORITY** - This is blocking all frontend functionality including:
- User login/registration
- Asset creation and management
- Profile management
- All API interactions

## Next Steps

1. **Frontend Team**: Fix API routing configuration
2. **Test**: Verify login works with provided credentials
3. **Test**: Verify asset creation works
4. **Deploy**: Once working, deploy to development environment

## Backend Status

✅ **Backend is ready and waiting** - No backend changes needed
✅ **Database is functional** - Test user exists and working
✅ **All endpoints are available** - Ready for frontend integration 