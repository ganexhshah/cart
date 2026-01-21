import { api } from './api';

export interface Bill {
  id: string;
  billNumber: string;
  customerName?: string;
  customerPhone?: string;
  tableId?: string;
  tableNumber?: string;
  subtotal: number;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  serviceChargeRate: number;
  serviceChargeAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'esewa' | 'khalti';
  paidAmount: number;
  changeAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: BillItem[];
}

export interface BillItem {
  id: string;
  billId: string;
  menuItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface BillSettings {
  id: string;
  restaurantId: string;
  taxRate: number;
  serviceChargeRate: number;
  defaultDiscountType: 'percentage' | 'flat';
  maxDiscountPercentage: number;
  maxDiscountAmount: number;
  autoGenerateBill: boolean;
  printAfterPayment: boolean;
  whatsappAfterPayment: boolean;
}

export interface PaymentRequest {
  billId: string;
  paymentMethod: 'cash' | 'card' | 'esewa' | 'khalti';
  amount: number;
  notes?: string;
}

export interface SplitBillRequest {
  billId: string;
  splitCount: number;
  splitAmounts?: number[];
}

// Get all bills
export const getBills = async (params?: {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  // Use test endpoint for now
  const response = await api.get('/billing/test/bills', { params });
  return response.data;
};

// Get bill by ID
export const getBillById = async (billId: string) => {
  const response = await api.get(`/billing/bills/${billId}`);
  return response.data;
};

// Generate bill from order
export const generateBillFromOrder = async (orderId: string, billData?: {
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  notes?: string;
}) => {
  const response = await api.post(`/billing/bills/generate/${orderId}`, billData);
  return response.data;
};

// Create manual bill
export const createBill = async (billData: {
  customerName?: string;
  customerPhone?: string;
  tableId?: string;
  items: Array<{
    menuItemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  notes?: string;
}) => {
  const response = await api.post('/billing/bills', billData);
  return response.data;
};

// Update bill
export const updateBill = async (billId: string, billData: {
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  notes?: string;
}) => {
  const response = await api.put(`/billing/bills/${billId}`, billData);
  return response.data;
};

// Process payment
export const processPayment = async (paymentData: PaymentRequest) => {
  const response = await api.post(`/billing/bills/${paymentData.billId}/payment`, paymentData);
  return response.data;
};

// Split bill
export const splitBill = async (splitData: SplitBillRequest) => {
  const response = await api.post(`/billing/bills/${splitData.billId}/split`, splitData);
  return response.data;
};

// Print bill
export const printBill = async (billId: string) => {
  const response = await api.post(`/billing/bills/${billId}/print`);
  return response.data;
};

// Send bill via WhatsApp
export const sendBillWhatsApp = async (billId: string, phoneNumber: string) => {
  const response = await api.post(`/billing/bills/${billId}/whatsapp`, { phoneNumber });
  return response.data;
};

// Get bill settings
export const getBillSettings = async () => {
  // Use test endpoint for now
  const response = await api.get('/billing/test/settings');
  return response.data;
};

// Update bill settings
export const updateBillSettings = async (settings: Partial<BillSettings>) => {
  const response = await api.put('/billing/settings', settings);
  return response.data;
};

// Get payment summary
export const getPaymentSummary = async (params?: {
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}) => {
  // Use test endpoint for now
  const response = await api.get('/billing/test/payments/summary', { params });
  return response.data;
};

// Get daily sales report
export const getDailySalesReport = async (date?: string) => {
  const response = await api.get('/billing/reports/daily', { 
    params: { date: date || new Date().toISOString().split('T')[0] }
  });
  return response.data;
};