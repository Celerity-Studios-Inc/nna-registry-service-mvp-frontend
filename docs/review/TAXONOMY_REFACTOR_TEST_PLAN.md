# Taxonomy Refactoring Project: Phase 7 Test Plan

## Overview

This document outlines a structured approach for testing the taxonomy refactoring implementation (Phases 1-6) with specific focus on comparing the new implementation against the original one using the feature toggle system.

## Testing Goals

1. Verify that the new implementation resolves the React Error #301 issue
2. Confirm that subcategory selection works correctly for all layer/category combinations
3. Ensure the form flow and navigation work as expected
4. Validate data submission functionality
5. Compare performance metrics between implementations
6. Identify any remaining issues or edge cases

## Test Categories

### 1. Taxonomy Selection Tests

#### 1.1 Basic Layer Selection

| Test ID | Description | Expected Outcome | Test in Old UI | Test in New UI |
|---------|-------------|------------------|----------------|----------------|
| TS-01 | Select each layer (S, G, L, M, W, B, P, T, C, R) | Layer card highlights, categories load | □ | □ |
| TS-02 | Double-click layer selection | Layer card highlights, advances to next step | □ | □ |
| TS-03 | Switch between layers | Previous selection clears, new categories load | □ | □ |
| TS-04 | Visual indicators for selection | Selected layer has clear visual indicator | □ | □ |
| TS-05 | Error state for layer loading | Shows error message with retry option | □ | □ |

#### 1.2 Category Selection

| Test ID | Description | Expected Outcome | Test in Old UI | Test in New UI |
|---------|-------------|------------------|----------------|----------------|
| TS-06 | Select category in each layer | Category card highlights, subcategories load | □ | □ |
| TS-07 | Switch between categories | Previous subcategory selection clears, new subcategories load | □ | □ |
| TS-08 | Categories for Star (S) layer | All categories load and display correctly | □ | □ |
| TS-09 | Select POP category in Star layer | Subcategories load without errors (previous issue) | □ | □ |
| TS-10 | Error state for category loading | Shows error message with retry option | □ | □ |

#### 1.3 Subcategory Selection

| Test ID | Description | Expected Outcome | Test in Old UI | Test in New UI |
|---------|-------------|------------------|----------------|----------------|
| TS-11 | Select subcategory in each layer | Subcategory card highlights, HFN/MFA updates | □ | □ |
| TS-12 | Select HPM subcategory in Star/POP | Works without errors (previous issue) | □ | □ |
| TS-13 | Double-click subcategory selection | Advances to next step | □ | □ |
| TS-14 | Subcategory grid layout | Displays in grid format, not vertical list | □ | □ |
| TS-15 | Error state for subcategory loading | Shows error message with retry option | □ | □ |

#### 1.4 Problematic Combinations (Special Focus)

| Test ID | Description | Expected Outcome | Test in Old UI | Test in New UI |
|---------|-------------|------------------|----------------|----------------|
| TS-16 | S.POP.HPM selection | No React Error #301, subcategories remain visible | □ | □ |
| TS-17 | W.BCH.SUN selection | No errors, correct HFN/MFA generation | □ | □ |
| TS-18 | Star layer with all categories | No errors for any category | □ | □ |
| TS-19 | Rapid switching between layers | No stale data, proper reset between switches | □ | □ |
| TS-20 | Selection after refresh | Maintains selections after page refresh | □ | □ |

### 2. Form Flow Tests

#### 2.1 Navigation

| Test ID | Description | Expected Outcome | Test in Old UI | Test in New UI |
|---------|-------------|------------------|----------------|----------------|
| FF-01 | Next button state | Disabled until required selections made | □ | □ |
| FF-02 | Back button functionality | Returns to previous step without losing data | □ | □ |
| FF-03 | Progress indicator | Shows current step correctly | □ | □ |
| FF-04 | Direct URL access to each step | Handles direct access appropriately | □ | □ |
| FF-05 | Layer-specific steps (C and T layers) | Shows additional steps for these layers | □ | □ |

#### 2.2 State Management

| Test ID | Description | Expected Outcome | Test in Old UI | Test in New UI |
|---------|-------------|------------------|----------------|----------------|
| FF-06 | Form state persistence between steps | Data persists when moving forward/back | □ | □ |
| FF-07 | Layer change clears related fields | Category/subcategory clear when layer changes | □ | □ |
| FF-08 | Browser refresh with partial completion | Restores state from storage | □ | □ |
| FF-09 | Browser back/forward navigation | Maintains form state | □ | □ |
| FF-10 | Field validation on step change | Shows appropriate validation errors | □ | □ |

### 3. Data Validation Tests

| Test ID | Description | Expected Outcome | Test in Old UI | Test in New UI |
|---------|-------------|------------------|----------------|----------------|
| DV-01 | Submit without required fields | Shows validation errors | □ | □ |
| DV-02 | Required field indicators | Visually indicates required fields | □ | □ |
| DV-03 | Field-specific validation | Shows appropriate errors for each field type | □ | □ |
| DV-04 | HFN/MFA format validation | Validates format before submission | □ | □ |
| DV-05 | File upload validation | Validates file type, size, count | □ | □ |

### 4. HFN/MFA Generation Tests

| Test ID | Description | Expected Outcome | Test in Old UI | Test in New UI |
|---------|-------------|------------------|----------------|----------------|
| HM-01 | HFN preview format | Shows correct format (Layer.Category.Subcategory.001) | □ | □ |
| HM-02 | MFA preview format | Shows correct numeric format | □ | □ |
| HM-03 | Special case: S.POP.HPM | Generates correct MFA (2.001.007.001) | □ | □ |
| HM-04 | Special case: W.BCH.SUN | Generates correct MFA (5.004.003.001) | □ | □ |
| HM-05 | Consistency across refresh | Same HFN/MFA before/after refresh | □ | □ |

### 5. Form Submission Tests

| Test ID | Description | Expected Outcome | Test in Old UI | Test in New UI |
|---------|-------------|------------------|----------------|----------------|
| FS-01 | Complete submission flow | Successfully creates asset | □ | □ |
| FS-02 | Submission with each layer type | Works for all layers (S, G, L, etc.) | □ | □ |
| FS-03 | Submission with problematic combinations | S.POP.HPM submits correctly | □ | □ |
| FS-04 | Loading indicators during submission | Shows appropriate loading state | □ | □ |
| FS-05 | Success screen | Shows correct asset details after submission | □ | □ |

### 6. Error Handling Tests

| Test ID | Description | Expected Outcome | Test in Old UI | Test in New UI |
|---------|-------------|------------------|----------------|----------------|
| EH-01 | Network error during API calls | Shows appropriate error message | □ | □ |
| EH-02 | Server validation errors | Displays server-side validation errors | □ | □ |
| EH-03 | File upload errors | Shows appropriate error message | □ | □ |
| EH-04 | Concurrent form submission | Prevents duplicate submissions | □ | □ |
| EH-05 | React Error #301 conditions | No errors under previous problematic conditions | □ | □ |

### 7. Performance Tests

| Test ID | Description | Metrics to Compare | Old UI | New UI |
|---------|-------------|-------------------|--------|--------|
| PT-01 | Initial load time | Time to interactive (TTI) | _ sec | _ sec |
| PT-02 | Layer selection responsiveness | Time from click to category display | _ ms | _ ms |
| PT-03 | Form submission performance | Time from click to success screen | _ sec | _ sec |
| PT-04 | React render count | Number of renders during form completion | _ | _ |
| PT-05 | Memory usage | Peak memory during form completion | _ MB | _ MB |

## Special Test Cases

### Critical Combinations to Test

These combinations have caused issues in the past and should be thoroughly tested:

1. **S.POP.HPM (Star + Pop + Hip-Hop Male)**
   - Select Star layer
   - Select POP category
   - Select HPM subcategory
   - Verify no React Error #301
   - Verify subcategories remain visible
   - Verify correct HFN/MFA generation (S.POP.HPM.001, 2.001.007.001)

2. **W.BCH.SUN (World + Beach + Sunny)**
   - Select World layer
   - Select BCH category
   - Select SUN subcategory
   - Verify correct HFN/MFA generation (W.BCH.SUN.001, 5.004.003.001)

3. **Rapid Layer Switching**
   - Quickly switch between S, G, and L layers
   - Verify no stale data
   - Verify proper UI reset between switches
   - Verify no React errors in console

4. **Subcategory Grid Layout**
   - Test with various layers and categories
   - Verify subcategories display in grid format
   - Verify responsive behavior on different screen sizes

## Test Environment

- **Browsers**: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- **Devices**: Desktop, Tablet, Mobile (responsive testing)
- **Network Conditions**: Good connection, throttled connection
- **User Roles**: Anonymous, Authenticated
- **Feature Toggle**: Test both with `uiVersion=old` and `uiVersion=new`

## Testing Tools

### Developer Tools for Performance Metrics
- Chrome DevTools Performance tab for timing metrics
- React DevTools Profiler for render count and component timing
- Memory usage monitoring via Chrome Task Manager

### Console Monitoring
- Set up enhanced error logging in the console
- Monitor for React warnings and errors
- Look for taxonomy-specific log messages

### Performance Tracking
For each UI version, track:
1. Time to interactive (TTI) for each page
2. Number of React renders during form interaction
3. Console errors/warnings during usage
4. Memory usage during form interaction

## Test Procedure

1. **Preparation**
   - Set up browser with DevTools open to Console and Performance tabs
   - Clear browser cache and cookies
   - Visit `/taxonomy-selector-test` page

2. **Feature Toggle Testing**
   - Test UI toggle switch functionality
   - Verify URL parameter behavior (add `?uiVersion=new` or `?uiVersion=old`)
   - Verify localStorage persistence

3. **Basic Functionality Testing**
   - Work through each test case in both UI versions
   - Document results in the test tables
   - Capture screenshots of any issues

4. **Performance Measurement**
   - Record baseline metrics for each implementation
   - Perform identical operations in both versions
   - Compare metrics and document differences

5. **Edge Cases**
   - Test error scenarios (network errors, validation errors)
   - Test problematic combinations repeatedly
   - Test with various browser window sizes

## Documentation Format

Results will be documented in a TEST_RESULTS.md file with the following structure:

```markdown
# Taxonomy Refactoring Test Results

## Summary
- Total Tests: XX
- Passed in Old UI: XX
- Passed in New UI: XX
- Improvements in New UI: XX
- Regressions in New UI: XX

## Detailed Results

### [Test Category]

#### [Test ID]: [Description]
- **Old UI Result**: Pass/Fail
- **New UI Result**: Pass/Fail
- **Notes**: Any observations or issues
- **Screenshots**: [Links to screenshots]

## Performance Comparison
[Table comparing metrics between implementations]

## Issues Identified
[List of bugs or issues discovered]

## Recommendations
[Recommendations based on test results]
```

## Success Criteria

The new implementation will be considered successful if:

1. All test cases pass in the new UI implementation
2. No React Error #301 occurs in any test scenario
3. Performance metrics are equal to or better than the old implementation
4. All problematic combinations work correctly
5. HFN/MFA generation is correct for all test cases
6. Form submission completes successfully for all layer types
7. UI is visually consistent and maintains grid layout for subcategories

## Next Steps

Based on test results, we will:

1. Document any issues or discrepancies found
2. Make necessary adjustments to the implementation
3. Re-test any areas with identified issues
4. Proceed to Phase 8 (Final Cleanup and Rollout) if all tests pass
5. Update documentation with final implementation details