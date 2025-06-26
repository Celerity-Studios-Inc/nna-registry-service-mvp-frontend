# Development Environment Backend Status & Alignment

**Date:** June 26, 2025
**Audience:** Frontend Team

---

## ✅ Backend Dev Environment Configuration

- **Backend Service:** Google Cloud Run (dev environment)
- **API Base URL:** [https://registry.dev.reviz.dev/api](https://registry.dev.reviz.dev/api) (or your actual dev backend URL)
- **MongoDB:** Dedicated dev database (`nna-registry-service-dev`)
- **GCP Storage:** Dedicated dev bucket (`nna_registry_assets_dev`)
- **Secrets:** All dev secrets managed in GCP Secret Manager
- **CORS Allowed Origins:**
  - `https://nna-registry-frontend-dev.vercel.app`  ← **Canonical Vercel dev frontend**
  - `http://localhost:3000`, `http://localhost:3001` (for local testing)
  - All staging and production frontend domains (for multi-env testing)

---

## 🔧 **Recent Backend Update**
- Added `https://nna-registry-frontend-dev.vercel.app` to CORS allowed origins in backend config
- All dev, staging, and prod environments now have correct, isolated CORS and secrets

---

## 🚦 **Frontend Team: Please Verify**
1. **API Calls:** All requests from your Vercel dev frontend should succeed (no CORS errors)
2. **Authentication:** Login and protected routes should work as expected
3. **Asset Uploads:** File uploads and downloads should work end-to-end
4. **Environment Detection:** Confirm dev environment is detected in backend health endpoint

---

## 📝 **Feedback Request**
- Please confirm that the dev environment is fully functional from the frontend
- Report any issues or misalignments so we can resolve them immediately

---

**Thank you for helping us keep all environments 100% aligned!** 🚀 