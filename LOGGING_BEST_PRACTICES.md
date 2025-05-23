# Logging Best Practices

This document outlines the best practices for logging in the NNA Registry Service frontend application.

## Environment-Safe Logging

To ensure that logs are only displayed in development environments and not in production, we've implemented a centralized environment detection system with safe logging utilities.

## Core Utilities

### Environment Detection

The `environment.ts` utility provides consistent environment detection across the application:

```typescript
// Import the utilities
import { 
  isProduction, 
  isDevelopment, 
  isDebuggingAllowed,
  environmentSafeLog,
  environmentSafeError,
  environmentSafeWarn,
  environmentSafeInfo
} from './utils/environment';
```

### Safe Logging Methods

- **`environmentSafeLog(message, ...args)`**: Safe replacement for `console.log` that only logs in development
- **`environmentSafeError(message, ...args)`**: Safe replacement for `console.error`
- **`environmentSafeWarn(message, ...args)`**: Safe replacement for `console.warn`
- **`environmentSafeInfo(message, ...args)`**: Safe replacement for `console.info`
- **`environmentSafeDebug(message, ...args)`**: Safe replacement for `console.debug`

## Guidelines

1. **Never use direct console.log in production code**
   ```typescript
   // ❌ WRONG - This will log in production
   console.log('User data:', userData);
   
   // ✅ CORRECT - This only logs in development
   environmentSafeLog('User data:', userData);
   ```

2. **Avoid checking NODE_ENV directly**
   ```typescript
   // ❌ WRONG - Direct environment check
   if (process.env.NODE_ENV !== 'production') {
     console.log('Debug info');
   }
   
   // ✅ CORRECT - Use centralized environment detection
   if (isDevelopment()) {
     environmentSafeLog('Debug info');
   }
   ```

3. **Handle localStorage safely**
   ```typescript
   // ❌ WRONG - Direct localStorage access without try/catch
   const theme = localStorage.getItem('theme');
   
   // ✅ CORRECT - Safe localStorage access
   let theme;
   try {
     if (typeof localStorage !== 'undefined') {
       theme = localStorage.getItem('theme');
     }
   } catch (e) {
     environmentSafeError('Error accessing localStorage:', e);
   }
   ```

4. **Use the enhanced logger for structured logging**
   ```typescript
   import { logger, LogLevel, LogCategory } from './utils/logger';
   
   // For general logging
   logger.info('Application started');
   logger.error('Failed to load data', error);
   
   // For category-specific logging
   logger.taxonomy(LogLevel.INFO, 'Taxonomy data loaded');
   logger.ui(LogLevel.WARN, 'Component remounted unexpectedly');
   logger.api(LogLevel.ERROR, 'API call failed', response);
   ```

5. **Use debugLog for temporary debugging**
   ```typescript
   import { debugLog, debugError } from './utils/logger';
   
   // For temporary debugging
   debugLog('Current state:', state);
   debugError('Failed to process item:', item);
   ```

6. **Use verboseLog for detailed taxonomy logging**
   ```typescript
   import { verboseLog } from './utils/logger';
   
   // For detailed taxonomy logging (only shows if verbose_taxonomy_logging is enabled)
   verboseLog('Taxonomy processing details:', taxonomyData);
   ```

## Detecting Unguarded Logs

The repository includes a script to detect unguarded console logs that might execute in production:

```bash
npm run detect-logs
```

This script will scan the codebase for:
- Unguarded console.log/warn/info/debug calls
- Direct NODE_ENV checks outside of environment utilities
- Unsafe localStorage access

## Environment Variables

The application uses the following environment variables:

- `NODE_ENV`: The current environment (development, production, test)
- `REACT_APP_ENV`: Additional environment specification
- `REACT_APP_API_URL`: The API URL to use
- `REACT_APP_USE_MOCK_API`: Whether to use mock API responses

## Forcing Debug Logs in Production

In emergencies, debugging can be forced on in production by setting a localStorage flag:

```javascript
// To enable debugging in production (for emergency troubleshooting only)
localStorage.setItem('logger_force_enabled', 'true');

// To disable again
localStorage.removeItem('logger_force_enabled');
```

**Warning**: This should only be used for critical troubleshooting by developers and should never be enabled in general production use.

## Additional Resources

- [environment.ts](/src/utils/environment.ts): Centralized environment detection
- [logger.ts](/src/utils/logger.ts): Enhanced logging utility
- [detect-unguarded-logs.js](/scripts/detect-unguarded-logs.js): Log detection script