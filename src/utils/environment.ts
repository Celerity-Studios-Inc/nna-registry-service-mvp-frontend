/**
 * Environment Utility
 * 
 * Provides consistent environment detection and configuration across the app.
 * This is the single source of truth for environment detection.
 */

// Cache the environment values at runtime to avoid inconsistent checks
const ENV = {
  NODE_ENV: process.env.NODE_ENV || '',
  REACT_APP_ENV: process.env.REACT_APP_ENV || '',
  REACT_APP_API_URL: process.env.REACT_APP_API_URL || '/api',
  REACT_APP_USE_MOCK_API: process.env.REACT_APP_USE_MOCK_API === 'true'
};

// Force logging off in production
const FORCE_PROD_LOGGING_OFF = true;

/**
 * Check if the app is running in a production environment
 * This is a definitive check that should be used throughout the app
 */
export const isProduction = (): boolean => {
  return ENV.NODE_ENV === 'production';
};

/**
 * Check if the app is running in a development environment
 */
export const isDevelopment = (): boolean => {
  return ENV.NODE_ENV === 'development';
};

/**
 * Check if the app is running in a test environment
 */
export const isTest = (): boolean => {
  return ENV.NODE_ENV === 'test';
};

/**
 * Safely check localStorage with try/catch to handle cases where
 * localStorage might not be available
 */
const safeLocalStorageGet = (key: string): string | null => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (e) {
    // Silently fail if localStorage is not available
  }
  return null;
};

/**
 * Check if debugging is allowed in the current environment
 * This will return false in production unless specifically overridden
 * AND the global force production logging off flag is not set
 */
export const isDebuggingAllowed = (): boolean => {
  // Never allow debugging in production if forced off globally
  if (isProduction() && FORCE_PROD_LOGGING_OFF) {
    return false;
  }
  
  // Otherwise check if debugging is explicitly enabled in production
  if (isProduction()) {
    return safeLocalStorageGet('logger_force_enabled') === 'true';
  }
  
  // In development or test, debugging is allowed by default
  return true;
};

/**
 * Safe console logger that respects environment
 * Only logs in non-production environments unless debugging is forced on
 */
export const environmentSafeLog = (message: string, ...args: any[]): void => {
  if (isDebuggingAllowed()) {
    console.log(message, ...args);
  }
};

/**
 * Safe console error logger that respects environment
 * Always logs errors in all environments (for critical issues)
 */
export const environmentSafeError = (message: string, ...args: any[]): void => {
  console.error(message, ...args);
};

/**
 * Safe console warning logger that respects environment
 */
export const environmentSafeWarn = (message: string, ...args: any[]): void => {
  if (isDebuggingAllowed()) {
    console.warn(message, ...args);
  }
};

/**
 * Safe console info logger that respects environment
 */
export const environmentSafeInfo = (message: string, ...args: any[]): void => {
  if (isDebuggingAllowed()) {
    console.info(message, ...args);
  }
};

/**
 * Safe console debug logger that respects environment
 */
export const environmentSafeDebug = (message: string, ...args: any[]): void => {
  if (isDebuggingAllowed()) {
    console.debug(message, ...args);
  }
};

/**
 * Get API URL based on environment
 */
export const getApiUrl = (): string => {
  return ENV.REACT_APP_API_URL;
};

/**
 * Get whether to use mock API based on environment
 */
export const shouldUseMockApi = (): boolean => {
  return ENV.REACT_APP_USE_MOCK_API;
};

/**
 * Check if a feature should be enabled in the current environment
 */
export const isFeatureEnabled = (featureFlag: string): boolean => {
  // In test environment, disable all feature flags
  if (isTest()) {
    return false;
  }
  
  // Check localStorage for feature flag
  return safeLocalStorageGet(`feature_${featureFlag}`) === 'true';
};

// Print environment information only in development
if (isDevelopment()) {
  environmentSafeLog('Environment: ', {
    NODE_ENV: ENV.NODE_ENV,
    REACT_APP_ENV: ENV.REACT_APP_ENV,
    REACT_APP_API_URL: ENV.REACT_APP_API_URL,
    REACT_APP_USE_MOCK_API: ENV.REACT_APP_USE_MOCK_API,
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    isTest: isTest(),
    isDebuggingAllowed: isDebuggingAllowed()
  });
}