# NNA Registry Service - Documentation Index

This directory contains comprehensive documentation for the NNA Registry Service frontend application. These documents have been prepared to support code review and gap analysis by Claude and Grok.

## Core Documentation

- [Project Overview](./PROJECT_OVERVIEW.md) - High-level description of the project
- [Architecture](./ARCHITECTURE.md) - Description of the frontend architecture
- [Taxonomy System](./TAXONOMY_SYSTEM.md) - Details on the taxonomy system implementation
- [Recent Changes](./RECENT_CHANGES.md) - Summary of recent fixes and improvements
- [Current Status](./CURRENT_STATUS.md) - Current state of the project
- [Gaps and TODOs](./GAPS_AND_TODOS.md) - Known gaps and pending work
- [Technical Notes](./TECHNICAL_NOTES.md) - Technical implementation details
- [Review Request](./REVIEW_REQUEST.md) - Request for comprehensive review

## Implementation Details

- [Implementation](./IMPLEMENTATION.md) - General implementation details
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Planned implementation approach
- [Frontend Enhancement Plan](./FRONTEND_ENHANCEMENT_PLAN.md) - Planned UI/UX improvements
- [Remaining Issues](./REMAINING_ISSUES.md) - Known issues and limitations
- [Status Report](./STATUS_REPORT.md) - Latest status report

## Taxonomy System

- [Taxonomy System Documentation](./TAXONOMY_SYSTEM_DOCUMENTATION.md) - Comprehensive taxonomy system documentation
- [Taxonomy Mapping Documentation](./TAXONOMY_MAPPING_DOCUMENTATION.md) - Details on taxonomy code mapping
- [Taxonomy Code Mapping](./TAXONOMY_CODE_MAPPING.md) - Implementation of code mapping
- [Layer-Specific HFN Codes](./LAYER_SPECIFIC_HFN_CODES.md) - Layer-specific naming conventions
- [Dual Addressing Implementation](./DUAL_ADDRESSING_IMPLEMENTATION.md) - Implementation of HFN and MFA addressing
- [Taxonomy Technical Review](./TAXONOMY_TECHNICAL_REVIEW.md) - Technical analysis of taxonomy system
- [Taxonomy Best Practices](./TAXONOMY_BEST_PRACTICES.md) - Best practices for taxonomy components

## Testing and User Documentation

- [Test Plan](./TEST_PLAN.md) - Test plan for the application
- [Asset Registration Testing](./ASSET_REGISTRATION_TESTING.md) - Testing process for asset registration
- [Verification Guide](./VERIFICATION_GUIDE.md) - Guide for verifying implementation
- [User Manual](./USER_MANUAL.md) - User documentation
- [Allowed File Formats](./ALLOWED_FILE_FORMATS.md) - Supported file formats
- [Test Results](./TEST_RESULTS.md) - Results of testing
- [Taxonomy Refactor Test Plan](./TAXONOMY_REFACTOR_TEST_PLAN.md) - Test plan for the taxonomy refactoring

## Taxonomy Refactoring Project

- [Taxonomy Refactor](./TAXONOMY_REFACTOR.md) - Overview of the taxonomy refactoring project
- [Taxonomy Fixes Summary](./TAXONOMY_FIXES_SUMMARY.md) - Summary of taxonomy-related fixes
- [Taxonomy Selection Fix](./TAXONOMY_SELECTION_FIX.md) - Details on fixing taxonomy selection issues
- [Phase 7 Summary](./PHASE_7_SUMMARY.md) - Summary of Phase 7 of the taxonomy refactoring project
- [Phase 8 Plan](./PHASE_8_PLAN.md) - Plan for Phase 8 of the taxonomy refactoring project
- [Phase 8 Step 3 Optimization Summary](./PHASE_8_STEP_3_OPTIMIZATION_SUMMARY.md) - Optimization summary

## Emergency Features

- [Emergency Registration](./EMERGENCY_REGISTRATION.md) - Emergency asset registration feature documentation

## Repository Information

- **Repository URL**: https://github.com/Celerity-Studios-Inc/nna-registry-service-mvp-frontend
- **Branch**: main
- **Latest Commit**: 0633e29 (Center taxonomy selection chip in navigation footer)

## Key Areas of Interest

1. **Asset Registration Workflow**
   - Layer, category, subcategory selection
   - File upload
   - Metadata entry
   - Review and submit

2. **Taxonomy System**
   - Taxonomy data structure
   - Selection components
   - Error handling and recovery
   - Dual addressing generation

3. **UI Components**
   - Taxonomy selection cards
   - File upload interface
   - Form components
   - Navigation and layout

4. **State Management**
   - Context providers
   - Custom hooks
   - Form state
   - Error state

## Known Gaps

The following areas have been identified as having gaps between the requirements and current implementation:

1. **Composite Asset Handling** - Not properly implemented
2. **Asset Search and Browse** - Limited functionality
3. **User Management** - Basic implementation
4. **Asset Versioning** - Not implemented
5. **Batch Operations** - Not implemented

Please refer to [Gaps and TODOs](./GAPS_AND_TODOS.md) for a complete list.

## Recent Improvements

Recent work has focused on:

1. **Taxonomy System Refactoring** - Improved architecture and reliability
2. **UI Enhancements** - Better card layout and labeling
3. **Error Handling** - Enhanced recovery mechanisms
4. **State Management** - Improved persistence and synchronization

See [Recent Changes](./RECENT_CHANGES.md) for details.

## Review Objectives

The main objectives for the code review are:

1. Identify gaps between requirements and implementation
2. Evaluate code quality and architecture
3. Detect potential issues and performance concerns
4. Provide recommendations for improvement

Please refer to [Review Request](./REVIEW_REQUEST.md) for detailed review instructions.