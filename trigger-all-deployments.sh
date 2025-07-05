#!/bin/bash

echo "🚀 TRIGGERING ALL ENVIRONMENT DEPLOYMENTS"
echo "=" && printf '=%.0s' {1..50} && echo ""

# First, make sure all changes are committed and pushed
echo "📦 Ensuring latest changes are committed..."

# Check if there are any uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Uncommitted changes detected. Committing now..."
    git add .
    git commit -m "ASYNC TAXONOMY SYNC: Complete implementation for all environments

🎯 Features implemented:
- TaxonomySyncService with background polling and health monitoring
- TaxonomySyncProvider with enhanced context and utility functions  
- TaxonomySyncStatus component with visual indicators
- Full integration in App.tsx, MainLayout, and key components

🔗 Backend integration:
- Environment-aware URL routing for dev/staging/production
- All granular API endpoints supported
- Real-time sync with version tracking and health monitoring

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
else
    echo "✅ All changes already committed"
fi

# Push to main branch (triggers development and production)
echo "🌐 Pushing to main branch..."
git push origin main

echo ""
echo "⏳ Waiting for main CI/CD to start..."
sleep 5

# Manually trigger staging workflow using GitHub CLI
echo "🎯 Triggering staging deployment manually..."
if command -v gh &> /dev/null; then
    echo "📱 Using GitHub CLI to trigger staging workflow..."
    gh workflow run "Staging Environment Deploy" --ref main
    echo "✅ Staging workflow triggered"
else
    echo "⚠️  GitHub CLI not found. Staging will need to be triggered manually."
    echo "   Go to: https://github.com/Celerity-Studios-Inc/nna-registry-service-mvp-frontend/actions"
    echo "   Click 'Staging Environment Deploy' → 'Run workflow' → 'Run workflow'"
fi

echo ""
echo "📊 Monitor deployments at:"
echo "   • GitHub Actions: https://github.com/Celerity-Studios-Inc/nna-registry-service-mvp-frontend/actions"
echo "   • Main CI/CD: Should be running now"
echo "   • Staging Deploy: Should be triggered"

echo ""
echo "🌐 Expected deployment URLs:"
echo "   • Development: https://nna-registry-frontend-dev.vercel.app"
echo "   • Staging: https://nna-registry-frontend-stg.vercel.app"
echo "   • Production: https://nna-registry-frontend.vercel.app"

echo ""
echo "🔍 If staging workflow doesn't appear:"
echo "   1. Go to GitHub Actions page"
echo "   2. Click 'All workflows' in the left sidebar"
echo "   3. Find 'Staging Environment Deploy'"
echo "   4. Click 'Run workflow' button"
echo "   5. Select 'main' branch and click 'Run workflow'"

echo ""
echo "✅ All deployment triggers initiated!"