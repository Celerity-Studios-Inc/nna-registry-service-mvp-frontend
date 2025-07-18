# Frontend Three-Tier Promotion Strategy

**Document Version:** 2.0  
**Date:** July 18, 2025  
**Status:** 🔧 **CRITICAL - Integration Recovery Required**  
**Priority:** URGENT - Frontend API Routing Fix Required

## Executive Summary

The frontend has implemented a comprehensive three-tier promotion strategy (Development → Staging → Production) with automated CI/CD workflows. However, a critical API routing issue is preventing proper integration with the backend systems.

## Problem Statement

**Current Issue:** Frontend is making API requests to frontend domains instead of backend domains, causing authentication and asset operation failures.

**Previous Issue:** Frontend was pushing directly to main branch, causing immediate deployment to all environments without proper testing through development and staging phases.

**User Feedback:** "As a best practice, you should be pushing to development for testing before pushing onto staging and production. That's the purpose of the three-tier environment."

**Solution:** Implemented proper three-tier promotion workflow with branch-based deployments and approval gates. **CRITICAL**: Now need to fix API routing configuration.

## Frontend Three-Tier Architecture

### **Environment Structure**

| Environment | Branch | URL | Backend URL | Purpose | Status |
|-------------|--------|-----|-------------|---------|--------|
| **Development** | `development` | `https://nna-registry-frontend-dev.vercel.app` | `https://registry.dev.reviz.dev` | Active development and integration | 🔧 **API Routing Issue** |
| **Staging** | `staging` | `https://nna-registry-frontend-stg.vercel.app` | `https://registry.stg.reviz.dev` | Pre-production validation and QA | ⏳ **Pending Fix** |
| **Production** | `main` | `https://nna-registry-frontend.vercel.app` | `https://registry.reviz.dev` | Live production environment | ⏳ **Pending Fix** |

### **⚠️ CRITICAL: API Routing Issue**

**Current Problem:**
```
✅ Environment Detection: https://registry.dev.reviz.dev
❌ API Requests: https://nna-registry-frontend-dev.vercel.app/api/auth/login
```

**Required Fix:**
```
✅ Environment Detection: https://registry.dev.reviz.dev
✅ API Requests: https://registry.dev.reviz.dev/api/auth/login
```

### **Promotion Flow**

```
Feature Development → Development → Staging → Production
        ↓                ↓           ↓          ↓
   feature/* branch → development → staging → main
        ↓                ↓           ↓          ↓
    Local Testing    → Dev Deploy → Stg Deploy → Prod Deploy
        ↓                ↓           ↓          ↓
   API Routing Fix → Integration → Validation → Production
```

## Implementation Details

### **1. GitHub Actions Workflows**

#### **Development Workflow** (`ci-cd-dev.yml`)
```yaml
Triggers: Push to development branch
Environment: Development
Deployment: Automatic
Health Checks: Basic
Approval Required: None
Purpose: Continuous integration for active development
Status: 🔧 Needs API routing fix
```

#### **Staging Workflow** (`ci-cd-stg.yml`)
```yaml
Triggers: Push to staging branch (via PR from development)
Environment: Staging
Deployment: Automatic after tests pass
Health Checks: Extended backend connectivity tests
Approval Required: Manual approval gate for production promotion
Purpose: Pre-production validation and QA testing
Status: ⏳ Waiting for development fix
```

#### **Production Workflow** (`ci-cd-prod.yml`)
```yaml
Triggers: Push to main branch (via PR from staging)
Environment: Production
Deployment: Requires manual approval
Health Checks: Comprehensive security audit + load testing
Approval Required: Production environment protection
Purpose: Live production deployment with enhanced safety
Status: ⏳ Waiting for staging validation
```

### **2. Branch Protection Rules**

#### **Implemented Protection:**
- ✅ `main` branch: Requires PR review, no direct pushes
- ✅ `staging` branch: Requires PR review, no direct pushes  
- ✅ `development` branch: Direct pushes allowed for development workflow
- ✅ Environment protection rules with manual approval gates

#### **Approval Gates:**
- **Development → Staging:** Manual PR review required
- **Staging → Production:** Manual approval + environment protection
- **Emergency Rollback:** Dedicated rollback approval environment

### **3. Deployment Safety Features**

#### **Testing & Validation:**
- TypeScript compilation checks on all branches
- ESLint code quality validation
- Security audits (production only)
- Build verification and artifact validation
- Environment-specific health checks

#### **Health Monitoring:**
- Post-deployment health verification
- Backend connectivity testing
- Frontend load testing (production)
- Automatic rollback triggers on failure

## Backend Coordination Requirements

### **Synchronized Promotion Strategy**

**Recommendation:** Backend should implement parallel three-tier strategy to ensure environment consistency.

#### **Environment Alignment:**
| Frontend Environment | Backend Environment | Synchronization | Status |
|---------------------|-------------------|-----------------|--------|
| `development` branch | `dev` branch | Automatic deployment | 🔧 **API Routing Issue** |
| `staging` branch | `staging` branch | Coordinated promotion | ⏳ **Pending** |
| `main` branch | `main` branch | Synchronized release | ⏳ **Pending** |

#### **Release Coordination:**
1. **Development Phase:** Independent development on respective `development`/`dev` branches
2. **Staging Promotion:** Coordinated PR creation: `development` → `staging` (frontend) + `dev` → `staging` (backend)
3. **Production Release:** Synchronized PR creation: `staging` → `main` (both repositories)

### **Backend Three-Tier Implementation Recommendations**

#### **Branch Structure:**
```
backend/dev → backend/staging → backend/main
     ↓             ↓               ↓
   Dev API     Staging API    Production API
```

#### **Environment URLs (Current - CORRECTED):**
- **Development:** `https://registry.dev.reviz.dev` ✅
- **Staging:** `https://registry.stg.reviz.dev` ⏳
- **Production:** `https://registry.reviz.dev` ⏳

#### **CI/CD Workflow Recommendations:**
1. **Development CI/CD:** Automatic deployment on push to `dev` branch
2. **Staging CI/CD:** Manual promotion from `dev` → `staging` with integration tests
3. **Production CI/CD:** Manual promotion from `staging` → `main` with full test suite

## Coordination Processes

### **Daily Development Workflow**
1. **Frontend & Backend:** Independent development on `development`/`dev` branches
2. **Automatic Deployment:** Both systems deploy automatically to development environment
3. **Integration Testing:** Continuous testing between frontend-dev and backend-dev
4. **Current Issue:** API routing preventing integration testing

### **Weekly Staging Promotion**
1. **Coordination Meeting:** Frontend and backend teams align on promotion readiness
2. **Synchronized PR Creation:** Both teams create PRs: `development`/`dev` → `staging`
3. **Integration Testing:** Full frontend-backend integration testing on staging environment
4. **QA Validation:** User acceptance testing on staging environment
5. **Current Status:** Blocked by API routing issue

### **Release Production Deployment**
1. **Release Planning:** Joint planning for production release
2. **Pre-deployment Checklist:** Synchronized verification of staging environment health
3. **Coordinated Promotion:** Simultaneous PRs: `staging` → `main` (both repositories)
4. **Production Validation:** Joint health checks and rollback procedures if needed
5. **Current Status:** Blocked by staging issues

## Security & Compliance

### **Frontend Security Measures**
- ✅ Environment-specific configuration management
- ✅ Secrets management via GitHub Secrets
- ✅ CORS configuration for cross-environment communication
- ✅ Security audits in production workflow
- ✅ Input validation and error sanitization

### **Backend Security Coordination Required**
- ✅ JWT token validation across environments
- ✅ CORS configuration for frontend environment URLs
- ⏳ Rate limiting and abuse protection
- ✅ Environment-specific database isolation
- ⏳ Audit logging for deployment and access tracking

## Monitoring & Alerting

### **Frontend Monitoring Implemented**
- ✅ Deployment success/failure notifications
- ✅ Health check monitoring post-deployment
- ✅ Error boundary tracking and reporting
- ✅ Performance metrics collection
- ✅ User experience monitoring

### **Backend Monitoring Coordination**
- ✅ API endpoint health monitoring
- ✅ Database connection status tracking
- ⏳ Performance metrics and alerting
- ⏳ Error rate monitoring and alerting
- ⏳ Joint frontend-backend health dashboard

## Emergency Procedures

### **Rollback Procedures**
1. **Frontend Rollback:** 
   - Automatic: Health check failure triggers rollback
   - Manual: Emergency rollback environment approval
   - Process: Revert to previous Vercel deployment

2. **Backend Rollback (Recommended):**
   - Automatic: Health check failure triggers rollback
   - Manual: Emergency rollback approval process
   - Process: Revert to previous Cloud Run deployment

3. **Coordinated Rollback:**
   - Joint frontend-backend rollback for breaking changes
   - Communication protocol for emergency situations
   - Post-incident analysis and prevention measures

## Release Management

### **Release 1.2.0 Coordination**

#### **Frontend Readiness:** 🔧 **CRITICAL ISSUE**
- Three-tier workflow implemented and tested
- Async taxonomy sync ready for backend integration
- Sort functionality fixes deployed and validated
- Video thumbnail system production-ready
- Settings system and UI improvements complete
- **CRITICAL**: API routing configuration needs immediate fix

#### **Backend Coordination Required:**
- ✅ Three-tier branch structure implementation
- ⏳ Async taxonomy sync endpoint implementation
- ⏳ Coordinated staging and production promotion testing
- ⏳ Joint release validation and health monitoring

#### **Release Timeline Recommendation:**
1. **Today:** Frontend API routing fix
2. **Tomorrow:** Integration testing and staging deployment
3. **Next Day:** Production deployment and validation
4. **Next Week:** Phase 2B comprehensive testing

## Success Metrics

### **Deployment Metrics:**
- ✅ Zero direct pushes to main branch (frontend achieved)
- ⏳ 100% PR-based promotions (backend coordination required)
- ✅ Automated health checks passing rate > 99% (frontend achieved)
- ⏳ Coordinated deployment success rate > 95% (joint target)

### **Quality Metrics:**
- ✅ Zero production incidents from skipped testing (frontend achieved)
- ⏳ Faster bug detection in staging vs production (joint target)
- ✅ Improved code quality scores from mandatory PR reviews
- ⏳ Enhanced system reliability from proper testing flow

## Immediate Actions Required

### **Frontend Actions Required:**
- 🔧 **URGENT**: Fix API service configuration to use `getBackendUrl()`
- 🔧 **URGENT**: Update `authService.ts` and `assetService.ts`
- 🔧 **URGENT**: Deploy fix to development environment
- 🔧 **URGENT**: Test integration with backend
- ⏳ **NEXT**: Deploy fix to staging environment
- ⏳ **NEXT**: Deploy fix to production environment

### **Backend Actions Complete:**
- ✅ Three-tier CI/CD workflows implemented
- ✅ Environment-specific configurations active
- ✅ Health monitoring and logging operational
- ✅ Database and storage isolation working
- ✅ CORS configuration properly set up

### **Joint Actions Required:**
- 🔧 **URGENT**: Frontend-backend integration testing
- ⏳ **NEXT**: Staging environment validation
- ⏳ **NEXT**: Production environment validation
- ⏳ **NEXT**: Phase 2B feature testing

## Recovery Plan

### **Phase 1: Critical Fix** (Today)
1. **Frontend Team**: Fix API routing configuration
2. **Frontend Team**: Deploy fix to development
3. **Both Teams**: Test integration with provided credentials
4. **Both Teams**: Verify API requests in browser dev tools

### **Phase 2: Staging Deployment** (Tomorrow)
1. **Frontend Team**: Deploy fix to staging
2. **Both Teams**: Test staging integration
3. **Both Teams**: Validate cross-environment functionality

### **Phase 3: Production Deployment** (Next Day)
1. **Frontend Team**: Deploy fix to production
2. **Both Teams**: Test production integration
3. **Both Teams**: Verify full system functionality

### **Phase 4: Feature Testing** (Next Week)
1. **Both Teams**: Test Phase 2B features
2. **Both Teams**: Test Songs layer asset creation
3. **Both Teams**: Test creator description preservation
4. **Both Teams**: Test album art and AI metadata

---

**Document Version**: 2.0  
**Last Updated**: July 18, 2025  
**Status**: 🔧 Critical integration recovery required  
**Priority**: URGENT - Frontend API routing fix needed