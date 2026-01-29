// POS (Point of Sale) API

import { api, ApiResponse } from './api';

export interface POSTerminal {
  id: string;
  restaurant_id: string;
  terminal_name: string;
  terminal_code: string;
  location?: string;
  is_active: boolean;
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface POSSession {
  id: string;
  terminal_id: string;
  user_id: string;
  session_start: string;
  session_end?: string;
  opening_cash: number;
  closing_cash?: number;
  total_sales: number;
  total_transactions: number;
  status: 'active' | 'closed';
  notes?: string;
  created_at: string;
}

export interface POSTransaction {
  id: string;
  restaurant_id: string;
  session_id?: string;
  order_id?: string;
  transaction_number: string;
  transaction_type: 'sale' | 'refund' | 'void';
  payment_method: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  tip_amount: number;
  total_amount: number;
  amount_paid: number;
  change_amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_reference?: string;
  notes?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
  terminal_name?: string;
  processed_by_name?: string;
}

export interface POSPaymentMethod {
  id: string;
  restaurant_id: string;
  method_name: string;
  method_type: 'cash' | 'card' | 'digital';
  is_active: boolean;
  processing_fee: number;
  min_amount: number;
  max_amount?: number;
  configuration?: any;
  created_at: string;
  updated_at: string;
}

export interface POSDiscount {
  id: string;
  restaurant_id: string;
  discount_name: string;
  discount_type: 'percentage' | 'fixed' | 'buy_x_get_y';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  applicable_items?: any;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  days_of_week?: number[];
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface POSStats {
  total_transactions: number;
  total_sales: number;
  average_transaction: number;
  active_sessions: number;
  cash_sales: number;
  card_sales: number;
  upi_sales: number;
}

export interface CreateTerminalData {
  terminalName: string;
  terminalCode: string;
  location?: string;
  restaurantId?: string;
}

export interface StartSessionData {
  terminalId: string;
  openingCash: number;
}

export interface EndSessionData {
  closingCash: number;
  notes?: string;
}

export interface ProcessTransactionData {
  sessionId?: string;
  orderId?: string;
  paymentMethod: string;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  tipAmount?: number;
  amountPaid: number;
  paymentReference?: string;
  restaurantId?: string;
}

export interface CreatePaymentMethodData {
  methodName: string;
  methodType: 'cash' | 'card' | 'digital';
  processingFee?: number;
  minAmount?: number;
  maxAmount?: number;
  restaurantId?: string;
}

// POS API functions
export const posApi = {
  // Terminals
  getTerminals: async (restaurantId?: string): Promise<ApiResponse<POSTerminal[]>> => {
    const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return api.get<ApiResponse<POSTerminal[]>>(`/pos/terminals${params}`);
  },

  createTerminal: async (data: CreateTerminalData): Promise<ApiResponse<POSTerminal>> => {
    return api.post<ApiResponse<POSTerminal>>('/pos/terminals', data);
  },

  // Sessions
  startSession: async (data: StartSessionData): Promise<ApiResponse<POSSession>> => {
    return api.post<ApiResponse<POSSession>>('/pos/sessions', data);
  },

  endSession: async (sessionId: string, data: EndSessionData): Promise<ApiResponse<POSSession>> => {
    return api.patch<ApiResponse<POSSession>>(`/pos/sessions/${sessionId}/end`, data);
  },

  // Transactions
  processTransaction: async (data: ProcessTransactionData): Promise<ApiResponse<POSTransaction>> => {
    return api.post<ApiResponse<POSTransaction>>('/pos/transactions', data);
  },

  getTransactions: async (params?: {
    restaurantId?: string;
    sessionId?: string;
    dateFrom?: string;
    dateTo?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<POSTransaction[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.restaurantId) searchParams.append('restaurantId', params.restaurantId);
    if (params?.sessionId) searchParams.append('sessionId', params.sessionId);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);
    if (params?.paymentMethod) searchParams.append('paymentMethod', params.paymentMethod);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    return api.get<ApiResponse<POSTransaction[]>>(`/pos/transactions${queryString ? `?${queryString}` : ''}`);
  },

  // Statistics
  getStats: async (restaurantId?: string, dateRange?: string): Promise<ApiResponse<POSStats>> => {
    const params = new URLSearchParams();
    if (restaurantId) params.append('restaurantId', restaurantId);
    if (dateRange) params.append('dateRange', dateRange);
    
    const queryString = params.toString();
    return api.get<ApiResponse<POSStats>>(`/pos/stats${queryString ? `?${queryString}` : ''}`);
  },

  // Payment Methods
  getPaymentMethods: async (restaurantId?: string): Promise<ApiResponse<POSPaymentMethod[]>> => {
    const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return api.get<ApiResponse<POSPaymentMethod[]>>(`/pos/payment-methods${params}`);
  },

  createPaymentMethod: async (data: CreatePaymentMethodData): Promise<ApiResponse<POSPaymentMethod>> => {
    return api.post<ApiResponse<POSPaymentMethod>>('/pos/payment-methods', data);
  },

  // Discounts
  getDiscounts: async (restaurantId?: string): Promise<ApiResponse<POSDiscount[]>> => {
    const params = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return api.get<ApiResponse<POSDiscount[]>>(`/pos/discounts${params}`);
  },

  applyDiscount: async (discountId: string, orderAmount: number): Promise<ApiResponse<any>> => {
    return api.post<ApiResponse<any>>(`/pos/discounts/${discountId}/apply`, { orderAmount });
  },

  // Reports
  getDailyReport: async (restaurantId?: string, date?: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (restaurantId) params.append('restaurantId', restaurantId);
    if (date) params.append('date', date);
    
    const queryString = params.toString();
    return api.get<ApiResponse<any>>(`/pos/reports/daily${queryString ? `?${queryString}` : ''}`);
  },

  // Create order through POS
  createOrder: async (data: any): Promise<ApiResponse<any>> => {
    return api.post<ApiResponse<any>>('/pos/orders', data);
  },
};