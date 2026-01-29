"use client";

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  order_type: string;
}

interface OrderAnalyticsChartProps {
  orders: Order[];
  type: 'revenue-trend' | 'status-distribution' | 'hourly-orders' | 'order-types';
}

export function OrderAnalyticsChart({ orders, type }: OrderAnalyticsChartProps) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  const prepareRevenueTrendData = () => {
    // Group orders by date for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const revenueByDate = last7Days.map(date => {
      const dayOrders = orders.filter(order => 
        order.created_at && order.created_at.startsWith(date) && 
        ['completed', 'served'].includes(order.status)
      );
      return dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    });

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Revenue (₹)',
          data: revenueByDate,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const prepareStatusDistributionData = () => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      pending: '#f59e0b',
      confirmed: '#06b6d4',
      preparing: '#f97316',
      ready: '#8b5cf6',
      served: '#6366f1',
      completed: '#10b981',
      cancelled: '#ef4444',
    };

    return {
      labels: Object.keys(statusCounts).map(status => status.charAt(0).toUpperCase() + status.slice(1)),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: Object.keys(statusCounts).map(status => colors[status as keyof typeof colors] || '#6b7280'),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  };

  const prepareHourlyOrdersData = () => {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = orders.filter(order => {
        const orderHour = new Date(order.created_at).getHours();
        return orderHour === hour;
      });
      return hourOrders.length;
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: 'Orders',
          data: hourlyData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareOrderTypesData = () => {
    const typeCounts = orders.reduce((acc, order) => {
      acc[order.order_type] = (acc[order.order_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return {
      labels: Object.keys(typeCounts).map(type => type.charAt(0).toUpperCase() + type.slice(1)),
      datasets: [
        {
          data: Object.values(typeCounts),
          backgroundColor: colors.slice(0, Object.keys(typeCounts).length),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  };

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No orders to display</p>
      </div>
    );
  }

  switch (type) {
    case 'revenue-trend':
      return <Line data={prepareRevenueTrendData()} options={chartOptions} />;
    case 'status-distribution':
      return <Doughnut data={prepareStatusDistributionData()} options={doughnutOptions} />;
    case 'hourly-orders':
      return <Bar data={prepareHourlyOrdersData()} options={chartOptions} />;
    case 'order-types':
      return <Doughnut data={prepareOrderTypesData()} options={doughnutOptions} />;
    default:
      return <div>Invalid chart type</div>;
  }
}