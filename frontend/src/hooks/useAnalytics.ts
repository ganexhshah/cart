import { useState, useEffect } from 'react';
import { 
  analyticsApi, 
  OverviewStats, 
  RevenueTrend, 
  TopProduct, 
  CustomerSegment, 
  CustomerInsights, 
  HourlyPattern, 
  RestaurantPerformance, 
  DashboardData,
  TimeFrame 
} from '@/lib/analytics';

export function useOverviewStats(timeframe: TimeFrame = '30days') {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getOverviewStats(timeframe);
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Failed to fetch overview statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

export function useRevenueTrends(months: number = 6) {
  const [trends, setTrends] = useState<RevenueTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getRevenueTrends(months);
      
      if (response.success) {
        setTrends(response.data);
      } else {
        setError('Failed to fetch revenue trends');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
  }, [months]);

  return {
    trends,
    loading,
    error,
    refetch: fetchTrends
  };
}

export function useTopProducts(limit: number = 10, timeframe: TimeFrame = '30days') {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getTopProducts(limit, timeframe);
      
      if (response.success) {
        setProducts(response.data);
      } else {
        setError('Failed to fetch top products');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [limit, timeframe]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
}

export function useCustomerSegments() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getCustomerSegments();
      
      if (response.success) {
        setSegments(response.data);
      } else {
        setError('Failed to fetch customer segments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  return {
    segments,
    loading,
    error,
    refetch: fetchSegments
  };
}

export function useCustomerInsights() {
  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getCustomerInsights();
      
      if (response.success) {
        setInsights(response.data);
      } else {
        setError('Failed to fetch customer insights');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights
  };
}

export function useHourlyPatterns(date?: string) {
  const [patterns, setPatterns] = useState<HourlyPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getHourlyPatterns(date);
      
      if (response.success) {
        setPatterns(response.data);
      } else {
        setError('Failed to fetch hourly patterns');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, [date]);

  return {
    patterns,
    loading,
    error,
    refetch: fetchPatterns
  };
}

export function useRestaurantPerformance(timeframe: TimeFrame = '30days') {
  const [performance, setPerformance] = useState<RestaurantPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getRestaurantPerformance(timeframe);
      
      if (response.success) {
        setPerformance(response.data);
      } else {
        setError('Failed to fetch restaurant performance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [timeframe]);

  return {
    performance,
    loading,
    error,
    refetch: fetchPerformance
  };
}

export function useDashboardData(timeframe: TimeFrame = '30days') {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await analyticsApi.getDashboardData(timeframe);
      
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const exportReport = async (format: 'json' | 'csv' = 'json') => {
    try {
      const response = await analyticsApi.exportReport(timeframe, format);
      
      // Create download link
      const blob = new Blob([JSON.stringify(response, null, 2)], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${timeframe}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    exportReport
  };
}