// Import environment utility to ensure consistent detection
import { isDevelopment, environmentSafeLog } from '../utils/environment';

// Environment variables check - only log in development mode
if (isDevelopment()) {
  environmentSafeLog('Environment check at runtime:');
  environmentSafeLog('REACT_APP_API_URL =', process.env.REACT_APP_API_URL);
  environmentSafeLog('REACT_APP_USE_MOCK_API =', process.env.REACT_APP_USE_MOCK_API);
  environmentSafeLog(
    'useMock evaluated =',
    process.env.REACT_APP_USE_MOCK_API === 'true'
  );
}

export const checkEnv = () => {
  return {
    apiUrl: process.env.REACT_APP_API_URL,
    useMockApi: process.env.REACT_APP_USE_MOCK_API,
    useMockEvaluated: process.env.REACT_APP_USE_MOCK_API === 'true',
  };
};
