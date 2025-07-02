# Vercel Preview Deployment Trigger

**Date**: July 2, 2025  
**Purpose**: Force new Vercel Preview deployment for development environment  
**Commit**: Environment variable fix for CORS issues  

## Issue
Development environment (nna-registry-frontend-dev.vercel.app) was using wrong backend URL:
- **Wrong**: https://registry.reviz.dev (production)
- **Correct**: https://registry.dev.reviz.dev (development)

## Fix Applied
Updated environment.config.ts to properly read Vercel Preview environment variables:
- REACT_APP_ENVIRONMENT=development
- REACT_APP_BACKEND_URL=https://registry.dev.reviz.dev

This file is created to trigger a new Vercel Preview deployment.

**Update**: Fresh development deployment trigger for CORS fix verification.