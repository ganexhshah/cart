import { api } from './api';

export interface Supplier {
  id: string;
  restaurantId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  businessType: 'wholesaler' | 'distributor' | 'farmer' | 'manufacturer';
  taxNumber?: string;
  paymentTerms: 'cash' | 'credit_15' | 'credit_30' | 'credit_60';
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalOrders?: number;
  avgOrderValue?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  restaurantId: string;
  supplierId: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial_received' | 'received' | 'cancelled';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  termsConditions?: string;
  createdBy: string;
  approvedBy?: string;
  receivedBy?: string;
  approvedAt?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
  supplierName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  itemCount?: number;
  createdByName?: string;
  approvedByName?: string;
  receivedByName?: string;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  rawMaterialId?: string;
  itemName: string;
  unit: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  totalPrice: number;
  qualityStatus?: 'pending' | 'approved' | 'rejected';
  qualityNotes?: string;
  createdAt: string;
  materialName?: string;
}

export interface PurchaseHistory {
  id: string;
  poNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  supplierName: string;
  itemName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  totalPrice: number;
  materialName?: string;
  unit?: string;
}

export interface CostTracking {
  id: string;
  restaurantId: string;
  rawMaterialId: string;
  trackingDate: string;
  averageCost: number;
  lastPurchaseCost: number;
  materialName?: string;
  unit?: string;
}

// Get all suppliers
export const getSuppliers = async (params?: {
  businessType?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/purchases/suppliers', { params });
  return response.data;
};

// Create supplier
export const createSupplier = async (supplierData: {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  businessType: 'wholesaler' | 'distributor' | 'farmer' | 'manufacturer';
  taxNumber?: string;
  paymentTerms: 'cash' | 'credit_15' | 'credit_30' | 'credit_60';
}) => {
  const response = await api.post('/purchases/suppliers', supplierData);
  return response.data;
};

// Update supplier
export const updateSupplier = async (supplierId: string, supplierData: {
  name?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  businessType?: 'wholesaler' | 'distributor' | 'farmer' | 'manufacturer';
  taxNumber?: string;
  paymentTerms?: 'cash' | 'credit_15' | 'credit_30' | 'credit_60';
  isActive?: boolean;
  rating?: number;
}) => {
  const response = await api.put(`/purchases/suppliers/${supplierId}`, supplierData);
  return response.data;
};

// Get all purchase orders
export const getPurchaseOrders = async (params?: {
  supplierId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/purchases/orders', { params });
  return response.data;
};

// Get purchase order by ID
export const getPurchaseOrderById = async (poId: string) => {
  const response = await api.get(`/purchases/orders/${poId}`);
  return response.data;
};

// Create purchase order
export const createPurchaseOrder = async (orderData: {
  supplierId: string;
  expectedDeliveryDate: string;
  items: Array<{
    rawMaterialId?: string;
    itemName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
  termsConditions?: string;
}) => {
  const response = await api.post('/purchases/orders', orderData);
  return response.data;
};

// Update purchase order status
export const updatePurchaseOrderStatus = async (poId: string, status: string) => {
  const response = await api.put(`/purchases/orders/${poId}/status`, { status });
  return response.data;
};

// Receive purchase order items
export const receivePurchaseOrderItems = async (poId: string, receivedItems: Array<{
  id: string;
  quantityReceived: number;
  qualityStatus: 'approved' | 'rejected';
  qualityNotes?: string;
}>) => {
  const response = await api.post(`/purchases/orders/${poId}/receive`, { receivedItems });
  return response.data;
};

// Get purchase history
export const getPurchaseHistory = async (params?: {
  supplierId?: string;
  materialId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/purchases/history', { params });
  return response.data;
};

// Get cost tracking
export const getCostTracking = async (params?: {
  materialId?: string;
  days?: number;
}) => {
  const response = await api.get('/purchases/cost-tracking', { params });
  return response.data;
};

// Update cost tracking
export const updateCostTracking = async (date?: string) => {
  const response = await api.post('/purchases/cost-tracking/update', { date });
  return response.data;
};