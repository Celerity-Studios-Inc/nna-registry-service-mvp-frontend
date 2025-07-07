# Three-Tier Development Guidelines

**Document Version:** 1.0  
**Date:** January 2025  
**Status:** ✅ **COMPLETE**  
**Priority:** HIGH - Required for All Development

## Overview

This document outlines the development guidelines for the NNA Registry Service Frontend using the three-tier promotion workflow (Development → Staging → Production). All developers must follow these guidelines to ensure proper testing and deployment procedures.

## Three-Tier Environment Structure

| Environment | Branch | URL | Purpose | Deployment |
|------------|--------|-----|---------|------------|
| **Development** | `development` | `https://nna-registry-frontend-dev.vercel.app` | Active development and integration | Automatic on push |
| **Staging** | `staging` | `https://nna-registry-frontend-stg.vercel.app` | Pre-production validation and QA | Manual promotion via PR |
| **Production** | `main` | `https://nna-registry-frontend.vercel.app` | Live production environment | Manual promotion via PR |

## Development Workflow

### **Daily Development Process**

#### **1. Feature Development**
```bash
# Start from development branch
git checkout development
git pull origin development

# Create feature branch
git checkout -b feature/your-feature-name

# Develop your feature
# ... make changes ...

# Test locally
npm start
npm test
npm run build

# Commit and push feature branch
git add .
git commit -m "feat: implement your feature"
git push origin feature/your-feature-name

# Create PR to development branch
```

#### **2. Development Integration**
- **Target Branch:** `development`
- **Review Required:** Peer review recommended but not mandatory
- **Deployment:** Automatic to development environment
- **Testing:** Integration testing on development environment

#### **3. Code Quality Checks**
All code must pass the following checks before promotion:
- ✅ TypeScript compilation (`npx tsc --noEmit`)
- ✅ ESLint validation (`npm run lint`)
- ✅ Build success (`CI=false npm run build`)
- ✅ Local testing verification

### **Weekly Staging Promotion**

#### **1. Staging Readiness**
Before promoting to staging, ensure:
- ✅ All features are working correctly in development environment
- ✅ Integration testing completed
- ✅ No critical bugs or issues
- ✅ Code quality checks passing

#### **2. Staging Promotion Process**
```bash
# Ensure development branch is up to date
git checkout development
git pull origin development

# Create PR from development to staging
# Use GitHub UI or CLI:
gh pr create --base staging --head development --title "Weekly Staging Promotion - [Date]" --body "Promoting development changes to staging for QA validation"

# Wait for PR approval and CI/CD checks
# Merge PR after approval
```

#### **3. Staging Validation**
- **QA Testing:** Comprehensive testing on staging environment
- **Backend Integration:** Verify frontend-backend communication
- **User Acceptance:** Stakeholder review and approval
- **Performance Testing:** Load and performance validation

### **Production Release Process**

#### **1. Production Readiness**
Before promoting to production, ensure:
- ✅ Staging environment thoroughly tested
- ✅ All QA issues resolved
- ✅ Stakeholder approval obtained
- ✅ Backend coordination confirmed
- ✅ Release notes prepared

#### **2. Production Promotion Process**
```bash
# Ensure staging branch is ready
git checkout staging
git pull origin staging

# Create PR from staging to main
# Use GitHub UI or CLI:
gh pr create --base main --head staging --title "Production Release - [Version]" --body "Promoting staging changes to production for release [version]"

# Wait for manual approval (production environment protection)
# Coordinate with backend team for synchronized release
# Merge PR after all approvals
```

#### **3. Post-Production Validation**
- **Health Checks:** Automatic post-deployment health verification
- **Monitoring:** Monitor application performance and errors
- **Rollback Plan:** Emergency rollback procedures if issues arise
- **Documentation:** Update release notes and changelog

## Branch Protection Rules

### **Development Branch (`development`)**
- ✅ Direct pushes allowed for development workflow
- ✅ Automatic CI/CD deployment to development environment
- ✅ Basic health checks and build validation

### **Staging Branch (`staging`)**
- 🚫 **NO DIRECT PUSHES** - Only PR merges allowed
- ✅ Requires PR review and approval
- ✅ Extended CI/CD with backend connectivity tests
- ✅ Manual approval gate for production promotion

### **Production Branch (`main`)**
- 🚫 **NO DIRECT PUSHES** - Only PR merges allowed
- ✅ Requires PR review and approval
- ✅ Environment protection with manual approval required
- ✅ Comprehensive security audits and health checks
- ✅ Rollback procedures on failure

## Emergency Procedures

### **Hotfix Process**
For critical production issues requiring immediate fixes:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue-description

# Implement minimal fix
# ... make minimal changes ...

# Test thoroughly
npm start
npm test
npm run build

# Create PR directly to main (emergency only)
gh pr create --base main --head hotfix/critical-issue-description --title "HOTFIX: Critical issue description" --body "Emergency hotfix for critical production issue"

# After hotfix is deployed, merge back to staging and development
git checkout staging
git pull origin main  # Pull the hotfix
git push origin staging

git checkout development  
git pull origin staging  # Pull the hotfix
git push origin development
```

### **Rollback Procedures**
If production deployment fails or causes issues:

1. **Automatic Rollback:** Health checks will trigger automatic rollback
2. **Manual Rollback:** Use Vercel dashboard or CLI to rollback to previous deployment
3. **Emergency Approval:** Use production-rollback environment for emergency approvals
4. **Post-Incident:** Analyze failure and update procedures

## Code Quality Standards

### **Required Checks**
All code must pass these checks before promotion:

```bash
# TypeScript compilation
npx tsc --noEmit

# ESLint validation  
npm run lint

# Build verification
CI=false npm run build

# Test execution (when available)
npm test
```

### **Code Review Guidelines**
- **Development PRs:** Peer review recommended for learning and quality
- **Staging PRs:** Required review for promotion readiness
- **Production PRs:** Required review and stakeholder approval
- **Hotfix PRs:** Expedited review with post-deployment analysis

### **Documentation Requirements**
- **Feature PRs:** Update relevant documentation
- **Breaking Changes:** Update migration guides
- **API Changes:** Update integration documentation
- **Configuration Changes:** Update environment setup guides

## Environment-Specific Considerations

### **Development Environment**
- **Purpose:** Rapid iteration and integration testing
- **Stability:** Expected instability during active development
- **Data:** Development/test data only
- **Performance:** Not optimized for performance testing

### **Staging Environment**
- **Purpose:** Pre-production validation and QA
- **Stability:** Should be stable for testing
- **Data:** Production-like test data
- **Performance:** Production-like performance testing

### **Production Environment**
- **Purpose:** Live user environment
- **Stability:** Maximum stability required
- **Data:** Live production data
- **Performance:** Optimized for production usage

## Backend Coordination

### **Environment Alignment**
Frontend and backend environments should be aligned:
- Development frontend ↔ Development backend
- Staging frontend ↔ Staging backend  
- Production frontend ↔ Production backend

### **Coordinated Deployments**
For major releases:
1. **Planning:** Joint frontend-backend release planning
2. **Staging:** Synchronized promotion to staging for integration testing
3. **Production:** Coordinated production deployment
4. **Monitoring:** Joint health monitoring and issue resolution

### **Communication**
- **Daily Standups:** Coordinate development progress
- **Weekly Reviews:** Align on staging promotion readiness
- **Release Planning:** Joint planning for production releases
- **Incident Response:** Coordinated response to production issues

## Monitoring and Alerting

### **Health Monitoring**
Each environment has automatic health monitoring:
- **Frontend Health:** Application loading and functionality
- **Backend Integration:** API connectivity and response times
- **Performance Metrics:** Load times and user experience
- **Error Tracking:** Application errors and exceptions

### **Alert Procedures**
- **Development Issues:** Monitor for learning and improvement
- **Staging Issues:** Address before production promotion
- **Production Issues:** Immediate response and escalation
- **Performance Degradation:** Monitor and optimize

## Best Practices

### **Development Best Practices**
- ✅ Test thoroughly before pushing to development
- ✅ Use descriptive commit messages and PR descriptions
- ✅ Keep feature branches small and focused
- ✅ Update documentation with code changes
- ✅ Follow TypeScript and ESLint guidelines

### **Promotion Best Practices**
- ✅ **NEVER** push directly to staging or production branches
- ✅ Always use PR-based promotion workflow
- ✅ Test thoroughly in each environment before promotion
- ✅ Coordinate with backend team for major releases
- ✅ Document all changes and decisions

### **Security Best Practices**
- ✅ Never commit sensitive information (API keys, secrets)
- ✅ Use environment variables for configuration
- ✅ Validate all user inputs
- ✅ Follow CORS and security best practices
- ✅ Regular security audits and updates

## Troubleshooting

### **Common Issues**

#### **Deployment Failures**
- Check CI/CD logs for specific error messages
- Verify all environment variables are configured
- Ensure build passes locally before pushing
- Check for TypeScript or ESLint errors

#### **Environment Issues**
- Verify correct backend URLs for each environment
- Check CORS configuration
- Validate API connectivity
- Review environment-specific configuration

#### **PR Issues**
- Ensure target branch is correct (development → staging → main)
- Check for merge conflicts and resolve
- Verify all CI/CD checks are passing
- Request appropriate reviewers

### **Getting Help**
- **Technical Issues:** Check documentation and logs first
- **Process Questions:** Refer to this document and team guidelines
- **Emergency Issues:** Follow emergency procedures and escalate appropriately
- **Coordination Questions:** Reach out to backend team for alignment

## Success Metrics

### **Process Metrics**
- ✅ Zero direct pushes to staging or production branches
- ✅ All changes tested in development and staging before production
- ✅ Successful promotion rate > 95%
- ✅ Emergency hotfixes < 5% of all deployments

### **Quality Metrics**
- ✅ Production incidents reduced by proper testing
- ✅ Faster bug detection in staging vs production
- ✅ Improved code quality through review process
- ✅ Better coordination between frontend and backend teams

## Updates and Maintenance

This document will be updated as the workflow evolves. All developers should:
- ✅ Review guidelines regularly
- ✅ Suggest improvements through PR process
- ✅ Follow updated procedures immediately
- ✅ Train new team members on these guidelines

**Document Status:** ✅ **COMPLETE AND READY FOR USE**  
**Last Updated:** January 2025  
**Next Review:** As needed based on workflow evolution