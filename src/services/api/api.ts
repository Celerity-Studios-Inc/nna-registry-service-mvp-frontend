// Placeholder for api
const api = {
  get: async <T = any>(url: string) => ({ data: {} as T }),
  post: async <T = any>(url: string, body?: any) => ({ data: {} as T }),
  put: async <T = any>(url: string, body?: any) => ({ data: {} as T }),
  delete: async <T = any>(url: string) => ({ data: {} as T }),
};
export default api;
export const apiConfig = {
  // Use relative URL to ensure requests go through Vercel proxy
  baseURL: '/api'
}; 