# Three-Environment Promotion Flow (Frontend)

**Last Updated:** July 2025

## Overview

This document describes the recommended workflow for promoting frontend code through the three environments: development, staging, and production. It ensures that all environments are aligned, changes are tested before production, and the process is clear for all contributors.

---

## Environments

- **Development**: For active feature development and integration testing.
- **Staging**: For pre-production validation, QA, and user acceptance testing.
- **Production**: For live, end-user traffic.

---

## Branching Strategy

- **feature/* branches**: For new features, bugfixes, or experiments.
- **dev**: Main integration branch for development. All feature branches are merged here.
- **staging**: Receives tested code from `dev` for pre-production validation.
- **main**: Production branch. Only thoroughly tested and approved code is merged here.

---

## Promotion Flow

1. **Development**
   - Developers branch from `dev` (e.g., `feature/my-new-ui`).
   - Work is done and PRs are opened against `dev`.
   - CI/CD auto-deploys `dev` to the development environment.

2. **Promotion to Staging**
   - Once features are tested in `dev`, a PR is opened from `dev` to `staging`.
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

---

## Rollbacks & Hotfixes

- If a bug is found in staging or production, revert the problematic commit or branch.
- Hotfixes can be made directly on `main` (for production) and then merged back into `staging` and `dev` to keep all branches aligned.

---

## Alignment with Backend

- The backend follows the same three-environment strategy and promotion flow.
- Both frontend and backend should be promoted together for major releases to ensure compatibility.

---

## Best Practices

- Never commit directly to `staging` or `main`—always use PRs.
- Always test in `dev` and `staging` before promoting to production.
- Keep documentation and environment configuration up to date.
- Use tags or release notes for major production deployments.

---

## References
- See also: `docs/architecture/THREE_ENVIRONMENT_STRATEGY.md`
- Backend flow: `docs/for-backend/THREE_ENVIRONMENT_STRATEGY.md`

---

**For questions or improvements, update this document or contact the project maintainers.** 