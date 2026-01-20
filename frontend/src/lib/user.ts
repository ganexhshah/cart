// User API Service

import { api, ApiResponse } from './api';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'waiter' | 'admin' | 'owner';
  avatar_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationPreferences {
  emailOrders?: boolean;
  emailMarketing?: boolean;
  pushNotifications?: boolean;
  smsAlerts?: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
}

export interface LoginHistoryItem {
  id: string;
  ip_address: string;
  device: string;
  browser: string;
  os: string;
  location?: string;
  status: 'success' | 'failed' | 'blocked';
  failure_reason?: string;
  created_at: string;
}

export interface AccountStats {
  memberSince: string;
  totalRestaurants: number;
  totalOrders: number;
  accountStatus: string;
}

export interface UserSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  autoSave: boolean;
  compactMode: boolean;
  showTips: boolean;
  analyticsTracking: boolean;
  marketingEmails: boolean;
  systemNotifications: boolean;
}

export const userApi = {
  // Get user profile
  getProfile: async () => {
    return api.get<ApiResponse<UserProfile>>('/users/profile');
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData) => {
    return api.put<ApiResponse<UserProfile>>('/users/profile', data);
  },

  // Update avatar
  updateAvatar: async (avatarUrl: string) => {
    return api.put<ApiResponse<UserProfile>>('/users/avatar', { avatarUrl });
  },

  // Change password
  changePassword: async (data: ChangePasswordData) => {
    return api.post<ApiResponse<void>>('/users/change-password', data);
  },

  // Get notification preferences
  getNotificationPreferences: async () => {
    return api.get<ApiResponse<NotificationPreferences>>('/users/notification-preferences');
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences: NotificationPreferences) => {
    return api.put<ApiResponse<NotificationPreferences>>('/users/notification-preferences', preferences);
  },

  // Two-Factor Authentication
  enable2FA: async () => {
    return api.post<ApiResponse<TwoFactorSetup>>('/security/2fa/enable');
  },

  verify2FASetup: async (token: string) => {
    return api.post<ApiResponse<void>>('/security/2fa/verify', { token });
  },

  disable2FA: async () => {
    return api.post<ApiResponse<void>>('/security/2fa/disable');
  },

  get2FAStatus: async () => {
    return api.get<ApiResponse<TwoFactorStatus>>('/security/2fa/status');
  },

  // Login History
  getLoginHistory: async (limit: number = 20) => {
    return api.get<ApiResponse<LoginHistoryItem[]>>(`/security/login-history?limit=${limit}`);
  },

  // Account Stats
  getAccountStats: async () => {
    return api.get<ApiResponse<AccountStats>>('/users/account-stats');
  },

  // User Settings
  getSettings: async () => {
    return api.get<ApiResponse<UserSettings>>('/users/settings');
  },

  updateSettings: async (settings: Partial<UserSettings>) => {
    return api.put<ApiResponse<UserSettings>>('/users/settings', settings);
  },
};
