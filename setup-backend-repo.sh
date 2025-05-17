#!/bin/bash
# Script to set up the backend repository and push to GitHub

cd ../nna-registry-service-mvp-backend || exit 1

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Add subcategory normalization fix for NNA Registry Service backend" -m "This implementation fixes the issue where S.POP subcategories (LGF, LGM, DIV, IDF) were being normalized to Base (BAS) instead of preserving the original selection."

# Add remote (you may need to authenticate)
git remote add origin https://github.com/EqualsAjayMadhok/nna-registry-service-mvp-backend.git

# Push to GitHub (you'll need to enter credentials)
echo "Ready to push to GitHub. You may need to enter your GitHub credentials."
git push -u origin main

echo "Repository setup complete!"