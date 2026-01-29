import { useState, useCallback } from 'react';
import { tableApi, RestaurantTable } from '@/lib/tables';
import { orderApi } from '@/lib/orders';
import { posApi } from '@/lib/pos';

export const useFloorManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTables = useCallback(async (filters?: {
    search?: string;
    status?: string;
    restaurantId?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await tableApi.getTables(filters);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to load tables');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tables');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTableOrders = useCallback(async (tableId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await orderApi.getTableOrders(tableId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to load table orders');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load table orders');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTableStatus = useCallback(async (tableId: string, status: RestaurantTable['status']) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await tableApi.updateTableStatus(tableId, status);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to update table status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update table status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await orderApi.updateOrderStatus(orderId, status);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await posApi.createOrder(orderData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMenuItems = useCallback(async (restaurantId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await orderApi.getMenuItems(restaurantId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to load menu items');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load menu items');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    loadTables,
    loadTableOrders,
    updateTableStatus,
    updateOrderStatus,
    createOrder,
    loadMenuItems,
  };
};