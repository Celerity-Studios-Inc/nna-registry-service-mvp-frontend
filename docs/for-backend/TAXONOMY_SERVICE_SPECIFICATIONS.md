# Taxonomy Service Backend Implementation Specifications

## Executive Summary

This document provides comprehensive specifications for implementing a **single source of truth taxonomy microservice** that will replace the current flattened taxonomy files used by the frontend. The backend team should implement this as a standalone NestJS microservice with PostgreSQL storage, Redis caching, and RESTful APIs.

---

## 🎯 **Project Overview**

### **Current State Problems**
- Frontend uses flattened JSON/TypeScript files for taxonomy data
- No centralized management or version control
- Inconsistent data across environments
- No real-time updates or sequential numbering
- Difficult to maintain and extend

### **Target Solution**
- Centralized taxonomy microservice as single source of truth
- Real-time API access with caching
- Admin interface for taxonomy management
- Sequential asset numbering service
- Version control and audit trail
- Environment-specific deployment

---

## 🏗️ **Architecture Requirements**

### **Technology Stack**
```typescript
Framework: NestJS (Node.js/TypeScript)
Database: PostgreSQL 14+
Caching: Redis 6+
API Documentation: Swagger/OpenAPI
Authentication: JWT (shared with main backend)
Environment: Docker containerized
Deployment: Google Cloud Run (matching existing pattern)
```

### **Service Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Taxonomy Microservice                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Admin     │  │  Public     │  │    Management       │  │
│  │   API       │  │   API       │  │     API             │  │
│  │             │  │             │  │                     │  │
│  │ - CRUD      │  │ - Read Only │  │ - Version Control   │  │
│  │ - Validation│  │ - Lookups   │  │ - Sequential Nums   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ PostgreSQL  │  │   Redis     │  │    File Storage     │  │
│  │  Database   │  │   Cache     │  │   (Backups/Export)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 **Database Schema Design**

### **Core Tables**

#### **1. taxonomy_nodes**
```sql
CREATE TABLE taxonomy_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer VARCHAR(10) NOT NULL,
  category VARCHAR(50),
  subcategory VARCHAR(50),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  numeric_code VARCHAR(10) NOT NULL,
  parent_id UUID REFERENCES taxonomy_nodes(id),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique paths
  UNIQUE(layer, category, subcategory),
  -- Ensure unique numeric codes per layer
  UNIQUE(layer, numeric_code)
);
```

#### **2. taxonomy_versions**
```sql
CREATE TABLE taxonomy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number INTEGER NOT NULL,
  changelog TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false,
  checksum VARCHAR(64), -- SHA-256 hash of taxonomy data
  
  UNIQUE(version_number)
);
```

#### **3. asset_counters**
```sql
CREATE TABLE asset_counters (
  layer VARCHAR(10) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50) NOT NULL,
  next_number INTEGER DEFAULT 1,
  last_assigned INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (layer, category, subcategory)
);
```

#### **4. taxonomy_audit_log**
```sql
CREATE TABLE taxonomy_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
  table_name VARCHAR(50) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID,
  changed_at TIMESTAMP DEFAULT NOW(),
  change_reason TEXT
);
```

### **Indexes for Performance**
```sql
-- Search and lookup indexes
CREATE INDEX idx_taxonomy_nodes_layer ON taxonomy_nodes(layer);
CREATE INDEX idx_taxonomy_nodes_layer_category ON taxonomy_nodes(layer, category);
CREATE INDEX idx_taxonomy_nodes_layer_category_subcategory ON taxonomy_nodes(layer, category, subcategory);
CREATE INDEX idx_taxonomy_nodes_numeric_code ON taxonomy_nodes(layer, numeric_code);
CREATE INDEX idx_taxonomy_nodes_active ON taxonomy_nodes(is_active);

-- Hierarchy traversal
CREATE INDEX idx_taxonomy_nodes_parent_id ON taxonomy_nodes(parent_id);

-- Audit log indexes
CREATE INDEX idx_audit_log_table_record ON taxonomy_audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON taxonomy_audit_log(changed_at);

-- Counter performance
CREATE INDEX idx_asset_counters_lookup ON asset_counters(layer, category, subcategory);
```

---

## 🔌 **API Specification**

### **Base Configuration**
```typescript
Base URL (Production): https://registry.reviz.dev/api/taxonomy
Base URL (Staging): https://registry.stg.reviz.dev/api/taxonomy
Base URL (Development): https://registry.dev.reviz.dev/api/taxonomy

Authentication: Bearer JWT token (for admin operations)
Content-Type: application/json
API Version: v1 (in URL path)
```

### **Public API Endpoints (No Authentication Required)**

#### **1. Health Check**
```http
GET /api/taxonomy/health

Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production|staging|development",
  "database": "connected",
  "cache": "connected",
  "uptime": 12345
}
```

#### **2. Get Taxonomy Version**
```http
GET /api/taxonomy/version

Response:
{
  "version": 15,
  "lastUpdated": "2025-06-28T10:30:00Z",
  "checksum": "a1b2c3d4e5f6...",
  "totalNodes": 1247
}
```

#### **3. Get Complete Taxonomy Tree**
```http
GET /api/taxonomy/tree

Response:
{
  "version": 15,
  "lastUpdated": "2025-06-28T10:30:00Z",
  "tree": [
    {
      "id": "uuid-here",
      "layer": "S",
      "name": "Stars",
      "description": "Star layer description",
      "numericCode": "2",
      "children": [
        {
          "id": "uuid-here",
          "layer": "S",
          "category": "POP",
          "name": "Pop Stars",
          "numericCode": "001",
          "children": [
            {
              "id": "uuid-here",
              "layer": "S",
              "category": "POP",
              "subcategory": "DIV",
              "name": "Pop_Diva_Female_Stars",
              "numericCode": "001"
            }
          ]
        }
      ]
    }
  ]
}
```

#### **4. Get Layers**
```http
GET /api/taxonomy/layers

Response:
{
  "layers": ["G", "S", "L", "M", "W", "B", "P", "T", "C", "R"],
  "count": 10
}
```

#### **5. Get Categories for Layer**
```http
GET /api/taxonomy/lookup/{layer}/categories

Example: GET /api/taxonomy/lookup/S/categories

Response:
{
  "layer": "S",
  "categories": [
    {
      "code": "POP",
      "name": "Pop Stars",
      "numericCode": "001"
    },
    {
      "code": "HIP",
      "name": "Hip Hop Stars", 
      "numericCode": "002"
    }
  ],
  "count": 2
}
```

#### **6. Get Subcategories for Category**
```http
GET /api/taxonomy/lookup/{layer}/categories/{category}/subcategories

Example: GET /api/taxonomy/lookup/S/categories/POP/subcategories

Response:
{
  "layer": "S",
  "category": "POP",
  "subcategories": [
    {
      "code": "DIV",
      "name": "Pop_Diva_Female_Stars",
      "numericCode": "001"
    },
    {
      "code": "ICM",
      "name": "Pop_Icon_Male_Stars",
      "numericCode": "002"
    }
  ],
  "count": 2
}
```

#### **7. HFN/MFA Conversion**
```http
POST /api/taxonomy/convert/hfn-to-mfa
Content-Type: application/json

Body:
{
  "hfn": "S.POP.DIV.001"
}

Response:
{
  "hfn": "S.POP.DIV.001",
  "mfa": "2.001.001.001",
  "valid": true
}

---

POST /api/taxonomy/convert/mfa-to-hfn
Content-Type: application/json

Body:
{
  "mfa": "2.001.001.001"
}

Response:
{
  "mfa": "2.001.001.001", 
  "hfn": "S.POP.DIV.001",
  "valid": true
}
```

#### **8. Get Next Sequential Number**
```http
POST /api/taxonomy/next-sequence
Content-Type: application/json

Body:
{
  "layer": "S",
  "categoryCode": "POP", 
  "subcategoryCode": "DIV"
}

Response:
{
  "layer": "S",
  "category": "POP",
  "subcategory": "DIV",
  "nextNumber": 42,
  "formattedSequence": "042",
  "reservedUntil": "2025-06-28T10:35:00Z"
}
```

### **Admin API Endpoints (Authentication Required)**

#### **9. Validate Taxonomy**
```http
GET /api/taxonomy/validate
Authorization: Bearer {jwt_token}

Response:
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "Layer W has no subcategories for category BCH"
  ],
  "totalNodes": 1247,
  "validationDate": "2025-06-28T10:30:00Z"
}
```

#### **10. Create/Update Taxonomy Node**
```http
POST /api/taxonomy/nodes
Authorization: Bearer {jwt_token}
Content-Type: application/json

Body:
{
  "layer": "S",
  "category": "POP",
  "subcategory": "NEW",
  "name": "Pop_New_Category",
  "description": "New pop subcategory",
  "numericCode": "010"
}

Response:
{
  "id": "uuid-here",
  "layer": "S",
  "category": "POP", 
  "subcategory": "NEW",
  "name": "Pop_New_Category",
  "numericCode": "010",
  "created": true,
  "version": 16
}

---

PUT /api/taxonomy/nodes/{id}
Authorization: Bearer {jwt_token}
Content-Type: application/json

Body:
{
  "name": "Updated Name",
  "description": "Updated description"
}

Response:
{
  "id": "uuid-here",
  "updated": true,
  "version": 16,
  "changelog": "Updated name and description for S.POP.NEW"
}
```

#### **11. Delete Taxonomy Node**
```http
DELETE /api/taxonomy/nodes/{id}
Authorization: Bearer {jwt_token}

Response:
{
  "id": "uuid-here",
  "deleted": true,
  "version": 16,
  "affectedAssets": 0,
  "changelog": "Deleted S.POP.NEW taxonomy node"
}
```

#### **12. Bulk Import/Export**
```http
POST /api/taxonomy/import
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data

Body: taxonomy.json file upload

Response:
{
  "imported": true,
  "nodesCreated": 150,
  "nodesUpdated": 25,
  "errors": [],
  "newVersion": 17
}

---

GET /api/taxonomy/export
Authorization: Bearer {jwt_token}

Response: taxonomy.json file download
```

---

## 📦 **Data Migration Strategy**

### **Phase 1: Data Extraction (Week 1)**
1. **Extract Current Taxonomy Data**
   ```bash
   # Frontend provides current flattened taxonomy files
   /src/taxonomyLookup/constants.ts
   /src/taxonomyLookup/flattened_taxonomy/
   ```

2. **Create Migration Scripts**
   ```typescript
   // migration-scripts/extract-taxonomy.ts
   // Convert flattened files to database records
   // Ensure data consistency and validation
   ```

### **Phase 2: Database Setup (Week 1)**
1. **Deploy PostgreSQL databases** for all environments
2. **Run schema migrations** to create tables and indexes
3. **Import extracted taxonomy data** with validation
4. **Set up Redis caching** for performance

### **Phase 3: API Development (Weeks 2-3)**
1. **Implement NestJS microservice** with all specified endpoints
2. **Add comprehensive testing** (unit, integration, e2e)
3. **Deploy to all environments** (dev, staging, production)
4. **Verify API functionality** with provided test scripts

### **Phase 4: Frontend Integration (Week 3)**
1. **Frontend switches to API calls** using feature flags
2. **Gradual rollout** with fallback to flattened files
3. **Performance monitoring** and optimization
4. **Remove flattened files** after successful migration

---

## 🔧 **Implementation Details**

### **Environment Configuration**
```typescript
// Environment variables required
TAXONOMY_DB_HOST=postgresql-host
TAXONOMY_DB_PORT=5432
TAXONOMY_DB_NAME=taxonomy_db
TAXONOMY_DB_USER=taxonomy_user
TAXONOMY_DB_PASSWORD=secure_password

TAXONOMY_REDIS_HOST=redis-host
TAXONOMY_REDIS_PORT=6379
TAXONOMY_REDIS_PASSWORD=redis_password

TAXONOMY_JWT_SECRET=shared_jwt_secret
TAXONOMY_CORS_ORIGINS=https://nna-registry-frontend.vercel.app

TAXONOMY_CACHE_TTL_LAYERS=3600000    # 1 hour
TAXONOMY_CACHE_TTL_CATEGORIES=1800000 # 30 minutes
TAXONOMY_CACHE_TTL_SUBCATEGORIES=900000 # 15 minutes
```

### **Caching Strategy**
```typescript
// Redis cache keys
layers:all
categories:{layer}
subcategories:{layer}:{category}
version:current
tree:full
conversion:hfn:{hfn}
conversion:mfa:{mfa}

// Cache invalidation triggers
- Taxonomy node create/update/delete
- Version update
- Manual cache clear via admin API
```

### **Error Handling**
```typescript
// Standardized error responses
{
  "error": {
    "code": "TAXONOMY_NOT_FOUND",
    "message": "Taxonomy node not found for S.POP.INVALID",
    "timestamp": "2025-06-28T10:30:00Z",
    "requestId": "uuid-here"
  }
}

// Error codes
TAXONOMY_NOT_FOUND
INVALID_TAXONOMY_PATH
DUPLICATE_NUMERIC_CODE
VALIDATION_FAILED
DATABASE_ERROR
CACHE_ERROR
UNAUTHORIZED
FORBIDDEN
```

### **Performance Requirements**
```typescript
// Response time targets
Health check: < 50ms
Layer lookup: < 100ms
Category lookup: < 150ms
Subcategory lookup: < 200ms
HFN/MFA conversion: < 100ms
Next sequence: < 300ms

// Throughput targets
1000 requests/second for read operations
100 requests/second for write operations
99.9% uptime across all environments
```

---

## 🧪 **Testing Requirements**

### **Unit Tests**
- All service methods with 90%+ coverage
- Database operations with mocked connections
- Cache operations with Redis mock
- Validation logic with edge cases

### **Integration Tests**
- API endpoints with real database
- Cache integration with Redis
- Authentication and authorization
- Error handling and edge cases

### **Performance Tests**
- Load testing with 1000 concurrent users
- Response time validation
- Memory usage and leak detection
- Database query optimization

### **Test Data**
```typescript
// Provide test datasets for all environments
test-taxonomy-minimal.json    // 50 nodes for unit tests
test-taxonomy-standard.json   // 500 nodes for integration tests
test-taxonomy-full.json       // 1500 nodes for performance tests
```

---

## 📋 **Acceptance Criteria**

### **Functional Requirements**
- [ ] All API endpoints implemented and documented
- [ ] Database schema deployed to all environments
- [ ] Data migration completed successfully
- [ ] Cache integration working correctly
- [ ] Admin operations require authentication
- [ ] Sequential numbering generates unique IDs
- [ ] HFN/MFA conversion maintains accuracy

### **Non-Functional Requirements**
- [ ] Response times meet specified targets
- [ ] 99.9% uptime across all environments
- [ ] Comprehensive error handling and logging
- [ ] Security best practices implemented
- [ ] Documentation complete and accurate
- [ ] Monitoring and alerting configured

### **Integration Requirements**
- [ ] Frontend successfully switches to API calls
- [ ] Existing functionality maintained during migration
- [ ] Performance improvement over flattened files
- [ ] Real-time updates work correctly
- [ ] Environment isolation maintained

---

## 🚀 **Deployment Plan**

### **Week 1: Infrastructure Setup**
- Deploy PostgreSQL databases (dev, staging, prod)
- Deploy Redis cache instances
- Set up monitoring and logging
- Run database migrations

### **Week 2: Service Development**
- Implement NestJS microservice
- Deploy to development environment
- Run comprehensive testing
- Performance optimization

### **Week 3: Integration & Rollout**
- Deploy to staging environment
- Frontend integration testing
- Deploy to production environment
- Monitor performance and stability

### **Week 4: Migration Completion**
- Complete data validation
- Remove deprecated flattened files
- Documentation updates
- Performance review and optimization

---

## 📞 **Support & Communication**

### **Frontend Integration Support**
The frontend team has already implemented:
- `apiTaxonomyService.ts` - Direct API integration
- `taxonomyServiceAdapter.ts` - Migration adapter with fallbacks
- Feature flags for gradual rollout
- Performance monitoring and metrics

### **Required Backend Deliverables**
1. **NestJS microservice** implementing all specified APIs
2. **Database migrations** for PostgreSQL schema
3. **Docker containers** for deployment
4. **API documentation** with Swagger/OpenAPI
5. **Test suite** with comprehensive coverage
6. **Environment configurations** for dev/staging/prod
7. **Monitoring setup** with health checks and metrics

### **Success Metrics**
- **Performance**: 50% faster taxonomy lookups vs flattened files
- **Reliability**: 99.9% uptime with zero data loss
- **Scalability**: Support 10x current taxonomy complexity
- **Maintainability**: Admin interface reduces taxonomy updates from hours to minutes

---

**This taxonomy service will establish the foundation for the NNA Registry Platform's scalability and provide the single source of truth needed for enterprise-grade operations.**

---

**Document Created**: June 28, 2025  
**Version**: 1.0  
**Next Review**: After Phase 1 completion  
**Frontend Integration**: Ready and waiting for backend implementation