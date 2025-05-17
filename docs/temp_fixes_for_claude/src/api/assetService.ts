import axios from 'axios';
import { Asset, AssetCreateRequest, AssetSearchParams, Pagination } from '../types/asset.types';

class AssetService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '/api';
  }

  private getHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private buildQueryString(params: AssetSearchParams): string {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.layer) query.set('layer', params.layer);
    if (params.category) query.set('category', params.category);
    if (params.subcategory) query.set('subcategory', params.subcategory);
    if (params.tags) params.tags.forEach(tag => query.append('tags', tag));
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return query.toString();
  }

  async getAssets(params: AssetSearchParams): Promise<{ assets: Asset[], pagination: Pagination }> {
    try {
      const queryString = this.buildQueryString(params);
      const response = await fetch(`/api/assets?${queryString}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`API returned error status ${response.status}`);
      }

      const data = await response.json();
      return {
        assets: data.data.items,
        pagination: {
          currentPage: data.data.page,
          totalPages: Math.ceil(data.data.total / data.data.limit),
          totalItems: data.data.total,
          itemsPerPage: data.data.limit,
        },
      };
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw new Error('Failed to fetch assets from the server. Please try again later.');
    }
  }

  async getAssetById(id: string): Promise<Asset> {
    try {
      let response = await fetch(`/api/asset/${id}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        response = await fetch(`/api/assets/${id}`, {
          headers: this.getHeaders(),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching asset:', id, error);
      throw new Error('Failed to fetch asset details from the server. Please try again later.');
    }
  }

  async createAsset(asset: AssetCreateRequest): Promise<Asset> {
    const response = await axios.post(`${this.baseURL}/assets`, asset, {
      headers: this.getHeaders(),
    });
    return response.data.data;
  }

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${this.baseURL}/upload`, formData, {
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  }
}

export const assetService = new AssetService();