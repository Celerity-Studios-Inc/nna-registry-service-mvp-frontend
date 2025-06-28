# Frontend Team Documentation

## 🎯 **Welcome Frontend Team!**

This folder contains comprehensive documentation specifically created for the frontend team to understand our backend architecture, integration points, and three-environment strategy. We've achieved **95% alignment** with your frontend implementation and are ready to support your development needs.

---

## 📚 **Documentation Overview**

### **Core Documents**

| Document | Purpose | Status |
|----------|---------|--------|
| **[Backend Architecture Overview](./BACKEND_ARCHITECTURE_OVERVIEW.md)** | Complete backend architecture and technology stack | ✅ Complete |
| **[Three-Environment Strategy Alignment](./THREE_ENVIRONMENT_STRATEGY_ALIGNMENT.md)** | Detailed alignment analysis with your frontend strategy | ✅ Complete |
| **[API Integration Guide](./API_INTEGRATION_GUIDE.md)** | Comprehensive API integration with code examples | ✅ Complete |

---

## 🌍 **Three-Environment Status**

### **Current Alignment: 95% Complete** ✅

| Environment | Backend Status | Frontend Status | Alignment |
|-------------|----------------|-----------------|-----------|
| **Production** | ✅ Enhanced health endpoint | ✅ Operational | ✅ **Perfect** |
| **Staging** | ✅ Enhanced health endpoint | ✅ Operational | ✅ **Perfect** |
| **Development** | ⏳ Basic health endpoint | ✅ Operational | ⏳ **Pending Enhancement** |

### **Environment URLs**

| Environment | Frontend URL | Backend URL | Status |
|-------------|--------------|-------------|--------|
| **Development** | `https://nna-registry-dev-frontend.vercel.app` | `https://registry.dev.reviz.dev` | ⏳ Enhancement Pending |
| **Staging** | `https://nna-registry-frontend-stg.vercel.app` | `https://registry.stg.reviz.dev` | ✅ **Perfect Alignment** |
| **Production** | `https://nna-registry-frontend.vercel.app` | `https://registry.reviz.dev` | ✅ **Perfect Alignment** |

---

## 🔍 **Key Integration Points**

### **Environment Detection**
Both frontend and backend use **hostname-based detection** as the primary method:

```typescript
// Frontend Detection
if (hostname.includes('nna-registry-frontend-stg.vercel.app')) → staging
if (hostname.includes('nna-registry-dev-frontend.vercel.app')) → development
if (hostname.includes('nna-registry-frontend.vercel.app')) → production

// Backend Detection
if (hostname.includes('registry.stg.reviz.dev')) → staging
if (hostname.includes('registry.dev.reviz.dev')) → development
if (hostname.includes('registry.reviz.dev')) → production
```

### **Health Endpoint Integration**
Our enhanced health endpoints provide complete transparency:

```json
{
  "status": "healthy",
  "environment": "production",
  "detection": {
    "method": "hostname",
    "hostname": "registry.reviz.dev"
  },
  "config": {
    "database": { "name": "nna-registry-production" },
    "storage": { "bucket": "nna-registry-production-storage" },
    "cors": { "allowedOrigins": ["https://nna-registry-frontend.vercel.app"] }
  }
}
```

### **CORS Configuration**
Strict environment-specific CORS policies:

```typescript
// Development
allowedOrigins: ['https://nna-registry-dev-frontend.vercel.app']

// Staging
allowedOrigins: ['https://nna-registry-frontend-stg.vercel.app']

// Production
allowedOrigins: ['https://nna-registry-frontend.vercel.app']
```

---

## 🚀 **Quick Start Guide**

### **1. Environment Detection**
Use our health endpoint to detect the current environment:

```typescript
const checkEnvironment = async () => {
  const response = await fetch('https://registry.reviz.dev/api/health');
  const health = await response.json();
  return health.environment; // 'development' | 'staging' | 'production'
};
```

### **2. API Integration**
Configure your API client with environment-specific URLs:

```typescript
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  
  if (hostname.includes('nna-registry-frontend-stg.vercel.app')) {
    return 'https://registry.stg.reviz.dev';
  }
  
  if (hostname.includes('nna-registry-dev-frontend.vercel.app')) {
    return 'https://registry.dev.reviz.dev';
  }
  
  return 'https://registry.reviz.dev'; // Production
};
```

### **3. Authentication**
Implement JWT-based authentication:

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const { access_token, user } = await response.json();
  // Store token and user info
};
```

---

## 📋 **Integration Checklist**

### **Immediate Actions**
- [ ] **Review Backend Architecture Overview** - Understand our technology stack
- [ ] **Verify Environment Detection** - Test health endpoints across environments
- [ ] **Implement API Integration** - Use our integration guide for setup
- [ ] **Test CORS Configuration** - Ensure cross-origin requests work

### **Development Workflow**
- [ ] **Environment Banners** - Display correct environment indicators
- [ ] **API Error Handling** - Implement robust error handling
- [ ] **File Upload Integration** - Use direct GCS upload strategy
- [ ] **Asset Management** - Implement CRUD operations

### **Testing Requirements**
- [ ] **All Environments** - Test across development, staging, production
- [ ] **Authentication Flow** - Test login, logout, token refresh
- [ ] **File Operations** - Test upload, download, preview
- [ ] **Error Scenarios** - Test network failures, validation errors

---

## 🔧 **Development Environment Enhancement**

### **Current Status**
The development environment currently has a basic health endpoint. We're planning to enhance it to match the production and staging environments.

### **Expected Enhancement**
```json
{
  "status": "healthy",
  "environment": "development",
  "detection": {
    "method": "hostname",
    "hostname": "registry.dev.reviz.dev"
  },
  "config": {
    "database": { "name": "nna-registry-development" },
    "storage": { "bucket": "nna-registry-dev-storage" },
    "cors": { "allowedOrigins": ["https://nna-registry-dev-frontend.vercel.app"] },
    "logging": { "level": "debug" }
  }
}
```

---

## 🎯 **Next Steps**

### **Phase 1: Complete Alignment** (Week 1)
1. **Deploy development environment enhancement**
2. **Complete end-to-end testing** across all environments
3. **Validate full-stack integration** with asset creation workflows

### **Phase 2: Taxonomy Service** (Weeks 2-4)
1. **Standalone taxonomy microservice** implementation
2. **RESTful API with versioning** support
3. **Admin interface** for taxonomy management

### **Phase 3: Advanced Features** (Weeks 5-12)
1. **RBAC implementation** with role-based access
2. **Admin dashboard** development
3. **Gen-AI integration** for unified creation workflow

---

## 🤝 **Collaboration**

### **Backend Team Support**
- **API Documentation**: Complete OpenAPI/Swagger documentation
- **Environment Configuration**: All environments properly configured
- **Error Handling**: Comprehensive error responses and logging
- **Performance**: Optimized for production workloads

### **Frontend Team Responsibilities**
- **Environment Detection**: Smart detection with fallback strategies
- **API Integration**: Robust client-side API handling
- **User Experience**: Intuitive interface and error handling
- **Testing**: Comprehensive testing across all environments

### **Shared Goals**
- **Perfect Alignment**: Seamless frontend-backend integration
- **Enterprise Quality**: Production-ready, scalable architecture
- **Security**: Robust authentication and authorization
- **Performance**: Fast, responsive user experience

---

## 📞 **Support & Communication**

### **Documentation Updates**
- All documentation is version-controlled and regularly updated
- Changes are communicated through this README
- API changes are documented with migration guides

### **Issue Reporting**
- Use our enhanced health endpoints for debugging
- Include environment information in bug reports
- Test across all environments before reporting issues

### **Feature Requests**
- Align with our master development roadmap
- Consider impact across all environments
- Include technical specifications and use cases

---

**We're excited to work with you on building an enterprise-grade NNA Registry Platform! Our backend is ready to support your frontend development and integration needs.**

---

**Document Created**: June 27, 2025  
**Version**: 1.0  
**Last Updated**: Initial creation  
**Next Review**: After Phase 1 completion 