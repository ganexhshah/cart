import { api } from './api';

export interface OverviewStats {
  total_revenue: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  total_orders: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  new_customers: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
  avg_order_value: {
    value: number;
    change: string;
    trend: 'up' | 'down';
  };
}

export interface RevenueTrend {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface TopProduct {
  name: string;
  revenue: number;
  orders: number;
  avg_price: number;
  growth: string;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
}

export interface CustomerInsights {
  lifetime_value: string;
  retention_rate: string;
  order_frequency: string;
}

export interface HourlyPattern {
  hour: string;
  orders: number;
}

export interface RestaurantPerformance {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  rating: string;
  growth: string;
}

export interface DashboardData {
  overview: OverviewStats | null;
  revenue: RevenueTrend[];
  products: TopProduct[];
  customerSegments: CustomerSegment[];
  customerInsights: CustomerInsights | null;
  hourlyPatterns: HourlyPattern[];
  restaurantPerformance: RestaurantPerformance[];
}

export type TimeFrame = '7days' | '30days' | '90days' | '1year';

export const analyticsApi = {
  // Get overview statistics
  async getOverviewStats(timeframe: TimeFrame = '30days') {
    return api.get<{ success: boolean; data: OverviewStats }>(`/analytics/overview?timeframe=${timeframe}`);
  },

  // Get revenue trends
  async getRevenueTrends(months: number = 6) {
    return api.get<{ success: boolean; data: RevenueTrend[] }>(`/analytics/revenue?months=${months}`);
  },

  // Get top performing products
  async getTopProducts(limit: number = 10, timeframe: TimeFrame = '30days') {
    return api.get<{ success: boolean; data: TopProduct[] }>(`/analytics/products?limit=${limit}&timeframe=${timeframe}`);
  },

  // Get customer segments
  async getCustomerSegments() {
    return api.get<{ success: boolean; data: CustomerSegment[] }>('/analytics/customers/segments');
  },

  // Get customer insights
  async getCustomerInsights() {
    return api.get<{ success: boolean; data: CustomerInsights }>('/analytics/customers/insights');
  },

  // Get hourly order patterns
  async getHourlyPatterns(date?: string) {
    const params = date ? `?date=${date}` : '';
    return api.get<{ success: boolean; data: HourlyPattern[] }>(`/analytics/hourly${params}`);
  },

  // Get restaurant performance comparison
  async getRestaurantPerformance(timeframe: TimeFrame = '30days') {
    return api.get<{ success: boolean; data: RestaurantPerformance[] }>(`/analytics/performance?timeframe=${timeframe}`);
  },

  // Get comprehensive dashboard data
  async getDashboardData(timeframe: TimeFrame = '30days') {
    return api.get<{ success: boolean; data: DashboardData }>(`/analytics/dashboard?timeframe=${timeframe}`);
  },

  // Export analytics report
  async exportReport(timeframe: TimeFrame = '30days', format: 'json' | 'csv' = 'json') {
    return api.get<any>(`/analytics/export?timeframe=${timeframe}&format=${format}`);
  }
};