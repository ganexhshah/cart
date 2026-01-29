"use client";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RestaurantPerformanceChartProps {
  restaurants: any[];
  orders: any[];
}

export function RestaurantPerformanceChart({ restaurants, orders }: RestaurantPerformanceChartProps) {
  const prepareRestaurantPerformanceData = () => {
    const restaurantOrders = restaurants.map(restaurant => {
      const restaurantOrderCount = orders.filter(order => order.restaurant_id === restaurant.id).length;
      const restaurantRevenue = orders
        .filter(order => order.restaurant_id === restaurant.id)
        .reduce((sum, order) => sum + (order.total || 0), 0);
      
      return {
        name: restaurant.name,
        orders: restaurantOrderCount,
        revenue: restaurantRevenue,
      };
    });

    return {
      labels: restaurantOrders.map(r => r.name),
      datasets: [
        {
          label: 'Orders',
          data: restaurantOrders.map(r => r.orders),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  };

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

  if (restaurants.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No restaurants to display</p>
      </div>
    );
  }

  return <Bar data={prepareRestaurantPerformanceData()} options={chartOptions} />;
}