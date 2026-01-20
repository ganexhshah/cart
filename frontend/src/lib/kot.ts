// KOT (Kitchen Order Ticket) API

import { api, ApiResponse } from './api';

export interface KOTItem {
  id: string;
  restaurant_id: string;
  category_id?: string;
  menu_item_id?: string;
  name: string;
  description?: string;
  preparation_time: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  special_instructions?: string;
  ingredients?: any;
  allergens?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string;
  menu_item_name?: string;
  price?: number;
}

export interface KOTOrderItem {
  id: string;
  kot_order_id: string;
  kot_item_id: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  special_requests?: string;
  preparation_notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  item_name?: string;
  preparation_time?: number;
  difficulty_level?: string;
}

export interface KOTOrder {
  id: string;
  restaurant_id: string;
  order_id?: string;
  table_id?: string;
  kot_number: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  total_items: number;
  estimated_time?: number;
  actual_time?: number;
  notes?: string;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  table_number?: string;
  table_name?: string;
  created_by_name?: string;
  assigned_to_name?: string;
  items?: KOTOrderItem[];
}

export interface KOTStats {
  total_kots: number;
  pending_kots: number;
  preparing_kots: number;
  ready_kots: number;
  served_kots: number;
  avg_preparation_time?: number;
  avg_estimated_time?: number;
}

export interface CreateKOTOrderData {
  orderId?: string;
  tableId?: string;
  items: {
    kot_item_id: string;
    quantity: number;
    special_requests?: string;
  }[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  restaurantId?: string;
}

// KOT API functions
export const kotApi = {
  // Get all KOT orders
  getAll: async (params?: {
    restaurantId?: string;
    status?: string;
    priority?: string;
    tableId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<KOTOrder[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.restaurantId) searchParams.append('restaurantId', params.restaurantId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    if (params?.tableId) searchParams.append('tableId', params.tableId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    return api.get<ApiResponse<KOTOrder[]>>(`/kot${queryString ? `?${queryString}` : ''}`);
  },

  // Get KOT order by ID
  getById: async (id: string, restaurantId?: string): Promise<ApiResponse<KOTOrder>> => {
    const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return api.get<ApiResponse<KOTOrder>>(`/kot/${id}${params}`);
  },

  // Create new KOT order
  create: async (data: CreateKOTOrderData): Promise<ApiResponse<KOTOrder>> => {
    return api.post<ApiResponse<KOTOrder>>('/kot', data);
  },

  // Update KOT status
  updateStatus: async (id: string, status: string, restaurantId?: string): Promise<ApiResponse<KOTOrder>> => {
    return api.patch<ApiResponse<KOTOrder>>(`/kot/${id}/status`, { status, restaurantId });
  },

  // Update KOT priority
  updatePriority: async (id: string, priority: string, restaurantId?: string): Promise<ApiResponse<KOTOrder>> => {
    return api.patch<ApiResponse<KOTOrder>>(`/kot/${id}/priority`, { priority, restaurantId });
  },

  // Get KOT statistics
  getStats: async (restaurantId?: string, dateRange?: string): Promise<ApiResponse<KOTStats>> => {
    const params = new URLSearchParams();
    if (restaurantId) params.append('restaurantId', restaurantId);
    if (dateRange) params.append('dateRange', dateRange);
    
    const queryString = params.toString();
    return api.get<ApiResponse<KOTStats>>(`/kot/stats${queryString ? `?${queryString}` : ''}`);
  },

  // Get KOT items
  getItems: async (restaurantId?: string): Promise<ApiResponse<KOTItem[]>> => {
    const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return api.get<ApiResponse<KOTItem[]>>(`/kot/items${params}`);
  },
};