import api from './api';
import { User } from '../contexts/AuthContext';
import { ApiResponse } from '../../types/api.types';

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        {
          email,
          password,
        }
      );

      return response.data.data as AuthResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        {
          username,
          email,
          password,
        }
      );

      return response.data.data as AuthResponse;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Registration failed'
      );
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/profile');
      return response.data.data as User;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch user'
      );
    }
  }
}

// Export a singleton instance
export default new AuthService();
