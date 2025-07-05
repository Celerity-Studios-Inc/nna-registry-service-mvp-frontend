# NNA Registry Service - Deployment Guide for Structural Fixes

**Date**: January 2025  
**Purpose**: Step-by-step guide to deploy the structural fixes for environment misalignment

## 🚀 Quick Start

### 1. Deploy to Development Environment
```bash
# Push to dev branch to trigger deployment
git push origin taxonomy-dev

# Wait for GitHub Actions to complete (check Actions tab)
# Expected time: 5-10 minutes
```

### 2. Verify Development Deployment
```bash
# Run environment verification
./scripts/verify-environments.sh

# Check health endpoint
curl https://registry.dev.reviz.dev/api/health | jq '.detection'

# Expected output should show:
# - environment: "development"
# - nodeEnv: "development"
# - environmentVar: "development"
# - gcpBucketName: "nna_registry_assets_dev"
# - mongodbDatabase: "nna-registry-service-dev"
```

### 3. Test Asset Creation (Optional)
```bash
# Test asset creation in dev environment
./test-asset-creation.sh dev
```

## 📋 Detailed Deployment Steps

### Step 1: Pre-Deployment Verification

1. **Check current code status**
   ```bash
   git status
   git log --oneline -5
   ```

2. **Verify all files are committed**
   ```bash
   git add .
   git commit -m "Implement structural fixes for environment misalignment"
   ```

3. **Push to development branch**
   ```bash
   git push origin taxonomy-dev
   ```

### Step 2: Monitor GitHub Actions

1. **Go to GitHub Actions tab**
   - Navigate to your repository
   - Click on "Actions" tab
   - Look for "NNA Registry Service CI/CD (dev)" workflow

2. **Monitor the deployment**
   - Watch for any build errors
   - Ensure all steps complete successfully
   - Note the deployment URL

### Step 3: Post-Deployment Verification

1. **Run environment verification script**
   ```bash
   ./scripts/verify-environments.sh
   ```

2. **Check health endpoint**
   ```bash
   curl https://registry.dev.reviz.dev/api/health | jq '.'
   ```

3. **Verify environment variables**
   ```bash
   gcloud run services describe nna-registry-service-dev \
     --region=us-central1 \
     --format="value(spec.template.spec.containers[0].env[].name,spec.template.spec.containers[0].env[].value)"
   ```

### Step 4: Validate Environment Configuration

1. **Check environment detection**
   ```bash
   curl https://registry.dev.reviz.dev/api/health | jq '.detection'
   ```

2. **Expected output for dev environment**:
   ```json
   {
     "method": "hostname",
     "hostname": "registry.dev.reviz.dev",
     "nodeEnv": "development",
     "environmentVar": "development",
     "gcpBucketName": "nna_registry_assets_dev",
     "mongodbDatabase": "nna-registry-service-dev"
   }
   ```

3. **Verify bucket configuration**
   ```bash
   curl https://registry.dev.reviz.dev/api/health | jq '.detection.gcpBucketName'
   # Should return: "nna_registry_assets_dev"
   ```

4. **Verify database configuration**
   ```bash
   curl https://registry.dev.reviz.dev/api/health | jq '.detection.mongodbDatabase'
   # Should return: "nna-registry-service-dev"
   ```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Issue 1: Environment Mismatch
**Error**: `Environment mismatch: Detected development but NODE_ENV=production`

**Solution**:
1. Check GitHub Actions workflow file
2. Ensure `ENVIRONMENT=development` is set in the deployment
3. Redeploy with correct environment variables

#### Issue 2: Bucket Mismatch
**Error**: `Bucket mismatch: Expected bucket with 'dev' suffix, got 'nna_registry_assets_prod'`

**Solution**:
1. Check GCP Secret Manager
2. Verify `GCP_BUCKET_NAME_DEV` secret contains correct bucket name
3. Update secret if necessary

#### Issue 3: Database Mismatch
**Error**: `Database mismatch: Expected database with 'dev' suffix, got 'nna-registry-service-production'`

**Solution**:
1. Check GCP Secret Manager
2. Verify `mongodb-uri-dev` secret contains correct database URI
3. Update secret if necessary

#### Issue 4: Service Won't Start
**Error**: Service fails to start with validation errors

**Solution**:
1. Check Cloud Run logs
2. Review environment validation errors
3. Fix configuration issues
4. Redeploy

### Debugging Commands

```bash
# Check service logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=nna-registry-service-dev" --limit=50

# Check service status
gcloud run services describe nna-registry-service-dev --region=us-central1

# Check environment variables
gcloud run services describe nna-registry-service-dev --region=us-central1 --format="value(spec.template.spec.containers[0].env[].name,spec.template.spec.containers[0].env[].value)"

# Check secrets
gcloud run services describe nna-registry-service-dev --region=us-central1 --format="value(spec.template.spec.containers[0].env[].valueFrom.secretKeyRef.name)"
```

## 📊 Success Criteria

### Development Environment
- ✅ Health endpoint returns `environment: "development"`
- ✅ `NODE_ENV` and `ENVIRONMENT` both set to "development"
- ✅ GCS bucket name contains "dev" suffix
- ✅ MongoDB database name contains "dev" suffix
- ✅ Service starts without validation errors
- ✅ All verification scripts pass

### Staging Environment (After Dev Validation)
- ✅ Health endpoint returns `environment: "staging"`
- ✅ `NODE_ENV` and `ENVIRONMENT` both set to "staging"
- ✅ GCS bucket name contains "stg" suffix
- ✅ MongoDB database name contains "staging" suffix
- ✅ Service starts without validation errors
- ✅ All verification scripts pass

### Production Environment (After Staging Validation)
- ✅ Health endpoint returns `environment: "production"`
- ✅ `NODE_ENV` and `ENVIRONMENT` both set to "production"
- ✅ GCS bucket name contains "prod" suffix
- ✅ MongoDB database name contains "production" suffix
- ✅ Service starts without validation errors
- ✅ All verification scripts pass

## 🔄 Deployment Sequence

### Phase 1: Development (Immediate)
1. Deploy to dev environment
2. Run verification scripts
3. Validate environment configuration
4. Test asset creation (optional)

### Phase 2: Staging (After Dev Success)
1. Deploy to staging environment
2. Run verification scripts
3. Validate environment configuration
4. Test asset creation (optional)

### Phase 3: Production (After Staging Success)
1. Deploy to production environment
2. Run verification scripts
3. Validate environment configuration
4. Monitor for any issues

## 📞 Support

If you encounter any issues during deployment:

1. **Check the logs**: Use the debugging commands above
2. **Review the documentation**: See `docs/STRUCTURAL_FIXES_IMPLEMENTATION.md`
3. **Run verification scripts**: Use `./scripts/verify-environments.sh`
4. **Check GitHub Actions**: Review the deployment logs

## ✅ Completion Checklist

- [ ] Development environment deployed successfully
- [ ] Environment verification script passes
- [ ] Health endpoint shows correct environment
- [ ] GCS bucket configuration is correct
- [ ] MongoDB database configuration is correct
- [ ] No validation errors in service logs
- [ ] Asset creation works (if tested)
- [ ] Staging environment deployed (if applicable)
- [ ] Production environment deployed (if applicable)
- [ ] All environments verified and working

**Status**: Ready for deployment 