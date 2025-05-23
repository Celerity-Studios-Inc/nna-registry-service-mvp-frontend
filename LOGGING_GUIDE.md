# Production Logging Guide

This document outlines best practices for logging in the NNA Registry frontend application, with special focus on disabling unnecessary logs in production.

## Recent Changes

We have enhanced the logging system to prevent excessive console logs in production environments. The key changes include:

1. **Enhanced `logger.ts`**: 
   - Improved environment detection in the Logger constructor
   - Added additional safeguards to prevent logs in production
   - Added utility functions for safe logging
   - Added localStorage check guard for better browser compatibility
   - Added new `isProductionMode()` utility function

2. **New `environment.ts` Utility**:
   - Provides consistent environment detection
   - Includes safe logging functions that respect environment
   - Centralizes environment-specific configuration

3. **Fixed Immediate Logging Issues**:
   - Updated `envCheck.ts` to only log in development
   - Enhanced `App.tsx` to guard initialization logs
   - Fixed `TaxonomyDebugger.tsx` to prevent detailed logging in production
   
4. **Added Detection Tool**:
   - Created `scripts/detect-unguarded-logs.js` to find console logs that aren't properly guarded

## How to Use Logging Properly

### Preferred Method: Use Utility Functions

```typescript
// Import the utilities
import { debugLog, verboseLog } from '../utils/logger';
import { environmentSafeLog } from '../utils/environment';

// For general debugging (automatically disabled in production)
debugLog('User selected item:', selectedItem);

// For verbose debugging (requires explicit opt-in)
verboseLog('Detailed taxonomy data:', taxonomyData);

// For environment-aware logging
environmentSafeLog('Service initialized with options:', options);
```

### Alternative Method: Use Environment Checks

```typescript
// Direct environment check
if (process.env.NODE_ENV !== 'production') {
  console.log('Debug info:', debugInfo);
}

// Using environment utility
import { isDevelopment } from '../utils/environment';

if (isDevelopment()) {
  console.log('Only visible in development');
}
```

### Structured Logging with Logger Instance

```typescript
import { logger, LogLevel, LogCategory } from '../utils/logger';

// Categorized logging
logger.taxonomy(LogLevel.DEBUG, 'Loading taxonomy data for layer:', layer);
logger.api(LogLevel.INFO, 'API request successful', response);
logger.ui(LogLevel.WARN, 'Form validation error', errors);
```

## Force-Enable Logging in Production (Emergency Only)

In rare cases where you need to debug a production issue, you can temporarily enable logging:

1. Open browser console
2. Run: `localStorage.setItem('logger_force_enabled', 'true')`
3. Refresh the page
4. Complete debugging
5. Disable: `localStorage.removeItem('logger_force_enabled')`

**IMPORTANT:** Always remember to disable forced logging after debugging!

## Running the Log Detection Tool

To find unguarded console.log statements:

```bash
node scripts/detect-unguarded-logs.js
```

This will scan the codebase and report console.log statements that aren't properly protected with environment checks.

## Recommended Patterns

1. **Never** use direct `console.log` without environment checks
2. Use `debugLog` for most debugging needs
3. Use `verboseLog` for detailed tracking that's disabled by default
4. Prefer structured logging with the logger instance for important operations
5. Be mindful of performance impact of logging in production
6. Clean up debugging logs when they're no longer needed

## Anti-Patterns

1. ❌ Direct console.log without guards: `console.log('Always visible');`
2. ❌ Logging large objects: `console.log('Huge data:', enormousObject);`
3. ❌ Logging in render functions or tight loops
4. ❌ Permanently enabling forced logging in production
5. ❌ Leaving commented-out console.log statements in the code

## Future Improvements

1. Add ESLint rule to detect unguarded console.logs
2. Create pre-commit hook to run the detection script
3. Consider implementing remote logging for important production events
4. Add structured logging levels for production vs development