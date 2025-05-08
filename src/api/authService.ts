import api from './api';
import { User } from '../contexts/AuthContext';
import { ApiResponse } from '../types/api.types';

interface AuthResponse {
  user: User;
  token: string;
}

// Create a simple in-memory user database for development
const mockUsers: Record<string, { username: string; password: string; email: string }> = {
  'test@example.com': { 
    username: 'testuser', 
    password: 'password123', 
    email: 'test@example.com' 
  },
  'admin@example.com': { 
    username: 'admin', 
    password: 'admin123', 
    email: 'admin@example.com' 
  }
};

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // For development/testing: Use mock implementation instead of API call
      console.log('Using mock login implementation');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user exists and password matches (simple mock implementation)
      const user = mockUsers[email];
      if (!user || user.password !== password) {
        throw new Error('Invalid email or password');
      }
      
      // Create a mock user response
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          username: user.username,
          email: user.email,
          role: 'user',
        },
        token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 15),
      };
      
      // Optionally store the token in localStorage for persistence
      localStorage.setItem('accessToken', mockResponse.token);
      
      return mockResponse;
      
      // Original implementation - uncomment when API is ready
      /*
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        {
          email,
          password,
        }
      );
      return response.data.data as AuthResponse;
      */
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
      // For development/testing: Use mock implementation instead of API call
      console.log('Using mock register implementation');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user already exists
      if (mockUsers[email]) {
        throw new Error('User with this email already exists');
      }
      
      // Create a new user in our mock database
      mockUsers[email] = {
        username,
        email,
        password
      };
      
      // Create a mock user response
      const mockResponse: AuthResponse = {
        user: {
          id: Math.random().toString(36).substring(2, 10),
          username,
          email,
          role: 'user',
        },
        token: 'mock-jwt-token-' + Math.random().toString(36).substring(2, 15),
      };
      
      // Optionally store the token in localStorage for persistence
      localStorage.setItem('accessToken', mockResponse.token);
      
      return mockResponse;
      
      // Original implementation - uncomment when API is ready
      /*
      const response = await api.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        {
          username,
          email,
          password,
        }
      );
      return response.data.data as AuthResponse;
      */
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Registration failed'
      );
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      // For development/testing: Use mock implementation instead of API call
      console.log('Using mock getCurrentUser implementation');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      // In a real implementation, we would decode the JWT token
      // For mock, just return a hardcoded user
      return {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      };
      
      // Original implementation - uncomment when API is ready
      /*
      const response = await api.get<ApiResponse<User>>('/auth/profile');
      return response.data.data as User;
      */
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
