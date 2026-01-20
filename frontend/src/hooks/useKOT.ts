// KOT Hook

'use client';

import { useState, useEffect } from 'react';
import { kotApi, KOTOrder, KOTStats, KOTItem } from '@/lib/kot';

export function useKOT(params?: {
  restaurantId?: string;
  status?: string;
  priority?: string;
  tableId?: string;
}) {
  const [kots, setKOTs] = useState<KOTOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKOTs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await kotApi.getAll(params);
      if (response.success) {
        setKOTs(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KOTs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.restaurantId) {
      fetchKOTs();
    }
  }, [params?.restaurantId, params?.status, params?.priority, params?.tableId]);

  const refetch = () => fetchKOTs();

  return { kots, loading, error, refetch };
}

export function useKOTStats(restaurantId?: string, dateRange?: string) {
  const [stats, setStats] = useState<KOTStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await kotApi.getStats(restaurantId, dateRange);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KOT stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchStats();
    }
  }, [restaurantId, dateRange]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useKOTItems(restaurantId?: string) {
  const [items, setItems] = useState<KOTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        const response = await kotApi.getItems(restaurantId);
        if (response.success) {
          setItems(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch KOT items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [restaurantId]);

  return { items, loading, error };
}

export function useKOTOrder(id: string, restaurantId?: string) {
  const [kot, setKOT] = useState<KOTOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKOT = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await kotApi.getById(id, restaurantId);
        if (response.success) {
          setKOT(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch KOT');
      } finally {
        setLoading(false);
      }
    };

    fetchKOT();
  }, [id, restaurantId]);

  return { kot, loading, error };
}