/**
 * Environment Configuration Utility
 * Handles environment detection and backend URL routing for staging/production
 * Created for staging environment integration (January 2025)
 * 
 * PERFORMANCE IMPROVEMENT (July 2025):
 * - Added caching to prevent repeated environment detection
 * - Conditional logging to reduce console noise
 * - Memoized configuration objects
 */

export interface EnvironmentConfig {
  name: 'development' | 'staging' | 'production';
  backendUrl: string;
  frontendUrl: string;
  isStaging: boolean;
  isProduction: boolean;
  isDevelopment: boolean;
  enableDebugLogging: boolean;
  enablePerformanceMonitoring: boolean;
}

// Cache for environment detection results
let _cachedEnvironment: EnvironmentConfig['name'] | null = null;
let _cachedConfig: EnvironmentConfig | null = null;
let _cachedBackendUrl: string | null = null;
let _cachedFrontendUrl: string | null = null;
let _detectionCount = 0;

// Debug logging control  
const MAX_DEBUG_LOGS = 1; // Only log first detection to reduce noise
const ENABLE_VERBOSE_LOGGING = typeof window !== 'undefined' && 
  (window.location.search.includes('debug=true') || 
   window.localStorage.getItem('nna-debug-mode') === 'true');

/**
 * Detect current environment based on multiple indicators (with caching)
 */
export function detectEnvironment(): EnvironmentConfig['name'] {
  // Return cached result if available
  if (_cachedEnvironment) {
    return _cachedEnvironment;
  }

  _detectionCount++;
  const shouldLog = _detectionCount <= MAX_DEBUG_LOGS || ENABLE_VERBOSE_LOGGING;

  // Check URL patterns FIRST (most reliable for Vercel deployments)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Conditional debug logging for environment detection
  if (typeof window !== 'undefined' && shouldLog) {
    console.log('🌍 Environment Detection Debug (Call #' + _detectionCount + '):');
    console.log('- Hostname:', hostname);
    console.log('- REACT_APP_ENVIRONMENT:', process.env.REACT_APP_ENVIRONMENT);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
  }
  
  let detectedEnv: EnvironmentConfig['name'];

  // PRIORITY 1: Development environment detection (canonical domain + git branch URLs)
  if (hostname === 'nna-registry-frontend-dev.vercel.app' ||
      hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.includes('-dev.vercel.app') ||
      hostname.includes('-git-development-') ||
      hostname.includes('development') && hostname.includes('vercel.app')) {
    detectedEnv = 'development';
    if (shouldLog) console.log('🎯 Hostname-based detection: DEVELOPMENT');
  }
  
  // PRIORITY 2: Staging environment detection (canonical domain first)
  else if (hostname === 'nna-registry-frontend-stg.vercel.app' || 
           hostname.includes('staging') || 
           hostname.includes('-stg.vercel.app')) {
    detectedEnv = 'staging';
    if (shouldLog) console.log('🎯 Hostname-based detection: STAGING');
  }
  
  // PRIORITY 3: Production environment detection (canonical domain first)
  else if (hostname === 'nna-registry-frontend.vercel.app' ||
           hostname.includes('registry.reviz.dev')) {
    detectedEnv = 'production';
    if (shouldLog) console.log('🎯 Hostname-based detection: PRODUCTION');
  }
  
  // FALLBACK 1: Check environment variables (only if hostname detection fails)
  else {
    const reactAppEnv = process.env.REACT_APP_ENVIRONMENT;
    if (reactAppEnv === 'development') {
      detectedEnv = 'development';
      if (shouldLog) console.log('🎯 Environment variable fallback: DEVELOPMENT');
    } else if (reactAppEnv === 'staging') {
      detectedEnv = 'staging';
      if (shouldLog) console.log('🎯 Environment variable fallback: STAGING');
    } else if (reactAppEnv === 'production') {
      detectedEnv = 'production';
      if (shouldLog) console.log('🎯 Environment variable fallback: PRODUCTION');
    }
    
    // FALLBACK 2: Check NODE_ENV with type assertion for staging
    else {
      const nodeEnv = process.env.NODE_ENV as string;
      if (nodeEnv === 'staging') {
        detectedEnv = 'staging';
        if (shouldLog) console.log('🎯 NODE_ENV fallback: STAGING');
      }
      
      // FALLBACK 3: Generic vercel.app check (last resort)
      else if (hostname.includes('vercel.app')) {
        detectedEnv = 'production'; // Default to production for unknown vercel domains
        if (shouldLog) console.log('🎯 Generic Vercel fallback: PRODUCTION');
      }
      
      // FALLBACK 4: Default to production for safety
      else {
        detectedEnv = 'production';
        if (shouldLog) console.log('🎯 Ultimate fallback: PRODUCTION');
      }
    }
  }

  // Cache the result to prevent repeated detection
  _cachedEnvironment = detectedEnv;
  return detectedEnv;
}

/**
 * Get backend URL for current environment (with caching to reduce console noise)
 */
export function getBackendUrl(environment?: EnvironmentConfig['name']): string {
  // Return cached URL if available and no specific environment requested
  if (!environment && _cachedBackendUrl) {
    return _cachedBackendUrl;
  }

  const env = environment || detectEnvironment();
  
  // Only log on first call or when verbose logging is enabled
  const shouldLog = (_detectionCount <= MAX_DEBUG_LOGS && !_cachedBackendUrl) || ENABLE_VERBOSE_LOGGING;
  
  if (shouldLog) {
    console.log('🔍 [getBackendUrl] Environment:', env);
    console.log('🔍 [getBackendUrl] REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
    console.log('🚨 OVERRIDING environment variable - using detected environment instead');
  }
  
  let url: string;
  // Use detected environment to force correct backend URL
  switch (env) {
    case 'staging':
      url = 'https://registry.stg.reviz.dev';
      if (shouldLog) console.log('🎯 FORCED backend URL for STAGING:', url);
      break;
    
    case 'production':
      url = 'https://registry.reviz.dev';
      if (shouldLog) console.log('🎯 FORCED backend URL for PRODUCTION:', url);
      break;
    
    case 'development':
    default:
      url = 'https://registry.dev.reviz.dev';
      if (shouldLog) console.log('🎯 FORCED backend URL for DEVELOPMENT:', url);
      break;
  }

  // Cache the result if no specific environment was requested
  if (!environment) {
    _cachedBackendUrl = url;
  }

  return url;
}

/**
 * Get frontend URL for current environment (for CORS with caching)
 */
export function getFrontendUrl(environment?: EnvironmentConfig['name']): string {
  // Return cached URL if available and no specific environment requested
  if (!environment && _cachedFrontendUrl) {
    return _cachedFrontendUrl;
  }

  const env = environment || detectEnvironment();
  
  let url: string;
  switch (env) {
    case 'staging':
      url = process.env.REACT_APP_FRONTEND_URL || 
            'https://nna-registry-frontend-stg.vercel.app';
      break;
    
    case 'production':
      url = process.env.REACT_APP_FRONTEND_URL || 
            'https://nna-registry-frontend.vercel.app';
      break;
    
    case 'development':
    default:
      url = process.env.REACT_APP_FRONTEND_URL || 
            'https://nna-registry-frontend-dev.vercel.app';
      break;
  }

  // Cache the result if no specific environment was requested
  if (!environment) {
    _cachedFrontendUrl = url;
  }

  return url;
}

/**
 * Get complete environment configuration (with caching)
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  // Return cached config if available
  if (_cachedConfig) {
    return _cachedConfig;
  }

  const env = detectEnvironment();
  const backendUrl = getBackendUrl(env);
  const frontendUrl = getFrontendUrl(env);
  
  const config: EnvironmentConfig = {
    name: env,
    backendUrl,
    frontendUrl,
    isStaging: env === 'staging',
    isProduction: env === 'production',
    isDevelopment: env === 'development',
    enableDebugLogging: env !== 'production' || process.env.REACT_APP_ENABLE_DEBUG_LOGGING === 'true',
    enablePerformanceMonitoring: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true',
  };

  // Cache the result
  _cachedConfig = config;
  return config;
}

/**
 * Smart routing configuration for file uploads
 * Returns proxy or direct backend URL based on file size and environment
 */
export function getUploadEndpoint(fileSize: number, environment?: EnvironmentConfig['name']): {
  url: string;
  useDirect: boolean;
  reason: string;
} {
  const config = getEnvironmentConfig();
  const threshold = parseFloat(process.env.REACT_APP_SMART_ROUTING_THRESHOLD || '4194304'); // 4MB default
  const useDirect = fileSize > threshold;
  
  if (useDirect) {
    return {
      url: `${config.backendUrl}/api/assets`,
      useDirect: true,
      reason: `Large file (${(fileSize / 1024 / 1024).toFixed(2)}MB) routed directly to backend`,
    };
  } else {
    return {
      url: '/api/assets', // Proxy route
      useDirect: false,
      reason: `Small file (${(fileSize / 1024 / 1024).toFixed(2)}MB) routed via proxy`,
    };
  }
}

/**
 * Log environment configuration for debugging (improved)
 */
export function logEnvironmentInfo(): void {
  const config = getEnvironmentConfig();
  
  if (config.enableDebugLogging || ENABLE_VERBOSE_LOGGING) {
    console.group('🌍 Environment Configuration');
    console.log('Environment:', config.name);
    console.log('Backend URL:', config.backendUrl);
    console.log('Frontend URL:', config.frontendUrl);
    console.log('Debug Logging:', config.enableDebugLogging);
    console.log('Performance Monitoring:', config.enablePerformanceMonitoring);
    console.log('Detection Count:', _detectionCount);
    console.log('Cache Status:', _cachedEnvironment ? 'Cached' : 'Fresh');
    console.groupEnd();
  }
}

/**
 * Clear environment detection cache (for testing/development)
 */
export function clearEnvironmentCache(): void {
  _cachedEnvironment = null;
  _cachedConfig = null;
  _detectionCount = 0;
  console.log('🧹 Environment cache cleared');
}

/**
 * Enable verbose logging (for debugging)
 */
export function enableVerboseLogging(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('nna-debug-mode', 'true');
    console.log('🔊 Verbose logging enabled. Refresh page to see full logs.');
  }
}

/**
 * Disable verbose logging
 */
export function disableVerboseLogging(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('nna-debug-mode');
    console.log('🔇 Verbose logging disabled. Refresh page to reduce logs.');
  }
}

/**
 * Get environment detection statistics
 */
export function getEnvironmentStats(): {
  detectionCount: number;
  isCached: boolean;
  currentEnvironment: string;
  verboseLogging: boolean;
} {
  return {
    detectionCount: _detectionCount,
    isCached: !!_cachedEnvironment,
    currentEnvironment: _cachedEnvironment || 'not-detected',
    verboseLogging: ENABLE_VERBOSE_LOGGING,
  };
}

// Export for legacy compatibility
export const environmentConfig = getEnvironmentConfig();

// Add global debug utilities to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).nnaDebug = {
    clearCache: clearEnvironmentCache,
    enableVerbose: enableVerboseLogging,
    disableVerbose: disableVerboseLogging,
    getStats: getEnvironmentStats,
    logInfo: logEnvironmentInfo,
  };
}