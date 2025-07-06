# Three-Environment Promotion Flow (Unified Architecture)

**Last Updated:** July 2025

## Overview

This document describes the unified promotion flow for the NNA Registry Service, covering both backend and frontend. It ensures a single source of truth, clear promotion steps, and robust CI/CD for development, staging, and production environments.

---

## Environments

- **Development**: Active feature development, integration, and initial QA.
- **Staging**: Pre-production validation, QA, and user acceptance testing.
- **Production**: Live, end-user environment.

---

## Branching & Promotion Strategy

- **feature/* branches**: For new features, bugfixes, or experiments.
- **dev**: Main integration branch for development. All feature branches are merged here.
- **staging**: Receives tested code from `dev` for pre-production validation.
- **main**: Production branch. Only thoroughly tested and approved code is merged here.

### Promotion Flow

1. **Development**
   - Developers branch from `dev` (e.g., `feature/my-feature`).
   - Work is done and PRs are opened against `dev`.
   - CI/CD auto-deploys `dev` to the development environment.

2. **Promotion to Staging**
   - After successful dev testing, a PR is opened from `dev` to `staging`.
   - After review and approval, the PR is merged.
   - CI/CD auto-deploys `staging` to the staging environment.

3. **Promotion to Production**
   - After successful staging validation, a PR is opened from `staging` to `main`.
   - After review and approval, the PR is merged.
   - CI/CD auto-deploys `main` to the production environment.

---

## CI/CD Automation

- Each environment has its own workflow file (e.g., `ci-cd-dev.yml`, `ci-cd-stg.yml`, `ci-cd.yml`).
- Deployments are triggered by merges to the respective branches.
- Post-deploy health checks ensure the environment is healthy after each deploy.
- All secrets and environment variables are managed per environment.

---

## Rollbacks & Hotfixes

- If a bug is found in staging or production, revert the problematic commit or branch.
- Hotfixes can be made directly on `main` (for production) and then merged back into `staging` and `dev` to keep all branches aligned.

---

## Best Practices

- Never commit directly to `staging` or `main`—always use PRs.
- Always test in `dev` and `staging` before promoting to production.
- Keep documentation and environment configuration up to date.
- Use tags or release notes for major production deployments.
- Align backend and frontend promotions for major releases.

---

## References
- Frontend flow: `docs/for-frontend/THREE_ENVIRONMENT_PROMOTION_FLOW.md`
- Backend flow: `docs/for-backend/THREE_ENVIRONMENT_STRATEGY.md`
- Architecture: `docs/architecture/THREE_ENVIRONMENT_STRATEGY.md`

---

**For questions or improvements, update this document or contact the project maintainers.** 