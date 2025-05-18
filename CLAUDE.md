# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
The NNA Registry Service is a platform for managing digital assets within a Naming, Numbering, and Addressing (NNA) Framework. It implements a dual addressing system (Human-Friendly Names and NNA Addresses) for digital assets across various layers (Songs, Stars, Looks, Moves, Worlds, etc.).

This workspace contains a frontend implementation built with React and TypeScript.

## Build & Test Commands
- Start dev server: `npm start`
- Build for production: `npm run build`
- Run all tests: `npm test`
- Run a single test: `npm test -- --testPathPattern="path/to/test"` or `npm test ComponentName`
- Format code: `npm run format`

## Architecture

### Frontend Architecture
- **Component Structure**:
  - Pages: Full page components
  - Components: Reusable UI components
  - Contexts: React context providers for global state
  - Services: API integration and business logic
  - Hooks: Custom React hooks

## Important Implementation Notes

### Taxonomy System
The application uses a flattened taxonomy system with lookup tables for efficient HFN to MFA conversion. Key components include:

1. **TaxonomyInitProvider**: Ensures taxonomy data is loaded before rendering the app
2. **useTaxonomy Hook**: Provides access to taxonomy data with built-in error handling
3. **SimpleTaxonomySelectionV2**: Component for selecting categories and subcategories
4. **LayerSelectorV2**: Component for selecting layers
5. **FeedbackContext**: Provides user feedback during taxonomy operations

### Special Cases
There are special case mappings that need special handling:
- W.BCH.SUN.001 → 5.004.003.001
- S.POP.HPM.001 → 2.004.003.001

## Progress Context
We have completed Steps 1-5 of the implementation plan and are ready to proceed with Step 6. The detailed context is available in CLAUDE_CONTEXT.md.

## Code Style Guidelines
- TypeScript is required for all new code
- Use functional components with React hooks
- Imports order: React, external libs, internal components/utils
- Formatting: Use Prettier with singleQuote, 2 space indentation, 80 char width
- Use strong typing with explicit interfaces for props and state
- Use Material UI (MUI) v6+ for UI components
- Component naming: PascalCase for components, camelCase for variables/functions
- Error handling: Use try/catch blocks for async operations
- CSS: Use MUI's sx prop or styled components pattern
- Follow React best practices for performance (useMemo, useCallback)

## Current Session Context
This is a continuation of our work on improving the taxonomy system in the application. We had to start a new session due to issues with shell commands in the previous session. All changes up to Step 5 have been committed and pushed to the repository.