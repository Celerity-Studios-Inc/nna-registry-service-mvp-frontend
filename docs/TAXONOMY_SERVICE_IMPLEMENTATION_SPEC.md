# Taxonomy Service Implementation Specification

## 🎯 **Executive Summary**
Comprehensive specification for implementing the standalone Taxonomy Service as Phase 1 of the Master Development Roadmap. This service will serve as the single source of truth for taxonomy data, eliminating frontend-backend drift and enabling real-time updates.

**Priority**: ✅ **Phase 1, Critical Infrastructure**  
**Timeline**: Weeks 1-3 of Master Development Roadmap  
**Dependencies**: Three-environment alignment (✅ Complete)

---

## 🏗️ **Service Architecture**

### **Technology Stack**
```typescript
Framework: NestJS (TypeScript)
Database: PostgreSQL 14+ with JSONB support
Cache: Redis 6+ for high-performance lookups
API: RESTful with OpenAPI 3.0 documentation
Admin UI: React 18 with TypeScript + Material-UI
Authentication: JWT with role-based access control
Deployment: Docker containers across three environments
```

### **Microservice Design Principles**
- ✅ **Single Responsibility**: Taxonomy data management only
- ✅ **Environment Agnostic**: Same service across dev/staging/prod
- ✅ **API-First Design**: RESTful endpoints with comprehensive documentation
- ✅ **Database Independence**: Separate from main application database
- ✅ **Caching Strategy**: Redis for sub-50ms lookup performance
- ✅ **Version Control**: Built-in versioning and rollback capabilities

---

## 📊 **Database Schema Design**

### **PostgreSQL Tables**

```sql
-- Core taxonomy nodes
CREATE TABLE taxonomy_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layer VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL, -- Short code (e.g., 'POP', 'BAS')
    name VARCHAR(100) NOT NULL, -- Display name (e.g., 'Pop Music', 'Base')
    description TEXT,
    numeric_code INTEGER, -- For MFA generation
    aliases JSONB DEFAULT '[]', -- Alternative names/codes
    metadata JSONB DEFAULT '{}', -- Extensible metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Ensure unique combinations
    UNIQUE(layer, category, subcategory),
    UNIQUE(layer, code) -- Layer-specific unique codes
);

-- Version tracking for audit trail
CREATE TABLE taxonomy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_number INTEGER NOT NULL,
    operation VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID, -- User ID from main application
    changed_at TIMESTAMP DEFAULT NOW(),
    rollback_data JSONB -- Data needed for rollback
);

-- Sequential asset counters
CREATE TABLE asset_counters (
    layer VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50) NOT NULL,
    next_number INTEGER DEFAULT 1,
    last_assigned INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY (layer, category, subcategory)
);

-- Flattened lookup cache (for performance)
CREATE TABLE taxonomy_lookup_cache (
    cache_key VARCHAR(100) PRIMARY KEY, -- 'layer:LAYER_CODE'
    lookup_data JSONB NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP -- TTL for cache invalidation
);

-- Indexes for performance
CREATE INDEX idx_taxonomy_nodes_layer ON taxonomy_nodes(layer);
CREATE INDEX idx_taxonomy_nodes_category ON taxonomy_nodes(layer, category);
CREATE INDEX idx_taxonomy_nodes_active ON taxonomy_nodes(is_active);
CREATE INDEX idx_taxonomy_nodes_code ON taxonomy_nodes(layer, code);
CREATE INDEX idx_versions_operation ON taxonomy_versions(operation, changed_at);
CREATE INDEX idx_versions_record ON taxonomy_versions(table_name, record_id);
```

### **Redis Cache Structure**
```typescript
// Cache keys and data structure
Cache Keys:
- taxonomy:lookup:{layer} → Flattened lookup data for layer
- taxonomy:tree:full → Complete nested taxonomy tree
- taxonomy:version → Current version info
- taxonomy:counters → Asset counter data

TTL Strategy:
- Lookup data: 1 hour (refreshed on updates)
- Full tree: 6 hours (refreshed on updates)  
- Version info: 24 hours
- Counters: No TTL (updated immediately)
```

---

## 🌐 **API Endpoints Specification**

### **Public Endpoints (No Auth Required)**

#### **Taxonomy Browsing**
```typescript
GET /api/taxonomy/health
Response: { status: "healthy", version: "1.0.0", environment: "production" }

GET /api/taxonomy/version
Response: { 
  version: 5, 
  lastUpdate: "2025-06-25T21:30:00Z",
  totalNodes: 150,
  lastChangedBy: "system"
}

GET /api/taxonomy/tree
Response: {
  layers: {
    "S": {
      name: "Songs",
      categories: {
        "POP": {
          name: "Pop Music",
          subcategories: {
            "BAS": { name: "Base", code: "BAS", numericCode: 1 },
            "EXP": { name: "Experimental", code: "EXP", numericCode: 2 }
          }
        }
      }
    }
  }
}

GET /api/taxonomy/lookup/:layer
Response: [
  { layer: "S", category: "POP", subcategory: "BAS", code: "POP.BAS", name: "Pop Music - Base", numericCode: 1 },
  { layer: "S", category: "POP", subcategory: "EXP", code: "POP.EXP", name: "Pop Music - Experimental", numericCode: 2 }
]

GET /api/taxonomy/layers
Response: [
  { code: "S", name: "Songs", description: "Musical compositions and audio tracks" },
  { code: "L", name: "Looks", description: "Visual styles and fashion assets" }
]

GET /api/taxonomy/categories/:layer
Response: [
  { code: "POP", name: "Pop Music", layer: "S", numericCode: 1 },
  { code: "HIP", name: "Hip Hop", layer: "S", numericCode: 2 }
]

GET /api/taxonomy/subcategories/:layer/:category
Response: [
  { code: "BAS", name: "Base", category: "POP", layer: "S", numericCode: 1 },
  { code: "EXP", name: "Experimental", category: "POP", layer: "S", numericCode: 2 }
]
```

#### **Sequential Numbering**
```typescript
POST /api/taxonomy/next-sequence
Body: { layer: "S", category: "POP", subcategory: "BAS" }
Response: { 
  nextNumber: 42,
  fullCode: "S.POP.BAS.042",
  reserved: true,
  reservationExpires: "2025-06-25T22:00:00Z"
}

POST /api/taxonomy/confirm-sequence
Body: { layer: "S", category: "POP", subcategory: "BAS", number: 42 }
Response: { confirmed: true, finalCode: "S.POP.BAS.042" }
```

### **Admin Endpoints (Auth Required)**

#### **Taxonomy Management**
```typescript
POST /api/taxonomy/nodes
Headers: { Authorization: "Bearer <jwt_token>" }
Body: {
  layer: "S",
  category: "NEW",
  subcategory: "BAS", 
  code: "NEW",
  name: "New Category",
  description: "Description here",
  numericCode: 10
}
Response: { id: "uuid", created: true, version: 6 }

PUT /api/taxonomy/nodes/:id
Headers: { Authorization: "Bearer <jwt_token>" }
Body: { name: "Updated Name", description: "Updated description" }
Response: { id: "uuid", updated: true, version: 7 }

DELETE /api/taxonomy/nodes/:id
Headers: { Authorization: "Bearer <jwt_token>" }
Response: { id: "uuid", deleted: true, version: 8 }
```

#### **Version Control**
```typescript
GET /api/taxonomy/history?limit=50&offset=0
Headers: { Authorization: "Bearer <jwt_token>" }
Response: {
  versions: [
    {
      version: 7,
      operation: "UPDATE",
      tableName: "taxonomy_nodes",
      recordId: "uuid",
      changedBy: "user@example.com",
      changedAt: "2025-06-25T21:30:00Z",
      changes: { name: { old: "Old Name", new: "New Name" } }
    }
  ],
  total: 150,
  page: 1
}

POST /api/taxonomy/rollback
Headers: { Authorization: "Bearer <jwt_token>" }
Body: { toVersion: 5, reason: "Fixing incorrect category name" }
Response: { 
  rolledBack: true, 
  fromVersion: 7, 
  toVersion: 5,
  affectedRecords: 3 
}
```

#### **Cache Management**
```typescript
POST /api/taxonomy/cache/refresh
Headers: { Authorization: "Bearer <jwt_token>" }
Response: { refreshed: true, keys: ["taxonomy:lookup:S", "taxonomy:tree:full"] }

GET /api/taxonomy/cache/status
Headers: { Authorization: "Bearer <jwt_token>" }
Response: {
  redis: { connected: true, keys: 15, memory: "2.5MB" },
  postgres: { connected: true, totalRecords: 150 },
  lastRefresh: "2025-06-25T21:00:00Z"
}
```

---

## 🖥️ **Admin Interface Specification**

### **React Admin Dashboard Architecture**
```typescript
Framework: React 18 + TypeScript
UI Library: Material-UI v5
State Management: React Query + Zustand
Routing: React Router v6
Authentication: JWT with automatic refresh
Forms: React Hook Form with Yup validation
```

### **Dashboard Features**

#### **1. Taxonomy Browser**
- **Tree View**: Expandable layer → category → subcategory hierarchy
- **Search**: Real-time search across all taxonomy nodes
- **Filtering**: Filter by layer, active status, recent changes
- **Quick Actions**: Add, edit, delete nodes with inline editing

#### **2. Taxonomy Editor**
- **Form-based Editing**: Comprehensive forms for adding/editing nodes
- **Validation**: Client-side and server-side validation
- **Preview**: Live preview of changes before committing
- **Bulk Operations**: Import/export, bulk updates

#### **3. Version Control Interface**
- **History Timeline**: Visual timeline of all changes
- **Diff Viewer**: Side-by-side comparison of changes
- **Rollback Interface**: Easy rollback with confirmation dialogs
- **User Activity**: Track changes by user with timestamps

#### **4. Performance Dashboard**
- **Cache Status**: Redis connection, memory usage, hit rates
- **API Metrics**: Response times, request counts, error rates
- **Database Health**: Connection status, query performance
- **Sequential Numbers**: Counter status and usage statistics

#### **5. Import/Export Tools**
- **JSON Import**: Upload and validate taxonomy JSON files
- **Export Options**: Export full taxonomy or specific layers
- **Migration Tools**: Migrate from existing taxonomy files
- **Backup/Restore**: Automated backup and restore capabilities

---

## 🔄 **Migration Strategy**

### **Phase 1: Service Setup (Week 1)**
```typescript
Tasks:
1. Set up NestJS microservice with PostgreSQL + Redis
2. Implement core database schema and migrations
3. Create basic CRUD operations for taxonomy nodes
4. Set up health endpoints and basic monitoring
5. Deploy to development environment

Deliverables:
- Working Taxonomy Service in development
- Basic API endpoints operational
- Database schema implemented
- Health monitoring functional
```

### **Phase 2: Core Features (Week 2)**
```typescript
Tasks:
1. Implement lookup generation and caching
2. Add sequential numbering service
3. Create version control and audit trail
4. Build admin interface foundation
5. Deploy to staging environment

Deliverables:
- Complete API functionality
- Redis caching operational  
- Version control system working
- Basic admin interface
- Staging deployment successful
```

### **Phase 3: Frontend Integration (Week 3)**
```typescript
Tasks:
1. Complete admin interface features
2. Migrate frontend to use Taxonomy Service APIs
3. Migrate backend to use Taxonomy Service APIs
4. Performance testing and optimization
5. Deploy to production environment

Deliverables:
- Full admin interface complete
- Frontend using Taxonomy Service
- Backend using Taxonomy Service
- Performance targets met
- Production deployment successful
```

---

## 🔐 **Authentication & Authorization**

### **JWT Integration**
```typescript
// Integration with main application auth system
Authentication:
- Use existing JWT tokens from main application
- Validate tokens against main application's auth service
- Extract user roles and permissions from JWT claims

Authorization Levels:
- taxonomy:read → Public endpoints
- taxonomy:write → Admin CRUD operations  
- taxonomy:admin → Version control, cache management
- taxonomy:super → Rollback, system administration

Role Mapping:
- Administrator → taxonomy:super
- Curator → taxonomy:admin
- Editor → taxonomy:write  
- Creator → taxonomy:read
```

### **Security Measures**
```typescript
Input Validation:
- All inputs sanitized and validated
- SQL injection prevention with parameterized queries
- XSS prevention with output encoding
- Rate limiting on API endpoints

Data Protection:
- Encrypted database connections
- Redis AUTH for cache access
- Audit trail for all changes
- Backup encryption at rest
```

---

## 📈 **Performance Requirements**

### **Response Time Targets**
```typescript
Lookup Endpoints: < 50ms (p95)
Tree Endpoints: < 100ms (p95)  
Admin Operations: < 200ms (p95)
Sequential Numbers: < 100ms (p95)
Cache Refresh: < 500ms (p95)
```

### **Scalability Targets**
```typescript
Concurrent Users: 1000+
Requests per Second: 5000+
Database Records: 10,000+ taxonomy nodes
Cache Memory: < 100MB Redis usage
Uptime: 99.9% availability
```

### **Monitoring & Alerting**
```typescript
Health Checks:
- Database connectivity
- Redis connectivity  
- API response times
- Cache hit rates
- Error rates

Alerts:
- Response time > 200ms (p95)
- Error rate > 1%
- Database connection failures
- Redis memory usage > 80%
- Cache miss rate > 20%
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- ✅ Service layer business logic
- ✅ Database operations and migrations
- ✅ Cache management functions
- ✅ API endpoint handlers
- ✅ Authentication and authorization

### **Integration Tests**  
- ✅ Database + Redis integration
- ✅ API endpoint full workflow tests
- ✅ Authentication flow testing
- ✅ Version control operations
- ✅ Sequential numbering accuracy

### **End-to-End Tests**
- ✅ Admin interface workflows
- ✅ Frontend integration scenarios
- ✅ Backend integration scenarios
- ✅ Performance testing
- ✅ Load testing with concurrent users

---

## 🚀 **Deployment Strategy**

### **Environment Configuration**
```typescript
Development:
- Local PostgreSQL + Redis
- Hot reload enabled
- Debug logging
- Test data seeded

Staging:  
- Cloud PostgreSQL + Redis
- Production-like configuration
- Info-level logging
- Production data subset

Production:
- High-availability PostgreSQL + Redis
- Performance optimized
- Warn-level logging  
- Full production data
```

### **CI/CD Integration**
```typescript
Pipeline:
1. Unit tests + linting
2. Integration tests
3. Build Docker image
4. Deploy to development (auto)
5. Deploy to staging (auto on merge)
6. Deploy to production (manual approval)

Monitoring:
- Health check verification post-deployment
- Performance monitoring
- Error rate monitoring
- Automatic rollback on failure
```

---

## 📋 **Success Criteria**

### **Technical Metrics**
- ✅ All API endpoints responding within performance targets
- ✅ Cache hit rate > 95% for lookup operations
- ✅ Zero data inconsistencies between cache and database
- ✅ 100% test coverage for critical business logic
- ✅ All three environments deployed and operational

### **Integration Metrics**
- ✅ Frontend successfully migrated to Taxonomy Service
- ✅ Backend successfully migrated to Taxonomy Service  
- ✅ Zero taxonomy-related bugs in existing functionality
- ✅ Admin interface fully functional for taxonomy management
- ✅ Version control and rollback capabilities verified

### **Operational Metrics**
- ✅ 99.9% uptime across all environments
- ✅ Response times meeting all performance targets
- ✅ Monitoring and alerting operational
- ✅ Documentation complete and accessible
- ✅ Team trained on new service operations

---

## 🎯 **Coordination with Backend Team**

### **Shared Responsibilities**
- **RBAC Design**: Coordinate role definitions and permissions
- **Authentication**: Ensure JWT token compatibility
- **API Standards**: Align on REST API patterns and documentation
- **Monitoring**: Share monitoring and alerting strategies

### **Dependencies & Interfaces**
- **User Management**: Taxonomy Service will validate JWTs against main app
- **Audit Logging**: Coordinate audit trail strategies
- **Database Strategy**: Learn from management dashboard database choices
- **Deployment Pipeline**: Share Docker and deployment patterns

---

**This specification provides the complete blueprint for implementing the Taxonomy Service as Phase 1 of our Master Development Roadmap. Ready to begin implementation! 🚀**

**Next Step**: Begin Phase 1 development while coordinating with backend team on management dashboard RBAC design.