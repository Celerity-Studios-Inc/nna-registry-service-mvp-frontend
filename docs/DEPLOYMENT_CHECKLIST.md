# Deployment Checklist for Flattened Taxonomy

## Pre-Deployment Verification

- [ ] Run `node scripts/test-all-mappings.js` to verify all mappings
- [ ] Verify W.BCH.SUN.001 maps correctly to 5.004.003.001
- [ ] Verify S.POP.HPM.001 maps correctly to 2.001.007.001
- [ ] Test the asset registration flow for all 10 MVP layers
- [ ] Check the taxonomy validator for all layers
- [ ] Review console for any errors or warnings
- [ ] Verify performance with larger data sets

## Deployment Steps

1. **Merge the Branch**
   - [ ] Create pull request from `flattened-taxonomy` to `main`
   - [ ] Get code review approval
   - [ ] Merge the PR

2. **Deploy to Staging**
   - [ ] Deploy to staging environment
   - [ ] Run all verification tests in staging
   - [ ] Fix any issues found

3. **Deploy to Production**
   - [ ] Deploy to production environment
   - [ ] Monitor logs for any errors
   - [ ] Verify key functionality in production

## Post-Deployment Verification

- [ ] Verify W.BCH.SUN.001 mapping in production
- [ ] Verify S.POP.HPM.001 mapping (2.001.007.001) in production
- [ ] Test asset registration for each layer
- [ ] Confirm taxonomy validator works correctly
- [ ] Check analytics for any unusual patterns
- [ ] Monitor error rates for 24 hours

## Rollback Plan

If issues are found:

1. Revert the merge commit
2. Deploy the previous version
3. Investigate issues in a development environment
4. Fix issues and redeploy

## Specific Tests to Run

1. **HFN to MFA Conversion Tests**
   - [ ] Test W.BCH.SUN.001 → 5.004.003.001
   - [ ] Test S.POP.HPM.001 → 2.001.007.001
   - [ ] Test at least one mapping for each layer

2. **UI Component Tests**
   - [ ] Test LayerSelector component
   - [ ] Test SimpleTaxonomySelection for all layers
   - [ ] Test TaxonomyValidator component

3. **Integration Tests**
   - [ ] Register at least one asset for each layer
   - [ ] Check that the HFN and MFA are displayed correctly
   - [ ] Verify that the backend receives correct data

## Contact Information

- **Primary Contact**: [Team Lead] ([Email])
- **Secondary Contact**: [Developer] ([Email])
- **Emergency Contact**: [Emergency Contact] ([Email] / [Phone])

## Final Approval Checklist

- [ ] Code review completed
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Performance verified
- [ ] Security reviewed
- [ ] Stakeholder approval obtained