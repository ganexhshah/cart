import { useState, useEffect } from 'react';
import * as purchasesApi from '@/lib/purchases';

export const useSuppliers = (params?: {
  businessType?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await purchasesApi.getSuppliers(params);
      if (response.success) {
        setSuppliers(response.data);
      } else {
        setError(response.message || 'Failed to fetch suppliers');
      }
    } catch (err) {
      setError('Failed to fetch suppliers');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [JSON.stringify(params)]);

  const createSupplier = async (supplierData: any) => {
    try {
      const response = await purchasesApi.createSupplier(supplierData);
      if (response.success) {
        await fetchSuppliers(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create supplier');
      }
    } catch (err) {
      console.error('Error creating supplier:', err);
      throw err;
    }
  };

  const updateSupplier = async (supplierId: string, supplierData: any) => {
    try {
      const response = await purchasesApi.updateSupplier(supplierId, supplierData);
      if (response.success) {
        await fetchSuppliers(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update supplier');
      }
    } catch (err) {
      console.error('Error updating supplier:', err);
      throw err;
    }
  };

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,
    createSupplier,
    updateSupplier
  };
};

export const usePurchaseOrders = (params?: {
  supplierId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await purchasesApi.getPurchaseOrders(params);
      if (response.success) {
        setOrders(response.data);
      } else {
        setError(response.message || 'Failed to fetch purchase orders');
      }
    } catch (err) {
      setError('Failed to fetch purchase orders');
      console.error('Error fetching purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [JSON.stringify(params)]);

  const createOrder = async (orderData: any) => {
    try {
      const response = await purchasesApi.createPurchaseOrder(orderData);
      if (response.success) {
        await fetchOrders(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create purchase order');
      }
    } catch (err) {
      console.error('Error creating purchase order:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await purchasesApi.updatePurchaseOrderStatus(orderId, status);
      if (response.success) {
        await fetchOrders(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  const receiveItems = async (orderId: string, receivedItems: any[]) => {
    try {
      const response = await purchasesApi.receivePurchaseOrderItems(orderId, receivedItems);
      if (response.success) {
        await fetchOrders(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to receive items');
      }
    } catch (err) {
      console.error('Error receiving items:', err);
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrderStatus,
    receiveItems
  };
};

export const usePurchaseHistory = (params?: {
  supplierId?: string;
  materialId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await purchasesApi.getPurchaseHistory(params);
      if (response.success) {
        setHistory(response.data);
      } else {
        setError(response.message || 'Failed to fetch purchase history');
      }
    } catch (err) {
      setError('Failed to fetch purchase history');
      console.error('Error fetching purchase history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [JSON.stringify(params)]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory
  };
};

export const useCostTracking = (params?: {
  materialId?: string;
  days?: number;
}) => {
  const [costData, setCostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCostData = async () => {
    try {
      setLoading(true);
      const response = await purchasesApi.getCostTracking(params);
      if (response.success) {
        setCostData(response.data);
      } else {
        setError(response.message || 'Failed to fetch cost tracking data');
      }
    } catch (err) {
      setError('Failed to fetch cost tracking data');
      console.error('Error fetching cost tracking data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData();
  }, [JSON.stringify(params)]);

  const updateCostTracking = async (date?: string) => {
    try {
      const response = await purchasesApi.updateCostTracking(date);
      if (response.success) {
        await fetchCostData(); // Refresh the data
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update cost tracking');
      }
    } catch (err) {
      console.error('Error updating cost tracking:', err);
      throw err;
    }
  };

  return {
    costData,
    loading,
    error,
    refetch: fetchCostData,
    updateCostTracking
  };
};