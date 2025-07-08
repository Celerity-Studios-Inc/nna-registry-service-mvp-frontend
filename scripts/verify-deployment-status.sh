#!/bin/bash

# Deployment Status Verification Script
# Generated: January 7, 2025
# Purpose: Verify three-tier deployment infrastructure and codebase consistency

echo "🔍 NNA Registry Frontend - Deployment Status Verification"
echo "========================================================="
echo ""

# Check Git status
echo "📋 Git Repository Status:"
echo "Branch: $(git branch --show-current)"
echo "Latest commit: $(git log --oneline -1)"
echo "Status: $(git status --porcelain | wc -l | xargs) files modified"
echo ""

# Check workflow files
echo "⚙️ CI/CD Workflow Files:"
if [ -f ".github/workflows/ci-cd-dev.yml" ]; then
    echo "✅ Development workflow: Present"
else
    echo "❌ Development workflow: Missing"
fi

if [ -f ".github/workflows/ci-cd-stg.yml" ]; then
    echo "✅ Staging workflow: Present"
else
    echo "❌ Staging workflow: Missing"
fi

if [ -f ".github/workflows/ci-cd-prod.yml" ]; then
    echo "✅ Production workflow: Present"
else
    echo "❌ Production workflow: Missing"
fi
echo ""

# Check composite validation fix
echo "🔧 Composite Validation Fix:"
if grep -q "onValidationChange" "src/components/CompositeAssetSelection.tsx"; then
    echo "✅ CompositeAssetSelection: onValidationChange prop present"
else
    echo "❌ CompositeAssetSelection: onValidationChange prop missing"
fi

if grep -q "compositeValidationErrors" "src/pages/RegisterAssetPage.tsx"; then
    echo "✅ RegisterAssetPage: compositeValidationErrors state present"
else
    echo "❌ RegisterAssetPage: compositeValidationErrors state missing"
fi
echo ""

# Check branch consistency
echo "🌿 Branch Consistency Check:"
DEV_COMMIT=$(git log development --oneline -1 2>/dev/null | cut -d' ' -f1)
STAGING_COMMIT=$(git log staging --oneline -1 2>/dev/null | cut -d' ' -f1)
MAIN_COMMIT=$(git log main --oneline -1 2>/dev/null | cut -d' ' -f1)

echo "Development: $DEV_COMMIT"
echo "Staging: $STAGING_COMMIT"
echo "Main: $MAIN_COMMIT"

if git merge-base --is-ancestor $DEV_COMMIT $STAGING_COMMIT 2>/dev/null; then
    echo "✅ Development changes are in staging"
else
    echo "⚠️ Development changes not fully merged to staging"
fi

if git merge-base --is-ancestor $STAGING_COMMIT $MAIN_COMMIT 2>/dev/null; then
    echo "✅ Staging changes are in main (production)"
else
    echo "⚠️ Staging changes not fully merged to main"
fi
echo ""

# Check environment URLs
echo "🌐 Environment URLs:"
echo "Development: https://nna-registry-frontend-dev.vercel.app/"
echo "Staging: https://nna-registry-frontend-stg.vercel.app/"
echo "Production: https://nna-registry-frontend.vercel.app/"
echo ""

# Test environment connectivity (basic check)
echo "🔗 Environment Connectivity Test:"
for url in "https://nna-registry-frontend-dev.vercel.app/" "https://nna-registry-frontend-stg.vercel.app/" "https://nna-registry-frontend.vercel.app/"; do
    if curl -s --head "$url" | head -n 1 | grep -q "200 OK"; then
        echo "✅ $(echo $url | sed 's/https:\/\/nna-registry-frontend//' | sed 's/.vercel.app\///' | sed 's/^$/production/'): Responding"
    else
        echo "❌ $(echo $url | sed 's/https:\/\/nna-registry-frontend//' | sed 's/.vercel.app\///' | sed 's/^$/production/'): Not responding"
    fi
done
echo ""

# Check documentation
echo "📚 Documentation Status:"
if [ -f "THREE_TIER_DEPLOYMENT_STATUS.md" ]; then
    echo "✅ Deployment documentation: Present"
else
    echo "❌ Deployment documentation: Missing"
fi

if [ -f "CLAUDE.md" ]; then
    echo "✅ Project documentation: Present"
else
    echo "❌ Project documentation: Missing"
fi
echo ""

echo "🎯 Summary:"
echo "Three-tier deployment infrastructure verification complete."
echo "Review any ❌ items above for potential issues."
echo ""
echo "For detailed status, see: THREE_TIER_DEPLOYMENT_STATUS.md"