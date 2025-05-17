#!/bin/bash
# Script to update the backend CI/CD configuration

# Check if backend directory exists
if [ ! -d "../nna-registry-service-mvp-backend" ]; then
  echo "Error: Backend directory not found at ../nna-registry-service-mvp-backend"
  exit 1
fi

# Update the GitHub Actions workflow file
cp backend-deployment/ci-cd.yml ../nna-registry-service-mvp-backend/.github/workflows/
echo "✅ Updated GitHub Actions workflow file"

# Copy the setup documentation
cp backend-deployment/SETUP_GUIDE.md ../nna-registry-service-mvp-backend/GITHUB_ACTIONS_SETUP.md
echo "✅ Copied setup documentation"

echo ""
echo "Files have been updated in the backend repository."
echo ""
echo "Next steps:"
echo "1. Navigate to the backend repository:"
echo "   cd ../nna-registry-service-mvp-backend"
echo ""
echo "2. Check the status of changes:"
echo "   git status"
echo ""
echo "3. Stage the changes:"
echo "   git add .github/workflows/ci-cd.yml GITHUB_ACTIONS_SETUP.md"
echo ""
echo "4. Commit the changes:"
echo "   git commit -m \"Update GitHub Actions workflow for CI/CD\""
echo ""
echo "5. Push the changes to GitHub:"
echo "   git push"
echo ""
echo "6. Configure your GitHub Secrets in the repository settings"