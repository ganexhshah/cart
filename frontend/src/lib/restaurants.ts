// Restaurant API Service

import { api, ApiResponse } from './api';

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  wifi_name?: string;
  wifi_password?: string;
  opening_time?: string;
  closing_time?: string;
  is_active: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRestaurantData {
  name: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  openingTime?: string;
  closingTime?: string;
}

export const restaurantApi = {
  // Get all restaurants
  getAll: async (params?: { city?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.city) queryParams.append('city', params.city);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    
    const query = queryParams.toString();
    return api.get<ApiResponse<Restaurant[]>>(`/restaurants${query ? `?${query}` : ''}`);
  },

  // Get restaurant by ID
  getById: async (id: string) => {
    return api.get<ApiResponse<Restaurant>>(`/restaurants/${id}`);
  },

  // Get restaurant menu
  getMenu: async (id: string) => {
    return api.get<ApiResponse<any>>(`/restaurants/${id}/menu`);
  },

  // Create restaurant
  create: async (data: CreateRestaurantData) => {
    return api.post<ApiResponse<Restaurant>>('/restaurants', data);
  },

  // Update restaurant
  update: async (id: string, data: Partial<CreateRestaurantData>) => {
    return api.put<ApiResponse<Restaurant>>(`/restaurants/${id}`, data);
  },

  // Delete restaurant
  delete: async (id: string) => {
    return api.delete<ApiResponse<void>>(`/restaurants/${id}`);
  },
};
