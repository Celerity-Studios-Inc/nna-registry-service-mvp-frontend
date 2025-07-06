# Frontend Three-Tier Promotion Strategy & Workflow

**Purpose**: Define proper development workflow aligned with backend three-tier promotion strategy  
**Current Issue**: Frontend pushing directly to main branch deploys to all environments simultaneously  
**Solution**: Implement branch-based environment promotion with manual gates

---

## 🚨 **CURRENT PROBLEM IDENTIFIED**

### **Incorrect Current Workflow**
```
Developer Changes → git push main → Automatic deployment to:
├── Development (nna-registry-frontend-dev.vercel.app)
├── Staging (nna-registry-frontend-stg.vercel.app) 
└── Production (nna-registry-frontend.vercel.app)
```

**Issues**:
- No testing isolation between environments
- No approval gates for staging/production
- Cannot rollback individual environments
- Bypass of proper QA and validation processes

### **Required Workflow**
```
Development Branch → Staging Branch → Production Branch
       ↓                  ↓               ↓
   Auto Deploy         Manual Gate    Manual Gate
   (Immediate)        (Team Approval) (Senior Approval)
```

---

## 🎯 **PROPOSED THREE-TIER STRATEGY**

### **Tier 1: Development Environment**
**Branch**: `development`  
**URL**: `https://nna-registry-frontend-dev.vercel.app`  
**Backend**: `https://registry.dev.reviz.dev`  
**Purpose**: Active development and feature testing

**Deployment Process**:
- ✅ **Automatic**: Push to `development` branch triggers immediate deployment
- ✅ **No Approval**: Developers can deploy freely for testing
- ✅ **Latest Features**: Always contains cutting-edge development
- ✅ **Rapid Iteration**: Multiple deployments per day acceptable

**Quality Gates**:
- [x] Code compiles successfully
- [x] Basic linting passes
- [x] Core functionality tests pass
- [ ] No approval required

### **Tier 2: Staging Environment**  
**Branch**: `staging`  
**URL**: `https://nna-registry-frontend-stg.vercel.app`  
**Backend**: `https://registry.stg.reviz.dev`  
**Purpose**: Pre-production validation and user acceptance testing

**Deployment Process**:
- ⚠️ **Manual Promotion**: From `development` → `staging` branch
- ⚠️ **Team Approval**: Development team lead approval required
- ⚠️ **Feature Complete**: Only promotion of completed features
- ⚠️ **Coordinated**: Synchronized with backend staging deployments

**Quality Gates**:
- [x] All development tests passing
- [x] Feature validation completed
- [x] Backend integration confirmed
- [x] Team lead approval obtained
- [ ] No breaking changes in staging

### **Tier 3: Production Environment**
**Branch**: `main` (production)  
**URL**: `https://nna-registry-frontend.vercel.app`  
**Backend**: `https://registry.reviz.dev`  
**Purpose**: Live production environment for end users

**Deployment Process**:
- 🔒 **Manual Promotion**: From `staging` → `main` branch
- 🔒 **Senior Approval**: Project lead + QA approval required
- 🔒 **Release Coordination**: Synchronized with backend production releases
- 🔒 **Documentation**: Full release notes and rollback plan required

**Quality Gates**:
- [x] Staging environment fully validated
- [x] User acceptance testing completed
- [x] Performance testing passed
- [x] Security review completed
- [x] Backend coordination confirmed
- [x] Senior approval obtained
- [x] Release documentation complete

---

## 🔄 **BRANCH STRATEGY & WORKFLOW**

### **Branch Structure**
```
main (production)
├── staging
    ├── development
        ├── feature/taxonomy-sync
        ├── feature/search-improvements
        └── feature/user-management
```

### **Promotion Workflow**

#### **Development → Staging**
```bash
# 1. Ensure development is ready
git checkout development
git pull origin development

# 2. Run validation
npm run build
npm run test
npm run lint

# 3. Create promotion PR
git checkout staging
git pull origin staging
git merge development
git push origin staging

# 4. Request team approval
# GitHub PR: development → staging
# Approval: Development team lead
```

#### **Staging → Production**
```bash
# 1. Validate staging environment
# - Full regression testing
# - Performance validation
# - Backend coordination

# 2. Create production release PR
git checkout main
git pull origin main
git merge staging

# 3. Create release tag
git tag -a v1.2.0 -m "Release 1.2.0: Async Taxonomy Sync"

# 4. Request senior approval
# GitHub PR: staging → main
# Approval: Project lead + QA
```

---

## 🛡️ **APPROVAL GATES & GOVERNANCE**

### **Staging Promotion Gate**
**Approvers**: Development team leads  
**Requirements**:
- [x] All features completed and tested in development
- [x] Backend API endpoints validated
- [x] No breaking changes introduced
- [x] Integration tests passing
- [x] Documentation updated

**Process**:
- GitHub PR with required reviewers
- Automated deployment on approval
- Post-deployment health checks
- Rollback available within 15 minutes

### **Production Promotion Gate**
**Approvers**: Project lead + QA lead  
**Requirements**:
- [x] Staging environment fully validated
- [x] User acceptance testing completed
- [x] Performance benchmarks met
- [x] Security review passed
- [x] Backend deployment coordinated
- [x] Release notes completed
- [x] Rollback plan documented

**Process**:
- GitHub PR with senior review required
- Manual deployment after approval
- Coordinated with backend team
- Real-time monitoring during deployment
- Immediate rollback capability

---

## 📊 **DEPLOYMENT AUTOMATION**

### **GitHub Actions Workflows**

#### **Development Auto-Deploy**
```yaml
# .github/workflows/development-deploy.yml
name: Development Auto-Deploy
on:
  push:
    branches: [development]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Development
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_DEV }}
```

#### **Staging Promotion**
```yaml
# .github/workflows/staging-promotion.yml
name: Staging Promotion
on:
  pull_request:
    branches: [staging]
    types: [closed]
jobs:
  deploy:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Deploy to Staging
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID_STG }}
```

#### **Production Release**
```yaml
# .github/workflows/production-release.yml
name: Production Release
on:
  pull_request:
    branches: [main]
    types: [closed]
jobs:
  deploy:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Create Release
      - name: Deploy to Production
      - name: Post-deployment Verification
```

---

## 🔧 **IMMEDIATE IMPLEMENTATION PLAN**

### **Week 1: Branch Strategy Setup**
1. **Create Branch Structure**
   ```bash
   git checkout -b development
   git push -u origin development
   
   git checkout -b staging  
   git push -u origin staging
   ```

2. **Update GitHub Settings**
   - Set `main` as protected branch
   - Require reviews for staging/production
   - Set up environment protection rules

3. **Configure Vercel Projects**
   - Link development branch → dev project
   - Link staging branch → staging project
   - Link main branch → production project

### **Week 2: Workflow Implementation**
1. **Create GitHub Actions**
   - Development auto-deploy workflow
   - Staging promotion workflow
   - Production release workflow

2. **Set Up Approval Gates**
   - GitHub environment protection
   - Required reviewers configuration
   - Approval automation

3. **Team Training**
   - Document new workflow procedures
   - Train team on promotion process
   - Test workflow with dummy deployment

### **Week 3: Migration & Testing**
1. **Migrate Current Work**
   - Move taxonomy sync changes to development branch
   - Test development → staging promotion
   - Validate staging → production workflow

2. **Process Validation**
   - Complete end-to-end promotion test
   - Verify approval gates working
   - Test rollback procedures

---

## 🤝 **BACKEND COORDINATION REQUIREMENTS**

### **Synchronized Deployment Strategy**
1. **Development**: Independent deployment schedules
2. **Staging**: Coordinate deployment timing with backend
3. **Production**: Synchronized releases with shared release notes

### **Monitoring Integration**
- Shared health check endpoints
- Coordinated alert systems
- Joint deployment verification

### **Release Coordination**
- Aligned release numbering (both teams → v1.2.0)
- Shared release documentation
- Coordinated rollback procedures

---

## 📋 **SUCCESS METRICS**

### **Process Metrics**
- **Deployment Success Rate**: >95% across all tiers
- **Rollback Frequency**: <5% of deployments
- **Approval Time**: <24 hours for staging, <48 hours for production
- **Environment Consistency**: 100% configuration alignment

### **Quality Metrics**
- **Zero-downtime Deployments**: 100% success rate
- **Environment-specific Issues**: <1% occurrence
- **Manual Intervention Required**: <10% of deployments

---

## 🎯 **IMMEDIATE ACTION REQUIRED**

**Critical Issue**: Frontend currently violating three-tier best practices by pushing directly to main

**Immediate Fix Needed**:
1. Stop pushing changes directly to main branch
2. Implement proper development branch workflow
3. Set up approval gates for staging/production
4. Coordinate with backend team on synchronized releases

**This strategy aligns with backend three-tier promotion and ensures proper quality gates for Release 1.2.0.**