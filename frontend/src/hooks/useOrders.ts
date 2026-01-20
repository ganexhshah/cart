// Orders Hook

'use client';

import { useState, useEffect } from 'react';
import { orderApi, Order } from '@/lib/orders';

export function useOrders(params?: {
  restaurantId?: string;
  customerId?: string;
  status?: string;
  orderType?: string;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderApi.getAll(params);
        if (response.success) {
          setOrders(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [params?.restaurantId, params?.customerId, params?.status, params?.orderType]);

  const refetch = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getAll(params);
      if (response.success) {
        setOrders(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, error, refetch };
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderApi.getById(id);
        if (response.success) {
          setOrder(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const updateStatus = async (status: Order['status']) => {
    try {
      const response = await orderApi.updateStatus(id, status);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update order status');
    }
  };

  return { order, loading, error, updateStatus };
}
