# 3-Tier Deployment Strategy

## Overview
This document outlines the mandatory 3-tier deployment strategy that must be followed for all changes to prevent production incidents.

## Environment Flow
```
Development → Staging → Production
```

**RULE: No changes may skip any tier in this flow.**

## Branch Strategy

### Branches
- **`development`**: Auto-deploys to development environment
- **`staging`**: Manual deploy to staging environment
- **`main`**: Manual deploy to production environment

### Deployment Rules

#### Development Environment
- **Automatic deployment** when code is pushed to `development` branch
- **Purpose**: Test all new features and changes
- **URL**: https://nna-registry-frontend-dev.vercel.app
- **Requirements**: Must pass build test

#### Staging Environment  
- **Manual deployment only** via GitHub Actions workflow
- **Source**: Usually `development` branch (after testing)
- **Purpose**: Final testing before production with production-like data
- **URL**: https://nna-registry-frontend-stg.vercel.app
- **Requirements**: 
  - Manual confirmation required
  - Should be deployed during off-hours when possible
  - Must pass staging health checks

#### Production Environment
- **Manual deployment only** via GitHub Actions workflow
- **Source**: Usually `staging` branch (after staging validation)
- **Purpose**: Live user-facing environment
- **URL**: https://nna-registry-frontend.vercel.app
- **Requirements**:
  - Manual confirmation required ("DEPLOY-TO-PRODUCTION")
  - Maintenance window checkbox (warning if outside window)
  - Must pass production health checks

## Workflow Files

### Active Workflows
- `development-auto-deploy.yml`: Auto-deploys development branch
- `staging-manual-deploy.yml`: Manual staging deployment
- `production-manual-deploy.yml`: Manual production deployment

### Disabled Workflows (Historical)
- `ci-cd-dev.yml.disabled`: Old development workflow
- `ci-cd-prod.yml.disabled`: Old production workflow  
- `ci-cd-stg.yml.disabled`: Old staging workflow

## Process

### For New Features
1. **Create feature branch** from `development`
2. **Test locally** then push to feature branch
3. **Create PR** to `development` branch
4. **Merge to development** → auto-deploys to dev environment
5. **Test thoroughly** in development environment
6. **Manual staging deploy** during off-hours
7. **Test in staging** with production-like conditions
8. **Manual production deploy** during maintenance window

### For Hotfixes
1. **Create hotfix branch** from `main`
2. **Test locally** thoroughly
3. **Deploy to development** for verification
4. **Deploy to staging** for final validation
5. **Deploy to production** with proper approvals

## Environment Variables

Each environment has its own configuration:
- **Development**: `vercel.development.json`
- **Staging**: `vercel.staging.json`  
- **Production**: `vercel.json`

## Emergency Procedures

### If Production is Broken
1. **Immediately assess** if rollback is needed
2. **Deploy last known good version** from staging/main
3. **Fix in development** → staging → production flow
4. **Document incident** and update procedures

### If Staging is Broken
1. **Do not deploy to production**
2. **Fix in development** first
3. **Redeploy to staging** and verify
4. **Only then proceed** to production

## Approval Matrix

| Environment | Who Can Deploy | Approval Required |
|-------------|----------------|-------------------|
| Development | Developers | None (automatic) |
| Staging | Lead Developer, DevOps | Manual confirmation |
| Production | Lead Developer, DevOps | Manual confirmation + documentation |

## Monitoring

- Each deployment includes health checks
- Failed deployments automatically abort
- Success/failure notifications in GitHub Actions
- Manual verification required for staging/production

## Violations

**Examples of strategy violations:**
- Pushing directly to main branch
- Skipping development testing
- Emergency production deployments without staging validation
- Deploying to staging during business hours without coordination

**Prevention:**
- Branch protection rules
- Required manual confirmations
- Health checks and validation
- Documentation requirements