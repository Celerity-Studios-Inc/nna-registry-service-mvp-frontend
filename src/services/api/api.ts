// Placeholder for api
const api = {
  get: async <T = any>(url: string) => ({ data: {} as T }),
  post: async <T = any>(url: string, body?: any) => ({ data: {} as T }),
  put: async <T = any>(url: string, body?: any) => ({ data: {} as T }),
  delete: async <T = any>(url: string) => ({ data: {} as T }),
};
export default api;
export const apiConfig = {
  baseURL: 'https://registry.reviz.dev/api'
}; 