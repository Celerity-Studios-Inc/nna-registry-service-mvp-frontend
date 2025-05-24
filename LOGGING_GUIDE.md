# LOGGING_GUIDE.md

*Updated on May 24, 2025*

## Console Logging Best Practices

This guide provides best practices for console logging in the NNA Registry Service frontend application.

### Using Safe Logging Functions

Always use the environment-aware logging functions to ensure logs don't appear in production:

```typescript
import { environmentSafeLog, environmentSafeWarn, environmentSafeError } from '../utils/environment';

// Use these instead of console.log, console.warn, console.error
environmentSafeLog('This message only appears in development');
environmentSafeWarn('Warning message');
environmentSafeError('Error message');
```

### Debug Logging

For debug-specific logging, use the `debugLog` function:

```typescript
import { debugLog } from '../utils/logger';

debugLog('This is a debug message');
```

### Automatic Tools

We have several scripts to help manage console logs:

- `scripts/find-unguarded-logs.js` - Find console logs that aren't using environment-safe functions
- `scripts/fix-console-logs.js` - Convert console.log calls to environmentSafeLog
- `scripts/fix-all-console-logs.js` - Fix all console logs in the codebase

### Debugging UI Components

- Add the `debug=true` URL parameter to enable debugging features
- Example: `http://localhost:3001/register-asset?debug=true`