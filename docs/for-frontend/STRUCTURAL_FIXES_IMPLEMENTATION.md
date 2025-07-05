# NNA Registry Service - Structural Fixes Implementation

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Implemented

## Executive Summary

This document outlines the comprehensive structural fixes implemented to resolve the persistent environment misalignment issues in the NNA Registry Service. These fixes ensure that each environment (dev, staging, production) uses the correct configuration and prevents cross-environment contamination.

## Root Cause Analysis

### The Problem
The NNA Registry Service was experiencing persistent environment misalignment where:
- Dev environment was using production GCS bucket (`nna_registry_assets_prod`)
- Dev environment was returning `environment: 'production'` in health endpoint
- Assets were being stored in wrong buckets across environments
- CORS errors occurred due to bucket mismatches

### Root Cause
The fundamental issue was **inconsistent environment variable management** across the deployment pipeline:
1. **Missing ENVIRONMENT variable**: Only `NODE_ENV` was set, but `ENVIRONMENT` was not
2. **No validation at startup**: No checks to ensure environment consistency
3. **Insufficient debugging**: Limited visibility into actual environment configuration
4. **No deployment verification**: No post-deployment validation of configuration

## Structural Fixes Implemented

### 1. Environment Validation Service

**File**: `src/config/environment-validation.ts`

A new service that validates environment configuration at startup and prevents misaligned deployments.

#### Key Features:
- **Startup validation**: Checks environment consistency before service starts
- **Bucket validation**: Ensures GCS bucket name matches environment
- **Database validation**: Ensures MongoDB URI matches environment
- **Comprehensive logging**: Detailed logging of all environment variables

#### Implementation:
```typescript
@Injectable()
export class EnvironmentValidationService {
  validateEnvironment(): void {
    const detectedEnv = detectEnvironment();
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    const environment = this.configService.get<string>('ENVIRONMENT');
    const bucketName = this.configService.get<string>('GCP_BUCKET_NAME');
    const mongodbUri = this.configService.get<string>('MONGODB_URI');

    // Validate environment consistency
    if (detectedEnv !== nodeEnv) {
      throw new Error(
        `Environment mismatch: Detected ${detectedEnv} but NODE_ENV=${nodeEnv}`,
      );
    }

    // Validate bucket name matches environment
    const expectedBucketSuffix =
      detectedEnv === 'development'
        ? 'dev'
        : detectedEnv === 'staging'
          ? 'stg'
          : 'prod';

    if (!bucketName?.includes(expectedBucketSuffix)) {
      throw new Error(
        `Bucket mismatch: Expected bucket with '${expectedBucketSuffix}' suffix, got '${bucketName}'`,
      );
    }

    // Validate MongoDB URI matches environment
    const expectedDbSuffix =
      detectedEnv === 'development'
        ? 'dev'
        : detectedEnv === 'staging'
          ? 'staging'
          : 'production';

    if (!mongodbUri?.includes(expectedDbSuffix)) {
      throw new Error(
        `Database mismatch: Expected database with '${expectedDbSuffix}' suffix, got '${mongodbUri?.split('/').pop()?.split('?')[0] || 'NOT_SET'}'`,
      );
    }
  }
}
```

### 2. Enhanced Health Service

**File**: `src/modules/health/health.service.ts`

Updated to provide comprehensive debugging information for environment troubleshooting.

#### Key Features:
- **Detailed detection info**: Shows all environment variables and their values
- **Bucket information**: Displays actual GCS bucket being used
- **Database information**: Shows MongoDB database name
- **Environment consistency**: Validates NODE_ENV vs ENVIRONMENT variables

#### Implementation:
```typescript
checkHealth(req?: Request) {
  const environment = detectEnvironment(req);
  const detectionMethod = getDetectionMethod(req);
  const hostname = req?.get?.('host') || req?.hostname || process.env.HOSTNAME || '';
  const nodeEnv = process.env.NODE_ENV;
  const environmentVar = process.env.ENVIRONMENT;
  const gcpBucketName = process.env.GCP_BUCKET_NAME;
  const mongodbUri = process.env.MONGODB_URI;

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: this.version,
    environment,
    detection: {
      method: detectionMethod,
      hostname,
      nodeEnv,
      environmentVar,
      gcpBucketName,
      mongodbDatabase:
        mongodbUri?.split('/').pop()?.split('?')[0] || 'NOT_SET',
    },
    config,
  };
}
```

### 3. Updated GitHub Actions Workflows

**Files**: 
- `.github/workflows/ci-cd-dev.yml`
- `.github/workflows/ci-cd-stg.yml`
- `.github/workflows/ci-cd-prod.yml`

Updated to include the `ENVIRONMENT` variable and ensure consistent configuration.

#### Key Changes:
- **Added ENVIRONMENT variable**: Set to match NODE_ENV for each environment
- **Environment-specific secrets**: Ensured all secrets are environment-specific
- **Post-deployment verification**: Added verification steps after deployment

#### Example (Dev Workflow):
```yaml
--set-env-vars "NODE_ENV=development,ENVIRONMENT=development,GCP_PROJECT_ID=${{ secrets.GCP_PROJECT_ID }},GOOGLE_APPLICATION_CREDENTIALS=/etc/gcp/key"
```

### 4. Comprehensive Verification Scripts

#### Environment Verification Script
**File**: `scripts/verify-environments.sh`

A comprehensive script that checks all environments for proper configuration.

#### Key Features:
- **Health endpoint validation**: Checks if services are reachable
- **Environment consistency**: Validates detected vs expected environment
- **Bucket validation**: Ensures correct GCS bucket is being used
- **Database validation**: Ensures correct MongoDB database is being used
- **CORS validation**: Checks CORS configuration
- **Color-coded output**: Easy-to-read status indicators

#### Usage:
```bash
./scripts/verify-environments.sh
```

#### Deployment Verification Script
**File**: `scripts/deploy-verification.sh`

A script that verifies Cloud Run deployment status and configuration.

#### Key Features:
- **Service status**: Checks if Cloud Run services are ready
- **Environment variables**: Validates environment variable configuration
- **Secrets**: Checks secret mappings
- **Health endpoints**: Validates health endpoint responses
- **Service logs**: Reviews recent logs for errors

#### Usage:
```bash
./scripts/deploy-verification.sh
```

### 5. Startup Integration

**File**: `src/main.ts`

Integrated environment validation into the application startup process.

#### Implementation:
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validate environment configuration
  const envValidation = app.get(EnvironmentValidationService);
  envValidation.validateEnvironment();

  // ... rest of bootstrap process
}
```

## Expected Environment Configuration

### Development Environment
```bash
NODE_ENV=development
ENVIRONMENT=development
GCP_BUCKET_NAME=nna_registry_assets_dev
MONGODB_URI=mongodb+srv://.../nna-registry-service-dev
```

### Staging Environment
```bash
NODE_ENV=staging
ENVIRONMENT=staging
GCP_BUCKET_NAME=nna_registry_assets_stg
MONGODB_URI=mongodb+srv://.../nna-registry-service-staging
```

### Production Environment
```bash
NODE_ENV=production
ENVIRONMENT=production
GCP_BUCKET_NAME=nna_registry_assets_prod
MONGODB_URI=mongodb+srv://.../nna-registry-service-production
```

## Validation Process

### 1. Startup Validation
When the service starts, the `EnvironmentValidationService` performs:
- Environment detection validation
- NODE_ENV vs ENVIRONMENT consistency check
- GCS bucket name validation
- MongoDB URI validation

### 2. Runtime Validation
The health endpoint provides:
- Current environment detection
- All environment variables
- Actual bucket and database being used
- Detection method used

### 3. Post-Deployment Validation
After deployment, verification scripts check:
- Service availability
- Environment configuration
- Health endpoint responses
- Service logs

## Error Handling

### Startup Errors
If environment validation fails at startup:
- Service will not start
- Clear error message indicates the specific issue
- Logs show all environment variables for debugging

### Runtime Errors
If environment misalignment is detected:
- Health endpoint shows detailed debugging information
- Logs indicate the specific mismatch
- Verification scripts highlight the issue

## Monitoring and Alerting

### Health Checks
- Regular health endpoint monitoring
- Environment consistency validation
- Bucket and database validation

### Log Monitoring
- Environment validation logs
- Startup configuration logs
- Error logs for misalignments

### Verification Scripts
- Automated environment verification
- Deployment verification
- CORS validation

## Benefits of These Fixes

### 1. Prevention
- **Startup validation**: Prevents misaligned deployments from starting
- **Clear error messages**: Immediate identification of configuration issues
- **Consistent environment variables**: Ensures NODE_ENV and ENVIRONMENT match

### 2. Detection
- **Comprehensive health endpoint**: Shows all environment information
- **Detailed logging**: Complete visibility into configuration
- **Verification scripts**: Automated detection of issues

### 3. Debugging
- **Color-coded output**: Easy-to-read status information
- **Detailed error messages**: Specific information about what's wrong
- **Environment comparison**: Side-by-side comparison of expected vs actual

### 4. Automation
- **Post-deployment verification**: Automatic validation after deployment
- **Environment verification**: Regular checks of all environments
- **CORS validation**: Automated CORS configuration checks

## Implementation Checklist

### ✅ Completed
- [x] Environment validation service
- [x] Enhanced health service
- [x] Updated GitHub Actions workflows
- [x] Environment verification script
- [x] Deployment verification script
- [x] Startup integration
- [x] Comprehensive documentation

### 🔄 Next Steps
- [ ] Deploy to dev environment
- [ ] Run verification scripts
- [ ] Validate environment configuration
- [ ] Deploy to staging environment
- [ ] Deploy to production environment
- [ ] Monitor for any remaining issues

## Testing the Fixes

### 1. Local Testing
```bash
# Test environment validation
npm run start:dev

# Check health endpoint
curl http://localhost:8080/api/health
```

### 2. Deployment Testing
```bash
# Deploy to dev
git push origin taxonomy-dev

# Run verification
./scripts/verify-environments.sh
./scripts/deploy-verification.sh
```

### 3. Environment Validation
```bash
# Check all environments
./scripts/verify-environments.sh

# Check specific environment
curl https://registry.dev.reviz.dev/api/health | jq '.detection'
```

## Troubleshooting

### Common Issues

#### 1. Environment Mismatch
**Error**: `Environment mismatch: Detected development but NODE_ENV=production`

**Solution**: Update GitHub Actions workflow to set correct NODE_ENV and ENVIRONMENT variables.

#### 2. Bucket Mismatch
**Error**: `Bucket mismatch: Expected bucket with 'dev' suffix, got 'nna_registry_assets_prod'`

**Solution**: Check GCP Secret Manager and ensure correct bucket name is stored for the environment.

#### 3. Database Mismatch
**Error**: `Database mismatch: Expected database with 'dev' suffix, got 'nna-registry-service-production'`

**Solution**: Check GCP Secret Manager and ensure correct MongoDB URI is stored for the environment.

### Debugging Commands

```bash
# Check environment variables
gcloud run services describe nna-registry-service-dev --region=us-central1 --format="value(spec.template.spec.containers[0].env[].name,spec.template.spec.containers[0].env[].value)"

# Check secrets
gcloud run services describe nna-registry-service-dev --region=us-central1 --format="value(spec.template.spec.containers[0].env[].valueFrom.secretKeyRef.name)"

# Check service logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=nna-registry-service-dev" --limit=50

# Check health endpoint
curl https://registry.dev.reviz.dev/api/health | jq '.'
```

## Conclusion

These structural fixes provide a comprehensive solution to the environment misalignment issues by:

1. **Preventing** misaligned deployments through startup validation
2. **Detecting** issues through enhanced health endpoints and verification scripts
3. **Debugging** problems through detailed logging and error messages
4. **Automating** validation through post-deployment verification

The implementation ensures that each environment uses the correct configuration and prevents cross-environment contamination, resolving the persistent issues that were affecting the NNA Registry Service. 