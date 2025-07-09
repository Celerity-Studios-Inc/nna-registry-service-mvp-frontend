/**
 * Environment Variable Diagnostic Utility
 * Helps troubleshoot environment variable configuration issues
 */

export function logEnvironmentDiagnostic(): void {
  console.group('🔍 Environment Variable Diagnostic');
  
  // Basic environment info
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REACT_APP_ENVIRONMENT:', process.env.REACT_APP_ENVIRONMENT);
  
  // Check all REACT_APP_ environment variables
  const reactAppVars = Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_'))
    .reduce((obj, key) => {
      obj[key] = process.env[key] ? `${process.env[key]?.substring(0, 10)}...` : 'undefined';
      return obj;
    }, {} as Record<string, string>);
  
  console.log('All REACT_APP_ variables:', reactAppVars);
  
  // Specific OpenAI key check
  const openaiKey = process.env.REACT_APP_OPENAI_API_KEY;
  console.log('REACT_APP_OPENAI_API_KEY present:', !!openaiKey);
  console.log('REACT_APP_OPENAI_API_KEY length:', openaiKey?.length || 0);
  console.log('REACT_APP_OPENAI_API_KEY starts with sk-:', openaiKey?.startsWith('sk-') || false);
  
  // Runtime info
  console.log('Window location:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
  console.log('Build time:', new Date().toISOString());
  
  // Vercel specific variables
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelUrl = process.env.VERCEL_URL;
  console.log('VERCEL_ENV:', vercelEnv);
  console.log('VERCEL_URL:', vercelUrl);
  
  console.groupEnd();
}

// Auto-run diagnostic on import
if (typeof window !== 'undefined' && window.location.hostname.includes('dev')) {
  logEnvironmentDiagnostic();
}