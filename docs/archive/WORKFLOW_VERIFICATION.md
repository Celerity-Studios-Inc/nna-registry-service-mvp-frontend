# Workflow Verification

This file is created to verify that only the main CI/CD workflow is triggered when pushing to the main branch.

- Disabled the CI workflow
- Disabled the Run Tests workflow
- Kept only the NNA Frontend CI/CD workflow active

The main CI/CD workflow should now build and deploy the application without running any tests.