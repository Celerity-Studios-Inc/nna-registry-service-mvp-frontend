# 🔧 NNA Registry Frontend - Troubleshooting Guide

**Quick Solutions for Common Development Issues**

---

## 🚨 **Critical Issues & Emergency Fixes**

### **Production Environment Down**
```bash
# Check deployment status
vercel --prod
curl -I https://nna-registry-frontend.vercel.app

# Emergency fallback
# Use staging environment for critical operations
# URL: https://nna-registry-frontend-stg.vercel.app
```

### **Staging Environment Issues**
```bash
# Verify staging environment
curl -I https://nna-registry-frontend-stg.vercel.app

# Check staging project status
vercel link --project nna-registry-service-staging
vercel inspect
```

### **Authentication Completely Broken**
1. **Clear browser storage**: localStorage, sessionStorage, cookies
2. **Check environment variables**: Verify correct backend URLs
3. **Test with fresh browser session**: Incognito/private mode
4. **Emergency access**: Use `/emergency-register` for asset creation

---

## 🔍 **Development Environment Issues**

### **Build Failures**
```bash
# Common build issues and fixes

# Issue: Tests blocking build
npm run build        # ❌ May fail due to test issues
CI=false npm run build  # ✅ Skip tests, build only

# Issue: TypeScript errors
npm run build        # Review specific TypeScript errors
# Fix type issues or add type assertions: (object as any)

# Issue: Memory issues during build
export NODE_OPTIONS="--max-old-space-size=8192"
npm run build
```

### **Development Server Issues**
```bash
# Port conflicts
lsof -ti:3000,3001 | xargs kill -9    # Kill processes on ports
npm start                             # Restart development server

# Environment variable issues
cp .env.example .env.local           # Create local environment file
# Edit .env.local with correct values
npm start
```

### **Package Installation Issues**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Security vulnerabilities
npm audit                    # Check vulnerabilities
npm audit fix               # Fix automatically
npm audit fix --force       # Force fix breaking changes
```

---

## 🏷️ **Taxonomy System Issues**

### **Subcategory Dropdowns Empty** ⚠️ **CRITICAL**
```typescript
// ❌ WRONG - Causes empty dropdowns
import taxonomyService from '../../api/taxonomyService';

// ✅ CORRECT - Use this service
import {
  getLayers,
  getCategories,
  getSubcategories
} from '../../services/enhancedTaxonomyService';
```

### **Layer/Category Selection Not Working**
1. **Check console for errors**: Look for taxonomy service errors
2. **Clear browser cache**: Environment-specific caching issues
3. **Use emergency registration**: `/emergency-register` as fallback
4. **Verify taxonomy data loading**: Check network tab for API calls

### **HFN/MFA Format Issues**
```typescript
// Check for proper format conversion
// Expected: S.POP.BAS.001 (not S.Pop.Base.001)
// Check taxonomyFormatter.ts for conversion issues
```

---

## 🎬 **Video & Media Issues**

### **Video Thumbnails Not Loading**
```bash
# Check console for video thumbnail errors
# Look for: "🎬 Starting thumbnail generation"
# Expected: "✅ Successfully generated thumbnail"

# Common fixes:
# 1. Clear browser cache
# 2. Check video URL accessibility
# 3. Verify video format compatibility
```

### **Image Upload Failures**
```bash
# Check file size limits
# Small files (≤4MB): Via Vercel proxy
# Large files (>4MB): Direct to backend

# Check console for upload errors
# Verify FormData construction in network tab
```

---

## 🔍 **Search & Browse Issues**

### **Search Returns No Results**
1. **Check search terms**: Try different keywords ("olivia", "nike" work well)
2. **Clear search filters**: Click "Clear All" button
3. **Manual search trigger**: Click search button after taxonomy selection
4. **Cache busting**: Add `?t=${Date.now()}` to force refresh

### **Pagination Shows Empty Pages**
- **Expected behavior**: Pages 13-21 may appear empty due to filtering
- **Workaround**: Use "Previous" navigation, pages 1-12 contain results
- **Not a bug**: Server-side pagination + client-side filtering architecture

### **Sort Functionality Not Working**
```typescript
// Check AssetSearch.tsx for sort logic
// Ensure sort state updates trigger re-render
// Verify sort dropdown selection is working
```

---

## 🌐 **Environment & Deployment Issues**

### **Wrong Environment Detection**
```javascript
// Check console logs for environment detection
console.log('REACT_APP_ENVIRONMENT:', process.env.REACT_APP_ENVIRONMENT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('hostname:', window.location.hostname);

// Expected environments:
// Production: production, nna-registry-frontend.vercel.app
// Staging: staging, nna-registry-frontend-stg.vercel.app
// Development: development, nna-registry-dev-frontend.vercel.app
```

### **API Calls Going to Wrong Backend**
```javascript
// Check backend URL in console
console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);

// Expected backend URLs:
// Production: https://registry.reviz.dev
// Staging: https://registry.stg.reviz.dev  
// Development: https://registry.dev.reviz.dev
```

### **CORS Issues**
1. **Staging environment**: Should work without CORS issues
2. **Local development**: May require backend CORS configuration
3. **Production**: Should have proper CORS headers
4. **Check network tab**: Look for OPTIONS preflight requests

---

## 🧪 **Testing Issues**

### **Jest Configuration Problems**
```bash
# Current issue: Jest timeout and parsing errors
# Workaround: Skip tests during build
CI=false npm run build

# Fix Jest configuration (future task):
# Update jest.config.js
# Fix TypeScript integration
# Update test file patterns
```

### **Component Testing**
```bash
# Test specific components
npm test ComponentName          # Test single component
npm test -- --watchAll         # Watch mode for all tests
npm test -- --coverage         # Generate coverage report
```

---

## 📋 **Performance Issues**

### **Slow Initial Load**
1. **Check bundle size**: Large JavaScript bundle may cause slow loading
2. **Network analysis**: Use browser DevTools Network tab
3. **Clear browser cache**: Force reload with cache clear
4. **Check CDN**: Verify Vercel edge cache performance

### **Memory Issues**
```typescript
// Check for memory leaks
// Video thumbnail cache: Global Map may grow large
// Console logging: 588+ statements may impact performance
// Component re-renders: Missing React.memo optimizations
```

---

## 🔐 **Authentication & Security Issues**

### **Login Failures**
```bash
# Check JWT token in localStorage
# Key: 'token' or 'auth-token'
# Clear token if corrupted: localStorage.clear()

# Check authentication API calls
# Look for /api/auth/login requests
# Verify 200 response with token
```

### **Session Expiration**
```javascript
// Check token expiration
const token = localStorage.getItem('token');
// Decode JWT to check expiration (use jwt-decode library)

// Clear expired tokens
localStorage.removeItem('token');
window.location.reload();
```

---

## 📞 **Getting Help**

### **Immediate Support**
1. **Check this troubleshooting guide** for common issues
2. **Review console errors** for specific error messages  
3. **Test in different environment** (dev/staging/production)
4. **Use emergency procedures** for critical issues

### **Development Team Support**
- **Frontend issues**: Component, UI, and client-side problems
- **Backend issues**: API, authentication, and server-side problems
- **Infrastructure issues**: Deployment, environment, and configuration problems

### **Escalation Process**
1. **Try troubleshooting steps** in this guide
2. **Document the issue** with steps to reproduce
3. **Check environment consistency** across dev/staging/production
4. **Contact appropriate team** based on issue category

---

## 📝 **Reporting Issues**

### **Include This Information**
- **Environment**: Development, staging, or production
- **Browser**: Chrome, Firefox, Safari, etc.
- **Error messages**: Full console error logs
- **Steps to reproduce**: Exact sequence that causes the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens

### **Console Log Collection**
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');
// Reproduce issue
// Copy console logs
// Include in issue report
```

---

**Emergency Contact**: If critical production issues persist after following this guide, escalate immediately to the development team with full error details and reproduction steps.

*Last updated: January 26, 2025*