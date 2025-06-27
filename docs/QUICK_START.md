# 🚀 NNA Registry Frontend - Quick Start Guide

**Welcome to the NNA Registry Service Frontend!** This guide provides role-based navigation to help you get started quickly.

---

## 🎯 **Choose Your Path**

### 👨‍💻 **For Frontend Developers**
**Getting Started with Frontend Development:**

1. **📋 [Current Status](CURRENT_STATE.md)** - Production readiness, known issues, active implementations
2. **⚙️ [Development Setup](development/SETUP.md)** - Environment setup and configuration
3. **🏗️ [Architecture Guide](development/ARCHITECTURE.md)** - System architecture and component overview
4. **🧪 [Testing Guide](development/TESTING.md)** - Testing procedures and best practices
5. **🚀 [Deployment Guide](development/DEPLOYMENT.md)** - Build and deployment procedures

**Quick Commands:**
```bash
# Development
npm start                          # Start development server
npm test                          # Run tests
npm run build                     # Build for production

# Environment-specific
npm run start:staging             # Start with staging configuration
npm run build:staging             # Build for staging environment
```

---

### 🔧 **For Backend Developers**
**Backend Integration Resources:**

1. **🏠 [Backend Hub](for-backend/README.md)** - Complete backend integration guide
2. **📋 [API Requirements](for-backend/BACKEND_INTEGRATION_REQUIREMENTS.md)** - Detailed API specifications
3. **🧪 [Testing Procedures](for-backend/api-examples/)** - API testing examples and procedures
4. **📡 [Staging Environment](for-backend/STAGING_ENVIRONMENT_COMPLETION_NOTICE.md)** - Staging setup completion notice
5. **🤝 [Frontend-Backend Coordination](for-backend/STAGING_CORS_UPDATE_REQUEST.md)** - Integration coordination guide

**Environment URLs:**
- **Production**: `https://nna-registry-frontend.vercel.app`
- **Staging**: `https://nna-registry-frontend-stg.vercel.app` 
- **Development**: `https://nna-registry-dev-frontend.vercel.app`

---

### 👋 **For New Team Members**
**Essential Project Understanding:**

1. **📖 [Project Overview](PROJECT_OVERVIEW.md)** - What is the NNA Registry Service?
2. **🏗️ [Architecture Overview](development/ARCHITECTURE.md)** - How the system is structured
3. **🗺️ [Phase 1 Roadmap](MASTER_DEVELOPMENT_ROADMAP.md)** - Current development priorities
4. **📋 [Production Status](PRODUCTION_STATUS.md)** - Current production readiness
5. **⚠️ [Known Issues](KNOWN_ISSUES.md)** - Active issues and workarounds

**Key Technologies:**
- **Frontend**: React 18, TypeScript, Material UI
- **Backend Integration**: REST APIs, JWT authentication
- **Infrastructure**: Vercel (frontend), MongoDB (backend)

---

### 🔍 **For Troubleshooting**
**Common Development Issues:**

1. **🆘 [Troubleshooting Guide](TROUBLESHOOTING.md)** - Common problems and solutions
2. **🏥 [Emergency Procedures](EMERGENCY_PROCEDURES.md)** - Critical issue resolution
3. **📞 [Support Resources](SUPPORT_RESOURCES.md)** - Who to contact for different issues

---

## 🎯 **Phase 1 Parallel Development** (Current Priority)

### **Immediate Focus Areas:**
1. **🏷️ Taxonomy Service Implementation** - 3-week frontend sprint
2. **📊 Management Dashboard Coordination** - Backend API development
3. **🔐 RBAC Integration** - Role-based access control
4. **⚡ Performance Optimization** - Phase 8 enhancements

### **Environment Strategy:**
```
🚀 Production:  Main project, production environment
🧪 Staging:     Dedicated project for safe testing  
⚙️ Development: Main project, preview environment
```

---

## 📁 **Documentation Organization**

### **Current Documentation Structure:**
```
/docs/
├── QUICK_START.md              # This file - role-based navigation
├── CURRENT_STATE.md            # Consolidated current status
├── development/                # Frontend development guides
├── for-backend/               # Backend integration resources
├── taxonomy/                  # Taxonomy system documentation
├── mvp-release-1.0/          # Release documentation
├── archive/                   # Historical documentation
└── sessions/                  # Development session records
```

### **Additional Resources:**
- **📋 [CLAUDE.md](../CLAUDE.md)** - AI development context and project guidelines
- **🏷️ [Taxonomy Service Guidelines](../TAXONOMY_SERVICE_GUIDELINES.md)** - Critical taxonomy implementation reference
- **🧪 [Staging Environment Configuration](../STAGING_ENVIRONMENT_FINAL_CONFIGURATION.md)** - Complete staging setup guide

---

## 💡 **Tips for Success**

### **Development Best Practices:**
- Always use the correct taxonomy service (`enhancedTaxonomyService`)
- Test changes in staging environment before production
- Follow TypeScript strict mode guidelines
- Use environment-aware logging for debugging

### **Getting Help:**
- Check troubleshooting guide first
- Review relevant session documentation in `/docs/sessions/`
- Contact frontend team for UI/component issues
- Contact backend team for API/integration issues

---

## 🚀 **Ready to Start?**

1. **Choose your role path above**
2. **Review the current state documentation**
3. **Set up your development environment**
4. **Join the Phase 1 parallel development effort!**

**Happy coding!** 🎉

---

*Last updated: January 26, 2025*  
*For questions or improvements to this guide, please update this file or contact the development team.*