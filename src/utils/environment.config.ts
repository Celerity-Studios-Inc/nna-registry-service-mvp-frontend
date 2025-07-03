/**
 * Environment Configuration Utility
 * Handles environment detection and backend URL routing for staging/production
 * Created for staging environment integration (January 2025)
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

/**
 * Detect current environment based on multiple indicators
 */
export function detectEnvironment(): EnvironmentConfig['name'] {
  // Check URL patterns FIRST (most reliable for Vercel deployments)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Debug logging for environment detection
  if (typeof window !== 'undefined') {
    console.log('🌍 Environment Detection Debug:');
    console.log('- Hostname:', hostname);
    console.log('- REACT_APP_ENVIRONMENT:', process.env.REACT_APP_ENVIRONMENT);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
  }
  
  // PRIORITY 1: Development environment detection (canonical domain + git branch URLs)
  if (hostname === 'nna-registry-frontend-dev.vercel.app' ||
      hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.includes('-dev.vercel.app') ||
      hostname.includes('-git-development-') ||
      hostname.includes('development') && hostname.includes('vercel.app')) {
    console.log('🎯 Hostname-based detection: DEVELOPMENT');
    return 'development';
  }
  
  // PRIORITY 2: Staging environment detection (canonical domain first)
  if (hostname === 'nna-registry-frontend-stg.vercel.app' || 
      hostname.includes('staging') || 
      hostname.includes('-stg.vercel.app')) {
    console.log('🎯 Hostname-based detection: STAGING');
    return 'staging';
  }
  
  // PRIORITY 3: Production environment detection (canonical domain first)
  if (hostname === 'nna-registry-frontend.vercel.app' ||
      hostname.includes('registry.reviz.dev')) {
    console.log('🎯 Hostname-based detection: PRODUCTION');
    return 'production';
  }
  
  // FALLBACK 1: Check environment variables (only if hostname detection fails)
  const reactAppEnv = process.env.REACT_APP_ENVIRONMENT;
  if (reactAppEnv === 'development') {
    console.log('🎯 Environment variable fallback: DEVELOPMENT');
    return 'development';
  }
  if (reactAppEnv === 'staging') {
    console.log('🎯 Environment variable fallback: STAGING');
    return 'staging';
  }
  if (reactAppEnv === 'production') {
    console.log('🎯 Environment variable fallback: PRODUCTION');
    return 'production';
  }

  // FALLBACK 2: Check NODE_ENV with type assertion for staging
  const nodeEnv = process.env.NODE_ENV as string;
  if (nodeEnv === 'staging') {
    console.log('🎯 NODE_ENV fallback: STAGING');
    return 'staging';
  }
  
  // FALLBACK 3: Generic vercel.app check (last resort)
  if (hostname.includes('vercel.app')) {
    console.log('🎯 Generic Vercel fallback: PRODUCTION');
    return 'production'; // Default to production for unknown vercel domains
  }

  // FALLBACK 4: Default to production for safety
  console.log('🎯 Ultimate fallback: PRODUCTION');
  return 'production';
}

/**
 * Get backend URL for current environment
 */
export function getBackendUrl(environment?: EnvironmentConfig['name']): string {
  const env = environment || detectEnvironment();
  
  // Add debug logging to see what's happening
  console.log('🔍 [getBackendUrl] Environment:', env);
  console.log('🔍 [getBackendUrl] REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
  
  // OVERRIDE: Ignore environment variables since they're not working correctly in Vercel
  // Use detected environment to determine correct backend URL
  console.log('🚨 OVERRIDING environment variable - using detected environment instead');
  
  // Use detected environment to force correct backend URL
  switch (env) {
    case 'staging':
      console.log('🎯 FORCED backend URL for STAGING: https://registry.stg.reviz.dev');
      return 'https://registry.stg.reviz.dev';
    
    case 'production':
      console.log('🎯 FORCED backend URL for PRODUCTION: https://registry.reviz.dev');
      return 'https://registry.reviz.dev';
    
    case 'development':
    default:
      console.log('🎯 FORCED backend URL for DEVELOPMENT: https://registry.dev.reviz.dev');
      return 'https://registry.dev.reviz.dev';
  }
}

/**
 * Get frontend URL for current environment (for CORS)
 */
export function getFrontendUrl(environment?: EnvironmentConfig['name']): string {
  const env = environment || detectEnvironment();
  
  switch (env) {
    case 'staging':
      return process.env.REACT_APP_FRONTEND_URL || 
             'https://nna-registry-frontend-stg.vercel.app';
    
    case 'production':
      return process.env.REACT_APP_FRONTEND_URL || 
             'https://nna-registry-frontend.vercel.app';
    
    case 'development':
    default:
      return process.env.REACT_APP_FRONTEND_URL || 
             'https://nna-registry-frontend-dev.vercel.app';
  }
}

/**
 * Get complete environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const env = detectEnvironment();
  const backendUrl = getBackendUrl(env);
  const frontendUrl = getFrontendUrl(env);
  
  return {
    name: env,
    backendUrl,
    frontendUrl,
    isStaging: env === 'staging',
    isProduction: env === 'production',
    isDevelopment: env === 'development',
    enableDebugLogging: env !== 'production' || process.env.REACT_APP_ENABLE_DEBUG_LOGGING === 'true',
    enablePerformanceMonitoring: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true',
  };
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
 * Log environment configuration for debugging
 */
export function logEnvironmentInfo(): void {
  const config = getEnvironmentConfig();
  
  if (config.enableDebugLogging) {
    console.group('🌍 Environment Configuration');
    console.log('Environment:', config.name);
    console.log('Backend URL:', config.backendUrl);
    console.log('Frontend URL:', config.frontendUrl);
    console.log('Debug Logging:', config.enableDebugLogging);
    console.log('Performance Monitoring:', config.enablePerformanceMonitoring);
    console.groupEnd();
  }
}

// Export for legacy compatibility
export const environmentConfig = getEnvironmentConfig();