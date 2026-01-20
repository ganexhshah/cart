import { api, ApiResponse } from './api';

export interface Customer {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  total_orders: number;
  total_spent: number;
  loyalty_points: number;
  dietary_preferences: string[];
  allergies: string[];
  join_date: string;
  status: 'active' | 'vip' | 'inactive';
  last_order_date?: string;
  avg_rating?: number;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  location?: string;
  dietaryPreferences?: string[];
  allergies?: string[];
}

export interface CustomerOrder {
  id: string;
  order_number: string;
  restaurant_name: string;
  table_number?: string;
  order_type: 'dine-in' | 'takeaway' | 'delivery';
  status: string;
  total: number;
  created_at: string;
  items: {
    item_name: string;
    quantity: number;
    item_price: number;
    special_instructions?: string;
  }[];
}

export interface CustomerStats {
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  completed_orders: number;
  cancelled_orders: number;
  orders_last_30_days: number;
  last_order_date?: string;
  first_order_date?: string;
  favorite_order_type?: string;
  avg_rating_given?: number;
}

export interface RestaurantCustomerStats {
  total_customers: number;
  vip_customers: number;
  active_customers: number;
  avg_customer_value: number;
  total_revenue: number;
  avg_orders_per_customer: number;
  new_customers_this_month: number;
}

// Get all customers for a restaurant
export const getCustomers = async (restaurantId: string, filters?: {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}): Promise<Customer[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  
  const queryString = params.toString();
  const url = `/customers/restaurant/${restaurantId}${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get<ApiResponse<Customer[]>>(url);
  return response.data;
};

// Get customer by ID
export const getCustomerById = async (customerId: string): Promise<Customer & {
  restaurant_name: string;
  recent_orders: number;
  favorite_items: {
    item_name: string;
    order_count: number;
  }[];
}> => {
  const response = await api.get<ApiResponse<Customer & {
    restaurant_name: string;
    recent_orders: number;
    favorite_items: {
      item_name: string;
      order_count: number;
    }[];
  }>>(`/customers/${customerId}`);
  return response.data;
};

// Add new customer
export const addCustomer = async (restaurantId: string, customerData: CustomerFormData): Promise<Customer> => {
  const response = await api.post<ApiResponse<Customer>>(`/customers/restaurant/${restaurantId}`, customerData);
  return response.data;
};

// Update customer
export const updateCustomer = async (customerId: string, updateData: Partial<CustomerFormData>): Promise<Customer> => {
  const response = await api.put<ApiResponse<Customer>>(`/customers/${customerId}`, updateData);
  return response.data;
};

// Delete customer
export const deleteCustomer = async (customerId: string): Promise<void> => {
  await api.delete(`/customers/${customerId}`);
};

// Get customer orders
export const getCustomerOrders = async (customerId: string, options?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<CustomerOrder[]> => {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.offset) params.append('offset', options.offset.toString());
  if (options?.status) params.append('status', options.status);
  
  const queryString = params.toString();
  const url = `/customers/${customerId}/orders${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get<ApiResponse<CustomerOrder[]>>(url);
  return response.data;
};

// Get customer statistics
export const getCustomerStats = async (customerId: string): Promise<CustomerStats> => {
  const response = await api.get<ApiResponse<CustomerStats>>(`/customers/${customerId}/stats`);
  return response.data;
};

// Update customer status
export const updateCustomerStatus = async (customerId: string, status: 'active' | 'vip' | 'inactive'): Promise<Customer> => {
  const response = await api.patch<ApiResponse<Customer>>(`/customers/${customerId}/status`, { status });
  return response.data;
};

// Add loyalty points
export const addLoyaltyPoints = async (customerId: string, points: number, reason: string): Promise<Customer> => {
  const response = await api.post<ApiResponse<Customer>>(`/customers/${customerId}/loyalty-points`, { points, reason });
  return response.data;
};

// Get restaurant customer statistics
export const getRestaurantCustomerStats = async (restaurantId: string): Promise<RestaurantCustomerStats> => {
  const response = await api.get<ApiResponse<RestaurantCustomerStats>>(`/customers/restaurant/${restaurantId}/stats`);
  return response.data;
};

// Send email to customer
export const sendCustomerEmail = async (customerId: string, emailData: {
  subject: string;
  message: string;
  type?: string;
}): Promise<{ sent: boolean; email: string }> => {
  const response = await api.post<ApiResponse<{ sent: boolean; email: string }>>(`/customers/${customerId}/send-email`, emailData);
  return response.data;
};