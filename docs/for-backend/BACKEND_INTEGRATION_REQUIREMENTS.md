# Backend Integration Requirements - MVP Release 1.0

## 🔴 **Critical Issues Requiring Backend Fixes**

### 1. **Subcategory Override Issue** - HIGHEST PRIORITY

**Problem**: Backend consistently overrides user-selected subcategories with "Base" (BAS) regardless of frontend selection.

**Evidence**:
```javascript
// Frontend sends:
{
  "layer": "S",
  "category": "DNC", 
  "subcategory": "EXP",  // User selected "Experimental"
  "name": "BW.S1.L2"
}

// Backend returns:
{
  "layer": "S",
  "category": "Dance_Electronic",
  "subcategory": "Base",    // Changed to "Base"!
  "name": "S.DNC.BAS.004"
}
```

**Root Cause**: Incomplete subcategory mapping system in backend taxonomy validation.

**Frontend Workaround**: `SubcategoryDiscrepancyAlert` component warns users about the discrepancy.

**Backend Solution Required**:
1. **Complete Subcategory Mapping Tables**: Extend mapping for all layer/category combinations
2. **Preserve User Selection**: Don't default to "Base" when mapping exists
3. **Validation Logic**: Proper subcategory validation instead of fallback override

**Impact**: ❌ Users cannot create assets with intended subcategories, affecting asset organization and searchability.

### 2. **Search Data Staleness** - HIGH PRIORITY

**Problem**: Search returns inconsistent results, some terms return 0 results despite recent usage.

**Evidence**:
- Search for "young": 0 results
- Search for "olivia": 14 results  
- Search for "nike": 4 results

**Backend Issues**:
1. **Search Index**: Not updating in real-time
2. **Data Caching**: Stale data being served
3. **Tag Indexing**: Recent tags not included in search

**Frontend Mitigation**: Cache-busting headers implemented but not sufficient.

**Backend Solution Required**:
1. **Real-time Indexing**: Update search index on asset creation
2. **Cache Management**: Proper cache invalidation strategies
3. **Search API Optimization**: Consistent search result freshness

**Impact**: ⚠️ Users cannot find recently created assets, poor search experience.

### 3. **Component Rights Verification** - MEDIUM PRIORITY

**Problem**: Composite asset workflow missing rights verification for selected components.

**Current State**: Frontend bypasses rights checking due to missing backend endpoint.

**Code Location**: 
```javascript
// In CompositeAssetSelection.tsx
const verifyComponentRights = async (components: any[]) => {
  // TODO: Backend endpoint not available
  return { success: true, warnings: [] };
};
```

**Backend Solution Required**:
1. **Rights Verification Endpoint**: `/api/components/verify-rights`
2. **Usage Rights Check**: Validate user can use selected components in composite
3. **Permission Matrix**: Define component usage permissions per user/role

**Impact**: ⚠️ Potential rights violations in composite asset creation.

## ✅ **Working Backend Integrations**

### Asset Creation API
- **Endpoint**: `POST /api/assets`
- **Status**: ✅ Working correctly
- **FormData**: Proper file upload handling
- **Components**: Composite asset component data properly received

### Asset Search API  
- **Endpoint**: `GET /api/assets`
- **Status**: ✅ Basic functionality working
- **Pagination**: Backend pagination working
- **Filtering**: Layer/category filtering functional

### Authentication API
- **Endpoints**: Login/logout/token validation
- **Status**: ✅ Working correctly
- **JWT Tokens**: Proper token management
- **User Context**: User data properly returned

## 📋 **Backend API Enhancements Needed**

### 1. **Enhanced Search API**

**Current**: Basic search with limited parameters
**Needed**: Advanced search capabilities

```javascript
// Proposed enhanced search parameters
GET /api/assets?search=query&layer=S&category=Pop&subcategory=Base&tags=young,trending&dateRange=2025-01-01,2025-01-31&sortBy=createdAt&sortOrder=desc&page=1&limit=12
```

**Features Required**:
- **Tag-based search**: Search by multiple tags
- **Date range filtering**: Created/updated date ranges
- **Advanced sorting**: Multiple sort criteria
- **Real-time indexing**: Immediate search availability

### 2. **Notifications API**

**Current**: No notifications system
**Needed**: User notification management

```javascript
// Proposed notifications endpoints
GET /api/notifications          // Get user notifications
POST /api/notifications/read    // Mark as read
DELETE /api/notifications/:id   // Delete notification
```

**Features Required**:
- **Asset Creation Notifications**: Notify on successful uploads
- **System Notifications**: Maintenance, updates
- **User Preferences**: Notification settings

### 3. **User Settings API**

**Current**: No user settings management
**Needed**: User preference storage

```javascript
// Proposed settings endpoints
GET /api/user/settings          // Get user settings
PUT /api/user/settings          // Update settings
```

**Settings Schema**:
```javascript
{
  "filters": {
    "excludeTestTags": false,
    "excludeTestUsers": false,
    "excludeDateRanges": []
  },
  "ui": {
    "itemsPerPage": 12,
    "defaultSort": "createdAt",
    "defaultView": "grid"
  },
  "notifications": {
    "emailEnabled": true,
    "pushEnabled": false
  }
}
```

## 🧪 **Testing Data Management**

### Test Asset Cleanup

**Problem**: Production database contains test assets with systematic patterns:
- Tags: `["test", "sequential-numbering"]`
- User: `neouser@neo.com`
- Timestamps: May 13, 2025 batch creation

**Backend Solution Required**:
1. **Test Data Identification**: Flag test assets during creation
2. **Environment Separation**: Separate test/production databases
3. **Cleanup Utilities**: Batch test data removal tools

### Sequential Numbering Validation

**Current**: Basic sequential numbering working
**Enhancement Needed**: 
- **Collision Detection**: Handle simultaneous asset creation
- **Gap Filling**: Reuse numbers from deleted assets
- **Layer-specific Sequences**: Independent sequences per layer

## 🔒 **Security & Validation**

### File Upload Security

**Current**: Basic file type validation
**Enhancement Needed**:
- **Virus Scanning**: Scan uploaded files
- **Content Validation**: Verify file content matches extension
- **Size Limits**: Enforce per-layer size limits
- **Malicious Content**: Check for embedded scripts

### Input Validation

**Current**: Basic validation
**Enhancement Needed**:
- **XSS Prevention**: Sanitize description/tag inputs
- **SQL Injection**: Parameterized queries
- **Rate Limiting**: Prevent abuse of asset creation
- **Duplicate Detection**: Prevent duplicate asset uploads

## 📊 **Performance Optimizations**

### Database Indexing

**Required Indexes**:
```sql
-- Search performance
CREATE INDEX idx_assets_search ON assets(name, description, tags);
CREATE INDEX idx_assets_layer_category ON assets(layer, category, subcategory);
CREATE INDEX idx_assets_created_at ON assets(createdAt);
CREATE INDEX idx_assets_user ON assets(registeredBy);

-- Composite asset queries
CREATE INDEX idx_assets_components ON assets(components);
```

### Caching Strategy

**Implementation Needed**:
- **Asset Metadata**: Cache frequently accessed asset data
- **Search Results**: Cache popular search queries
- **Taxonomy Data**: Cache layer/category/subcategory mappings
- **User Sessions**: Efficient session management

### File Storage Optimization

**Current**: Google Cloud Storage
**Enhancements**:
- **CDN Integration**: Faster file delivery
- **Image Optimization**: Multiple resolutions
- **Video Processing**: Thumbnail generation at upload
- **Cleanup Jobs**: Remove orphaned files

## 🚀 **Deployment & DevOps**

### Database Migration System

**Needed**: Structured migration management
```javascript
// Migration example
exports.up = function(knex) {
  return knex.schema.table('assets', function(table) {
    table.json('metadata').nullable();
    table.index(['layer', 'category']);
  });
};
```

### Monitoring & Logging

**Implementation Required**:
- **API Performance**: Response time monitoring
- **Error Tracking**: Structured error logging
- **User Analytics**: Asset creation patterns
- **System Health**: Database performance metrics

### Backup & Recovery

**Strategy Needed**:
- **Automated Backups**: Daily database backups
- **File Backup**: Asset file redundancy
- **Disaster Recovery**: Recovery procedures
- **Data Retention**: Archive old assets

---

## 📋 **Implementation Priority Matrix**

| Issue | Priority | Impact | Effort | Timeline |
|-------|----------|--------|--------|----------|
| Subcategory Override | ❌ Critical | High | Medium | Immediate |
| Search Data Staleness | 🔴 High | Medium | Low | 1 week |
| Component Rights | ⚠️ Medium | Medium | High | 2 weeks |
| Enhanced Search | 🟡 Low | Low | Medium | 1 month |
| Notifications API | 🟡 Low | Low | High | 1 month |

## 🤝 **Frontend-Backend Coordination**

### Communication Protocol
- **API Documentation**: OpenAPI/Swagger specs
- **Error Codes**: Standardized error responses
- **Version Management**: API versioning strategy
- **Testing**: Shared test data and scenarios

### Data Format Standards
- **Date Formats**: ISO 8601 timestamps
- **Address Formats**: Consistent HFN/MFA structure
- **File Metadata**: Structured metadata schema
- **Error Messages**: User-friendly error descriptions

---

**This document serves as the comprehensive guide for backend enhancements required to fully support the MVP Release 1.0 frontend implementation.**