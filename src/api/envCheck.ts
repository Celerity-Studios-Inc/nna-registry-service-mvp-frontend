// Environment variables check
console.log("Environment check at runtime:");
console.log("REACT_APP_API_URL =", process.env.REACT_APP_API_URL);
console.log("REACT_APP_USE_MOCK_API =", process.env.REACT_APP_USE_MOCK_API);
console.log("useMock evaluated =", process.env.REACT_APP_USE_MOCK_API === 'true');

export const checkEnv = () => {
  return {
    apiUrl: process.env.REACT_APP_API_URL,
    useMockApi: process.env.REACT_APP_USE_MOCK_API,
    useMockEvaluated: process.env.REACT_APP_USE_MOCK_API === 'true'
  };
};