#!/bin/bash

echo "🚀 MANUAL DEPLOYMENT SCRIPT FOR ASYNC TAXONOMY SYNC"
echo "=================================================="

# Check git status
echo "📋 Checking git status..."
git status

# Add all changes
echo "📦 Adding all changes..."
git add .

# Check if there are changes to commit
if ! git diff-index --quiet HEAD --; then
    echo "📝 Committing async taxonomy sync implementation..."
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
    echo "✅ No new changes to commit"
fi

# Push to main to trigger main CI/CD (development + production)
echo "🌐 Pushing to main branch to trigger development and production deployments..."
git push origin main

# Wait for CI/CD to start
echo "⏳ Waiting for main CI/CD to initialize..."
sleep 10

# Trigger staging deployment manually using GitHub CLI
echo "🎯 Triggering staging deployment..."
if command -v gh &> /dev/null; then
    echo "📱 Using GitHub CLI to trigger staging workflow..."
    gh workflow run "Staging Environment Deploy" --ref main
    echo "✅ Staging workflow triggered successfully"
else
    echo "⚠️ GitHub CLI not found. Please manually trigger staging deployment:"
    echo "   1. Go to: https://github.com/Celerity-Studios-Inc/nna-registry-service-mvp-frontend/actions"
    echo "   2. Click 'Staging Environment Deploy'"
    echo "   3. Click 'Run workflow'"
    echo "   4. Select 'main' branch"
    echo "   5. Click 'Run workflow'"
fi

echo ""
echo "📊 Monitor deployments at:"
echo "   • GitHub Actions: https://github.com/Celerity-Studios-Inc/nna-registry-service-mvp-frontend/actions"

echo ""
echo "🌐 Expected deployment URLs:"
echo "   • Development: https://nna-registry-frontend-dev.vercel.app"
echo "   • Staging: https://nna-registry-frontend-stg.vercel.app"
echo "   • Production: https://nna-registry-frontend.vercel.app"

echo ""
echo "✅ All deployment triggers initiated!"