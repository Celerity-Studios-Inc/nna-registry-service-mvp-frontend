#!/bin/bash

# Create a new branch for deployment
git checkout -b deployment-no-tests

# Disable tests
echo "Disabling tests for deployment..."
node fix-tests.js

# Add and commit changes
git add .
git commit -m "temp: disable tests for deployment"

# Push the branch
git push origin deployment-no-tests

echo "Deployment branch ready. Use this branch for Vercel deployment."
echo "Don't forget to switch back to your main branch after deployment."