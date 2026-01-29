"use client";

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OrderStatusChartProps {
  orders: any[];
}

export function OrderStatusChart({ orders }: OrderStatusChartProps) {
  const prepareOrderStatusChartData = () => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#f97316',
      ready: '#8b5cf6',
      served: '#10b981',
      completed: '#059669',
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No orders to display</p>
      </div>
    );
  }

  return <Doughnut data={prepareOrderStatusChartData()} options={doughnutOptions} />;
}