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

// Cache for environment detection to prevent multiple calls
let _cachedEnvironment: EnvironmentConfig['name'] | null = null;
let _environmentLogged = false;

/**
 * Detect current environment based on multiple indicators
 */
export function detectEnvironment(): EnvironmentConfig['name'] {
  // Return cached result if available
  if (_cachedEnvironment) {
    return _cachedEnvironment;
  }
  
  // Check URL patterns FIRST (most reliable for Vercel deployments)
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  let detectedEnv: EnvironmentConfig['name'];
  let detectionMethod = '';
  
  // PRIORITY 1: Development environment detection (canonical domain first)
  if (hostname === 'nna-registry-frontend-dev.vercel.app' ||
      hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.includes('-dev.vercel.app') ||
      process.env.REACT_APP_ENVIRONMENT === 'development') {
    detectedEnv = 'development';
    detectionMethod = process.env.REACT_APP_ENVIRONMENT === 'development' ? 'env-var' : 'hostname';
  }
  // PRIORITY 2: Staging environment detection (canonical domain first)
  else if (hostname === 'nna-registry-frontend-stg.vercel.app' || 
      hostname.includes('staging') || 
      hostname.includes('-stg.vercel.app')) {
    detectedEnv = 'staging';
    detectionMethod = 'hostname';
  }
  // PRIORITY 3: Production environment detection (canonical domain first)
  else if (hostname === 'nna-registry-frontend.vercel.app' ||
      hostname.includes('registry.reviz.dev')) {
    detectedEnv = 'production';
    detectionMethod = 'hostname';
  }
  // FALLBACK 1: Check environment variables (only if hostname detection fails)
  else if (process.env.REACT_APP_ENVIRONMENT === 'development') {
    detectedEnv = 'development';
    detectionMethod = 'REACT_APP_ENVIRONMENT';
  }
  else if (process.env.REACT_APP_ENVIRONMENT === 'staging') {
    detectedEnv = 'staging';
    detectionMethod = 'REACT_APP_ENVIRONMENT';
  }
  else if (process.env.REACT_APP_ENVIRONMENT === 'production') {
    detectedEnv = 'production';
    detectionMethod = 'REACT_APP_ENVIRONMENT';
  }
  // FALLBACK 2: Check NODE_ENV with type assertion for staging
  else if ((process.env.NODE_ENV as string) === 'staging') {
    detectedEnv = 'staging';
    detectionMethod = 'NODE_ENV';
  }
  // FALLBACK 3: Generic vercel.app check (last resort)
  else if (hostname.includes('vercel.app')) {
    detectedEnv = 'production';
    detectionMethod = 'vercel-fallback';
  }
  // FALLBACK 4: Default to production for safety
  else {
    detectedEnv = 'production';
    detectionMethod = 'ultimate-fallback';
  }
  
  // Cache the result
  _cachedEnvironment = detectedEnv;
  
  // Log only once for debugging (not on every call)
  if (!_environmentLogged && typeof window !== 'undefined') {
    console.log(`🌍 Environment: ${detectedEnv.toUpperCase()} (via ${detectionMethod})`);
    if (detectedEnv === 'development') {
      console.log(`🔧 Hostname: ${hostname}`);
    }
    _environmentLogged = true;
  }
  
  return detectedEnv;
}

/**
 * Get backend URL for current environment
 */
export function getBackendUrl(environment?: EnvironmentConfig['name']): string {
  const env = environment || detectEnvironment();
  
  // Debug logging for Vercel Preview environment issues
  if (env === 'development' && typeof window !== 'undefined') {
    console.log('🔧 [DEBUG] Environment Variables Check:');
    console.log('  REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
    console.log('  REACT_APP_ENVIRONMENT:', process.env.REACT_APP_ENVIRONMENT);
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    console.log('  Detected Environment:', env);
  }
  
  switch (env) {
    case 'staging':
      return process.env.REACT_APP_BACKEND_URL || 
             'https://registry.stg.reviz.dev';
    
    case 'production':
      return process.env.REACT_APP_BACKEND_URL || 
             'https://registry.reviz.dev';
    
    case 'development':
    default:
      // Explicit check for development environment variable
      if (process.env.REACT_APP_ENVIRONMENT === 'development' && process.env.REACT_APP_BACKEND_URL) {
        const envBackendUrl = process.env.REACT_APP_BACKEND_URL;
        if (env === 'development' && typeof window !== 'undefined') {
          console.log('🎯 [DEBUG] Using Vercel ENV Backend URL:', envBackendUrl);
        }
        return envBackendUrl;
      }
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://registry.dev.reviz.dev';
      if (env === 'development' && typeof window !== 'undefined') {
        console.log('🎯 [DEBUG] Final Backend URL:', backendUrl);
      }
      return backendUrl;
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