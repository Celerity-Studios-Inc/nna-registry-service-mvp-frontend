# Backend Management Dashboard Specification

## 🎯 **Executive Summary**
Specification for the backend team's management dashboard implementation as part of Phase 1 parallel development. This dashboard will serve as the operational foundation and include RBAC design that will be shared across all future admin interfaces.

**Priority**: ✅ **Phase 1, Parallel with Taxonomy Service**  
**Timeline**: Weeks 1-3 (concurrent with Taxonomy Service)  
**Strategic Value**: Foundation for operational excellence and rapid debugging

---

## 🏗️ **Management Dashboard Architecture**

### **Core Purpose**
- **Operational Excellence**: Real-time monitoring of backend health and performance
- **Rapid Debugging**: Quick access to logs, metrics, and configuration data
- **RBAC Foundation**: Establish role-based access patterns for all future admin tools
- **Environment Management**: Unified view across dev/staging/production environments

### **Technology Stack Recommendation**
```typescript
Framework: Next.js 14+ with TypeScript (matches frontend patterns)
UI Library: Material-UI v5 (consistency with main application)
State Management: React Query + Zustand
Authentication: JWT integration with existing auth system
Charts/Metrics: Chart.js or Recharts for performance visualization
Real-time: WebSocket or Server-Sent Events for live updates
```

---

## 🔐 **RBAC Design Foundation**

### **Role Hierarchy (Shared Across All Services)**
```typescript
interface Role {
  name: 'administrator' | 'curator' | 'editor' | 'creator';
  level: number; // 4 = admin, 3 = curator, 2 = editor, 1 = creator
  permissions: Permission[];
  environmentAccess: Environment[];
}

interface Permission {
  resource: string; // 'system', 'dashboard', 'taxonomy', 'assets', 'users'
  actions: string[]; // 'read', 'write', 'admin', 'super'
  scope?: string; // 'own', 'team', 'all'
  environments?: string[]; // 'development', 'staging', 'production'
}

const sharedRoleDefinitions = {
  administrator: {
    level: 4,
    permissions: [
      { resource: '*', actions: ['*'], scope: 'all', environments: ['*'] }
    ],
    environmentAccess: ['development', 'staging', 'production']
  },
  
  curator: {
    level: 3,
    permissions: [
      { resource: 'dashboard', actions: ['read'], environments: ['staging', 'production'] },
      { resource: 'taxonomy', actions: ['read', 'write'], environments: ['*'] },
      { resource: 'assets', actions: ['read', 'write'], scope: 'all', environments: ['*'] },
      { resource: 'users', actions: ['read'], environments: ['*'] }
    ],
    environmentAccess: ['development', 'staging', 'production']
  },
  
  editor: {
    level: 2,
    permissions: [
      { resource: 'dashboard', actions: ['read'], environments: ['development', 'staging'] },
      { resource: 'taxonomy', actions: ['read'], environments: ['*'] },
      { resource: 'assets', actions: ['read', 'write'], scope: 'own', environments: ['*'] },
      { resource: 'users', actions: ['read'], scope: 'own', environments: ['*'] }
    ],
    environmentAccess: ['development', 'staging']
  },
  
  creator: {
    level: 1,
    permissions: [
      { resource: 'assets', actions: ['read', 'write'], scope: 'own', environments: ['*'] },
      { resource: 'users', actions: ['read'], scope: 'own', environments: ['*'] }
    ],
    environmentAccess: ['development']
  }
};
```

### **Environment-Based Access Control**
```typescript
interface EnvironmentAccess {
  development: {
    // Most permissive - for testing and development
    allowedRoles: ['administrator', 'curator', 'editor', 'creator'],
    features: ['full_logs', 'debug_mode', 'system_admin', 'database_admin']
  },
  
  staging: {
    // Controlled access - for testing and validation
    allowedRoles: ['administrator', 'curator', 'editor'],
    features: ['view_logs', 'metrics', 'health_monitoring']
  },
  
  production: {
    // Restricted access - for operations only
    allowedRoles: ['administrator', 'curator'],
    features: ['health_monitoring', 'alert_management', 'read_only_logs']
  }
}
```

---

## 📊 **Dashboard Components Specification**

### **1. Environment Overview**
```typescript
// Multi-environment health dashboard
Component: EnvironmentOverview
Features:
- Environment status cards (dev/staging/prod)
- Real-time health indicators
- Quick environment switching
- Environment-specific metrics summary

Data Sources:
- Enhanced health endpoints (/api/health)
- Database connection status
- Redis/cache status
- Storage service status
- API response times

UI Elements:
- Environment status cards with color coding
- Real-time status indicators (green/yellow/red)
- Environment switcher dropdown
- Quick action buttons (logs, metrics, config)
```

### **2. Health Monitoring Dashboard**
```typescript
Component: HealthDashboard
Features:
- Real-time service health monitoring
- Database connection status
- Cache performance metrics
- Storage service status
- API endpoint health checks

Metrics Displayed:
- Response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Cache hit/miss rates
- Storage service availability
- Memory and CPU usage

Real-time Updates:
- WebSocket connection for live metrics
- Auto-refresh every 30 seconds
- Alert notifications for issues
- Historical trend charts
```

### **3. Configuration Viewer**
```typescript
Component: ConfigurationViewer
Features:
- Environment-specific configuration display
- Environment variable viewer
- CORS settings display
- Database connection details
- Storage configuration
- Logging configuration

Security Considerations:
- Mask sensitive values (passwords, keys)
- Role-based visibility (admin only for sensitive config)
- Audit logging for configuration access
- Read-only display (no editing initially)

Data Structure:
{
  environment: "production",
  database: {
    host: "prod-db.example.com",
    name: "nna-registry-production",
    connected: true,
    connectionCount: 15
  },
  storage: {
    provider: "gcp",
    bucket: "nna-registry-production-storage",
    region: "us-central1"
  },
  cors: {
    allowedOrigins: ["https://nna-registry-frontend.vercel.app"]
  }
}
```

### **4. Logs Viewer**
```typescript
Component: LogsViewer
Features:
- Real-time log streaming
- Log level filtering (debug, info, warn, error)
- Search and filtering capabilities
- Download logs functionality
- Environment-specific log access

Log Levels by Environment:
- Development: All levels (debug, info, warn, error)
- Staging: Info, warn, error
- Production: Warn, error only

Features:
- Real-time log tailing
- Full-text search across logs
- Date range filtering
- Error highlighting and grouping
- Export logs to file
- Log retention policies
```

### **5. Metrics & Performance**
```typescript
Component: MetricsDashboard
Features:
- API performance metrics
- Database performance trends
- Resource utilization monitoring
- User activity analytics
- System performance trending

Charts and Visualizations:
- Response time trends (line charts)
- Request volume (bar charts)
- Error rate tracking (area charts)
- Database query performance (scatter plots)
- Resource utilization (gauge charts)
- User activity heatmaps

Time Ranges:
- Last hour (real-time)
- Last 24 hours
- Last 7 days
- Last 30 days
- Custom date ranges
```

### **6. User Management Interface**
```typescript
Component: UserManagement
Features:
- User listing and search
- Role assignment and management
- User activity monitoring
- Access control management
- User audit trails

RBAC Integration:
- View all users (admin/curator only)
- Edit user roles (admin only)
- View user activity (admin/curator)
- Manage access permissions (admin only)
- Audit user actions (admin only)

User Interface:
- Searchable user table
- Role assignment dropdowns
- Activity timeline per user
- Permission matrix display
- User creation/deactivation forms
```

---

## 🔌 **API Integration Patterns**

### **Dashboard Backend API Design**
```typescript
// Health and monitoring endpoints
GET /api/dashboard/health/:environment
GET /api/dashboard/metrics/:environment
GET /api/dashboard/config/:environment
GET /api/dashboard/logs/:environment
GET /api/dashboard/users

// Real-time data endpoints
GET /api/dashboard/live-metrics/:environment (WebSocket)
GET /api/dashboard/live-logs/:environment (Server-Sent Events)

// User management endpoints
GET /api/dashboard/users
POST /api/dashboard/users
PUT /api/dashboard/users/:id
DELETE /api/dashboard/users/:id
POST /api/dashboard/users/:id/roles
```

### **Integration with Main Application**
```typescript
// Shared authentication service
AuthService:
- Validate JWT tokens
- Extract user roles and permissions
- Check environment access
- Audit user actions

// Shared database access
DatabaseService:
- Read-only access to main application database
- User and role information
- Audit logging integration
- Performance metrics collection
```

---

## 🚀 **Implementation Phases**

### **Week 1: Foundation Setup**
```typescript
Tasks:
1. Set up Next.js dashboard application
2. Implement JWT authentication integration
3. Create basic RBAC middleware and components
4. Set up environment switcher functionality
5. Implement basic health monitoring

Deliverables:
- Dashboard framework operational
- Authentication working with existing JWT system
- Basic RBAC patterns established
- Environment switching functional
- Health endpoints integrated
```

### **Week 2: Core Features**
```typescript
Tasks:
1. Implement configuration viewer
2. Add logs viewer with real-time streaming
3. Create metrics dashboard with charts
4. Build user management interface
5. Add environment-specific access controls

Deliverables:
- Configuration display functional
- Live log streaming operational
- Performance metrics visualization
- User management interface complete
- Environment-based permissions working
```

### **Week 3: Advanced Features & Polish**
```typescript
Tasks:
1. Add advanced filtering and search
2. Implement export functionality
3. Create alerting and notification system
4. Performance optimization and caching
5. Documentation and user training

Deliverables:
- Advanced search and filtering
- Export/download functionality
- Alert system operational
- Performance optimized
- Complete documentation
```

---

## 🤝 **Coordination with Frontend Team**

### **Shared RBAC Patterns**
```typescript
// Shared role checking utilities
const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (resource: string, action: string, environment?: string) => {
    return checkPermission(user.role, resource, action, environment);
  };
  
  const canAccessEnvironment = (environment: string) => {
    return user.environmentAccess.includes(environment);
  };
  
  return { hasPermission, canAccessEnvironment };
};

// Shared UI components
export const ProtectedRoute: React.FC<{
  requiredPermission: Permission;
  children: React.ReactNode;
}>;

export const EnvironmentSelector: React.FC<{
  currentEnvironment: string;
  onEnvironmentChange: (env: string) => void;
}>;
```

### **Design System Alignment**
```typescript
// Shared UI patterns with Taxonomy Service admin interface
Theme: Material-UI theme matching main application
Components: Reusable admin components
Layout: Consistent admin interface layout
Navigation: Shared navigation patterns
Forms: Consistent form validation and submission
```

---

## 📈 **Success Metrics**

### **Operational Excellence**
- ✅ 100% uptime monitoring across all environments
- ✅ <5 second time-to-information for debugging
- ✅ Real-time alerting for critical issues
- ✅ Complete audit trail for all admin actions

### **User Experience**
- ✅ <2 second dashboard load times
- ✅ Intuitive navigation and information discovery
- ✅ Mobile-responsive admin interface
- ✅ Comprehensive help documentation

### **Security & Compliance**
- ✅ Role-based access working correctly
- ✅ Environment-specific permission enforcement
- ✅ Complete audit logging
- ✅ Secure handling of sensitive configuration data

---

## 🎯 **Integration Points with Taxonomy Service**

### **Shared Infrastructure**
- **Authentication**: Same JWT validation patterns
- **RBAC**: Shared role definitions and permission checking
- **UI Components**: Reusable admin interface components
- **Monitoring**: Shared monitoring and alerting strategies

### **Cross-Service Coordination**
- **User Management**: Shared user database and role management
- **Audit Logging**: Consistent audit trail across services
- **Environment Strategy**: Same three-environment deployment pattern
- **API Standards**: Consistent REST API patterns and documentation

---

## 🚀 **Ready for Parallel Development**

This specification provides the backend team with:
- ✅ **Clear Architecture**: Complete dashboard design and functionality
- ✅ **RBAC Foundation**: Shared role system for all future admin tools
- ✅ **Integration Points**: Coordination with Taxonomy Service development
- ✅ **Success Criteria**: Measurable objectives and deliverables

**The management dashboard will serve as the operational foundation while establishing RBAC patterns that both teams can leverage for all future admin interfaces!**

---

**Next Steps**: 
1. Begin parallel development (Taxonomy Service + Management Dashboard)
2. Regular coordination meetings to align RBAC patterns
3. Shared component library development
4. Integration testing across both admin interfaces