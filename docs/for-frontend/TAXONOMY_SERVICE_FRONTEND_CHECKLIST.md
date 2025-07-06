# Taxonomy Service Async Integration: Frontend Checklist & Coordination

**Last Updated:** July 2025

This checklist summarizes what is needed from the frontend team for the async taxonomy service integration, what to expect during rollout, and how to coordinate with the backend team.

---

## What's Needed from the Frontend Team
- [ ] Confirm feature flag and fallback logic is working as intended in all environments
- [ ] Make API-based taxonomy the default; fallback to flat files only for emergencies
- [ ] Remove any remaining dependencies on flat files once the API is stable in all environments
- [ ] Ensure robust error handling and user feedback if the taxonomy API is unavailable
- [ ] Enable logging and monitoring of fallback events for debugging
- [ ] Collect and surface performance metrics for all taxonomy operations
- [ ] Use `TaxonomyServiceTest.tsx` to validate all API endpoints, caching, and fallback logic in dev, stg, and prod
- [ ] Update documentation to reflect the API-first approach
- [ ] Participate in joint end-to-end test/validation sessions with the backend team

---

## What to Expect
- Backend team will finalize and deploy all API endpoints, admin/versioning, and health checks (using current MongoDB setup)
- Gradual rollout: API enabled in dev, then stg, then prod, with monitoring at each stage
- Immediate rollback possible via feature flag if issues arise
- Joint monitoring and alerting for taxonomy API health in all environments
- Coordination on documentation and onboarding updates

---

## Coordination Points
- Plan and document the step-by-step process for enabling the API in each environment
- Monitor for errors and performance regressions at each stage
- Remove legacy flattened taxonomy files after stable API rollout
- Update migration guides, architecture docs, and onboarding materials
- Schedule and conduct joint end-to-end test/validation session (dev, stg, prod)

---

**For questions or updates, please edit this document or contact the project maintainers.** 