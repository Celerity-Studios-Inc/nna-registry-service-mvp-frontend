# NNA Registry Service - Architecture Documentation

## 🎯 **Overview**

This folder contains the comprehensive architecture documentation for the NNA Registry Service, including environment strategies, domain configurations, and implementation guides.

## 📚 **Documentation Structure**

### **Core Architecture Documents**

| Document | Purpose | Status |
|----------|---------|--------|
| **[Environment Configuration Reference](./ENVIRONMENT_CONFIGURATION_REFERENCE.md)** | **Single source of truth** for all environment configurations | ✅ **Complete** |
| **[Canonical Domains Integration](./CANONICAL_DOMAINS_INTEGRATION.md)** | Frontend-backend domain mapping and CORS configuration | ✅ **Complete** |
| **[Three Environment Strategy](./THREE_ENVIRONMENT_STRATEGY.md)** | Complete three-environment infrastructure strategy | ✅ **Complete** |
| **[Consolidated Domain Request](./CONSOLIDATED_DOMAIN_REQUEST.md)** | Frontend team requirements and domain architecture | ✅ **Complete** |
| **[Three Environment Strategy Alignment](./THREE_ENVIRONMENT_STRATEGY_ALIGNMENT.md)** | Frontend-backend alignment analysis | ✅ **Complete** |
| **[Backend Architecture Overview](./BACKEND_ARCHITECTURE_OVERVIEW.md)** | Complete backend architecture and technology stack | ✅ **Complete** |

### **Legacy Architecture Documents**

| Document | Purpose | Status |
|----------|---------|--------|
| [Architecture Overview](./architecture-overview.md) | High-level system architecture | ✅ **Complete** |
| [Master Development Roadmap](./MASTER_DEVELOPMENT_ROADMAP.md) | Development phases and milestones | ✅ **Complete** |
| [File Upload Strategy](./file_upload_strategy.md) | File upload and storage architecture | ✅ **Complete** |
| [Dual Addressing Implementation](./dual_addressing_executive_summary.md) | NNA addressing system implementation | ✅ **Complete** |

---

## 🌍 **Environment Architecture**

### **Three-Environment Strategy**

The NNA Registry Service implements a **single codebase, three-environment** strategy:

- **Development**: `https://registry.dev.reviz.dev` (for active development)
- **Staging**: `https://registry.stg.reviz.dev` (for pre-production testing)
- **Production**: `https://registry.reviz.dev` (for live production)

### **Canonical Domain Structure**

| Environment | Frontend Domain | Backend Domain |
|-------------|----------------|----------------|
| **Development** | `nna-registry-frontend-dev.vercel.app` | `registry.dev.reviz.dev` |
| **Staging** | `nna-registry-frontend-stg.vercel.app` | `registry.stg.reviz.dev` |
| **Production** | `nna-registry-frontend.vercel.app` | `registry.reviz.dev` |

---

## 🛠️ **Verification and Testing**

### **Automated Verification Script**

Use the verification script to check all environment configurations:

```bash
# Verify all environments
./scripts/verify-environments.sh all

# Verify specific environment
./scripts/verify-environments.sh dev
./scripts/verify-environments.sh staging
./scripts/verify-environments.sh prod
```

### **Key Verification Points**

- ✅ Environment detection logic
- ✅ Database isolation
- ✅ Storage bucket isolation
- ✅ CORS configuration
- ✅ Secret mappings
- ✅ Health endpoint responses

---

## 🔧 **Technology Stack**

### **Backend**
- **Framework**: NestJS (Node.js)
- **Database**: MongoDB (with PostgreSQL migration planned)
- **Storage**: Google Cloud Storage (GCS)
- **Deployment**: Google Cloud Run
- **Authentication**: JWT with role-based access
- **Documentation**: Swagger/OpenAPI
- **Monitoring**: Sentry + structured logging

### **Frontend**
- **Framework**: React with TypeScript
- **Deployment**: Vercel
- **Environment Detection**: Hostname-based with fallbacks
- **API Integration**: Environment-aware routing

---

## 📋 **Quick Reference**

### **Environment URLs**

#### **Development**
- Frontend: `https://nna-registry-frontend-dev.vercel.app`
- Backend: `https://registry.dev.reviz.dev`
- Database: `nna-registry-service-dev`
- Storage: `nna_registry_assets_dev`

#### **Staging**
- Frontend: `https://nna-registry-frontend-stg.vercel.app`
- Backend: `https://registry.stg.reviz.dev`
- Database: `nna-registry-service-staging`
- Storage: `nna_registry_assets_stg`

#### **Production**
- Frontend: `https://nna-registry-frontend.vercel.app`
- Backend: `https://registry.reviz.dev`
- Database: `nna-registry-service-production`
- Storage: `nna_registry_assets_prod`

### **Health Endpoints**

All environments provide enhanced health endpoints:

```bash
# Development
curl https://registry.dev.reviz.dev/api/health

# Staging
curl https://registry.stg.reviz.dev/api/health

# Production
curl https://registry.reviz.dev/api/health
```

---

## 🚨 **Common Issues and Solutions**

### **Configuration Issues**

1. **Wrong GCS Bucket**: Check Cloud Run environment variable mappings
2. **Wrong Database**: Verify MongoDB URI secret values
3. **CORS Errors**: Confirm CORS allowed origins configuration
4. **Environment Detection**: Check hostname configuration

### **Troubleshooting Steps**

1. Run the verification script: `./scripts/verify-environments.sh all`
2. Check Cloud Run service configuration
3. Verify secret values in Secret Manager
4. Test health endpoints for runtime configuration
5. Check CORS preflight requests

---

## 📞 **Support and Maintenance**

### **Documentation Updates**
- All changes to environment configuration must be reflected in `ENVIRONMENT_CONFIGURATION_REFERENCE.md`
- Run verification script after any configuration changes
- Update this README when adding new documents

### **Architecture Decisions**
- Major architectural changes require documentation updates
- Environment configuration changes require verification testing
- New environments must follow the established naming conventions

---

## 🎯 **Next Steps**

### **Immediate Priorities**
1. **Complete Environment Verification**: Use the verification script to confirm all environments
2. **Documentation Review**: Ensure all team members understand the architecture
3. **Automated Testing**: Implement automated environment verification in CI/CD

### **Future Enhancements**
1. **Monitoring Integration**: Enhanced monitoring and alerting
2. **Performance Optimization**: CDN and caching strategies
3. **Security Hardening**: Additional security measures

---

**This architecture documentation ensures consistent understanding and implementation across all team members and environments.**

---

**Last Updated**: July 5, 2025  
**Version**: 1.0  
**Status**: ✅ **Complete and Verified** 