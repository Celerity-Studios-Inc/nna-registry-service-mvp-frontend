# Scripts Directory

This directory contains various utility scripts for the NNA Registry Service MVP Frontend project.

## Directory Structure

- `/scripts/backend/` - Scripts for interacting with the backend repository and deployment
- `/scripts/deployment/` - Scripts for deploying the frontend application
- `/scripts/testing/` - Scripts for testing the application

## Important Scripts

### Backend Scripts

- `setup-backend-repo.sh` - Sets up the backend repository
- `clone-stable-backend.sh` - Clones the stable backend repository
- `connect-to-backend.sh` - Configures the frontend to connect to the backend
- `push-backend-cicd.sh` - Pushes changes to the backend CI/CD pipeline

### Deployment Scripts

- `deploy-backend.sh` - Deploys the backend application
- `manual-deploy.sh` - Manually deploys the application
- `setup-for-deployment.sh` - Sets up the application for deployment
- `setup-gcp-deployment.sh` - Sets up Google Cloud Platform deployment

### Testing Scripts

- `test-asset-creation.js` - Tests asset creation functionality
- `test-taxonomy-restore.js` - Tests taxonomy restoration
- `test-dual-addressing.js` - Tests dual addressing functionality
- `test-frontend-only.sh` - Tests the frontend in isolation

## Usage Guidelines

When adding new scripts, please follow these guidelines:

1. Place scripts in the appropriate subdirectory based on their function
2. Include a comment at the top of the script explaining its purpose
3. Use descriptive variable names and include comments for complex operations
4. Include error handling and validation where appropriate
5. Document any dependencies or prerequisites

## Script Naming Conventions

- Use kebab-case for script names (e.g., `deploy-backend.sh`)
- Include the file extension appropriate for the script type (`.sh`, `.js`, `.mjs`)
- Use descriptive names that indicate the script's function