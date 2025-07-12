# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
The NNA Registry Service is a platform for managing digital assets within a Naming, Numbering, and Addressing (NNA) Framework. It implements a dual addressing system (Human-Friendly Names and NNA Addresses) for digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, etc.).

This workspace contains a frontend implementation built with React and TypeScript.

**🚀 STATUS: ENHANCED AI INTEGRATION ARCHITECTURE APPROVED** (July 12, 2025)

### **🎯 CURRENT PRIORITY: Enhanced AI Integration Implementation**
**Development Status**: ✅ **ARCHITECTURE DESIGNED** - Ready for Phase 1 implementation
**Critical Discovery**: Basic AI working for Looks (L) layer but reliability issues for other layers
**Solution**: Revolutionary Creator's Description + AI collaboration architecture
**Implementation Ready**: All documentation complete, technical specifications available

### **🏗️ ENHANCED AI INTEGRATION ARCHITECTURE**
- ✅ **Basic AI Working**: OpenAI GPT-4o excellent for Looks (L) layer
- ✅ **Revolutionary Design**: Creator's Description + AI collaboration vs direct file analysis
- ✅ **Layer-Specific Strategies**: G (MusicBrainz+WebSearch), S/L (image+context), M/W (thumbnail+context), C (component aggregation)
- ✅ **Hybrid Processing**: Claude (parsing) + OpenAI (generation) architecture

### **📋 IMPLEMENTATION SPECIFICATIONS**
1. **Creator's Description Field**: Repurpose Name field with layer-specific guidance (<100 chars)
2. **Layer-Specific Processing**: Custom strategies for each layer type
3. **Music Enhancement**: MusicBrainz integration for songs layer
4. **Context Integration**: Taxonomy awareness and file type optimization

### **🎯 QUALITY IMPROVEMENT TARGETS**
- **G Layer**: Revolutionary improvement with MusicBrainz + web search integration
- **S Layer**: Dramatic improvement from Creator's Description + image analysis context
- **L Layer**: Maintain current excellent quality while enhancing consistency
- **M/W Layers**: Major improvement from thumbnail + context vs raw video analysis
- **C Layer**: Intelligent composite descriptions from component metadata aggregation

### **📊 IMPLEMENTATION READINESS**
- **Phase 1**: Foundation enhancement (Creator's Description UI + enhanced OpenAI service)
- **Phase 2**: Layer-specific processing implementation
- **Phase 3**: Music enhancement with MusicBrainz integration
- **Phase 4**: Composite intelligence and comprehensive testing

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