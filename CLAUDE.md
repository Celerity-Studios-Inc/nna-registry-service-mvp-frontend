# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
The NNA Registry Service is a platform for managing digital assets within a Naming, Numbering, and Addressing (NNA) Framework. It implements a dual addressing system (Human-Friendly Names and NNA Addresses) for digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, etc.).

This workspace contains a frontend implementation built with React and TypeScript.

**🚀 STATUS: ENHANCED AI INTEGRATION PHASE 2A DEPLOYED + BACKEND REQUIREMENTS DOCUMENTED** (July 13, 2025)

### **🎯 CURRENT SESSION: Enhanced AI Integration Complete + Backend Requirements Documentation**
**Development Status**: ✅ **PHASE 2A COMPLETE** - Enhanced AI with Creator's Description + AI collaboration system
**Critical Achievement**: Revolutionary AI architecture implemented with comprehensive UI enhancements
**Backend Status**: ⚠️ **Urgent backend integration needed** - Documentation and requirements provided to backend team
**Current Priority**: Fix Creator's Description display + Success page redesign + Edit page enhancement
**Session Risk**: High context session - continuous documentation updates required

### **🚨 CRITICAL SESSION CONTEXT (July 13, 2025) - UPDATED**
**Enhanced AI Integration Phase 2A**: ✅ COMPLETE - BPM extraction, album art fetching deployed
**Current Crisis**: Creator's Description fix FAILED - testing revealed major issues

**❌ CRITICAL ISSUES IDENTIFIED (User Testing Auto-Deploy #27)**:
1. **Creator's Description Storage BROKEN**: Still showing HFN "L.CAS.ATL.001" instead of "Olivia wearing an oversized jersey from the brand 'Adidas'"
2. **Success Page Layout**: Old 2-column layout still active, needs 3-card redesign
3. **Edit Details Page**: Missing Creator's Description field completely
4. **Review Details Page**: Needs layout enhancement - Asset Metadata to full left column

**Evidence from Console Logs**:
```
Asset Name: Olivia wearing an oversized jersey from the brand "Adidas"  ✅ During creation
HFN from metadata: L.CAS.ATL.001  ❌ Wrong value displayed in Asset Details
```

**Root Cause Analysis**: My metadata storage implementation is not working correctly - either:
- Metadata not being stored properly during asset creation
- Display logic not reading from metadata.creatorDescription correctly
- Backend overwriting metadata after my fix stores it

### **🏗️ ENHANCED AI INTEGRATION ARCHITECTURE**
- ✅ **Basic AI Working**: OpenAI GPT-4o excellent for Looks (L) layer
- ✅ **Revolutionary Design**: Creator's Description + AI collaboration vs direct file analysis
- ✅ **Layer-Specific Strategies**: G (MusicBrainz+WebSearch), S/L (image+context), M/W (thumbnail+context), C (component aggregation)
- ✅ **Hybrid Processing**: Claude (parsing) + OpenAI (generation) architecture

### **📋 PHASE 2A COMPLETION STATUS (July 14, 2025) - READY FOR PHASE 2B**
**All Critical UI Issues Resolved**:
1. ✅ **Creator's Description Fixed**: Storage and display working across all pages (Success, Details, Edit)
2. ✅ **Success Page Layout Complete**: 2-column layout with Asset Preview + NNA Addressing + Asset Metadata
3. ✅ **Review Details Enhanced**: Step 4 optimized with full-height Asset Metadata card
4. ✅ **Edit Details Consistent**: Breadcrumbs, Creator's Description field, and MFA display added

**Current Implementation Status**: All UI consistency issues resolved, temporary workarounds in place
**Backend Integration Ready**: 3-week Phase 2B plan approved by backend team

### **⚠️ DEFERRED ISSUES FOR PHASE 2B**
- **OpenAI Video Processing**: M, W, C layer video assets failing with 400 errors (Auto-Deploy #38)
- **AI Description Success Page**: Backend field mapping needed for permanent fix
- **Album Art Integration**: Requires backend album art processing pipeline
- **Enhanced AI Metadata Storage**: Backend `aiMetadata` object implementation needed

### **🔗 CRITICAL REFERENCE DOCUMENTS**
- `SESSION_HANDOVER_CONTEXT.md` - **CURRENT SESSION HANDOVER** for Phase 2B preparation
- `docs/for-frontend/BACKEND_TEAM_RESPONSE_ANALYSIS.md` - Backend 3-week implementation plan
- `docs/for-frontend/staging-assets-analysis.md` - 1,100+ assets analysis and recommendations
- `ENHANCED_AI_INTEGRATION_SESSION_DOCUMENTATION.md` - Complete session context
- `docs/ENHANCED_AI_INTEGRATION_IMPLEMENTATION_SPEC.md` - Technical specifications
- `docs/master-roadmap/MASTER_DEVELOPMENT_ROADMAP.md` - Updated roadmap

## Tech Stack

### Frontend (React)
- React 18 with TypeScript
- Material UI components
- React Router for navigation
- Axios for API requests
- React Hook Form for form validation

## Commands

### Frontend Commands
```bash
# Development
npm start               # Start development server
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

# Production
npm run build           # Build for production (use CI=false npm run build)
npm test                # Run tests
```

## Important Implementation Notes

### Current Active Implementation
- **Primary Registration Flow**: Uses `RegisterAssetPage.tsx` with `SimpleTaxonomySelectionV3`
- **AI Integration**: Basic OpenAI integration in Step 3 via `AIMetadataGenerator.tsx`
- **Enhanced Architecture**: Ready for implementation in `/src/services/openaiService.ts`

### Enhanced AI Integration Files
- `/src/services/openaiService.ts` - OpenAI service with enhanced interfaces ready
- `/src/components/common/AIMetadataGenerator.tsx` - UI component for AI generation
- `/src/pages/RegisterAssetPage.tsx` - Main registration page integration point

## Architecture

### Frontend Architecture
- **Component Structure**: Pages → Components → Contexts → Services → Hooks
- **Data Flow**: User interaction → Hook/context → Service → API → Response updates

### Current Status (January 2025)

#### ✅ **Production Ready Features**
1. **Video Thumbnail Generation**: 100% success rate with advanced video processing
2. **Asset Management**: Complete CRUD operations with taxonomy-based organization
3. **Search & Sort Functionality**: Enhanced with improved capabilities
4. **Composite Asset Workflow**: Complete 5-step multi-layer asset creation
5. **User Authentication**: Seamless JWT integration

#### ⚠️ **Known Issues (Non-blocking)**
1. **Pagination Display**: Server-side pagination mixing with client-side filtering
2. **Search Data Freshness**: Some terms affected by backend indexing delays

## Environment Detection & Deployment

### Environment Status
- **Development**: ✅ **OPERATIONAL** - AI integration working
- **Staging**: ✅ **ACTIVE** - Full functionality
- **Production**: ✅ **OPERATIONAL** - Latest stable features

### Deployment Strategy
- **3-Tier Workflow**: Development → Staging → Production
- **Manual Controls**: Staging and production deployments require confirmation
- **Automatic Development**: Development branch auto-deploys

## Code Style Guidelines
- TypeScript with strict null checks
- Functional React components with hooks
- Material UI styling with `sx` props
- Strong typing with explicit interfaces
- Error handling with try/catch blocks

## Important Files Modified

### Enhanced AI Integration Files
- `/src/services/openaiService.ts` - Enhanced with EnhancedAIContext interfaces
- `/src/components/common/AIMetadataGenerator.tsx` - AI generation UI component
- `/src/pages/RegisterAssetPage.tsx` - Step 3 integration point
- `/.github/workflows/development-auto-deploy.yml` - Environment variable support

### Current Implementation Status
The application uses SimpleTaxonomySelectionV3 and RegisterAssetPage.tsx with basic AI integration operational. Enhanced AI architecture is designed and ready for Phase 1 implementation.

## Workflow Guidelines
- Always validate changes in development environment first
- Maintain 3-tier deployment strategy (no direct production deployments)
- Use TodoWrite tool for task management and progress tracking
- Keep CLAUDE.md updated with current session context
- Focus on maintaining stable implementation while adding enhancements