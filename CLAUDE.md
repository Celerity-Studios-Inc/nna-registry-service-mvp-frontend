# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
The NNA Registry Service is a platform for managing digital assets within a Naming, Numbering, and Addressing (NNA) Framework. It implements a dual addressing system (Human-Friendly Names and NNA Addresses) for digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, etc.).

This workspace contains a frontend implementation built with React and TypeScript.

**🚀 STATUS: ENHANCED AI INTEGRATION PHASE 2A DEPLOYED** (July 13, 2025)

### **🎯 CURRENT SESSION: Creator's Description Storage & UI Enhancement**
**Development Status**: ✅ **PHASE 2A COMPLETE** - Enhanced AI with BPM extraction and album art fetching deployed
**Critical Issue**: Creator's Description storage problem identified and being fixed
**Current Priority**: Fix Creator's Description display + Success page redesign + Edit page enhancement
**Session Risk**: High context session - continuous documentation updates required

### **🚨 CRITICAL SESSION CONTEXT (July 13, 2025)**
**Previous Achievement**: Complete Enhanced AI Integration Phase 2A implementation with:
- ✅ **Creator's Description Field**: Layer-specific guidance implemented in registration form
- ✅ **Enhanced OpenAI Service**: BPM extraction, album art fetching, layer-specific processing
- ✅ **Songs Layer Enhancement**: iTunes API integration, synchronous album art fetching
- ✅ **Complete Testing**: G layer (Songs) and S layer (Stars) working excellently

**Current Critical Issue Identified**: 
- **Problem**: Creator's Description not properly stored/displayed in Asset Details
- **Root Cause**: Backend overwrites `name` field with HFN, losing original Creator's Description
- **MongoDB Evidence**: `name: "L.CAS.DNM.001"` instead of `"Olivia in casual Denim dungaree from brand 'CAT'"`
- **Solution**: Store Creator's Description in `asset.metadata.creatorDescription` (immediate fix)

### **🏗️ ENHANCED AI INTEGRATION ARCHITECTURE**
- ✅ **Basic AI Working**: OpenAI GPT-4o excellent for Looks (L) layer
- ✅ **Revolutionary Design**: Creator's Description + AI collaboration vs direct file analysis
- ✅ **Layer-Specific Strategies**: G (MusicBrainz+WebSearch), S/L (image+context), M/W (thumbnail+context), C (component aggregation)
- ✅ **Hybrid Processing**: Claude (parsing) + OpenAI (generation) architecture

### **📋 IMMEDIATE IMPLEMENTATION TASKS (July 13, 2025)**
**User Requirements from Testing Session**:
1. **Fix Creator's Description Storage**: Use `asset.metadata.creatorDescription` instead of `name` field
2. **Success Page Redesign**: 2-column, 3-card layout:
   - Left: Asset Preview + Asset Address cards
   - Right: Asset Metadata card (Creator's Description + AI Description + Tags)
3. **Edit Details Page Enhancement**: Add Creator's Description field for editing
4. **Consistent Styling**: Blue background for Creator's Description across all views

**Technical Implementation Strategy**:
- **Data Storage Fix**: Store Creator's Description in metadata during registration
- **Display Fix**: Read from `asset.metadata.creatorDescription` in all view components
- **UI Redesign**: Material-UI Grid system for new 3-card layout
- **Form Enhancement**: Add Creator's Description to edit form with validation

### **📊 CURRENT SESSION STATUS**
- **Commit 80e567d**: ✅ Creator's Description display in Asset Details (partial fix)
- **Testing Results**: Creator's Description value wrong - storage issue confirmed
- **MongoDB Evidence**: Backend overwrites `name` with HFN, losing Creator's Description
- **Next Steps**: Implement metadata storage solution + UI enhancements

### **🔗 CRITICAL REFERENCE DOCUMENTS**
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