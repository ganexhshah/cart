// Orders API Service

import { api, ApiResponse } from './api';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  order_number: string;
  restaurant_id: string;
  customer_id?: string;
  table_id?: string;
  waiter_id?: string;
  order_type: 'dine-in' | 'takeaway' | 'delivery';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  discount: number;
  delivery_fee: number;
  total: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cash' | 'card' | 'upi' | 'wallet';
  special_instructions?: string;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  estimated_time?: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  restaurantId: string;
  tableId?: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  specialInstructions?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
}

export const orderApi = {
  // Get all orders
  getAll: async (params?: {
    restaurantId?: string;
    customerId?: string;
    status?: string;
    orderType?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.restaurantId) queryParams.append('restaurantId', params.restaurantId);
    if (params?.customerId) queryParams.append('customerId', params.customerId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.orderType) queryParams.append('orderType', params.orderType);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    
    const query = queryParams.toString();
    return api.get<ApiResponse<Order[]>>(`/orders${query ? `?${query}` : ''}`);
  },

  // Get order by ID
  getById: async (id: string) => {
    return api.get<ApiResponse<Order>>(`/orders/${id}`);
  },

  // Create order
  create: async (data: CreateOrderData) => {
    return api.post<ApiResponse<Order>>('/orders', data);
  },

  // Update order status
  updateStatus: async (id: string, status: Order['status']) => {
    return api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
  },

  // Cancel order
  cancel: async (id: string) => {
    return api.delete<ApiResponse<void>>(`/orders/${id}`);
  },
};
