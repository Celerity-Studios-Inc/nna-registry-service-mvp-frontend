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
  // Check environment variables first (highest priority)
  const reactAppEnv = process.env.REACT_APP_ENVIRONMENT;
  if (reactAppEnv === 'staging' || reactAppEnv === 'production' || reactAppEnv === 'development') {
    console.log('🎯 Environment Detection: Found via REACT_APP_ENVIRONMENT:', reactAppEnv);
    return reactAppEnv;
  }

  // Check NODE_ENV with type assertion for staging
  const nodeEnv = process.env.NODE_ENV as string;
  if (nodeEnv === 'staging') {
    console.log('🎯 Environment Detection: Found via NODE_ENV:', nodeEnv);
    return 'staging';
  }

  // Check URL patterns
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Debug logging for environment detection
  if (typeof window !== 'undefined') {
    console.log('🌍 Environment Detection Debug:');
    console.log('  - Hostname:', hostname);
    console.log('  - REACT_APP_ENVIRONMENT:', process.env.REACT_APP_ENVIRONMENT);
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - URL hostname check:', window.location.hostname);
  }
  
  // Staging environment detection (most specific URLs first)
  if (hostname.includes('nna-registry-frontend-stg.vercel.app') || 
      hostname.includes('nna-registry-staging.vercel.app') || 
      hostname.includes('-stg.vercel.app')) {
    console.log('🎯 Environment Detection: STAGING detected by hostname');
    return 'staging';
  }
  
  // Development environment detection (specific URLs first)
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' ||
      hostname.includes('nna-registry-dev-frontend.vercel.app') ||
      hostname.includes('-dev.vercel.app')) {
    console.log('🎯 Environment Detection: DEVELOPMENT detected by hostname');
    return 'development';
  }
  
  // Production environment detection (specific URLs first)
  if (hostname.includes('nna-registry-frontend.vercel.app') ||
      hostname.includes('registry.reviz.dev')) {
    console.log('🎯 Environment Detection: PRODUCTION detected by hostname');
    return 'production';
  }
  
  // Generic staging check for any staging patterns missed above
  if (hostname.includes('staging') || hostname.includes('stg')) {
    console.log('🎯 Environment Detection: STAGING detected by pattern');
    return 'staging';
  }
  
  // Generic vercel.app check (ONLY for unknown domains, not staging!)
  if (hostname.includes('vercel.app')) {
    console.warn('⚠️ Environment Detection: Unknown vercel.app domain defaulting to production:', hostname);
    return 'production';
  }

  // Default to production for safety
  console.warn('⚠️ Environment Detection: Defaulting to production for unknown hostname:', hostname);
  return 'production';
}

/**
 * Get backend URL for current environment
 */
export function getBackendUrl(environment?: EnvironmentConfig['name']): string {
  const env = environment || detectEnvironment();
  
  switch (env) {
    case 'staging':
      return process.env.REACT_APP_BACKEND_URL || 
             'https://registry.stg.reviz.dev';
    
    case 'production':
      return process.env.REACT_APP_BACKEND_URL || 
             'https://registry.reviz.dev';
    
    case 'development':
    default:
      return process.env.REACT_APP_BACKEND_URL || 
             'https://registry.dev.reviz.dev';
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
             'https://nna-registry-dev-frontend.vercel.app';
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
  
  // Always log in staging for debugging
  if (config.enableDebugLogging || config.isStaging) {
    console.group('🌍 Environment Configuration');
    console.log('Environment:', config.name);
    console.log('Backend URL:', config.backendUrl);
    console.log('Frontend URL:', config.frontendUrl);
    console.log('Is Staging:', config.isStaging);
    console.log('Is Production:', config.isProduction);
    console.log('Is Development:', config.isDevelopment);
    console.log('Debug Logging:', config.enableDebugLogging);
    console.log('Performance Monitoring:', config.enablePerformanceMonitoring);
    console.log('Environment Variables:', {
      REACT_APP_ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT,
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
      REACT_APP_FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL
    });
    console.groupEnd();
  }
}

// Export for legacy compatibility
export const environmentConfig = getEnvironmentConfig();