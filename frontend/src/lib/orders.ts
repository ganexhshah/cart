// Orders API Service

import { api, ApiResponse } from './api';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  status?: 'pending' | 'preparing' | 'ready' | 'served';
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

export interface CreateGuestOrderData extends CreateOrderData {
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
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

  // Create guest order (no authentication required)
  createGuest: async (data: CreateGuestOrderData) => {
    return api.post<ApiResponse<Order>>('/orders/guest', data);
  },

  // Get guest order by ID (no authentication required)
  getGuestOrder: async (id: string) => {
    return api.get<ApiResponse<Order>>(`/orders/guest/${id}`);
  },

  // Update order status
  updateStatus: async (id: string, status: Order['status']) => {
    return api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
  },

  // Cancel order
  cancel: async (id: string) => {
    return api.delete<ApiResponse<void>>(`/orders/${id}`);
  },

  // Get table orders
  getTableOrders: async (tableId: string) => {
    // For now, we'll get all orders and filter on the frontend
    // This should be optimized in the backend later
    const response = await api.get<ApiResponse<Order[]>>('/orders');
    if (response.success) {
      // Filter orders by table_id on the frontend
      const filteredOrders = response.data.filter((order: any) => order.table_id === tableId);
      return { success: true, data: filteredOrders };
    }
    return response;
  },

  // Get menu items for restaurant
  getMenuItems: async (restaurantId: string) => {
    return api.get<ApiResponse<any[]>>(`/menu/items?restaurantId=${restaurantId}`);
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string) => {
    return api.patch<ApiResponse<Order>>(`/orders/${orderId}/status`, { status });
  },
};
