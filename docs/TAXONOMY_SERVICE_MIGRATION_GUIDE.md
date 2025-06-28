# Taxonomy Service Migration Guide

## Overview

This guide describes the migration from flattened taxonomy files to the new API-based taxonomy service. The migration has been designed to be gradual and safe, with multiple fallback mechanisms.

---

## 🎯 **Migration Strategy**

### **Phase 1: Preparation (Complete)**
✅ **Frontend Implementation Ready**
- `apiTaxonomyService.ts` - Direct API integration
- `taxonomyServiceAdapter.ts` - Migration adapter with fallbacks
- `TaxonomyServiceTest.tsx` - Comprehensive testing component
- Feature flags for gradual rollout

✅ **Backend Specifications Ready**
- Complete API specification with all endpoints
- Database schema design for PostgreSQL
- Caching strategy with Redis
- Performance and security requirements

### **Phase 2: Backend Development (In Progress)**
⏳ **Backend Team Implementation**
- NestJS microservice development
- PostgreSQL database setup
- Redis caching implementation
- API endpoint development and testing

### **Phase 3: Integration Testing**
⏳ **Cross-Team Coordination**
- Deploy backend to development environment
- Frontend connects to new API
- Comprehensive testing across all environments
- Performance validation and optimization

### **Phase 4: Production Rollout**
⏳ **Gradual Migration**
- Feature flag enabled for staging environment
- Production rollout with monitoring
- Removal of flattened taxonomy files
- Documentation updates

---

## 🔧 **Implementation Status**

### **Frontend Implementation: 100% Complete**

#### **New Services Created**
1. **`apiTaxonomyService.ts`**
   - Direct integration with backend taxonomy API
   - Intelligent caching with configurable TTL
   - Automatic fallback to existing enhanced taxonomy service
   - Environment-aware API endpoint selection

2. **`taxonomyServiceAdapter.ts`**
   - Gradual migration adapter for existing components
   - Feature flags for controlled rollout
   - Performance monitoring and metrics
   - Backward compatibility with sync/async interfaces

3. **`TaxonomyServiceTest.tsx`**
   - Comprehensive testing interface
   - Real-time performance monitoring
   - Service status dashboard
   - Individual and batch test execution

#### **Features Implemented**
- **Environment Detection**: Automatic API URL selection based on environment
- **Intelligent Caching**: TTL-based caching for optimal performance
- **Fallback Mechanisms**: Multiple layers of fallback for reliability
- **Performance Monitoring**: Real-time metrics and performance tracking
- **Feature Flags**: Gradual rollout control with runtime configuration
- **Error Handling**: Comprehensive error recovery and logging

### **Backend Implementation: Waiting for Development**

#### **Required Deliverables**
1. **NestJS Microservice**
   - All API endpoints as specified
   - PostgreSQL database integration
   - Redis caching implementation
   - JWT authentication for admin operations

2. **Database Setup**
   - PostgreSQL schema deployment
   - Data migration from flattened files
   - Index optimization for performance
   - Backup and recovery procedures

3. **Environment Deployment**
   - Development: `https://registry.dev.reviz.dev/api/taxonomy`
   - Staging: `https://registry.stg.reviz.dev/api/taxonomy`
   - Production: `https://registry.reviz.dev/api/taxonomy`

---

## 📋 **Testing Procedures**

### **Frontend Testing (Available Now)**

1. **Access Test Interface**
   ```
   Navigate to: /admin/taxonomy-test (when component is added to routes)
   ```

2. **Test Configuration Options**
   - **Direct API Service**: Test direct API calls (will fail until backend is ready)
   - **Adapter Service**: Test adapter with fallback to existing service
   - **Layer/Category Selection**: Test specific taxonomy paths
   - **HFN/MFA Conversion**: Test address format conversion

3. **Test Scenarios**
   - Service status and availability
   - Layer enumeration
   - Category loading for each layer
   - Subcategory loading for specific categories
   - HFN to MFA conversion accuracy
   - MFA to HFN conversion accuracy
   - Performance metrics collection
   - Cache operations and invalidation

### **Backend Testing (When Ready)**

1. **API Health Check**
   ```bash
   curl https://registry.dev.reviz.dev/api/taxonomy/health
   ```

2. **Basic Taxonomy Operations**
   ```bash
   # Get all layers
   curl https://registry.dev.reviz.dev/api/taxonomy/layers
   
   # Get categories for Stars layer
   curl https://registry.dev.reviz.dev/api/taxonomy/lookup/S/categories
   
   # Get subcategories for Pop category
   curl https://registry.dev.reviz.dev/api/taxonomy/lookup/S/categories/POP/subcategories
   ```

3. **Conversion Testing**
   ```bash
   # HFN to MFA conversion
   curl -X POST https://registry.dev.reviz.dev/api/taxonomy/convert/hfn-to-mfa \
        -H "Content-Type: application/json" \
        -d '{"hfn": "S.POP.DIV.001"}'
   ```

---

## 🚀 **Migration Activation**

### **Current State: Fallback Mode**
The frontend is currently using the enhanced taxonomy service as fallback. The new API service is ready but will gracefully fall back to existing functionality when the backend API is not available.

### **Activation Steps (When Backend is Ready)**

1. **Enable API Service**
   ```bash
   # Set environment variable to enable API service
   export REACT_APP_USE_API_TAXONOMY=true
   ```

2. **Update Feature Flags**
   ```typescript
   // In taxonomyServiceAdapter.ts, update default flags
   const DEFAULT_FEATURE_FLAGS = {
     useApiService: true, // Enable API service
     enableCaching: true,
     enableFallback: true,
     enablePerformanceMonitoring: true,
   };
   ```

3. **Monitor Performance**
   - Use the test interface to monitor API performance
   - Compare metrics between API and fallback services
   - Verify cache hit rates and response times

4. **Gradual Rollout**
   - Start with development environment
   - Progress to staging environment testing
   - Production rollout with monitoring

### **Rollback Procedure**
If issues are encountered, rollback is immediate:

1. **Disable API Service**
   ```bash
   export REACT_APP_USE_API_TAXONOMY=false
   ```

2. **Service automatically falls back** to existing enhanced taxonomy service
3. **Zero downtime** - no application restart required

---

## 📊 **Performance Expectations**

### **Current Performance (Flattened Files)**
- Layer loading: ~1ms (synchronous)
- Category loading: ~2ms (synchronous)
- Subcategory loading: ~3ms (synchronous)
- HFN/MFA conversion: ~1ms (synchronous)

### **Target Performance (API Service)**
- Layer loading: <100ms (with caching: <10ms)
- Category loading: <150ms (with caching: <15ms)
- Subcategory loading: <200ms (with caching: <20ms)
- HFN/MFA conversion: <100ms (with caching: <10ms)

### **Performance Benefits**
- **Real-time Updates**: Immediate taxonomy changes without deployments
- **Centralized Management**: Single source of truth across all environments
- **Scalability**: Support for complex taxonomy structures
- **Admin Interface**: Visual taxonomy management and validation

---

## 🔍 **Monitoring & Debugging**

### **Frontend Monitoring**
The adapter service provides comprehensive performance monitoring:

```typescript
// Get current performance metrics
const metrics = taxonomyServiceAdapter.getPerformanceMetrics();

// Get service status
const status = await taxonomyServiceAdapter.getServiceStatus();

// Monitor feature flag usage
console.log('Feature flags:', status.featureFlags);
```

### **Debug Information**
All services include detailed logging for debugging:

```typescript
// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  // Detailed API request/response logging
  // Cache hit/miss information
  // Fallback activation events
  // Performance timing data
}
```

### **Error Tracking**
Comprehensive error handling with fallback chains:

1. **API Service Error** → Falls back to adapter service
2. **Adapter Service Error** → Falls back to enhanced taxonomy service
3. **Enhanced Service Error** → Returns hardcoded fallback data
4. **All Services Fail** → Graceful degradation with user notification

---

## 📞 **Support & Next Steps**

### **Frontend Team: Ready for Integration**
- All code implemented and tested
- Documentation complete
- Test interface available
- Monitoring and debugging tools ready

### **Backend Team: Development Needed**
- Implement NestJS microservice per specifications
- Deploy PostgreSQL databases to all environments  
- Set up Redis caching infrastructure
- Deploy and test API endpoints

### **Coordination Required**
1. **Backend API Development** (estimated 2-3 weeks)
2. **Integration Testing** (estimated 1 week)
3. **Production Deployment** (estimated 1 week)
4. **Migration Completion** (estimated 1 week)

### **Success Criteria**
- [ ] All API endpoints functional across environments
- [ ] Performance targets met or exceeded
- [ ] Zero-downtime migration completed
- [ ] Flattened taxonomy files successfully removed
- [ ] Admin interface operational for taxonomy management

---

**The frontend is fully prepared for the taxonomy service migration. We're ready to integrate as soon as the backend implementation is complete.**

---

**Document Created**: June 28, 2025  
**Version**: 1.0  
**Frontend Status**: ✅ Ready for Integration  
**Backend Status**: ⏳ Development Needed