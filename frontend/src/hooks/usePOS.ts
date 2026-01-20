// POS Hook

'use client';

import { useState, useEffect } from 'react';
import { posApi, POSTerminal, POSTransaction, POSStats, POSPaymentMethod, POSDiscount } from '@/lib/pos';

export function usePOS(params?: {
  restaurantId?: string;
  sessionId?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: string;
}) {
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await posApi.getTransactions(params);
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.restaurantId) {
      fetchTransactions();
    }
  }, [params?.restaurantId, params?.sessionId, params?.dateFrom, params?.dateTo, params?.paymentMethod]);

  const refetch = () => fetchTransactions();

  return { transactions, loading, error, refetch };
}

export function usePOSTerminals(restaurantId?: string) {
  const [terminals, setTerminals] = useState<POSTerminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTerminals = async () => {
    try {
      setLoading(true);
      const response = await posApi.getTerminals(restaurantId);
      if (response.success) {
        setTerminals(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch POS terminals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchTerminals();
    }
  }, [restaurantId]);

  return { terminals, loading, error, refetch: fetchTerminals };
}

export function usePOSTransactions(params?: {
  restaurantId?: string;
  sessionId?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: string;
}) {
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await posApi.getTransactions(params);
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [params?.restaurantId, params?.sessionId, params?.dateFrom, params?.dateTo, params?.paymentMethod]);

  return { transactions, loading, error, refetch: fetchTransactions };
}

export function usePOSStats(restaurantId?: string, dateRange?: string) {
  const [stats, setStats] = useState<POSStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await posApi.getStats(restaurantId, dateRange);
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch POS stats');
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

export function usePOSPaymentMethods(restaurantId?: string) {
  const [paymentMethods, setPaymentMethods] = useState<POSPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        const response = await posApi.getPaymentMethods(restaurantId);
        if (response.success) {
          setPaymentMethods(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payment methods');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [restaurantId]);

  return { paymentMethods, loading, error };
}

export function usePOSDiscounts(restaurantId?: string) {
  const [discounts, setDiscounts] = useState<POSDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscounts = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        const response = await posApi.getDiscounts(restaurantId);
        if (response.success) {
          setDiscounts(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch discounts');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, [restaurantId]);

  return { discounts, loading, error };
}