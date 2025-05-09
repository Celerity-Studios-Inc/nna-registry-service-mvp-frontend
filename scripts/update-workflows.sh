#!/bin/bash

# Script to disable old workflow files and use the new consolidated CI/CD workflow
# Run this script from the root of the repository

# Create backup directory
mkdir -p .github/workflows/disabled

# Move old workflow files to the disabled directory
for file in .github/workflows/build-test.yml \
            .github/workflows/deploy.yml \
            .github/workflows/main-deploy.yml \
            .github/workflows/vercel-deploy.yml \
            .github/workflows/build-test-only.yml; do
  if [ -f "$file" ]; then
    echo "Disabling workflow: $file"
    mv "$file" ".github/workflows/disabled/$(basename $file)"
  fi
done

echo "Old workflows have been moved to .github/workflows/disabled/"
echo "The new consolidated CI/CD workflow is now active."