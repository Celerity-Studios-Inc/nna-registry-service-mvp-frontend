# Taxonomy Service Async Integration: Cleanup & Finalization Checklist

**Last Updated:** July 2025

This checklist tracks the remaining work to fully productionize the async taxonomy service integration, excluding PostgreSQL/Redis migration (to be handled in a future phase).

---

## Backend Tasks (Current MongoDB Setup)
- [ ] All API endpoints implemented, tested, and documented (per `TAXONOMY_SERVICE_SPECIFICATIONS.md`)
- [ ] Health, version, and sequential numbering endpoints robust and environment-aware
- [ ] Admin endpoints for taxonomy editing, versioning, and rollback are secure and tested
- [ ] Audit logging and version history enabled
- [ ] All secrets, env vars, and service accounts set up for dev, stg, prod
- [ ] Post-deploy health checks and monitoring enabled in all environments

## Frontend Tasks
- [ ] Feature flag logic finalized: API is default, fallback only for emergencies
- [ ] Fallback to flat files removed once API is stable in all environments
- [ ] Error handling and user feedback robust for taxonomy API unavailability
- [ ] Logging and monitoring of fallback events enabled
- [ ] Performance metrics collected and surfaced for all taxonomy operations
- [ ] `TaxonomyServiceTest.tsx` used to validate all API endpoints, caching, and fallback logic in dev, stg, prod
- [ ] Documentation updated to reflect API-first approach

## Joint/Coordination Tasks
- [ ] Plan and document the step-by-step process for enabling the API in each environment
- [ ] Monitor for errors and performance regressions at each stage
- [ ] Remove legacy flattened taxonomy files after stable API rollout
- [ ] Update migration guides, architecture docs, and onboarding materials
- [ ] Set up health checks and alerting for taxonomy API in all environments
- [ ] Schedule and conduct joint end-to-end test/validation session (dev, stg, prod)

## Deferred (Next Phase: DB/Redis Migration)
- [ ] Deploy PostgreSQL schema and indexes in all environments
- [ ] Implement Redis caching and cache invalidation on taxonomy changes
- [ ] Migrate data from MongoDB to PostgreSQL
- [ ] Update backend and frontend to use new DB/cache

---

**For questions or updates, please edit this document or contact the project maintainers.** 