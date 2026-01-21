import { api } from './api';

export interface RawMaterial {
  id: string;
  restaurantId: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  costPerUnit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  restaurantId: string;
  rawMaterialId: string;
  transactionType: 'in' | 'out';
  quantity: number;
  unitCost?: number;
  totalCost: number;
  stockBefore: number;
  stockAfter: number;
  referenceType?: 'purchase' | 'usage' | 'adjustment' | 'waste';
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  materialName?: string;
  createdByName?: string;
}

export interface StockAlert {
  id: string;
  restaurantId: string;
  rawMaterialId: string;
  alertType: 'low_stock' | 'out_of_stock' | 'expiry_warning';
  message: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  materialName?: string;
  currentStock?: number;
  minimumStock?: number;
}

export interface UsageTracking {
  id: string;
  restaurantId: string;
  rawMaterialId: string;
  trackingDate: string;
  quantityUsed: number;
  costPerUnit: number;
  totalCost: number;
  materialName?: string;
}

// Get all raw materials
export const getRawMaterials = async (params?: {
  category?: string;
  isActive?: boolean;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/inventory/materials', { params });
  return response.data;
};

// Get raw material by ID
export const getRawMaterialById = async (materialId: string) => {
  const response = await api.get(`/inventory/materials/${materialId}`);
  return response.data;
};

// Create raw material
export const createRawMaterial = async (materialData: {
  name: string;
  category: string;
  unit: string;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  costPerUnit: number;
  initialStock?: number;
}) => {
  const response = await api.post('/inventory/materials', materialData);
  return response.data;
};

// Update raw material
export const updateRawMaterial = async (materialId: string, materialData: {
  name?: string;
  category?: string;
  unit?: string;
  minimumStock?: number;
  maximumStock?: number;
  reorderLevel?: number;
  costPerUnit?: number;
  isActive?: boolean;
}) => {
  const response = await api.put(`/inventory/materials/${materialId}`, materialData);
  return response.data;
};

// Delete raw material
export const deleteRawMaterial = async (materialId: string) => {
  const response = await api.delete(`/inventory/materials/${materialId}`);
  return response.data;
};

// Record stock transaction
export const recordStockTransaction = async (transactionData: {
  rawMaterialId: string;
  transactionType: 'in' | 'out';
  quantity: number;
  unitCost?: number;
  referenceType?: 'purchase' | 'usage' | 'adjustment' | 'waste';
  referenceId?: string;
  notes?: string;
}) => {
  const response = await api.post('/inventory/transactions', transactionData);
  return response.data;
};

// Get stock transactions
export const getStockTransactions = async (params?: {
  materialId?: string;
  transactionType?: 'in' | 'out';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/inventory/transactions', { params });
  return response.data;
};

// Get stock alerts
export const getStockAlerts = async (params?: {
  alertType?: 'low_stock' | 'out_of_stock' | 'expiry_warning';
  isResolved?: boolean;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/inventory/alerts', { params });
  return response.data;
};

// Resolve stock alert
export const resolveStockAlert = async (alertId: string) => {
  const response = await api.put(`/inventory/alerts/${alertId}/resolve`);
  return response.data;
};

// Get usage tracking
export const getUsageTracking = async (params?: {
  materialId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/inventory/usage', { params });
  return response.data;
};

// Record daily usage
export const recordDailyUsage = async (usageData: Array<{
  rawMaterialId: string;
  quantityUsed: number;
  notes?: string;
}>) => {
  const response = await api.post('/inventory/usage/daily', { usageData });
  return response.data;
};

// Get inventory summary
export const getInventorySummary = async () => {
  const response = await api.get('/inventory/summary');
  return response.data;
};

// Get low stock items
export const getLowStockItems = async () => {
  const response = await api.get('/inventory/low-stock');
  return response.data;
};

// Get inventory valuation
export const getInventoryValuation = async (params?: {
  category?: string;
  date?: string;
}) => {
  const response = await api.get('/inventory/valuation', { params });
  return response.data;
};

// Generate stock report
export const generateStockReport = async (params: {
  reportType: 'current_stock' | 'transactions' | 'usage' | 'valuation';
  startDate?: string;
  endDate?: string;
  materialId?: string;
  category?: string;
}) => {
  const response = await api.get('/inventory/reports', { params });
  return response.data;
};

// Update stock levels (bulk)
export const updateStockLevels = async (updates: Array<{
  materialId: string;
  minimumStock?: number;
  maximumStock?: number;
  reorderLevel?: number;
  costPerUnit?: number;
}>) => {
  const response = await api.put('/inventory/materials/bulk-update', { updates });
  return response.data;
};