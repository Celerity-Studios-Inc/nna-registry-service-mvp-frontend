# NNA Registry Service – Frontend Checklist for Three-Environment Strategy

**Last updated:** June 2025

## Overview
The backend and infrastructure for the NNA Registry Service are now fully aligned with the three-environment strategy. This checklist will help the frontend team ensure seamless integration and complete environment isolation.

---

## 1. Frontend Environment Configuration

| Environment   | API Endpoint                        | Frontend Domain                                   | CORS Policy                        |
|---------------|-------------------------------------|---------------------------------------------------|-------------------------------------|
| Development   | https://registry.dev.reviz.dev      | https://nna-registry-dev-frontend.vercel.app      | https://nna-registry-dev-frontend.vercel.app, http://localhost:3001, http://localhost:3000 |
| Staging       | https://registry.stg.reviz.dev      | https://nna-registry-frontend-stg.vercel.app      | https://nna-registry-frontend-stg.vercel.app |
| Production    | https://registry.reviz.dev          | https://nna-registry-frontend.vercel.app          | https://nna-registry-frontend.vercel.app |

---

## 2. Frontend Tasks & Checklist

### A. Update Environment Files
- [ ] Set the correct API base URL for each environment in your `.env` or config files.
  - Example:
    - `.env.development`: `REACT_APP_API_URL=https://registry.dev.reviz.dev`
    - `.env.staging`: `REACT_APP_API_URL=https://registry.stg.reviz.dev`
    - `.env.production`: `REACT_APP_API_URL=https://registry.reviz.dev`

### B. Test CORS and Asset Previews
- [ ] Ensure all asset/video/image requests use the correct API endpoint for the current environment.
- [ ] Confirm that `crossOrigin="anonymous"` is set on all media elements.
- [ ] Test asset previews and uploads in all environments to verify CORS headers and access.

### C. Validate Data Isolation
- [ ] Check that no production data appears in staging or dev, and vice versa.
- [ ] Use the `/api/health` endpoint to confirm which environment you are connected to.

### D. Smart Routing & Uploads
- [ ] Ensure file uploads and downloads are routed to the correct backend and GCS bucket per environment.
- [ ] Validate that uploads in dev/staging do not appear in production.

### E. Error Handling & Logging
- [ ] Make sure error messages and logs are environment-specific and do not leak sensitive production info in dev/staging.

### F. Environment Switch Testing
- [ ] Test switching between environments (dev, staging, prod) and confirm the frontend always points to the correct backend.

---

## 3. How to Verify Everything is Working

- **Health Check:**  Visit `/api/health` on each backend endpoint to confirm environment, version, and domain.
- **Asset Upload/Preview:**  Upload and preview assets in each environment and check for CORS issues or data leaks.
- **User Flows:**  Run through all major user flows (registration, asset management, etc.) in each environment.

---

## 4. If You Encounter Issues

- Double-check your `.env` files and deployment configs.
- Use browser dev tools to inspect network requests and CORS headers.
- Contact the backend/DevOps team if you see:
  - CORS errors
  - Data from the wrong environment
  - Asset upload/preview failures

---

## 5. Reference

- The full backend strategy and requirements are documented in:
  - `docs/for-backend/THREE_ENVIRONMENT_STRATEGY.md`
  - `docs/for-backend/EXECUTIVE_SUMMARY_THREE_ENVIRONMENTS.md`
  - `docs/for-backend/CONSOLIDATED_DOMAIN_REQUEST.md`

---

**Let us know when you've completed your updates, or if you need any help with configuration, testing, or troubleshooting!** 