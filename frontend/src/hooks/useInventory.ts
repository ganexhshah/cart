import { useState, useEffect } from 'react';
import * as inventoryApi from '@/lib/inventory';

export const useRawMaterials = (params?: {
  category?: string;
  isActive?: boolean;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getRawMaterials(params);
      if (response.success) {
        setMaterials(response.data);
      } else {
        setError(response.message || 'Failed to fetch materials');
      }
    } catch (err) {
      setError('Failed to fetch materials');
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [JSON.stringify(params)]);

  const createMaterial = async (materialData: any) => {
    try {
      const response = await inventoryApi.createRawMaterial(materialData);
      if (response.success) {
        await fetchMaterials(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create material');
      }
    } catch (err) {
      console.error('Error creating material:', err);
      throw err;
    }
  };

  const updateMaterial = async (materialId: string, materialData: any) => {
    try {
      const response = await inventoryApi.updateRawMaterial(materialId, materialData);
      if (response.success) {
        await fetchMaterials(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update material');
      }
    } catch (err) {
      console.error('Error updating material:', err);
      throw err;
    }
  };

  const deleteMaterial = async (materialId: string) => {
    try {
      const response = await inventoryApi.deleteRawMaterial(materialId);
      if (response.success) {
        await fetchMaterials(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete material');
      }
    } catch (err) {
      console.error('Error deleting material:', err);
      throw err;
    }
  };

  return {
    materials,
    loading,
    error,
    refetch: fetchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial
  };
};

export const useStockTransactions = (params?: {
  materialId?: string;
  transactionType?: 'in' | 'out';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getStockTransactions(params);
      if (response.success) {
        setTransactions(response.data);
      } else {
        setError(response.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [JSON.stringify(params)]);

  const recordTransaction = async (transactionData: any) => {
    try {
      const response = await inventoryApi.recordStockTransaction(transactionData);
      if (response.success) {
        await fetchTransactions(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to record transaction');
      }
    } catch (err) {
      console.error('Error recording transaction:', err);
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    recordTransaction
  };
};

export const useStockAlerts = (params?: {
  alertType?: 'low_stock' | 'out_of_stock' | 'expiry_warning';
  isResolved?: boolean;
  page?: number;
  limit?: number;
}) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getStockAlerts(params);
      if (response.success) {
        setAlerts(response.data);
      } else {
        setError(response.message || 'Failed to fetch alerts');
      }
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [JSON.stringify(params)]);

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await inventoryApi.resolveStockAlert(alertId);
      if (response.success) {
        await fetchAlerts(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to resolve alert');
      }
    } catch (err) {
      console.error('Error resolving alert:', err);
      throw err;
    }
  };

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
    resolveAlert
  };
};

export const useInventorySummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getInventorySummary();
      if (response.success) {
        setSummary(response.data);
      } else {
        setError(response.message || 'Failed to fetch summary');
      }
    } catch (err) {
      setError('Failed to fetch summary');
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary
  };
};

export const useUsageTracking = (params?: {
  materialId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.getUsageTracking(params);
      if (response.success) {
        setUsage(response.data);
      } else {
        setError(response.message || 'Failed to fetch usage data');
      }
    } catch (err) {
      setError('Failed to fetch usage data');
      console.error('Error fetching usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [JSON.stringify(params)]);

  const recordDailyUsage = async (usageData: any[]) => {
    try {
      const response = await inventoryApi.recordDailyUsage(usageData);
      if (response.success) {
        await fetchUsage(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to record usage');
      }
    } catch (err) {
      console.error('Error recording usage:', err);
      throw err;
    }
  };

  return {
    usage,
    loading,
    error,
    refetch: fetchUsage,
    recordDailyUsage
  };
};