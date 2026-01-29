import { api, ApiResponse } from './api';

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
  try {
    // Use authenticated endpoint
    const response = await api.get('/inventory/materials', { params }) as ApiResponse<RawMaterial[]>;
    return response;
  } catch (error) {
    console.error('Error fetching raw materials:', error);
    throw error;
  }
};

// Get raw material by ID
export const getRawMaterialById = async (materialId: string) => {
  const response = await api.get(`/inventory/materials/${materialId}`) as ApiResponse<RawMaterial>;
  return response;
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
  const response = await api.post('/inventory/materials', materialData) as ApiResponse<RawMaterial>;
  return response;
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
  const response = await api.put(`/inventory/materials/${materialId}`, materialData) as ApiResponse<RawMaterial>;
  return response;
};

// Delete raw material
export const deleteRawMaterial = async (materialId: string) => {
  const response = await api.delete(`/inventory/materials/${materialId}`) as ApiResponse<any>;
  return response;
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
  const response = await api.post('/inventory/transactions', transactionData) as ApiResponse<StockTransaction>;
  return response;
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
  try {
    // Use authenticated endpoint
    const response = await api.get('/inventory/transactions', { params }) as ApiResponse<StockTransaction[]>;
    return response;
  } catch (error) {
    console.error('Error fetching stock transactions:', error);
    throw error;
  }
};

// Get stock alerts
export const getStockAlerts = async (params?: {
  alertType?: 'low_stock' | 'out_of_stock' | 'expiry_warning';
  isResolved?: boolean;
  page?: number;
  limit?: number;
}) => {
  try {
    // Use authenticated endpoint
    const response = await api.get('/inventory/alerts', { params }) as ApiResponse<StockAlert[]>;
    return response;
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    throw error;
  }
};

// Resolve stock alert
export const resolveStockAlert = async (alertId: string) => {
  const response = await api.put(`/inventory/alerts/${alertId}/resolve`) as ApiResponse<StockAlert>;
  return response;
};

// Get usage tracking
export const getUsageTracking = async (params?: {
  materialId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/inventory/usage', { params }) as ApiResponse<UsageTracking[]>;
  return response;
};

// Record daily usage
export const recordDailyUsage = async (usageData: Array<{
  rawMaterialId: string;
  quantityUsed: number;
  notes?: string;
}>) => {
  const response = await api.post('/inventory/usage/daily', { usageData }) as ApiResponse<any>;
  return response;
};

// Get inventory summary
export const getInventorySummary = async () => {
  try {
    // Use authenticated endpoint
    const response = await api.get('/inventory/summary') as ApiResponse<any>;
    return response;
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    throw error;
  }
};

// Get low stock items
export const getLowStockItems = async () => {
  const response = await api.get('/inventory/low-stock') as ApiResponse<RawMaterial[]>;
  return response;
};

// Get inventory valuation
export const getInventoryValuation = async (params?: {
  category?: string;
  date?: string;
}) => {
  const response = await api.get('/inventory/valuation', { params }) as ApiResponse<any>;
  return response;
};

// Generate stock report
export const generateStockReport = async (params: {
  reportType: 'current_stock' | 'transactions' | 'usage' | 'valuation';
  startDate?: string;
  endDate?: string;
  materialId?: string;
  category?: string;
}) => {
  const response = await api.get('/inventory/reports', { params }) as ApiResponse<any>;
  return response;
};

// Update stock levels (bulk)
export const updateStockLevels = async (updates: Array<{
  materialId: string;
  minimumStock?: number;
  maximumStock?: number;
  reorderLevel?: number;
  costPerUnit?: number;
}>) => {
  const response = await api.put('/inventory/materials/bulk-update', { updates }) as ApiResponse<any>;
  return response;
};