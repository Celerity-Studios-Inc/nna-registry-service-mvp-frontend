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
  // Check environment variables first
  const reactAppEnv = process.env.REACT_APP_ENVIRONMENT;
  if (reactAppEnv === 'staging' || reactAppEnv === 'production' || reactAppEnv === 'development') {
    return reactAppEnv;
  }

  // Check NODE_ENV with type assertion for staging
  const nodeEnv = process.env.NODE_ENV as string;
  if (nodeEnv === 'staging') {
    return 'staging';
  }

  // Check URL patterns
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  if (hostname.includes('staging') || 
      hostname.includes('nna-registry-staging') || 
      hostname.includes('nna-registry-frontend-stg.vercel.app')) {
    return 'staging';
  }
  
  if (hostname.includes('vercel.app') && !hostname.includes('staging')) {
    return 'production';
  }
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }

  // Default to production for safety
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
             'https://nna-registry-service-staging-297923701246.us-central1.run.app';
    
    case 'production':
      return process.env.REACT_APP_API_BASE_URL || 
             'https://registry.reviz.dev';
    
    case 'development':
    default:
      return process.env.REACT_APP_API_BASE_URL || 
             'https://registry.reviz.dev';
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
             'https://nna-registry-staging.vercel.app';
    
    case 'production':
      return process.env.REACT_APP_FRONTEND_URL || 
             'https://nna-registry-service-mvp-frontend.vercel.app';
    
    case 'development':
    default:
      return process.env.REACT_APP_FRONTEND_URL || 
             'http://localhost:3001';
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