import api from './api';
import { ApiResponse } from '../types/api.types';

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Service for authentication
 */
class AuthService {
  /**
   * Login a user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      if (process.env.NODE_ENV !== 'production') {
        // Mock implementation for development
        console.log("Using mock login implementation");
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple validation
        if (!credentials.email || !credentials.password) {
          throw new Error('Email and password are required');
        }
        
        // Create a mock response
        const mockResponse: AuthResponse = {
          accessToken: "mock-token-" + Date.now(),
          user: {
            id: "user-1",
            email: credentials.email,
            name: "Test User",
            role: "user"
          }
        };
        
        // Store token in localStorage
        localStorage.setItem('accessToken', mockResponse.accessToken);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        
        return mockResponse;
      } else {
        // Production code - actual API call
        const response = await api.post<ApiResponse<AuthResponse>>(
          '/auth/login',
          credentials
        );
        
        // Store token in localStorage
        const authData = response.data.data;
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('user', JSON.stringify(authData.user));
        
        return authData;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      if (process.env.NODE_ENV !== 'production') {
        // Mock implementation for development
        console.log("Using mock register implementation");
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple validation
        if (!userData.email || !userData.password || !userData.name) {
          throw new Error('Name, email and password are required');
        }
        
        // Create a mock response
        const mockResponse: AuthResponse = {
          accessToken: "mock-token-" + Date.now(),
          user: {
            id: "user-" + Date.now(),
            email: userData.email,
            name: userData.name,
            role: "user"
          }
        };
        
        // Store token in localStorage
        localStorage.setItem('accessToken', mockResponse.accessToken);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
        
        return mockResponse;
      } else {
        // Production code - actual API call
        const response = await api.post<ApiResponse<AuthResponse>>(
          '/auth/register',
          userData
        );
        
        // Store token in localStorage
        const authData = response.data.data;
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('user', JSON.stringify(authData.user));
        
        return authData;
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout the user
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get the current user
   */
  getCurrentUser(): any {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
}

const authService = new AuthService();
export default authService;