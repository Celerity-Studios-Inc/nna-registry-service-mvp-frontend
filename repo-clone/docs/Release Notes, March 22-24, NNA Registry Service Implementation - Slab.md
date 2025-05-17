# 📦  Release Notes & immediate next steps

**Date:** March 22–24, 2024

**Audience:** Developer Team (async-friendly update)

**Version:** 0.0.3

## 🔍 Summary

This release focused on **stabilizing authentication**, **automating deployments**, and preparing for **asset registration enhancements**. The goal is to make the registry service production-ready for internal use and external integrations.

## ✅ Current State (as of March 24)

| **Component** | **Status** | **Notes** |
| --- | --- | --- |
| **Backend** | ✅ Deployed (Cloud Run) | Node 20, CI/CD, Health Check Enabled |
| **Frontend** | ✅ Deployed (Vercel) | Auto-deploy from `main` branch |
| **Testing** | ✅ All unit/integration tests passing | Auth + API verified |
| **Docs** | ✅ Swagger available | See `/api` for live docs |

## 🔐 Authentication Enhancements

### 1. Dual Login (Email/Username)

- ✅ Login supported via **email** _or_ **username**
- ✅ Validations updated across frontend + backend
- ✅ Fully tested (unit + integration)
- 🔗 Commit: `bb39152`

### 2. Password Reset Flow

- ✅ Forgot password endpoint + secure email delivery
- ✅ Token validation + reset handling
- ✅ Frontend reset flow implemented
- 🔗 Commits: `335ea04`, `2ae30ff`

## 🚀 Infrastructure Improvements

### Backend (Cloud Run)

- 🔄 Node.js 20 upgrade
- ✅ Health check at `/health`
- ✅ Auto-deploy via GCP CI/CD
- 🔗 Commits: `3ef8d1f`, `e9fa3f6`

### Frontend (Vercel)

- 🔄 Production URLs & build config fixed
- ✅ Static asset caching
- ✅ GitHub → Vercel integration live
- 🔗 Commits: `d10e050`, `41a27b0`

## 🧪 Developer Testing Guide

### 1. Verify the Environment

```bash
curl https://registry.reviz.dev/health        # backend
open https://nna-registry.vercel.app          # frontend
```

### 2. API (Swagger)

- [Swagger UI](https://registry.reviz.dev/api)
- Includes: `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`

### 3. Manual Flow Testing

- ✅ Register with email + password
- ✅ Login using email OR username
- ✅ Trigger password reset
- ✅ Receive and use reset token

## 🛠️ Next Up — Features in Progress

### 1. 🔢 Sequential Number Generator (Fix in Progress)

**Problem:** All assets show static `001` in preview

**Goal:** Dynamically assign next available number

✅ Backend

```typescript
GET /api/assets/count?layer={layer}&category={category}&subcategory={subcategory}
```

✅ Frontend

```typescript
// Updates to:
- TaxonomySelection.tsx
- NNAAddressPreview.tsx
- ForcedSequentialNumber.tsx (new)
```

✅ Services

```typescript
// Logic in:
- getNextSequentialNumber()
- getExistingAssetsCount()
```

### 2. 🧱 Asset Registration Enhancements

- Support for:
    - Layer 2 and composite assets
    - Training datasets
    - Custom asset types
- Improvements:
    - Multi-file uploads
    - File type validation
    - Upload progress indicators

## 🧩 Environment & Config

### Backend `.env` (important additions)

```
JWT_SECRET=your-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
FRONTEND_URL=https://nna-registry.vercel.app
```

### Frontend `.env.production`

```
REACT_APP_API_URL=https://registry.reviz.dev
```

## 🧪 Cypress E2E Testing (Planned)

**Repo:** https://github.com/reviz/nna-registry-e2e

**Framework:** Cypress

```bash
npm run cypress:run
npm run cypress:open
```

**Test Suites:**

```bash
cypress/e2e/
├── auth/
│   ├── login.cy.ts
│   ├── register.cy.ts
│   └── reset-password.cy.ts
└── upload/
    └── file-upload.cy.ts
```

## 🧭 Development Timeline

| Week | Focus |
| --- | --- |
| 1 | 🔢 Sequential number fix |
| 2 | 🧱 Asset type + validation |
| 3 | 📤 Upload system overhaul |
| 4 | 🧪 E2E + 📝 Docs Finalization |

## 🧠 Monitoring, Alerts & Performance

### Monitoring Tools

- GCP Cloud Monitoring (backend)
- Vercel Analytics (frontend)
- MongoDB Atlas (database health)

### Alert Rules

| System | Trigger |
| --- | --- |
| **Cloud Run** | Error rate > 1%, slow response (>2s) |
| **MongoDB** | Connections > 80%, Disk > 80% |

## 🔐 Security Notes

### Rate Limiting (NestJS Throttle)

```typescript
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per minute
```

### JWT Configuration

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '1h',
    algorithm: 'HS256'
  }
})
```

## 🛑 Rollback Procedures

### Backend

```bash
gcloud run services update-traffic nna-registry-service   --to-revision=nna-registry-service-00001-previous
```

### Frontend (via Vercel)

1. Go to Deployments
1. Promote last stable build to Production

## 📬 Support & Ownership

| **Area** | **Contact** |
| --- | --- |
| Backend | Kirill |
| Frontend | Ajay |
| Infra/CI | Kirill |
| Database | Kirill |

---

_This doc is designed for async handoffs and transparency across time zones. Ping @engineering-team with updates or blockers._
