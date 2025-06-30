# Smart Routing Test Guide

## 🎯 **File Upload Routing Test**

### **Small File Test (≤4MB)**
**Expected**: Route via Vercel proxy → staging backend

1. **Create test file**: 
   ```bash
   # Create 2MB test file
   dd if=/dev/zero of=small-test.jpg bs=1M count=2
   ```

2. **Upload Process**:
   - Navigate to Register Asset
   - Select layer and taxonomy  
   - Upload the 2MB file
   - **Check Network Tab**: Request should go to `/api/assets` (proxy)

3. **Expected Console Logs**:
   ```
   🔄 Small file (2.00MB) routed via proxy
   📤 Uploading via proxy endpoint: /api/assets
   ```

### **Large File Test (>4MB)**
**Expected**: Route directly to staging backend

1. **Create test file**:
   ```bash
   # Create 6MB test file  
   dd if=/dev/zero of=large-test.mp4 bs=1M count=6
   ```

2. **Upload Process**:
   - Follow same registration steps
   - Upload the 6MB file
   - **Check Network Tab**: Request should go to `https://registry.stg.reviz.dev/api/assets`

3. **Expected Console Logs**:
   ```
   🚀 Large file (6.00MB) routed directly to backend
   📤 Uploading to direct endpoint: https://registry.stg.reviz.dev/api/assets
   ```

## 🔍 **Environment Detection Test**

### **Browser Console Verification**
Open browser console and look for:
```
🌍 Environment Configuration
Environment: staging
Backend URL: https://registry.stg.reviz.dev
Frontend URL: https://nna-registry-service-mvp-frontend.vercel.app
Debug Logging: true
```

### **Staging Banner Test**
- **Expected**: Orange warning banner at top of page
- **Text**: "⚠️ Staging Environment - Connected to registry.stg.reviz.dev"
- **Behavior**: Should be visible on all pages

## 📊 **Network Tab Analysis**

### **API Calls Verification**
Monitor Network tab for:

1. **Health Checks**: 
   - URL: `/api/health` 
   - Should proxy to: `registry.stg.reviz.dev/api/health`

2. **Asset Searches**:
   - URL: `/api/assets`
   - Should proxy to: `registry.stg.reviz.dev/api/assets`

3. **File Uploads**:
   - Small files: `/api/assets` (via proxy)
   - Large files: `https://registry.stg.reviz.dev/api/assets` (direct)

## ✅ **Success Criteria**

- [ ] Staging banner visible
- [ ] Environment detection logs correct  
- [ ] Small files route via proxy
- [ ] Large files route directly to backend
- [ ] All API calls reach custom domain
- [ ] Asset registration completes successfully
- [ ] Success page shows correct asset details

## 🚨 **Troubleshooting**

### **If staging banner missing**:
- Check environment detection in browser console
- Verify `REACT_APP_ENVIRONMENT=staging` is set

### **If API calls fail**:
- Check CORS headers in Network tab
- Verify custom domain accessibility
- Check for authentication token issues

### **If file uploads fail**:
- Verify file size threshold calculation
- Check routing logic in browser console
- Test both proxy and direct routing paths