import axios from 'axios';
import { apiConfig } from '../../api/api';
import {
  Asset,
  AssetSearchResponse,
  FileUploadResponse,
} from '../../types/asset.types';

const api = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('accessToken');
    const testToken = localStorage.getItem('testToken');
    const token = accessToken || testToken;
    
    if (token) {
      const cleanToken = token.replace(/\s+/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export const assetService = {
  async createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
    const response = await api.post<Asset>('/assets', asset);
    return response.data;
  },

  async updateAsset(id: string, asset: Partial<Asset>): Promise<Asset> {
    const response = await api.put<Asset>(`/assets/${id}`, asset);
    return response.data;
  },

  async deleteAsset(id: string): Promise<void> {
    await api.delete(`/assets/${id}`);
  },

  async getAsset(id: string): Promise<Asset> {
    const response = await api.get<Asset>(`/assets/${id}`);
    return response.data;
  },

  async searchAssets(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<AssetSearchResponse> {
    const response = await api.get<AssetSearchResponse>('/assets/search', {
      params: { query, page, limit },
    });
    return response.data;
  },

  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FileUploadResponse>(
      '/assets/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
