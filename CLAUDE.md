# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands
- Start dev server: `npm start`
- Build for production: `npm run build`
- Run all tests: `npm test`
- Run a single test: `npm test -- --testPathPattern="path/to/test"` or `npm test ComponentName`
- Format code: `npm run format`

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