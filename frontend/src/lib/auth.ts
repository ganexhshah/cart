// Authentication utilities

import { api, ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'customer' | 'waiter' | 'admin' | 'owner';
  avatarUrl?: string;
  isVerified: boolean;
  primaryRestaurantId?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'customer' | 'waiter' | 'admin' | 'owner';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OTPData {
  email: string;
  phone?: string;
}

export interface VerifyOTPData {
  email: string;
  otpCode: string;
  userData?: {
    fullName: string;
    phone?: string;
    role?: 'customer' | 'waiter' | 'admin' | 'owner';
    restaurantName?: string;
  };
}

// Authentication API calls
export const authApi = {
  // OTP-based authentication
  sendOTP: async (data: OTPData): Promise<ApiResponse<{ message: string; expiresIn: number }>> => {
    return api.post<ApiResponse<{ message: string; expiresIn: number }>>('/auth/send-otp', data);
  },

  verifyOTP: async (data: VerifyOTPData): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/verify-otp', data);
    
    // Store tokens in localStorage with validation
    if (response.success && response.data && response.data.accessToken) {
      try {
        localStorage.setItem('token', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error('Error storing auth data:', error);
      }
    }
    
    return response;
  },

  // Google OAuth
  googleLogin: (): void => {
    window.location.href = `http://localhost:3001/auth/google`;
  },

  // Handle OAuth callback tokens from URL
  handleOAuthCallback: (): { token?: string; refreshToken?: string } => {
    if (typeof window === 'undefined') return {};
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refreshToken = urlParams.get('refresh');
    
    if (token) {
      try {
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        url.searchParams.delete('refresh');
        window.history.replaceState({}, document.title, url.toString());
        
        return { token, refreshToken };
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
      }
    }
    
    return {};
  },

  // Legacy password-based methods
  register: async (data: RegisterData): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response;
  },

  login: async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    
    // Store tokens in localStorage with validation
    if (response.success && response.data && response.data.accessToken) {
      try {
        localStorage.setItem('token', response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error('Error storing auth data:', error);
      }
    }
    
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear local storage
      authApi.clearAuthData();
    }
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    return api.get<ApiResponse<User>>('/auth/me');
  },

  refreshToken: async (): Promise<ApiResponse<{ accessToken: string }>> => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    );
    
    if (response.success && response.data && response.data.accessToken) {
      try {
        localStorage.setItem('token', response.data.accessToken);
      } catch (error) {
        console.error('Error storing refreshed token:', error);
      }
    }
    
    return response;
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const token = localStorage.getItem('token');
      return !!(token && token !== 'undefined' && token !== 'null');
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  getStoredUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing stored user:', error);
      // Clear invalid data
      localStorage.removeItem('user');
      return null;
    }
  },

  getUserRole: (): string | null => {
    try {
      const user = authApi.getStoredUser();
      return user?.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },

  // Clear all auth data from localStorage
  clearAuthData: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },
};
