#!/bin/bash

# Deployment script for Asynchronous Taxonomy Sync Protocol
# Run this script to deploy the complete implementation

echo "🚀 DEPLOYING ASYNCHRONOUS TAXONOMY SYNC PROTOCOL"
echo "=" && printf '=%.0s' {1..50} && echo ""

# Check git status
echo "📋 Checking git status..."
git status

# Add all files
echo "📦 Staging all files..."
git add .

# Show what will be committed
echo "📝 Files to be committed:"
git diff --name-only --cached

# Commit with comprehensive message
echo "💾 Committing implementation..."
git commit -m "ASYNC TAXONOMY SYNC: Complete implementation for all environments

🎯 Features implemented:
- TaxonomySyncService with background polling and health monitoring
- TaxonomySyncProvider with enhanced context and utility functions  
- TaxonomySyncStatus component with visual indicators
- Full integration in App.tsx, MainLayout, and key components

🔗 Backend integration:
- Environment-aware URL routing for dev/staging/production
- All granular API endpoints supported (/version, /health, /index, /layer-count, etc.)
- Real-time sync with version tracking and health monitoring
- 24-hour caching with version-based invalidation

⚡ Performance optimizations:
- O(1) lookups for pre-calculated counts
- Background sync every 5 minutes without user interaction
- Health monitoring every 2 minutes
- Intelligent fallback to cached data when backend unavailable

🛡️ Reliability features:
- Comprehensive error handling and recovery
- Visual status indicators (healthy/degraded/error/syncing)
- Manual refresh controls and detailed status dialogs
- Graceful degradation with offline support

👤 User experience:
- Real-time status indicators in header
- Loading states and progress indicators
- Enhanced taxonomy browser with backend data
- Smooth integration with existing components

🔧 Developer experience:
- Full TypeScript support throughout
- Reactive updates across components
- Comprehensive logging and debugging
- Easy integration with existing codebase

📋 Ready for deployment:
- Development: https://registry.dev.reviz.dev/api/taxonomy
- Staging: https://registry.stg.reviz.dev/api/taxonomy  
- Production: https://registry.reviz.dev/api/taxonomy

Files implemented:
- src/services/taxonomySyncService.ts
- src/hooks/useTaxonomySync.ts
- src/components/providers/TaxonomySyncProvider.tsx
- src/components/common/TaxonomySyncStatus.tsx
- Updated: App.tsx, MainLayout.tsx, TaxonomyBrowserPage.tsx, LayerSelectorV2.tsx
- Documentation: Complete deployment guides and backend coordination

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub to trigger builds
echo "🌐 Pushing to GitHub to trigger CI/CD builds..."
git push origin main

# Check push status
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🔄 This will trigger builds on:"
    echo "   • Development: https://nna-registry-frontend-dev.vercel.app"
    echo "   • Staging: https://nna-registry-frontend-stg.vercel.app" 
    echo "   • Production: https://nna-registry-frontend.vercel.app"
    echo ""
    echo "📊 Monitor deployment status:"
    echo "   • GitHub Actions: https://github.com/Celerity-Studios-Inc/nna-registry-service-mvp-frontend/actions"
    echo "   • Vercel Dashboard: https://vercel.com/dashboard"
    echo ""
    echo "🧪 After deployment, test the new features:"
    echo "   1. Check TaxonomySyncStatus in header"
    echo "   2. Verify taxonomy browser real-time sync"
    echo "   3. Test manual refresh functionality"
    echo "   4. Monitor console logs for sync operations"
    echo ""
    echo "🎯 Ready for manual testing and verification!"
else
    echo "❌ Failed to push to GitHub. Please check your git configuration."
    exit 1
fi